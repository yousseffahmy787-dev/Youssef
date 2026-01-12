
import React, { useState, useEffect } from 'react';
import { User, Role, Permissions } from '../types';
import { getUsers, saveUser, deleteUser } from '../utils/storage';
import { UserPlus, Trash2, Shield, User as UserIcon, Check, Settings, Edit2, X, Lock, KeyRound } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [role, setRole] = useState<Role>('sales');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  
  const [permissions, setPermissions] = useState<Permissions>({
    viewDashboard: true,
    createOrders: true,
    viewAllOrders: false,
    editOrders: true,
    deleteOrders: false,
    manageShipping: false,
    manageUsers: false
  });

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    if (newRole === 'admin') {
      setPermissions({
        viewDashboard: true,
        createOrders: true,
        viewAllOrders: true,
        editOrders: true,
        deleteOrders: true,
        manageShipping: true,
        manageUsers: true
      });
    } else if (newRole === 'shipper') {
        setPermissions({
            viewDashboard: true,
            createOrders: false,
            viewAllOrders: true,
            editOrders: false,
            deleteOrders: false,
            manageShipping: true,
            manageUsers: false
          });
    } else {
      setPermissions({
        viewDashboard: true,
        createOrders: true,
        viewAllOrders: false,
        editOrders: true,
        deleteOrders: false,
        manageShipping: false,
        manageUsers: false
      });
    }
  };

  const togglePermission = (key: keyof Permissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !jobTitle || !name) return;
    
    if (!editingUserId && users.find(u => u.username === username)) {
      alert("اسم المستخدم مسجل مسبقاً");
      return;
    }

    const userData: User = {
      id: editingUserId || `u-${Math.random().toString(36).substr(2, 9)}`,
      username,
      name,
      jobTitle,
      password,
      role,
      permissions
    };

    saveUser(userData);
    setUsers(getUsers());
    resetForm();
  };

  const handleEditClick = (user: User) => {
    setEditingUserId(user.id || null);
    setUsername(user.username);
    setName(user.name);
    setPassword(user.password || '');
    setJobTitle(user.jobTitle || '');
    setRole(user.role);
    setPermissions(user.permissions || {
        viewDashboard: true,
        createOrders: true,
        viewAllOrders: false,
        editOrders: true,
        deleteOrders: false,
        manageShipping: false,
        manageUsers: false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingUserId(null);
    setUsername('');
    setName('');
    setPassword('');
    setJobTitle('');
    handleRoleChange('sales');
  };

  const handleDelete = (id: string) => {
    if (id === 'u1' || id === 'admin') {
        alert("لا يمكن حذف حساب المدير العام الأساسي");
        return;
    }
    if (window.confirm("هل أنت متأكد من حذف هذا الموظف؟")) {
      deleteUser(id);
      setUsers(getUsers());
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto text-right" dir="rtl">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-emerald-950">إدارة الفريق</h2>
          <p className="text-slate-500 font-bold mt-2">التحكم في الموظفين وصلاحيات الوصول للنظام</p>
        </div>
        {editingUserId && (
          <button onClick={resetForm} className="bg-slate-100 text-slate-500 px-6 py-3 rounded-2xl font-black hover:bg-slate-200 transition-all flex items-center gap-2">
            <X size={18} /> إلغاء التعديل
          </button>
        )}
      </header>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-full h-2 ${editingUserId ? 'bg-amber-500' : 'bg-emerald-600'}`}></div>
        <h3 className={`flex items-center gap-3 font-black mb-8 text-xl ${editingUserId ? 'text-amber-700' : 'text-emerald-700'}`}>
          {editingUserId ? <Edit2 size={28} /> : <UserPlus size={28} />} 
          {editingUserId ? `تعديل بيانات الموظف: ${username}` : 'إضافة موظف جديد للفريق'}
        </h3>
        
        <form onSubmit={handleAddUser} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">الاسم الكامل</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 outline-none focus:border-emerald-500 font-black text-emerald-950 transition-all" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">اسم المستخدم (Login)</label>
              <input value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 outline-none focus:border-emerald-500 font-black text-emerald-950 transition-all" required disabled={!!editingUserId} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">كلمة المرور</label>
              <div className="relative">
                <input type="text" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 pl-10 outline-none focus:border-emerald-500 font-black text-emerald-950 transition-all" required />
                <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">المسمى الوظيفي</label>
              <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 outline-none focus:border-emerald-500 font-black text-emerald-950 transition-all" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">نوع الحساب</label>
              <select value={role} onChange={e => handleRoleChange(e.target.value as Role)} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 outline-none focus:border-emerald-500 font-black text-emerald-950 transition-all">
                <option value="sales">مندوب مبيعات</option>
                <option value="shipper">مسؤول شحن</option>
                <option value="admin">مدير نظام</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
            <h4 className="font-black text-slate-700 mb-6 flex items-center gap-2"><Settings size={18} className="text-emerald-600" /> مصفوفة الصلاحيات</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'viewDashboard', label: 'لوحة التحكم' },
                { key: 'createOrders', label: 'تسجيل طلبات' },
                { key: 'viewAllOrders', label: 'رؤية كل الطلبات' },
                { key: 'editOrders', label: 'تعديل الطلبات' },
                { key: 'deleteOrders', label: 'حذف الطلبات' },
                { key: 'manageShipping', label: 'إدارة الشحن' },
                { key: 'manageUsers', label: 'إدارة الموظفين' }
              ].map(p => (
                <button key={p.key} type="button" onClick={() => togglePermission(p.key as keyof Permissions)} className={`flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${permissions[p.key as keyof Permissions] ? 'bg-white border-emerald-500 text-emerald-900 shadow-md' : 'bg-slate-100 border-transparent text-slate-400'}`}>
                  <span className="text-xs font-black">{p.label}</span>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${permissions[p.key as keyof Permissions] ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                    {permissions[p.key as keyof Permissions] && <Check size={14} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className={`px-12 py-5 rounded-2xl font-black transition-all shadow-xl text-white text-lg active:scale-95 flex items-center gap-3 ${editingUserId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-700 hover:bg-emerald-800'}`}>
              {editingUserId ? <Shield size={22} /> : <UserPlus size={22} />}
              {editingUserId ? 'حفظ التعديلات' : 'إضافة الموظف للنظام'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden mb-20">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black">
              <tr>
                <th className="px-8 py-6">الموظف</th>
                <th className="px-8 py-6">كلمة المرور</th>
                <th className="px-8 py-6">نوع الحساب</th>
                <th className="px-8 py-6 text-left">إدارة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u.id || u.username} className="hover:bg-emerald-50/30 transition-all group">
                  <td className="px-8 py-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-white transition-all overflow-hidden">
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random&color=fff`} alt={u.name} />
                    </div>
                    <div>
                      <span className="font-black text-emerald-950 block">{u.name}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">@{u.username} • {u.jobTitle}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 font-bold font-mono text-sm bg-slate-100/50 px-3 py-1.5 rounded-lg border border-slate-100 w-fit">
                      <Lock size={12} className="text-slate-400" />
                      {u.password || '****'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-rose-100 text-rose-700' : u.role === 'shipper' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {u.role === 'admin' ? 'مدير نظام' : u.role === 'shipper' ? 'مسؤول شحن' : 'مندوب مبيعات'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-left">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEditClick(u)} className="text-slate-300 hover:text-amber-600 p-3 hover:bg-amber-50 rounded-xl"><Edit2 size={20} /></button>
                      <button onClick={() => handleDelete(u.id || u.username)} className="text-slate-300 hover:text-red-600 p-3 hover:bg-red-50 rounded-xl"><Trash2 size={20} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
