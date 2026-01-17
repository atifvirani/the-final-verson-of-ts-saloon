
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Chair, ChairStatus, Staff, Customer, Service } from '../types';

const SalonFloor: React.FC<{ onSelectChair: (id: number) => void }> = ({ onSelectChair }) => {
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const c = await db.get<Chair>('CHAIRS');
      const s = await db.get<Staff>('STAFF');
      const cu = await db.get<Customer>('CUSTOMERS');
      const sv = await db.get<Service>('SERVICES');
      setChairs(c.sort((a,b) => a.id - b.id)); // Ensure order
      setStaff(s);
      setCustomers(cu);
      setServices(sv);
    };
    fetchData();

    const interval = setInterval(() => {
      fetchData(); // Poll for updates from Tablet Mode
    }, 2000);

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
          <p className="text-sm text-gray-500">Real-time sync with Stylist Tablets</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-gray-400">Idle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-xs text-gray-400">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-400">Ready for Bill</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {chairs.map(chair => {
          const s = staff.find(st => st.id === chair.staffId);
          const cu = customers.find(c => c.id === chair.customerId);
          
          // Calculate total from added services
          const currentTotal = (chair.services || []).reduce((acc, sid) => {
              const svc = services.find(x => x.id === sid);
              return acc + (svc?.price || 0);
          }, 0);

          return (
            <div 
              key={chair.id}
              className={`relative bg-[#111] border rounded-2xl p-6 transition-all duration-300 ${
                chair.status === ChairStatus.IN_SERVICE 
                  ? 'border-amber-500/50 shadow-lg shadow-amber-900/10' 
                  : chair.status === ChairStatus.COMPLETED
                  ? 'border-blue-500/50 bg-blue-900/5'
                  : 'border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Station</div>
                  <div className="text-2xl font-bold text-gray-100">#{chair.id.toString().padStart(2, '0')}</div>
                </div>
                {chair.status === ChairStatus.IN_SERVICE && (
                  <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-mono font-bold animate-pulse">
                    {getTimer(chair.startTime)}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Active Services List */}
                <div className="bg-black/40 rounded-xl p-3 min-h-[80px]">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">Running Order</div>
                    {chair.services && chair.services.length > 0 ? (
                        <div className="space-y-1">
                            {chair.services.slice(0, 3).map((sid, i) => (
                                <div key={i} className="text-xs text-gray-300 truncate">
                                    • {services.find(x => x.id === sid)?.name || 'Unknown Item'}
                                </div>
                            ))}
                            {chair.services.length > 3 && (
                                <div className="text-[10px] text-gray-500 italic">+ {chair.services.length - 3} more...</div>
                            )}
                        </div>
                    ) : (
                        <div className="text-xs text-gray-600 italic">No services added</div>
                    )}
                </div>

                <div className="flex justify-between items-center border-t border-white/5 pt-3">
                    <div className="text-xs text-gray-500">Current Total</div>
                    <div className="text-lg font-bold text-gold">₹{currentTotal}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Stylist</div>
                    <div className="text-sm font-medium text-gray-300">{s?.name || '--'}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                {chair.status === ChairStatus.IDLE ? (
                  <button 
                    onClick={() => updateChairStatus(chair.id, ChairStatus.IN_SERVICE)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold py-2.5 rounded-xl transition-all"
                  >
                    MANUAL START
                  </button>
                ) : chair.status === ChairStatus.IN_SERVICE ? (
                  <button 
                    onClick={() => updateChairStatus(chair.id, ChairStatus.COMPLETED)}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                  >
                    FINISH SERVICE
                  </button>
                ) : (
                  <button 
                    onClick={() => onSelectChair(chair.id)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
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
