import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

export async function parseOrderText(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Parse the following Arabic/Egyptian customer order text into structured JSON data.
              Text: "${text}"`
            }
          ]
        }
      ],
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
        systemInstruction:
          "You are an expert Arabic data extractor. Extract customer name, phone, city, address, and order details from messy text. Normalize city names to standard Egyptian governorates if possible."
      }
    });

    return JSON.parse(response.response.text());
  } catch (error) {
    console.error("AI Parsing Error:", error);
    return null;
  }
}
