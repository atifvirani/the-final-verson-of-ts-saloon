
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';

const Developer: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    storageUsed: 0,
    itemCount: 0
  });

  useEffect(() => {
    loadDevData();
  }, []);

  const loadDevData = async () => {
    const l = await db.get<any>('LOGS');
    setLogs(l.reverse());
    
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) total += localStorage.getItem(key)?.length || 0;
    }
    setStats({ storageUsed: Math.round(total / 1024), itemCount: localStorage.length });
  };

  const generateTestData = async () => {
    const testCustomers = [
      { id: '1', name: 'John Doe', phone: '9998887776', visitCount: 5, totalSpent: 1250, isVIP: true, type: 'salon' },
      { id: '2', name: 'Jane Smith', phone: '8887776665', visitCount: 2, totalSpent: 450, isVIP: false, type: 'salon' }
    ];
    const testStaff = [
      { id: 's1', name: 'Marco Stylist', phone: '777', role: 'Senior Stylist', commission: 20 },
      { id: 's2', name: 'Elena Skin', phone: '666', role: 'Aesthetician', commission: 15 }
    ];
    const testServices = [
      { id: 'svc1', name: 'Signature Haircut', category: 'Hair', time: 45, price: 150, costPrice: 10, commission: 20 },
      { id: 'svc2', name: 'Hydra Facial', category: 'Skin', time: 60, price: 250, costPrice: 45, commission: 15 }
    ];

    await db.save('CUSTOMERS', testCustomers);
    await db.save('STAFF', testStaff);
    await db.save('SERVICES', testServices);
    alert('Test Data Generated. Page will reload.');
    window.location.reload();
  };

  const handleExport = async () => {
    const data = await db.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elysian_backup_${new Date().toISOString()}.json`;
    a.click();
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Storage Usage</div>
          <div className="text-3xl font-bold text-white">{stats.storageUsed} KB</div>
          <div className="text-xs text-gray-400 mt-1">Browser LocalStorage</div>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Active Modules</div>
          <div className="text-3xl font-bold text-white">{stats.itemCount}</div>
          <div className="text-xs text-gray-400 mt-1">Namespaced keys</div>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
          <button 
            onClick={generateTestData}
            className="w-full bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-bold py-3 rounded-xl border border-white/10"
          >
            GENERATE TEST DATA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#111] border border-white/5 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            Danger Zone
          </h3>
          <div className="space-y-4">
            <button 
              onClick={handleExport}
              className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-sm font-bold py-4 rounded-2xl border border-blue-500/20 transition-all"
            >
              Export System Snapshot (JSON)
            </button>
            <button 
              onClick={async () => {
                if(confirm('Wipe everything? This cannot be undone.')) {
                  await db.resetSystem();
                }
              }}
              className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 text-sm font-bold py-4 rounded-2xl border border-red-500/20 transition-all"
            >
              Factory Reset System
            </button>
          </div>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-3xl p-8 h-[500px] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Audit Logs</h3>
          <div className="flex-1 overflow-y-auto pr-4 space-y-3 custom-scrollbar">
            {logs.map((log, i) => (
              <div key={i} className="bg-black/40 p-3 rounded-xl border border-white/5 font-mono text-[10px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-amber-500 font-bold">{log.action}</span>
                  <span className="text-gray-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-gray-400">
                  Target: <span className="text-gray-200">{log.module}</span> | ID: <span className="text-gray-200">{log.targetId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Developer;
