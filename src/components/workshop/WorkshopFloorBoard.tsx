import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { WorkOrder, VehicleStatus } from '../../types/erp';
import { 
  GitFork, 
  User, 
  CheckCircle2, 
  Search, 
  ShieldCheck, 
  Wrench, 
  CheckCheck, 
  X, 
  SlidersHorizontal 
} from 'lucide-react';

const STAGES: Array<{ key: VehicleStatus; label: string; badgeColor: string }> = [
  { key: 'recepcion', label: '1. Recepción', badgeColor: 'border-blue-500/40 text-blue-300' },
  { key: 'diagnostico', label: '2. En Diagnóstico', badgeColor: 'border-purple-500/40 text-purple-300' },
  { key: 'cotizacion_pendiente', label: '3. Cotiz. Pendiente', badgeColor: 'border-amber-500/40 text-amber-300' },
  { key: 'en_reparacion', label: '4. En Reparación', badgeColor: 'border-cyan-500/40 text-cyan-300' },
  { key: 'espera_repuestos', label: '5. Espera Repuestos', badgeColor: 'border-orange-500/40 text-orange-300' },
  { key: 'control_calidad', label: '6. Control de Calidad', badgeColor: 'border-indigo-500/40 text-indigo-300' },
  { key: 'listo_entrega', label: '7. Listo para Entrega', badgeColor: 'border-emerald-500/40 text-emerald-300' },
  { key: 'entregado', label: '8. Entregado', badgeColor: 'border-slate-600 text-slate-400' }
];

export const WorkshopFloorBoard: React.FC = () => {
  const { 
    workOrders, 
    technicians, 
    updateWorkOrderStage, 
    updateQualityCheck, 
    deliverVehicle, 
    getVehicle, 
    getCustomer, 
    getTechnician 
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechFilter, setSelectedTechFilter] = useState('all');
  const [selectedOrderForQuality, setSelectedOrderForQuality] = useState<WorkOrder | null>(null);

  // Quality check modal form
  const [qcRoadTest, setQcRoadTest] = useState(false);
  const [qcFluidLevels, setQcFluidLevels] = useState(false);
  const [qcLugTorque, setQcLugTorque] = useState(false);
  const [qcCleanWashed, setQcCleanWashed] = useState(false);
  const [qcFaultCodes, setQcFaultCodes] = useState(false);
  const [qcInspector, setQcInspector] = useState('Ing. Mateo Huamán');
  const [qcNotes, setQcNotes] = useState('');

  const openQualityModal = (ot: WorkOrder) => {
    setSelectedOrderForQuality(ot);
    setQcRoadTest(ot.qualityCheck.roadTestPerformed);
    setQcFluidLevels(ot.qualityCheck.fluidLevelsVerified);
    setQcLugTorque(ot.qualityCheck.wheelLugTorqueVerified);
    setQcCleanWashed(ot.qualityCheck.cleanAndWashed);
    setQcFaultCodes(ot.qualityCheck.faultCodesCleared);
    setQcInspector(ot.qualityCheck.inspectorName || 'Ing. Mateo Huamán');
    setQcNotes(ot.qualityCheck.notes || '');
  };

  const handleSaveQualityCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForQuality) return;

    updateQualityCheck(selectedOrderForQuality.id, {
      roadTestPerformed: qcRoadTest,
      fluidLevelsVerified: qcFluidLevels,
      wheelLugTorqueVerified: qcLugTorque,
      cleanAndWashed: qcCleanWashed,
      faultCodesCleared: qcFaultCodes,
      inspectorName: qcInspector,
      notes: qcNotes
    });

    setSelectedOrderForQuality(null);
  };

  const filteredOrders = workOrders.filter(ot => {
    const veh = getVehicle(ot.vehicleId);
    const cust = getCustomer(ot.customerId);
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      ot.code.toLowerCase().includes(term) ||
      veh?.plate.toLowerCase().includes(term) ||
      veh?.model.toLowerCase().includes(term) ||
      cust?.name.toLowerCase().includes(term) ||
      ot.bayLocation.toLowerCase().includes(term);
    const matchesTech = selectedTechFilter === 'all' || ot.technicianId === selectedTechFilter;
    return matchesSearch && matchesTech;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <GitFork className="w-5 h-5 text-blue-400" />
            Control de Piso & Seguimiento de Unidades en Taller
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tablero Kanban de avance en tiempo real por bahías, elevadores y control de calidad
          </p>
        </div>
        {/* Technician filter */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <select
            value={selectedTechFilter}
            onChange={e => setSelectedTechFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos los Técnicos</option>
            {technicians.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.activeOrders} activas)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Search */}
      <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar unidad por placa, modelo, cliente o bahía..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
        />
      </div>

      {/* Kanban Board Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {STAGES.map(stage => {
          const stageOrders = filteredOrders.filter(o => o.currentStage === stage.key);
          return (
            <div
              key={stage.key}
              className="w-80 shrink-0 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col flex-1 min-h-[580px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-xs font-bold text-slate-200">{stage.label}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                  {stageOrders.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {stageOrders.length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-800/80 rounded-lg flex items-center justify-center text-xs text-slate-600 italic">
                    Sin unidades
                  </div>
                ) : (
                  stageOrders.map(order => {
                    const veh = getVehicle(order.vehicleId);
                    const cust = getCustomer(order.customerId);
                    const tech = getTechnician(order.technicianId);

                    const priorityColors = {
                      Urgente: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                      Alta: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                      Normal: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                      Baja: 'bg-slate-700/40 text-slate-300 border-slate-600'
                    }[order.priority];

                    return (
                      <div
                        key={order.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-md hover:border-slate-700 transition-all text-xs"
                      >
                        {/* Top: OT Code & Priority */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-400">{order.code}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${priorityColors}`}>
                            {order.priority}
                          </span>
                        </div>

                        {/* Vehicle & Customer */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono px-2 py-0.5 bg-slate-950 text-amber-300 border border-amber-500/30 rounded font-semibold text-xs tracking-wider">
                              {veh?.plate}
                            </span>
                            <span className="font-semibold text-slate-100 truncate">
                              {veh?.brand} {veh?.model}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 truncate">
                            Cliente: {cust?.name}
                          </p>
                        </div>

                        {/* Bay & Tech */}
                        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 space-y-1 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Wrench className="w-3.5 h-3.5 text-blue-400" />
                            <span className="truncate">{order.bayLocation}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-500" />
                              {tech ? tech.name.split(' ')[0] + ' ' + (tech.name.split(' ')[1] || '') : 'Sin asignar'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Ad: {order.serviceAdvisor.split(' ')[0]}
                            </span>
                          </div>
                        </div>

                        {/* Stage Specific Actions & Progress */}
                        {stage.key === 'control_calidad' && (
                          <button
                            type="button"
                            onClick={() => openQualityModal(order)}
                            className="w-full py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {order.qualityCheck.passed ? 'QC Conforme' : 'Inspección Pre-Entrega'}
                          </button>
                        )}

                        {stage.key === 'listo_entrega' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`¿Confirmar entrega final del vehículo ${veh?.plate} al cliente ${cust?.name}?`)) {
                                deliverVehicle(order.id);
                              }
                            }}
                            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Registrar Entrega a Cliente
                          </button>
                        )}

                        {/* Advance / Move dropdown */}
                        <div className="pt-1 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">Mover a etapa:</span>
                          <select
                            value={order.currentStage}
                            onChange={e => updateWorkOrderStage(order.id, e.target.value as VehicleStatus)}
                            className="bg-slate-950 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5 text-[11px] focus:outline-none"
                          >
                            {STAGES.map(s => (
                              <option key={s.key} value={s.key}>{s.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Quality Inspection Pre-Delivery */}
      {selectedOrderForQuality && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Control de Calidad Pre-Entrega</h3>
                  <p className="text-xs text-slate-400">Verificación de 5 puntos obligatorios antes de liberar el vehículo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForQuality(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checklist items */}
            <form onSubmit={handleSaveQualityCheck} className="p-6 space-y-4 text-xs">
              <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {[
                  { state: qcRoadTest, setter: setQcRoadTest, label: '1. Prueba de ruta realizada (Dirección, ruidos, respuesta de frenado)' },
                  { state: qcFluidLevels, setter: setQcFluidLevels, label: '2. Niveles de fluidos verificados (Aceite, refrigerante, frenos, lavaparabrisas)' },
                  { state: qcLugTorque, setter: setQcLugTorque, label: '3. Torque de tuercas de ruedas verificado con torquímetro calibrado' },
                  { state: qcFaultCodes, setter: setQcFaultCodes, label: '4. Borrado de códigos de avería y reinicio de testigo de servicio' },
                  { state: qcCleanWashed, setter: setQcCleanWashed, label: '5. Lavado exterior y aspirado de cabina completado' }
                ].map((item, idx) => (
                  <label key={idx} className="flex items-start gap-2.5 cursor-pointer text-slate-200 select-none">
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={e => item.setter(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 w-4 h-4 mt-0.5 bg-slate-900"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Inspector de Calidad Responsable</label>
                <input
                  type="text"
                  value={qcInspector}
                  onChange={e => setQcInspector(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Observaciones Finales de Prueba de Ruta</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre suavidad de marcha, alineamiento, etc."
                  value={qcNotes}
                  onChange={e => setQcNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForQuality(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Guardar Control de Calidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
