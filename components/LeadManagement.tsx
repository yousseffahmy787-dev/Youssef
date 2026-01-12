
import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '../types';
import { getLeads, saveLead, deleteLead } from '../utils/storage';
import { LEAD_CLASSIFICATIONS, CITIES } from '../constants';
import { UserPlus, Search, Phone, MapPin, Trash2, Calendar, X, CheckCircle2, User as UserIcon, MessageSquare, ShoppingCart, ToggleRight, ToggleLeft, Edit2, Filter, Zap } from 'lucide-react';

interface LeadManagementProps {
  currentUsername: string;
  isAdmin: boolean;
  onConvertToOrder?: (lead: Lead) => void;
}

const LeadManagement: React.FC<LeadManagementProps> = ({ currentUsername, isAdmin, onConvertToOrder }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [salesFilter, setSalesFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialFormState: Partial<Lead> = {
    customerName: '',
    customerPhone: '',
    city: '',
    status: 'interested',
    comment: '',
    hasOrdered: false
  };

  const [formData, setFormData] = useState<Partial<Lead>>(initialFormState);

  useEffect(() => {
    refreshLeads();
  }, [currentUsername, isAdmin]);

  const refreshLeads = () => {
    const allLeads = getLeads();
    const visibleLeads = isAdmin ? allLeads : allLeads.filter(l => l.salesUsername === currentUsername);
    setLeads(visibleLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const openAddForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const openEditForm = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    setFormData(lead);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone) return;

    const leadToSave: Lead = {
      id: isEditing && formData.id ? formData.id : `LEAD-${Date.now()}`,
      customerName: formData.customerName || '',
      customerPhone: formData.customerPhone || '',
      city: formData.city || 'غير محدد',
      status: (formData.status as LeadStatus) || 'interested',
      comment: formData.comment || '',
      hasOrdered: !!formData.hasOrdered,
      salesUsername: isEditing && formData.salesUsername ? formData.salesUsername : currentUsername,
      createdAt: isEditing && formData.createdAt ? formData.createdAt : new Date().toISOString()
    };

    saveLead(leadToSave);
    refreshLeads();
    setIsFormOpen(false);
    setFormData(initialFormState);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("هل أنت متأكد من الحذف؟")) {
      deleteLead(id);
      refreshLeads();
    }
  };

  const toggleLeadOrdered = (lead: Lead) => {
    const updatedLead = { ...lead, hasOrdered: !lead.hasOrdered };
    saveLead(updatedLead);
    refreshLeads();
  };

  const uniqueSalesNames = Array.from(new Set(getLeads().map(l => l.salesUsername))) as string[];

  const filteredLeads = leads.filter(l => {
    const matchesSearch = (l.customerName || '').toLowerCase().includes(search.toLowerCase()) || (l.customerPhone || '').includes(search);
    const matchesStatus = statusFilter === 'all' ? true : l.status === statusFilter;
    const matchesSales = salesFilter === 'all' ? true : l.salesUsername === salesFilter;
    return matchesSearch && matchesStatus && matchesSales;
  });

  const groupLeadsByDate = () => {
    const groups: Record<string, Lead[]> = { 'اليوم': [], 'أمس': [], 'هذا الأسبوع': [], 'سجلات قديمة': [] };
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);

    filteredLeads.forEach(lead => {
      const leadDate = new Date(lead.createdAt); leadDate.setHours(0,0,0,0);
      if (leadDate.getTime() === today.getTime()) groups['اليوم'].push(lead);
      else if (leadDate.getTime() === yesterday.getTime()) groups['أمس'].push(lead);
      else if (leadDate.getTime() >= weekAgo.getTime()) groups['هذا الأسبوع'].push(lead);
      else groups['سجلات قديمة'].push(lead);
    });
    return groups;
  };

  const groupedLeads = groupLeadsByDate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-6xl mx-auto text-right" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-emerald-950">سجل المتابعات</h2>
          <p className="text-slate-500 font-bold mt-2 font-tajawal">
            {isAdmin ? 'إدارة ومتابعة أداء جميع الموظفين' : 'سجل المتابعات الخاصة بك فقط'}
          </p>
        </div>
        <button onClick={openAddForm} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl flex items-center gap-3 active:scale-95 transition-all">
          <UserPlus size={20} /> متابعة جديدة
        </button>
      </header>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="بحث بالاسم أو الرقم..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-3 pr-12 pl-6 outline-none focus:border-emerald-500 font-bold transition-all text-right" />
          </div>
          {isAdmin && (
            <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 min-w-[200px]">
              <Filter size={18} className="text-emerald-600" />
              <select value={salesFilter} onChange={e => setSalesFilter(e.target.value)} className="bg-transparent text-sm font-black text-emerald-900 outline-none w-full text-right">
                <option value="all">كل الموظفين</option>
                {uniqueSalesNames.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl overflow-x-auto scrollbar-hide">
           <button onClick={() => setStatusFilter('all')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${statusFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>الكل</button>
           {Object.entries(LEAD_CLASSIFICATIONS).map(([key, val]) => (
             <button key={key} onClick={() => setStatusFilter(key)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${statusFilter === key ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>{val.label}</button>
           ))}
        </div>
      </div>

      <div className="space-y-12">
        {Object.entries(groupedLeads).map(([groupName, groupLeads]) => {
          if (groupLeads.length === 0) return null;
          return (
            <div key={groupName} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200"></div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-100 px-6 py-2 rounded-full border border-slate-200 shadow-sm">{groupName}</h3>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupLeads.map(lead => {
                  const config = LEAD_CLASSIFICATIONS[lead.status] || LEAD_CLASSIFICATIONS.interested;
                  return (
                    <div key={lead.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group flex flex-col">
                      <div className={`h-2 w-full ${config.iconBg}`}></div>
                      <div className="p-8 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex flex-col gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase self-start ${config.color}`}>{config.label}</span>
                            {lead.hasOrdered && <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[8px] font-black flex items-center gap-1 self-start shadow-sm"><ShoppingCart size={10} /> تم الطلب</span>}
                          </div>
                          <div className="flex gap-2">
                            {onConvertToOrder && !lead.hasOrdered && (
                              <button 
                                onClick={() => onConvertToOrder(lead)}
                                title="تحويل لأوردر"
                                className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all"
                              >
                                <Zap size={16} />
                              </button>
                            )}
                            <button onClick={(e) => openEditForm(e, lead)} className="p-2 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"><Edit2 size={16} /></button>
                            <button onClick={(e) => handleDelete(e, lead.id)} className="p-2 bg-slate-50 text-slate-300 hover:text-red-600 rounded-xl transition-all"><Trash2 size={16} /></button>
                          </div>
                        </div>
                        <h4 className="text-xl font-black text-emerald-950 mb-4">{lead.customerName}</h4>
                        <div className="space-y-3 text-sm font-bold text-slate-500 mb-6">
                          <div className="flex items-center gap-3"><Phone size={14} className="text-slate-300" /> {lead.customerPhone}</div>
                          <div className="flex items-center gap-3"><MapPin size={14} className="text-slate-300" /> {lead.city}</div>
                          <div className="flex items-center gap-3"><Calendar size={14} className="text-slate-300" /> {new Date(lead.createdAt).toLocaleDateString('ar-EG')}</div>
                        </div>
                        {lead.comment && <div className="bg-emerald-50/50 p-4 rounded-2xl text-[11px] font-medium text-emerald-800 border border-emerald-100/50 mb-3"><span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 mb-1 tracking-wider"><MessageSquare size={10} /> تعليق السيلز:</span>{lead.comment}</div>}
                        <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-700"><UserIcon size={12} className="text-emerald-500" />{isAdmin ? lead.salesUsername : 'أنا'}</div>
                          <button onClick={() => toggleLeadOrdered(lead)} className={`text-[9px] font-black py-2 px-4 rounded-xl transition-all flex items-center gap-2 ${lead.hasOrdered ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {lead.hasOrdered ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}{lead.hasOrdered ? 'مسجل كـ طلب' : 'تحديد كـ طلب'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 border border-emerald-100 my-8">
             <button onClick={() => setIsFormOpen(false)} className="absolute top-8 left-8 p-2 text-slate-300 hover:text-red-500"><X size={24} /></button>
             <h3 className="text-2xl font-black text-emerald-950 mb-8 flex items-center gap-3">{isEditing ? <Edit2 className="text-emerald-600" /> : <UserPlus className="text-emerald-600" />}{isEditing ? 'تعديل المتابعة' : 'متابعة جديدة'}</h3>
             <form onSubmit={handleSaveLead} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">اسم العميل</label>
                    <input required value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 font-bold outline-none focus:border-emerald-500 transition-all text-right" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">رقم الهاتف</label>
                    <input required value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 font-bold outline-none focus:border-emerald-500 transition-all text-left" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">المحافظة</label>
                    <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 font-bold outline-none focus:border-emerald-500 transition-all text-right">
                      <option value="">اختر المحافظة</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">التصنيف</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as LeadStatus})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 font-black outline-none focus:border-emerald-500 transition-all text-emerald-800 text-right">
                      {Object.entries(LEAD_CLASSIFICATIONS).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${formData.hasOrdered ? 'bg-emerald-600 text-white' : 'bg-white text-slate-300'}`}><ShoppingCart size={20} /></div>
                      <div><p className="text-xs font-black text-emerald-950">هل أتم العميل طلباً؟</p></div>
                   </div>
                   <button type="button" onClick={() => setFormData({...formData, hasOrdered: !formData.hasOrdered})} className={`w-14 h-8 rounded-full transition-all relative ${formData.hasOrdered ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.hasOrdered ? 'right-7' : 'right-1 shadow-sm'}`}></div>
                   </button>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">تعليق المتابعة</label>
                  <textarea value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} placeholder="اكتب تفاصيل المكالمة..." className="w-full h-24 bg-slate-50 border-2 border-transparent rounded-2xl p-4 font-bold outline-none focus:border-emerald-500 transition-all resize-none text-right" />
                </div>
                <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-6 rounded-[2rem] font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
                   <CheckCircle2 size={24} /> {isEditing ? 'حفظ التعديلات' : 'حفظ المتابعة'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManagement;
