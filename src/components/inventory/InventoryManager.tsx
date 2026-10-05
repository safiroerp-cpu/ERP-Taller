import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { PartItem, StockMovement } from '../../types/erp';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  ArrowDownRight, 
  ArrowUpRight, 
  Boxes, 
  X, 
  CheckCircle2, 
  History,
  FolderSync
} from 'lucide-react';

const CATEGORIES = [
  'Todas',
  'Filtros',
  'Frenos',
  'Lubricantes y Fluidos',
  'Suspensión y Dirección',
  'Motor y Correas',
  'Eléctrico e Iluminación',
  'Carrocería y Accesorios',
  'Transmisión y Embrague'
];

export const InventoryManager: React.FC = () => {
  const { parts, movements, addPart, updatePart, registerStockMovement, formatCurrency } = useERP();
  const [activeTab, setActiveTab] = useState<'catalog' | 'movements'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modal: Add or Edit Part
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<PartItem | null>(null);

  // Form State for Part
  const [partSku, setPartSku] = useState('');
  const [partOem, setPartOem] = useState('');
  const [partName, setPartName] = useState('');
  const [partCategory, setPartCategory] = useState<PartItem['category']>('Filtros');
  const [partCompat, setPartCompat] = useState('');
  const [partBrand, setPartBrand] = useState('');
  const [partStock, setPartStock] = useState<number>(10);
  const [partMinStock, setPartMinStock] = useState<number>(4);
  const [partCost, setPartCost] = useState<number>(15.0);
  const [partPrice, setPartPrice] = useState<number>(35.0);
  const [partLocation, setPartLocation] = useState('A-01-01');
  const [partSupplier, setPartSupplier] = useState('');

  // Modal: Quick Stock Movement
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedPartForMove, setSelectedPartForMove] = useState<string>('');
  const [movementType, setMovementType] = useState<StockMovement['type']>('INGRESO');
  const [movementQty, setMovementQty] = useState<number>(5);
  const [movementReason, setMovementReason] = useState('');
  const [movementRef, setMovementRef] = useState('');

  const openNewPartModal = () => {
    setEditingPart(null);
    setPartSku('');
    setPartOem('');
    setPartName('');
    setPartCategory('Filtros');
    setPartCompat('');
    setPartBrand('');
    setPartStock(10);
    setPartMinStock(4);
    setPartCost(15.0);
    setPartPrice(35.0);
    setPartLocation('A-01-01');
    setPartSupplier('');
    setIsPartModalOpen(true);
  };

  const openEditPartModal = (p: PartItem) => {
    setEditingPart(p);
    setPartSku(p.sku);
    setPartOem(p.oemCode);
    setPartName(p.name);
    setPartCategory(p.category);
    setPartCompat(p.compatibility);
    setPartBrand(p.brand);
    setPartStock(p.stock);
    setPartMinStock(p.minStock);
    setPartCost(p.unitCost);
    setPartPrice(p.unitPrice);
    setPartLocation(p.location);
    setPartSupplier(p.supplier);
    setIsPartModalOpen(true);
  };

  const handleSavePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName.trim()) return;

    if (editingPart) {
      updatePart({
        ...editingPart,
        sku: partSku || editingPart.sku,
        oemCode: partOem,
        name: partName.trim(),
        category: partCategory,
        compatibility: partCompat,
        brand: partBrand,
        stock: Number(partStock),
        minStock: Number(partMinStock),
        unitCost: Number(partCost),
        unitPrice: Number(partPrice),
        location: partLocation,
        supplier: partSupplier
      });
    } else {
      addPart({
        sku: partSku.trim() || undefined,
        oemCode: partOem.trim(),
        name: partName.trim(),
        category: partCategory,
        compatibility: partCompat.trim(),
        brand: partBrand.trim(),
        stock: Number(partStock),
        minStock: Number(partMinStock),
        unitCost: Number(partCost),
        unitPrice: Number(partPrice),
        location: partLocation.trim(),
        supplier: partSupplier.trim()
      });
    }
    setIsPartModalOpen(false);
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartForMove || movementQty <= 0) return;

    registerStockMovement({
      partId: selectedPartForMove,
      type: movementType,
      quantity: Number(movementQty),
      reason: movementReason.trim() || 'Movimiento manual registrado por almacenero',
      referenceDoc: movementRef.trim() || undefined,
      performedBy: 'Jefe de Almacén'
    });

    setIsMovementModalOpen(false);
    setSelectedPartForMove('');
    setMovementReason('');
    setMovementRef('');
    setMovementQty(5);
  };

  const filteredParts = parts.filter(p => {
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    const matchesLowStock = !onlyLowStock || p.stock <= p.minStock;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.oemCode.toLowerCase().includes(term) ||
      p.compatibility.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term);
    return matchesCategory && matchesLowStock && matchesSearch;
  });

  const totalStockUnits = parts.reduce((sum, p) => sum + p.stock, 0);
  const totalCostValue = parts.reduce((sum, p) => sum + (p.stock * p.unitCost), 0);
  const totalPriceValue = parts.reduce((sum, p) => sum + (p.stock * p.unitPrice), 0);
  const lowStockCount = parts.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            Almacén & Catálogo de Repuestos OEM
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Control de inventario físico, kardex de movimientos y alertas de reposición
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMovementModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <FolderSync className="w-4 h-4 text-blue-400" />
            Movimiento de Stock
          </button>
          <button
            type="button"
            onClick={openNewPartModal}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Nuevo Repuesto
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Ítems en Catálogo
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-white">{parts.length}</span>
            <span className="text-[11px] text-slate-400">{totalStockUnits} un. totales</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Bajo Stock / Reponer
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-xl font-bold font-mono ${lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {lowStockCount}
            </span>
            {lowStockCount > 0 && (
              <span className="text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                Alerta activa
              </span>
            )}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Valoración al Costo
          </span>
          <div className="mt-1">
            <span className="text-xl font-bold font-mono text-slate-200">
              {formatCurrency(totalCostValue)}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Valor Venta Proyectado
          </span>
          <div className="mt-1">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {formatCurrency(totalPriceValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          {/* Main View Tabs */}
          <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'catalog' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              Catálogo de Stock
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('movements')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'movements' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Kardex de Movimientos ({movements.length})
            </button>
          </div>

          {activeTab === 'catalog' && (
            <button
              type="button"
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                onlyLowStock
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Solo Stock Crítico
            </button>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar SKU, OEM, nombre o ubicación..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Categories chips (Only on catalog tab) */}
      {activeTab === 'catalog' && (
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'catalog' ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">SKU / OEM</th>
                  <th className="py-3 px-4">Descripción del Repuesto</th>
                  <th className="py-3 px-4">Categoría & Marca</th>
                  <th className="py-3 px-4">Ubicación</th>
                  <th className="py-3 px-4 text-center">Stock Actual</th>
                  <th className="py-3 px-4 text-right">Costo / Venta</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredParts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500 italic">
                      No se encontraron repuestos con los criterios de búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredParts.map(part => {
                    const isLow = part.stock <= part.minStock;
                    return (
                      <tr key={part.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-blue-400 block">{part.sku}</span>
                          <span className="font-mono text-[10px] text-slate-400 block">OEM: {part.oemCode || 'N/A'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-100">{part.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{part.compatibility}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-200 block font-medium">{part.category}</span>
                          <span className="text-[11px] text-slate-400">{part.brand}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-300 text-[11px]">
                            {part.location}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`font-mono text-sm font-bold ${isLow ? 'text-rose-400' : 'text-slate-100'}`}>
                              {part.stock}
                            </span>
                            <span className="text-[10px] text-slate-500">Mín: {part.minStock}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <span className="text-slate-400 text-[11px] block">Costo: {formatCurrency(part.unitCost)}</span>
                          <span className="text-emerald-400 font-bold block">{formatCurrency(part.unitPrice)}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => openEditPartModal(part)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-[11px] font-medium transition-colors"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Tipo Movimiento</th>
                  <th className="py-3 px-4">Repuesto</th>
                  <th className="py-3 px-4 text-center">Cantidad</th>
                  <th className="py-3 px-4">Motivo / Documento Referencia</th>
                  <th className="py-3 px-4">Registrado Por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {movements.map(m => {
                  const part = parts.find(p => p.id === m.partId);
                  const isEntry = m.type === 'INGRESO' || m.type === 'DEVOLUCION';
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {new Date(m.date).toLocaleString('es-ES')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase inline-flex items-center gap-1 border ${
                          isEntry
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          {isEntry ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {m.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-200 block">{part?.name || 'Repuesto'}</span>
                        <span className="font-mono text-[10px] text-slate-400">SKU: {part?.sku}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                        <span className={isEntry ? 'text-emerald-400' : 'text-rose-400'}>
                          {isEntry ? `+${m.quantity}` : `-${m.quantity}`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-slate-200">{m.reason}</p>
                        {m.referenceDoc && (
                          <span className="text-[10px] font-mono text-blue-400">Ref: {m.referenceDoc}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {m.performedBy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New / Edit Part */}
      {isPartModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  {editingPart ? 'Editar Ficha de Repuesto' : 'Registrar Nuevo Repuesto en Catálogo'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPartModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePart} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Código SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: FLT-OIL-TY01"
                    value={partSku}
                    onChange={e => setPartSku(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Código OEM / Fabricante</label>
                  <input
                    type="text"
                    placeholder="Ej: 04152-YZZA1"
                    value={partOem}
                    onChange={e => setPartOem(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nombre / Descripción del Repuesto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Filtro de Aceite de Cartucho Sintético"
                  value={partName}
                  onChange={e => setPartName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Categoría</label>
                  <select
                    value={partCategory}
                    onChange={e => setPartCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    {CATEGORIES.filter(c => c !== 'Todas').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Marca del Fabricante</label>
                  <input
                    type="text"
                    placeholder="Ej: Denso, Bosch, Toyota Genuine"
                    value={partBrand}
                    onChange={e => setPartBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Compatibilidad con Vehículos</label>
                <input
                  type="text"
                  placeholder="Ej: Toyota Hilux 2.8 D-4D 2016-2024 / Fortuner"
                  value={partCompat}
                  onChange={e => setPartCompat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Stock Actual</label>
                  <input
                    type="number"
                    min="0"
                    value={partStock}
                    onChange={e => setPartStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    min="1"
                    value={partMinStock}
                    onChange={e => setPartMinStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Costo Unit. (S/)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={partCost}
                    onChange={e => setPartCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Precio Venta (S/)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={partPrice}
                    onChange={e => setPartPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Ubicación en Estantería</label>
                  <input
                    type="text"
                    placeholder="Ej: Pasillo B - Estante 2 - C-04"
                    value={partLocation}
                    onChange={e => setPartLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Proveedor Habitual</label>
                  <input
                    type="text"
                    placeholder="Ej: Distribuidora Oficial Toyota"
                    value={partSupplier}
                    onChange={e => setPartSupplier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPartModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingPart ? 'Actualizar Repuesto' : 'Registrar en Catálogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register Stock Movement */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <FolderSync className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Registrar Movimiento de Inventario</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMovementModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveMovement} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Repuesto *</label>
                <select
                  required
                  value={selectedPartForMove}
                  onChange={e => setSelectedPartForMove(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="">Seleccione repuesto...</option>
                  {parts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) - Stock actual: {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Tipo de Operación *</label>
                  <select
                    value={movementType}
                    onChange={e => setMovementType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="INGRESO">Ingreso / Compra Proveedor (+)</option>
                    <option value="SALIDA_OT">Salida a Orden de Trabajo (-)</option>
                    <option value="AJUSTE">Ajuste de Conteo Físico (=)</option>
                    <option value="DEVOLUCION">Devolución a Almacén (+)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Cantidad *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movementQty}
                    onChange={e => setMovementQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Documento / Referencia</label>
                <input
                  type="text"
                  placeholder="Ej: Factura Proveedor F001-9821 o OT-2026-0501"
                  value={movementRef}
                  onChange={e => setMovementRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Motivo / Detalle</label>
                <input
                  type="text"
                  placeholder="Ej: Recepción de pedido semanal por reposición de stock"
                  value={movementReason}
                  onChange={e => setMovementReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Procesar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
