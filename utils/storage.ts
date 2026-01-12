
import { User, Order, Lead } from '../types';

const SUPABASE_URL = 'https://sxrcojqmpyeolaymdjeb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Lj4yMMm022yKzQOYgLMxTA_1utn-j05';

// دالة مساعدة للتعامل مع Supabase REST API
async function supabaseRequest(table: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: any, query?: string) {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ''}`;
  const headers: Record<string, string> = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  try {
    const response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (!response.ok) throw new Error(`Supabase Error: ${response.statusText}`);
    return await response.json();
  } catch (err) {
    console.error(`Error in ${table} request:`, err);
    // fallback to local for safety if network fails
    const local = localStorage.getItem(`fallback_${table}`);
    return local ? JSON.parse(local) : [];
  }
}

const DEFAULT_USERS: User[] = [
  { 
    id: 'u1',
    username: 'admin', 
    name: 'المدير العام', 
    role: 'admin', 
    password: '123',
    jobTitle: 'المدير العام',
    permissions: { viewAllOrders: true, manageUsers: true, manageShipping: true, deleteOrders: true, viewDashboard: true, createOrders: true, editOrders: true } 
  }
];

export const getUsers = (): User[] => {
  // حالياً سنبقي المستخدمين في localStorage لسرعة الدخول، 
  // ولكن يمكن نقلهم لـ Supabase Auth لاحقاً
  const stored = localStorage.getItem('crm_users_cloud');
  return stored ? JSON.parse(stored) : DEFAULT_USERS;
};

export const saveUser = (user: User) => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id || u.username === user.username);
  if (existingIndex > -1) users[existingIndex] = user;
  else users.push(user);
  localStorage.setItem('crm_users_cloud', JSON.stringify(users));
};

export const deleteUser = (id: string) => {
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem('crm_users_cloud', JSON.stringify(users));
};

// --- الطلبات (Orders) ---
export const getOrders = (): Order[] => {
  // جلب البيانات من المزامنة المحلية حالياً، وسيتم تحديث App.tsx ليقوم بـ fetch
  const stored = localStorage.getItem('crm_orders_cloud');
  return stored ? JSON.parse(stored) : [];
};

export const fetchOrdersCloud = async (): Promise<Order[]> => {
  const data = await supabaseRequest('orders', 'GET');
  localStorage.setItem('crm_orders_cloud', JSON.stringify(data));
  return data;
};

export const saveOrder = async (order: Order) => {
  const isNew = !getOrders().some(o => o.id === order.id);
  const data = await supabaseRequest('orders', isNew ? 'POST' : 'PATCH', order, !isNew ? `id=eq.${order.id}` : undefined);
  await fetchOrdersCloud(); // تحديث الكاش المحلي
  window.dispatchEvent(new Event('storage_updated'));
  return data;
};

export const deleteOrder = async (id: string) => {
  await supabaseRequest('orders', 'DELETE', undefined, `id=eq.${id}`);
  await fetchOrdersCloud();
  window.dispatchEvent(new Event('storage_updated'));
};

// --- المتابعات (Leads) ---
export const getLeads = (): Lead[] => {
  const stored = localStorage.getItem('crm_leads_cloud');
  return stored ? JSON.parse(stored) : [];
};

export const fetchLeadsCloud = async (): Promise<Lead[]> => {
  const data = await supabaseRequest('leads', 'GET');
  localStorage.setItem('crm_leads_cloud', JSON.stringify(data));
  return data;
};

export const saveLead = async (lead: Lead) => {
  const isNew = !getLeads().some(l => l.id === lead.id);
  const data = await supabaseRequest('leads', isNew ? 'POST' : 'PATCH', lead, !isNew ? `id=eq.${lead.id}` : undefined);
  await fetchLeadsCloud();
  window.dispatchEvent(new Event('storage_updated'));
  return data;
};

export const deleteLead = async (id: string) => {
  await supabaseRequest('leads', 'DELETE', undefined, `id=eq.${id}`);
  await fetchLeadsCloud();
  window.dispatchEvent(new Event('storage_updated'));
};