export type VehicleStatus = 
  | 'recepcion' 
  | 'diagnostico' 
  | 'cotizacion_pendiente' 
  | 'en_reparacion' 
  | 'espera_repuestos' 
  | 'control_calidad' 
  | 'listo_entrega' 
  | 'entregado';

export type VehicleCategory = 'sedan' | 'suv_pickup' | 'furgon' | 'camion';

export type UserRole = 'admin' | 'advisor' | 'technician' | 'inventory';

export interface ERPUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  photoURL?: string;
  companyBranch?: string;
  lastLogin?: string;
}

export interface AuthPermission {
  canManageUsers: boolean;
  canViewFinancials: boolean;
  canApproveQuotes: boolean;
  canEditInventory: boolean;
  canPerformDiagnosis: boolean;
  canReceiveVehicles: boolean;
  canDeliverVehicles: boolean;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  category: VehicleCategory;
  year: number;
  vin: string;
  color: string;
  mileage: number;
  fuelType: 'Gasolina' | 'Diésel' | 'Híbrido' | 'Gas (GLP/GNV)' | 'Eléctrico';
  transmission: 'Automática' | 'Mecánica / Manual';
  customerId: string;
}

export interface Customer {
  id: string;
  name: string;
  documentType: 'DNI' | 'RUC' | 'RFC' | 'Pasaporte';
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
  isCompany: boolean;
}

export interface Appointment {
  id: string;
  code: string;
  customerId: string;
  vehicleId: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  serviceType: 
    | 'Mantenimiento Preventivo (10k / 20k / 50k km)'
    | 'Diagnóstico por Falla / Luz Check Engine'
    | 'Garantía de Fábrica'
    | 'Sistema de Frenos & Seguridad'
    | 'Suspensión y Dirección'
    | 'Planchado y Pintura'
    | 'Inspección Pre-Compra / Inspección Técnica';
  reasonNotes: string;
  advisorName: string;
  status: 'Agendada' | 'Recepcionada' | 'En Proceso' | 'Cancelada' | 'Completada';
}

export interface ExteriorDamageMark {
  id: string;
  x: number; // 0 to 100 percentage in diagram
  y: number; // 0 to 100 percentage in diagram
  view: 'frontal' | 'trasera' | 'lateral_izq' | 'lateral_der' | 'techo';
  damageType: 'Rayón / Arañazo' | 'Abolladura / Golpe' | 'Rotura / Fisura' | 'Descascarado de Pintura' | 'Faltante';
  severity: 'Leve' | 'Moderado' | 'Severo';
  notes: string;
}

export interface InventoryChecklistItems {
  // Documentos
  tarjetaPropiedad: boolean;
  soatOseguro: boolean;
  manualUsuario: boolean;
  llaveDuplicado: boolean;
  // Accesorios Interiores
  radioPantallaTactil: boolean;
  aireAcondicionadoOperativo: boolean;
  encendedorTomas12V: boolean;
  tapetesJuegoCompleto: boolean;
  asientosSinManchas: boolean;
  tableroInstrumentosSinTestigos: boolean;
  // Exteriores
  espejosLateralesCompletos: boolean;
  antenaRadio: boolean;
  emblemasLogos: boolean;
  plumillasLimpiaparabrisas: boolean;
  farosSinRajaduras: boolean;
  tapaCombustible: boolean;
  vasosArosCompletos: boolean;
  // Maletera & Auxilio
  llantaRepuestoBuenEstado: boolean;
  gataMecanica: boolean;
  llaveRuedas: boolean;
  trianguloSeguridad: boolean;
  botiquinPrimerosAuxilios: boolean;
  extintorVigente: boolean;
  cablesBateria: boolean;
}

export interface ReceptionChecklist {
  id: string;
  code: string;
  appointmentId?: string;
  vehicleId: string;
  vehicleCategory?: VehicleCategory;
  customerId: string;
  receptionDate: string; // ISO
  advisorName: string;
  receivedMileage: number;
  fuelLevelPercentage: number; // 0, 10, 25, 50, 75, 100
  customerStatedFailure: string;
  valuableItemsDeclared: string;
  damages: ExteriorDamageMark[];
  checklistItems: InventoryChecklistItems;
  customerSignature?: string; // Data URL SVG or PNG
  advisorSignature?: string;
  cleanlinessCondition: 'Limpio' | 'Regular' | 'Muy Sucio';
}

export interface SystemInspectionItem {
  status: 'ok' | 'advertencia' | 'critico';
  observation: string;
}

export interface ScannerFaultCode {
  code: string;
  system: string;
  description: string;
  severity: 'Leve' | 'Moderado' | 'Grave';
}

export interface DiagnosisPhoto {
  id: string;
  url: string; // Base64 data URL or remote URL
  caption: string;
  systemTag?: string; // e.g. 'Motor', 'Frenos', 'Suspensión', 'Eléctrico', etc.
  date: string;
}

export interface TechnicalDiagnosis {
  id: string;
  code: string;
  workOrderId: string;
  technicianId: string;
  date: string;
  odometer: number;
  systems: {
    motor: SystemInspectionItem;
    frenos: SystemInspectionItem & { padWearPercent?: number };
    suspension: SystemInspectionItem;
    electricoYBateria: SystemInspectionItem & { batteryVoltage?: number; alternatorCharging?: boolean };
    transmision: SystemInspectionItem;
    direccion: SystemInspectionItem;
    escapeYEmisiones: SystemInspectionItem;
    climatizacion: SystemInspectionItem;
  };
  scannerCodes: ScannerFaultCode[];
  rootCauseAnalysis: string;
  technicianRecommendations: string[];
  suggestedParts: Array<{
    partId?: string;
    partName: string;
    quantity: number;
    urgency: 'Crítica / Inmediata' | 'Preventiva' | 'Opcional';
  }>;
  photos?: DiagnosisPhoto[];
  estimatedLaborHours: number;
  status: 'Borrador' | 'Finalizado' | 'Enviado_A_Cotizacion';
}

export interface PartItem {
  id: string;
  sku: string;
  oemCode: string;
  name: string;
  category: 
    | 'Filtros' 
    | 'Frenos' 
    | 'Lubricantes y Fluidos' 
    | 'Suspensión y Dirección' 
    | 'Motor y Correas' 
    | 'Eléctrico e Iluminación' 
    | 'Carrocería y Accesorios' 
    | 'Transmisión y Embrague';
  compatibility: string;
  brand: string;
  stock: number;
  minStock: number;
  unitCost: number;
  unitPrice: number;
  location: string;
  supplier: string;
}

export interface StockMovement {
  id: string;
  partId: string;
  type: 'INGRESO' | 'SALIDA_OT' | 'AJUSTE' | 'DEVOLUCION';
  quantity: number;
  date: string;
  reason: string;
  referenceDoc?: string; // OT o Factura Proveedor
  performedBy: string;
}

export interface QuotationLaborItem {
  id: string;
  description: string;
  hours: number;
  hourlyRate: number;
  total: number;
}

export interface QuotationPartItem {
  id: string;
  partId?: string;
  partName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quotation {
  id: string;
  code: string;
  workOrderId: string;
  customerId: string;
  vehicleId: string;
  date: string;
  expirationDate: string;
  laborItems: QuotationLaborItem[];
  partItems: QuotationPartItem[];
  subtotalLabor: number;
  subtotalParts: number;
  discountPercentage: number;
  discountAmount: number;
  taxRate: number; // e.g. 0.18 for 18% IGV / IVA
  taxAmount: number;
  grandTotal: number;
  status: 'Borrador' | 'Enviada' | 'Aprobada' | 'Rechazada';
  paymentTerms: string;
  warrantyTerms: string;
  clientNotes?: string;
  approvalDate?: string;
}

export interface QualityChecklist {
  roadTestPerformed: boolean;
  fluidLevelsVerified: boolean;
  wheelLugTorqueVerified: boolean;
  cleanAndWashed: boolean;
  faultCodesCleared: boolean;
  inspectorName: string;
  passed: boolean;
  notes: string;
}

export interface WorkOrder {
  id: string;
  code: string;
  appointmentId?: string;
  vehicleId: string;
  customerId: string;
  technicianId?: string;
  receptionChecklistId?: string;
  diagnosisId?: string;
  quotationId?: string;
  bayLocation: string; // e.g., 'Elevador 1 - Mantenimiento', 'Bahía 3 - Eléctrico'
  currentStage: VehicleStatus;
  priority: 'Baja' | 'Normal' | 'Alta' | 'Urgente';
  entryDate: string;
  promisedDate: string;
  completedDate?: string;
  deliveredDate?: string;
  qualityCheck: QualityChecklist;
  serviceAdvisor: string;
  paidStatus: 'Pendiente' | 'Pagado' | 'Crédito Autorizado';
  totalAmount?: number;
}

export interface Technician {
  id: string;
  name: string;
  specialty: 'Mecánica General' | 'Diagnóstico & Electrónica' | 'Frenos & Suspensión' | 'Transmisiones & Motores' | 'Carrocería';
  grade: 'Técnico Master' | 'Especialista Senior' | 'Técnico Certificado';
  phone: string;
  status: 'Disponible' | 'Asignado' | 'En Descanso';
  activeOrders: number;
  ratingScore: number;
}
