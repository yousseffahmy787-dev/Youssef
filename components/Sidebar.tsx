
import React from 'react';
import { User, Role } from '../types';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  PlusCircle, 
  Users, 
  Truck, 
  LogOut,
  Target
} from 'lucide-react';

interface SidebarProps {
  user: User;
  activeView: string;
  onViewChange: (view: any) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeView, onViewChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة القيادة', icon: LayoutDashboard, roles: ['admin', 'sales', 'shipper'] },
    { id: 'leads', label: 'المتابعات', icon: Target, roles: ['admin', 'sales'] },
    { id: 'orders', label: 'الطلبات', icon: ShoppingBag, roles: ['admin', 'sales', 'shipper'] },
    { id: 'new-order', label: 'طلب جديد', icon: PlusCircle, roles: ['admin', 'sales'] },
    { id: 'users', label: 'إدارة المستخدمين', icon: Users, roles: ['admin'] },
    { id: 'shipping', label: 'اللوجستيات', icon: Truck, roles: ['admin', 'shipper'] },
  ];

  return (
    <div className="w-64 h-full bg-white border-l border-slate-200 flex flex-col shadow-xl" dir="rtl">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-200">
            MF
          </div>
          <h1 className="text-xl font-black text-emerald-950 tracking-tight leading-none">وزير الرشاقة</h1>
        </div>
        
        <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=059669&color=fff&bold=true`} 
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-black text-slate-800 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{user.jobTitle || user.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.filter(item => item.roles.includes(user.role)).map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeView === item.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 font-bold' 
                : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            <item.icon size={20} className={activeView === item.id ? 'text-white' : 'text-slate-400 transition-colors'} />
            <span className="text-sm font-black">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-300 font-black text-sm"
        >
          <LogOut size={20} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
