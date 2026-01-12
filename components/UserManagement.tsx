
import React, { useState } from 'react';
import { User } from '../types';
import { getUsers } from '../utils/storage';
import { Shield, ShieldAlert, UserCheck, Key } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(getUsers());

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <ShieldAlert className="text-rose-500" />;
      case 'sales': return <UserCheck className="text-emerald-500" />;
      case 'shipper': return <Shield className="text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">System Users</h2>
          <p className="text-slate-500">Manage account access and permissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.username} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center">
                {getRoleIcon(user.role)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{user.name}</h3>
                <p className="text-sm text-slate-400 font-mono">@{user.username}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(user.permissions || {}).map(([key, val]) => (
                  val && (
                    <span key={key} className="px-2 py-1 bg-slate-50 text-[10px] font-bold text-slate-600 rounded-lg border border-slate-100">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  )
                ))}
                {!user.permissions && <span className="text-xs text-slate-400 italic">No specific permissions set</span>}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 capitalize bg-slate-50 px-3 py-1 rounded-full">
                Role: {user.role}
              </span>
              <button className="text-slate-400 hover:text-emerald-600 transition-colors p-2">
                <Key size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
