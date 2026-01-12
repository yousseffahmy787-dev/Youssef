
import React, { useState } from 'react';
import { Order, ShippingStatus, UserPermissions, Role } from '../types';
import { deleteOrder } from '../utils/storage';
import { SHIPPING_STATUSES } from '../constants';
import { Search, Edit2, Trash2, MapPin, Printer, ShoppingCart, Truck, Clock, ShieldCheck, User, Globe } from 'lucide-react';

interface OrdersListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onRefresh: () => void;
  canDelete: boolean;
  userRole: Role;
  userPermissions: UserPermissions;
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, onEdit, onRefresh, canDelete }) => {
  const [search, setSearch] = useState('');
  const [shippingFilter, setShippingFilter] = useState<string>('all');
  const [salesFilter, setSalesFilter] = useState('all');

  const uniqueSales = Array.from(new Set(orders.map(o => o.salesUsername)));

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.customerName.toLowerCase().includes(search.toLowerCase()) || 
      o.customerPhone.includes(search) || 
      o.city.toLowerCase().includes(search.toLowerCase());
    
    const matchesShipping = 
      shippingFilter === 'all' ? true : 
      o.shippingStatus === shippingFilter;

    const matchesSales = 
      salesFilter === 'all' ? true : 
      o.salesUsername === salesFilter;

    return matchesSearch && matchesShipping && matchesSales;
  });

  const handleDelete = (id: string) => {
    if (window.confirm("تنبيه: هل أنت متأكد من حذف هذا الطلب نهائياً؟")) {
      deleteOrder(id);
      onRefresh();
    }
  };

  const handlePrint = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>فاتورة MF PHARMA #${order.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; text-align: right; color: #333; }
            .header { border-bottom: 3px solid #059669; padding-bottom: 20px; margin-bottom: 20px; }
            .badge { padding: 5px 10px; border-radius: 5px; font-size: 0.8em; }
            .details { background: #f8fafc; padding: 20px; border-radius: 10px; margin-top: 20px; }
            .total { font-size: 1.5em; color: #059669; border-top: 2px solid #eee; padding-top: 15px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header"><h1>MINISTER FITNESS PHARMA</h1><p>رقم الطلب: #${order.id}</p></div>
          <p><strong>العميل:</strong> ${order.customerName}</p>
          <p><strong>الهاتف:</strong> ${order.customerPhone}</p>
          <p><strong>العنوان:</strong> ${order.city} - ${order.address}</p>
          <div class="details"><h3>المنتجات:</h3><p>${order.orderDetails}</p></div>
          <p>ملاحظات الشحن: ${order.shippingNotes || 'لا يوجد'}</p>
          <div class="total">
            <p>سعر المنتجات: ${order.totalAmount} ج.م</p>
            <p>تكلفة الشحن الإجمالية: ${(order.shippingFee || 0) + (order.shippingProfit || 0)} ج.م</p>
            <p><strong>الإجمالي المطلوب:</strong> ${order.totalAmount + (order.shippingFee || 0) + (order.shippingProfit || 0)} ج.م</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-emerald-950">سجل العمليات العام</h2>
          <p className="text-slate-500 font-bold mt-2 flex items-center gap-2">
            <Globe size={16} className="text-emerald-600" />
            النظام يعمل ببيئة مشاركة - كافة الطلبات معروضة للجميع لسهولة التنسيق
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="ابحث بالاسم أو المحافظة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border-2 border-slate-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:border-emerald-500 w-full sm:w-64 font-bold shadow-sm text-right"
            />
          </div>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-wrap gap-6 items-center">
        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl overflow-x-auto max-w-full scrollbar-hide">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'returned'].map(s => (
            <button 
              key={s} 
              onClick={() => setShippingFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${shippingFilter === s ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-emerald-600'}`}
            >
              {s === 'all' ? 'الكل' : SHIPPING_STATUSES[s as ShippingStatus]?.label || s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
          <User size={16} className="text-slate-400" />
          <select 
            value={salesFilter}
            onChange={(e) => setSalesFilter(e.target.value)}
            className="bg-transparent text-sm font-black text-emerald-900 outline-none"
          >
            <option value="all">جميع المندوبين</option>
            {uniqueSales.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOrders.map((order) => {
            const statusInfo = SHIPPING_STATUSES[order.shippingStatus as ShippingStatus] || { label: order.shippingStatus, color: 'bg-slate-100 text-slate-700' };
            const hasCompany = order.shippingCompany && order.shippingCompany !== 'NONE';
            
            return (
              <div key={order.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col overflow-hidden group">
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(order)} className="p-2 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-colors"><Edit2 size={16} /></button>
                      {canDelete && <button onClick={() => handleDelete(order.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors"><Trash2 size={16} /></button>}
                    </div>
                  </div>

                  <h4 className="text-xl font-black text-emerald-950 truncate mb-4">{order.customerName}</h4>
                  
                  <div className="space-y-3 text-sm font-bold text-slate-500">
                    <div className="flex items-center gap-3"><MapPin size={16} className="text-emerald-500" /> {order.city}</div>
                    <div className="flex items-center gap-3">
                      <Truck size={16} className={hasCompany ? "text-emerald-500" : "text-amber-500"} /> 
                      {hasCompany ? (
                        <span className="font-black text-emerald-700">{order.shippingCompany}</span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1">
                          <Clock size={10} /> بانتظار التعيين
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 border-t border-slate-50 pt-3 mt-3">
                      <User size={14} className="text-slate-300" />
                      <span className="text-[10px] text-emerald-600 font-black">المسؤول: {order.salesUsername}</span>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-black mb-1">صافي المنتجات</p>
                    <p className="text-xl font-black text-emerald-950">{order.totalAmount} <span className="text-xs text-slate-400">ج.م</span></p>
                  </div>
                  <div className="text-left border-r pr-6 border-slate-200">
                    <p className="text-[10px] text-slate-400 font-black mb-1">الشحن الإجمالي</p>
                    <p className="text-xl font-black text-indigo-600">{(order.shippingFee || 0) + (order.shippingProfit || 0)} <span className="text-xs text-slate-400">ج.م</span></p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handlePrint(order)}
                  className={`w-full py-4 ${order.remaining > 0 ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'} font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2`}
                >
                  <Printer size={14} />
                  {order.remaining > 0 ? `مطلوب تحصيل: ${order.remaining} ج.م` : 'تم التحصيل بالكامل - طباعة'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-100">
           <ShoppingCart size={48} className="text-slate-200 mx-auto mb-4" />
           <h3 className="text-xl font-black text-slate-400">لا يوجد طلبات مسجلة حالياً</h3>
           <p className="text-slate-300 font-bold mt-2">ابدأ بتسجيل طلب جديد ليظهر هنا للجميع</p>
        </div>
      )}
    </div>
  );
};

export default OrdersList;
