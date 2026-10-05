import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { TechnicalDiagnosis, SystemInspectionItem, ScannerFaultCode, DiagnosisPhoto } from '../../types/erp';
import { 
  Wrench, 
  Cpu, 
  FileText, 
  Plus, 
  Search, 
  Printer, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Layers, 
  Sparkles, 
  Download, 
  Camera, 
  Trash2, 
  ZoomIn, 
  Cloud, 
  ExternalLink,
  Battery
} from 'lucide-react';
import { exportDiagnosisPDF } from '../../utils/pdfExport';
import { useGoogleDrive } from '../../context/GoogleDriveContext';

const COMMON_OBD_CODES: ScannerFaultCode[] = [
  { code: 'P0300', system: 'Motor', description: 'Random/Multiple Cylinder Misfire Detected (Fallo de combustión aleatorio)', severity: 'Grave' },
  { code: 'P0302', system: 'Motor', description: 'Cylinder 2 Misfire Detected (Fallo de combustión en cilindro 2)', severity: 'Grave' },
  { code: 'P0420', system: 'Emisiones', description: 'Catalyst System Efficiency Below Threshold (Eficiencia de convertidor catalítico)', severity: 'Moderado' },
  { code: 'P0171', system: 'Combustible', description: 'System Too Lean (Bank 1) - Mezcla pobre de combustible', severity: 'Moderado' },
  { code: 'C1201', system: 'Frenos ABS', description: 'Engine Control System Malfunction / VSC disabled', severity: 'Moderado' },
  { code: 'B1000', system: 'Airbag / Carrocería', description: 'ECU Malfunction / SRS Sensor Communication', severity: 'Grave' }
];

export const TechnicalDiagnosisManager: React.FC = () => {
  const { 
    diagnoses, 
    workOrders, 
    technicians, 
    vehicles, 
    customers, 
    parts, 
    createDiagnosis, 
    createQuotation,
    getVehicle, 
    getCustomer, 
    getTechnician, 
    getWorkOrder 
  } = useERP();

  const { isConnected, signInWithGoogle, uploadDiagnosisPDFToDrive } = useGoogleDrive();
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveUploadSuccessLink, setDriveUploadSuccessLink] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDiagForPrint, setSelectedDiagForPrint] = useState<TechnicalDiagnosis | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Form State
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState('');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('tech-1');
  const [odometer, setOdometer] = useState<number>(35000);

  // Systems inspection
  const [motorStatus, setMotorStatus] = useState<'ok' | 'advertencia' | 'critico'>('ok');
  const [motorNotes, setMotorNotes] = useState('Funcionamiento estable sin ruidos extraños.');

  const [frenosStatus, setFrenosStatus] = useState<'ok' | 'advertencia' | 'critico'>('ok');
  const [frenosNotes, setFrenosNotes] = useState('Discos y pastillas en rango.');
  const [frenosPadWear, setFrenosPadWear] = useState<number>(30);

  const [suspensionStatus, setSuspensionStatus] = useState<'ok' | 'advertencia' | 'critico'>('ok');
  const [suspensionNotes, setSuspensionNotes] = useState('Bujes y amortiguadores secos y firmes.');

  const [electricoStatus, setElectricoStatus] = useState<'ok' | 'advertencia' | 'critico'>('ok');
  const [electricoNotes, setElectricoNotes] = useState('Voltaje normal.');
  const [batteryVoltage, setBatteryVoltage] = useState<number>(12.6);

  const [transmisionStatus, setTransmisionStatus] = useState<'ok' | 'advertencia' | 'critico'>('ok');
  const [transmisionNotes, setTransmisionNotes] = useState('Nivel de fluido y acople correcto.');

  const [rootCause, setRootCause] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [scannerCodes, setScannerCodes] = useState<ScannerFaultCode[]>([]);
  const [laborHours, setLaborHours] = useState<number>(2.0);

  // Suggested parts list
  const [suggestedPartsList, setSuggestedPartsList] = useState<Array<{
    partId?: string;
    partName: string;
    quantity: number;
    urgency: 'Crítica / Inmediata' | 'Preventiva' | 'Opcional';
  }>>([]);

  const [newPartName, setNewPartName] = useState('');
  const [newPartId, setNewPartId] = useState('');
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartUrgency, setNewPartUrgency] = useState<'Crítica / Inmediata' | 'Preventiva' | 'Opcional'>('Crítica / Inmediata');

  // Photographic Evidences State
  const [photos, setPhotos] = useState<DiagnosisPhoto[]>([]);
  const [photoInputCaption, setPhotoInputCaption] = useState('');
  const [photoInputSystem, setPhotoInputSystem] = useState('Motor');
  const [enlargedPhoto, setEnlargedPhoto] = useState<DiagnosisPhoto | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          const newPhoto: DiagnosisPhoto = {
            id: `photo-${Date.now()}-${index}`,
            url: result,
            caption: photoInputCaption.trim() || `Evidencia fotográfica ${photos.length + index + 1} (${photoInputSystem})`,
            systemTag: photoInputSystem,
            date: new Date().toISOString()
          };
          setPhotos(prev => [...prev, newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
    setPhotoInputCaption('');
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleSelectWorkOrder = (otId: string) => {
    setSelectedWorkOrderId(otId);
    const ot = getWorkOrder(otId);
    if (ot) {
      const veh = getVehicle(ot.vehicleId);
      if (veh) setOdometer(veh.mileage);
      if (ot.technicianId) setSelectedTechnicianId(ot.technicianId);
    }
  };

  const handleAddScannerCode = (codeItem: ScannerFaultCode) => {
    if (!scannerCodes.some(c => c.code === codeItem.code)) {
      setScannerCodes(prev => [...prev, codeItem]);
    }
  };

  const handleAddPartToSuggestion = () => {
    if (!newPartName.trim()) return;
    setSuggestedPartsList(prev => [
      ...prev,
      {
        partId: newPartId || undefined,
        partName: newPartName.trim(),
        quantity: newPartQty,
        urgency: newPartUrgency
      }
    ]);
    setNewPartName('');
    setNewPartId('');
    setNewPartQty(1);
  };

  const handleSelectFromInventory = (partId: string) => {
    setNewPartId(partId);
    const p = parts.find(x => x.id === partId);
    if (p) {
      setNewPartName(p.name);
    }
  };

  const handleSaveDiagnosis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkOrderId) {
      alert('Seleccione una Orden de Trabajo.');
      return;
    }

    const recsArray = recommendations
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    createDiagnosis({
      workOrderId: selectedWorkOrderId,
      technicianId: selectedTechnicianId,
      date: new Date().toISOString(),
      odometer: Number(odometer),
      systems: {
        motor: { status: motorStatus, observation: motorNotes },
        frenos: { status: frenosStatus, observation: frenosNotes, padWearPercent: Number(frenosPadWear) },
        suspension: { status: suspensionStatus, observation: suspensionNotes },
        electricoYBateria: { status: electricoStatus, observation: electricoNotes, batteryVoltage: Number(batteryVoltage), alternatorCharging: true },
        transmision: { status: transmisionStatus, observation: transmisionNotes },
        direccion: { status: 'ok', observation: 'Inspección conforme' },
        escapeYEmisiones: { status: 'ok', observation: 'Sin fugas en línea de escape' },
        climatizacion: { status: 'ok', observation: 'Temperatura y presión correcta' }
      },
      scannerCodes,
      rootCauseAnalysis: rootCause,
      technicianRecommendations: recsArray.length > 0 ? recsArray : ['Inspección periódica recomendada'],
      suggestedParts: suggestedPartsList,
      photos,
      estimatedLaborHours: Number(laborHours),
      status: 'Finalizado'
    });

    setIsModalOpen(false);
    resetForm();
  };

  const handleGenerateQuoteFromDiag = (diag: TechnicalDiagnosis) => {
    const ot = getWorkOrder(diag.workOrderId);
    if (!ot) return;

    const quoteParts = diag.suggestedParts.map((sp, idx) => {
      const invPart = sp.partId ? parts.find(p => p.id === sp.partId) : undefined;
      const unitPrice = invPart ? invPart.unitPrice : 75.00;
      return {
        id: `qp-${idx}-${Date.now()}`,
        partId: sp.partId,
        partName: sp.partName,
        sku: invPart?.sku || `REP-SUG-${idx + 1}`,
        quantity: sp.quantity,
        unitPrice,
        total: unitPrice * sp.quantity
      };
    });

    const laborHourlyRate = 50.00;
    const laborTotal = diag.estimatedLaborHours * laborHourlyRate;

    const laborItems = [
      {
        id: `ql-${Date.now()}`,
        description: `Mano de obra especializada según informe técnico ${diag.code}`,
        hours: diag.estimatedLaborHours,
        hourlyRate: laborHourlyRate,
        total: laborTotal
      }
    ];

    const subtotalParts = quoteParts.reduce((s, p) => s + p.total, 0);
    const subtotalLabor = laborTotal;
    const taxRate = 0.18;
    const taxAmount = (subtotalParts + subtotalLabor) * taxRate;
    const grandTotal = subtotalParts + subtotalLabor + taxAmount;

    createQuotation({
      workOrderId: ot.id,
      customerId: ot.customerId,
      vehicleId: ot.vehicleId,
      date: new Date().toISOString().slice(0, 10),
      expirationDate: new Date(Date.now() + 86400000 * 10).toISOString().slice(0, 10),
      laborItems,
      partItems: quoteParts,
      subtotalLabor,
      subtotalParts,
      discountPercentage: 0,
      discountAmount: 0,
      taxRate,
      taxAmount,
      grandTotal,
      status: 'Borrador',
      paymentTerms: 'Al contado o tarjeta al retiro de la unidad',
      warrantyTerms: '6 meses de garantía en mano de obra y repuestos genuinos'
    });

    setFeedbackNotice(`¡Cotización generada exitosamente en Soles a partir del informe ${diag.code}! Puedes revisarla en la pestaña de Cotizaciones.`);
    setTimeout(() => setFeedbackNotice(null), 6000);
  };

  const handleExportPDF = (diag: TechnicalDiagnosis) => {
    try {
      const ot = getWorkOrder(diag.workOrderId);
      const vehicle = ot ? getVehicle(ot.vehicleId) : undefined;
      const customer = ot ? getCustomer(ot.customerId) : undefined;
      const technician = getTechnician(diag.technicianId);

      exportDiagnosisPDF(diag, { workOrder: ot, vehicle, customer, technician });
      setFeedbackNotice(`Documento PDF generado y descargado con éxito: Informe ${diag.code} (${vehicle?.plate || 'Vehículo'}).`);
      setTimeout(() => setFeedbackNotice(null), 5000);
    } catch (err) {
      console.error('Error al exportar PDF:', err);
      setFeedbackNotice('Error al compilar el PDF de diagnóstico. Intente nuevamente.');
      setTimeout(() => setFeedbackNotice(null), 5000);
    }
  };

  const handleUploadToDrive = async (diag: TechnicalDiagnosis) => {
    if (!isConnected) {
      const confirmed = window.confirm(
        'Google Drive no está conectado aún. ¿Deseas iniciar sesión con Google (safiro.erp@gmail.com) para vincularlo?'
      );
      if (confirmed) {
        const ok = await signInWithGoogle();
        if (!ok) return;
      } else {
        return;
      }
    }

    const ot = getWorkOrder(diag.workOrderId);
    const vehicle = ot ? getVehicle(ot.vehicleId) : undefined;
    const customer = ot ? getCustomer(ot.customerId) : undefined;
    const technician = getTechnician(diag.technicianId);

    const proceed = window.confirm(
      `¿Deseas subir el Informe Técnico ${diag.code} de la placa ${vehicle?.plate || 'S/P'} con sus evidencias fotográficas a la carpeta de Google Drive?`
    );
    if (!proceed) return;

    try {
      setIsUploadingToDrive(true);
      const res = await uploadDiagnosisPDFToDrive(diag, {
        workOrder: ot,
        vehicle,
        customer,
        technician
      });
      setDriveUploadSuccessLink(res.webViewLink || null);
      setFeedbackNotice(
        `¡Informe Técnico ${diag.code} (${vehicle?.plate || 'Vehículo'}) subido a Google Drive con éxito!`
      );
      setTimeout(() => {
        setFeedbackNotice(null);
        setDriveUploadSuccessLink(null);
      }, 9000);
    } catch (err: any) {
      console.error('Error al subir a Drive:', err);
      setFeedbackNotice(err.message || 'Error al subir documento a Google Drive.');
      setTimeout(() => setFeedbackNotice(null), 6000);
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const resetForm = () => {
    setSelectedWorkOrderId('');
    setRootCause('');
    setRecommendations('');
    setScannerCodes([]);
    setSuggestedPartsList([]);
    setMotorStatus('ok');
    setFrenosStatus('ok');
    setSuspensionStatus('ok');
    setElectricoStatus('ok');
    setTransmisionStatus('ok');
    setPhotos([]);
    setPhotoInputCaption('');
    setPhotoInputSystem('Motor');
  };

  const filteredDiagnoses = diagnoses.filter(d => {
    const ot = getWorkOrder(d.workOrderId);
    const veh = ot ? getVehicle(ot.vehicleId) : undefined;
    const term = searchFilter.toLowerCase();
    return (
      d.code.toLowerCase().includes(term) ||
      ot?.code.toLowerCase().includes(term) ||
      veh?.plate.toLowerCase().includes(term) ||
      d.rootCauseAnalysis.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            Informes Técnicos & Diagnóstico Automotriz
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Evaluación multipunto por subsistemas, escáner OBD-II y prescripción de repuestos
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
          Emitir Nuevo Diagnóstico
        </button>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackNotice && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex flex-wrap items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{feedbackNotice}</span>
            {driveUploadSuccessLink && (
              <a
                href={driveUploadSuccessLink}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold inline-flex items-center gap-1 transition-colors"
              >
                <span>Ver en Google Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setFeedbackNotice(null);
              setDriveUploadSuccessLink(null);
            }}
            className="text-emerald-400 hover:text-white text-xs ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar diagnóstico por código, OT, placa o hallazgo técnico..."
          value={searchFilter}
          onChange={e => setSearchFilter(e.target.value)}
          className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
        />
      </div>

      {/* Diagnoses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDiagnoses.map(diag => {
          const ot = getWorkOrder(diag.workOrderId);
          const veh = ot ? getVehicle(ot.vehicleId) : undefined;
          const tech = getTechnician(diag.technicianId);
          const hasCritical = Object.values(diag.systems).some(s => s.status === 'critico');
          const hasWarning = Object.values(diag.systems).some(s => s.status === 'advertencia');

          return (
            <div
              key={diag.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors shadow-sm"
            >
              {/* Card Top */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-400 text-sm">{diag.code}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      • {ot?.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono px-2 py-0.5 bg-slate-950 text-amber-300 border border-amber-500/30 rounded font-semibold text-xs tracking-wider">
                      {veh?.plate}
                    </span>
                    <span className="text-xs text-slate-200 font-medium">
                      {veh?.brand} {veh?.model} ({veh?.year})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-mono">
                    {new Date(diag.date).toLocaleDateString('es-PE')}
                  </span>
                  <div className="mt-1 flex items-center gap-1 justify-end">
                    {diag.photos && diag.photos.length > 0 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                        <Camera className="w-3 h-3" /> {diag.photos.length} {diag.photos.length === 1 ? 'foto' : 'fotos'}
                      </span>
                    )}
                    {hasCritical ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Falla Crítica
                      </span>
                    ) : hasWarning ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Observaciones
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Conforme
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Subsystems Status Pills */}
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                {[
                  { name: 'Motor', item: diag.systems.motor },
                  { name: 'Frenos', item: diag.systems.frenos },
                  { name: 'Suspensión', item: diag.systems.suspension },
                  { name: 'Eléctrico', item: diag.systems.electricoYBateria }
                ].map(sys => (
                  <div
                    key={sys.name}
                    className={`py-1 px-1.5 rounded border ${
                      sys.item.status === 'critico'
                        ? 'bg-rose-950/40 text-rose-300 border-rose-800/60'
                        : sys.item.status === 'advertencia'
                        ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                        : 'bg-slate-950/50 text-slate-300 border-slate-800'
                    }`}
                  >
                    <span className="font-semibold block">{sys.name}</span>
                    <span className="capitalize text-[9px]">{sys.item.status}</span>
                  </div>
                ))}
              </div>

              {/* Root Cause Brief */}
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-2.5 text-xs">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Causa Raíz Diagnosticada:
                </span>
                <p className="text-slate-200 line-clamp-2">{diag.rootCauseAnalysis}</p>
              </div>

              {/* Scanner codes */}
              {diag.scannerCodes.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">OBD-II:</span>
                  {diag.scannerCodes.map(sc => (
                    <span
                      key={sc.code}
                      className="px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-[10px] font-mono text-amber-300"
                      title={sc.description}
                    >
                      {sc.code}
                    </span>
                  ))}
                </div>
              )}

              {/* Bottom Metadata & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">
                  Técnico: <strong className="text-slate-200">{tech?.name || 'Asignado'}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateQuoteFromDiag(diag)}
                    className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded border border-blue-500/30 text-[11px] font-medium transition-colors flex items-center gap-1"
                    title="Exportar repuestos y mano de obra a nueva cotización"
                  >
                    <Sparkles className="w-3 h-3" /> Cotizar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportPDF(diag)}
                    className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded border border-emerald-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-sm"
                    title="Exportar y Descargar Informe Técnico en PDF Formal"
                  >
                    <Download className="w-3 h-3 text-emerald-400" />
                    PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUploadToDrive(diag)}
                    disabled={isUploadingToDrive}
                    className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded border border-blue-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
                    title="Subir Informe a Google Drive (safiro.erp@gmail.com)"
                  >
                    <Cloud className="w-3 h-3 text-blue-400" />
                    Drive
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDiagForPrint(diag)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-[11px] font-medium transition-colors flex items-center gap-1"
                    title="Ver Vista Previa del Informe"
                  >
                    <Printer className="w-3 h-3 text-blue-400" />
                    Vista Previa
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Diagnosis Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Informe de Diagnóstico Técnico Automotriz</h3>
                  <p className="text-xs text-slate-400">Evaluación por sistemas, escáner y prescripción de repuestos</p>
                </div>
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
            <form onSubmit={handleSaveDiagnosis} className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Order & Tech Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Orden de Trabajo en Taller *
                  </label>
                  <select
                    required
                    value={selectedWorkOrderId}
                    onChange={e => handleSelectWorkOrder(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccione OT activa...</option>
                    {workOrders
                      .filter(ot => ot.currentStage !== 'entregado')
                      .map(ot => {
                        const veh = getVehicle(ot.vehicleId);
                        return (
                          <option key={ot.id} value={ot.id}>
                            {ot.code} - {veh?.plate} ({veh?.brand} {veh?.model})
                          </option>
                        );
                      })}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Técnico Evaluador Responsable *
                  </label>
                  <select
                    required
                    value={selectedTechnicianId}
                    onChange={e => setSelectedTechnicianId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Horas de Mano de Obra Estimadas
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={laborHours}
                    onChange={e => setLaborHours(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Subsystems Inspection Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> Inspección por Sistemas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Motor */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">1. Motor & Inyección</span>
                      <div className="flex gap-1">
                        {(['ok', 'advertencia', 'critico'] as const).map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setMotorStatus(st)}
                            className={`px-2 py-0.5 text-[10px] rounded uppercase font-semibold ${
                              motorStatus === st
                                ? st === 'critico' ? 'bg-rose-600 text-white' : st === 'advertencia' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={motorNotes}
                      onChange={e => setMotorNotes(e.target.value)}
                      placeholder="Observaciones de motor, compresión, fugas..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>

                  {/* Frenos */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">2. Sistema de Frenos</span>
                      <div className="flex gap-1">
                        {(['ok', 'advertencia', 'critico'] as const).map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setFrenosStatus(st)}
                            className={`px-2 py-0.5 text-[10px] rounded uppercase font-semibold ${
                              frenosStatus === st
                                ? st === 'critico' ? 'bg-rose-600 text-white' : st === 'advertencia' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={frenosNotes}
                        onChange={e => setFrenosNotes(e.target.value)}
                        placeholder="Pastillas, discos, líquido..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
                      />
                      <div className="w-28 shrink-0 flex items-center gap-1 text-[11px] text-slate-400">
                        <span>Desgaste:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={frenosPadWear}
                          onChange={e => setFrenosPadWear(Number(e.target.value))}
                          className="w-12 bg-slate-900 border border-slate-700 rounded px-1 text-center text-xs text-slate-200"
                        />
                        <span>%</span>
                      </div>
                    </div>
                  </div>

                  {/* Suspensión */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">3. Suspensión & Dirección</span>
                      <div className="flex gap-1">
                        {(['ok', 'advertencia', 'critico'] as const).map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setSuspensionStatus(st)}
                            className={`px-2 py-0.5 text-[10px] rounded uppercase font-semibold ${
                              suspensionStatus === st
                                ? st === 'critico' ? 'bg-rose-600 text-white' : st === 'advertencia' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={suspensionNotes}
                      onChange={e => setSuspensionNotes(e.target.value)}
                      placeholder="Amortiguadores, terminales, roturas..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>

                  {/* Eléctrico */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">4. Sistema Eléctrico & Batería</span>
                      <div className="flex gap-1">
                        {(['ok', 'advertencia', 'critico'] as const).map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setElectricoStatus(st)}
                            className={`px-2 py-0.5 text-[10px] rounded uppercase font-semibold ${
                              electricoStatus === st
                                ? st === 'critico' ? 'bg-rose-600 text-white' : st === 'advertencia' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={electricoNotes}
                        onChange={e => setElectricoNotes(e.target.value)}
                        placeholder="Alternador, luces, fusibles..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
                      />
                      <div className="w-24 shrink-0 flex items-center gap-1 text-[11px] text-slate-400">
                        <Battery className="w-3.5 h-3.5 text-blue-400" />
                        <input
                          type="number"
                          step="0.1"
                          value={batteryVoltage}
                          onChange={e => setBatteryVoltage(Number(e.target.value))}
                          className="w-12 bg-slate-900 border border-slate-700 rounded px-1 text-center text-xs text-slate-200 font-mono"
                        />
                        <span>V</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* OBD-II Fault Codes Picker */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" /> Códigos de Falla OBD-II (Escáner Automotriz)
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {scannerCodes.length} código(s) vinculado(s)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_OBD_CODES.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleAddScannerCode(c)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-blue-400" />
                      <strong>{c.code}</strong> - {c.description.slice(0, 30)}...
                    </button>
                  ))}
                </div>

                {scannerCodes.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {scannerCodes.map(sc => (
                      <div
                        key={sc.code}
                        className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold px-1.5 py-0.5 bg-slate-950 text-amber-300 border border-amber-500/30 rounded">
                            {sc.code}
                          </span>
                          <span className="text-slate-200">{sc.description}</span>
                          <span className="text-[10px] text-slate-500 font-mono">[{sc.system}]</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setScannerCodes(prev => prev.filter(x => x.code !== sc.code))}
                          className="text-slate-400 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Analysis & Conclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Análisis de Causa Raíz *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Detalle técnico del origen de la falla observada..."
                    value={rootCause}
                    onChange={e => setRootCause(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Recomendaciones Técnicas y Procedimientos (Una por línea)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Reemplazar bujías de iridio&#10;Limpieza ultrasónica de inyectores&#10;Prueba de ruta post-reparación"
                    value={recommendations}
                    onChange={e => setRecommendations(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Prescribed Spare Parts */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> Repuestos Requeridos (Prescripción de Almacén)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-4">
                    <select
                      value={newPartId}
                      onChange={e => handleSelectFromInventory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Seleccionar desde Almacén...</option>
                      {parts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.brand} - Stock: {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="O escriba repuesto sugerido..."
                      value={newPartName}
                      onChange={e => setNewPartName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <input
                      type="number"
                      min="1"
                      value={newPartQty}
                      onChange={e => setNewPartQty(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center text-slate-200 font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <select
                      value={newPartUrgency}
                      onChange={e => setNewPartUrgency(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                    >
                      <option value="Crítica / Inmediata">Crítica</option>
                      <option value="Preventiva">Preventiva</option>
                      <option value="Opcional">Opcional</option>
                    </select>
                  </div>
                  <div className="sm:col-span-1">
                    <button
                      type="button"
                      onClick={handleAddPartToSuggestion}
                      className="w-full h-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center py-1.5 transition-colors"
                      title="Agregar repuesto"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {suggestedPartsList.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {suggestedPartsList.map((sp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400">x{sp.quantity}</span>
                          <span className="font-medium text-slate-200">{sp.partName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {sp.urgency}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSuggestedPartsList(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Evidencias Fotográficas */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4" /> Evidencias Fotográficas de la Falla ({photos.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Fotos para que el cliente visualice el daño con claridad
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                      Sistema del Vehículo
                    </label>
                    <select
                      value={photoInputSystem}
                      onChange={e => setPhotoInputSystem(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Motor">Motor / Inyección</option>
                      <option value="Frenos">Frenos / ABS</option>
                      <option value="Suspensión">Suspensión / Dirección</option>
                      <option value="Eléctrico">Eléctrico / Batería</option>
                      <option value="Transmisión">Transmisión / Caja</option>
                      <option value="Emisiones">Escape / Emisiones</option>
                      <option value="Carrocería">Carrocería / Chasis</option>
                    </select>
                  </div>
                  <div className="sm:col-span-6">
                    <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                      Descripción del Hallazgo / Falla
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Fuga en retén de aceite, pastilla con 10% restante, buje desgarrado..."
                      value={photoInputCaption}
                      onChange={e => setPhotoInputCaption(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-end">
                    <label className="w-full cursor-pointer">
                      <span className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                        <Camera className="w-3.5 h-3.5" />
                        Subir Foto(s)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden shadow-sm"
                      >
                        <div className="aspect-video w-full overflow-hidden bg-slate-950 relative">
                          <img
                            src={photo.url}
                            alt={photo.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <button
                            type="button"
                            onClick={() => setEnlargedPhoto(photo)}
                            className="absolute bottom-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Ver ampliada"
                          >
                            <ZoomIn className="w-3 h-3" />
                          </button>
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-600/90 text-white text-[9px] font-bold rounded">
                            {photo.systemTag}
                          </span>
                        </div>
                        <div className="p-2 flex items-start justify-between gap-1">
                          <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                            {photo.caption}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(photo.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 shrink-0 transition-colors"
                            title="Eliminar foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 border border-dashed border-slate-800 rounded-lg bg-slate-950/30">
                    <p className="text-xs text-slate-400">
                      Sin fotografías adjuntas aún.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Sube fotos tomadas desde el celular, tablet o cámara de bahía para sustentar el diagnóstico ante el cliente.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Guardar Diagnóstico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Technical Diagnosis Report */}
      {selectedDiagForPrint && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto print-card">
            {/* Top Bar for Print Modal */}
            <div className="no-print flex items-center justify-between px-6 py-3 bg-slate-900 text-white border-b border-slate-800">
              <span className="font-semibold text-xs flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Informe Técnico Oficial de Taller - Vista de Impresión
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportPDF(selectedDiagForPrint)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Generar y descargar documento PDF formal listo para el cliente"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar PDF Formal
                </button>
                <button
                  type="button"
                  onClick={() => handleUploadToDrive(selectedDiagForPrint)}
                  disabled={isUploadingToDrive}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Subir PDF formal a Google Drive (safiro.erp@gmail.com)"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  {isUploadingToDrive ? 'Subiendo...' : 'Subir a Google Drive'}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" /> Imprimir Documento
                </button>
                <button
                  onClick={() => setSelectedDiagForPrint(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-800">
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-xl font-black uppercase text-slate-900">
                    SAFIRO GROUP • Taller Automotriz
                  </h1>
                  <p className="text-[11px] text-slate-600">
                    Centro Automotriz Especializado • Diagnóstico Electrónico & Mecánica Integral
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block border-2 border-slate-900 px-3 py-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest block text-slate-600">
                      Informe Técnico
                    </span>
                    <span className="font-mono text-base font-extrabold text-slate-900">
                      {selectedDiagForPrint.code}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Fecha: {new Date(selectedDiagForPrint.date).toLocaleString('es-PE')}
                  </p>
                </div>
              </div>

              {/* Vehicle & OT Info */}
              {(() => {
                const ot = getWorkOrder(selectedDiagForPrint.workOrderId);
                const veh = ot ? getVehicle(ot.vehicleId) : undefined;
                const cust = ot ? getCustomer(ot.customerId) : undefined;
                const tech = getTechnician(selectedDiagForPrint.technicianId);
                return (
                  <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 rounded">
                    <div>
                      <h4 className="font-bold uppercase text-[10px] text-slate-500 border-b border-slate-200 pb-1 mb-1.5">
                        Datos del Vehículo & Cliente
                      </h4>
                      <p><strong>Placa:</strong> <span className="font-mono font-bold">{veh?.plate}</span></p>
                      <p><strong>Vehículo:</strong> {veh?.brand} {veh?.model} ({veh?.year})</p>
                      <p><strong>Kilometraje:</strong> <span className="font-mono">{selectedDiagForPrint.odometer.toLocaleString()} km</span></p>
                      <p><strong>Cliente:</strong> {cust?.name}</p>
                    </div>
                    <div>
                      <h4 className="font-bold uppercase text-[10px] text-slate-500 border-b border-slate-200 pb-1 mb-1.5">
                        Datos del Taller & Técnico
                      </h4>
                      <p><strong>Orden de Trabajo:</strong> <span className="font-mono font-bold">{ot?.code}</span></p>
                      <p><strong>Técnico Responsable:</strong> {tech?.name}</p>
                      <p><strong>Especialidad:</strong> {tech?.specialty} ({tech?.grade})</p>
                      <p><strong>Horas Laborales Estimadas:</strong> {selectedDiagForPrint.estimatedLaborHours} hrs</p>
                    </div>
                  </div>
                );
              })()}

              {/* Subsystems Inspection Table */}
              <div className="border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2">Sistema Vehicular</th>
                      <th className="p-2">Estado</th>
                      <th className="p-2">Hallazgos y Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {[
                      { name: 'Motor & Inyección', ...selectedDiagForPrint.systems.motor },
                      { name: 'Frenos & Seguridad', ...selectedDiagForPrint.systems.frenos },
                      { name: 'Suspensión & Dirección', ...selectedDiagForPrint.systems.suspension },
                      { name: 'Eléctrico & Batería', ...selectedDiagForPrint.systems.electricoYBateria },
                      { name: 'Transmisión & Caja', ...selectedDiagForPrint.systems.transmision }
                    ].map(sys => (
                      <tr key={sys.name}>
                        <td className="p-2 font-semibold">{sys.name}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            sys.status === 'critico' ? 'bg-rose-100 text-rose-800' : sys.status === 'advertencia' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {sys.status}
                          </span>
                        </td>
                        <td className="p-2 text-slate-700">{sys.observation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Root Cause & Recommendations */}
              <div className="border border-slate-300 p-3 rounded space-y-2">
                <h4 className="font-bold uppercase text-slate-900 text-[11px]">
                  Diagnóstico / Causa Raíz Detectada:
                </h4>
                <p className="text-slate-800 leading-relaxed">{selectedDiagForPrint.rootCauseAnalysis}</p>
                <h4 className="font-bold uppercase text-slate-900 text-[11px] pt-2">
                  Acciones Correctivas y Recomendaciones Técnicas:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {selectedDiagForPrint.technicianRecommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              {/* Prescribed Parts */}
              {selectedDiagForPrint.suggestedParts.length > 0 && (
                <div className="border border-slate-300 p-3 rounded">
                  <h4 className="font-bold uppercase text-slate-900 text-[11px] mb-2">
                    Repuestos Requeridos para Solución Integral ({selectedDiagForPrint.suggestedParts.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedDiagForPrint.suggestedParts.map((sp, idx) => (
                      <div key={idx} className="p-1.5 border border-slate-200 rounded bg-slate-50 flex items-center justify-between">
                        <div>
                          <strong>{idx + 1}. {sp.partName}</strong>
                          <span className="text-[10px] text-slate-500 block">Urgencia: {sp.urgency}</span>
                        </div>
                        <span className="font-mono font-bold">Cant: {sp.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos */}
              {selectedDiagForPrint.photos && selectedDiagForPrint.photos.length > 0 && (
                <div className="border border-slate-300 p-3 rounded space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <h4 className="font-bold uppercase text-slate-900 text-[11px] flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-blue-700" />
                      Evidencias Fotográficas de la Falla & Registro Visual ({selectedDiagForPrint.photos.length})
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      Imágenes adjuntas para comprensión del cliente
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    {selectedDiagForPrint.photos.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        onClick={() => setEnlargedPhoto(p)}
                        className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 cursor-pointer hover:border-blue-500 transition-colors shadow-sm group"
                      >
                        <div className="aspect-video w-full bg-slate-200 relative overflow-hidden">
                          <img
                            src={p.url}
                            alt={p.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-700 text-white text-[9px] font-bold rounded">
                            {p.systemTag || 'Inspección'}
                          </span>
                          <span className="absolute bottom-1 right-1 p-1 bg-black/60 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <ZoomIn className="w-3 h-3" />
                          </span>
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">
                            {p.caption}
                          </p>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            Evidencia #{idx + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6">
                <div className="text-center border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-900">{getTechnician(selectedDiagForPrint.technicianId)?.name}</p>
                  <p className="text-[10px] text-slate-500">Técnico Automotriz Certificado</p>
                </div>
                <div className="text-center border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-900">Jefe de Taller & Calidad</p>
                  <p className="text-[10px] text-slate-500">SAFIRO GROUP • Taller</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Enlarged Photo Viewer Modal */}
      {enlargedPhoto && (
        <div 
          onClick={() => setEnlargedPhoto(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-3 p-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400 block">
                  {enlargedPhoto.systemTag || 'Inspección'}
                </span>
                <h3 className="text-sm font-bold text-white">
                  {enlargedPhoto.caption}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEnlargedPhoto(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl bg-black">
              <img
                src={enlargedPhoto.url}
                alt={enlargedPhoto.caption}
                className="max-h-[68vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
