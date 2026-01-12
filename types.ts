
export type Role = 'admin' | 'sales' | 'shipper';
export type LeadStatus = 'interested' | 'thinking' | 'not_responding' | 'cancelled' | 'converted';
export type ShippingStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned';
export type ShippingCompany = 'NONE' | 'JT' | 'POSTA';

export interface Permissions {
  viewDashboard?: boolean;
  createOrders?: boolean;
  viewAllOrders: boolean;
  editOrders?: boolean;
  deleteOrders: boolean;
  manageShipping: boolean;
  manageUsers: boolean;
}

export interface User {
  id?: string;
  username: string;
  name: string;
  role: Role;
  permissions?: Permissions;
  password?: string;
  jobTitle?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  whatsappPhone?: string;
  city: string;
  address: string;
  orderDetails: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  salesUsername: string;
  createdAt: string;
  totalAmount: number;
  paid: number;
  remaining: number;
  paymentMethod: string;
  walletNumber?: string;
  weight?: number;
  shippingStatus: ShippingStatus;
  shippingFee?: number;
  shippingProfit?: number;
  shippingCompany?: ShippingCompany;
  shippingNotes?: string;
}

export interface Lead {
  id: string;
  customerName: string;
  customerPhone: string;
  city: string;
  comment?: string;
  status: LeadStatus;
  salesUsername: string;
  createdAt: string;
  hasOrdered?: boolean;
}

export type UserPermissions = Permissions;
