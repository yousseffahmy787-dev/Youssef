
import React, { useState, useEffect } from 'react';
import { User, Order, Lead } from './types';
import { getUsers, getOrders, fetchOrdersCloud, fetchLeadsCloud } from './utils/storage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import OrdersList from './components/OrdersList';
import OrderForm from './components/OrderForm';
import UserManagement from './components/UserManagement';
import ShippingManagement from './components/ShippingManagement';
import LeadManagement from './components/LeadManagement';
import { Menu, X, RefreshCcw } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'orders' | 'new-order' | 'users' | 'shipping' | 'leads'>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [preFilledLead, setPreFilledLead] = useState<Partial<Order> | undefined>(undefined);
  const [orderToEdit, setOrderToEdit] = useState<Order | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshData = async () => {
    setIsSyncing(true);
    try {
      await Promise.all([fetchOrdersCloud(), fetchLeadsCloud()]);
      setOrders(getOrders());
    } catch (err) {
      console.error("Cloud Sync Failed", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const savedUser = sessionStorage.getItem('logged_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser) {
          const allUsers = getUsers();
          const freshUser = allUsers.find(u => u.username === parsedUser.username);
          if (freshUser) setUser(freshUser);
          else setUser(parsedUser);
        }
      } catch (e) {
        sessionStorage.removeItem('logged_user');
      }
    }
    refreshData();

    // استطلاع (Polling) كل دقيقة لجلب التحديثات الجديدة من الآخرين
    const interval = setInterval(refreshData, 60000);
    window.addEventListener('storage_updated', refreshData);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage_updated', refreshData);
    };
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    sessionStorage.setItem('logged_user', JSON.stringify(u));
    refreshData();
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('logged_user');
  };

  const handleConvertLeadToOrder = (lead: Lead) => {
    setPreFilledLead({
      customerName: lead.customerName,
      customerPhone: lead.customerPhone,
      city: lead.city,
      orderDetails: lead.comment || '',
      salesUsername: lead.salesUsername
    });
    setView('new-order');
  };

  const handleEditOrder = (order: Order) => {
    setOrderToEdit(order);
    setView('new-order');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const visibleOrders = orders || [];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans" dir="rtl">
      {/* مؤشر المزامنة */}
      <div className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black shadow-lg transition-all duration-500 ${isSyncing ? 'bg-emerald-600 text-white animate-pulse' : 'bg-white text-slate-400 border border-slate-100'}`}>
        <RefreshCcw size={12} className={isSyncing ? 'animate-spin' : ''} />
        {isSyncing ? 'جاري التحديث من السحابة...' : 'قاعدة البيانات متصلة'}
      </div>

      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-emerald-600 text-white rounded-2xl shadow-lg md:hidden"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className={`fixed inset-y-0 right-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <Sidebar 
          user={user} 
          activeView={view} 
          onViewChange={(v) => { 
            setView(v); 
            setIsMobileMenuOpen(false);
            if (v !== 'new-order') {
              setPreFilledLead(undefined);
              setOrderToEdit(undefined);
            }
          }} 
          onLogout={handleLogout} 
        />
      </div>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
            {view === 'dashboard' && <Dashboard orders={visibleOrders} userRole={user.role} />}
            {view === 'orders' && (
              <OrdersList 
                orders={visibleOrders} 
                userRole={user.role}
                userPermissions={{ ...user.permissions, viewAllOrders: true } as any}
                onEdit={handleEditOrder}
                onRefresh={refreshData}
                canDelete={user.permissions?.deleteOrders || user.role === 'admin'}
              />
            )}
            {view === 'leads' && (
              <LeadManagement 
                currentUsername={user.username} 
                isAdmin={true} 
                onConvertToOrder={handleConvertLeadToOrder}
              />
            )}
            {view === 'new-order' && (
              <OrderForm 
                salesUsername={user.username} 
                preFilledData={preFilledLead}
                initialData={orderToEdit}
                onComplete={() => { refreshData(); setView('orders'); }}
              />
            )}
            {view === 'users' && user.permissions?.manageUsers && <UserManagement />}
            {view === 'shipping' && (user.permissions?.manageShipping || user.role === 'admin' || user.role === 'shipper') && <ShippingManagement />}
        </div>
      </main>
    </div>
  );
};

export default App;