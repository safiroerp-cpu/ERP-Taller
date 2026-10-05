import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Car, 
  Search, 
  Plus, 
  ClipboardCheck, 
  Wrench, 
  Cloud, 
  CheckCircle2,
  LogOut,
  User,
  Sliders,
  ChevronDown,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useGoogleDrive } from '../../context/GoogleDriveContext';
import { UserProfileModal } from '../auth/UserProfileModal';

interface HeaderProps {
  currentTab: string;
  onOpenHistorySearch: (plate?: string) => void;
  onNewReception: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenHistorySearch,
  onNewReception
}) => {
  const { stats } = useERP();
  const { currentUser, userRole, getRoleLabel, logout } = useAuth();
  const { isConnected, accountEmail, openDriveModal } = useGoogleDrive();
  const [quickPlate, setQuickPlate] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPlate.trim()) {
      onOpenHistorySearch(quickPlate.trim());
      setQuickPlate('');
    }
  };

  const titles: Record<string, string> = {
    dashboard: 'Panel General de Operaciones & KPIs',
    appointments: 'Gestión de Citas',
    reception: 'Recepción 360° & Check-list de Ingreso',
    diagnosis: 'Diagnóstico Técnico & Escáner',
    quotations: 'Cotizaciones & Proformas (S/)',
    inventory: 'Almacén de Repuestos & Kardex',
    workshop: 'Control de Piso (Kanban de Taller)',
    technicians: 'Técnicos & Mecánicos'
  };

  const roleStyles = {
    admin: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    advisor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    technician: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    inventory: 'bg-purple-500/20 text-purple-400 border-purple-500/40'
  }[userRole] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <header className="no-print h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Breadcrumb / Section Name */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-black text-white tracking-tight leading-tight">SAFIRO GROUP</span>
          <span className="text-[10px] text-blue-400 font-bold tracking-wide leading-none">Taller</span>
        </div>
        <span className="text-slate-600">/</span>
        <span className="text-xs sm:text-sm font-bold text-slate-200 tracking-tight truncate max-w-[180px] sm:max-w-none">
          {titles[currentTab] || 'Dashboard'}
        </span>
      </div>

      {/* Center: Global Quick Plate / VIN Search */}
      <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center gap-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar Placa o VIN (ej: BCF-418)..."
            value={quickPlate}
            onChange={e => setQuickPlate(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-44 uppercase font-mono font-medium"
          />
        </div>
        <button
          type="submit"
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
        >
          Expediente
        </button>
      </form>

      {/* Right: Quick Action & Indicators & USER MENU */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Google Drive Status & Connection Button */}
        <button
          type="button"
          onClick={openDriveModal}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm border cursor-pointer ${
            isConnected
              ? 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-500/50'
              : 'bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border-blue-500/50 hover:border-blue-400'
          }`}
          title={isConnected ? `Conectado a Google Drive (${accountEmail || 'safiro.erp@gmail.com'})` : 'Conectar con Google Drive (safiro.erp@gmail.com)'}
        >
          <Cloud className={`w-4 h-4 shrink-0 ${isConnected ? 'text-emerald-400' : 'text-blue-400'}`} />
          <span className="font-bold whitespace-nowrap hidden sm:inline">
            {isConnected ? 'Drive' : 'Google Drive'}
          </span>
          <span className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
        </button>

        {/* New Reception quick action */}
        <button
          type="button"
          onClick={onNewReception}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Recepción 360°</span>
          <span className="sm:hidden">Ingreso</span>
        </button>

        {/* Low Stock Indicator */}
        {stats.lowStockPartsCount > 0 && (
          <div 
            className="hidden xl:flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-mono font-medium"
            title={`${stats.lowStockPartsCount} repuestos bajo stock`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>{stats.lowStockPartsCount} repuestos bajo stock</span>
          </div>
        )}

        {/* AUTHENTICATED USER DROPDOWN */}
        <div className="relative pl-1 sm:pl-2 border-l border-slate-800">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 border border-blue-400/40 flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0">
              {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'SG'}
            </div>
            <div className="hidden md:block">
              <span className="font-bold text-xs text-slate-100 block leading-tight max-w-[110px] truncate">
                {currentUser?.displayName || 'Usuario'}
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold inline-block ${roleStyles}`}>
                {currentUser?.role || 'Personal'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div 
              onClick={() => setIsUserMenuOpen(false)}
              className="fixed inset-0 z-40"
            >
              <div 
                onClick={e => e.stopPropagation()}
                className="absolute right-4 top-16 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1 backdrop-blur-xl"
              >
                {/* User Info Header */}
                <div className="p-3 border-b border-slate-800 bg-slate-950/70 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white text-xs truncate">
                      {currentUser?.displayName}
                    </p>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono font-bold uppercase ${roleStyles}`}>
                      {currentUser?.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    {currentUser?.email}
                  </p>
                  <p className="text-[10px] text-blue-400 font-medium">
                    {getRoleLabel(userRole)}
                  </p>
                </div>

                {/* Menu items */}
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors font-medium"
                >
                  <User className="w-4 h-4 text-blue-400" />
                  <span>Mi Perfil & Credenciales</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors font-medium"
                >
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Cambiar / Simular Rol</span>
                </button>

                <div className="border-t border-slate-800 my-1"></div>

                <button
                  type="button"
                  onClick={async () => {
                    setIsUserMenuOpen(false);
                    await logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-300 hover:text-white hover:bg-rose-950/50 rounded-xl transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};
