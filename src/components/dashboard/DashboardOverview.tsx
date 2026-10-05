import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import { KpiDashboardView } from './KpiDashboardView';
import { SummaryStatisticsPanel } from './SummaryStatisticsPanel';
import { 
  Car, 
  Calendar, 
  Wrench, 
  Package, 
  Search, 
  ArrowRight, 
  TrendingUp, 
  CheckCheck,
  BarChart3,
  LayoutDashboard,
  Cloud,
  FileSpreadsheet,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { useGoogleDrive } from '../../context/GoogleDriveContext';

interface DashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
  onOpenHistorySearch: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab,
  onOpenHistorySearch
}) => {
  const { isConnected, openDriveModal } = useGoogleDrive();
  const { currentUser, userRole, getRoleLabel } = useAuth();
  const { 
    stats, 
    workOrders, 
    parts, 
    appointments, 
    getVehicle, 
    getCustomer, 
    getTechnician,
    resetToDemoData,
    exportDatabaseJSON,
    formatCurrency
  } = useERP();

  const [dashboardTab, setDashboardTab] = useState<'operations' | 'kpi'>('kpi');

  const activeOrders = workOrders
    .filter(ot => ot.currentStage !== 'entregado')
    .slice(0, 5);

  const lowStockParts = parts
    .filter(p => p.stock <= p.minStock)
    .slice(0, 4);

  const upcomingAppointments = appointments
    .filter(a => a.status === 'Agendada')
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block">
              Panel de Operaciones Diarias
            </span>
            <span className="text-[10px] text-slate-500">•</span>
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              Bienvenido, <strong className="text-white">{currentUser?.displayName || 'Usuario'}</strong> ({getRoleLabel(userRole)})
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
            SAFIRO GROUP • Taller Automotriz
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Recepción vehicular 360° (Autos, Camionetas, Furgones y Camiones), diagnóstico técnico y cotizaciones
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenHistorySearch}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-blue-400" />
            Buscar Placa
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('reception')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Car className="w-3.5 h-3.5" />
            Nuevo Ingreso (Check-list)
          </button>
          <button
            type="button"
            onClick={openDriveModal}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold border flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
              isConnected
                ? 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-500/50'
                : 'bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white border-blue-400/60 shadow-blue-500/20'
            }`}
            title="Integración oficial con Google Drive (safiro.erp@gmail.com)"
          >
            <Cloud className={`w-4 h-4 ${isConnected ? 'text-emerald-400' : 'text-white'}`} />
            <span>{isConnected ? 'Drive Conectado' : 'Google Drive (safiro.erp)'}</span>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-300'}`}></span>
          </button>
        </div>
      </div>

      {/* Summary Statistics Panel with D3 Charts for Key Performance Indicators */}
      <SummaryStatisticsPanel onNavigateTab={onNavigateTab} />

      {/* Tab Switcher: KPI Dashboard vs Operaciones en Vivo */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setDashboardTab('kpi')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              dashboardTab === 'kpi'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>KPI Dashboard</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold">
              En Tiempo Real
            </span>
          </button>
          <button
            type="button"
            onClick={() => setDashboardTab('operations')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              dashboardTab === 'operations'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Operaciones en Vivo</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-900 text-white font-mono">
              {stats.inWorkshopCount} activas
            </span>
          </button>
        </div>

        {dashboardTab === 'operations' && (
          <span className="text-xs text-slate-400 hidden sm:inline">
            Vehículos en taller: <strong className="text-white font-mono">{stats.inWorkshopCount}</strong> • Citas hoy: <strong className="text-white font-mono">{stats.scheduledAppointmentsCount}</strong>
          </span>
        )}
      </div>

      {/* Main Tab Content */}
      {dashboardTab === 'kpi' ? (
        <KpiDashboardView onNavigateTab={onNavigateTab} />
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div 
              onClick={() => onNavigateTab('workshop')}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 cursor-pointer hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">En Taller</span>
                <Car className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono text-white">{stats.inWorkshopCount}</span>
                <span className="text-[10px] text-blue-400 font-medium">Activos</span>
              </div>
            </div>

            <div 
              onClick={() => onNavigateTab('appointments')}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 cursor-pointer hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Citas Hoy</span>
                <Calendar className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono text-white">{stats.scheduledAppointmentsCount}</span>
                <span className="text-[10px] text-purple-400 font-medium">Por recibir</span>
              </div>
            </div>

            <div 
              onClick={() => onNavigateTab('quotations')}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 cursor-pointer hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Cotizaciones</span>
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono text-white">{stats.pendingQuotationsCount}</span>
                <span className="text-[10px] text-amber-400 font-medium">Pendientes</span>
              </div>
            </div>

            <div 
              onClick={() => onNavigateTab('inventory')}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 cursor-pointer hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Repuestos</span>
                <Package className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono text-white">{stats.lowStockPartsCount}</span>
                <span className="text-[10px] text-rose-400 font-medium">Bajo Stock</span>
              </div>
            </div>

            <div 
              onClick={() => onNavigateTab('workshop')}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 cursor-pointer hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Entregados</span>
                <CheckCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono text-white">{stats.deliveredTodayCount}</span>
                <span className="text-[10px] text-emerald-400 font-medium">Histórico</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Facturado Mes</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black font-mono text-emerald-400">
                  {formatCurrency(stats.activeRevenueMonth)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Aprobado</span>
              </div>
            </div>
          </div>

          {/* Main Grid: Active Units in Workshop vs Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Active Workshop Units */}
            <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-blue-400" />
                    Unidades en Proceso en Taller ({stats.inWorkshopCount})
                  </h3>
                  <p className="text-xs text-slate-400">Seguimiento por orden de trabajo y bahía de servicio</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('workshop')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                >
                  Ver Tablero Completo <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {activeOrders.map(ot => {
                  const veh = getVehicle(ot.vehicleId);
                  const cust = getCustomer(ot.customerId);
                  const tech = getTechnician(ot.technicianId);

                  const stageBadge = {
                    recepcion: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                    diagnostico: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                    cotizacion_pendiente: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                    en_reparacion: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
                    espera_repuestos: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
                    control_calidad: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
                    listo_entrega: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                    entregado: 'bg-slate-700 text-slate-300 border-slate-600'
                  }[ot.currentStage];

                  return (
                    <div
                      key={ot.id}
                      className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-400">{ot.code}</span>
                          <span className="font-mono px-2 py-0.5 bg-slate-900 text-amber-300 border border-amber-500/30 rounded font-semibold text-xs tracking-wider">
                            {veh?.plate}
                          </span>
                          <span className="font-semibold text-slate-200">
                            {veh?.brand} {veh?.model}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Cliente: {cust?.name} • Bahía: <strong className="text-slate-300">{ot.bayLocation}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400">
                          Téc: <strong className="text-slate-200">{tech ? tech.name.split(' ')[0] : 'Por asignar'}</strong>
                        </span>
                        <span className={`px-2 py-1 rounded text-[10px] font-semibold border ${stageBadge} capitalize`}>
                          {ot.currentStage.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Low Stock & Upcoming Appointments */}
            <div className="lg:col-span-4 space-y-4">
              {/* Low Stock Alerts */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Alertas de Stock Crítico ({stats.lowStockPartsCount})
                  </h4>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('inventory')}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    Almacén
                  </button>
                </div>

                {lowStockParts.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No hay alertas de stock bajo actualmente.</p>
                ) : (
                  <div className="space-y-2">
                    {lowStockParts.map(part => (
                      <div
                        key={part.id}
                        className="p-2.5 bg-slate-950/70 border border-amber-900/30 rounded-lg text-xs flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-slate-200">{part.name}</p>
                          <span className="text-[10px] font-mono text-slate-400">SKU: {part.sku} • {part.brand}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-rose-400 font-bold block">{part.stock} un.</span>
                          <span className="text-[9px] text-slate-500">Mínimo: {part.minStock}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    Próximas Citas Agendadas
                  </h4>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('appointments')}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    Ver Todas
                  </button>
                </div>

                <div className="space-y-2">
                  {upcomingAppointments.map(apt => {
                    const veh = getVehicle(apt.vehicleId);
                    const cust = getCustomer(apt.customerId);
                    return (
                      <div
                        key={apt.id}
                        className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-amber-300">{veh?.plate}</span>
                            <span className="text-slate-200">{cust?.name.split(' ')[0]}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate">{apt.serviceType}</span>
                        </div>
                        <div className="text-right font-mono text-[11px]">
                          <span className="text-blue-400 font-semibold block">{apt.scheduledTime}</span>
                          <span className="text-slate-500 text-[10px]">{apt.scheduledDate}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Backup / Export / Reset Widget */}
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Gestión de Base de Datos:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportDatabaseJSON()}
                    className="text-[11px] text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700"
                    title="Descargar copia de seguridad en JSON"
                  >
                    Exportar JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('¿Restablecer el ERP a los datos iniciales de demostración?')) {
                        resetToDemoData();
                      }
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-slate-800"
                  >
                    Reset Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
