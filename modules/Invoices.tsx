
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Invoice } from '../types';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = invoices.filter(inv => 
      inv.id.toLowerCase().includes(term) ||
      inv.customerName.toLowerCase().includes(term) ||
      inv.customerPhone.includes(term)
    );
    setFilteredInvoices(filtered.reverse());
  }, [searchTerm, invoices]);

  const loadInvoices = async () => {
    const data = await db.get<Invoice>('INVOICES');
    setInvoices(data);
    setFilteredInvoices(data.reverse());
  };

  const handlePrint = (invoice: Invoice) => {
    alert(`Printing Invoice #${invoice.id}...`);
  };

  const handleWhatsApp = (invoice: Invoice) => {
    alert(`Sending Invoice #${invoice.id} to ${invoice.customerPhone} via WhatsApp...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold luxury-font text-white">Invoice History</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search invoice #, name or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-[#111] border border-white/10 rounded-2xl px-10 py-3 text-sm text-gray-200 w-80 focus:border-gold outline-none transition-all"
          />
          <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-white/5 text-gray-400 uppercase text-[10px] tracking-widest font-bold">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Invoice #</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Services</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredInvoices.map(inv => (
              <tr key={inv.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                  {new Date(inv.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-bold text-gray-200">{inv.id}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-300">{inv.customerName}</div>
                  <div className="text-[10px] text-gray-500">{inv.customerPhone}</div>
                </td>
                <td className="px-6 py-4 text-gray-400 text-xs">
                  {inv.services.length} items
                </td>
                <td className="px-6 py-4 text-right font-bold text-emerald-500 text-lg">
                  ₹{inv.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500">
                    Paid
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedInvoice(inv)}
                    className="text-gold hover:text-yellow-400 font-bold text-xs uppercase tracking-wider"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No invoices found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 bg-[#111] flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold luxury-font text-white mb-1">Invoice Details</h3>
                <p className="text-gray-500 text-sm font-mono">{selectedInvoice.id} • {new Date(selectedInvoice.date).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex justify-between p-4 bg-white/5 rounded-2xl">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Billed To</div>
                  <div className="font-bold text-lg text-white">{selectedInvoice.customerName}</div>
                  <div className="text-sm text-gray-400">{selectedInvoice.customerPhone}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Payment Method</div>
                  <div className="font-bold text-lg text-white uppercase">{selectedInvoice.paymentMode}</div>
                </div>
              </div>

              <div className="border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3 text-left">Service</th>
                      <th className="px-4 py-3 text-left">Staff</th>
                      <th className="px-4 py-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedInvoice.services.map((svc, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-white font-medium">{svc.name}</td>
                        <td className="px-4 py-3 text-gray-400">{svc.staffName}</td>
                        <td className="px-4 py-3 text-right text-white">₹{svc.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-y-2">
                <div className="w-48 space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{selectedInvoice.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Discount</span>
                    <span className="text-red-400">-₹{selectedInvoice.discount}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span>₹{selectedInvoice.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#111] border-t border-white/5 flex gap-4">
              <button 
                onClick={() => handlePrint(selectedInvoice)}
                className="flex-1 bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Reprint Invoice
              </button>
              <button 
                onClick={() => handleWhatsApp(selectedInvoice)}
                className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
