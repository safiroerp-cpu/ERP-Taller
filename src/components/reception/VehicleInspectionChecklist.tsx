import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ReceptionChecklist, ExteriorDamageMark, InventoryChecklistItems, VehicleCategory } from '../../types/erp';
import { CarDamageMap } from './CarDamageMap';
import { SignaturePad } from './SignaturePad';
import { 
  ClipboardCheck, 
  Fuel, 
  Gauge, 
  Car, 
  FileText, 
  User, 
  Plus, 
  CheckCircle2, 
  Printer, 
  X, 
  Search,
  Sparkles,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';

const DEFAULT_INVENTORY_ITEMS: InventoryChecklistItems = {
  tarjetaPropiedad: true,
  soatOseguro: true,
  manualUsuario: false,
  llaveDuplicado: false,
  radioPantallaTactil: true,
  aireAcondicionadoOperativo: true,
  encendedorTomas12V: true,
  tapetesJuegoCompleto: true,
  asientosSinManchas: true,
  tableroInstrumentosSinTestigos: true,
  espejosLateralesCompletos: true,
  antenaRadio: true,
  emblemasLogos: true,
  plumillasLimpiaparabrisas: true,
  farosSinRajaduras: true,
  tapaCombustible: true,
  vasosArosCompletos: true,
  llantaRepuestoBuenEstado: true,
  gataMecanica: true,
  llaveRuedas: true,
  trianguloSeguridad: true,
  botiquinPrimerosAuxilios: true,
  extintorVigente: true,
  cablesBateria: false
};

export const VehicleInspectionChecklist: React.FC = () => {
  const { 
    checklists, 
    vehicles, 
    customers, 
    appointments, 
    createReceptionChecklist, 
    getCustomer, 
    getVehicle 
  } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChecklistForPrint, setSelectedChecklistForPrint] = useState<ReceptionChecklist | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Form State
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedVehicleCategory, setSelectedVehicleCategory] = useState<VehicleCategory>('suv_pickup');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [advisorName, setAdvisorName] = useState('Guillermo Castro');
  const [odometer, setOdometer] = useState<number>(35000);
  const [fuelPercentage, setFuelPercentage] = useState<number>(50);
  const [cleanliness, setCleanliness] = useState<'Limpio' | 'Regular' | 'Muy Sucio'>('Regular');
  const [failureReason, setFailureReason] = useState('');
  const [valuableItems, setValuableItems] = useState('');
  const [damages, setDamages] = useState<ExteriorDamageMark[]>([]);
  const [checklistItems, setChecklistItems] = useState<InventoryChecklistItems>(DEFAULT_INVENTORY_ITEMS);
  const [customerSignature, setCustomerSignature] = useState('');
  const [advisorSignature, setAdvisorSignature] = useState('');
  const [autoGenerateWorkOrder, setAutoGenerateWorkOrder] = useState(true);

  const handleSelectAppointment = (aptId: string) => {
    setSelectedAppointmentId(aptId);
    const apt = appointments.find(a => a.id === aptId);
    if (apt) {
      setSelectedVehicleId(apt.vehicleId);
      setSelectedCustomerId(apt.customerId);
      setFailureReason(apt.reasonNotes || apt.serviceType);
      const veh = getVehicle(apt.vehicleId);
      if (veh) {
        setOdometer(veh.mileage);
        if (veh.category) setSelectedVehicleCategory(veh.category);
      }
    }
  };

  const handleSelectVehicle = (vehId: string) => {
    setSelectedVehicleId(vehId);
    const veh = vehicles.find(v => v.id === vehId);
    if (veh) {
      setSelectedCustomerId(veh.customerId);
      setOdometer(veh.mileage);
      if (veh.category) setSelectedVehicleCategory(veh.category);
    }
  };

  const handleToggleItem = (key: keyof InventoryChecklistItems) => {
    setChecklistItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !selectedCustomerId) {
      alert('Por favor seleccione un vehículo y cliente para el ingreso.');
      return;
    }

    createReceptionChecklist({
      appointmentId: selectedAppointmentId || undefined,
      vehicleId: selectedVehicleId,
      customerId: selectedCustomerId,
      receptionDate: new Date().toISOString(),
      advisorName,
      receivedMileage: Number(odometer),
      fuelLevelPercentage: fuelPercentage,
      customerStatedFailure: failureReason,
      valuableItemsDeclared: valuableItems,
      damages,
      checklistItems,
      customerSignature,
      advisorSignature,
      cleanlinessCondition: cleanliness
    }, autoGenerateWorkOrder);

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedAppointmentId('');
    setSelectedVehicleId('');
    setSelectedCustomerId('');
    setFailureReason('');
    setValuableItems('');
    setDamages([]);
    setChecklistItems(DEFAULT_INVENTORY_ITEMS);
    setCustomerSignature('');
    setAdvisorSignature('');
  };

  const filteredChecklists = checklists.filter(chk => {
    const veh = getVehicle(chk.vehicleId);
    const cust = getCustomer(chk.customerId);
    const term = searchFilter.toLowerCase();
    return (
      chk.code.toLowerCase().includes(term) ||
      veh?.plate.toLowerCase().includes(term) ||
      veh?.model.toLowerCase().includes(term) ||
      cust?.name.toLowerCase().includes(term) ||
      chk.advisorName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-400" />
            Check-list de Ingreso & Recepción Vehicular
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Inspección perimétrica 360°, inventario de accesorios y firma digital de recepción
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Nuevo Ingreso Vehicular
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar por placa, código de ingreso, cliente o asesor..."
          value={searchFilter}
          onChange={e => setSearchFilter(e.target.value)}
          className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
        />
        {searchFilter && (
          <button onClick={() => setSearchFilter('')} className="text-slate-400 hover:text-white text-xs">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Checklists Table / Cards */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Código / Fecha</th>
                <th className="py-3 px-4">Vehículo</th>
                <th className="py-3 px-4">Cliente / Contacto</th>
                <th className="py-3 px-4">Kilometraje / Combustible</th>
                <th className="py-3 px-4">Daños Reportados</th>
                <th className="py-3 px-4">Asesor</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredChecklists.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 italic">
                    No se encontraron actas de recepción con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredChecklists.map(chk => {
                  const veh = getVehicle(chk.vehicleId);
                  const cust = getCustomer(chk.customerId);
                  const dateStr = new Date(chk.receptionDate).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={chk.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-blue-400 block">{chk.code}</span>
                        <span className="text-[11px] text-slate-400">{dateStr}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono px-2 py-0.5 bg-slate-950 text-amber-300 border border-amber-500/30 rounded font-semibold text-xs tracking-wider">
                            {veh?.plate || '---'}
                          </span>
                          <div>
                            <p className="font-medium text-slate-200">{veh?.brand} {veh?.model}</p>
                            <p className="text-[11px] text-slate-400">{veh?.color} • {veh?.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-200">{cust?.name || 'Cliente sin registrar'}</p>
                        <p className="text-[11px] text-slate-400">{cust?.phone} • {cust?.documentType}: {cust?.documentNumber}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className="font-mono text-slate-200 font-medium block">
                            {chk.receivedMileage.toLocaleString()} km
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Fuel className="w-3 h-3 text-amber-400" />
                            <span>{chk.fuelLevelPercentage}% tanque</span>
                            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  chk.fuelLevelPercentage < 25 ? 'bg-rose-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${chk.fuelLevelPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            chk.damages.length > 0 
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {chk.damages.length === 0 ? 'Sin marcas' : `${chk.damages.length} daños`}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Limpieza: {chk.cleanlinessCondition}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300 font-medium">{chk.advisorName}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedChecklistForPrint(chk)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                          title="Imprimir Acta de Recepción"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-400" />
                          <span>Acta</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Reception Checklist Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Nuevo Check-List de Recepción Vehicular</h3>
                  <p className="text-xs text-slate-400">Inspección de 360°, inventario de componentes y firma de conformidad</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveChecklist} className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Section 1: Vehicle & Customer Identification */}
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Car className="w-4 h-4" /> 1. Datos de Identificación de Unidad
                  </h4>
                  {appointments.filter(a => a.status === 'Agendada').length > 0 && (
                    <div className="text-xs text-slate-400">
                      ¿Viene con cita previa?
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Scheduled Appointment Quick Pick */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Cita Agendada (Opcional)
                    </label>
                    <select
                      value={selectedAppointmentId}
                      onChange={e => handleSelectAppointment(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Ingreso Directo sin Cita --</option>
                      {appointments
                        .filter(a => a.status === 'Agendada' || a.status === 'Recepcionada')
                        .map(apt => {
                          const veh = getVehicle(apt.vehicleId);
                          const cust = getCustomer(apt.customerId);
                          return (
                            <option key={apt.id} value={apt.id}>
                              {apt.code} • {veh?.plate} ({cust?.name}) • {apt.scheduledTime}
                            </option>
                          );
                        })}
                    </select>
                  </div>

                  {/* Vehicle Picker */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Vehículo (Placa / Modelo) *
                      </label>
                      <span className="text-[10px] text-blue-400 font-semibold uppercase">
                        Tipo: {selectedVehicleCategory}
                      </span>
                    </div>
                    <select
                      required
                      value={selectedVehicleId}
                      onChange={e => handleSelectVehicle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Seleccione vehículo...</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.plate} - {v.brand} {v.model} ({v.year}) [{v.category || 'auto'}]
                        </option>
                      ))}
                    </select>

                    {/* Quick Category Overrides */}
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-[10px] text-slate-400 mr-1">Carrocería:</span>
                      {(
                        [
                          { key: 'sedan', label: '🚗 Auto' },
                          { key: 'suv_pickup', label: '🚙 Camioneta' },
                          { key: 'furgon', label: '🚐 Furgón' },
                          { key: 'camion', label: '🚛 Camión' }
                        ] as const
                      ).map(c => (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => setSelectedVehicleCategory(c.key)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                            selectedVehicleCategory === c.key
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Picker */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Propietario / Cliente *
                    </label>
                    <select
                      required
                      value={selectedCustomerId}
                      onChange={e => setSelectedCustomerId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Seleccione cliente...</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.documentType}: {c.documentNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Metric Gauges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-blue-400" />
                      Kilometraje de Ingreso (km) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={odometer}
                      onChange={e => setOdometer(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-amber-400" />
                        Nivel Combustible:
                      </label>
                      <span className="text-xs font-mono font-bold text-amber-300">{fuelPercentage}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={fuelPercentage}
                        onChange={e => setFuelPercentage(Number(e.target.value))}
                        className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                      <span>E (0%)</span>
                      <span>1/4</span>
                      <span>1/2</span>
                      <span>3/4</span>
                      <span>F (100%)</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Estado de Limpieza
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['Limpio', 'Regular', 'Muy Sucio'] as const).map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCleanliness(c)}
                          className={`py-1.5 text-xs font-medium rounded border transition-colors ${
                            cleanliness === c
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-400" /> Asesor de Servicio
                    </label>
                    <input
                      type="text"
                      value={advisorName}
                      onChange={e => setAdvisorName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Interactive 360° Car Damage Diagram */}
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> 2. Inspección Perimétrica de Carrocería (Marcado 360°)
                </h4>
                <p className="text-xs text-slate-400">
                  Selecciona la vista y haz clic para registrar rayones, abolladuras o faltantes existentes antes de ingresar la unidad al taller.
                </p>
                <CarDamageMap
                  damages={damages}
                  initialVehicleCategory={selectedVehicleCategory}
                  onCategoryChange={cat => setSelectedVehicleCategory(cat)}
                  onAddDamage={newDmg => setDamages(prev => [...prev, newDmg])}
                  onRemoveDamage={id => setDamages(prev => prev.filter(d => d.id !== id))}
                />
              </div>

              {/* Section 3: Inventory Checklist (24 items categorized) */}
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4" /> 3. Inventario de Componentes y Documentación
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allTrue = Object.keys(checklistItems).reduce((acc, k) => {
                          acc[k as keyof InventoryChecklistItems] = true;
                          return acc;
                        }, {} as InventoryChecklistItems);
                        setChecklistItems(allTrue);
                      }}
                      className="text-[11px] text-blue-400 hover:underline"
                    >
                      Marcar todo conforme
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Documentos */}
                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1">
                      Documentación
                    </h5>
                    {[
                      { key: 'tarjetaPropiedad', label: 'Tarjeta de Propiedad' },
                      { key: 'soatOseguro', label: 'SOAT / Póliza de Seguro' },
                      { key: 'manualUsuario', label: 'Manual de Usuario' },
                      { key: 'llaveDuplicado', label: 'Duplicado de Llave' }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checklistItems[item.key as keyof InventoryChecklistItems]}
                          onChange={() => handleToggleItem(item.key as keyof InventoryChecklistItems)}
                          className="rounded border-slate-700 text-blue-600 focus:ring-0 w-4 h-4 bg-slate-900"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Interiores */}
                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1">
                      Interiores y Mandos
                    </h5>
                    {[
                      { key: 'radioPantallaTactil', label: 'Radio / Pantalla Touch' },
                      { key: 'aireAcondicionadoOperativo', label: 'A/C Operativo' },
                      { key: 'encendedorTomas12V', label: 'Encendedor / Toma 12V' },
                      { key: 'tapetesJuegoCompleto', label: 'Juego de Tapetes' },
                      { key: 'asientosSinManchas', label: 'Tapicería sin roturas' },
                      { key: 'tableroInstrumentosSinTestigos', label: 'Tablero sin testigos' }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checklistItems[item.key as keyof InventoryChecklistItems]}
                          onChange={() => handleToggleItem(item.key as keyof InventoryChecklistItems)}
                          className="rounded border-slate-700 text-blue-600 focus:ring-0 w-4 h-4 bg-slate-900"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Exteriores */}
                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1">
                      Exteriores
                    </h5>
                    {[
                      { key: 'espejosLateralesCompletos', label: 'Espejos completos' },
                      { key: 'antenaRadio', label: 'Antena de techo' },
                      { key: 'emblemasLogos', label: 'Emblemas de marca' },
                      { key: 'plumillasLimpiaparabrisas', label: 'Plumillas limpiaparabrisas' },
                      { key: 'farosSinRajaduras', label: 'Faros sin fisuras' },
                      { key: 'tapaCombustible', label: 'Tapa de combustible' },
                      { key: 'vasosArosCompletos', label: 'Copas / Aros completos' }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checklistItems[item.key as keyof InventoryChecklistItems]}
                          onChange={() => handleToggleItem(item.key as keyof InventoryChecklistItems)}
                          className="rounded border-slate-700 text-blue-600 focus:ring-0 w-4 h-4 bg-slate-900"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Maletera y Auxilio */}
                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1">
                      Maletera & Auxilio
                    </h5>
                    {[
                      { key: 'llantaRepuestoBuenEstado', label: 'Llanta de repuesto' },
                      { key: 'gataMecanica', label: 'Gata mecánica / palanca' },
                      { key: 'llaveRuedas', label: 'Llave de ruedas' },
                      { key: 'trianguloSeguridad', label: 'Triángulos de seg.' },
                      { key: 'botiquinPrimerosAuxilios', label: 'Botiquín de auxilio' },
                      { key: 'extintorVigente', label: 'Extintor vigente' },
                      { key: 'cablesBateria', label: 'Cables de pasar corriente' }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checklistItems[item.key as keyof InventoryChecklistItems]}
                          onChange={() => handleToggleItem(item.key as keyof InventoryChecklistItems)}
                          className="rounded border-slate-700 text-blue-600 focus:ring-0 w-4 h-4 bg-slate-900"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 4: Motivo de Ingreso & Pertenencias Declaradas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Motivo de Ingreso Declarado por el Cliente *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describa el síntoma, ruido, falla o tipo de mantenimiento solicitado..."
                    value={failureReason}
                    onChange={e => setFailureReason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Objetos de Valor o Pertenencias Declaradas
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ej: Lentes de sol en guantera, silla de bebé, cargador celular en consola..."
                    value={valuableItems}
                    onChange={e => setValuableItems(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Section 5: Dual Signatures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SignaturePad
                  label="Firma de Conformidad del Cliente"
                  sublabel="Declara la veracidad del estado del vehículo al ingreso"
                  initialSignature={customerSignature}
                  onSaveSignature={setCustomerSignature}
                />
                <SignaturePad
                  label="Firma del Asesor de Servicio Receptor"
                  sublabel="Responsable de la recepción técnica en taller"
                  initialSignature={advisorSignature}
                  onSaveSignature={setAdvisorSignature}
                />
              </div>

              {/* Auto Create Work Order Option */}
              <div className="bg-blue-950/20 border border-blue-900/40 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-slate-200">
                    Generar automáticamente <strong>Orden de Trabajo (OT)</strong> y asignar a Bahía de Diagnóstico
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoGenerateWorkOrder}
                    onChange={e => setAutoGenerateWorkOrder(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Guardar Acta de Recepción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable / View Reception Sheet Modal */}
      {selectedChecklistForPrint && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto print-card">
            {/* Action Bar */}
            <div className="no-print flex items-center justify-between px-6 py-3 bg-slate-900 text-white border-b border-slate-800">
              <span className="font-semibold text-xs flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Vista Previa de Impresión - Acta Oficial de Recepción
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / Guardar PDF
                </button>
                <button
                  onClick={() => setSelectedChecklistForPrint(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-800">
              {/* Dealership Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                    SAFIRO GROUP • Taller Automotriz
                  </h1>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Servicio Técnico Especializado multimarca • Repuestos Genuinos OEM
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Av. Javier Prado Este 2850, Lima • Central de Citas: (01) 640-9000
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block border-2 border-slate-900 px-3 py-1 text-center">
                    <span className="text-[10px] uppercase font-bold tracking-widest block text-slate-600">
                      Acta de Recepción
                    </span>
                    <span className="font-mono text-base font-extrabold text-slate-900">
                      {selectedChecklistForPrint.code}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Fecha: {new Date(selectedChecklistForPrint.receptionDate).toLocaleString('es-PE')}
                  </p>
                </div>
              </div>

              {/* Vehicle & Customer Grid */}
              <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 rounded">
                <div>
                  <h4 className="font-bold uppercase text-[10px] tracking-wider text-slate-500 border-b border-slate-200 pb-1 mb-2">
                    Datos del Cliente
                  </h4>
                  {(() => {
                    const cust = getCustomer(selectedChecklistForPrint.customerId);
                    return (
                      <div className="space-y-1 text-xs">
                        <p><strong>Cliente:</strong> {cust?.name}</p>
                        <p><strong>Documento:</strong> {cust?.documentType} {cust?.documentNumber}</p>
                        <p><strong>Teléfono:</strong> {cust?.phone}</p>
                        <p><strong>Email:</strong> {cust?.email}</p>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <h4 className="font-bold uppercase text-[10px] tracking-wider text-slate-500 border-b border-slate-200 pb-1 mb-2">
                    Datos del Vehículo
                  </h4>
                  {(() => {
                    const veh = getVehicle(selectedChecklistForPrint.vehicleId);
                    return (
                      <div className="space-y-1 text-xs">
                        <p><strong>Placa:</strong> <span className="font-mono font-bold">{veh?.plate}</span></p>
                        <p><strong>Marca / Modelo:</strong> {veh?.brand} {veh?.model} ({veh?.year})</p>
                        <p><strong>VIN / Chasis:</strong> <span className="font-mono">{veh?.vin}</span></p>
                        <p><strong>Color / Combustible:</strong> {veh?.color} • {veh?.fuelType}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Status metrics */}
              <div className="grid grid-cols-4 gap-2 border border-slate-200 p-2 text-center bg-slate-50 rounded">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Kilometraje</span>
                  <span className="font-mono font-bold text-slate-900">{selectedChecklistForPrint.receivedMileage.toLocaleString()} km</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Combustible</span>
                  <span className="font-mono font-bold text-slate-900">{selectedChecklistForPrint.fuelLevelPercentage}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Limpieza</span>
                  <span className="font-bold text-slate-900">{selectedChecklistForPrint.cleanlinessCondition}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Asesor</span>
                  <span className="font-bold text-slate-900">{selectedChecklistForPrint.advisorName}</span>
                </div>
              </div>

              {/* Reason */}
              <div className="border border-slate-200 p-3 rounded">
                <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-1">
                  Motivo de Ingreso / Declaración del Cliente:
                </h4>
                <p className="text-slate-700 italic">{selectedChecklistForPrint.customerStatedFailure}</p>
                {selectedChecklistForPrint.valuableItemsDeclared && (
                  <p className="text-[11px] text-slate-600 mt-2">
                    <strong>Objetos de valor inventariados:</strong> {selectedChecklistForPrint.valuableItemsDeclared}
                  </p>
                )}
              </div>

              {/* Reported Damages List */}
              <div className="border border-slate-200 p-3 rounded">
                <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-2">
                  Registro de Daños Exteriores Detectados al Ingreso ({selectedChecklistForPrint.damages.length})
                </h4>
                {selectedChecklistForPrint.damages.length === 0 ? (
                  <p className="text-slate-500 italic">No se detectaron abolladuras o rayones notables al momento de la inspección.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {selectedChecklistForPrint.damages.map((dmg, idx) => (
                      <div key={dmg.id} className="p-1.5 border border-slate-200 rounded bg-slate-50">
                        <strong className="text-slate-900">{idx + 1}. {dmg.damageType}</strong> ({dmg.severity}) - Vista {dmg.view}
                        <p className="text-slate-600">{dmg.notes}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="text-center border-t border-slate-400 pt-2">
                  {selectedChecklistForPrint.customerSignature ? (
                    <img 
                      src={selectedChecklistForPrint.customerSignature} 
                      alt="Firma del Cliente" 
                      className="h-16 mx-auto mb-1 object-contain"
                    />
                  ) : (
                    <div className="h-16 flex items-center justify-center text-slate-400 italic text-[11px]">
                      (Firma registrada digitalmente)
                    </div>
                  )}
                  <p className="font-bold text-slate-900">Firma del Cliente</p>
                  <p className="text-[10px] text-slate-500">Conforme con el inventario y estado registrado</p>
                </div>
                <div className="text-center border-t border-slate-400 pt-2">
                  {selectedChecklistForPrint.advisorSignature ? (
                    <img 
                      src={selectedChecklistForPrint.advisorSignature} 
                      alt="Firma del Asesor" 
                      className="h-16 mx-auto mb-1 object-contain"
                    />
                  ) : (
                    <div className="h-16 flex items-center justify-center text-slate-400 italic text-[11px]">
                      (Firma registrada digitalmente)
                    </div>
                  )}
                  <p className="font-bold text-slate-900">{selectedChecklistForPrint.advisorName}</p>
                  <p className="text-[10px] text-slate-500">Asesor de Servicio Receptor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
