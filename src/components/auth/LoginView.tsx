import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/erp';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Car, 
  Sparkles,
  RefreshCw,
  HelpCircle,
  Briefcase
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle, 
    loginAsDemoRole, 
    resetPassword,
    error, 
    clearError,
    isLoading 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form fields
  const [loginEmail, setLoginEmail] = useState('safiro.erp@gmail.com');
  const [loginPassword, setLoginPassword] = useState('safiro2026');
  const [showPassword, setShowPassword] = useState(false);

  // Register form fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('advisor');
  const [regPhone, setRegPhone] = useState('+51 ');

  // Password reset modal state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Action status
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) return;
    setIsSubmitting(true);
    await loginWithEmail(loginEmail, loginPassword);
    setIsSubmitting(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail.trim() || !regPassword || !regName.trim()) return;
    setIsSubmitting(true);
    await registerWithEmail(regName, regEmail, regPassword, regRole, regPhone);
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    await loginWithGoogle();
    setIsSubmitting(false);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setIsResetting(true);
    const ok = await resetPassword(resetEmail.trim());
    setIsResetting(false);
    if (ok) {
      setResetSuccessMessage(`Se han enviado las instrucciones de restablecimiento a ${resetEmail.trim()}. Revise su bandeja de entrada o spam.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background aesthetic glowing automotive grids */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20 border border-blue-400/30 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-xl text-white tracking-wider">SG</span>
            <Wrench className="w-5 h-5 text-blue-200" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          SAFIRO GROUP
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-blue-400 uppercase tracking-widest mt-0.5">
          Concesionario & Taller Automotriz Especializado
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Sistema de Control de Citas, Inspección 360°, Diagnóstico OBD-II, Cotizaciones y Almacén
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl py-6 px-5 sm:px-8 shadow-2xl rounded-2xl space-y-5">
          
          {/* Tabs: Iniciar Sesión / Registrar Personal */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                clearError();
                setActiveTab('login');
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => {
                clearError();
                setActiveTab('register');
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Nuevo Personal</span>
            </button>
          </div>

          {/* Feedback error alert */}
          {error && (
            <div className="p-3 bg-rose-950/70 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Error de Autenticación:</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Correo Electrónico Corporativo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="usuario@safirogroup.pe o safiro.erp@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">
                    Contraseña de Acceso
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(loginEmail);
                      setResetSuccessMessage(null);
                      setIsResetOpen(true);
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar al Sistema ERP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER EMPLOYEE FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Nombre Completo del Personal *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Ej: Lic. Martín Vega"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="nombre@safirogroup.pe"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Teléfono / WhatsApp Móvil
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="+51 987 654 321"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Rol Operativo en Taller *
                  </label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="advisor">Asesor de Servicio (Recepción & Cotizaciones)</option>
                    <option value="technician">Técnico Mecánico / Diagnóstico</option>
                    <option value="inventory">Jefe de Almacén (Kardex & Repuestos)</option>
                    <option value="admin">Administrador General / Gerencia</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Contraseña Inicial *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Registrar & Acceder al Taller</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* OR DIVIDER */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              O conéctate con
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* GOOGLE SIGN IN BUTTON (Officially styled with safiro.erp prefill) */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.14C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.26C.46 8.19 0 10.03 0 12s.46 3.81 1.26 5.41l4.02-3.14z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.59l4.02 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Iniciar Sesión con Google (safiro.erp@gmail.com)</span>
          </button>

          {/* QUICK DEMO 1-CLICK SELECTOR PANEL */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Acceso Rápido por Rol (Demostración 1-Clic):
              </span>
              <span className="text-[10px] text-slate-500">Sin escribir contraseña</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* ADMIN */}
              <button
                type="button"
                onClick={() => loginAsDemoRole('admin')}
                className="p-2 bg-slate-950 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-500 rounded-xl text-left transition-all group"
              >
                <span className="text-[9px] font-bold text-blue-400 uppercase block tracking-wider">
                  Gerencia
                </span>
                <p className="text-xs font-bold text-white truncate group-hover:text-blue-300">
                  Carlos Safiro
                </p>
                <span className="text-[10px] text-slate-500 block truncate">Admin Total</span>
              </button>

              {/* ASESOR */}
              <button
                type="button"
                onClick={() => loginAsDemoRole('advisor')}
                className="p-2 bg-slate-950 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-500 rounded-xl text-left transition-all group"
              >
                <span className="text-[9px] font-bold text-amber-400 uppercase block tracking-wider">
                  Asesor
                </span>
                <p className="text-xs font-bold text-white truncate group-hover:text-amber-300">
                  Guillermo C.
                </p>
                <span className="text-[10px] text-slate-500 block truncate">Recepción & Citas</span>
              </button>

              {/* TECNICO */}
              <button
                type="button"
                onClick={() => loginAsDemoRole('technician')}
                className="p-2 bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500 rounded-xl text-left transition-all group"
              >
                <span className="text-[9px] font-bold text-emerald-400 uppercase block tracking-wider">
                  Técnico
                </span>
                <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300">
                  Ing. Mateo H.
                </p>
                <span className="text-[10px] text-slate-500 block truncate">Diagnóstico OBD</span>
              </button>

              {/* ALMACEN */}
              <button
                type="button"
                onClick={() => loginAsDemoRole('inventory')}
                className="p-2 bg-slate-950 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500 rounded-xl text-left transition-all group"
              >
                <span className="text-[9px] font-bold text-purple-400 uppercase block tracking-wider">
                  Almacén
                </span>
                <p className="text-xs font-bold text-white truncate group-hover:text-purple-300">
                  Raúl Valdivia
                </p>
                <span className="text-[10px] text-slate-500 block truncate">Kardex & Repuestos</span>
              </button>
            </div>
          </div>

        </div>

        {/* Security / SSL Footer */}
        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Autenticación Segura Firebase
          </span>
          <span>•</span>
          <span>Encriptación SSL 256-bit</span>
          <span>•</span>
          <span>SAFIRO GROUP ERP v2.8</span>
        </div>
      </div>

      {/* PASSWORD RESET MODAL */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Recuperar Contraseña</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsResetOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {resetSuccessMessage ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enlace de Recuperación Enviado</span>
                </div>
                <p>{resetSuccessMessage}</p>
                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  Regresar al Inicio de Sesión
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3.5 text-xs">
                <p className="text-slate-300">
                  Ingrese el correo electrónico registrado con su cuenta de SAFIRO GROUP. Le enviaremos un enlace oficial para restablecer su contraseña.
                </p>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="usuario@safirogroup.pe"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-md flex items-center gap-1.5"
                  >
                    {isResetting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    <span>Enviar Correo</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
