
import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Trash2, AlertCircle } from 'lucide-react';
import { db } from '../services/db';
import { InventoryItem } from '../types';

export default function Inventory() {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', price: '', minStock: '' });

  useEffect(() => { loadInventory(); }, []);

  const loadInventory = async () => {
    const data = await db.shared.getInventory();
    setProducts(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newItem.name || !newItem.quantity) return alert("Name and Quantity required!");
    
    const product: any = {
      name: newItem.name,
      quantity: parseInt(newItem.quantity),
      price: parseFloat(newItem.price) || 0,
      minLevel: parseInt(newItem.minStock) || 5,
      active: true,
      category: 'Retail'
    };

    // Save to DB (using generic 'add' would be cleaner, but matching request pattern)
    // We fetch list, push, and save to mimic db.add logic but specifically for shared.getInventory array structure if needed
    // However, best to use db.add if possible, but db.shared.getInventory returns list directly.
    // Let's rely on db.ts structure. shared.getInventory is a GET.
    // We will use db.save('INVENTORY', list) for now as implemented in the prompt.
    
    const list = await db.shared.getInventory();
    const newProduct = { ...product, id: Date.now().toString() };
    list.push(newProduct);
    await db.save('INVENTORY', list);
    
    setNewItem({ name: '', quantity: '', price: '', minStock: '' });
    setShowAdd(false);
    loadInventory();
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this product?")) return;
    const list = products.filter(p => p.id !== id);
    await db.save('INVENTORY', list);
    loadInventory();
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold luxury-font text-white">Inventory & Stock</h2>
          <p className="text-gray-500 text-sm">Manage salon products and retail items</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-[#D4AF37] hover:bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {/* ADD FORM */}
      {showAdd && (
        <div className="bg-[#2C2C2C] p-6 rounded-2xl border border-gray-700 mb-8 flex flex-col md:flex-row gap-4 items-end shadow-xl">
          <div className="flex-1 w-full">
            <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Product Name</label>
            <input className="w-full bg-[#1a1a1a] p-3 rounded-xl border border-gray-600 text-white outline-none focus:border-[#D4AF37]" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="e.g. L'Oreal Shampoo" />
          </div>
          <div className="w-full md:w-32">
            <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Stock Qty</label>
            <input type="number" className="w-full bg-[#1a1a1a] p-3 rounded-xl border border-gray-600 text-white outline-none focus:border-[#D4AF37]" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})} placeholder="0" />
          </div>
          <div className="w-full md:w-32">
            <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Price (₹)</label>
            <input type="number" className="w-full bg-[#1a1a1a] p-3 rounded-xl border border-gray-600 text-white outline-none focus:border-[#D4AF37]" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} placeholder="0" />
          </div>
          <button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold w-full md:w-auto">Save</button>
        </div>
      )}

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
        <input 
          className="w-full bg-[#111] border border-white/10 pl-12 p-4 rounded-2xl text-white outline-none focus:border-[#D4AF37] transition-all"
          placeholder="Search products..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="p-6">Product Name</th>
              <th className="p-6">Stock Level</th>
              <th className="p-6">Price</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-white/5 transition">
                <td className="p-6 font-bold text-white">{p.name}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${p.quantity < (p.minLevel || 5) ? 'bg-red-900/30 text-red-400 border border-red-500/30' : 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30'}`}>
                    {p.quantity} Units
                  </span>
                  {p.quantity < (p.minLevel || 5) && (
                    <span className="ml-3 text-red-500 text-xs inline-flex items-center gap-1 font-bold">
                      <AlertCircle size={12}/> Low Stock
                    </span>
                  )}
                </td>
                <td className="p-6 text-[#D4AF37] font-bold">₹{p.price}</td>
                <td className="p-6 text-right">
                  <button onClick={() => handleDelete(p.id)} className="text-gray-500 hover:text-red-500 p-2 transition-colors">
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
             <Package size={48} className="mb-4 opacity-20" />
             <p className="text-sm uppercase tracking-widest font-bold">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
