
export const CITIES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الدقهلية', 
  'البحيرة', 'الشرقية', 'المنوفية', 'الغربية', 'كفر الشيخ', 
  'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم', 
  'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 
  'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح', 
  'شمال سيناء', 'جنوب سيناء'
];

export const LEAD_CLASSIFICATIONS: Record<string, { label: string, color: string, iconBg: string }> = {
  'interested': { label: 'مهتم', color: 'bg-blue-100 text-blue-700', iconBg: 'bg-blue-500' },
  'thinking': { label: 'بيفكر', color: 'bg-amber-100 text-amber-700', iconBg: 'bg-amber-500' },
  'not_responding': { label: 'لا يرد', color: 'bg-slate-100 text-slate-700', iconBg: 'bg-slate-400' },
  'cancelled': { label: 'ملغي', color: 'bg-red-100 text-red-700', iconBg: 'bg-red-500' },
  'converted': { label: 'تم التحويل', color: 'bg-emerald-100 text-emerald-700', iconBg: 'bg-emerald-500' }
};

export const PAYMENT_METHODS = {
  VODAFONE_CASH: 'فودافون كاش',
  INSTAPAY: 'إنستا باي',
  CASH: 'كاش (عند الاستلام)',
  BANK_TRANSFER: 'تحويل بنكي'
};

export const WALLET_NUMBERS: Record<string, string[]> = {
  [PAYMENT_METHODS.VODAFONE_CASH]: ['01012345678', '01087654321'],
  [PAYMENT_METHODS.INSTAPAY]: ['mfpharma@instapay'],
  [PAYMENT_METHODS.BANK_TRANSFER]: ['QNB - 1234567890'],
  [PAYMENT_METHODS.CASH]: []
};

export const SHIPPING_STATUSES: Record<string, { label: string, color: string }> = {
  'pending': { label: 'قيد الانتظار', color: 'bg-amber-100 text-amber-700' },
  'processing': { label: 'جاري التجهيز', color: 'bg-blue-100 text-blue-700' },
  'shipped': { label: 'تم الشحن', color: 'bg-indigo-100 text-indigo-700' },
  'delivered': { label: 'تم التسليم', color: 'bg-emerald-100 text-emerald-700' },
  'returned': { label: 'مرتجع', color: 'bg-rose-100 text-rose-700' }
};

export const SHIPPING_COMPANIES = ['NONE', 'JT', 'POSTA'];

export const BASE_WEIGHT = 1;

export const getCityZone = (city: string) => {
  const c = city.trim();
  if (['القاهرة', 'الجيزة', 'القليوبية'].includes(c)) return { price: 40, extraKg: 5 };
  if (['الإسكندرية', 'البحيرة', 'الشرقية', 'المنوفية', 'الغربية', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الدقهلية'].includes(c)) return { price: 50, extraKg: 7 };
  if (['الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج'].includes(c)) return { price: 65, extraKg: 10 };
  if (['قنا', 'الأقصر', 'أسوان'].includes(c)) return { price: 80, extraKg: 12 };
  return { price: 100, extraKg: 15 }; // المناطق البعيدة
};
