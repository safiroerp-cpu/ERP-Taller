import React from 'react';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  ClipboardCheck, 
  Cpu, 
  FileSpreadsheet, 
  Package, 
  GitFork, 
  Users, 
  Search, 
  Wrench, 
  Car, 
  ChevronRight,
  Cloud,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useGoogleDrive } from '../../context/GoogleDriveContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenHistorySearch: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenHistorySearch
}) => {
  const { stats } = useERP();
  const { currentUser, userRole, getRoleLabel } = useAuth();
  const { isConnected, openDriveModal, accountEmail } = useGoogleDrive();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard & KPIs',
      icon: LayoutDashboard,
      badge: 'KPI',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    {
      id: 'appointments',
      label: 'Citas de Taller',
      icon: Calendar,
      badge: stats.scheduledAppointmentsCount > 0 ? stats.scheduledAppointmentsCount : null,
      badgeColor: 'bg-purple-900/60 text-purple-300 border-purple-700/50'
    },
    {
      id: 'reception',
      label: 'Recepción 360° (Check-in)',
      icon: ClipboardCheck,
      badge: null
    },
    {
      id: 'diagnosis',
      label: 'Diagnóstico Técnico',
      icon: Cpu,
      badge: null
    },
    {
      id: 'quotations',
      label: 'Cotizaciones',
      icon: FileSpreadsheet,
      badge: stats.pendingQuotationsCount > 0 ? stats.pendingQuotationsCount : null,
      badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700/50'
    },
    {
      id: 'inventory',
      label: 'Almacén de Repuestos',
      icon: Package,
      badge: stats.lowStockPartsCount > 0 ? `${stats.lowStockPartsCount} bajo` : null,
      badgeColor: 'bg-rose-900/60 text-rose-300 border-rose-700/50'
    },
    {
      id: 'workshop',
      label: 'Control de Piso (Kanban)',
      icon: GitFork,
      badge: stats.inWorkshopCount > 0 ? stats.inWorkshopCount : null,
      badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-700/50'
    },
    {
      id: 'technicians',
      label: 'Técnicos & Equipo',
      icon: Users,
      badge: null
    }
  ];

  const roleBadgeStyle = {
    admin: 'bg-blue-600/20 text-blue-300 border-blue-500/40',
    advisor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    technician: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    inventory: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
  }[userRole] || 'bg-slate-800 text-slate-300';

  return (
    <aside className="no-print w-64 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-black text-xs">
              SG
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white tracking-tight leading-tight">
                SAFIRO GROUP
              </h1>
              <span className="text-[10px] text-blue-400 block font-bold tracking-wide">
                Taller Automotriz
              </span>
            </div>
          </div>
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${roleBadgeStyle}`}>
            {userRole}
          </span>
        </div>

        {/* User Role Card banner */}
        <div className="px-3 pt-3 pb-1">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-[11px] font-bold text-slate-200 truncate leading-tight">
                  {currentUser?.displayName || 'Usuario'}
                </p>
                <p className="text-[9px] text-slate-400 truncate">
                  {getRoleLabel(userRole)}
                </p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Sesión Activa"></span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)]">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block mb-2">
            Módulos de Gestión
          </span>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                    isActive ? 'bg-blue-800 border-blue-400 text-white' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Search Action in Sidebar */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenHistorySearch}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-blue-400" />
                <span>Expediente por Placa</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Google Drive Account Status & Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={openDriveModal}
              className={`w-full p-2.5 rounded-xl border text-left transition-all group ${
                isConnected
                  ? 'bg-emerald-950/40 border-emerald-500/50 hover:border-emerald-400'
                  : 'bg-blue-950/40 border-blue-500/50 hover:border-blue-400 hover:bg-blue-950/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Cloud className={`w-4 h-4 ${isConnected ? 'text-emerald-400' : 'text-blue-400'}`} />
                  <span className="text-xs font-bold text-white group-hover:text-blue-300">
                    Google Drive
                  </span>
                </div>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono truncate">
                safiro.erp@gmail.com
              </p>
              <span className={`text-[10px] font-semibold mt-1 inline-block ${
                isConnected ? 'text-emerald-400' : 'text-blue-400'
              }`}>
                {isConnected ? '✓ Drive Conectado' : '• Conectar cuenta aquí'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-400">SAFIRO GROUP v2.8</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Taller Operativo"></span>
        </div>
        <p className="text-[10px] text-slate-600">
          Taller Automotriz Especializado • Lima, Perú
        </p>
      </div>
    </aside>
  );
};
