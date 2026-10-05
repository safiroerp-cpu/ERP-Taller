import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Customer, 
  Vehicle, 
  Technician, 
  PartItem, 
  StockMovement, 
  Appointment, 
  ReceptionChecklist, 
  TechnicalDiagnosis, 
  Quotation, 
  WorkOrder,
  VehicleStatus,
  QualityChecklist
} from '../types/erp';
import {
  INITIAL_CUSTOMERS,
  INITIAL_VEHICLES,
  INITIAL_TECHNICIANS,
  INITIAL_PARTS,
  INITIAL_MOVEMENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_CHECKLISTS,
  INITIAL_DIAGNOSES,
  INITIAL_QUOTATIONS,
  INITIAL_WORK_ORDERS
} from '../data/initialData';

const STORAGE_KEYS = {
  CUSTOMERS: 'autopro_erp_customers',
  VEHICLES: 'autopro_erp_vehicles',
  TECHNICIANS: 'autopro_erp_technicians',
  PARTS: 'autopro_erp_parts',
  MOVEMENTS: 'autopro_erp_movements',
  APPOINTMENTS: 'autopro_erp_appointments',
  CHECKLISTS: 'autopro_erp_checklists',
  DIAGNOSES: 'autopro_erp_diagnoses',
  QUOTATIONS: 'autopro_erp_quotations',
  WORK_ORDERS: 'autopro_erp_work_orders',
};

interface ERPContextType {
  customers: Customer[];
  vehicles: Vehicle[];
  technicians: Technician[];
  parts: PartItem[];
  movements: StockMovement[];
  appointments: Appointment[];
  checklists: ReceptionChecklist[];
  diagnoses: TechnicalDiagnosis[];
  quotations: Quotation[];
  workOrders: WorkOrder[];
  // Helpers
  getCustomer: (id?: string) => Customer | undefined;
  getVehicle: (id?: string) => Vehicle | undefined;
  getTechnician: (id?: string) => Technician | undefined;
  getChecklist: (id?: string) => ReceptionChecklist | undefined;
  getDiagnosis: (id?: string) => TechnicalDiagnosis | undefined;
  getQuotation: (id?: string) => Quotation | undefined;
  getWorkOrder: (id?: string) => WorkOrder | undefined;
  // Actions
  addAppointment: (appointment: Omit<Appointment, 'id' | 'code'>) => Appointment;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  createReceptionChecklist: (data: Omit<ReceptionChecklist, 'id' | 'code'>, createWorkOrder?: boolean) => ReceptionChecklist;
  createDiagnosis: (data: Omit<TechnicalDiagnosis, 'id' | 'code'>) => TechnicalDiagnosis;
  createQuotation: (data: Omit<Quotation, 'id' | 'code'>) => Quotation;
  updateQuotationStatus: (id: string, status: Quotation['status']) => void;
  addPart: (part: Omit<PartItem, 'id' | 'sku'> & { sku?: string }) => PartItem;
  updatePart: (part: PartItem) => void;
  registerStockMovement: (data: Omit<StockMovement, 'id' | 'date'>) => void;
  updateWorkOrderStage: (id: string, stage: VehicleStatus) => void;
  assignTechnicianToWorkOrder: (workOrderId: string, technicianId: string) => void;
  updateQualityCheck: (workOrderId: string, check: Partial<QualityChecklist>) => void;
  deliverVehicle: (workOrderId: string) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Vehicle;
  resetToDemoData: () => void;
  exportDatabaseJSON: (triggerDownload?: boolean) => string;
  importDatabaseJSON: (jsonString: string) => boolean;
  // Theme & formatting
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  formatCurrency: (amount: number) => string;
  // Metrics
  stats: {
    inWorkshopCount: number;
    deliveredTodayCount: number;
    pendingQuotationsCount: number;
    lowStockPartsCount: number;
    scheduledAppointmentsCount: number;
    activeRevenueMonth: number;
  };
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TECHNICIANS);
    return saved ? JSON.parse(saved) : INITIAL_TECHNICIANS;
  });

  const [parts, setParts] = useState<PartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PARTS);
    return saved ? JSON.parse(saved) : INITIAL_PARTS;
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [checklists, setChecklists] = useState<ReceptionChecklist[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHECKLISTS);
    return saved ? JSON.parse(saved) : INITIAL_CHECKLISTS;
  });

  const [diagnoses, setDiagnoses] = useState<TechnicalDiagnosis[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DIAGNOSES);
    return saved ? JSON.parse(saved) : INITIAL_DIAGNOSES;
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
    return saved ? JSON.parse(saved) : INITIAL_QUOTATIONS;
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORK_ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_WORK_ORDERS;
  });

  const theme: 'dark' = 'dark';
  const toggleTheme = () => {
    // Dark mode is default
  };

  useEffect(() => {
    localStorage.setItem('autopro_erp_theme', 'dark');
    document.documentElement.classList.add('dark');
  }, []);

  const formatCurrency = (amount: number = 0): string => {
    return 'S/ ' + Number(amount || 0).toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(parts));
  }, [parts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(checklists));
  }, [checklists]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DIAGNOSES, JSON.stringify(diagnoses));
  }, [diagnoses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify(workOrders));
  }, [workOrders]);

  // Lookup helpers
  const getCustomer = (id?: string) => customers.find(c => c.id === id);
  const getVehicle = (id?: string) => vehicles.find(v => v.id === id);
  const getTechnician = (id?: string) => technicians.find(t => t.id === id);
  const getChecklist = (id?: string) => checklists.find(c => c.id === id);
  const getDiagnosis = (id?: string) => diagnoses.find(d => d.id === id);
  const getQuotation = (id?: string) => quotations.find(q => q.id === id);
  const getWorkOrder = (id?: string) => workOrders.find(w => w.id === id);

  // Business Actions
  const addAppointment = (data: Omit<Appointment, 'id' | 'code'>): Appointment => {
    const newId = `apt-${Date.now()}`;
    const newCode = `CIT-2026-${String(appointments.length + 95).padStart(4, '0')}`;
    const newAppointment: Appointment = {
      ...data,
      id: newId,
      code: newCode
    };
    setAppointments(prev => [newAppointment, ...prev]);
    return newAppointment;
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const createReceptionChecklist = (
    data: Omit<ReceptionChecklist, 'id' | 'code'>, 
    createWorkOrderFlag: boolean = true
  ): ReceptionChecklist => {
    const newId = `chk-${Date.now()}`;
    const newCode = `REC-2026-${String(checklists.length + 85).padStart(4, '0')}`;
    const newChecklist: ReceptionChecklist = {
      ...data,
      id: newId,
      code: newCode
    };
    setChecklists(prev => [newChecklist, ...prev]);

    if (data.appointmentId) {
      setAppointments(prev => prev.map(a => a.id === data.appointmentId ? { ...a, status: 'Recepcionada' } : a));
    }

    if (data.receivedMileage) {
      setVehicles(prev => prev.map(v => v.id === data.vehicleId ? { ...v, mileage: data.receivedMileage } : v));
    }

    if (createWorkOrderFlag) {
      const otId = `ot-${Date.now()}`;
      const otCode = `OT-2026-${String(workOrders.length + 505).padStart(4, '0')}`;
      const newOT: WorkOrder = {
        id: otId,
        code: otCode,
        appointmentId: data.appointmentId,
        vehicleId: data.vehicleId,
        customerId: data.customerId,
        receptionChecklistId: newId,
        bayLocation: 'Bahía 01 - Inspección & Diagnóstico',
        currentStage: 'diagnostico',
        priority: 'Normal',
        entryDate: data.receptionDate,
        promisedDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        qualityCheck: {
          roadTestPerformed: false,
          fluidLevelsVerified: false,
          wheelLugTorqueVerified: false,
          cleanAndWashed: false,
          faultCodesCleared: false,
          inspectorName: '',
          passed: false,
          notes: ''
        },
        serviceAdvisor: data.advisorName || 'Asesor de Turno',
        paidStatus: 'Pendiente'
      };
      setWorkOrders(prev => [newOT, ...prev]);
    }

    return newChecklist;
  };

  const createDiagnosis = (data: Omit<TechnicalDiagnosis, 'id' | 'code'>): TechnicalDiagnosis => {
    const newId = `diag-${Date.now()}`;
    const newCode = `DIAG-2026-${String(diagnoses.length + 50).padStart(4, '0')}`;
    const newDiag: TechnicalDiagnosis = {
      ...data,
      id: newId,
      code: newCode
    };
    setDiagnoses(prev => [newDiag, ...prev]);

    setWorkOrders(prev => prev.map(ot => {
      if (ot.id === data.workOrderId) {
        return {
          ...ot,
          diagnosisId: newId,
          technicianId: data.technicianId || ot.technicianId,
          currentStage: 'cotizacion_pendiente'
        };
      }
      return ot;
    }));

    return newDiag;
  };

  const createQuotation = (data: Omit<Quotation, 'id' | 'code'>): Quotation => {
    const newId = `cot-${Date.now()}`;
    const newCode = `COT-2026-${String(quotations.length + 185).padStart(4, '0')}`;
    const newCot: Quotation = {
      ...data,
      id: newId,
      code: newCode
    };
    setQuotations(prev => [newCot, ...prev]);

    setWorkOrders(prev => prev.map(ot => {
      if (ot.id === data.workOrderId) {
        return {
          ...ot,
          quotationId: newId,
          totalAmount: newCot.grandTotal
        };
      }
      return ot;
    }));

    return newCot;
  };

  const updateQuotationStatus = (id: string, status: Quotation['status']) => {
    setQuotations(prev => prev.map(q => {
      if (q.id === id) {
        const updated = { ...q, status, approvalDate: status === 'Aprobada' ? new Date().toISOString() : q.approvalDate };
        
        if (status === 'Aprobada') {
          setWorkOrders(ots => ots.map(ot => {
            if (ot.id === q.workOrderId || ot.quotationId === id) {
              return { ...ot, currentStage: 'en_reparacion' };
            }
            return ot;
          }));

          q.partItems.forEach(item => {
            if (item.partId) {
              registerStockMovement({
                partId: item.partId,
                type: 'SALIDA_OT',
                quantity: item.quantity,
                reason: `Aprobación de Cotización ${q.code}`,
                referenceDoc: q.code,
                performedBy: 'Sistema ERP AutoPro'
              });
            }
          });
        }
        return updated;
      }
      return q;
    }));
  };

  const addPart = (data: Omit<PartItem, 'id' | 'sku'> & { sku?: string }): PartItem => {
    const newId = `part-${Date.now()}`;
    const newSku = data.sku || `SKU-${Date.now().toString().slice(-6)}`;
    const newPart: PartItem = {
      ...data,
      id: newId,
      sku: newSku
    };
    setParts(prev => [newPart, ...prev]);
    return newPart;
  };

  const updatePart = (updatedPart: PartItem) => {
    setParts(prev => prev.map(p => p.id === updatedPart.id ? updatedPart : p));
  };

  const registerStockMovement = (data: Omit<StockMovement, 'id' | 'date'>) => {
    const newMovement: StockMovement = {
      ...data,
      id: `mov-${Date.now()}`,
      date: new Date().toISOString()
    };
    setMovements(prev => [newMovement, ...prev]);

    setParts(prev => prev.map(part => {
      if (part.id === data.partId) {
        let newStock = part.stock;
        if (data.type === 'INGRESO' || data.type === 'DEVOLUCION') {
          newStock += data.quantity;
        } else if (data.type === 'SALIDA_OT') {
          newStock = Math.max(0, newStock - data.quantity);
        } else if (data.type === 'AJUSTE') {
          newStock = data.quantity;
        }
        return { ...part, stock: newStock };
      }
      return part;
    }));
  };

  const updateWorkOrderStage = (id: string, stage: VehicleStatus) => {
    setWorkOrders(prev => prev.map(ot => {
      if (ot.id === id) {
        const updates: Partial<WorkOrder> = { currentStage: stage };
        if (stage === 'listo_entrega' && !ot.completedDate) {
          updates.completedDate = new Date().toISOString();
        }
        if (stage === 'entregado' && !ot.deliveredDate) {
          updates.deliveredDate = new Date().toISOString();
        }
        return { ...ot, ...updates };
      }
      return ot;
    }));
  };

  const assignTechnicianToWorkOrder = (workOrderId: string, technicianId: string) => {
    setWorkOrders(prev => prev.map(ot => {
      if (ot.id === workOrderId) {
        return { ...ot, technicianId };
      }
      return ot;
    }));

    setTechnicians(prev => prev.map(tech => {
      if (tech.id === technicianId) {
        return { ...tech, activeOrders: tech.activeOrders + 1, status: 'Asignado' };
      }
      return tech;
    }));
  };

  const updateQualityCheck = (workOrderId: string, check: Partial<QualityChecklist>) => {
    setWorkOrders(prev => prev.map(ot => {
      if (ot.id === workOrderId) {
        const updatedCheck: QualityChecklist = { ...ot.qualityCheck, ...check };
        const allChecked = 
          updatedCheck.roadTestPerformed && 
          updatedCheck.fluidLevelsVerified && 
          updatedCheck.wheelLugTorqueVerified && 
          updatedCheck.cleanAndWashed && 
          updatedCheck.faultCodesCleared;
        
        updatedCheck.passed = allChecked;
        return {
          ...ot,
          qualityCheck: updatedCheck,
          currentStage: allChecked ? 'listo_entrega' : ot.currentStage,
          completedDate: allChecked ? new Date().toISOString() : ot.completedDate
        };
      }
      return ot;
    }));
  };

  const deliverVehicle = (workOrderId: string) => {
    setWorkOrders(prev => prev.map(ot => {
      if (ot.id === workOrderId) {
        return {
          ...ot,
          currentStage: 'entregado',
          deliveredDate: new Date().toISOString(),
          paidStatus: 'Pagado'
        };
      }
      return ot;
    }));
  };

  const addCustomer = (data: Omit<Customer, 'id'>): Customer => {
    const newCustomer: Customer = {
      ...data,
      id: `cust-${Date.now()}`
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const addVehicle = (data: Omit<Vehicle, 'id'>): Vehicle => {
    const newVehicle: Vehicle = {
      ...data,
      id: `veh-${Date.now()}`
    };
    setVehicles(prev => [...prev, newVehicle]);
    return newVehicle;
  };

  const resetToDemoData = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setVehicles(INITIAL_VEHICLES);
    setTechnicians(INITIAL_TECHNICIANS);
    setParts(INITIAL_PARTS);
    setMovements(INITIAL_MOVEMENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setChecklists(INITIAL_CHECKLISTS);
    setDiagnoses(INITIAL_DIAGNOSES);
    setQuotations(INITIAL_QUOTATIONS);
    setWorkOrders(INITIAL_WORK_ORDERS);
    localStorage.clear();
  };

  const exportDatabaseJSON = (triggerDownload: boolean = true): string => {
    const fullData = {
      customers,
      vehicles,
      technicians,
      parts,
      movements,
      appointments,
      checklists,
      diagnoses,
      quotations,
      workOrders,
      exportedAt: new Date().toISOString(),
      version: 'SAFIRO GROUP ERP v2.8'
    };
    const jsonString = JSON.stringify(fullData, null, 2);
    if (triggerDownload) {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonString);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `safiro_erp_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
    return jsonString;
  };

  const importDatabaseJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.customers && data.vehicles && data.parts) {
        if (data.customers) setCustomers(data.customers);
        if (data.vehicles) setVehicles(data.vehicles);
        if (data.technicians) setTechnicians(data.technicians);
        if (data.parts) setParts(data.parts);
        if (data.movements) setMovements(data.movements);
        if (data.appointments) setAppointments(data.appointments);
        if (data.checklists) setChecklists(data.checklists);
        if (data.diagnoses) setDiagnoses(data.diagnoses);
        if (data.quotations) setQuotations(data.quotations);
        if (data.workOrders) setWorkOrders(data.workOrders);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error importing backup:', e);
      return false;
    }
  };

  // Aggregated Stats
  const stats = useMemo(() => {
    const inWorkshop = workOrders.filter(o => o.currentStage !== 'entregado').length;
    const delivered = workOrders.filter(o => o.currentStage === 'entregado').length;
    const pendingQuotes = quotations.filter(q => q.status === 'Borrador' || q.status === 'Enviada').length;
    const lowStock = parts.filter(p => p.stock <= p.minStock).length;
    const scheduled = appointments.filter(a => a.status === 'Agendada').length;
    const activeRevenue = quotations
      .filter(q => q.status === 'Aprobada')
      .reduce((sum, q) => sum + q.grandTotal, 0);

    return {
      inWorkshopCount: inWorkshop,
      deliveredTodayCount: delivered,
      pendingQuotationsCount: pendingQuotes,
      lowStockPartsCount: lowStock,
      scheduledAppointmentsCount: scheduled,
      activeRevenueMonth: activeRevenue
    };
  }, [workOrders, quotations, parts, appointments]);

  return (
    <ERPContext.Provider
      value={{
        customers,
        vehicles,
        technicians,
        parts,
        movements,
        appointments,
        checklists,
        diagnoses,
        quotations,
        workOrders,
        getCustomer,
        getVehicle,
        getTechnician,
        getChecklist,
        getDiagnosis,
        getQuotation,
        getWorkOrder,
        addAppointment,
        updateAppointmentStatus,
        createReceptionChecklist,
        createDiagnosis,
        createQuotation,
        updateQuotationStatus,
        addPart,
        updatePart,
        registerStockMovement,
        updateWorkOrderStage,
        assignTechnicianToWorkOrder,
        updateQualityCheck,
        deliverVehicle,
        addCustomer,
        addVehicle,
        resetToDemoData,
        exportDatabaseJSON,
        importDatabaseJSON,
        theme,
        toggleTheme,
        formatCurrency,
        stats
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
