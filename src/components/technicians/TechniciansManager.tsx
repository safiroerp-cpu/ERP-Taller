import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Technician } from '../../types/erp';
import { 
  Users, 
  Wrench, 
  Award, 
  Phone, 
  Star, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Search 
} from 'lucide-react';

export const TechniciansManager: React.FC = () => {
  const { technicians, workOrders, getVehicle } = useERP();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTechs = technicians.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Equipo Técnico & Especialistas de Taller
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Asignación de carga operativa, especialidades automotrices y métricas de desempeño
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
          Total Técnicos Activos: <strong className="text-white font-mono">{technicians.length}</strong>
        </div>
      </div>

      {/* Grid of Technicians */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTechs.map(tech => {
          const assignedOrders = workOrders.filter(
            ot => ot.technicianId === tech.id && ot.currentStage !== 'entregado'
          );

          const statusStyles = {
            Disponible: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            Asignado: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            'En Descanso': 'bg-slate-700/40 text-slate-400 border-slate-600'
          }[tech.status];

          return (
            <div
              key={tech.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm hover:border-slate-700 transition-colors"
            >
              {/* Profile Top */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/30 to-slate-800 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-base">
                    {tech.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{tech.name}</h3>
                    <p className="text-xs text-blue-400 font-medium">{tech.specialty}</p>
                    <span className="text-[10px] text-slate-400 block font-mono">{tech.grade}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusStyles}`}>
                    {tech.status}
                  </span>
                  <div className="flex items-center gap-1 justify-end mt-1 text-amber-400 text-xs font-mono font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{tech.ratingScore}</span>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Órdenes Activas</span>
                  <span className="font-mono font-bold text-white text-base">{assignedOrders.length}</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Contacto Directo</span>
                  <span className="font-mono text-slate-300 text-[11px] block mt-0.5">{tech.phone}</span>
                </div>
              </div>

              {/* Active Assigned Work Orders list */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Unidades Asignadas Actualmente ({assignedOrders.length})
                </span>
                {assignedOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-slate-950/40 p-2 rounded border border-slate-800/60 text-center">
                    Técnico libre sin órdenes en proceso actualmente.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {assignedOrders.map(ot => {
                      const veh = getVehicle(ot.vehicleId);
                      return (
                        <div
                          key={ot.id}
                          className="flex items-center justify-between p-2 bg-slate-950/70 border border-slate-800 rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-400">{ot.code}</span>
                            <span className="font-mono px-1.5 py-0.2 bg-slate-900 text-amber-300 rounded text-[10px] border border-amber-500/30">
                              {veh?.plate}
                            </span>
                            <span className="text-slate-300 text-[11px] truncate">{veh?.brand} {veh?.model}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 capitalize">{ot.currentStage.replace('_', ' ')}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
