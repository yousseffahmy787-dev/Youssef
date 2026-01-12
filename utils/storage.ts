
import { User, Order, Lead } from '../types';

const USERS_KEY = 'crm_users';
const ORDERS_KEY = 'crm_orders';
const LEADS_KEY = 'crm_leads';

const DEFAULT_USERS: User[] = [
  { 
    id: 'u1',
    username: 'admin', 
    name: 'Admin User', 
    role: 'admin', 
    password: '1234',
    jobTitle: 'المدير العام',
    permissions: { viewAllOrders: true, manageUsers: true, manageShipping: true, deleteOrders: true, viewDashboard: true, createOrders: true, editOrders: true } 
  },
  { 
    id: 'u2',
    username: 'sales1', 
    name: 'Sarah Sales', 
    role: 'sales', 
    password: '1234',
    jobTitle: 'مسؤول مبيعات',
    permissions: { viewAllOrders: false, manageUsers: false, manageShipping: false, deleteOrders: false, viewDashboard: true, createOrders: true, editOrders: true } 
  },
  { 
    id: 'u3',
    username: 'ship1', 
    name: 'John Shipper', 
    role: 'shipper', 
    password: '1234',
    jobTitle: 'مسؤول شحن',
    permissions: { viewAllOrders: true, manageUsers: false, manageShipping: true, deleteOrders: false, viewDashboard: true, createOrders: false, editOrders: false } 
  }
];

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_USERS;
};

export const saveUser = (user: User) => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id || u.username === user.username);
  if (existingIndex > -1) users[existingIndex] = user;
  else users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const deleteUser = (id: string) => {
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getOrders = (): Order[] => {
  const stored = localStorage.getItem(ORDERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveOrder = (order: Order) => {
  const orders = getOrders();
  const existingIndex = orders.findIndex(o => o.id === order.id);
  if (existingIndex > -1) orders[existingIndex] = order;
  else orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const deleteOrder = (id: string) => {
  const orders = getOrders().filter(o => o.id !== id);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const getLeads = (): Lead[] => {
  const stored = localStorage.getItem(LEADS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveLead = (lead: Lead) => {
  const leads = getLeads();
  const existingIndex = leads.findIndex(l => l.id === lead.id);
  if (existingIndex > -1) leads[existingIndex] = lead;
  else leads.push(lead);
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
};

export const deleteLead = (id: string) => {
  const leads = getLeads().filter(l => l.id !== id);
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
};
