import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  TrendingUp, 
  Users, 
  Wrench, 
  DollarSign, 
  Activity, 
  BarChart3, 
  ArrowUpRight, 
  Download, 
  Layers, 
  ChevronRight 
} from 'lucide-react';

interface KpiDashboardViewProps {
  onNavigateTab: (tab: string) => void;
}

export const KpiDashboardView: React.FC<KpiDashboardViewProps> = ({ onNavigateTab }) => {
  const { 
    stats, 
    workOrders, 
    technicians, 
    quotations, 
    vehicles, 
    formatCurrency 
  } = useERP();

  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');
  const [activeChartPoint, setActiveChartPoint] = useState<number | null>(null);

  // 1. CALCULATE REAL-TIME METRICS
  const activeWorkOrders = useMemo(() => {
    return workOrders.filter(ot => ot.currentStage !== 'entregado');
  }, [workOrders]);

  const totalActiveRepairs = activeWorkOrders.length;

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {
      recepcion: 0,
      diagnostico: 0,
      cotizacion_pendiente: 0,
      en_reparacion: 0,
      espera_repuestos: 0,
      control_calidad: 0,
      listo_entrega: 0
    };
    activeWorkOrders.forEach(ot => {
      if (counts[ot.currentStage] !== undefined) {
        counts[ot.currentStage]++;
      }
    });
    return counts;
  }, [activeWorkOrders]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      sedan: 0,
      suv_pickup: 0,
      furgon: 0,
      camion: 0
    };
    activeWorkOrders.forEach(ot => {
      const veh = vehicles.find(v => v.id === ot.vehicleId);
      const cat = veh?.category || 'suv_pickup';
      if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts.suv_pickup++;
      }
    });
    return counts;
  }, [activeWorkOrders, vehicles]);

  // 2. MECHANIC UTILIZATION RATE
  const technicianStats = useMemo(() => {
    return technicians.map(tech => {
      const assignedOrders = activeWorkOrders.filter(ot => ot.technicianId === tech.id);
      const allocatedHours = assignedOrders.length * 7.5;
      const capacityHours = 40; // weekly baseline
      const rawUtilization = (allocatedHours / capacityHours) * 100;
      const utilizationRate = Math.min(Math.round(rawUtilization), 100);
      return {
        ...tech,
        assignedCount: assignedOrders.length,
        allocatedHours,
        capacityHours,
        utilizationRate
      };
    });
  }, [technicians, activeWorkOrders]);

  const overallUtilizationRate = useMemo(() => {
    if (technicianStats.length === 0) return 0;
    const totalAllocated = technicianStats.reduce((sum, t) => sum + t.allocatedHours, 0);
    const totalCapacity = technicianStats.reduce((sum, t) => sum + t.capacityHours, 0);
    return Math.round((totalAllocated / totalCapacity) * 100);
  }, [technicianStats]);

  // 3. MONTHLY REVENUE CALCULATION
  const approvedQuotes = useMemo(() => {
    return quotations.filter(q => q.status === 'Aprobada');
  }, [quotations]);

  const currentMonthRevenue = useMemo(() => {
    const approvedTotal = approvedQuotes.reduce((sum, q) => sum + q.grandTotal, 0);
    return approvedTotal > 0 ? approvedTotal : stats.activeRevenueMonth;
  }, [approvedQuotes, stats.activeRevenueMonth]);

  const partsRevenue = useMemo(() => {
    return approvedQuotes.reduce((sum, q) => sum + q.subtotalParts, 0) || currentMonthRevenue * 0.58;
  }, [approvedQuotes, currentMonthRevenue]);

  const laborRevenue = useMemo(() => {
    return approvedQuotes.reduce((sum, q) => sum + q.subtotalLabor, 0) || currentMonthRevenue * 0.42;
  }, [approvedQuotes, currentMonthRevenue]);

  const averageTicket = useMemo(() => {
    const totalOrders = workOrders.length || 1;
    return Math.round(currentMonthRevenue / totalOrders);
  }, [workOrders, currentMonthRevenue]);

  const monthlyRevenueData = useMemo(() => {
    return [
      { month: 'May', label: 'Mayo', revenue: 38400, labor: 16100, parts: 22300, repairs: 24 },
      { month: 'Jun', label: 'Junio', revenue: 42100, labor: 17800, parts: 24300, repairs: 28 },
      { month: 'Jul', label: 'Julio', revenue: 49500, labor: 20200, parts: 29300, repairs: 32 },
      { month: 'Ago', label: 'Agosto', revenue: 46800, labor: 19100, parts: 27700, repairs: 29 },
      { month: 'Set', label: 'Septiembre', revenue: 53200, labor: 22400, parts: 30800, repairs: 35 },
      { month: 'Oct', label: 'Octubre (Actual)', revenue: Math.max(currentMonthRevenue, 58450), labor: laborRevenue, parts: partsRevenue, repairs: totalActiveRepairs + 18 }
    ];
  }, [currentMonthRevenue, laborRevenue, partsRevenue, totalActiveRepairs]);

  const revenueGoal = 65000;
  const goalProgress = Math.min(Math.round((currentMonthRevenue / revenueGoal) * 100), 100);

  const chartHeight = 180;
  const chartWidth = 540;
  const maxRevenueVal = Math.max(...monthlyRevenueData.map(d => d.revenue)) * 1.15;
  const points = monthlyRevenueData.map((d, index) => {
    const x = (index / (monthlyRevenueData.length - 1)) * (chartWidth - 60) + 30;
    const y = chartHeight - (d.revenue / maxRevenueVal) * (chartHeight - 40) - 20;
    return { x, y, ...d };
  });

  const pathData = points.reduce((acc, point, i) => {
    return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaData = `${pathData} L ${points[points.length - 1].x} ${chartHeight - 10} L ${points[0].x} ${chartHeight - 10} Z`;

  return (
    <div className="space-y-6">
      {/* Top Header & Timeframe Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Control Ejecutivo • SAFIRO GROUP
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            Tablero de Métricas & Indicadores KPI
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitoreo en tiempo real de reparaciones activas, productividad y carga de mecánicos, y facturación en Soles (S/)
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
            <button
              type="button"
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeframe === 'month'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mes Actual
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('quarter')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeframe === 'quarter'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Trimestre
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('year')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeframe === 'year'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Año 2026
            </button>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            title="Imprimir / Exportar Reporte Ejecutivo"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Core Hero KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* KPI 1: TOTAL ACTIVE REPAIRS */}
        <div 
          onClick={() => onNavigateTab('workshop')}
          className="bg-slate-900/90 border-2 border-slate-800 hover:border-blue-500/60 rounded-2xl p-5 shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-blue-400" />
              Reparaciones Activas
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              En Taller
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-4xl font-black font-mono text-white tracking-tight">
                {totalActiveRepairs}
              </span>
              <span className="text-xs text-slate-400 ml-1.5 font-medium">unidades en proceso</span>
            </div>
            <div className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +12.5%
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Capacidad de bahías: {totalActiveRepairs} / 8</span>
              <span>{Math.round((totalActiveRepairs / 8) * 100)}% ocupación</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalActiveRepairs / 8) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-blue-400 group-hover:text-blue-300 font-semibold">
            <span>Ver Kanban de Taller</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* KPI 2: MECHANIC UTILIZATION RATE */}
        <div 
          onClick={() => onNavigateTab('technicians')}
          className="bg-slate-900/90 border-2 border-slate-800 hover:border-amber-500/60 rounded-2xl p-5 shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              Tasa de Ocupación de Mecánicos
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Productividad
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-4xl font-black font-mono text-white tracking-tight">
                {overallUtilizationRate}%
              </span>
              <span className="text-xs text-slate-400 ml-1.5 font-medium">horas asignadas</span>
            </div>
            <div className="flex items-center text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              <Activity className="w-3.5 h-3.5 mr-0.5" /> Óptima
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{technicians.length} técnicos activos</span>
              <span>Meta ideal: 75% - 85%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  overallUtilizationRate > 85 ? 'bg-rose-500' : overallUtilizationRate >= 70 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${overallUtilizationRate}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 group-hover:text-amber-300 font-semibold">
            <span>Ver Directorio de Mecánicos</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* KPI 3: MONTHLY REVENUE */}
        <div 
          onClick={() => onNavigateTab('quotations')}
          className="bg-slate-900/90 border-2 border-slate-800 hover:border-emerald-500/60 rounded-2xl p-5 shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Facturación Mensual
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              S/ Soles
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                {formatCurrency(currentMonthRevenue)}
              </span>
            </div>
            <div className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +18.2%
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Meta: {formatCurrency(revenueGoal)}</span>
              <span>{goalProgress}% logrado</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 group-hover:text-emerald-300 font-semibold">
            <span>Ver Cotizaciones & Proformas</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 1: MONTHLY REVENUE TREND */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Evolución de Ingresos Mensuales (S/ Soles)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Facturación neta acumulada por servicios mecánicos y venta de repuestos genuinos
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                Ingresos Totales
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
                Repuestos OEM
              </span>
            </div>
          </div>

          <div className="relative pt-2">
            <svg 
              className="w-full h-52 overflow-visible select-none"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = chartHeight - ratio * (chartHeight - 40) - 20;
                const value = Math.round(ratio * maxRevenueVal);
                return (
                  <g key={idx}>
                    <line 
                      x1="30" 
                      y1={y} 
                      x2={chartWidth - 30} 
                      y2={y} 
                      stroke="currentColor" 
                      className="text-slate-800" 
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x="25" 
                      y={y + 3} 
                      textAnchor="end" 
                      fontSize="9" 
                      className="fill-slate-500 font-mono"
                    >
                      S/ {(value / 1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}
              <path d={areaData} fill="url(#revenueGrad)" />
              <path 
                d={pathData} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {points.map((p, idx) => (
                <g 
                  key={idx} 
                  className="cursor-pointer group"
                  onMouseEnter={() => setActiveChartPoint(idx)}
                  onMouseLeave={() => setActiveChartPoint(null)}
                >
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={activeChartPoint === idx ? 7 : 5} 
                    className="fill-emerald-400 stroke-slate-950 transition-all duration-200"
                    strokeWidth="3"
                  />
                  <text 
                    x={p.x} 
                    y={chartHeight + 10} 
                    textAnchor="middle" 
                    fontSize="10" 
                    className={`font-semibold transition-colors ${
                      activeChartPoint === idx ? 'fill-emerald-400 font-bold' : 'fill-slate-400'
                    }`}
                  >
                    {p.month}
                  </text>
                </g>
              ))}
            </svg>

            {activeChartPoint !== null && (
              <div 
                style={{
                  left: `${(points[activeChartPoint].x / chartWidth) * 100}%`,
                  top: `${(points[activeChartPoint].y / chartHeight) * 100}%`
                }}
                className="absolute -translate-x-1/2 -translate-y-full mb-3 pointer-events-none z-20"
              >
                <div className="bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl shadow-2xl text-xs text-white space-y-1">
                  <p className="font-bold text-emerald-400 border-b border-slate-800 pb-1">
                    {points[activeChartPoint].label}
                  </p>
                  <p className="font-mono text-sm font-black">
                    {formatCurrency(points[activeChartPoint].revenue)}
                  </p>
                  <div className="text-[10px] text-slate-300 font-mono space-y-0.5">
                    <p>Repuestos: {formatCurrency(points[activeChartPoint].parts)}</p>
                    <p>Mano de Obra: {formatCurrency(points[activeChartPoint].labor)}</p>
                    <p className="text-blue-300">Órdenes completadas: {points[activeChartPoint].repairs}</p>
                  </div>
                </div>
                <div className="w-2.5 h-2.5 bg-slate-950 border-r border-b border-slate-700 rotate-45 mx-auto -mt-1"></div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Repuestos & Insumos
              </span>
              <span className="text-base font-bold font-mono text-blue-400">
                {formatCurrency(partsRevenue)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">58% de ingresos totales</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Mano de Obra Especializada
              </span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {formatCurrency(laborRevenue)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">42% de margen alto</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Ticket Medio por Vehículo
              </span>
              <span className="text-base font-bold font-mono text-amber-300">
                {formatCurrency(averageTicket)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Promedio por orden de servicio</span>
            </div>
          </div>
        </div>

        {/* CHART 2: REPAIR STAGE FUNNEL */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              Reparaciones por Etapa de Taller
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Flujo de avance en las bahías de trabajo
            </p>
          </div>

          <div className="space-y-3">
            {[
              { key: 'recepcion', label: 'Recepción & Check-list 360°', count: stageCounts.recepcion, color: 'bg-blue-500' },
              { key: 'diagnostico', label: 'Diagnóstico & Escáner', count: stageCounts.diagnostico, color: 'bg-purple-500' },
              { key: 'cotizacion_pendiente', label: 'Cotización por Aprobar', count: stageCounts.cotizacion_pendiente, color: 'bg-amber-400' },
              { key: 'en_reparacion', label: 'En Reparación Mecánica', count: stageCounts.en_reparacion, color: 'bg-cyan-500' },
              { key: 'espera_repuestos', label: 'En Espera de Repuestos', count: stageCounts.espera_repuestos, color: 'bg-orange-500' },
              { key: 'control_calidad', label: 'Control de Calidad Pre-Entrega', count: stageCounts.control_calidad, color: 'bg-indigo-500' },
              { key: 'listo_entrega', label: 'Listo para Entrega al Cliente', count: stageCounts.listo_entrega, color: 'bg-emerald-500' }
            ].map(stage => {
              const percentage = totalActiveRepairs > 0 ? Math.round((stage.count / totalActiveRepairs) * 100) : 0;
              return (
                <div key={stage.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 truncate pr-2">
                      {stage.label}
                    </span>
                    <span className="font-mono font-bold text-white shrink-0">
                      {stage.count} veh.
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full ${stage.color} rounded-full transition-all duration-300`}
                      style={{ width: `${Math.max(percentage, stage.count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Distribución por Tipología Vehicular:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">🚗 Autos</span>
                <strong className="font-mono text-white">{categoryCounts.sedan}</strong>
              </div>
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">🚙 Camionetas</span>
                <strong className="font-mono text-white">{categoryCounts.suv_pickup}</strong>
              </div>
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">🚐 Furgones</span>
                <strong className="font-mono text-white">{categoryCounts.furgon}</strong>
              </div>
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">🚛 Camiones</span>
                <strong className="font-mono text-white">{categoryCounts.camion}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: MECHANIC UTILIZATION */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Rendimiento & Carga de Trabajo de Mecánicos (Utilization Rate)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Horas hombre asignadas vs. capacidad operativa por técnico especialista
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            Utilización Promedio: <span className="text-amber-400">{overallUtilizationRate}%</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {technicianStats.map(tech => {
            const isHigh = tech.utilizationRate > 85;
            const isOptimal = tech.utilizationRate >= 60 && tech.utilizationRate <= 85;
            return (
              <div
                key={tech.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white leading-tight">
                      {tech.name}
                    </h4>
                    <p className="text-[11px] text-blue-400 font-semibold mt-0.5">{tech.specialty}</p>
                    <span className="text-[10px] text-slate-400">{tech.grade}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    isHigh 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : isOptimal
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  }`}>
                    {isHigh ? 'Saturado' : isOptimal ? 'Óptimo' : 'Disponible'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Ocupación:</span>
                    <span className="font-mono font-bold text-white">
                      {tech.utilizationRate}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-rose-500' : isOptimal ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${tech.utilizationRate}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span>{tech.assignedCount} órdenes activas</span>
                  <span>★ {tech.ratingScore}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
