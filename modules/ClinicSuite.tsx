
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';

const ClinicSuite: React.FC = () => {
  const [clinicCustomers, setClinicCustomers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const c = await db.get<any>('CLINIC_CUSTOMERS');
      setClinicCustomers(c);
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-900/20 to-transparent border-l-4 border-blue-500 p-8 rounded-r-3xl">
        <h2 className="text-2xl font-bold luxury-font text-white mb-2">Clinical & Aesthetic Suite</h2>
        <p className="text-sm text-blue-200/60 max-w-xl">
          Medical-grade aesthetic records. This module operates on a secure, separate data namespace from the standard salon database.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-200">Patient Records</h3>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold">New Medical File</button>
          </div>
          
          {clinicCustomers.length === 0 ? (
            <div className="bg-[#111] border border-white/5 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              </div>
              <h4 className="text-xl font-bold text-gray-200 mb-2">No clinical data found</h4>
              <p className="text-gray-500 text-sm max-w-xs">Start by adding a client to the aesthetic database for medical recording.</p>
            </div>
          ) : (
            <div className="bg-[#111] border border-white/5 rounded-3xl divide-y divide-white/5">
              {clinicCustomers.map(c => (
                <div key={c.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div>
                    <div className="font-bold text-gray-200">{c.name}</div>
                    <div className="text-xs text-gray-500">Last Procedure: {c.lastProcedure || 'None'}</div>
                  </div>
                  <button className="text-blue-500 text-sm font-bold uppercase tracking-widest hover:text-blue-400">View Charts</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-200">Suite Statistics</h3>
          <div className="bg-[#111] border border-white/5 rounded-3xl p-6 space-y-6">
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Procedures</div>
              <div className="text-2xl font-bold text-white">0</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Clinical Revenue</div>
              <div className="text-2xl font-bold text-emerald-500">$0.00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicSuite;
