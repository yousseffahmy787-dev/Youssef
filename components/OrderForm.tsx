
import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { saveOrder } from '../utils/storage';
import { PAYMENT_METHODS, WALLET_NUMBERS, CITIES } from '../constants';
import { parseOrderText } from '../services/geminiService';
// Added CheckCircle2 to imports
import { Sparkles, User, DollarSign, Truck, ClipboardList, Info, Wallet, CreditCard, CheckCircle2 } from 'lucide-react';

interface OrderFormProps {
  salesUsername: string;
  onComplete: () => void;
  initialData?: Order;
  preFilledData?: Partial<Order>;
}

const OrderForm: React.FC<OrderFormProps> = ({ salesUsername, onComplete, initialData, preFilledData }) => {
  const [formData, setFormData] = useState<Partial<Order>>(() => {
    if (initialData) return initialData;
    
    return {
      customerName: preFilledData?.customerName || '',
      customerPhone: preFilledData?.customerPhone || '',
      whatsappPhone: '',
      city: preFilledData?.city || '',
      address: '',
      orderDetails: preFilledData?.orderDetails || '',
      totalAmount: 0,
      paid: 0,
      remaining: 0,
      paymentMethod: PAYMENT_METHODS.VODAFONE_CASH,
      walletNumber: WALLET_NUMBERS[PAYMENT_METHODS.VODAFONE_CASH][0],
      salesUsername: preFilledData?.salesUsername || salesUsername,
      createdAt: new Date().toISOString(),
      weight: 1,
      shippingStatus: 'pending',
      shippingFee: 0,
      shippingProfit: 20,
      shippingCompany: 'NONE',
    };
  });

  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const productRemaining = (formData.totalAmount || 0) - (formData.paid || 0);
    setFormData(prev => ({ ...prev, remaining: productRemaining }));
  }, [formData.totalAmount, formData.paid]);

  const handlePaymentMethodChange = (method: string) => {
    const numbers = WALLET_NUMBERS[method] || [];
    setFormData(prev => ({ 
      ...prev, 
      paymentMethod: method, 
      walletNumber: numbers.length > 0 ? numbers[0] : '' 
    }));
  };

  const handleAiSmartFill = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    const parsed = await parseOrderText(aiInput);
    if (parsed) setFormData(prev => ({ ...prev, ...parsed }));
    setIsAiLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const order: Order = {
      ...formData as Order,
      id: initialData?.id || `ORD-${Date.now().toString(36).toUpperCase()}`,
      status: initialData?.status || 'pending',
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };
    saveOrder(order);
    onComplete();
  };

  const availableWalletNumbers = WALLET_NUMBERS[formData.paymentMethod || ''] || [];

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-700 pb-20 text-right" dir="rtl">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-emerald-950">
            {initialData ? 'تعديل بيانات الطلب' : preFilledData ? 'تحويل المتابعة إلى أوردر' : 'تسجيل أوردر جديد'}
          </h2>
          <p className="text-slate-500 font-bold mt-2 font-tajawal">بوابة المبيعات - شركة MF Pharma</p>
        </div>
        <div className="p-4 bg-emerald-100 rounded-3xl"><Truck size={32} className="text-emerald-700" /></div>
      </header>

      <div className="bg-emerald-950 p-8 rounded-[3rem] shadow-2xl relative">
        <h3 className="text-white font-black flex items-center gap-2 mb-4"><Sparkles className="text-emerald-400" /> استخراج ذكي (AI)</h3>
        <textarea
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          placeholder="ألصق بيانات العميل (الاسم، العنوان، التليفون) هنا للاستخراج التلقائي..."
          className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-right"
        />
        <div className="flex justify-between items-center mt-4">
          <button type="button" onClick={handleAiSmartFill} disabled={isAiLoading} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black transition-all">
            {isAiLoading ? 'جاري التحليل...' : 'تحليل النص وتعبئة الحقول'}
          </button>
          {preFilledData && (
             <span className="text-emerald-400 text-xs font-bold bg-emerald-900/50 px-4 py-2 rounded-full border border-emerald-800">
               تم استيراد البيانات من سجل المتابعات
             </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="flex items-center gap-2 font-black mb-6 text-emerald-900"><User size={20} /> بيانات العميل</h3>
            <div className="space-y-4">
              <input placeholder="الاسم بالكامل" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-right" required />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="رقم الموبايل" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-left" required />
                <input placeholder="رقم الواتساب" value={formData.whatsappPhone} onChange={e => setFormData({...formData, whatsappPhone: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-left" />
              </div>
              <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-right" required>
                <option value="">اختر المحافظة</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea placeholder="العنوان بالتفصيل" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full h-24 bg-slate-50 rounded-2xl p-4 font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all resize-none text-right" required />
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="flex items-center gap-2 font-black mb-6 text-emerald-900"><ClipboardList size={20} /> محتويات الطلب</h3>
            <textarea placeholder="اكتب المنتجات المطلوبة هنا..." value={formData.orderDetails} onChange={e => setFormData({...formData, orderDetails: e.target.value})} className="w-full h-32 bg-emerald-50/30 rounded-2xl p-4 font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all resize-none text-right" required />
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="flex items-center gap-2 font-black mb-6 text-emerald-900"><Wallet size={20} /> تفاصيل الدفع (العربون)</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 mb-2 block mr-2 uppercase">طريقة الدفع</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(PAYMENT_METHODS).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => handlePaymentMethodChange(method)}
                      className={`py-3 px-4 rounded-xl text-xs font-black transition-all border-2 ${formData.paymentMethod === method ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {formData.paymentMethod !== PAYMENT_METHODS.CASH && (
                <div>
                  <label className="text-[10px] font-black text-slate-400 mb-2 block mr-2 uppercase">رقم المحفظة التي تم التحويل عليها</label>
                  <select 
                    value={formData.walletNumber} 
                    onChange={e => setFormData({...formData, walletNumber: e.target.value})}
                    className="w-full bg-slate-50 rounded-2xl p-4 font-black text-emerald-900 outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-right"
                  >
                    {availableWalletNumbers.map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                    {availableWalletNumbers.length === 0 && <option value="">لا يوجد رقم متاح</option>}
                  </select>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="flex items-center gap-2 font-black mb-6 text-emerald-900"><DollarSign size={20} /> الحساب المالي</h3>
            <div className="space-y-6 text-right">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">سعر المنتجات</label>
                  <div className="relative">
                    <input type="number" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: Number(e.target.value)})} className="w-full bg-slate-50 rounded-2xl p-4 font-black text-xl outline-none focus:bg-emerald-50 border-2 border-transparent focus:border-emerald-500 transition-all pr-10 text-right" />
                    <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">المبلغ المدفوع</label>
                  <div className="relative">
                    <input type="number" value={formData.paid} onChange={e => setFormData({...formData, paid: Number(e.target.value)})} className="w-full bg-emerald-50 rounded-2xl p-4 font-black text-xl outline-none border-2 border-emerald-100 focus:border-emerald-500 transition-all pr-10 text-right" />
                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300" />
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-slate-100 rounded-[2rem] text-center border-2 border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">المتبقي من الحساب الأساسي</p>
                <p className="text-4xl font-black text-slate-700">{formData.remaining} <span className="text-sm">ج.م</span></p>
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-amber-600 font-black bg-amber-50 py-2 px-4 rounded-xl border border-amber-100">
                  <span className="flex items-center gap-1"><Info size={14} /> تنبيه:</span>
                  <span>سيقوم قسم الشحن بإضافة التكاليف النهائية لاحقاً</span>
                </div>
              </div>
            </div>
          </section>

          <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-emerald-900/30 transition-all active:scale-95 flex items-center justify-center gap-3">
             <CheckCircle2 size={24} />
             حفظ وإرسال للمراجعة
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
