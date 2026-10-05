import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Quotation, QuotationLaborItem, QuotationPartItem } from '../../types/erp';
import { 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Send, 
  Printer, 
  X, 
  Search, 
  DollarSign, 
  Wrench, 
  Package, 
  Sparkles, 
  Download, 
  Cloud, 
  ExternalLink 
} from 'lucide-react';
import { exportQuotationPDF } from '../../utils/pdfExport';
import { useGoogleDrive } from '../../context/GoogleDriveContext';

export const QuotationManager: React.FC = () => {
  const { 
    quotations, 
    workOrders, 
    diagnoses, 
    parts, 
    customers, 
    vehicles, 
    createQuotation, 
    updateQuotationStatus, 
    getVehicle, 
    getCustomer, 
    getWorkOrder, 
    getTechnician, 
    formatCurrency 
  } = useERP();

  const { isConnected, signInWithGoogle, uploadQuotationPDFToDrive } = useGoogleDrive();
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveUploadSuccessLink, setDriveUploadSuccessLink] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<Quotation | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Form State
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [diagnosisImportBanner, setDiagnosisImportBanner] = useState<string | null>(null);
  const [laborItems, setLaborItems] = useState<QuotationLaborItem[]>([]);
  const [partsItems, setPartsItems] = useState<QuotationPartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentTerms, setPaymentTerms] = useState('50% anticipo a la aprobación, 50% al retiro del vehículo en caja');
  const [warrantyTerms, setWarrantyTerms] = useState('12 meses o 10,000 km en repuestos genuinos y mano de obra especializada');

  // Input states for new Labor
  const [newLaborDesc, setNewLaborDesc] = useState('');
  const [newLaborHours, setNewLaborHours] = useState<number>(1.5);
  const [newLaborRate, setNewLaborRate] = useState<number>(50.0);

  // Input states for new Part
  const [selectedCatalogPartId, setSelectedCatalogPartId] = useState('');
  const [customPartName, setCustomPartName] = useState('');
  const [customPartQty, setCustomPartQty] = useState<number>(1);
  const [customPartPrice, setCustomPartPrice] = useState<number>(45.0);

  const handleSelectWorkOrder = (otId: string) => {
    setSelectedWorkOrderId(otId);
    const ot = getWorkOrder(otId);
    if (!ot) return;
    setSelectedVehicleId(ot.vehicleId);
    setSelectedCustomerId(ot.customerId);

    const diag = diagnoses.find(d => d.id === ot.diagnosisId || d.workOrderId === ot.id);
    if (diag) {
      setDiagnosisImportBanner(
        `Se han cargado automáticamente los repuestos e insumos y las horas de mano de obra del ${diag.code}. Puedes editarlos, cambiar precios/cantidades o eliminarlos libremente.`
      );

      const diagLaborHours = diag.estimatedLaborHours || 2.0;
      const initialHourlyRate = 50.0;
      setLaborItems([
        {
          id: `l-${Date.now()}-1`,
          description: `Servicio técnico y mano de obra especializada (${diag.code})`,
          hours: diagLaborHours,
          hourlyRate: initialHourlyRate,
          total: diagLaborHours * initialHourlyRate
        }
      ]);

      if (diag.suggestedParts && diag.suggestedParts.length > 0) {
        const loadedParts: QuotationPartItem[] = diag.suggestedParts.map((sp, idx) => {
          const invPart = sp.partId ? parts.find(p => p.id === sp.partId) : undefined;
          const unitPrice = invPart ? invPart.unitPrice : 65.0;
          return {
            id: `p-${Date.now()}-${idx}`,
            partId: sp.partId,
            partName: sp.partName,
            sku: invPart?.sku || `REP-DIAG-${idx + 1}`,
            quantity: sp.quantity || 1,
            unitPrice: unitPrice,
            total: (sp.quantity || 1) * unitPrice
          };
        });
        setPartsItems(loadedParts);
      }
    } else {
      setDiagnosisImportBanner(null);
      setLaborItems([
        {
          id: `l-${Date.now()}-default`,
          description: 'Mano de obra especializada y protocolo de servicio',
          hours: 2.0,
          hourlyRate: 50.0,
          total: 100.0
        }
      ]);
    }
  };

  const handleAddLabor = () => {
    if (!newLaborDesc.trim()) return;
    const hours = Number(newLaborHours) || 1;
    const rate = Number(newLaborRate) || 50;
    const total = hours * rate;
    setLaborItems(prev => [
      ...prev,
      {
        id: `l-${Date.now()}`,
        description: newLaborDesc.trim(),
        hours,
        hourlyRate: rate,
        total
      }
    ]);
    setNewLaborDesc('');
    setNewLaborHours(1.5);
    setNewLaborRate(50.0);
  };

  const handleUpdateLaborItem = (id: string, field: 'hours' | 'hourlyRate' | 'description', value: any) => {
    setLaborItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'hours' || field === 'hourlyRate') {
          updated.total = Number(updated.hours) * Number(updated.hourlyRate);
        }
        return updated;
      }
      return item;
    }));
  };

  const handleAddPart = () => {
    let name = customPartName;
    let sku = 'REP-REPUESTO';
    let unitPrice = Number(customPartPrice) || 50;
    let partId: string | undefined = undefined;

    if (selectedCatalogPartId) {
      const invPart = parts.find(p => p.id === selectedCatalogPartId);
      if (invPart) {
        name = invPart.name;
        sku = invPart.sku;
        unitPrice = invPart.unitPrice;
        partId = invPart.id;
      }
    }

    if (!name.trim()) return;
    const qty = Number(customPartQty) || 1;

    setPartsItems(prev => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        partId,
        partName: name,
        sku,
        quantity: qty,
        unitPrice,
        total: qty * unitPrice
      }
    ]);

    setSelectedCatalogPartId('');
    setCustomPartName('');
    setCustomPartQty(1);
    setCustomPartPrice(45.0);
  };

  const handleUpdatePartItem = (id: string, field: 'quantity' | 'unitPrice' | 'partName', value: any) => {
    setPartsItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      }
      return item;
    }));
  };

  const subtotalLabor = laborItems.reduce((s, l) => s + l.total, 0);
  const subtotalParts = partsItems.reduce((s, p) => s + p.total, 0);
  const rawSubtotal = subtotalLabor + subtotalParts;
  const discountAmount = (rawSubtotal * (Number(discountPercent) || 0)) / 100;
  const taxableBase = rawSubtotal - discountAmount;
  const taxRate = 0.18; // 18% IGV Peru
  const taxAmount = taxableBase * taxRate;
  const grandTotal = taxableBase + taxAmount;

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkOrderId || !selectedVehicleId || !selectedCustomerId) {
      alert('Por favor complete la selección de Orden de Trabajo y Vehículo.');
      return;
    }
    if (laborItems.length === 0 && partsItems.length === 0) {
      alert('Agregue al menos un ítem de mano de obra o repuesto.');
      return;
    }

    createQuotation({
      workOrderId: selectedWorkOrderId,
      customerId: selectedCustomerId,
      vehicleId: selectedVehicleId,
      date: new Date().toISOString().slice(0, 10),
      expirationDate: new Date(Date.now() + 86400000 * 15).toISOString().slice(0, 10),
      laborItems,
      partItems: partsItems,
      subtotalLabor,
      subtotalParts,
      discountPercentage: discountPercent,
      discountAmount,
      taxRate,
      taxAmount,
      grandTotal,
      status: 'Borrador',
      paymentTerms,
      warrantyTerms
    });

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedWorkOrderId('');
    setSelectedCustomerId('');
    setSelectedVehicleId('');
    setLaborItems([]);
    setPartsItems([]);
    setDiscountPercent(0);
    setDiagnosisImportBanner(null);
  };

  const handleExportPDF = (quote: Quotation) => {
    try {
      const ot = getWorkOrder(quote.workOrderId);
      const vehicle = getVehicle(quote.vehicleId);
      const customer = getCustomer(quote.customerId);
      const technician = ot?.technicianId ? getTechnician(ot.technicianId) : undefined;

      exportQuotationPDF(quote, { workOrder: ot, vehicle, customer, technician });
      setFeedbackNotice(`Cotización PDF ${quote.code} (${vehicle?.plate || 'Vehículo'}) generada y descargada exitosamente.`);
      setTimeout(() => setFeedbackNotice(null), 5000);
    } catch (err) {
      console.error('Error al exportar PDF de cotización:', err);
      setFeedbackNotice('Error al compilar el PDF de la cotización. Intente nuevamente.');
      setTimeout(() => setFeedbackNotice(null), 5000);
    }
  };

  const handleUploadToDrive = async (quote: Quotation) => {
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

    const ot = getWorkOrder(quote.workOrderId);
    const vehicle = getVehicle(quote.vehicleId);
    const customer = getCustomer(quote.customerId);
    const technician = ot?.technicianId ? getTechnician(ot.technicianId) : undefined;

    const proceed = window.confirm(
      `¿Deseas subir la Cotización ${quote.code} de la placa ${vehicle?.plate || 'S/P'} (Total ${formatCurrency(quote.grandTotal)}) a la carpeta de Google Drive?`
    );
    if (!proceed) return;

    try {
      setIsUploadingToDrive(true);
      const res = await uploadQuotationPDFToDrive(quote, {
        workOrder: ot,
        vehicle,
        customer,
        technician
      });
      setDriveUploadSuccessLink(res.webViewLink || null);
      setFeedbackNotice(
        `¡Cotización ${quote.code} (${vehicle?.plate || 'Vehículo'}) subida a Google Drive con éxito!`
      );
      setTimeout(() => {
        setFeedbackNotice(null);
        setDriveUploadSuccessLink(null);
      }, 9000);
    } catch (err: any) {
      console.error('Error al subir cotización a Drive:', err);
      setFeedbackNotice(err.message || 'Error al subir cotización a Google Drive.');
      setTimeout(() => setFeedbackNotice(null), 6000);
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const filteredQuotes = quotations.filter(q => {
    const cust = getCustomer(q.customerId);
    const veh = getVehicle(q.vehicleId);
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      q.code.toLowerCase().includes(term) ||
      cust?.name.toLowerCase().includes(term) ||
      veh?.plate.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            Cotizaciones & Proformas Comerciales (S/ Soles)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            SAFIRO GROUP • Desglose explícito de mano de obra, horas hombre, repuestos e IGV (18%)
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
          Nueva Cotización
        </button>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackNotice && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex flex-wrap items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por COT, placa peruana o cliente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full sm:w-64"
          />
        </div>

        {/* Status segmented filters */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'Borrador', label: 'Borrador' },
            { key: 'Enviada', label: 'Enviadas' },
            { key: 'Aprobada', label: 'Aprobadas' },
            { key: 'Rechazada', label: 'Rechazadas' }
          ].map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                statusFilter === f.key
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredQuotes.map(quote => {
          const cust = getCustomer(quote.customerId);
          const veh = getVehicle(quote.vehicleId);
          const ot = getWorkOrder(quote.workOrderId);

          const statusStyles = {
            Borrador: 'bg-slate-800 text-slate-300 border-slate-700',
            Enviada: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            Aprobada: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            Rechazada: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }[quote.status];

          return (
            <div
              key={quote.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              {/* Left Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-400 text-sm">{quote.code}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${statusStyles}`}>
                    {quote.status}
                  </span>
                  {ot && <span className="text-slate-400 text-xs font-mono">({ot.code})</span>}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono px-2 py-0.5 bg-slate-950 text-amber-300 border border-amber-500/30 rounded font-semibold text-xs tracking-wider">
                    {veh?.plate}
                  </span>
                  <span className="text-slate-200 font-medium">{veh?.brand} {veh?.model}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">{cust?.name}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Emitida: {quote.date} • Vence: {quote.expirationDate} • {quote.laborItems.length} servicios MO • {quote.partItems.length} repuestos
                </p>
              </div>

              {/* Middle Financial Summary (Peruvian Soles) */}
              <div className="text-left md:text-right shrink-0">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Total Proforma</span>
                <span className="font-mono font-black text-xl text-white tabular-nums">
                  {formatCurrency(quote.grandTotal)}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  (IGV 18%: {formatCurrency(quote.taxAmount)})
                </span>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                {quote.status === 'Borrador' && (
                  <button
                    type="button"
                    onClick={() => updateQuotationStatus(quote.id, 'Enviada')}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-400" />
                    Enviar
                  </button>
                )}
                {quote.status === 'Enviada' && (
                  <>
                    <button
                      type="button"
                      onClick={() => updateQuotationStatus(quote.id, 'Aprobada')}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                      title="Aprobar y pasar orden a En Reparación (descuenta stock)"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Aprobar
                    </button>
                    <button
                      type="button"
                      onClick={() => updateQuotationStatus(quote.id, 'Rechazada')}
                      className="px-2 py-1.5 bg-slate-800 hover:bg-rose-950/40 text-rose-400 rounded border border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleExportPDF(quote)}
                  className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                  title="Exportar y Descargar Cotización Formal en PDF"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleUploadToDrive(quote)}
                  disabled={isUploadingToDrive}
                  className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded border border-blue-500/30 text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm disabled:opacity-50"
                  title="Subir Cotización a Google Drive (safiro.erp@gmail.com)"
                >
                  <Cloud className="w-3.5 h-3.5 text-blue-400" />
                  Drive
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQuoteForPrint(quote)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                  title="Ver Proforma Imprimible / Vista Previa"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  Proforma
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Quotation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-base font-bold text-white">SAFIRO GROUP • Nueva Cotización / Proforma</h3>
                  <p className="text-xs text-slate-400">
                    Cálculo transparente en moneda nacional (S/ Soles) con especificación de Horas Hombre y Repuestos
                  </p>
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

            {/* Body */}
            <form onSubmit={handleSaveQuotation} className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Order and Diagnosis Selection */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="text-xs font-bold text-slate-200 block mb-1">
                      1. Seleccionar Orden de Trabajo (OT) *
                    </label>
                    <select
                      required
                      value={selectedWorkOrderId}
                      onChange={e => handleSelectWorkOrder(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Seleccione OT activa...</option>
                      {workOrders.map(ot => {
                        const veh = getVehicle(ot.vehicleId);
                        const diag = diagnoses.find(d => d.workOrderId === ot.id || d.id === ot.diagnosisId);
                        return (
                          <option key={ot.id} value={ot.id}>
                            {ot.code} - {veh?.plate} ({veh?.brand} {veh?.model}) {diag ? `[Con Diagnóstico: ${diag.code}]` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="sm:col-span-4">
                    <label className="text-xs font-bold text-blue-300 block mb-1">
                      O Vincular desde Diagnóstico Técnico:
                    </label>
                    <select
                      value=""
                      onChange={e => {
                        if (e.target.value) {
                          const diag = diagnoses.find(d => d.id === e.target.value);
                          if (diag) {
                            handleSelectWorkOrder(diag.workOrderId);
                          }
                        }
                      }}
                      className="w-full bg-slate-900 border border-blue-500/40 rounded-lg px-3 py-2 text-xs text-blue-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Cargar repuestos de diagnóstico...</option>
                      {diagnoses.map(d => {
                        const ot = getWorkOrder(d.workOrderId);
                        const veh = ot ? getVehicle(ot.vehicleId) : undefined;
                        return (
                          <option key={d.id} value={d.id}>
                            {d.code} • {veh?.plate} ({d.suggestedParts.length} repuestos sugeridos)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-200 block mb-1">
                      Descuento (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={discountPercent}
                      onChange={e => setDiscountPercent(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {selectedWorkOrderId && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      Vehículo: <strong className="text-white">{getVehicle(selectedVehicleId)?.plate || '---'}</strong> • Cliente: <strong className="text-white">{getCustomer(selectedCustomerId)?.name || '---'}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectWorkOrder(selectedWorkOrderId)}
                      className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      title="Vuelve a cargar los repuestos prescritos por el técnico en el informe"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      Recargar Repuestos e Insumos del Diagnóstico
                    </button>
                  </div>
                )}
              </div>

              {/* Diagnosis Auto-fill Notification Banner */}
              {diagnosisImportBanner && (
                <div className="p-3.5 bg-blue-950/40 border border-blue-500/40 rounded-xl flex items-start gap-2.5 text-xs text-blue-200">
                  <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-white block">Vinculación con Informe Técnico de Diagnóstico:</strong>
                    <span>{diagnosisImportBanner}</span>
                  </div>
                </div>
              )}

              {/* 1. Mano de Obra Section */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-4 h-4" /> 1. Mano de Obra & Procedimientos Mecánicos
                  </h4>
                  <span className="text-xs font-mono text-slate-300">
                    Subtotal MO: <strong className="text-white">{formatCurrency(subtotalLabor)}</strong>
                  </span>
                </div>

                {/* Add Labor Item Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <div className="sm:col-span-5">
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Descripción del Trabajo Mecánico
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Mantenimiento preventivo, cambio de pastillas..."
                      value={newLaborDesc}
                      onChange={e => setNewLaborDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-bold text-amber-300 block mb-1">
                      Horas Hombre (HH - Tiempo)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-[10px] font-black text-amber-400 select-none">
                        HH:
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={newLaborHours}
                        onChange={e => setNewLaborHours(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-9 py-2 text-xs text-slate-200 font-mono font-bold text-center focus:outline-none focus:border-amber-400"
                      />
                      <span className="absolute right-2 text-[10px] text-slate-400 select-none font-mono">
                        hrs
                      </span>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                      Costo x Hora (S/ / HH)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-2 text-[10px] font-black text-emerald-400 select-none">
                        S/
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="5"
                        value={newLaborRate}
                        onChange={e => setNewLaborRate(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-6 pr-8 py-2 text-xs text-slate-200 font-mono font-bold text-right focus:outline-none focus:border-emerald-400"
                      />
                      <span className="absolute right-1.5 text-[9px] text-slate-400 select-none">
                        /hr
                      </span>
                    </div>
                  </div>
                  <div className="sm:col-span-2 flex items-start pt-5">
                    <button
                      type="button"
                      onClick={handleAddLabor}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Agregar MO
                    </button>
                  </div>
                </div>

                {/* Labor items table */}
                {laborItems.length > 0 && (
                  <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/50">
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      <div className="col-span-5">Descripción del Trabajo</div>
                      <div className="col-span-3 text-center">Horas Hombre (HH - Tiempo)</div>
                      <div className="col-span-2 text-right">Costo x Hora (S/ / HH)</div>
                      <div className="col-span-2 text-right">Subtotal MO (S/)</div>
                    </div>
                    <div className="divide-y divide-slate-800">
                      {laborItems.map(item => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center text-xs">
                          <div className="col-span-5">
                            <input
                              type="text"
                              value={item.description}
                              onChange={e => handleUpdateLaborItem(item.id, 'description', e.target.value)}
                              className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-blue-500 text-slate-200 font-medium"
                            />
                          </div>
                          <div className="col-span-3 flex justify-center">
                            <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 shadow-sm">
                              <span className="text-[10px] font-bold text-amber-400">HH:</span>
                              <input
                                type="number"
                                step="0.5"
                                min="0.1"
                                value={item.hours}
                                onChange={e => handleUpdateLaborItem(item.id, 'hours', Number(e.target.value))}
                                className="w-12 text-center font-mono font-bold text-amber-300 bg-transparent focus:outline-none"
                              />
                              <span className="text-[10px] text-slate-400">hrs</span>
                            </div>
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 shadow-sm">
                              <span className="text-[10px] font-bold text-emerald-400">S/</span>
                              <input
                                type="number"
                                step="5"
                                min="1"
                                value={item.hourlyRate}
                                onChange={e => handleUpdateLaborItem(item.id, 'hourlyRate', Number(e.target.value))}
                                className="w-14 text-right font-mono font-bold text-slate-200 bg-transparent focus:outline-none"
                              />
                              <span className="text-[10px] text-slate-400">/hr</span>
                            </div>
                          </div>
                          <div className="col-span-2 flex items-center justify-end gap-2">
                            <span className="font-mono font-bold text-emerald-400">
                              {formatCurrency(item.total)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setLaborItems(prev => prev.filter(l => l.id !== item.id))}
                              className="text-slate-500 hover:text-rose-400 p-1"
                              title="Eliminar tarea"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Repuestos & Insumos Section */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      2. Repuestos & Insumos Prescritos
                    </h4>
                    <span className="text-[11px] text-slate-400">({partsItems.length} ítems)</span>
                  </div>
                  <span className="text-xs font-mono text-slate-300">
                    Subtotal Repuestos: <strong className="text-white">{formatCurrency(subtotalParts)}</strong>
                  </span>
                </div>

                {/* Add Part Form */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <div className="sm:col-span-5">
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Seleccionar de Almacén SAFIRO GROUP
                    </label>
                    <select
                      value={selectedCatalogPartId}
                      onChange={e => {
                        setSelectedCatalogPartId(e.target.value);
                        const p = parts.find(x => x.id === e.target.value);
                        if (p) {
                          setCustomPartName(p.name);
                          setCustomPartPrice(p.unitPrice);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200"
                    >
                      <option value="">Buscar en catálogo de almacén...</option>
                      {parts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.stock}) - {formatCurrency(p.unitPrice)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      O Nombre de Repuesto / Insumo
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre del repuesto..."
                      value={customPartName}
                      onChange={e => setCustomPartName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="text-[11px] font-bold text-amber-300 block mb-1 text-center">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={customPartQty}
                      onChange={e => setCustomPartQty(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200 text-center font-mono font-bold"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="text-[11px] font-bold text-emerald-300 block mb-1 text-center">
                      Precio (S/)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={customPartPrice}
                      onChange={e => setCustomPartPrice(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200 font-mono font-bold text-center"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-end">
                    <button
                      type="button"
                      onClick={handleAddPart}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Agregar Rep.
                    </button>
                  </div>
                </div>

                {/* Parts Table */}
                {partsItems.length > 0 && (
                  <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/50">
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      <div className="col-span-5">Repuesto / Insumo (Prescrito en Diagnóstico)</div>
                      <div className="col-span-2">Código SKU</div>
                      <div className="col-span-1 text-center">Cantidad</div>
                      <div className="col-span-2 text-right">Precio Unit. (S/)</div>
                      <div className="col-span-2 text-right">Total Rep. (S/)</div>
                    </div>
                    <div className="divide-y divide-slate-800">
                      {partsItems.map(item => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center text-xs">
                          <div className="col-span-5">
                            <input
                              type="text"
                              value={item.partName}
                              onChange={e => handleUpdatePartItem(item.id, 'partName', e.target.value)}
                              className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-blue-500 text-slate-200 font-semibold"
                            />
                          </div>
                          <div className="col-span-2 font-mono text-[11px] text-slate-400">
                            {item.sku}
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 rounded px-1.5 py-1">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={e => handleUpdatePartItem(item.id, 'quantity', Number(e.target.value))}
                                className="w-10 text-center font-mono font-bold text-amber-300 bg-transparent focus:outline-none"
                              />
                              <span className="text-[10px] text-slate-400">un.</span>
                            </div>
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 rounded px-2 py-1">
                              <span className="text-[10px] font-bold text-emerald-400">S/</span>
                              <input
                                type="number"
                                step="1"
                                min="0"
                                value={item.unitPrice}
                                onChange={e => handleUpdatePartItem(item.id, 'unitPrice', Number(e.target.value))}
                                className="w-16 text-right font-mono font-bold text-slate-200 bg-transparent focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="col-span-2 flex items-center justify-end gap-2">
                            <span className="font-mono font-bold text-emerald-400">
                              {formatCurrency(item.total)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPartsItems(prev => prev.filter(p => p.id !== item.id))}
                              className="text-slate-500 hover:text-rose-400 p-1"
                              title="Eliminar repuesto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Breakdown & Totals */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-2 flex-1 text-xs">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Condiciones de Pago</label>
                    <input
                      type="text"
                      value={paymentTerms}
                      onChange={e => setPaymentTerms(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Garantía Técnica de SAFIRO GROUP</label>
                    <input
                      type="text"
                      value={warrantyTerms}
                      onChange={e => setWarrantyTerms(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-72 space-y-1.5 text-xs border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal Mano de Obra:</span>
                    <span className="font-mono text-slate-200 font-bold">{formatCurrency(subtotalLabor)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal Repuestos:</span>
                    <span className="font-mono text-slate-200 font-bold">{formatCurrency(subtotalParts)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-amber-400 font-bold">
                      <span>Descuento ({discountPercent}%):</span>
                      <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>IGV Peruano (18%):</span>
                    <span className="font-mono text-slate-200 font-bold">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                    <span>Total Proforma:</span>
                    <span className="font-mono text-blue-400">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4" />
                  Emitir Cotización SAFIRO GROUP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Proforma Modal with SAFIRO GROUP Branding */}
      {selectedQuoteForPrint && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto print-card">
            {/* Top Bar for Print Modal */}
            <div className="no-print flex items-center justify-between px-6 py-3 bg-slate-900 text-white border-b border-slate-800">
              <span className="font-semibold text-xs flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                Cotización Oficial SAFIRO GROUP - Vista de Impresión / PDF
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportPDF(selectedQuoteForPrint)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Generar y descargar cotización PDF formal lista para el cliente"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar PDF Formal
                </button>
                <button
                  type="button"
                  onClick={() => handleUploadToDrive(selectedQuoteForPrint)}
                  disabled={isUploadingToDrive}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Subir Cotización a Google Drive (safiro.erp@gmail.com)"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  {isUploadingToDrive ? 'Subiendo...' : 'Subir a Google Drive'}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" /> Imprimir Proforma
                </button>
                <button
                  onClick={() => setSelectedQuoteForPrint(null)}
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
                  <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight">
                    SAFIRO GROUP
                  </h1>
                  <p className="text-xs font-bold text-blue-700">Centro Automotriz & Taller Especializado</p>
                  <p className="text-[11px] text-slate-600">RUC: 20608912341 • Servicio Técnico Autorizado</p>
                  <p className="text-[11px] text-slate-600">Av. Javier Prado Este 2850, Lima • Central: (01) 640-9000</p>
                </div>
                <div className="text-right">
                  <div className="inline-block border-2 border-slate-900 px-4 py-1.5 text-center">
                    <span className="text-[10px] uppercase font-bold tracking-widest block text-slate-600">
                      Cotización / Proforma
                    </span>
                    <span className="font-mono text-lg font-black text-slate-900">
                      {selectedQuoteForPrint.code}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Emisión: {selectedQuoteForPrint.date} • Válida hasta: {selectedQuoteForPrint.expirationDate}
                  </p>
                </div>
              </div>

              {/* Customer and Vehicle Box */}
              {(() => {
                const cust = getCustomer(selectedQuoteForPrint.customerId);
                const veh = getVehicle(selectedQuoteForPrint.vehicleId);
                return (
                  <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 rounded">
                    <div>
                      <h4 className="font-bold uppercase text-[10px] text-slate-500 border-b border-slate-200 pb-1 mb-1.5">
                        Cliente / Razón Social
                      </h4>
                      <p><strong>Cliente:</strong> {cust?.name}</p>
                      <p><strong>Documento:</strong> {cust?.documentType}: {cust?.documentNumber}</p>
                      <p><strong>Teléfono:</strong> {cust?.phone}</p>
                      <p><strong>Dirección:</strong> {cust?.address}</p>
                    </div>
                    <div>
                      <h4 className="font-bold uppercase text-[10px] text-slate-500 border-b border-slate-200 pb-1 mb-1.5">
                        Datos del Vehículo
                      </h4>
                      <p><strong>Placa:</strong> <span className="font-mono font-bold text-slate-900">{veh?.plate}</span></p>
                      <p><strong>Vehículo:</strong> {veh?.brand} {veh?.model} ({veh?.year})</p>
                      <p><strong>VIN:</strong> <span className="font-mono">{veh?.vin}</span></p>
                      <p><strong>Kilometraje:</strong> {veh?.mileage.toLocaleString()} km</p>
                    </div>
                  </div>
                );
              })()}

              {/* Items Table */}
              <div className="border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-[10px] text-slate-700">
                    <tr>
                      <th className="p-2.5">Concepto / Repuesto / Tarea</th>
                      <th className="p-2.5">Código / SKU</th>
                      <th className="p-2.5 text-center">Horas (HH) / Cant.</th>
                      <th className="p-2.5 text-right">Tarifa / Precio Unit.</th>
                      <th className="p-2.5 text-right">Total (S/ Soles)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedQuoteForPrint.laborItems.map(l => (
                      <tr key={l.id}>
                        <td className="p-2.5">
                          <span className="font-semibold text-slate-900 block">{l.description}</span>
                          <span className="text-[10px] text-slate-500">Mano de Obra Especializada SAFIRO GROUP</span>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-600">MO-CALIFICADA</td>
                        <td className="p-2.5 text-center font-mono font-bold">{l.hours} HH</td>
                        <td className="p-2.5 text-right font-mono">{formatCurrency(l.hourlyRate)} / HH</td>
                        <td className="p-2.5 text-right font-mono font-bold">{formatCurrency(l.total)}</td>
                      </tr>
                    ))}
                    {selectedQuoteForPrint.partItems.map(p => (
                      <tr key={p.id}>
                        <td className="p-2.5">
                          <span className="font-semibold text-slate-900 block">{p.partName}</span>
                          <span className="text-[10px] text-slate-500">Repuesto Genuino OEM / Garantía SAFIRO GROUP</span>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-600">{p.sku}</td>
                        <td className="p-2.5 text-center font-mono font-bold">{p.quantity} un.</td>
                        <td className="p-2.5 text-right font-mono">{formatCurrency(p.unitPrice)}</td>
                        <td className="p-2.5 text-right font-mono font-bold">{formatCurrency(p.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown in Peruvian Soles */}
              <div className="flex justify-between items-start pt-2">
                <div className="space-y-1 text-slate-600 text-[11px] max-w-md">
                  <p><strong>Condiciones de Pago:</strong> {selectedQuoteForPrint.paymentTerms}</p>
                  <p><strong>Garantía Oficial:</strong> {selectedQuoteForPrint.warrantyTerms}</p>
                  <p className="text-[10px] text-slate-500 pt-1">
                    * Precios expresados en Soles Peruanos (S/) con IGV (18%) incluido en el total.
                  </p>
                </div>
                <div className="w-64 space-y-1.5 border border-slate-300 p-3 rounded bg-slate-50 text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Mano de Obra:</span>
                    <span className="font-mono">{formatCurrency(selectedQuoteForPrint.subtotalLabor)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Repuestos & Insumos:</span>
                    <span className="font-mono">{formatCurrency(selectedQuoteForPrint.subtotalParts)}</span>
                  </div>
                  {selectedQuoteForPrint.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600 font-semibold">
                      <span>Descuento ({selectedQuoteForPrint.discountPercentage}%):</span>
                      <span className="font-mono">-{formatCurrency(selectedQuoteForPrint.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>IGV (18%):</span>
                    <span className="font-mono">{formatCurrency(selectedQuoteForPrint.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-300 pt-1">
                    <span>Total a Pagar:</span>
                    <span className="font-mono text-blue-700">{formatCurrency(selectedQuoteForPrint.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div className="text-center border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-900">SAFIRO GROUP - Posventa</p>
                  <p className="text-[10px] text-slate-500">Asesor de Servicio Autorizado</p>
                </div>
                <div className="text-center border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-900">Aprobación del Cliente</p>
                  <p className="text-[10px] text-slate-500">Estado de Aprobación: {selectedQuoteForPrint.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
