
import React, { useState, useEffect } from 'react';
import { AppView, ChairStatus } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './modules/Dashboard';
import SalonFloor from './modules/SalonFloor';
import POS from './modules/POS';
import Services from './modules/Services';
import Invoices from './modules/Invoices';
import CRM from './modules/CRM';
import Reports from './modules/Reports';
import StaffManagement from './modules/StaffManagement';
import ClinicSuite from './modules/ClinicSuite';
import FormulaVault from './modules/FormulaVault';
import Settings from './modules/Settings';
import Developer from './modules/Developer';
import TabletMode from './modules/TabletMode';
import Inventory from './modules/Inventory'; // ✅ Import Inventory
import { db } from './services/db';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      // Check if chairs exist, if not, create default layout
      const chairs = await db.get<any>('CHAIRS');
      if (chairs.length === 0) {
        const defaultChairs = Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          status: ChairStatus.IDLE,
          services: []
        }));
        await db.save('CHAIRS', defaultChairs);
      }
      setLoading(false);
    };
    initialize();
  }, []);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard />;
      case AppView.SALON_FLOOR: return <SalonFloor onSelectChair={(id) => setCurrentView(AppView.POS)} />;
      case AppView.POS: return <POS />;
      case AppView.QUICK_BILLING: return <POS quickMode />;
      case AppView.SERVICES: return <Services />;
      case AppView.INVENTORY: return <Inventory />; // ✅ Route for Inventory
      case AppView.INVOICES: return <Invoices />;
      case AppView.CUSTOMERS: return <CRM />;
      case AppView.REPORTS: return <Reports />;
      case AppView.STAFF: return <StaffManagement />;
      case AppView.CLINIC: return <ClinicSuite />;
      case AppView.FORMULAS: return <FormulaVault />;
      case AppView.SETTINGS: return <Settings />;
      case AppView.DEVELOPER: return <Developer />;
      case AppView.TABLET: return <TabletMode />;
      default: return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#1a1a1a] text-white">
        <div className="luxury-font text-4xl mb-4 animate-pulse text-gold">TS SALON</div>
        <div className="text-sm tracking-widest text-gray-400 uppercase">Aesthetics & Clinic OS</div>
      </div>
    );
  }

  const isTabletMode = currentView === AppView.TABLET;

  return (
    <div className="flex h-screen bg-[#1a1a1a] overflow-hidden">
      {/* Fixed Sidebar - Hidden in Tablet Mode */}
      {!isTabletMode && (
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen}
        />
      )}
      
      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-w-0 bg-[#0f0f0f] ${!isTabletMode ? 'border-l border-white/5' : ''} transition-all duration-300`}>
        {/* Global Header - Hidden in Tablet Mode */}
        {!isTabletMode && (
          <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-[#1a1a1a]/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
              </button>
              <h1 className="text-lg font-medium tracking-tight text-white capitalize">
                {currentView.replace('-', ' ')}
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Odisha, IN</div>
                <div className="text-sm text-gray-200">TS Admin</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gold to-yellow-700 flex items-center justify-center text-black font-bold shadow-lg shadow-amber-900/20">
                TS
              </div>
            </div>
          </header>
        )}

        {/* Dynamic View Content */}
        <div className={`flex-1 overflow-y-auto ${isTabletMode ? 'p-0' : 'p-8'}`}>
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
