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
  ERPUser
} from '../types/erp';

export const INITIAL_USERS: ERPUser[] = [
  {
    uid: 'user-admin-1',
    email: 'safiro.erp@gmail.com',
    displayName: 'Carlos Safiro (Gerente General)',
    role: 'admin',
    phone: '+51 987 654 000',
    companyBranch: 'Sede Central - San Borja, Lima',
    lastLogin: '2026-10-05T12:00:00Z'
  },
  {
    uid: 'user-advisor-1',
    email: 'asesor.castro@safirogroup.pe',
    displayName: 'Guillermo Castro (Asesor Senior)',
    role: 'advisor',
    phone: '+51 987 654 321',
    companyBranch: 'Sede Central - San Borja, Lima',
    lastLogin: '2026-10-05T11:30:00Z'
  },
  {
    uid: 'user-tech-1',
    email: 'mateo.huaman@safirogroup.pe',
    displayName: 'Ing. Mateo Huamán (Técnico Master)',
    role: 'technician',
    phone: '+51 981 234 501',
    companyBranch: 'Taller Bahía 02 - Diagnóstico',
    lastLogin: '2026-10-05T10:45:00Z'
  },
  {
    uid: 'user-inv-1',
    email: 'almacen@safirogroup.pe',
    displayName: 'Raúl Valdivia (Jefe de Almacén)',
    role: 'inventory',
    phone: '+51 990 123 456',
    companyBranch: 'Almacén Central de Repuestos OEM',
    lastLogin: '2026-10-05T09:15:00Z'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Carlos Mendoza Ramos',
    documentType: 'DNI',
    documentNumber: '45892147',
    phone: '+51 987 654 321',
    email: 'carlos.mendoza@gmail.com',
    address: 'Av. Javier Prado Este 2450, San Borja',
    isCompany: false
  },
  {
    id: 'cust-2',
    name: 'Transportes & Logística Andina S.A.C.',
    documentType: 'RUC',
    documentNumber: '20601893412',
    phone: '+51 945 112 890',
    email: 'flota@logisticaandina.pe',
    address: 'Calle Los Negocios 182, Surquillo',
    isCompany: true
  },
  {
    id: 'cust-3',
    name: 'Valeria Patricia Solís',
    documentType: 'DNI',
    documentNumber: '71209384',
    phone: '+51 912 345 678',
    email: 'valeria.solis@outlook.com',
    address: 'Jr. Huáscar 890, Jesús María',
    isCompany: false
  },
  {
    id: 'cust-4',
    name: 'Constructora del Sur E.I.R.L.',
    documentType: 'RUC',
    documentNumber: '20491028471',
    phone: '+51 976 543 210',
    email: 'operaciones@construcsur.com',
    address: 'Av. República de Panamá 3560, San Isidro',
    isCompany: true
  },
  {
    id: 'cust-5',
    name: 'Rodrigo Benavides Vega',
    documentType: 'DNI',
    documentNumber: '42189073',
    phone: '+51 954 876 123',
    email: 'rbenavides@yahoo.com',
    address: 'Av. Primavera 1020, Santiago de Surco',
    isCompany: false
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    plate: 'BCF-418',
    brand: 'Toyota',
    model: 'Hilux 2.8 D-4D 4x4',
    category: 'suv_pickup',
    year: 2022,
    vin: '8AJBA3CD7N0198234',
    color: 'Plata Metálico',
    mileage: 48520,
    fuelType: 'Diésel',
    transmission: 'Mecánica / Manual',
    customerId: 'cust-2'
  },
  {
    id: 'veh-2',
    plate: 'AXP-902',
    brand: 'Hyundai',
    model: 'Tucson 2.0 GL High',
    category: 'suv_pickup',
    year: 2021,
    vin: 'KMHD881CPMU109283',
    color: 'Gris Grafito',
    mileage: 34100,
    fuelType: 'Gasolina',
    transmission: 'Automática',
    customerId: 'cust-1'
  },
  {
    id: 'veh-3',
    plate: 'DKM-341',
    brand: 'Honda',
    model: 'CR-V 1.5 Turbo Touring',
    category: 'suv_pickup',
    year: 2023,
    vin: '2HKRW2H84PH591029',
    color: 'Blanco Perlado',
    mileage: 19850,
    fuelType: 'Gasolina',
    transmission: 'Automática',
    customerId: 'cust-3'
  },
  {
    id: 'veh-4',
    plate: 'W3P-712',
    brand: 'Ford',
    model: 'Ranger XLT 3.2 TDCi 4x4',
    category: 'suv_pickup',
    year: 2020,
    vin: '8AFAR22E7L2984102',
    color: 'Azul Titanio',
    mileage: 72400,
    fuelType: 'Diésel',
    transmission: 'Automática',
    customerId: 'cust-4'
  },
  {
    id: 'veh-5',
    plate: 'BEZ-195',
    brand: 'Toyota',
    model: 'Corolla 1.8 Hybrid SEG',
    category: 'sedan',
    year: 2023,
    vin: '9BRBL42E4P0293819',
    color: 'Rojo Carmín',
    mileage: 21500,
    fuelType: 'Híbrido',
    transmission: 'Automática',
    customerId: 'cust-5'
  },
  {
    id: 'veh-6',
    plate: 'F8V-310',
    brand: 'Hyundai',
    model: 'H350 Furgón Cargo XL',
    category: 'furgon',
    year: 2022,
    vin: 'KMJWF17VPNA091823',
    color: 'Blanco Puro',
    mileage: 58200,
    fuelType: 'Diésel',
    transmission: 'Mecánica / Manual',
    customerId: 'cust-2'
  },
  {
    id: 'veh-7',
    plate: 'C7M-894',
    brand: 'Isuzu',
    model: 'Forward FTR 15T Camión Chasis',
    category: 'camion',
    year: 2021,
    vin: 'JALFTR34L77019283',
    color: 'Blanco / Azul',
    mileage: 95400,
    fuelType: 'Diésel',
    transmission: 'Mecánica / Manual',
    customerId: 'cust-4'
  }
];

export const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: 'tech-1',
    name: 'Ing. Mateo Huamán Quispe',
    specialty: 'Diagnóstico & Electrónica',
    grade: 'Técnico Master',
    phone: '+51 981 234 501',
    status: 'Asignado',
    activeOrders: 2,
    ratingScore: 4.9
  },
  {
    id: 'tech-2',
    name: 'Jorge Luis Cárdenas',
    specialty: 'Frenos & Suspensión',
    grade: 'Especialista Senior',
    phone: '+51 982 345 602',
    status: 'Asignado',
    activeOrders: 1,
    ratingScore: 4.8
  },
  {
    id: 'tech-3',
    name: 'Álvaro Delgado Ruiz',
    specialty: 'Transmisiones & Motores',
    grade: 'Técnico Master',
    phone: '+51 983 456 703',
    status: 'Disponible',
    activeOrders: 0,
    ratingScore: 4.95
  },
  {
    id: 'tech-4',
    name: 'Christian Morales Vega',
    specialty: 'Mecánica General',
    grade: 'Técnico Certificado',
    phone: '+51 984 567 804',
    status: 'Asignado',
    activeOrders: 1,
    ratingScore: 4.7
  }
];

export const INITIAL_PARTS: PartItem[] = [
  {
    id: 'part-1',
    sku: 'FLT-OIL-TY01',
    oemCode: '04152-YZZA1',
    name: 'Filtro de Aceite de Cartucho Sintético',
    category: 'Filtros',
    compatibility: 'Toyota Hilux, Fortuner, Corolla, RAV4',
    brand: 'Toyota Genuine Parts',
    stock: 24,
    minStock: 8,
    unitCost: 12.50,
    unitPrice: 28.00,
    location: 'A-01-03',
    supplier: 'Toyota del Perú S.A.'
  },
  {
    id: 'part-2',
    sku: 'FLT-AIR-HY02',
    oemCode: '28113-D3000',
    name: 'Filtro de Aire de Motor de Alto Flujo',
    category: 'Filtros',
    compatibility: 'Hyundai Tucson 2016-2023, Kia Sportage',
    brand: 'Mann Filter',
    stock: 14,
    minStock: 5,
    unitCost: 16.00,
    unitPrice: 38.00,
    location: 'A-02-01',
    supplier: 'Repuestos Automotrices del Pacífico'
  },
  {
    id: 'part-3',
    sku: 'LUB-5W30-SYN',
    oemCode: 'MOB-5W30-ESP',
    name: 'Aceite de Motor 100% Sintético 5W-30 (Galón 4L)',
    category: 'Lubricantes y Fluidos',
    compatibility: 'Motores Gasolina & Diésel DPF Euro 5/6',
    brand: 'Mobil 1 ESP Formula',
    stock: 35,
    minStock: 12,
    unitCost: 32.00,
    unitPrice: 65.00,
    location: 'B-01-FLOOR',
    supplier: 'ExxonMobil Distribuidora'
  },
  {
    id: 'part-4',
    sku: 'BRK-PAD-TY04',
    oemCode: '04465-0K340',
    name: 'Pastillas de Freno Delanteras Cerámicas',
    category: 'Frenos',
    compatibility: 'Toyota Hilux Revo / Vigo 4x4 (2016-2024)',
    brand: 'Akebono Japan Pro-ACT',
    stock: 3,
    minStock: 6, // LOW STOCK ALERT
    unitCost: 48.00,
    unitPrice: 115.00,
    location: 'C-03-02',
    supplier: 'Frenos y Repuestos del Cono Sur'
  },
  {
    id: 'part-5',
    sku: 'BRK-DISC-TY05',
    oemCode: '43512-0K090',
    name: 'Disco de Freno Delantero Ventilado (Par)',
    category: 'Frenos',
    compatibility: 'Toyota Hilux 4x4 / Fortuner',
    brand: 'Brembo Premium Disc',
    stock: 4,
    minStock: 2,
    unitCost: 95.00,
    unitPrice: 220.00,
    location: 'C-04-01',
    supplier: 'Frenos y Repuestos del Cono Sur'
  },
  {
    id: 'part-6',
    sku: 'IGN-SPK-NGK06',
    oemCode: 'ILKAR7B11',
    name: 'Bujía de Iridio Laser (Pack x4 unidades)',
    category: 'Motor y Correas',
    compatibility: 'Toyota Corolla 1.8/2.0, Honda Civic 1.5T',
    brand: 'NGK Laser Iridium',
    stock: 18,
    minStock: 6,
    unitCost: 34.00,
    unitPrice: 78.00,
    location: 'A-04-02',
    supplier: 'Importadora Eléctrica Tokio'
  },
  {
    id: 'part-7',
    sku: 'SUSP-SHK-FD07',
    oemCode: 'JB3C-18045-A',
    name: 'Amortiguador Delantero a Gas Reforzado (Unidad)',
    category: 'Suspensión y Dirección',
    compatibility: 'Ford Ranger T6 2.2 / 3.2 TDCi (2012-2022)',
    brand: 'KYB Excel-G Heavy Duty',
    stock: 2,
    minStock: 4, // LOW STOCK
    unitCost: 82.00,
    unitPrice: 185.00,
    location: 'D-02-04',
    supplier: 'Suspensiones Globales'
  },
  {
    id: 'part-8',
    sku: 'FLT-CAB-AC08',
    oemCode: '87139-50100',
    name: 'Filtro de Cabina Antipolen con Carbón Activado',
    category: 'Filtros',
    compatibility: 'Toyota Corolla, RAV4, Camry, Lexus',
    brand: 'Denso Original',
    stock: 15,
    minStock: 4,
    unitCost: 11.00,
    unitPrice: 32.00,
    location: 'A-02-04',
    supplier: 'Toyota del Perú S.A.'
  },
  {
    id: 'part-9',
    sku: 'LUB-BRK-DOT4',
    oemCode: 'DOT4-LV-1L',
    name: 'Líquido de Frenos Sintético DOT 4 LV (Envase 1 Litro)',
    category: 'Lubricantes y Fluidos',
    compatibility: 'Sistemas ABS / ESP / VSC todas las marcas',
    brand: 'Bosch Brake Fluid',
    stock: 20,
    minStock: 5,
    unitCost: 7.50,
    unitPrice: 18.00,
    location: 'B-02-02',
    supplier: 'Bosch Automotriz'
  },
  {
    id: 'part-10',
    sku: 'BELT-SERP-FD10',
    oemCode: '6PK2195',
    name: 'Faja Serpentina de Accesorios y Alternador',
    category: 'Motor y Correas',
    compatibility: 'Ford Ranger 3.2 / Everest',
    brand: 'Gates Micro-V Heavy Duty',
    stock: 5,
    minStock: 2,
    unitCost: 24.00,
    unitPrice: 58.00,
    location: 'A-05-01',
    supplier: 'Transmisiones Industriales SAC'
  }
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    partId: 'part-1',
    type: 'INGRESO',
    quantity: 30,
    date: '2026-10-01T09:30:00Z',
    reason: 'Factura F001-9281 importación mensual Toyota',
    referenceDoc: 'F001-9281',
    performedBy: 'Almacenero Jefe - Raúl V.'
  },
  {
    id: 'mov-2',
    partId: 'part-4',
    type: 'SALIDA_OT',
    quantity: 2,
    date: '2026-10-03T11:15:00Z',
    reason: 'Despacho para orden de trabajo',
    referenceDoc: 'OT-2026-0501',
    performedBy: 'Almacenero Jefe - Raúl V.'
  },
  {
    id: 'mov-3',
    partId: 'part-3',
    type: 'SALIDA_OT',
    quantity: 3,
    date: '2026-10-03T14:40:00Z',
    reason: 'Cambio de aceite de motor y filtros',
    referenceDoc: 'OT-2026-0502',
    performedBy: 'Asistente Almacén'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    code: 'CIT-2026-0091',
    customerId: 'cust-1',
    vehicleId: 'veh-2',
    scheduledDate: '2026-10-04',
    scheduledTime: '08:30',
    serviceType: 'Diagnóstico por Falla / Luz Check Engine',
    reasonNotes: 'Cliente reporta pérdida de potencia en subida y testigo de motor encendido de forma intermitente.',
    advisorName: 'Guillermo Castro',
    status: 'Recepcionada'
  },
  {
    id: 'apt-2',
    code: 'CIT-2026-0092',
    customerId: 'cust-2',
    vehicleId: 'veh-1',
    scheduledDate: '2026-10-04',
    scheduledTime: '09:15',
    serviceType: 'Mantenimiento Preventivo (10k / 20k / 50k km)',
    reasonNotes: 'Mantenimiento periódico preventivo de los 50,000 km según cartilla de garantía.',
    advisorName: 'Karla Morales',
    status: 'En Proceso'
  },
  {
    id: 'apt-3',
    code: 'CIT-2026-0093',
    customerId: 'cust-4',
    vehicleId: 'veh-4',
    scheduledDate: '2026-10-04',
    scheduledTime: '11:00',
    serviceType: 'Suspensión y Dirección',
    reasonNotes: 'Fuerte ruido sordo en la parte delantera derecha al pasar baches o pistas irregulares.',
    advisorName: 'Guillermo Castro',
    status: 'Recepcionada'
  },
  {
    id: 'apt-4',
    code: 'CIT-2026-0094',
    customerId: 'cust-3',
    vehicleId: 'veh-3',
    scheduledDate: '2026-10-04',
    scheduledTime: '14:30',
    serviceType: 'Mantenimiento Preventivo (10k / 20k / 50k km)',
    reasonNotes: 'Revisión de los 20,000 km y desinfección de ductos de aire acondicionado.',
    advisorName: 'Karla Morales',
    status: 'Agendada'
  },
  {
    id: 'apt-5',
    code: 'CIT-2026-0095',
    customerId: 'cust-5',
    vehicleId: 'veh-5',
    scheduledDate: '2026-10-05',
    scheduledTime: '10:00',
    serviceType: 'Garantía de Fábrica',
    reasonNotes: 'Actualización de firmware de ECU de gestión híbrida e inspección de batería HV.',
    advisorName: 'Guillermo Castro',
    status: 'Agendada'
  }
];

export const INITIAL_CHECKLISTS: ReceptionChecklist[] = [
  {
    id: 'chk-1',
    code: 'REC-2026-0081',
    appointmentId: 'apt-1',
    vehicleId: 'veh-2',
    customerId: 'cust-1',
    receptionDate: '2026-10-04T08:35:00Z',
    advisorName: 'Guillermo Castro',
    receivedMileage: 34100,
    fuelLevelPercentage: 50,
    customerStatedFailure: 'El vehículo cascabelea levemente al acelerar sobre 60 km/h y parpadea el testigo de Check Engine.',
    valuableItemsDeclared: 'Lentes de sol Ray-Ban en guantera, cargador USB tipo C en consola.',
    damages: [
      {
        id: 'dmg-1',
        x: 22,
        y: 65,
        view: 'lateral_izq',
        damageType: 'Rayón / Arañazo',
        severity: 'Leve',
        notes: 'Rayón superficial de 8cm en puerta trasera izquierda a la altura de la manija'
      },
      {
        id: 'dmg-2',
        x: 52,
        y: 82,
        view: 'frontal',
        damageType: 'Abolladura / Golpe',
        severity: 'Moderado',
        notes: 'Picadura de piedra en paragolpe delantero inferior'
      }
    ],
    checklistItems: {
      tarjetaPropiedad: true,
      soatOseguro: true,
      manualUsuario: true,
      llaveDuplicado: false,
      radioPantallaTactil: true,
      aireAcondicionadoOperativo: true,
      encendedorTomas12V: true,
      tapetesJuegoCompleto: true,
      asientosSinManchas: true,
      tableroInstrumentosSinTestigos: false, // Tiene testigo encendido
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
    },
    cleanlinessCondition: 'Regular'
  },
  {
    id: 'chk-2',
    code: 'REC-2026-0082',
    appointmentId: 'apt-3',
    vehicleId: 'veh-4',
    customerId: 'cust-4',
    receptionDate: '2026-10-04T11:05:00Z',
    advisorName: 'Guillermo Castro',
    receivedMileage: 72400,
    fuelLevelPercentage: 75,
    customerStatedFailure: 'Golpeteo seco metálico en tren delantero derecho al girar y cruzar reductores de velocidad.',
    valuableItemsDeclared: 'Linterna de mano industrial, estuche de herramientas mecánicas en tolva.',
    damages: [
      {
        id: 'dmg-3',
        x: 80,
        y: 45,
        view: 'trasera',
        damageType: 'Abolladura / Golpe',
        severity: 'Moderado',
        notes: 'Golpe leve en compuerta de tolva trasera lado derecho'
      }
    ],
    checklistItems: {
      tarjetaPropiedad: true,
      soatOseguro: true,
      manualUsuario: false,
      llaveDuplicado: false,
      radioPantallaTactil: true,
      aireAcondicionadoOperativo: true,
      encendedorTomas12V: true,
      tapetesJuegoCompleto: true,
      asientosSinManchas: false,
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
      cablesBateria: true
    },
    cleanlinessCondition: 'Muy Sucio'
  }
];

export const INITIAL_DIAGNOSES: TechnicalDiagnosis[] = [
  {
    id: 'diag-1',
    code: 'DIAG-2026-0045',
    workOrderId: 'ot-1',
    technicianId: 'tech-1',
    date: '2026-10-04T10:15:00Z',
    odometer: 34100,
    systems: {
      motor: {
        status: 'advertencia',
        observation: 'Fallo de encendido intermitente en cilindro #2 detectado en ralentí y bajo carga.'
      },
      frenos: {
        status: 'ok',
        observation: 'Pastillas delanteras con 65% de vida útil restante. Discos sin alabeo.',
        padWearPercent: 35
      },
      suspension: {
        status: 'ok',
        observation: 'Bujes y terminales de dirección en buen estado sin holguras anómalas.'
      },
      electricoYBateria: {
        status: 'advertencia',
        observation: 'Batería en 12.1V en reposo (baja capacidad de arranque). Bobina #2 con resistencia fuera de tolerancia.',
        batteryVoltage: 12.1,
        alternatorCharging: true
      },
      transmision: {
        status: 'ok',
        observation: 'Caja automática cambia con suavidad. Nivel y color de fluido ATF correcto.'
      },
      direccion: {
        status: 'ok',
        observation: 'Electroasistencia opera sin vibraciones.'
      },
      escapeYEmisiones: {
        status: 'advertencia',
        observation: 'Lectura de sensor O2 banco 1 con mezcla ligeramente rica debido al fallo de combustión.'
      },
      climatizacion: {
        status: 'ok',
        observation: 'Compresor acopla bien, temperatura de salida a 6.2°C.'
      }
    },
    scannerCodes: [
      {
        code: 'P0302',
        system: 'Powertrain (Motor)',
        description: 'Cylinder 2 Misfire Detected (Fallo de combustión detectado en cilindro 2)',
        severity: 'Grave'
      },
      {
        code: 'P0172',
        system: 'Emisiones',
        description: 'System Too Rich (Bank 1) - Mezcla de combustible rica transitoria',
        severity: 'Moderado'
      }
    ],
    rootCauseAnalysis: 'La bobina de encendido del cilindro #2 presenta microfisura con fuga de chispa a masa en alta temperatura. Las bujías cumplieron su intervalo de vida útil (34,000 km con electrodos desgastados).',
    technicianRecommendations: [
      'Reemplazo inmediato del juego completo de 4 bujías de Iridio.',
      'Reemplazo de bobina de ignición cil #2 original OEM.',
      'Limpieza de inyectores por ultrasonido y calibración de cuerpo de aceleración.',
      'Carga lenta y prueba de conductancia de la batería de 12V.'
    ],
    suggestedParts: [
      {
        partId: 'part-6',
        partName: 'Bujía de Iridio Laser (Pack x4 unidades)',
        quantity: 1,
        urgency: 'Crítica / Inmediata'
      },
      {
        partName: 'Bobina de Encendido Original Denso Cilindro 2',
        quantity: 1,
        urgency: 'Crítica / Inmediata'
      },
      {
        partName: 'Líquido Limpiador de Inyectores Profesional Wurth',
        quantity: 1,
        urgency: 'Preventiva'
      }
    ],
    photos: [
      {
        id: 'ph-diag-1-1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="400" height="260" fill="%230f172a"/><rect x="15" y="15" width="370" height="230" rx="10" fill="%231e293b" stroke="%23334155" stroke-width="2"/><circle cx="200" cy="115" r="55" fill="%230f172a" stroke="%23f59e0b" stroke-width="3"/><path d="M190 75 L210 75 L204 125 L196 125 Z" fill="%2394a3b8"/><circle cx="200" cy="140" r="7" fill="%23ef4444"/><text x="200" y="195" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23f8fafc" text-anchor="middle">BUJIA CILINDRO #2 CON CARBONILLA</text><text x="200" y="215" font-family="sans-serif" font-size="11" fill="%2394a3b8" text-anchor="middle">Electrodo erosionado y gap excedido (1.45 mm)</text></svg>',
        caption: 'Electrodo de bujía #2 con acumulación de carbón y desgaste severo',
        systemTag: 'Motor',
        date: '2026-10-04T10:15:00Z'
      },
      {
        id: 'ph-diag-1-2',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="400" height="260" fill="%230f172a"/><rect x="15" y="15" width="370" height="230" rx="10" fill="%231e293b" stroke="%23334155" stroke-width="2"/><rect x="180" y="55" width="40" height="100" rx="6" fill="%23334155" stroke="%2338bdf8" stroke-width="3"/><path d="M195 75 L205 95 L192 110 L208 135" stroke="%23ef4444" stroke-width="3" fill="none"/><text x="200" y="195" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23f8fafc" text-anchor="middle">BOBINA DE ENCENDIDO #2 CON FISURA</text><text x="200" y="215" font-family="sans-serif" font-size="11" fill="%2394a3b8" text-anchor="middle">Salto de arco eléctrico a masa en caliente</text></svg>',
        caption: 'Microfisura en cuerpo de bobina con fuga de chispa',
        systemTag: 'Eléctrico',
        date: '2026-10-04T10:20:00Z'
      }
    ],
    estimatedLaborHours: 2.5,
    status: 'Enviado_A_Cotizacion'
  },
  {
    id: 'diag-2',
    code: 'DIAG-2026-0046',
    workOrderId: 'ot-3',
    technicianId: 'tech-2',
    date: '2026-10-04T12:30:00Z',
    odometer: 72400,
    systems: {
      motor: {
        status: 'ok',
        observation: 'Sin pérdidas de aceite. Presión de riel común normal a 1600 bar.'
      },
      frenos: {
        status: 'advertencia',
        observation: 'Pastillas delanteras al límite (15% restante, ~2.5mm). Recomendado cambio inmediato.',
        padWearPercent: 85
      },
      suspension: {
        status: 'critico',
        observation: 'Amortiguador delantero derecho con fuga visible de aceite hidráulico y buje de horquilla inferior rasgado.'
      },
      electricoYBateria: {
        status: 'ok',
        observation: 'Batería 12.7V, alternador cargando a 14.2V.',
        batteryVoltage: 12.7,
        alternatorCharging: true
      },
      transmision: {
        status: 'ok',
        observation: 'Caja de transferencia 4x4 y cardán en perfecto estado.'
      },
      direccion: {
        status: 'advertencia',
        observation: 'Leve juego en rótula inferior derecha secundario al daño del amortiguador.'
      },
      escapeYEmisiones: {
        status: 'ok',
        observation: 'Filtro DPF con regeneración exitosa al 18% de saturación.'
      },
      climatizacion: {
        status: 'ok',
        observation: 'Correcto funcionamiento.'
      }
    },
    scannerCodes: [],
    rootCauseAnalysis: 'El amortiguador delantero derecho colapsó internamente por impacto severo o fatiga a los 72k km, transmitiendo los impactos al chasis y fatigando el buje inferior.',
    technicianRecommendations: [
      'Reemplazo del par de amortiguadores delanteros (siempre por eje para equilibrio dinámico).',
      'Reemplazo de pastillas de freno delanteras y rectificado preventivo de discos.',
      'Alineamiento computarizado 3D y balanceo de ruedas.'
    ],
    suggestedParts: [
      {
        partId: 'part-7',
        partName: 'Amortiguador Delantero a Gas Reforzado (Unidad)',
        quantity: 2,
        urgency: 'Crítica / Inmediata'
      },
      {
        partId: 'part-4',
        partName: 'Pastillas de Freno Delanteras Cerámicas',
        quantity: 1,
        urgency: 'Crítica / Inmediata'
      }
    ],
    photos: [
      {
        id: 'ph-diag-2-1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="400" height="260" fill="%230f172a"/><rect x="15" y="15" width="370" height="230" rx="10" fill="%231e293b" stroke="%23334155" stroke-width="2"/><rect x="185" y="45" width="30" height="110" rx="6" fill="%23475569" stroke="%23f43f5e" stroke-width="3"/><path d="M170 120 Q200 150 230 120 Q200 170 170 120" fill="%23f43f5e" opacity="0.8"/><text x="200" y="195" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23f8fafc" text-anchor="middle">AMORTIGUADOR DEL. DER. CON FUGA</text><text x="200" y="215" font-family="sans-serif" font-size="11" fill="%2394a3b8" text-anchor="middle">Pérdida de fluido hidráulico y vástago marcado</text></svg>',
        caption: 'Amortiguador delantero derecho con derrame de aceite hidráulico',
        systemTag: 'Suspensión',
        date: '2026-10-04T12:40:00Z'
      },
      {
        id: 'ph-diag-2-2',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="400" height="260" fill="%230f172a"/><rect x="15" y="15" width="370" height="230" rx="10" fill="%231e293b" stroke="%23334155" stroke-width="2"/><circle cx="200" cy="110" r="45" fill="%230f172a" stroke="%23f59e0b" stroke-width="4"/><path d="M180 85 L220 135 M220 85 L180 135" stroke="%23ef4444" stroke-width="4"/><text x="200" y="195" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23f8fafc" text-anchor="middle">BUJE DE HORQUILLA RASGADO</text><text x="200" y="215" font-family="sans-serif" font-size="11" fill="%2394a3b8" text-anchor="middle">Goma de silentblock partida con holgura excesiva</text></svg>',
        caption: 'Buje de horquilla de suspensión con rotura transversal',
        systemTag: 'Suspensión',
        date: '2026-10-04T12:45:00Z'
      }
    ],
    estimatedLaborHours: 4.0,
    status: 'Finalizado'
  }
];

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'cot-1',
    code: 'COT-2026-0182',
    workOrderId: 'ot-1',
    customerId: 'cust-1',
    vehicleId: 'veh-2',
    date: '2026-10-04',
    expirationDate: '2026-10-14',
    laborItems: [
      {
        id: 'li-1',
        description: 'Mano de obra: Diagnóstico electrónico computarizado y lectura OBD-II',
        hours: 1.0,
        hourlyRate: 45.00,
        total: 45.00
      },
      {
        id: 'li-2',
        description: 'Mano de obra: Reemplazo de bujías de iridio y bobina de ignición cil #2',
        hours: 1.0,
        hourlyRate: 45.00,
        total: 45.00
      },
      {
        id: 'li-3',
        description: 'Servicio: Limpieza ultrasónica de inyectores y descarbonizado de admisión',
        hours: 1.5,
        hourlyRate: 40.00,
        total: 60.00
      }
    ],
    partItems: [
      {
        id: 'pi-1',
        partId: 'part-6',
        partName: 'Bujía de Iridio Laser (Pack x4 unidades)',
        sku: 'IGN-SPK-NGK06',
        quantity: 1,
        unitPrice: 78.00,
        total: 78.00
      },
      {
        id: 'pi-2',
        partName: 'Bobina de Encendido Original Hyundai/Denso',
        sku: 'IGN-COIL-HY01',
        quantity: 1,
        unitPrice: 110.00,
        total: 110.00
      },
      {
        id: 'pi-3',
        partName: 'Solvente Descarbonizador & Limpiador de Inyectores',
        sku: 'CHM-INJ-WRT',
        quantity: 1,
        unitPrice: 24.00,
        total: 24.00
      }
    ],
    subtotalLabor: 150.00,
    subtotalParts: 212.00,
    discountPercentage: 5,
    discountAmount: 18.10,
    taxRate: 0.18,
    taxAmount: 61.88,
    grandTotal: 405.78,
    status: 'Enviada',
    paymentTerms: '50% adelanto a la aprobación, 50% a la entrega del vehículo en caja',
    warrantyTerms: '12 meses o 10,000 km en repuestos originales y mano de obra de taller.',
    clientNotes: 'Enviado por correo electrónico y WhatsApp al cliente Sr. Carlos Mendoza.'
  },
  {
    id: 'cot-2',
    code: 'COT-2026-0180',
    workOrderId: 'ot-2',
    customerId: 'cust-2',
    vehicleId: 'veh-1',
    date: '2026-10-03',
    expirationDate: '2026-10-13',
    laborItems: [
      {
        id: 'li-4',
        description: 'Mantenimiento Preventivo 50,000 km según protocolo Toyota',
        hours: 3.0,
        hourlyRate: 50.00,
        total: 150.00
      },
      {
        id: 'li-5',
        description: 'Purga y cambio completo de líquido de frenos con máquina de presión',
        hours: 0.8,
        hourlyRate: 50.00,
        total: 40.00
      }
    ],
    partItems: [
      {
        id: 'pi-4',
        partId: 'part-1',
        partName: 'Filtro de Aceite de Cartucho Sintético',
        sku: 'FLT-OIL-TY01',
        quantity: 1,
        unitPrice: 28.00,
        total: 28.00
      },
      {
        id: 'pi-5',
        partId: 'part-3',
        partName: 'Aceite de Motor 100% Sintético 5W-30 (Galón 4L)',
        sku: 'LUB-5W30-SYN',
        quantity: 2,
        unitPrice: 65.00,
        total: 130.00
      },
      {
        id: 'pi-6',
        partId: 'part-8',
        partName: 'Filtro de Cabina Antipolen con Carbón Activado',
        sku: 'FLT-CAB-AC08',
        quantity: 1,
        unitPrice: 32.00,
        total: 32.00
      },
      {
        id: 'pi-7',
        partId: 'part-9',
        partName: 'Líquido de Frenos Sintético DOT 4 LV (Envase 1 Litro)',
        sku: 'LUB-BRK-DOT4',
        quantity: 1,
        unitPrice: 18.00,
        total: 18.00
      }
    ],
    subtotalLabor: 190.00,
    subtotalParts: 208.00,
    discountPercentage: 0,
    discountAmount: 0.00,
    taxRate: 0.18,
    taxAmount: 71.64,
    grandTotal: 469.64,
    status: 'Aprobada',
    approvalDate: '2026-10-03T16:00:00Z',
    paymentTerms: 'Crédito corporativo 30 días según convenio flotillero',
    warrantyTerms: '6 meses o 5,000 km en servicios preventivos.',
    clientNotes: 'Aprobado formalmente por Gerente de Flota Ing. Juan Pablo.'
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'ot-1',
    code: 'OT-2026-0501',
    appointmentId: 'apt-1',
    vehicleId: 'veh-2',
    customerId: 'cust-1',
    technicianId: 'tech-1',
    receptionChecklistId: 'chk-1',
    diagnosisId: 'diag-1',
    quotationId: 'cot-1',
    bayLocation: 'Bahía 02 - Diagnóstico Electrónico',
    currentStage: 'cotizacion_pendiente',
    priority: 'Alta',
    entryDate: '2026-10-04T08:35:00Z',
    promisedDate: '2026-10-05T17:00:00Z',
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
    serviceAdvisor: 'Guillermo Castro',
    paidStatus: 'Pendiente',
    totalAmount: 405.78
  },
  {
    id: 'ot-2',
    code: 'OT-2026-0502',
    appointmentId: 'apt-2',
    vehicleId: 'veh-1',
    customerId: 'cust-2',
    technicianId: 'tech-4',
    bayLocation: 'Elevador 01 - Mantenimiento Periódico',
    currentStage: 'en_reparacion',
    priority: 'Normal',
    entryDate: '2026-10-04T09:20:00Z',
    promisedDate: '2026-10-04T18:00:00Z',
    quotationId: 'cot-2',
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
    serviceAdvisor: 'Karla Morales',
    paidStatus: 'Crédito Autorizado',
    totalAmount: 469.64
  },
  {
    id: 'ot-3',
    code: 'OT-2026-0503',
    appointmentId: 'apt-3',
    vehicleId: 'veh-4',
    customerId: 'cust-4',
    technicianId: 'tech-2',
    receptionChecklistId: 'chk-2',
    diagnosisId: 'diag-2',
    bayLocation: 'Elevador 03 - Suspensión Pesada',
    currentStage: 'diagnostico',
    priority: 'Alta',
    entryDate: '2026-10-04T11:05:00Z',
    promisedDate: '2026-10-06T12:00:00Z',
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
    serviceAdvisor: 'Guillermo Castro',
    paidStatus: 'Pendiente'
  },
  {
    id: 'ot-4',
    code: 'OT-2026-0498',
    vehicleId: 'veh-5',
    customerId: 'cust-5',
    technicianId: 'tech-1',
    bayLocation: 'Bahía 05 - Control de Calidad',
    currentStage: 'control_calidad',
    priority: 'Normal',
    entryDate: '2026-10-03T10:00:00Z',
    promisedDate: '2026-10-04T16:30:00Z',
    qualityCheck: {
      roadTestPerformed: true,
      fluidLevelsVerified: true,
      wheelLugTorqueVerified: true,
      cleanAndWashed: false,
      faultCodesCleared: true,
      inspectorName: 'Ing. Mateo Huamán',
      passed: false,
      notes: 'Prueba de ruta aprobada. Pendiente pase a zona de lavado y aspirado final.'
    },
    serviceAdvisor: 'Karla Morales',
    paidStatus: 'Pagado',
    totalAmount: 310.00
  },
  {
    id: 'ot-5',
    code: 'OT-2026-0490',
    vehicleId: 'veh-3',
    customerId: 'cust-3',
    technicianId: 'tech-3',
    bayLocation: 'Estacionamiento de Entrega VIP',
    currentStage: 'listo_entrega',
    priority: 'Normal',
    entryDate: '2026-10-02T15:00:00Z',
    promisedDate: '2026-10-04T12:00:00Z',
    completedDate: '2026-10-04T11:45:00Z',
    qualityCheck: {
      roadTestPerformed: true,
      fluidLevelsVerified: true,
      wheelLugTorqueVerified: true,
      cleanAndWashed: true,
      faultCodesCleared: true,
      inspectorName: 'Ing. Mateo Huamán',
      passed: true,
      notes: 'Inspección 100% conforme. Vehículo lavado, desinfectado y perfumado.'
    },
    serviceAdvisor: 'Karla Morales',
    paidStatus: 'Pagado',
    totalAmount: 520.00
  }
];
