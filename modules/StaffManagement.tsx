
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Staff, Invoice } from '../types';

const StaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [staffStats, setStaffStats] = useState<Record<string, { revenue: number, sales: number }>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Partial<Staff>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const staff = await db.get<Staff>('STAFF');
    const invoices = await db.get<Invoice>('INVOICES');
    
    // Calculate performance stats
    const stats: Record<string, { revenue: number, sales: number }> = {};
    staff.forEach(s => {
      stats[s.id] = { revenue: 0, sales: 0 };
    });

    invoices.forEach(inv => {
      inv.services.forEach(item => {
        if (stats[item.staffId]) {
          stats[item.staffId].revenue += item.price;
          stats[item.staffId].sales += 1;
        }
      });
    });

    setStaffList(staff);
    setStaffStats(stats);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff.name) return;

    if (editingStaff.id) {
      await db.update('STAFF', editingStaff.id, editingStaff);
    } else {
      await db.add('STAFF', {
        ...editingStaff,
        id: Date.now().toString(),
      } as Staff);
    }
    setIsModalOpen(false);
    setEditingStaff({});
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this staff member?')) {
      await db.delete('STAFF', id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold luxury-font text-white">Staff Roster</h2>
        <button 
          onClick={() => { setEditingStaff({}); setIsModalOpen(true); }}
          className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          Add New Staff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {staffList.map(member => (
          <div key={member.id} className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden group hover:border-amber-500/30 transition-all">
            <div className="p-6 text-center border-b border-white/5">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-gray-800 to-black border border-white/10 flex items-center justify-center text-2xl font-bold text-gray-500 mb-4 group-hover:text-amber-500 transition-colors">
                {member.name[0]}
              </div>
              <h3 className="text-lg font-bold text-white">{member.name}</h3>
              <p className="text-xs text-amber-500 uppercase tracking-widest font-bold mt-1">{member.role}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Commission Rate</span>
                <span className="text-white font-bold">{member.commission}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phone</span>
                <span className="text-gray-300">{member.phone}</span>
              </div>
              
              <div className="pt-4 border-t border-white/5 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Revenue</div>
                    <div className="text-sm font-bold text-emerald-500">${staffStats[member.id]?.revenue.toLocaleString() || 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Services</div>
                    <div className="text-sm font-bold text-white">{staffStats[member.id]?.sales || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-black/40 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => { setEditingStaff(member); setIsModalOpen(true); }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2 rounded-lg"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(member.id)}
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold py-2 rounded-lg"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl w-full max-w-md p-8">
            <h3 className="text-xl font-bold luxury-font text-white mb-6">
              {editingStaff.id ? 'Edit Staff Member' : 'Onboard New Staff'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={editingStaff.name || ''}
                  onChange={e => setEditingStaff({...editingStaff, name: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Role / Title</label>
                <input 
                  type="text" 
                  value={editingStaff.role || ''}
                  onChange={e => setEditingStaff({...editingStaff, role: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none"
                  placeholder="e.g. Senior Stylist"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Phone</label>
                  <input 
                    type="text" 
                    value={editingStaff.phone || ''}
                    onChange={e => setEditingStaff({...editingStaff, phone: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Commission (%)</label>
                  <input 
                    type="number" 
                    value={editingStaff.commission || ''}
                    onChange={e => setEditingStaff({...editingStaff, commission: parseFloat(e.target.value)})}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white/5 text-gray-400 font-bold py-3 rounded-xl hover:bg-white/10"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-amber-600 text-white font-bold py-3 rounded-xl hover:bg-amber-500"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
