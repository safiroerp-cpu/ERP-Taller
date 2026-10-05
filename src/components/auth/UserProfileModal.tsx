import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/erp';
import { 
  User, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  Building, 
  CheckCircle2, 
  X, 
  LogOut,
  Sparkles,
  Sliders,
  Check
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    userRole, 
    permissions, 
    updateUserProfile, 
    switchRole, 
    getRoleLabel, 
    logout 
  } = useAuth();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [branch, setBranch] = useState(currentUser?.companyBranch || 'Sede Central - San Borja');
  const [saveFeedback, setSaveFeedback] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      displayName: displayName.trim(),
      phone: phone.trim(),
      companyBranch: branch.trim()
    });
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 3000);
  };

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-blue-600/20 text-blue-400 border-blue-500/40',
    advisor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    technician: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    inventory: 'bg-purple-500/20 text-purple-400 border-purple-500/40'
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto select-none">
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-lg">
              {currentUser.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Perfil de Usuario & Credenciales
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleColors[currentUser.role]}`}>
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser.email} • {currentUser.companyBranch || 'SAFIRO GROUP'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 text-xs">
          
          {/* User Details */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Información de la Cuenta
            </span>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Nombre y Apellidos
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Correo Electrónico (Solo Lectura)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Teléfono / WhatsApp de Contacto
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+51 987 654 321"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Sede / Área de Trabajo
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Role Switching / Testing Simulation */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                Cambiar / Simular Rol Operativo:
              </span>
              <span className="text-[10px] text-blue-400 font-mono font-bold">
                Actual: {currentUser.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Permite evaluar la interfaz y permisos según el perfil de puesto asignado en el taller:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {(
                [
                  { key: 'admin', label: 'Gerente General', desc: 'Acceso Total' },
                  { key: 'advisor', label: 'Asesor Servicio', desc: 'Recepción & COT' },
                  { key: 'technician', label: 'Técnico Taller', desc: 'Diagnóstico & OT' },
                  { key: 'inventory', label: 'Jefe Almacén', desc: 'Kardex & Stock' }
                ] as const
              ).map(r => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => switchRole(r.key)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    currentUser.role === r.key
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold text-xs">{r.label}</p>
                  <span className={`text-[10px] block ${currentUser.role === r.key ? 'text-blue-100' : 'text-slate-500'}`}>
                    {r.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Permissions Summary */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Permisos Activos para {getRoleLabel(currentUser.role)}
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                { label: 'Recepción & Checklist 360°', allowed: permissions.canReceiveVehicles },
                { label: 'Diagnóstico & Escáner OBD-II', allowed: permissions.canPerformDiagnosis },
                { label: 'Aprobación de Cotizaciones', allowed: permissions.canApproveQuotes },
                { label: 'Gestión de Almacén & Kardex', allowed: permissions.canEditInventory },
                { label: 'Finanzas & Facturación', allowed: permissions.canViewFinancials },
                { label: 'Control de Entrega Final', allowed: permissions.canDeliverVehicles },
                { label: 'Administración de Usuarios', allowed: permissions.canManageUsers }
              ].map((perm, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-300">
                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] font-bold ${
                    perm.allowed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'
                  }`}>
                    {perm.allowed ? '✓' : '✕'}
                  </span>
                  <span className={perm.allowed ? 'text-slate-200' : 'text-slate-500 line-through'}>
                    {perm.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {saveFeedback && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Perfil actualizado exitosamente.</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={async () => {
                await logout();
                onClose();
              }}
              className="px-3.5 py-2 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
