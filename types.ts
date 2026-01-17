
export enum AppView {
  DASHBOARD = 'dashboard',
  SALON_FLOOR = 'salon-floor',
  POS = 'pos',
  QUICK_BILLING = 'quick-billing',
  SERVICES = 'services',
  INVENTORY = 'inventory',
  INVOICES = 'invoices',
  CUSTOMERS = 'customers',
  PROFIT = 'profit',
  REPORTS = 'reports',
  STAFF = 'staff',
  TABLET = 'tablet',
  CLINIC = 'clinic',
  FORMULAS = 'formulas',
  SETTINGS = 'settings',
  DEVELOPER = 'developer'
}

export enum ChairStatus {
  IDLE = 'idle',
  IN_SERVICE = 'in-service',
  COMPLETED = 'completed'
}

export enum PaymentMode {
  CASH = 'cash',
  UPI = 'upi',
  CARD = 'card',
  SPLIT = 'split'
}

export interface Service {
  id: string;
  name: string;
  category: 'Hair' | 'Skin' | 'Makeup' | 'Clinical';
  time: number; // minutes
  price: number;
  costPrice: number;
  commission: number; // percentage
  productsUsed: string[];
  active?: boolean; // Soft delete flag
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  role: string;
  commission: number;
  salary?: number;
  active?: boolean; // Soft delete flag
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  visitCount: number;
  totalSpent: number;
  isVIP: boolean;
  notes?: string;
  type: 'salon' | 'clinic';
}

export interface Chair {
  id: number;
  status: ChairStatus;
  startTime?: number;
  staffId?: string;
  customerId?: string;
  services: string[]; // Service IDs
}

export interface Invoice {
  id: string;
  date: number;
  customerId: string;
  customerName: string;
  customerPhone: string;
  services: Array<{
    serviceId: string;
    name: string;
    price: number;
    staffId: string;
    staffName: string;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMode: PaymentMode;
  isClinic: boolean;
}

export interface Formula {
  id: string;
  serviceId: string;
  name: string;
  steps: string[];
  ingredients: Array<{ item: string; amount: string }>;
  safetyNotes?: string;
  imageLink?: string; // Changed from file upload to link to prevent crashes
}

export interface SystemSettings {
  salonName: string;
  logoUrl?: string;
  currency: string;
  taxRate: number;
  whatsappTemplate: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: number;
  category: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minLevel: number;
  price: number;
  category: string;
  active?: boolean; // Soft delete support
}
