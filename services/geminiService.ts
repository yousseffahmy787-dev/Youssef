
import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  // استخدام التعيين المباشر من process.env الذي يوفره Vite
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export async function parseOrderText(text: string) {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: `Parse the following Arabic/Egyptian customer order text into structured JSON data. Text: "${text}"` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            customerName: { type: Type.STRING },
            customerPhone: { type: Type.STRING },
            city: { type: Type.STRING },
            address: { type: Type.STRING },
            orderDetails: { type: Type.STRING }
          }
        },
        systemInstruction: "You are an expert Arabic data extractor. Extract customer name, phone, city, address, and order details from messy text."
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Parsing Error:", error);
    return null;
  }
}