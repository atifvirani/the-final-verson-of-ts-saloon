
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Service, Staff, Customer, PaymentMode, Invoice } from '../types';

const POS: React.FC<{ quickMode?: boolean }> = ({ quickMode = false }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<Array<{ service: Service; staff: Staff }>>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.UPI);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setServices(await db.get<Service>('SERVICES'));
      setStaff(await db.get<Staff>('STAFF'));
      setCustomers(await db.get<Customer>('CUSTOMERS'));
    };
    fetchData();
  }, []);

  const addToCart = (svc: Service) => {
    const defaultStaff = staff[0];
    if (defaultStaff) {
      setCart([...cart, { service: svc, staff: defaultStaff }]);
    }
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((acc, item) => acc + item.service.price, 0);
    return subtotal - discount;
  };

  const finalizeBill = async () => {
    if (cart.length === 0) return;
    
    const invoice: Invoice = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      date: Date.now(),
      customerId: selectedCustomer?.id || 'WALK-IN',
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      customerPhone: selectedCustomer?.phone || '',
      services: cart.map(item => ({
        serviceId: item.service.id,
        name: item.service.name,
        price: item.service.price,
        staffId: item.staff.id,
        staffName: item.staff.name
      })),
      subtotal: cart.reduce((acc, item) => acc + item.service.price, 0),
      discount,
      tax: 0, // Tax logic can be enhanced if needed
      total: calculateTotal(),
      paymentMode,
      isClinic: false
    };

    // 1. Save Invoice
    await db.add('INVOICES', invoice);
    
    // 2. Deduct Inventory (Audit Fix)
    // Matches service name to inventory item name
    const inventory = await db.shared.getInventory();
    let inventoryChanged = false;

    cart.forEach(cartItem => {
      const stockItemIndex = inventory.findIndex(i => i.name === cartItem.service.name);
      if (stockItemIndex !== -1 && inventory[stockItemIndex].quantity > 0) {
        inventory[stockItemIndex].quantity -= 1;
        inventoryChanged = true;
      }
    });

    if (inventoryChanged) {
        await db.save('INVENTORY', inventory);
    }
    
    if (selectedCustomer) {
      await db.update<Customer>('CUSTOMERS', selectedCustomer.id, {
        visitCount: (selectedCustomer.visitCount || 0) + 1,
        totalSpent: (selectedCustomer.totalSpent || 0) + invoice.total
      });
    }

    alert(`Invoice ${invoice.id} Generated Successfully!`);
    setCart([]);
    setSelectedCustomer(null);
    setDiscount(0);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)] overflow-hidden">
      {/* Left: Service Selection */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {services.map(svc => (
            <button
              key={svc.id}
              onClick={() => addToCart(svc)}
              className="bg-[#111] border border-white/5 hover:border-gold hover:bg-gold/5 p-6 rounded-2xl text-left transition-all group"
            >
              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{svc.category}</div>
              <div className="text-gray-100 font-bold group-hover:text-gold transition-colors">{svc.name}</div>
              <div className="text-xl font-bold text-gray-400 mt-2">₹{svc.price}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="w-full lg:w-[400px] flex flex-col bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-white/5">
          <h3 className="text-lg font-bold text-white mb-4">Checkout Session</h3>
          
          <div className="space-y-4">
            <select 
              onChange={e => {
                const c = customers.find(cu => cu.id === e.target.value);
                setSelectedCustomer(c || null);
              }}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none focus:border-gold"
            >
              <option value="">Select Customer (CRM)</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              <p className="text-sm font-bold uppercase tracking-widest">Cart is Empty</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start bg-black/40 p-4 rounded-2xl border border-white/5">
                <div>
                  <div className="text-xs font-bold text-gray-200">{item.service.name}</div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    {item.staff.name}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-bold text-gold">₹{item.service.price}</div>
                  <button onClick={() => removeFromCart(idx)} className="text-gray-600 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-black/60 border-t border-white/5 space-y-4">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Subtotal</span>
            <span>₹{cart.reduce((acc, item) => acc + item.service.price, 0)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Discount</span>
            <input 
              type="number" 
              value={discount}
              onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
              className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-right text-white font-bold"
            />
          </div>
          <div className="pt-4 flex justify-between items-end">
            <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total Payable</div>
            <div className="text-3xl font-bold text-white luxury-font">₹{calculateTotal()}</div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6">
            <button 
              onClick={() => setPaymentMode(PaymentMode.UPI)}
              className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${paymentMode === PaymentMode.UPI ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
            >
              UPI / SCAN
            </button>
            <button 
              onClick={() => setPaymentMode(PaymentMode.CARD)}
              className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${paymentMode === PaymentMode.CARD ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
            >
              CARD
            </button>
            <button 
              onClick={() => setPaymentMode(PaymentMode.CASH)}
              className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${paymentMode === PaymentMode.CASH ? 'bg-gold border-gold text-black' : 'bg-white/5 border-white/10 text-gray-400'}`}
            >
              CASH
            </button>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={finalizeBill}
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/20"
          >
            GENERATE INVOICE (GST)
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
