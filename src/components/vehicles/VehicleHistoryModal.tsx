import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Vehicle } from '../../types/erp';
import { 
  Car, 
  Search, 
  History, 
  User, 
  Wrench, 
  ClipboardCheck, 
  Cpu, 
  DollarSign, 
  X, 
  Calendar,
  FileSpreadsheet
} from 'lucide-react';

interface VehicleHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlate?: string;
}

export const VehicleHistoryModal: React.FC<VehicleHistoryModalProps> = ({
  isOpen,
  onClose,
  initialPlate = ''
}) => {
  const { vehicles, customers, workOrders, checklists, diagnoses, quotations, getCustomer, formatCurrency } = useERP();
  const [searchTerm, setSearchTerm] = useState(initialPlate);

  if (!isOpen) return null;

  const foundVehicles = vehicles.filter(v => {
    const term = searchTerm.toLowerCase();
    const cust = getCustomer(v.customerId);
    return (
      v.plate.toLowerCase().includes(term) ||
      v.vin.toLowerCase().includes(term) ||
      v.model.toLowerCase().includes(term) ||
      cust?.name.toLowerCase().includes(term)
    );
  });

  const selectedVehicle: Vehicle | undefined = foundVehicles.length > 0 ? foundVehicles[0] : undefined;
  const owner = selectedVehicle ? getCustomer(selectedVehicle.customerId) : undefined;

  const vehicleOrders = selectedVehicle 
    ? workOrders.filter(ot => ot.vehicleId === selectedVehicle.id)
    : [];

  const vehicleQuotations = selectedVehicle 
    ? quotations.filter(q => q.vehicleId === selectedVehicle.id)
    : [];

  const totalSpent = vehicleQuotations
    .filter(q => q.status === 'Aprobada')
    .reduce((s, q) => s + q.grandTotal, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-white">Expediente Clínico & Historial de Servicio</h3>
              <p className="text-xs text-slate-400">Trazabilidad completa por placa, mantenimientos previos y repuestos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Escriba la placa (ej: BCF-418), número de VIN o nombre del cliente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-full uppercase"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {!selectedVehicle ? (
            <div className="py-12 text-center text-slate-500 italic">
              No se encontró ningún vehículo con los términos ingresados.
            </div>
          ) : (
            <>
              {/* Vehicle Identity Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold px-3 py-1 bg-slate-900 text-amber-300 border border-amber-500/40 rounded-lg tracking-wider">
                      {selectedVehicle.plate}
                    </span>
                    <h4 className="text-base font-bold text-white">
                      {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})
                    </h4>
                  </div>
                  <p className="text-slate-400 text-xs">
                    VIN: <span className="font-mono text-slate-300">{selectedVehicle.vin}</span> • Color: {selectedVehicle.color} • Motor: {selectedVehicle.fuelType} ({selectedVehicle.transmission})
                  </p>
                  <p className="text-slate-300 text-xs flex items-center gap-1.5 pt-1">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    Propietario: <strong className="text-white">{owner?.name}</strong> ({owner?.phone})
                  </p>
                </div>
                <div className="text-left sm:text-right space-y-1 shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Kilometraje Registrado
                  </span>
                  <span className="font-mono font-bold text-lg text-white">
                    {selectedVehicle.mileage.toLocaleString()} km
                  </span>
                  <span className="text-[11px] text-emerald-400 block font-mono">
                    Inversión total acumulada: {formatCurrency(totalSpent)}
                  </span>
                </div>
              </div>

              {/* Service History Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4" /> Línea de Tiempo de Intervenciones en Taller ({vehicleOrders.length})
                </h4>

                {vehicleOrders.length === 0 ? (
                  <p className="text-slate-500 italic p-4 bg-slate-950/40 border border-slate-800 rounded-xl text-center">
                    Vehículo sin intervenciones registradas en el historial.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {vehicleOrders.map(ot => {
                      const chk = checklists.find(c => c.id === ot.receptionChecklistId);
                      const diag = diagnoses.find(d => d.id === ot.diagnosisId);
                      const quote = quotations.find(q => q.id === ot.quotationId);

                      return (
                        <div
                          key={ot.id}
                          className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-blue-400">{ot.code}</span>
                              <span className="text-slate-400">• Ingreso: {new Date(ot.entryDate).toLocaleDateString('es-PE')}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 border border-slate-700 text-slate-300 capitalize">
                              {ot.currentStage.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            {/* Reception info */}
                            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                                <ClipboardCheck className="w-3 h-3 text-blue-400" /> Recepción ({chk?.code || 'Manual'})
                              </span>
                              <p className="text-slate-200 line-clamp-2 italic">
                                "{chk?.customerStatedFailure || 'Revisión técnica de taller'}"
                              </p>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                Km: {chk?.receivedMileage.toLocaleString() || '---'}
                              </span>
                            </div>

                            {/* Diagnosis info */}
                            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                                <Cpu className="w-3 h-3 text-purple-400" /> Diagnóstico ({diag?.code || 'Pendiente'})
                              </span>
                              <p className="text-slate-200 line-clamp-2">
                                {diag?.rootCauseAnalysis || 'Sin informe de diagnóstico formal emitido'}
                              </p>
                              {diag && (
                                <span className="text-[10px] text-purple-300 font-mono">
                                  MO: {diag.estimatedLaborHours} hrs
                                </span>
                              )}
                            </div>

                            {/* Quotation info */}
                            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-emerald-400" /> Proforma ({quote?.code || 'Pendiente'})
                              </span>
                              <p className="font-mono font-bold text-emerald-400 text-sm">
                                {quote ? formatCurrency(quote.grandTotal) : 'Sin cotización'}
                              </p>
                              <span className="text-[10px] text-slate-400 block">
                                Estado: <strong>{quote?.status || 'No cotizado'}</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
