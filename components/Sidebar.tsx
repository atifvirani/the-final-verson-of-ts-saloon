
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: AppView.SALON_FLOOR, label: 'Salon Floor', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { id: AppView.POS, label: 'Billing / POS', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: AppView.QUICK_BILLING, label: 'Quick Billing', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: AppView.SERVICES, label: 'Services', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: AppView.INVENTORY, label: 'Stock & Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' }, // ✅ Added Inventory Icon
    { id: AppView.INVOICES, label: 'Invoices', icon: 'M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: AppView.CUSTOMERS, label: 'Customers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: AppView.STAFF, label: 'Staffing', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: AppView.CLINIC, label: 'Clinic Suite', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: AppView.FORMULAS, label: 'Formulas', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { id: AppView.REPORTS, label: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: AppView.SETTINGS, label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: AppView.DEVELOPER, label: 'System Control', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { id: AppView.TABLET, label: 'Tablet Mode', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' }, // ✅ Added Tablet Mode Icon
  ];

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-0'} bg-[#1a1a1a] flex flex-col transition-all duration-300 overflow-hidden border-r border-white/5`}>
      <div className="p-6 text-center border-b border-gray-800">
        <h1 className="text-2xl font-bold text-[#D4AF37] tracking-wider luxury-font">TS SALON</h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Clinical Aesthetics</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto mt-4 px-4 space-y-1 custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all group ${
              currentView === item.id 
                ? 'bg-gold/10 text-gold font-medium' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg className={`w-5 h-5 ${currentView === item.id ? 'text-gold' : 'text-gray-500 group-hover:text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
            </svg>
            <span className="whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="bg-[#111] rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">System Version</div>
          <div className="text-xs text-gray-300 font-mono">v5.0-INDIA</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
