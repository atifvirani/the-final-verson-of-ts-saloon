
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Service } from '../types';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<Service>>({});

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const s = await db.get<Service>('SERVICES');
    // Ensure we only show active items (DB service filters this, but filtering here is safe)
    setServices(s.filter(x => x.active !== false));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService.name || !editingService.price) return;

    if (editingService.id) {
      await db.update('SERVICES', editingService.id, editingService);
    } else {
      await db.add('SERVICES', {
        ...editingService,
        id: Date.now().toString(),
      } as Service);
    }

    setIsModalOpen(false);
    setEditingService({});
    loadServices();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this service?')) {
      await db.delete('SERVICES', id);
      loadServices();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold luxury-font text-white">Service Catalog</h2>
        <button 
          onClick={() => { setEditingService({}); setIsModalOpen(true); }}
          className="bg-gold hover:bg-yellow-600 text-black px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add New Service
        </button>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-white/5 text-gray-400 uppercase text-[10px] tracking-widest font-bold">
              <th className="px-6 py-4">Service Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-center">Time (Min)</th>
              <th className="px-6 py-4 text-right">Price</th>
              <th className="px-6 py-4 text-right">Profit</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {services.map(svc => (
              <tr key={svc.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 font-medium text-gray-200">{svc.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-400 border border-white/10">{svc.category}</span>
                </td>
                <td className="px-6 py-4 text-center text-gray-400">{svc.time}</td>
                <td className="px-6 py-4 text-right font-bold text-gold">₹{svc.price}</td>
                <td className="px-6 py-4 text-right text-emerald-500">₹{svc.price - svc.costPrice - (svc.price * svc.commission / 100)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingService(svc); setIsModalOpen(true); }} className="text-gray-400 hover:text-white">Edit</button>
                    <button onClick={() => handleDelete(svc.id)} className="text-red-500 hover:text-red-400">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl w-full max-w-md p-8">
            <h3 className="text-xl font-bold luxury-font text-white mb-6">
              {editingService.id ? 'Edit Service' : 'Create New Service'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Service Name</label>
                <input 
                  type="text" 
                  value={editingService.name || ''}
                  onChange={e => setEditingService({...editingService, name: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Category</label>
                  <select 
                    value={editingService.category || 'Hair'}
                    onChange={e => setEditingService({...editingService, category: e.target.value as any})}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                  >
                    <option>Hair</option>
                    <option>Skin</option>
                    <option>Makeup</option>
                    <option>Clinical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Time (Min)</label>
                  <input 
                    type="number" 
                    value={editingService.time || ''}
                    onChange={e => setEditingService({...editingService, time: parseInt(e.target.value)})}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Price (₹)</label>
                  <input 
                    type="number" 
                    value={editingService.price || ''}
                    onChange={e => setEditingService({...editingService, price: parseFloat(e.target.value)})}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Cost Price (₹)</label>
                  <input 
                    type="number" 
                    value={editingService.costPrice || ''}
                    onChange={e => setEditingService({...editingService, costPrice: parseFloat(e.target.value)})}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
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
                  className="flex-1 bg-gold text-black font-bold py-3 rounded-xl hover:bg-yellow-600"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
