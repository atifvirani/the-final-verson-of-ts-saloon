
/**
 * DB Service: All data access is isolated and asynchronous.
 * Implements STRICT separation between Salon and Clinic data.
 */

import { Customer, Invoice, Service, Staff, Formula, Expense } from '../types';

// Map aliases for compatibility
type Client = Customer;

const STORAGE_KEYS = {
  // --- SALON SIDE DATA ---
  SALON_CLIENTS: 'ts_salon_clients_v1',
  SALON_INVOICES: 'ts_salon_invoices_v1',
  SALON_SERVICES: 'ts_salon_services_v1',
  SALON_CHAIRS: 'ts_salon_chairs_v1',
  SALON_FORMULAS: 'ts_salon_formulas_v1',
  
  // --- CLINIC SIDE DATA (Strictly Separate) ---
  CLINIC_CLIENTS: 'ts_clinic_patients_secure_v1',
  CLINIC_RECORDS: 'ts_clinic_records_v1',
  CLINIC_CONSENTS: 'ts_clinic_consents_v1',
  CLINIC_INVOICES: 'ts_clinic_invoices_v1',
  
  // --- SHARED RESOURCES ---
  STAFF: 'ts_staff_data',
  EXPENSES: 'ts_expenses_data',
  SETTINGS: 'ts_settings_data',
  LOGS: 'ts_audit_logs'
};

// Legacy key mapping to ensure existing modules (Services, POS, etc.) continue to work
// while routing data to the new strictly separated storage keys.
const LEGACY_KEYS = {
  SERVICES: STORAGE_KEYS.SALON_SERVICES,
  STAFF: STORAGE_KEYS.STAFF,
  CUSTOMERS: STORAGE_KEYS.SALON_CLIENTS,
  INVOICES: STORAGE_KEYS.SALON_INVOICES,
  CHAIRS: STORAGE_KEYS.SALON_CHAIRS,
  FORMULAS: STORAGE_KEYS.SALON_FORMULAS,
  SETTINGS: STORAGE_KEYS.SETTINGS,
  CLINIC_CUSTOMERS: STORAGE_KEYS.CLINIC_CLIENTS,
  CLINIC_INVOICES: STORAGE_KEYS.CLINIC_INVOICES,
  CLINIC_RECORDS: STORAGE_KEYS.CLINIC_RECORDS,
  LOGS: STORAGE_KEYS.LOGS
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const uuidv4 = () => crypto.randomUUID();

export const db = {
  // --- CORE GENERIC METHODS (Used by existing modules) ---
  
  get: async <T>(key: keyof typeof LEGACY_KEYS): Promise<T[]> => {
    await delay(50); // Fake DB latency
    const storageKey = LEGACY_KEYS[key] || key;
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : [];
  },

  add: async <T>(key: keyof typeof LEGACY_KEYS, item: any): Promise<void> => {
    await delay(50);
    const storageKey = LEGACY_KEYS[key] || key;
    // Retrieve using the storage key directly to ensure consistency
    const data = localStorage.getItem(storageKey);
    const list = data ? JSON.parse(data) : [];
    
    const newItem = { 
      ...item, 
      id: item.id || uuidv4(), 
      createdAt: new Date().toISOString() 
    };
    list.unshift(newItem); // Add to top
    localStorage.setItem(storageKey, JSON.stringify(list));
    
    // Log action
    await db.log('ADD', key as string, newItem.id);
  },

  update: async <T>(key: keyof typeof LEGACY_KEYS, id: string | number, updates: Partial<T>): Promise<void> => {
    await delay(50);
    const storageKey = LEGACY_KEYS[key] || key;
    const data = localStorage.getItem(storageKey);
    const list: any[] = data ? JSON.parse(data) : [];
    
    const index = list.findIndex(i => i.id == id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      localStorage.setItem(storageKey, JSON.stringify(list));
      await db.log('UPDATE', key as string, id);
    }
  },

  delete: async (key: keyof typeof LEGACY_KEYS, id: string | number): Promise<void> => {
    await delay(50);
    const storageKey = LEGACY_KEYS[key] || key;
    const data = localStorage.getItem(storageKey);
    let list: any[] = data ? JSON.parse(data) : [];
    
    list = list.filter(i => i.id != id);
    localStorage.setItem(storageKey, JSON.stringify(list));
    await db.log('DELETE', key as string, id);
  },

  save: async <T>(key: keyof typeof LEGACY_KEYS, items: T[]): Promise<void> => {
    await delay(50);
    const storageKey = LEGACY_KEYS[key] || key;
    localStorage.setItem(storageKey, JSON.stringify(items));
    await db.log('SAVE', key as string, 'bulk');
  },

  // --- SPECIFIC HELPERS (For explicit separation logic) ---
  salon: {
    getClients: () => db.get<Client>('CUSTOMERS'),
    addClient: (c: any) => db.add('CUSTOMERS', c),
    getInvoices: () => db.get<Invoice>('INVOICES'),
    addInvoice: (i: any) => db.add('INVOICES', i),
  },

  clinic: {
    getPatients: () => db.get<Client>('CLINIC_CUSTOMERS'),
    addPatient: (p: any) => db.add('CLINIC_CUSTOMERS', { ...p, type: 'Patient' }),
    getRecords: () => db.get<any>('CLINIC_RECORDS'),
  },

  shared: {
    getStaff: () => db.get<Staff>('STAFF'),
    getExpenses: async () => {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return data ? JSON.parse(data) : [];
    },
  },

  // --- SYSTEM UTILS ---

  getSettings: async (): Promise<any> => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      salonName: 'TS Salon & Aesthetics',
      currency: '₹',
      taxRate: 18, // GST Default
      whatsappTemplate: 'Namaste {name}, thank you for visiting TS Salon. Your bill #{invoiceId} for {total} is ready.'
    };
  },

  saveSettings: async (settings: any): Promise<void> => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    await db.log('SETTINGS_UPDATE', 'SETTINGS', 'global');
  },

  log: async (action: string, module: string, targetId: string | number): Promise<void> => {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    const logs = data ? JSON.parse(data) : [];
    logs.push({
      timestamp: Date.now(),
      action,
      module,
      targetId
    });
    // Keep only last 1000 logs
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(-1000)));
  },

  resetSystem: async (): Promise<void> => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  },

  exportData: async (): Promise<string> => {
    const fullData: any = {};
    for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
      fullData[key] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    }
    return JSON.stringify(fullData, null, 2);
  },

  importData: async (json: string): Promise<void> => {
    const data = JSON.parse(json);
    // Logic to import based on STORAGE_KEYS structure
    // This assumes the imported JSON matches the export structure
    for (const [key, value] of Object.entries(data)) {
        // @ts-ignore
       const storageKey = STORAGE_KEYS[key];
       if (storageKey) {
           localStorage.setItem(storageKey, JSON.stringify(value));
       }
    }
    window.location.reload();
  }
};
