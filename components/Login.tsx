
import React, { useState, useEffect } from 'react';
import { getUsers } from '../utils/storage';
import { User } from '../types';
import { LogIn, ShieldAlert, Crown, User as UserIcon, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const users = getUsers();
    setAvailableUsers(users);
    const admin = users.find(u => u.username === 'admin');
    if (admin) setSelectedUser(admin);
    else if (users.length > 0) setSelectedUser(users[0]);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setError('يرجى اختيار مستخدم أولاً');
      return;
    }

    if (selectedUser.password === password) {
      onLogin(selectedUser);
    } else {
      setError('كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى');
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-emerald-950 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:32px_32px] px-4" dir="rtl">
      <div className="w-full max-w-2xl animate-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[3rem] md:rounded-[4rem] border border-emerald-100 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col md:flex-row">
          
          <div className="md:w-1/2 bg-emerald-50 p-8 md:p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-l border-emerald-100">
            <div className="text-center">
              {!logoError ? (
                <img 
                  src="https://api.dicebear.com/7.x/initials/svg?seed=MF&backgroundColor=059669" 
                  alt="Minister Fitness" 
                  className="w-24 md:w-32 h-24 md:h-32 object-contain rounded-3xl shadow-xl mb-6 mx-auto" 
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-inner border border-emerald-200 mx-auto mb-4">
                  <Crown className="text-emerald-600" size={48} />
                </div>
              )}
              <h1 className="text-2xl font-black text-emerald-950 uppercase tracking-tighter leading-tight">
                MINISTER <span className="text-emerald-600">FITNESS</span>
              </h1>
              <p className="text-slate-400 mt-2 font-bold text-[10px] uppercase tracking-widest">بوابة إدارة المبيعات واللوجستيات</p>
            </div>
          </div>

          <div className="md:w-1/2 p-8 md:p-10 flex flex-col">
            <h2 className="text-lg font-black text-emerald-900 mb-6 text-center">اختر حسابك للدخول</h2>
            
            <form onSubmit={handleLogin} className="space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1 scrollbar-hide">
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      setError('');
                    }}
                    className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 group ${
                      selectedUser?.id === u.id 
                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10' 
                        : 'border-slate-100 bg-slate-50 hover:border-emerald-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors mb-1 ${
                      selectedUser?.id === u.id ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300 group-hover:text-emerald-400'
                    }`}>
                      {u.role === 'admin' ? <Crown size={16} /> : <UserIcon size={16} />}
                    </div>
                    <span className={`text-[10px] font-black truncate w-full text-center ${
                      selectedUser?.id === u.id ? 'text-emerald-700' : 'text-slate-500'
                    }`}>
                      {u.username}
                    </span>
                    <span className={`text-[8px] font-bold truncate w-full text-center ${
                      selectedUser?.id === u.id ? 'text-emerald-500/70' : 'text-slate-400'
                    }`}>
                      {u.jobTitle}
                    </span>
                    {selectedUser?.id === u.id && (
                      <div className="absolute top-1 left-1 text-emerald-500 animate-in zoom-in">
                        <CheckCircle2 size={12} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-800 mr-2 uppercase tracking-widest">كلمة المرور</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-slate-300 font-bold text-center text-emerald-950 text-lg shadow-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-[10px] border border-red-100 font-black">
                    <ShieldAlert size={14} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 bg-emerald-700 hover:bg-emerald-800 py-5 rounded-2xl text-white font-black transition-all shadow-xl shadow-emerald-900/20 active:scale-95 text-md"
                >
                  <LogIn size={20} />
                  دخول للنظام
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-50 text-center">
               <p className="text-[8px] text-slate-300 font-black uppercase tracking-widest">MF Pharma Intelligence Systems • 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
