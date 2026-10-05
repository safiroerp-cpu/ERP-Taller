import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Appointment } from '../../types/erp';
import { 
  Calendar, 
  Clock, 
  User, 
  Car, 
  Plus, 
  Search, 
  ClipboardCheck, 
  X, 
  CheckCircle2
} from 'lucide-react';

interface AppointmentsManagerProps {
  onGoToReceptionWithAppointment?: (aptId: string) => void;
}

export const AppointmentsManager: React.FC<AppointmentsManagerProps> = ({
  onGoToReceptionWithAppointment
}) => {
  const { 
    appointments, 
    vehicles, 
    customers, 
    addAppointment, 
    updateAppointmentStatus, 
    getCustomer, 
    getVehicle 
  } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [serviceType, setServiceType] = useState<Appointment['serviceType']>('Mantenimiento Preventivo (10k / 20k / 50k km)');
  const [reasonNotes, setReasonNotes] = useState('');
  const [advisorName, setAdvisorName] = useState('Guillermo Castro');

  const handleSelectCustomer = (custId: string) => {
    setSelectedCustomerId(custId);
    const custVehicles = vehicles.filter(v => v.customerId === custId);
    if (custVehicles.length > 0) {
      setSelectedVehicleId(custVehicles[0].id);
    } else {
      setSelectedVehicleId('');
    }
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedVehicleId) {
      alert('Seleccione un cliente y su vehículo.');
      return;
    }

    addAppointment({
      customerId: selectedCustomerId,
      vehicleId: selectedVehicleId,
      scheduledDate,
      scheduledTime,
      serviceType,
      reasonNotes,
      advisorName,
      status: 'Agendada'
    });

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedCustomerId('');
    setSelectedVehicleId('');
    setReasonNotes('');
    setScheduledTime('09:00');
  };

  const filteredAppointments = appointments.filter(apt => {
    const cust = getCustomer(apt.customerId);
    const veh = getVehicle(apt.vehicleId);
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      apt.code.toLowerCase().includes(term) ||
      cust?.name.toLowerCase().includes(term) ||
      veh?.plate.toLowerCase().includes(term) ||
      apt.serviceType.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Gestión de Citas del Taller
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Programación de ingresos, asignación de asesores y vinculación directa con el checklist de recepción
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Agendar Nueva Cita
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por placa, cliente o código CIT..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full sm:w-64"
          />
        </div>

        {/* Status segmented filters */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'Agendada', label: 'Agendadas' },
            { key: 'Recepcionada', label: 'Recepcionadas' },
            { key: 'En Proceso', label: 'En Proceso' },
            { key: 'Completada', label: 'Completadas' }
          ].map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                statusFilter === f.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.map(apt => {
          const cust = getCustomer(apt.customerId);
          const veh = getVehicle(apt.vehicleId);
          const statusStyles = {
            Agendada: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            Recepcionada: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            'En Proceso': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
            Completada: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            Cancelada: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }[apt.status];

          return (
            <div
              key={apt.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors shadow-sm"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-blue-400 text-xs">{apt.code}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusStyles}`}>
                  {apt.status}
                </span>
              </div>

              {/* Date & Time Banner */}
              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>{apt.scheduledDate}</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-300 font-mono font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{apt.scheduledTime} hrs</span>
                </div>
              </div>

              {/* Vehicle & Customer */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono px-2 py-0.5 bg-slate-950 text-amber-300 border border-amber-500/30 rounded font-semibold text-xs tracking-wider">
                    {veh?.plate}
                  </span>
                  <span className="font-semibold text-slate-200">
                    {veh?.brand} {veh?.model}
                  </span>
                </div>
                <div className="text-slate-300 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>{cust?.name} ({cust?.phone})</span>
                </div>
                <p className="text-[11px] text-blue-300 font-medium">
                  {apt.serviceType}
                </p>
                {apt.reasonNotes && (
                  <p className="text-[11px] text-slate-400 italic line-clamp-2 bg-slate-950/40 p-2 rounded border border-slate-800/60">
                    "{apt.reasonNotes}"
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500">
                  Asesor: {apt.advisorName}
                </span>
                <div className="flex items-center gap-1.5">
                  {apt.status === 'Agendada' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onGoToReceptionWithAppointment) {
                          onGoToReceptionWithAppointment(apt.id);
                        } else {
                          updateAppointmentStatus(apt.id, 'Recepcionada');
                        }
                      }}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-colors"
                      title="Abrir checklist de ingreso y recepción"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      Recepcionar
                    </button>
                  )}
                  {apt.status === 'Recepcionada' && (
                    <button
                      type="button"
                      onClick={() => updateAppointmentStatus(apt.id, 'En Proceso')}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-[11px] font-medium"
                    >
                      Iniciar OT
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Appointment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Agendar Nueva Cita de Taller</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveAppointment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Cliente *</label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={e => handleSelectCustomer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="">Seleccione cliente registrado...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Vehículo del Cliente *</label>
                <select
                  required
                  value={selectedVehicleId}
                  onChange={e => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="">Seleccione vehículo...</option>
                  {vehicles
                    .filter(v => !selectedCustomerId || v.customerId === selectedCustomerId)
                    .map(v => (
                      <option key={v.id} value={v.id}>
                        {v.plate} - {v.brand} {v.model} ({v.year})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Fecha de la Cita *</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Hora de Ingreso *</label>
                  <input
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tipo de Servicio Solicitado *</label>
                <select
                  value={serviceType}
                  onChange={e => setServiceType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="Mantenimiento Preventivo (10k / 20k / 50k km)">Mantenimiento Preventivo (10k / 20k / 50k km)</option>
                  <option value="Diagnóstico por Falla / Luz Check Engine">Diagnóstico por Falla / Luz Check Engine</option>
                  <option value="Garantía de Fábrica">Garantía de Fábrica</option>
                  <option value="Sistema de Frenos & Seguridad">Sistema de Frenos & Seguridad</option>
                  <option value="Suspensión y Dirección">Suspensión y Dirección</option>
                  <option value="Planchado y Pintura">Planchado y Pintura</option>
                  <option value="Inspección Pre-Compra / Inspección Técnica">Inspección Pre-Compra / Inspección Técnica</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Observaciones / Síntomas reportados</label>
                <textarea
                  rows={2}
                  placeholder="Detalles provistos por el cliente al momento de agendar..."
                  value={reasonNotes}
                  onChange={e => setReasonNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-500 resize-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Asesor de Servicio Receptor</label>
                <input
                  type="text"
                  value={advisorName}
                  onChange={e => setAdvisorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
