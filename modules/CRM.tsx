
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Customer } from '../types';

const CRM: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const c = await db.get<Customer>('CUSTOMERS');
    setCustomers(c);
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold luxury-font text-white">Client Portfolio</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-[#111] border border-white/10 rounded-2xl px-10 py-3 text-sm text-gray-200 w-80 focus:border-gold outline-none"
          />
          <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div key={c.id} className="bg-[#111] border border-white/5 rounded-3xl p-6 group hover:border-gold/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-xl font-bold text-gold">
                {c.name[0]}
              </div>
              {c.isVIP && (
                <span className="bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">VIP Client</span>
              )}
            </div>
            
            <div className="space-y-1 mb-6">
              <h4 className="text-lg font-bold text-gray-100">{c.name}</h4>
              <p className="text-xs text-gray-500">{c.phone}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/5">
              <div>
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Lifetime Value</div>
                <div className="text-lg font-bold text-emerald-500">₹{c.totalSpent.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total Visits</div>
                <div className="text-lg font-bold text-gray-100">{c.visitCount}</div>
              </div>
            </div>

            <button className="w-full mt-4 bg-white/5 group-hover:bg-white/10 text-gray-400 group-hover:text-white text-xs font-bold py-3 rounded-xl transition-all uppercase tracking-widest">
              View Visit Timeline
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CRM;
