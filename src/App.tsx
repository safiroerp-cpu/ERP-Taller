import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ERPProvider, useERP } from './context/ERPContext';
import { GoogleDriveProvider, useGoogleDrive } from './context/GoogleDriveContext';
import { LoginView } from './components/auth/LoginView';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { AppointmentsManager } from './components/appointments/AppointmentsManager';
import { VehicleInspectionChecklist } from './components/reception/VehicleInspectionChecklist';
import { TechnicalDiagnosisManager } from './components/diagnosis/TechnicalDiagnosisManager';
import { QuotationManager } from './components/quotations/QuotationManager';
import { InventoryManager } from './components/inventory/InventoryManager';
import { WorkshopFloorBoard } from './components/workshop/WorkshopFloorBoard';
import { TechniciansManager } from './components/technicians/TechniciansManager';
import { VehicleHistoryModal } from './components/vehicles/VehicleHistoryModal';
import { GoogleDriveManagerModal } from './components/drive/GoogleDriveManagerModal';
import { Menu, X, RefreshCw } from 'lucide-react';

function ERPAppShell() {
  const { isDriveModalOpen, closeDriveModal } = useGoogleDrive();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historySearchPlate, setHistorySearchPlate] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenHistory = (plate?: string) => {
    setHistorySearchPlate(plate || '');
    setIsHistoryModalOpen(true);
  };

  const handleGoToReceptionWithAppointment = (aptId: string) => {
    setCurrentTab('reception');
  };

  const renderActiveModule = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            onNavigateTab={tab => setCurrentTab(tab)} 
            onOpenHistorySearch={() => handleOpenHistory()} 
          />
        );
      case 'appointments':
        return (
          <AppointmentsManager 
            onGoToReceptionWithAppointment={handleGoToReceptionWithAppointment} 
          />
        );
      case 'reception':
        return <VehicleInspectionChecklist />;
      case 'diagnosis':
        return <TechnicalDiagnosisManager />;
      case 'quotations':
        return <QuotationManager />;
      case 'inventory':
        return <InventoryManager />;
      case 'workshop':
        return <WorkshopFloorBoard />;
      case 'technicians':
        return <TechniciansManager />;
      default:
        return (
          <DashboardOverview 
            onNavigateTab={tab => setCurrentTab(tab)} 
            onOpenHistorySearch={() => handleOpenHistory()} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row antialiased bg-slate-950 text-slate-100">
      {/* Mobile Navigation Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
            SG
          </div>
          <div>
            <span className="font-bold text-white text-sm block leading-tight">SAFIRO GROUP</span>
            <span className="text-[10px] text-blue-400 font-bold block leading-none">Taller Automotriz</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex">
          <div className="w-72 bg-slate-950 h-full p-4 border-r border-slate-800 flex flex-col justify-between">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={tab => {
                setCurrentTab(tab);
                setIsMobileMenuOpen(false);
              }}
              onOpenHistorySearch={() => {
                handleOpenHistory();
                setIsMobileMenuOpen(false);
              }}
            />
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => setCurrentTab(tab)}
          onOpenHistorySearch={() => handleOpenHistory()}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          onOpenHistorySearch={handleOpenHistory}
          onNewReception={() => setCurrentTab('reception')}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveModule()}
        </main>
      </div>

      {/* Universal History / Clinical File Modal */}
      <VehicleHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        initialPlate={historySearchPlate}
      />

      {/* Global Google Drive Modal */}
      <GoogleDriveManagerModal
        isOpen={isDriveModalOpen}
        onClose={closeDriveModal}
      />
    </div>
  );
}

function AuthenticationGate() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-xl shadow-blue-600/30">
          SG
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
          <span>Iniciando SAFIRO GROUP ERP...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <ERPProvider>
      <GoogleDriveProvider>
        <ERPAppShell />
      </GoogleDriveProvider>
    </ERPProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticationGate />
    </AuthProvider>
  );
}
