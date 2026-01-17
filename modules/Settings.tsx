
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { SystemSettings } from '../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    salonName: '',
    currency: '',
    taxRate: 0,
    whatsappTemplate: ''
  });

  useEffect(() => {
    const load = async () => {
      setSettings(await db.getSettings());
    };
    load();
  }, []);

  const handleSave = async () => {
    await db.saveSettings(settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-white/5 bg-white/5">
          <h2 className="text-xl font-bold luxury-font text-white">Enterprise Configuration</h2>
          <p className="text-sm text-gray-500 mt-1">Configure your salon identity and global rules</p>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs text-gray-500 uppercase font-black tracking-widest mb-3">Salon Identity Name</label>
              <input 
                type="text" 
                value={settings.salonName}
                onChange={e => setSettings({...settings, salonName: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-gold outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase font-black tracking-widest mb-3">Currency Symbol</label>
              <input 
                type="text" 
                value={settings.currency}
                onChange={e => setSettings({...settings, currency: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-gold outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase font-black tracking-widest mb-3">Default Tax / GST (%)</label>
              <input 
                type="number" 
                value={settings.taxRate}
                onChange={e => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
                className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-gold outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase font-black tracking-widest mb-3">Auto-Backup Sync</label>
              <div className="flex items-center gap-4 py-4">
                <div className="w-12 h-6 rounded-full bg-gold relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"></div>
                </div>
                <span className="text-xs text-gray-400">Enabled (Every 15 mins)</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase font-black tracking-widest mb-3">WhatsApp Automation Template</label>
            <textarea 
              value={settings.whatsappTemplate}
              onChange={e => setSettings({...settings, whatsappTemplate: e.target.value})}
              rows={4}
              className="w-full bg-black border border-white/10 rounded-3xl px-5 py-4 text-white focus:border-gold outline-none transition-all resize-none"
            />
            <p className="text-[10px] text-gray-600 mt-2">Available Variables: {'{name}, {invoiceId}, {total}, {date}'}</p>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end">
            <button 
              onClick={handleSave}
              className="bg-gold hover:bg-yellow-600 text-black font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-amber-900/10"
            >
              Update Global Settings
            </button>
          </div>
        </div>
      </div>

      <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 flex items-center justify-between">
        <div>
          <h4 className="text-red-400 font-bold mb-1">Offline Resilience Mode</h4>
          <p className="text-xs text-red-400/60">Your data is stored locally in this browser. Clearing cache will delete salon data.</p>
        </div>
        <button className="text-red-400 text-xs font-bold uppercase border border-red-500/20 px-4 py-2 rounded-xl hover:bg-red-500/10">Read Docs</button>
      </div>
    </div>
  );
};

export default Settings;
