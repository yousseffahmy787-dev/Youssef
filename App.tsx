
import React, { useState, useEffect } from 'react';
import { User, Order, Lead } from './types';
import { getUsers, getOrders } from './utils/storage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import OrdersList from './components/OrdersList';
import OrderForm from './components/OrderForm';
import UserManagement from './components/UserManagement';
import ShippingManagement from './components/ShippingManagement';
import LeadManagement from './components/LeadManagement';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'orders' | 'new-order' | 'users' | 'shipping' | 'leads'>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [preFilledLead, setPreFilledLead] = useState<Partial<Order> | undefined>(undefined);
  const [orderToEdit, setOrderToEdit] = useState<Order | undefined>(undefined);

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
  }, []);

  const refreshData = () => {
    setOrders(getOrders() || []);
  };

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

  const visibleOrders = (user.permissions?.viewAllOrders 
    ? orders 
    : orders.filter(o => o.salesUsername === user.username)) || [];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans" dir="rtl">
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-emerald-600 text-white rounded-2xl shadow-lg md:hidden hover:bg-emerald-700 transition-colors"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div className={`
        fixed inset-y-0 right-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
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
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
            {view === 'dashboard' && (
              <Dashboard 
                orders={visibleOrders} 
                userRole={user.role} 
              />
            )}
            
            {view === 'orders' && (
              <OrdersList 
                orders={visibleOrders} 
                userRole={user.role}
                userPermissions={user.permissions || { viewAllOrders: false, deleteOrders: false, manageShipping: false, manageUsers: false }}
                onEdit={handleEditOrder}
                onRefresh={refreshData}
                canDelete={user.permissions?.deleteOrders || false}
              />
            )}

            {view === 'leads' && (
              <LeadManagement 
                currentUsername={user.username} 
                isAdmin={user.role === 'admin'}
                onConvertToOrder={handleConvertLeadToOrder}
              />
            )}
            
            {view === 'new-order' && (
              <OrderForm 
                salesUsername={user.username} 
                preFilledData={preFilledLead}
                initialData={orderToEdit}
                onComplete={() => {
                  refreshData();
                  setPreFilledLead(undefined);
                  setOrderToEdit(undefined);
                  setView('orders');
                }}
              />
            )}
            
            {view === 'users' && user.permissions?.manageUsers && (
              <UserManagement />
            )}
            
            {view === 'shipping' && user.permissions?.manageShipping && (
              <ShippingManagement />
            )}
        </div>
      </main>
    </div>
  );
};

export default App;
