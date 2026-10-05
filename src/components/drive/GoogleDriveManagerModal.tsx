import React, { useState } from 'react';
import { useGoogleDrive } from '../../context/GoogleDriveContext';
import { useERP } from '../../context/ERPContext';
import { 
  Cloud, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  LogOut, 
  X, 
  FileText, 
  HardDrive, 
  ShieldCheck, 
  AlertCircle,
  Database
} from 'lucide-react';

interface GoogleDriveManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveManagerModal: React.FC<GoogleDriveManagerModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    user,
    isConnected,
    isConnecting,
    accountEmail,
    error,
    recentDriveFiles,
    signInWithGoogle,
    signOutGoogle,
    uploadSystemBackupToDrive,
    refreshRecentFiles
  } = useGoogleDrive();

  const { exportDatabaseJSON } = useERP();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBackupToDrive = async () => {
    try {
      setIsBackingUp(true);
      setBackupSuccess(null);
      const jsonData = exportDatabaseJSON(false);
      const result = await uploadSystemBackupToDrive(jsonData);
      setBackupSuccess(`¡Respaldo subido a Google Drive con éxito! (${result.name})`);
      setTimeout(() => setBackupSuccess(null), 6000);
    } catch (err: any) {
      console.error('Error al respaldar en Drive:', err);
      alert(err.message || 'Error al subir respaldo a Google Drive');
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Integración con Google Drive
                </h3>
                {isConnected && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Conectado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Almacenamiento seguro de informes técnicos, cotizaciones y respaldos en la nube
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

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Connection Status Card */}
          {isConnected ? (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Google User" 
                      className="w-10 h-10 rounded-full border border-blue-400/50" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                      {accountEmail?.charAt(0).toUpperCase() || 'G'}
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                      Cuenta Vinculada
                    </span>
                    <strong className="text-sm font-semibold text-white block">
                      {accountEmail || 'Usuario Google'}
                    </strong>
                    <span className="text-[11px] text-slate-400">
                      Carpeta destino: <strong className="text-slate-300">SAFIRO GROUP - ERP Taller Automotriz</strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={signOutGoogle}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-center"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Desconectar
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Listo para sincronizar PDFs y respaldos
                </span>

                <button
                  type="button"
                  onClick={handleBackupToDrive}
                  disabled={isBackingUp}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Database className="w-3.5 h-3.5" />
                  {isBackingUp ? 'Subiendo Respaldo...' : 'Crear Respaldo en Drive'}
                </button>
              </div>

              {backupSuccess && (
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{backupSuccess}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 mx-auto flex items-center justify-center text-blue-400">
                <HardDrive className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">
                  Vincula tu cuenta de Google Drive
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Conéctate con tu cuenta oficial (<strong className="text-blue-300">safiro.erp@gmail.com</strong>) para guardar copias de seguridad automáticas y reportes técnicos con fotos en tu Drive.
                </p>
              </div>

              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={isConnecting}
                className="inline-flex items-center justify-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {isConnecting ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
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
                )}
                <span>
                  {isConnecting ? 'Conectando con Google...' : 'Iniciar Sesión con Google (safiro.erp@gmail.com)'}
                </span>
              </button>
            </div>
          )}

          {/* Recent Files Section */}
          {isConnected && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  Archivos Recientes en Google Drive ({recentDriveFiles.length})
                </span>
                <button
                  type="button"
                  onClick={refreshRecentFiles}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Actualizar
                </button>
              </div>

              {recentDriveFiles.length > 0 ? (
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-800 bg-slate-950 border border-slate-800 rounded-xl">
                  {recentDriveFiles.map(file => (
                    <div 
                      key={file.id}
                      className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-900/60 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-200 truncate font-medium">
                          {file.name}
                        </span>
                      </div>
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <span>Abrir</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-3 text-center border border-dashed border-slate-800 rounded-xl">
                  Aún no has subido reportes a Drive en esta sesión. Los PDFs que envíes desde informes o cotizaciones aparecerán aquí.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Permisos restringidos a la carpeta del taller (drive.file)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
