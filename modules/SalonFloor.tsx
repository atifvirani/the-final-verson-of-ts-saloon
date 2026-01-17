
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Chair, ChairStatus, Staff, Customer } from '../types';

const SalonFloor: React.FC<{ onSelectChair: (id: number) => void }> = ({ onSelectChair }) => {
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const c = await db.get<Chair>('CHAIRS');
      const s = await db.get<Staff>('STAFF');
      const cu = await db.get<Customer>('CUSTOMERS');
      setChairs(c);
      setStaff(s);
      setCustomers(cu);
    };
    fetchData();

    const interval = setInterval(() => {
      setChairs(prev => [...prev]); // Trigger re-render for timers
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getTimer = (startTime?: number) => {
    if (!startTime) return '00:00';
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateChairStatus = async (id: number, status: ChairStatus) => {
    const chair = chairs.find(c => c.id === id);
    if (!chair) return;

    const newStartTime = status === ChairStatus.IN_SERVICE ? Date.now() : chair.startTime;
    await db.update<Chair>('CHAIRS', id, { status, startTime: newStartTime });
    const c = await db.get<Chair>('CHAIRS');
    setChairs(c);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold luxury-font text-white">Live Salon Floor</h2>
          <p className="text-sm text-gray-500">Managing 12 professional stations</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-gray-400">Idle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-xs text-gray-400">In Service</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-400">Completed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {chairs.map(chair => {
          const s = staff.find(st => st.id === chair.staffId);
          const cu = customers.find(c => c.id === chair.customerId);

          return (
            <div 
              key={chair.id}
              className={`relative bg-[#111] border rounded-2xl p-6 transition-all duration-300 ${
                chair.status === ChairStatus.IN_SERVICE 
                  ? 'border-amber-500/50 shadow-lg shadow-amber-900/10' 
                  : chair.status === ChairStatus.COMPLETED
                  ? 'border-blue-500/50'
                  : 'border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Station</div>
                  <div className="text-2xl font-bold text-gray-100">#{chair.id.toString().padStart(2, '0')}</div>
                </div>
                {chair.status === ChairStatus.IN_SERVICE && (
                  <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-mono font-bold">
                    {getTimer(chair.startTime)}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Stylist</div>
                    <div className="text-sm font-medium text-gray-300">{s?.name || '--'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Customer</div>
                    <div className="text-sm font-medium text-gray-300">{cu?.name || 'Walk-in'}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                {chair.status === ChairStatus.IDLE ? (
                  <button 
                    onClick={() => updateChairStatus(chair.id, ChairStatus.IN_SERVICE)}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                  >
                    START SERVICE
                  </button>
                ) : chair.status === ChairStatus.IN_SERVICE ? (
                  <button 
                    onClick={() => updateChairStatus(chair.id, ChairStatus.COMPLETED)}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                  >
                    COMPLETE
                  </button>
                ) : (
                  <button 
                    onClick={() => onSelectChair(chair.id)}
                    className="flex-1 bg-white hover:bg-gray-200 text-black text-xs font-bold py-2.5 rounded-xl transition-all"
                  >
                    GENERATE BILL
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SalonFloor;
