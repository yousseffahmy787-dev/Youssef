
import React, { useState, useEffect } from 'react';
import { Order, ShippingCompany, ShippingStatus } from '../types';
import { getOrders, saveOrder } from '../utils/storage';
import { SHIPPING_STATUSES, getCityZone, BASE_WEIGHT } from '../constants';
import { Truck, Search, Clock, Package, ShieldCheck, Send, TrendingUp, Weight, Info, X, DollarSign } from 'lucide-react';

const ShippingManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'pending' | 'assigned'>('pending');
  const [edits, setEdits] = useState<Record<string, { weight: number, profit: number, company: ShippingCompany }>>({});
  const [postaModal, setPostaModal] = useState<{ isOpen: boolean, orderId: string, manualFee: number, profit: number } | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    const allOrders = getOrders();
    setOrders(allOrders);
    const initialEdits: Record<string, any> = {};
    allOrders.forEach(o => {
      if (!o.shippingCompany || o.shippingCompany === 'NONE') {
        initialEdits[o.id] = { 
          weight: o.weight || 1, 
          profit: o.shippingProfit || 20, 
          company: 'NONE' 
        };
      }
    });
    setEdits(initialEdits);
  };

  const handleEditChange = (orderId: string, field: string, value: any) => {
    const currentEdit = edits[orderId] || { weight: 1, profit: 20, company: 'NONE' as ShippingCompany };
    let newProfit = currentEdit.profit;
    if (field === 'company') {
        if (value === 'POSTA') newProfit = 5;
        if (value === 'JT') newProfit = 20;
    }

    setEdits(prev => ({
      ...prev,
      [orderId]: { 
        ...currentEdit, 
        [field]: value,
        profit: field === 'profit' ? value : newProfit
      }
    }));
  };

  const calculateJTFees = (order: Order, weight: number) => {
    const zoneData = getCityZone(order.city);
    let basePrice = zoneData.price;
    if (weight > BASE_WEIGHT) {
      basePrice += (weight - BASE_WEIGHT) * zoneData.extraKg;
    }
    const orderValue = order.totalAmount || 0;
    const valueSurcharge = orderValue < 1000 ? 5 : orderValue * 0.01;
    return basePrice + valueSurcharge;
  };

  const handleExecuteDispatch = (orderId: string) => {
    const edit = edits[orderId];
    if (!edit || edit.company === 'NONE') {
      alert("من فضلك اختر شركة الشحن أولاً (JT أو POSTA)");
      return;
    }
    if (edit.company === 'POSTA') {
      setPostaModal({ isOpen: true, orderId, manualFee: 0, profit: 5 });
    } else {
      const order = orders.find(o => o.id === orderId)!;
      executeFinalSave(orderId, calculateJTFees(order, edit.weight), edit.profit, edit.company, edit.weight);
    }
  };

  const executeFinalSave = (orderId: string, shippingFee: number, profit: number, company: ShippingCompany, weight: number) => {
    const ordersList = getOrders();
    const orderIndex = ordersList.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      const order = ordersList[orderIndex];
      order.shippingCompany = company;
      order.weight = weight;
      order.shippingProfit = profit;
      order.shippingFee = shippingFee;
      order.shippingStatus = 'processing';
      order.remaining = (order.totalAmount - order.paid) + shippingFee + profit;
      saveOrder(order);
      refresh();
      setPostaModal(null);
    }
  };

  const handleStatusUpdate = (orderId: string, status: ShippingStatus) => {
    const ordersList = getOrders();
    const order = ordersList.find(o => o.id === orderId);
    if (order) {
      order.shippingStatus = status;
      saveOrder(order);
      refresh();
    }
  };

  const filtered = orders.filter(o => {
    const matchesSearch = o.customerName.includes(search) || o.id.includes(search) || o.city.includes(search);
    const isAssigned = o.shippingCompany && o.shippingCompany !== 'NONE';
    return tab === 'pending' ? (matchesSearch && !isAssigned) : (matchesSearch && isAssigned);
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h2 className="text-4xl font-black text-emerald-950">المعالجة اللوجستية</h2>
          <p className="text-slate-500 font-bold mt-2">نظام تسعير الشركات (JT التلقائي / POSTA اليدوي)</p>
        </div>
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
          <button onClick={() => setTab('pending')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${tab === 'pending' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500'}`}>
            <Clock size={14} /> بانتظار المعالجة
          </button>
          <button onClick={() => setTab('assigned')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${tab === 'assigned' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>
            <ShieldCheck size={14} /> تم التوجيه
          </button>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input type="text" placeholder="ابحث بالاسم أو المحافظة..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white py-5 pr-12 pl-6 rounded-2xl font-bold outline-none border border-slate-100 shadow-sm" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filtered.map(order => {
          const edit = edits[order.id] || { weight: order.weight || 1, profit: order.shippingProfit || 20, company: order.shippingCompany || 'NONE' };
          const jtFee = calculateJTFees(order, edit.weight);
          const liveTotalRemaining = edit.company === 'POSTA' ? (order.totalAmount - order.paid) : ((order.totalAmount - order.paid) + jtFee + edit.profit);

          return (
            <div key={order.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col gap-8 group">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">#{order.id}</span>
                    <h4 className="font-black text-xl text-slate-900">{order.customerName}</h4>
                  </div>
                  <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                    <Package size={14} /> {order.city} | بمنتجات قيمتها: {order.totalAmount} ج.م
                  </p>
                </div>
                <div className="flex flex-col items-end">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{edit.company === 'POSTA' && tab === 'pending' ? 'مطلوب تحصيل (بدون شحن)' : 'إجمالي المطلوب للتحصيل'}</p>
                   <p className={`text-3xl font-black ${tab === 'pending' ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {tab === 'pending' ? liveTotalRemaining : order.remaining} <span className="text-sm">ج.م</span>
                   </p>
                </div>
              </div>

              {tab === 'pending' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase mr-2 block mb-1">الوزن (JT فقط)</label>
                        <div className={`flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 ${edit.company === 'POSTA' ? 'opacity-30' : ''}`}>
                          <Weight size={16} className="text-slate-400 ml-2" />
                          <input type="number" min="1" disabled={edit.company === 'POSTA'} value={edit.weight} onChange={e => handleEditChange(order.id, 'weight', Number(e.target.value))} className="w-full bg-transparent font-black outline-none" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase mr-2 block mb-1">المكسب</label>
                        <div className="flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                          <TrendingUp size={16} className="text-slate-400 ml-2" />
                          <input type="number" value={edit.profit} onChange={e => handleEditChange(order.id, 'profit', Number(e.target.value))} className="w-full bg-transparent font-black outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase mr-2 block mb-1">شركة الشحن</label>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditChange(order.id, 'company', 'JT')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all border-2 ${edit.company === 'JT' ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>JT EXPRESS</button>
                      <button onClick={() => handleEditChange(order.id, 'company', 'POSTA')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all border-2 ${edit.company === 'POSTA' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>POSTA</button>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button onClick={() => handleExecuteDispatch(order.id)} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95">
                      <Send size={18} /> {edit.company === 'POSTA' ? 'إدخال بيانات الشحن ونفذ' : 'نفذ وتأكيد الشحن'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className={`px-6 py-2 rounded-xl text-xs font-black text-white ${order.shippingCompany === 'JT' ? 'bg-red-600' : 'bg-blue-600'}`}>
                      {order.shippingCompany}
                    </div>
                    <div className="text-sm font-bold text-slate-500">
                      تكلفة الشحن: {order.shippingFee} ج.م | المكسب: {order.shippingProfit} ج.م
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <select value={order.shippingStatus} onChange={e => handleStatusUpdate(order.id, e.target.value as ShippingStatus)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-xs font-black text-slate-900 outline-none">
                      {Object.entries(SHIPPING_STATUSES).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {postaModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative overflow-hidden border border-emerald-100 animate-in zoom-in-95 duration-300">
             <button onClick={() => setPostaModal(null)} className="absolute top-8 left-8 p-2 text-slate-300 hover:text-red-500 transition-colors"><X size={24} /></button>
             <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                   <Truck size={32} />
                </div>
                <h3 className="text-2xl font-black text-emerald-950">تفاصيل شحن POSTA</h3>
                <p className="text-slate-400 font-bold text-xs mt-1">يرجى إدخال التكاليف اليدوية للأوردر</p>
             </div>
             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block mr-2">مصاريف الشحن الصافية</label>
                   <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 focus-within:border-blue-500 transition-all">
                      <DollarSign size={18} className="text-slate-400" />
                      <input type="number" autoFocus value={postaModal.manualFee} onChange={e => setPostaModal({...postaModal, manualFee: Number(e.target.value)})} className="w-full py-5 bg-transparent outline-none font-black text-xl text-blue-900 pr-2" placeholder="0.00" />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block mr-2">مكسب الشحن (افتراضي 5)</label>
                   <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 focus-within:border-emerald-500 transition-all">
                      <TrendingUp size={18} className="text-slate-400" />
                      <input type="number" value={postaModal.profit} onChange={e => setPostaModal({...postaModal, profit: Number(e.target.value)})} className="w-full py-5 bg-transparent outline-none font-black text-xl text-emerald-900 pr-2" />
                   </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex justify-between items-center">
                   <p className="text-xs font-black text-blue-700">إجمالي الشحن للعميل</p>
                   <p className="text-2xl font-black text-blue-900">{postaModal.manualFee + postaModal.profit} <span className="text-sm">ج.م</span></p>
                </div>
                <button onClick={() => executeFinalSave(postaModal.orderId, postaModal.manualFee, postaModal.profit, 'POSTA', 1)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-3xl font-black text-lg shadow-xl shadow-blue-900/20 transition-all active:scale-95">تأكيد البيانات وتنفيذ الشحن</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingManagement;
