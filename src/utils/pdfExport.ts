import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  TechnicalDiagnosis, 
  Quotation, 
  WorkOrder, 
  Vehicle, 
  Customer, 
  Technician 
} from '../types/erp';

export interface DiagnosisExportOptions {
  workOrder?: WorkOrder;
  vehicle?: Vehicle;
  customer?: Customer;
  technician?: Technician;
  autoDownload?: boolean;
}

export interface QuotationExportOptions {
  workOrder?: WorkOrder;
  vehicle?: Vehicle;
  customer?: Customer;
  technician?: Technician;
  autoDownload?: boolean;
}

const formatMoney = (amount: number = 0): string => {
  return 'S/ ' + Number(amount || 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Genera un PDF formal de Informe Técnico de Diagnóstico
 */
export const exportDiagnosisPDF = (
  diagnosis: TechnicalDiagnosis,
  options: DiagnosisExportOptions = {}
): { blob: Blob; fileName: string } => {
  const { workOrder, vehicle, customer, technician } = options;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let currentY = 14;

  // --- 1. CABECERA CORPORATIVA ---
  doc.setFillColor(30, 58, 138); // blue-900
  doc.rect(margin, currentY, pageWidth - (margin * 2), 3, 'F');
  currentY += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('SAFIRO GROUP', margin, currentY);

  doc.setFontSize(9);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text('TALLER AUTOMOTRIZ ESPECIALIZADO', margin, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('RUC: 20608912341 • Diagnóstico Electrónico Multimarca & Mecánica Integral', margin, currentY + 9);
  doc.text('Av. Javier Prado Este 2850, San Borja, Lima • Central: (01) 640-9000', margin, currentY + 13);

  // Recuadro del Código del Documento (Derecha)
  const boxWidth = 55;
  const boxHeight = 16;
  const boxX = pageWidth - margin - boxWidth;

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.6);
  doc.roundedRect(boxX, currentY - 2, boxWidth, boxHeight, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('INFORME TÉCNICO OFICIAL', boxX + (boxWidth / 2), currentY + 2.5, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(diagnosis.code, boxX + (boxWidth / 2), currentY + 8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const formattedDate = new Date(diagnosis.date).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Fecha: ${formattedDate}`, boxX + (boxWidth / 2), currentY + 12.5, { align: 'center' });

  currentY += 20;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;

  // --- 2. DATOS DEL CLIENTE, VEHÍCULO Y ORDEN DE TRABAJO ---
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: {
      fontSize: 8,
      cellPadding: 1.5,
      textColor: [30, 41, 59]
    },
    head: [
      [
        { content: 'DATOS DEL VEHÍCULO & CLIENTE', styles: { fontStyle: 'bold', textColor: [30, 58, 138], fontSize: 8.5 } },
        { content: 'DATOS DE LA ORDEN & TALLER', styles: { fontStyle: 'bold', textColor: [30, 58, 138], fontSize: 8.5 } }
      ]
    ],
    body: [
      [
        `Placa: ${vehicle?.plate || 'N/A'}    |    Año: ${vehicle?.year || 'N/A'}\nVehículo: ${vehicle?.brand || ''} ${vehicle?.model || ''} (${vehicle?.category || 'Auto'})\nKilometraje: ${diagnosis.odometer.toLocaleString()} km\nCliente: ${customer?.name || 'Cliente Particular'}  (Telf: ${customer?.phone || 'N/A'})`,
        `Orden de Trabajo: ${workOrder?.code || 'N/A'}\nAsesor / Técnico: ${technician?.name || 'Técnico Especialista'}\nEspecialidad: ${technician?.specialty || 'Diagnóstico Integral'} (${technician?.grade || 'Master'})\nHoras Estimadas: ${diagnosis.estimatedLaborHours} HH`
      ]
    ],
    tableLineColor: [203, 213, 225],
    tableLineWidth: 0.3
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // --- 3. EVALUACIÓN DETALLADA DE SISTEMAS ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('1. EVALUACIÓN Y MONITOREO DE SISTEMAS', margin, currentY);
  currentY += 2;

  const systemsData = [
    { name: 'Motor & Inyección Electrónica', ...diagnosis.systems.motor },
    { name: 'Sistema de Frenos & Seguridad ABS', ...diagnosis.systems.frenos },
    { name: 'Suspensión, Amortiguación & Dirección', ...diagnosis.systems.suspension },
    { name: 'Sistema Eléctrico, Alternador & Batería', ...diagnosis.systems.electricoYBateria },
    { name: 'Transmisión, Embrague & Caja', ...diagnosis.systems.transmision }
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Sistema Inspeccionado', 'Estado / Condición', 'Hallazgos, Mediciones & Observaciones Técnicas']],
    body: systemsData.map(sys => [
      sys.name,
      sys.status.toUpperCase(),
      sys.observation || 'Sin anomalías registradas durante la evaluación'
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 32, fontStyle: 'bold', halign: 'center' },
      2: { cellWidth: 'auto' }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // --- 4. DIAGNÓSTICO Y ANÁLISIS DE CAUSA RAÍZ ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('2. ANÁLISIS DE CAUSA RAÍZ & DICTAMEN TÉCNICO', margin, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const splitRootCause = doc.splitTextToSize(
    diagnosis.rootCauseAnalysis || 'No se registraron observaciones de causa raíz adicionales.',
    pageWidth - (margin * 2) - 8
  );
  const rootCauseBoxHeight = Math.max(14, splitRootCause.length * 4.2 + 8);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), rootCauseBoxHeight, 2, 2, 'FD');
  doc.text(splitRootCause, margin + 4, currentY + 5.5);
  currentY += rootCauseBoxHeight + 5;

  // --- 5. RECOMENDACIONES TÉCNICAS Y ACCIONES CORRECTIVAS ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('3. ACCIONES CORRECTIVAS RECOMENDADAS', margin, currentY);
  currentY += 4;

  diagnosis.technicianRecommendations.forEach((rec) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 58, 138);
    doc.text(`• `, margin + 2, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const splitRec = doc.splitTextToSize(rec, pageWidth - (margin * 2) - 10);
    doc.text(splitRec, margin + 6, currentY);
    currentY += splitRec.length * 3.8 + 1.5;
  });

  currentY += 3;

  // --- 6. REPUESTOS E INSUMOS PRESCRITOS ---
  if (diagnosis.suggestedParts && diagnosis.suggestedParts.length > 0) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 16;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('4. REPUESTOS E INSUMOS REQUERIDOS', margin, currentY);
    currentY += 2;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['#', 'Descripción del Repuesto / Insumo', 'Cantidad', 'Nivel de Urgencia']],
      body: diagnosis.suggestedParts.map((sp, idx) => [
        String(idx + 1),
        sp.partName,
        `${sp.quantity} un.`,
        sp.urgency
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        cellPadding: 1.8
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 1.8,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 'auto', fontStyle: 'bold' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 38, halign: 'center' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // --- 7. FIRMAS DE RESPONSABILIDAD TÉCNICA ---
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY = Math.max(currentY + 6, 245);
  }

  const sigColWidth = 70;
  const sig1X = margin + 10;
  const sig2X = pageWidth - margin - sigColWidth - 10;

  // Firma 1: Técnico
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(sig1X, currentY, sig1X + sigColWidth, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(technician?.name || 'Técnico Especialista', sig1X + (sigColWidth / 2), currentY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`${technician?.specialty || 'Diagnóstico Automotriz'} • Mat. Téc. 4910`, sig1X + (sigColWidth / 2), currentY + 7.5, { align: 'center' });

  // Firma 2: Jefe de Taller
  doc.line(sig2X, currentY, sig2X + sigColWidth, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Jefe de Taller & Control de Calidad', sig2X + (sigColWidth / 2), currentY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('SAFIRO GROUP • Taller Automotriz', sig2X + (sigColWidth / 2), currentY + 7.5, { align: 'center' });

  // --- PIE DE PÁGINA ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'SAFIRO GROUP • Taller Automotriz • Documento formal emitido para el cliente',
      margin,
      290
    );
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - margin,
      290,
      { align: 'right' }
    );
  }

  const safePlate = (vehicle?.plate || 'VEHICULO').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Informe_Tecnico_${diagnosis.code}_${safePlate}.pdf`;
  const blob = doc.output('blob');

  if (options.autoDownload !== false) {
    doc.save(fileName);
  }

  return { blob, fileName };
};

/**
 * Genera un PDF formal de Cotización / Proforma de Taller
 */
export const exportQuotationPDF = (
  quotation: Quotation,
  options: QuotationExportOptions = {}
): { blob: Blob; fileName: string } => {
  const { workOrder, vehicle, customer, technician } = options;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let currentY = 14;

  // --- 1. CABECERA CORPORATIVA ---
  doc.setFillColor(30, 58, 138); // blue-900
  doc.rect(margin, currentY, pageWidth - (margin * 2), 3, 'F');
  currentY += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text('SAFIRO GROUP', margin, currentY);

  doc.setFontSize(9);
  doc.setTextColor(37, 99, 235);
  doc.text('CENTRO AUTOMOTRIZ & TALLER ESPECIALIZADO', margin, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('RUC: 20608912341 • Servicio Técnico Autorizado • Repuestos Genuinos OEM', margin, currentY + 9);
  doc.text('Av. Javier Prado Este 2850, San Borja, Lima • Central: (01) 640-9000', margin, currentY + 13);

  // Recuadro del Código del Documento (Derecha)
  const boxWidth = 58;
  const boxHeight = 18;
  const boxX = pageWidth - margin - boxWidth;

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.6);
  doc.roundedRect(boxX, currentY - 2, boxWidth, boxHeight, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('COTIZACIÓN / PROFORMA', boxX + (boxWidth / 2), currentY + 2.5, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(quotation.code, boxX + (boxWidth / 2), currentY + 7.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Emisión: ${quotation.date}`, boxX + (boxWidth / 2), currentY + 11.5, { align: 'center' });
  doc.text(`Válida hasta: ${quotation.expirationDate}`, boxX + (boxWidth / 2), currentY + 15, { align: 'center' });

  currentY += 21;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4;

  // --- 2. DATOS DEL CLIENTE Y VEHÍCULO ---
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: {
      fontSize: 8,
      cellPadding: 1.5,
      textColor: [30, 41, 59]
    },
    head: [
      [
        { content: 'DATOS DEL CLIENTE', styles: { fontStyle: 'bold', textColor: [30, 58, 138], fontSize: 8.5 } },
        { content: 'DATOS DEL VEHÍCULO Y ORDEN', styles: { fontStyle: 'bold', textColor: [30, 58, 138], fontSize: 8.5 } }
      ]
    ],
    body: [
      [
        `Nombre / Razón Social: ${customer?.name || 'Cliente Particular'}\nDNI / RUC: ${customer?.documentNumber ? `${customer.documentType}: ${customer.documentNumber}` : 'No especificado'}\nTeléfono: ${customer?.phone || 'N/A'}\nCorreo: ${customer?.email || 'N/A'}`,
        `Placa: ${vehicle?.plate || 'N/A'}  (${vehicle?.year || 'N/A'})\nVehículo: ${vehicle?.brand || ''} ${vehicle?.model || ''} - ${vehicle?.color || ''}\nOrden de Trabajo (OT): ${workOrder?.code || 'Atención en Mostrador'}\nAsesor Técnico: ${technician?.name || 'SAFIRO GROUP Posventa'}`
      ]
    ],
    tableLineColor: [203, 213, 225],
    tableLineWidth: 0.3
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // --- 3. MANO DE OBRA CALIFICADA ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('1. MANO DE OBRA & SERVICIOS DE TALLER', margin, currentY);
  currentY += 2;

  const laborRows = quotation.laborItems.map((item, idx) => [
    String(idx + 1),
    item.description,
    `${Number(item.hours).toFixed(1)} hrs`,
    formatMoney(item.hourlyRate),
    formatMoney(item.total)
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Descripción de la Operación / Servicio Técnico', 'Horas (HH)', 'Tarifa/Hora', 'Total (S/)']],
    body: laborRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto', fontStyle: 'bold' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // --- 4. REPUESTOS, MATERIALES E INSUMOS ---
  if (quotation.partItems && quotation.partItems.length > 0) {
    if (currentY > 200) {
      doc.addPage();
      currentY = 16;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('2. REPUESTOS, MATERIALES & INSUMOS GENUINOS OEM', margin, currentY);
    currentY += 2;

    const partRows = quotation.partItems.map((item, idx) => [
      String(idx + 1),
      item.sku || 'OEM',
      item.partName,
      `${item.quantity} un.`,
      formatMoney(item.unitPrice),
      formatMoney(item.total)
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['#', 'SKU / Código', 'Descripción del Repuesto Original', 'Cant.', 'P. Unitario', 'Total (S/)']],
      body: partRows,
      theme: 'grid',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 2
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 28, halign: 'right' },
        5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;
  }

  // --- 5. RESUMEN FINANCIERO Y TOTALES ---
  if (currentY > 210) {
    doc.addPage();
    currentY = 16;
  }

  const totalsBoxWidth = 80;
  const totalsBoxX = pageWidth - margin - totalsBoxWidth;

  const totalLines: Array<[string, string, boolean]> = [
    ['Subtotal Mano de Obra:', formatMoney(quotation.subtotalLabor), false],
    ['Subtotal Repuestos e Insumos:', formatMoney(quotation.subtotalParts), false]
  ];

  if (quotation.discountAmount > 0) {
    totalLines.push([`Descuento Especial (${quotation.discountPercentage}%):`, `- ${formatMoney(quotation.discountAmount)}`, false]);
  }

  totalLines.push(['IGV Aplicado (18%):', formatMoney(quotation.taxAmount), false]);
  totalLines.push(['TOTAL GENERAL (S/):', formatMoney(quotation.grandTotal), true]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: totalsBoxX, right: margin },
    body: totalLines.map(([label, val, isGrand]) => [
      { content: label, styles: { fontStyle: isGrand ? 'bold' : 'normal', fontSize: isGrand ? 9.5 : 8 } },
      { content: val, styles: { halign: 'right', fontStyle: 'bold', fontSize: isGrand ? 10.5 : 8, textColor: isGrand ? [30, 58, 138] : [30, 41, 59] } }
    ]),
    theme: 'grid',
    styles: {
      cellPadding: 1.8
    }
  });

  // Términos comerciales a la izquierda de los totales
  const termsBoxWidth = pageWidth - (margin * 2) - totalsBoxWidth - 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text('CONDICIONES COMERCIALES & GARANTÍA', margin, currentY + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`• Condiciones de Pago: ${quotation.paymentTerms || 'Contado / Tarjeta / Transferencia bancaria'}`, margin, currentY + 8);
  doc.text(`• Garantía: ${quotation.warrantyTerms || '6 meses o 10,000 km en mano de obra y repuestos genuinos'}`, margin, currentY + 12.5);

  if (quotation.clientNotes) {
    const splitNotes = doc.splitTextToSize(`• Observaciones: ${quotation.clientNotes}`, termsBoxWidth);
    doc.text(splitNotes, margin, currentY + 17);
  }

  currentY = Math.max((doc as any).lastAutoTable.finalY + 8, currentY + 28);

  // --- 6. FIRMAS DE ACEPTACIÓN ---
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY = Math.max(currentY + 6, 245);
  }

  const sigColWidth = 72;
  const sig1X = margin + 10;
  const sig2X = pageWidth - margin - sigColWidth - 10;

  // Firma 1: Asesor SAFIRO GROUP
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(sig1X, currentY, sig1X + sigColWidth, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Asesor de Servicio SAFIRO GROUP', sig1X + (sigColWidth / 2), currentY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Firma y Sello de Autorización', sig1X + (sigColWidth / 2), currentY + 7.5, { align: 'center' });

  // Firma 2: Aceptación Cliente
  doc.line(sig2X, currentY, sig2X + sigColWidth, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Conformidad y Aprobación del Cliente', sig2X + (sigColWidth / 2), currentY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Firma, DNI / RUC y Fecha de Aceptación', sig2X + (sigColWidth / 2), currentY + 7.5, { align: 'center' });

  // --- PIE DE PÁGINA ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'SAFIRO GROUP • Taller Automotriz • Documento formal emitido para el cliente',
      margin,
      290
    );
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - margin,
      290,
      { align: 'right' }
    );
  }

  const safePlate = (vehicle?.plate || 'VEHICULO').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Cotizacion_${quotation.code}_${safePlate}.pdf`;
  const blob = doc.output('blob');

  if (options.autoDownload !== false) {
    doc.save(fileName);
  }

  return { blob, fileName };
};
