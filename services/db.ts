
/**
 * DB Service: All data access is isolated and asynchronous.
 * Implements STRICT separation between Salon and Clinic data.
 */

const KEYS = {
  // --- SALON SIDE DATA ---
  SERVICES: 'ts_salon_services',
  STAFF: 'ts_staff_members',
  CUSTOMERS: 'ts_salon_clients',
  INVOICES: 'ts_salon_invoices',
  CHAIRS: 'ts_salon_chairs',
  FORMULAS: 'ts_salon_formulas',
  
  // --- CLINIC SIDE DATA (Strictly Separate) ---
  CLINIC_CUSTOMERS: 'ts_clinic_clients_secure',
  CLINIC_INVOICES: 'ts_clinic_invoices',
  CLINIC_RECORDS: 'ts_clinic_records',
  CLINIC_CONSENTS: 'ts_clinic_consents',
  
  // --- SHARED RESOURCES ---
  SETTINGS: 'ts_system_settings',
  LOGS: 'ts_audit_logs'
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function getItems<T>(key: keyof typeof KEYS): Promise<T[]> {
  await delay(10); // Simulated async latency
  const data = localStorage.getItem(KEYS[key]);
  return data ? JSON.parse(data) : [];
}

async function saveItems<T extends { id: string | number }>(key: keyof typeof KEYS, items: T[]): Promise<void> {
  await delay(20);
  localStorage.setItem(KEYS[key], JSON.stringify(items));
}

async function logAction(action: string, module: string, targetId: string | number): Promise<void> {
  const logs = await getItems<any>('LOGS');
  logs.push({
    timestamp: Date.now(),
    action,
    module,
    targetId
  });
  // Keep only last 1000 logs
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs.slice(-1000)));
}

export const db = {
  get: getItems,
  save: saveItems,
  log: logAction,

  async add<T extends { id: string | number }>(key: keyof typeof KEYS, item: T): Promise<void> {
    const items = await getItems<T>(key);
    items.push(item);
    await saveItems(key, items);
    await logAction('ADD', key, item.id);
  },

  async update<T extends { id: string | number }>(key: keyof typeof KEYS, id: string | number, update: Partial<T>): Promise<void> {
    let items = await getItems<T>(key);
    items = items.map(item => item.id === id ? { ...item, ...update } : item);
    await saveItems(key, items);
    await logAction('UPDATE', key, id);
  },

  async delete(key: keyof typeof KEYS, id: string | number): Promise<void> {
    let items = await getItems<{ id: string | number }>(key);
    items = items.filter(item => item.id !== id);
    await saveItems(key, items);
    await logAction('DELETE', key, id);
  },

  async getSettings(): Promise<any> {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      salonName: 'TS Salon & Aesthetics',
      currency: '₹',
      taxRate: 18, // GST Default
      whatsappTemplate: 'Namaste {name}, thank you for visiting TS Salon. Your bill #{invoiceId} for {total} is ready.'
    };
  },

  async saveSettings(settings: any): Promise<void> {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    await logAction('SETTINGS_UPDATE', 'SETTINGS', 'global');
  },

  async resetSystem(): Promise<void> {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  },

  async exportData(): Promise<string> {
    const fullData: any = {};
    for (const [key, storageKey] of Object.entries(KEYS)) {
      fullData[key] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    }
    return JSON.stringify(fullData, null, 2);
  },

  async importData(json: string): Promise<void> {
    const data = JSON.parse(json);
    for (const [key, value] of Object.entries(data)) {
      if (KEYS[key as keyof typeof KEYS]) {
        localStorage.setItem(KEYS[key as keyof typeof KEYS], JSON.stringify(value));
      }
    }
    window.location.reload();
  }
};
