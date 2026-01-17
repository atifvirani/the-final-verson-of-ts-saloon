
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Chair, ChairStatus, Service, Staff } from '../types';

const TabletMode: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedChair, setSelectedChair] = useState<Chair | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  
  // Refresh interval
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const c = await db.get<Chair>('CHAIRS');
    const s = await db.get<Service>('SERVICES');
    const st = await db.get<Staff>('STAFF');
    setChairs(c.sort((a, b) => a.id - b.id));
    setServices(s);
    setStaff(st);
  };

  const handleLogin = () => {
    if (pin === '1234') {
      setIsAuthenticated(true);
      setPin('');
    } else {
      alert('Invalid PIN. Default is 1234');
      setPin('');
    }
  };

  const exitTabletMode = () => {
    if (confirm("Exit Tablet Mode and return to Admin?")) {
      window.location.reload(); 
    }
  };

  const handleAddService = async (serviceId: string) => {
    if (!selectedChair) return;
    
    // Update chair in DB
    const newServices = [...(selectedChair.services || []), serviceId];
    await db.update('CHAIRS', selectedChair.id, { 
      services: newServices,
      status: ChairStatus.IN_SERVICE,
      startTime: selectedChair.startTime || Date.now(),
      staffId: selectedStaffId || selectedChair.staffId
    });
    
    // Optimistic update
    const updated = { ...selectedChair, services: newServices, status: ChairStatus.IN_SERVICE };
    setSelectedChair(updated);
    loadData();
  };

  const handleFinish = async () => {
    if (!selectedChair) return;
    await db.update('CHAIRS', selectedChair.id, { status: ChairStatus.COMPLETED });
    setSelectedChair(null);
    loadData();
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#111] p-8 relative">
        <button 
          onClick={exitTabletMode} 
          className="absolute top-6 right-6 opacity-30 hover:opacity-100 text-gray-500 hover:text-red-500 transition-all p-2"
          title="Exit to Admin"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        </button>

        <h1 className="text-4xl font-bold luxury-font text-gold mb-8">STYLIST ACCESS</h1>
        <div className="bg-black border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-sm">
          <input 
            type="password" 
            value={pin}
            readOnly
            className="w-full bg-[#1a1a1a] text-white text-center text-4xl font-bold py-6 rounded-2xl mb-6 border border-white/5 tracking-widest outline-none"
            placeholder="****"
          />
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button 
                key={n}
                onClick={() => setPin(p => p.length < 4 ? p + n : p)}
                className="bg-white/5 hover:bg-gold hover:text-black text-white text-2xl font-bold py-6 rounded-xl transition-all active:scale-95"
              >
                {n}
              </button>
            ))}
            <button onClick={() => setPin('')} className="bg-red-500/20 text-red-500 font-bold rounded-xl flex items-center justify-center">CLR</button>
            <button 
              onClick={() => setPin(p => p.length < 4 ? p + 0 : p)}
              className="bg-white/5 hover:bg-gold hover:text-black text-white text-2xl font-bold py-6 rounded-xl transition-all"
            >
              0
            </button>
            <button onClick={handleLogin} className="bg-emerald-500/20 text-emerald-500 font-bold rounded-xl flex items-center justify-center">GO</button>
          </div>
          <p className="text-center text-gray-500 text-xs uppercase tracking-widest">Enter Staff PIN</p>
        </div>
      </div>
    );
  }

  if (selectedChair) {
    return (
      <div className="h-full flex flex-col bg-[#111]">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1a1a1a]">
          <h2 className="text-2xl font-bold text-white">Chair #{selectedChair.id} <span className="text-gray-500 text-lg">| Running Order</span></h2>
          <button onClick={() => setSelectedChair(null)} className="text-gray-400 font-bold px-6 py-3 border border-white/10 rounded-xl hover:bg-white/10">
            CLOSE
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Services Menu */}
          <div className="w-1/2 p-6 overflow-y-auto border-r border-white/10">
            <h3 className="text-gold font-bold uppercase tracking-widest mb-4">Add Service</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {services.map(svc => (
                <button 
                  key={svc.id}
                  onClick={() => handleAddService(svc.id)}
                  className="bg-white/5 hover:bg-gold hover:text-black p-6 rounded-2xl text-left border border-white/5 transition-all active:scale-95"
                >
                  <div className="font-bold text-lg mb-1">{svc.name}</div>
                  <div className="opacity-60 text-sm">₹{svc.price} • {svc.time}m</div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Order */}
          <div className="w-1/2 p-6 flex flex-col bg-black/20">
            <h3 className="text-gray-500 font-bold uppercase tracking-widest mb-4">Current Session</h3>
            
            <div className="mb-6">
               <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Assign Stylist</label>
               <div className="flex gap-2 overflow-x-auto pb-2">
                 {staff.map(s => (
                   <button
                     key={s.id}
                     onClick={async () => {
                       setSelectedStaffId(s.id);
                       await db.update('CHAIRS', selectedChair.id, { staffId: s.id });
                     }}
                     className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap border ${
                       (selectedStaffId === s.id || selectedChair.staffId === s.id) 
                       ? 'bg-gold text-black border-gold' 
                       : 'bg-transparent text-gray-400 border-gray-700'
                     }`}
                   >
                     {s.name}
                   </button>
                 ))}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 mb-6">
              {selectedChair.services?.map((svcId, idx) => {
                const svc = services.find(s => s.id === svcId);
                return (
                  <div key={idx} className="bg-[#1a1a1a] p-4 rounded-xl flex justify-between items-center border border-white/5">
                    <span className="text-white font-medium text-lg">{svc?.name || 'Unknown Service'}</span>
                    <span className="text-gold font-bold">₹{svc?.price}</span>
                  </div>
                );
              })}
              {(!selectedChair.services || selectedChair.services.length === 0) && (
                <div className="text-center text-gray-600 py-10">No services added yet</div>
              )}
            </div>

            <button 
              onClick={handleFinish}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-6 rounded-2xl text-xl shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
            >
              SEND TO RECEPTION
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-8 bg-[#111] relative">
      <button 
        onClick={exitTabletMode} 
        className="absolute top-8 right-8 opacity-30 hover:opacity-100 text-gray-500 hover:text-red-500 transition-all p-2"
        title="Exit to Admin"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
      </button>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold luxury-font text-white">Salon Floor Map</h1>
        <button onClick={() => setIsAuthenticated(false)} className="bg-white/5 px-6 py-2 rounded-xl text-xs font-bold text-gray-400 mr-12">LOGOUT</button>
      </div>
      
      <div className="grid grid-cols-4 gap-6 h-[calc(100vh-160px)]">
        {chairs.map(chair => (
          <button
            key={chair.id}
            onClick={() => {
              setSelectedChair(chair);
              setSelectedStaffId(chair.staffId || '');
            }}
            className={`rounded-3xl p-6 flex flex-col items-center justify-center transition-all active:scale-95 border-2 ${
              chair.status === ChairStatus.IN_SERVICE 
                ? 'bg-amber-900/20 border-amber-500 text-amber-500' 
                : chair.status === ChairStatus.COMPLETED
                ? 'bg-blue-900/20 border-blue-500 text-blue-500'
                : 'bg-[#1a1a1a] border-emerald-500/30 text-emerald-500 hover:bg-emerald-900/10'
            }`}
          >
            <div className="text-6xl font-bold mb-4">{chair.id}</div>
            <div className="text-sm font-bold uppercase tracking-widest">
              {chair.status === ChairStatus.IDLE ? 'AVAILABLE' : chair.status.replace('-', ' ')}
            </div>
            {chair.status !== ChairStatus.IDLE && (
               <div className="mt-2 text-xs text-gray-400">{chair.services?.length || 0} Items</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabletMode;
