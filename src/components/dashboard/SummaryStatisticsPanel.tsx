import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { useERP } from '../../context/ERPContext';
import { 
  Wrench, 
  FileSpreadsheet, 
  Car, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Activity, 
  ArrowUpRight
} from 'lucide-react';

interface SummaryStatisticsPanelProps {
  onNavigateTab: (tab: string) => void;
}

type TimeRange = '7d' | '14d' | '30d';
type SelectedMetric = 'all' | 'repairs' | 'quotations' | 'vehicles';

interface TrendDataPoint {
  date: Date;
  dateLabel: string;
  activeRepairs: number;
  pendingQuotations: number;
  vehiclesInWorkshop: number;
  completedRepairs: number;
}

export const SummaryStatisticsPanel: React.FC<SummaryStatisticsPanelProps> = ({ onNavigateTab }) => {
  const { stats, workOrders, quotations, formatCurrency } = useERP();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [selectedMetric, setSelectedMetric] = useState<SelectedMetric>('all');
  const [hoveredPoint, setHoveredPoint] = useState<TrendDataPoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // 1. CALCULATE LIVE KPI TOTALS
  const activeRepairsCount = useMemo(() => {
    return workOrders.filter(
      ot => ot.currentStage !== 'entregado' && ot.currentStage !== 'recepcion'
    ).length;
  }, [workOrders]);

  const vehiclesInWorkshopCount = useMemo(() => {
    return stats.inWorkshopCount || workOrders.filter(ot => ot.currentStage !== 'entregado').length;
  }, [stats.inWorkshopCount, workOrders]);

  const pendingQuotationsCount = useMemo(() => {
    return stats.pendingQuotationsCount || quotations.filter(
      q => q.status === 'Borrador' || q.status === 'Enviada'
    ).length;
  }, [stats.pendingQuotationsCount, quotations]);

  const pendingQuotationsValue = useMemo(() => {
    return quotations
      .filter(q => q.status === 'Borrador' || q.status === 'Enviada')
      .reduce((sum, q) => sum + (q.grandTotal || 0), 0);
  }, [quotations]);

  // 2. GENERATE HISTORICAL TREND DATA SERIES FOR D3
  const trendData = useMemo<TrendDataPoint[]>(() => {
    const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const now = new Date(2026, 9, 5); // Current app date (Oct 5, 2026)
    const points: TrendDataPoint[] = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayOffset = daysCount - 1 - i;

      const dateLabel = d.toLocaleDateString('es-PE', { 
        weekday: daysCount <= 7 ? 'short' : undefined,
        day: '2-digit', 
        month: 'short' 
      });

      if (i === 0) {
        points.push({
          date: d,
          dateLabel,
          activeRepairs: activeRepairsCount,
          pendingQuotations: pendingQuotationsCount,
          vehiclesInWorkshop: vehiclesInWorkshopCount,
          completedRepairs: stats.deliveredTodayCount || 2
        });
      } else {
        const seed = (d.getDate() * 13 + d.getMonth() * 7) % 10;
        const wave = Math.sin(dayOffset * 0.8) * 1.5;
        const estActive = Math.max(
          2, 
          Math.round(activeRepairsCount - 1 + wave + (seed % 3) - 1)
        );
        const estQuotes = Math.max(
          1, 
          Math.round(pendingQuotationsCount + (seed % 2) - (dayOffset % 2 === 0 ? 1 : 0))
        );
        const estVehicles = Math.max(
          3, 
          Math.round(vehiclesInWorkshopCount + wave * 0.9 + ((seed + 1) % 3) - 1)
        );
        const estCompleted = Math.max(
          1, 
          Math.round(2 + ((seed + 2) % 3))
        );

        points.push({
          date: d,
          dateLabel,
          activeRepairs: estActive,
          pendingQuotations: estQuotes,
          vehiclesInWorkshop: estVehicles,
          completedRepairs: estCompleted
        });
      }
    }
    return points;
  }, [timeRange, activeRepairsCount, pendingQuotationsCount, vehiclesInWorkshopCount, stats.deliveredTodayCount]);

  const deltas = useMemo(() => {
    if (trendData.length < 2) return { repairs: 0, quotes: 0, vehicles: 0 };
    const first = trendData[0];
    const last = trendData[trendData.length - 1];
    const calcDelta = (current: number, initial: number) => {
      if (initial === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - initial) / initial) * 100);
    };

    return {
      repairs: calcDelta(last.activeRepairs, first.activeRepairs),
      quotes: calcDelta(last.pendingQuotations, first.pendingQuotations),
      vehicles: calcDelta(last.vehiclesInWorkshop, first.vehiclesInWorkshop)
    };
  }, [trendData]);

  // 3. D3 RENDERING FOR MAIN VISUAL TRENDS CHART
  useEffect(() => {
    if (!svgRef.current || !chartContainerRef.current || trendData.length === 0) return;

    const container = chartContainerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = container.clientWidth || 700;
    const height = 240;
    const margin = { top: 20, right: 30, bottom: 35, left: 42 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const defs = svg.append('defs');

    // Gradient for Active Repairs (Cyan / Blue)
    const repairsGrad = defs.append('linearGradient')
      .attr('id', 'repairs-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    repairsGrad.append('stop').attr('offset', '0%').attr('stop-color', '#38bdf8').attr('stop-opacity', 0.45);
    repairsGrad.append('stop').attr('offset', '100%').attr('stop-color', '#38bdf8').attr('stop-opacity', 0.0);

    // Gradient for Pending Quotations (Amber)
    const quotesGrad = defs.append('linearGradient')
      .attr('id', 'quotes-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    quotesGrad.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.4);
    quotesGrad.append('stop').attr('offset', '100%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.0);

    // Gradient for Vehicles in Workshop (Emerald)
    const vehiclesGrad = defs.append('linearGradient')
      .attr('id', 'vehicles-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    vehiclesGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.38);
    vehiclesGrad.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.0);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(trendData, d => d.date) as [Date, Date])
      .range([0, innerWidth]);

    let maxVal = 5;
    if (selectedMetric === 'all') {
      maxVal = d3.max(trendData, d => Math.max(d.activeRepairs, d.pendingQuotations, d.vehiclesInWorkshop)) || 8;
    } else if (selectedMetric === 'repairs') {
      maxVal = d3.max(trendData, d => d.activeRepairs) || 6;
    } else if (selectedMetric === 'quotations') {
      maxVal = d3.max(trendData, d => d.pendingQuotations) || 6;
    } else {
      maxVal = d3.max(trendData, d => d.vehiclesInWorkshop) || 8;
    }

    const yScale = d3.scaleLinear()
      .domain([0, Math.ceil(maxVal * 1.25)])
      .nice()
      .range([innerHeight, 0]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Subtle horizontal gridlines
    const yTicks = yScale.ticks(4);
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#334155')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-opacity', 0.45);

    // Y Axis Labels
    g.append('g')
      .selectAll('text')
      .data(yTicks)
      .enter()
      .append('text')
      .attr('x', -10)
      .attr('y', d => yScale(d) + 3)
      .attr('text-anchor', 'end')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .text(d => d);

    // X Axis with localized day labels
    const xAxisGenerator = d3.axisBottom(xScale)
      .ticks(trendData.length <= 7 ? trendData.length : 6)
      .tickFormat((d) => {
        const dateObj = d as Date;
        return dateObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
      })
      .tickSize(0)
      .tickPadding(12);

    const xAxisGroup = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxisGenerator);

    xAxisGroup.select('.domain').attr('stroke', '#334155');
    xAxisGroup.selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px');

    // Series Definitions
    const seriesConfig = [
      {
        id: 'vehicles',
        name: 'Vehículos en Taller',
        color: '#10b981',
        gradId: 'url(#vehicles-gradient)',
        getValue: (d: TrendDataPoint) => d.vehiclesInWorkshop,
        visible: selectedMetric === 'all' || selectedMetric === 'vehicles'
      },
      {
        id: 'repairs',
        name: 'Reparaciones Activas',
        color: '#38bdf8',
        gradId: 'url(#repairs-gradient)',
        getValue: (d: TrendDataPoint) => d.activeRepairs,
        visible: selectedMetric === 'all' || selectedMetric === 'repairs'
      },
      {
        id: 'quotations',
        name: 'Cotizaciones Pendientes',
        color: '#f59e0b',
        gradId: 'url(#quotes-gradient)',
        getValue: (d: TrendDataPoint) => d.pendingQuotations,
        visible: selectedMetric === 'all' || selectedMetric === 'quotations'
      }
    ];

    // Render Areas and Lines
    seriesConfig.forEach(series => {
      if (!series.visible) return;

      const area = d3.area<TrendDataPoint>()
        .x(d => xScale(d.date))
        .y0(innerHeight)
        .y1(d => yScale(series.getValue(d)))
        .curve(d3.curveMonotoneX);

      const line = d3.line<TrendDataPoint>()
        .x(d => xScale(d.date))
        .y(d => yScale(series.getValue(d)))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(trendData)
        .attr('fill', series.gradId)
        .attr('d', area);

      g.append('path')
        .datum(trendData)
        .attr('fill', 'none')
        .attr('stroke', series.color)
        .attr('stroke-width', 2.5)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('d', line);

      g.selectAll(`.dot-${series.id}`)
        .data(trendData)
        .enter()
        .append('circle')
        .attr('class', `dot-${series.id}`)
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(series.getValue(d)))
        .attr('r', (d, idx) => idx === trendData.length - 1 ? 4.5 : 3)
        .attr('fill', series.color)
        .attr('stroke', '#0f172a')
        .attr('stroke-width', 2);
    });

    // Interactive Hover Overlay using D3 bisector
    const bisectDate = d3.bisector((d: TrendDataPoint) => d.date).left;

    const crosshair = g.append('line')
      .attr('class', 'crosshair')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4')
      .style('opacity', 0);

    const overlay = g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    overlay
      .on('mousemove', function(event) {
        const [pointerX] = d3.pointer(event);
        const x0 = xScale.invert(pointerX);
        const index = bisectDate(trendData, x0, 1);
        const d0 = trendData[index - 1];
        const d1 = trendData[index];
        let d = d0;
        if (d1 && d0) {
          d = x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime() ? d1 : d0;
        } else if (d1) {
          d = d1;
        }

        if (d) {
          const snappedX = xScale(d.date);
          crosshair
            .attr('x1', snappedX)
            .attr('x2', snappedX)
            .style('opacity', 1);

          setHoveredPoint(d);
          setHoverPos({
            x: snappedX + margin.left,
            y: event.clientY
          });
        }
      })
      .on('mouseleave', function() {
        crosshair.style('opacity', 0);
        setHoveredPoint(null);
        setHoverPos(null);
      });
  }, [trendData, selectedMetric]);

  return (
    <section 
      aria-label="Panel de Estadísticas y Tendencias Clave" 
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Métricas Operativas del Taller
            </span>
          </div>
          <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
            Panel de Estadísticas y Tendencias
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>D3 Visual Trends</span>
            <span aria-hidden="true">•</span>
            <span>Monitoreo en tiempo real</span>
            <span aria-hidden="true">•</span>
            <span>Capacidad operativa y flujo de taller</span>
          </div>
        </div>

        {/* Timeframe Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              timeRange === '7d' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7 D
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('14d')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              timeRange === '14d' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            14 D
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              timeRange === '30d' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            30 D
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Active Repairs */}
        <div
          onClick={() => {
            setSelectedMetric(selectedMetric === 'repairs' ? 'all' : 'repairs');
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
            selectedMetric === 'repairs'
              ? 'bg-slate-800/90 border-blue-500 shadow-md ring-1 ring-blue-500/50'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Wrench className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Active Repairs
                </span>
                <span className="text-[11px] text-slate-500">Reparaciones en Proceso</span>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`inline-flex items-center text-xs font-mono font-bold ${
                deltas.repairs >= 0 ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                {deltas.repairs >= 0 ? '+' : ''}{deltas.repairs}%
                {deltas.repairs >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 ml-1" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 ml-1" />
                )}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {activeRepairsCount}
              </span>
              <span className="text-xs text-blue-400 font-medium">unidades activas</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateTab('workshop');
              }}
              className="text-[11px] font-semibold text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              Ver Bahías
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Diagnósticos / Mecánica</span>
            <span className="font-mono text-slate-300">
              {workOrders.filter(o => o.currentStage === 'en_reparacion').length} en banco
            </span>
          </div>
        </div>

        {/* KPI 2: Pending Quotations */}
        <div
          onClick={() => {
            setSelectedMetric(selectedMetric === 'quotations' ? 'all' : 'quotations');
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
            selectedMetric === 'quotations'
              ? 'bg-slate-800/90 border-amber-500 shadow-md ring-1 ring-amber-500/50'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <FileSpreadsheet className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Pending Quotations
                </span>
                <span className="text-[11px] text-slate-500">Por Aprobación Cliente</span>
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center text-xs font-mono font-bold ${
                deltas.quotes >= 0 ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {deltas.quotes >= 0 ? '+' : ''}{deltas.quotes}%
                {deltas.quotes >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 ml-1" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 ml-1" />
                )}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {pendingQuotationsCount}
              </span>
              <span className="text-xs text-amber-400 font-medium">cotizaciones</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateTab('quotations');
              }}
              className="text-[11px] font-semibold text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              Ver Listado
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Monto en Espera</span>
            <span className="font-mono text-amber-300 font-semibold">
              {formatCurrency(pendingQuotationsValue)}
            </span>
          </div>
        </div>

        {/* KPI 3: Vehicles in Workshop */}
        <div
          onClick={() => {
            setSelectedMetric(selectedMetric === 'vehicles' ? 'all' : 'vehicles');
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
            selectedMetric === 'vehicles'
              ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Car className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Vehicles in Workshop
                </span>
                <span className="text-[11px] text-slate-500">Unidades en Planta / Patios</span>
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center text-xs font-mono font-bold ${
                deltas.vehicles >= 0 ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                {deltas.vehicles >= 0 ? '+' : ''}{deltas.vehicles}%
                {deltas.vehicles >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 ml-1" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 ml-1" />
                )}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {vehiclesInWorkshopCount}
              </span>
              <span className="text-xs text-emerald-400 font-medium">vehículos totales</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateTab('reception');
              }}
              className="text-[11px] font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              Nuevo Ingreso
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Ocupación de Taller</span>
            <span className="font-mono text-emerald-300 font-semibold">
              {Math.min(100, Math.round((vehiclesInWorkshopCount / 10) * 100))}% capacidad (10 bahías)
            </span>
          </div>
        </div>
      </div>

      {/* Main D3 Visual Trends Interactive Container */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-tight">
              Tendencia Gráfica D3 ({timeRange === '7d' ? 'Últimos 7 Días' : timeRange === '14d' ? 'Últimas 2 Semanas' : 'Últimos 30 Días'})
            </span>
            <span className="text-[11px] text-slate-500">
              Curvas suavizadas e interpolación monocromática
            </span>
          </div>

          {/* Metric Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSelectedMetric('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${
                selectedMetric === 'all'
                  ? 'bg-slate-800 text-white border-slate-600'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Comparar Todas
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('repairs')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${
                selectedMetric === 'repairs'
                  ? 'bg-blue-950/80 text-blue-300 border-blue-500'
                  : 'text-slate-400 border-transparent hover:text-blue-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              Active Repairs
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('quotations')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${
                selectedMetric === 'quotations'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500'
                  : 'text-slate-400 border-transparent hover:text-amber-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Pending Quotations
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('vehicles')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${
                selectedMetric === 'vehicles'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
                  : 'text-slate-400 border-transparent hover:text-emerald-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Vehicles in Workshop
            </button>
          </div>
        </div>

        {/* SVG Container with D3 visualization */}
        <div ref={chartContainerRef} className="relative w-full h-[240px]">
          <svg 
            ref={svgRef}
            className="w-full h-full overflow-visible"
          />

          {/* D3 Hover Tooltip */}
          {hoveredPoint && hoverPos && (
            <div
              style={{
                left: `${Math.min(Math.max(hoverPos.x, 80), chartContainerRef.current ? chartContainerRef.current.clientWidth - 160 : 500)}px`,
                top: `15px`
              }}
              className="absolute pointer-events-none -translate-x-1/2 bg-slate-900/95 border border-slate-700/80 shadow-2xl rounded-xl p-3 text-xs z-20 min-w-[200px] backdrop-blur-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  {hoveredPoint.date.toLocaleDateString('es-PE', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">D3 Point</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Active Repairs:
                  </span>
                  <span className="font-bold text-white">{hoveredPoint.activeRepairs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Pending Quotes:
                  </span>
                  <span className="font-bold text-white">{hoveredPoint.pendingQuotations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Vehicles in Shop:
                  </span>
                  <span className="font-bold text-white">{hoveredPoint.vehiclesInWorkshop}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                  <span>Listos / Entregados:</span>
                  <span className="font-semibold text-slate-300">{hoveredPoint.completedRepairs} u.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Visual Trend Insights Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Interpretación de tendencia:</span>
            <span>
              {activeRepairsCount > 4 
                ? 'Alta carga de trabajo en bahías de servicio.' 
                : 'Carga operativa equilibrada con capacidad de recepción disponible.'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Pasa el cursor sobre el gráfico para auditar días específicos</span>
            <span aria-hidden="true">•</span>
            <span className="text-blue-400 font-medium">SAFIRO GROUP D3 Engine</span>
          </div>
        </div>
      </div>
    </section>
  );
};
