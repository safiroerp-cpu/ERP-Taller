import React, { useState, useEffect } from 'react';
import { ExteriorDamageMark, VehicleCategory } from '../../types/erp';
import { Plus, Trash2, AlertCircle, Eye, Check, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

interface CarDamageMapProps {
  damages: ExteriorDamageMark[];
  onAddDamage: (damage: ExteriorDamageMark) => void;
  onRemoveDamage: (id: string) => void;
  readOnly?: boolean;
  initialVehicleCategory?: VehicleCategory;
  onCategoryChange?: (category: VehicleCategory) => void;
}

export const CarDamageMap: React.FC<CarDamageMapProps> = ({
  damages,
  onAddDamage,
  onRemoveDamage,
  readOnly = false,
  initialVehicleCategory = 'suv_pickup',
  onCategoryChange
}) => {
  const [vehicleType, setVehicleType] = useState<VehicleCategory>(initialVehicleCategory);
  const [activeView, setActiveView] = useState<ExteriorDamageMark['view']>('lateral_izq');
  const [selectedDamageType, setSelectedDamageType] = useState<ExteriorDamageMark['damageType']>('Rayón / Arañazo');
  const [selectedSeverity, setSelectedSeverity] = useState<ExteriorDamageMark['severity']>('Leve');
  const [damageNotes, setDamageNotes] = useState('');
  const [pendingCoords, setPendingCoords] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (initialVehicleCategory) {
      setVehicleType(initialVehicleCategory);
    }
  }, [initialVehicleCategory]);

  const handleSelectCategory = (cat: VehicleCategory) => {
    setVehicleType(cat);
    if (onCategoryChange) {
      onCategoryChange(cat);
    }
  };

  const handleDiagramClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setPendingCoords({ x, y });
  };

  const confirmAddDamage = () => {
    if (!pendingCoords) return;
    const newDamage: ExteriorDamageMark = {
      id: `dmg-${Date.now()}`,
      x: pendingCoords.x,
      y: pendingCoords.y,
      view: activeView,
      damageType: selectedDamageType,
      severity: selectedSeverity,
      notes: damageNotes.trim() || `${selectedDamageType} (${selectedSeverity}) en vista ${activeView}`
    };
    onAddDamage(newDamage);
    setPendingCoords(null);
    setDamageNotes('');
  };

  const handleChangeDamageSeverity = (id: string, newSeverity: ExteriorDamageMark['severity']) => {
    const target = damages.find(d => d.id === id);
    if (!target) return;
    onRemoveDamage(id);
    onAddDamage({
      ...target,
      severity: newSeverity
    });
  };

  const getSeverityPinBg = (severity: ExteriorDamageMark['severity']) => {
    switch (severity) {
      case 'Severo':
        return 'bg-red-600 text-white ring-4 ring-red-400/80 shadow-lg shadow-red-900/60 border-2 border-white';
      case 'Moderado':
        return 'bg-orange-500 text-white ring-4 ring-orange-300/80 shadow-lg shadow-orange-900/60 border-2 border-white';
      case 'Leve':
        return 'bg-amber-400 text-slate-950 ring-4 ring-amber-200/80 shadow-lg shadow-amber-900/60 border-2 border-slate-900';
    }
  };

  const getSeverityBadgeClass = (severity: ExteriorDamageMark['severity']) => {
    switch (severity) {
      case 'Severo':
        return 'bg-red-600 text-white font-black border-red-700 shadow-sm';
      case 'Moderado':
        return 'bg-orange-500 text-white font-black border-orange-600 shadow-sm';
      case 'Leve':
        return 'bg-amber-400 text-slate-950 font-black border-amber-500 shadow-sm';
    }
  };

  const currentViewDamages = damages.filter(d => d.view === activeView);

  return (
    <div className="space-y-4">
      {/* 1. Vehicle Type Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Tipo de Carrocería:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { key: 'sedan', label: '🚗 Auto / Sedán' },
                { key: 'suv_pickup', label: '🚙 Camioneta / Pick-up' },
                { key: 'furgon', label: '🚐 Furgón / Van' },
                { key: 'camion', label: '🚛 Camión de Carga' }
              ] as const
            ).map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => handleSelectCategory(t.key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  vehicleType === t.key
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2 shrink-0">
          <Eye className="w-4 h-4 text-blue-400" />
          <span>Total daños registrados: <strong className="text-white font-mono font-bold">{damages.length}</strong></span>
        </div>
      </div>

      {/* 2. PROMINENT SEVERITY BAR */}
      <div className="bg-slate-900/95 border-2 border-slate-800 p-3.5 rounded-xl shadow-md space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Paso 1: Selecciona la Gravedad del Daño:
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            Elige el color antes o después de hacer clic en la imagen
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* LEVE */}
          <button
            type="button"
            onClick={() => setSelectedSeverity('Leve')}
            className={`p-2.5 rounded-xl border-2 transition-all flex items-center justify-between gap-2 text-left ${
              selectedSeverity === 'Leve'
                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-4 ring-amber-400/40 shadow-lg scale-[1.02]'
                : 'bg-slate-950 border-slate-700 text-amber-500 hover:border-amber-400/80 hover:bg-amber-500/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-400 ring-2 ring-slate-950 border border-white shrink-0"></span>
              <div>
                <p className="text-xs font-black uppercase leading-tight">LEVE (Amarillo)</p>
                <p className={`text-[10px] ${selectedSeverity === 'Leve' ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                  Rayón superficial / Arañazo
                </p>
              </div>
            </div>
            {selectedSeverity === 'Leve' && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

          {/* MODERADO */}
          <button
            type="button"
            onClick={() => setSelectedSeverity('Moderado')}
            className={`p-2.5 rounded-xl border-2 transition-all flex items-center justify-between gap-2 text-left ${
              selectedSeverity === 'Moderado'
                ? 'bg-orange-500 text-white border-orange-300 ring-4 ring-orange-500/40 shadow-lg scale-[1.02]'
                : 'bg-slate-950 border-slate-700 text-orange-500 hover:border-orange-400/80 hover:bg-orange-500/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-orange-500 ring-2 ring-white border border-slate-900 shrink-0"></span>
              <div>
                <p className="text-xs font-black uppercase leading-tight">MODERADO (Naranja)</p>
                <p className={`text-[10px] ${selectedSeverity === 'Moderado' ? 'text-orange-100 font-semibold' : 'text-slate-400'}`}>
                  Golpe / Abolladura / Masilla
                </p>
              </div>
            </div>
            {selectedSeverity === 'Moderado' && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

          {/* SEVERO */}
          <button
            type="button"
            onClick={() => setSelectedSeverity('Severo')}
            className={`p-2.5 rounded-xl border-2 transition-all flex items-center justify-between gap-2 text-left ${
              selectedSeverity === 'Severo'
                ? 'bg-red-600 text-white border-red-300 ring-4 ring-red-600/40 shadow-lg scale-[1.02]'
                : 'bg-slate-950 border-slate-700 text-red-500 hover:border-red-400/80 hover:bg-red-500/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-600 ring-2 ring-white border border-slate-900 shrink-0"></span>
              <div>
                <p className="text-xs font-black uppercase leading-tight">SEVERO (Rojo)</p>
                <p className={`text-[10px] ${selectedSeverity === 'Severo' ? 'text-red-100 font-semibold' : 'text-slate-400'}`}>
                  Rotura / Deformación / Planchado
                </p>
              </div>
            </div>
            {selectedSeverity === 'Severo' && <Check className="w-4 h-4 stroke-[3]" />}
          </button>
        </div>
      </div>

      {/* 3. View Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {(
            [
              { key: 'lateral_izq', label: 'Lateral Izquierdo' },
              { key: 'lateral_der', label: 'Lateral Derecho' },
              { key: 'frontal', label: 'Frontal (Frente)' },
              { key: 'trasera', label: 'Posterior (Atrás)' },
              { key: 'techo', label: 'Superior (Techo / Capó)' }
            ] as const
          ).map(tab => {
            const count = damages.filter(d => d.view === tab.key).length;
            const isActive = activeView === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveView(tab.key);
                  setPendingCoords(null);
                }}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md font-extrabold ring-2 ring-blue-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-blue-900 text-white' : 'bg-amber-400 text-slate-950'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Diagram and Marker Control Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Diagram Canvas */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-4 relative select-none shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>Diagrama:</span>
              <span className="text-blue-400 font-extrabold uppercase">
                {activeView === 'lateral_izq' && 'LATERAL IZQUIERDO'}
                {activeView === 'lateral_der' && 'LATERAL DERECHO'}
                {activeView === 'frontal' && 'VISTA FRONTAL'}
                {activeView === 'trasera' && 'VISTA TRASERA / POSTERIOR'}
                {activeView === 'techo' && 'VISTA SUPERIOR / TECHO'}
              </span>
              <span className="text-slate-400"> • ({vehicleType.replace('_', ' ').toUpperCase()})</span>
            </span>
            {!readOnly && (
              <span className="text-[11px] text-blue-400 font-semibold bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-800">
                Paso 2: Haz clic sobre el vehículo para colocar el marcador
              </span>
            )}
          </div>

          <div
            onClick={handleDiagramClick}
            className={`w-full h-80 relative rounded-xl border-2 border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center overflow-hidden transition-all ${
              readOnly ? 'cursor-default' : 'cursor-crosshair hover:border-blue-500/80 shadow-inner'
            }`}
          >
            {/* SVG Visual Body Silhouettes by Vehicle Type and View */}
            <svg
              className="w-full h-full p-2 pointer-events-none stroke-slate-400"
              viewBox="0 0 600 240"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* VEHICLE 1: AUTO / SEDAN */}
              {vehicleType === 'sedan' && (
                <>
                  {activeView === 'lateral_izq' && (
                    <g className="opacity-95">
                      <path d="M 60 160 L 105 160 A 35 35 0 0 1 175 160 L 405 160 A 35 35 0 0 1 475 160 L 545 160 C 560 160 568 145 560 130 L 535 105 C 520 90 490 88 450 88 L 365 85 L 265 48 C 245 42 225 42 195 45 L 125 58 C 100 62 85 78 70 98 L 50 120 C 40 130 40 148 50 156 Z" fill="#1e293b" fillOpacity="0.75" stroke="#94a3b8" strokeWidth="2.5" />
                      <path d="M 135 68 L 205 55 L 255 55 L 255 96 L 115 96 Z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                      <path d="M 270 55 L 350 86 L 440 88 L 440 96 L 270 96 Z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                      <circle cx="140" cy="160" r="32" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
                      <circle cx="140" cy="160" r="16" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                      <circle cx="440" cy="160" r="32" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
                      <circle cx="440" cy="160" r="16" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                      <path d="M 262 55 L 262 155" stroke="#64748b" strokeDasharray="3 3" />
                      <path d="M 160 105 L 185 105" stroke="#cbd5e1" strokeWidth="3" />
                      <path d="M 290 105 L 315 105" stroke="#cbd5e1" strokeWidth="3" />
                      <polygon points="50,120 70,125 65,145 45,140" fill="#fef08a" fillOpacity="0.6" stroke="#facc15" />
                      <polygon points="555,130 535,125 538,145 558,145" fill="#f87171" fillOpacity="0.6" stroke="#ef4444" />
                      <text x="300" y="215" fill="#64748b" fontSize="11" textAnchor="middle" fontWeight="bold">Lado Conductor (Izquierdo)</text>
                    </g>
                  )}
                  {activeView === 'lateral_der' && (
                    <g className="opacity-95" transform="translate(600, 0) scale(-1, 1)">
                      <path d="M 60 160 L 105 160 A 35 35 0 0 1 175 160 L 405 160 A 35 35 0 0 1 475 160 L 545 160 C 560 160 568 145 560 130 L 535 105 C 520 90 490 88 450 88 L 365 85 L 265 48 C 245 42 225 42 195 45 L 125 58 C 100 62 85 78 70 98 L 50 120 C 40 130 40 148 50 156 Z" fill="#1e293b" fillOpacity="0.75" stroke="#94a3b8" strokeWidth="2.5" />
                      <path d="M 135 68 L 205 55 L 255 55 L 255 96 L 115 96 Z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                      <path d="M 270 55 L 350 86 L 440 88 L 440 96 L 270 96 Z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                      <circle cx="140" cy="160" r="32" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
                      <circle cx="140" cy="160" r="16" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                      <circle cx="440" cy="160" r="32" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
                      <circle cx="440" cy="160" r="16" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                      <path d="M 262 55 L 262 155" stroke="#64748b" strokeDasharray="3 3" />
                      <path d="M 160 105 L 185 105" stroke="#cbd5e1" strokeWidth="3" />
                      <path d="M 290 105 L 315 105" stroke="#cbd5e1" strokeWidth="3" />
                      <polygon points="50,120 70,125 65,145 45,140" fill="#fef08a" fillOpacity="0.6" stroke="#facc15" />
                      <polygon points="555,130 535,125 538,145 558,145" fill="#f87171" fillOpacity="0.6" stroke="#ef4444" />
                      <rect x="475" y="105" width="16" height="18" rx="3" fill="#334155" stroke="#94a3b8" />
                    </g>
                  )}
                </>
              )}

              {/* VEHICLE 2: SUV / PICK-UP */}
              {vehicleType === 'suv_pickup' && (
                <>
                  {activeView === 'lateral_izq' && (
                    <g className="opacity-95">
                      <path d="M 50 160 L 95 160 A 38 38 0 0 1 170 160 L 400 160 A 38 38 0 0 1 475 160 L 550 160 C 565 160 570 145 570 115 L 565 85 L 370 85 L 370 45 C 360 38 340 38 290 38 L 200 42 C 165 48 140 70 120 90 L 50 105 C 38 115 38 145 50 160 Z" fill="#1e293b" fillOpacity="0.75" stroke="#94a3b8" strokeWidth="2.5" />
                      <path d="M 130 55 L 195 48 L 270 48 L 270 92 L 115 92 Z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                      <path d="M 285 48 L 355 48 L 355 92 L 285 92 Z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="368" y1="45" x2="368" y2="158" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
                      <circle cx="132" cy="160" r="36" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3.5" />
                      <circle cx="132" cy="160" r="18" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                      <circle cx="438" cy="160" r="36" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3.5" />
                      <circle cx="438" cy="160" r="18" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                      <path d="M 276 48 L 276 155" stroke="#64748b" strokeDasharray="3 3" />
                      <path d="M 180 102 L 205 102" stroke="#cbd5e1" strokeWidth="3" />
                      <path d="M 295 102 L 320 102" stroke="#cbd5e1" strokeWidth="3" />
                      <polygon points="45,108 65,112 60,135 40,130" fill="#fef08a" fillOpacity="0.6" stroke="#facc15" />
                      <polygon points="565,90 545,90 545,120 565,120" fill="#f87171" fillOpacity="0.6" stroke="#ef4444" />
                    </g>
                  )}
                  {activeView === 'lateral_der' && (
                    <g className="opacity-95" transform="translate(600, 0) scale(-1, 1)">
                      <path d="M 50 160 L 95 160 A 38 38 0 0 1 170 160 L 400 160 A 38 38 0 0 1 475 160 L 550 160 C 565 160 570 145 570 115 L 565 85 L 370 85 L 370 45 C 360 38 340 38 290 38 L 200 42 C 165 48 140 70 120 90 L 50 105 C 38 115 38 145 50 160 Z" fill="#1e293b" fillOpacity="0.75" stroke="#94a3b8" strokeWidth="2.5" />
                      <path d="M 130 55 L 195 48 L 270 48 L 270 92 L 115 92 Z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                      <path d="M 285 48 L 355 48 L 355 92 L 285 92 Z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="368" y1="45" x2="368" y2="158" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
                      <circle cx="132" cy="160" r="36" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3.5" />
                      <circle cx="132" cy="160" r="18" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                      <circle cx="438" cy="160" r="36" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3.5" />
                      <circle cx="438" cy="160" r="18" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                      <path d="M 276 48 L 276 155" stroke="#64748b" strokeDasharray="3 3" />
                      <path d="M 180 102 L 205 102" stroke="#cbd5e1" strokeWidth="3" />
                      <path d="M 295 102 L 320 102" stroke="#cbd5e1" strokeWidth="3" />
                      <polygon points="45,108 65,112 60,135 40,130" fill="#fef08a" fillOpacity="0.6" stroke="#facc15" />
                      <polygon points="565,90 545,90 545,120 565,120" fill="#f87171" fillOpacity="0.6" stroke="#ef4444" />
                      <rect x="480" y="95" width="18" height="20" rx="3" fill="#334155" stroke="#94a3b8" />
                    </g>
                  )}
                </>
              )}

              {/* VEHICLE 3: FURGON */}
              {vehicleType === 'furgon' && (
                <>
                  {activeView === 'lateral_izq' && (
                    <g className="opacity-95">
                      <path d="M 50 160 L 95 160 A 35 35 0 0 1 165 160 L 400 160 A 35 35 0 0 1 470 160 L 555 160 C 565 160 568 150 568 120 L 568 40 C 568 30 555 25 540 25 L 200 25 C 160 25 140 45 110 75 L 50 115 C 40 125 40 145 50 160 Z" fill="#1e293b" fillOpacity="0.75" stroke="#94a3b8" strokeWidth="2.5" />
                      <path d="M 125 40 L 195 35 L 195 85 L 85 85 Z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                      <rect x="220" y="35" width="130" height="120" rx="4" fill="none" stroke="#64748b" strokeDasharray="3 3" />
                      <rect x="330" y="90" width="12" height="6" rx="1" fill="#cbd5e1" />
                      <line x1="562" y1="35" x2="562" y2="155" stroke="#94a3b8" />
                      <circle cx="130" cy="160" r="32" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
                      <circle cx="435" cy="160" r="32" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
                      <polygon points="45,120 65,122 60,145 42,140" fill="#fef08a" fillOpacity="0.6" stroke="#facc15" />
                      <polygon points="562,70 545,70 545,110 562,110" fill="#f87171" fillOpacity="0.6" stroke="#ef4444" />
                    </g>
                  )}
                  {activeView === 'lateral_der' && (
                    <g className="opacity-95" transform="translate(600, 0) scale(-1, 1)">
                      <path d="M 50 160 L 95 160 A 35 35 0 0 1 165 160 L 400 160 A 35 35 0 0 1 470 160 L 555 160 C 565 160 568 150 568 120 L 568 40 C 568 30 555 25 540 25 L 200 25 C 160 25 140 45 110 75 L 50 115 C 40 125 40 145 50 160 Z" fill="#1e293b" fillOpacity="0.75" stroke="#94a3b8" strokeWidth="2.5" />
                      <path d="M 125 40 L 195 35 L 195 85 L 85 85 Z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                      <rect x="220" y="35" width="130" height="120" rx="4" fill="none" stroke="#64748b" strokeDasharray="3 3" />
                      <rect x="330" y="90" width="12" height="6" rx="1" fill="#cbd5e1" />
                      <line x1="562" y1="35" x2="562" y2="155" stroke="#94a3b8" />
                      <circle cx="130" cy="160" r="32" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
                      <circle cx="435" cy="160" r="32" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
                      <polygon points="45,120 65,122 60,145 42,140" fill="#fef08a" fillOpacity="0.6" stroke="#facc15" />
                      <polygon points="562,70 545,70 545,110 562,110" fill="#f87171" fillOpacity="0.6" stroke="#ef4444" />
                      <rect x="480" y="105" width="18" height="20" rx="3" fill="#334155" stroke="#94a3b8" />
                    </g>
                  )}
                </>
              )}

              {/* VEHICLE 4: CAMION */}
              {vehicleType === 'camion' && (
                <>
                  {activeView === 'lateral_izq' && (
                    <g className="opacity-95">
                      <path d="M 40 165 L 75 165 A 35 35 0 0 1 145 165 L 180 165 L 180 20 L 80 20 C 60 20 50 35 45 70 L 40 130 Z" fill="#1e293b" fillOpacity="0.8" stroke="#94a3b8" strokeWidth="2.5" />
                      <path d="M 50 35 L 130 35 L 130 85 L 50 85 Z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                      <rect x="190" y="15" width="380" height="145" rx="3" fill="#0f172a" fillOpacity="0.5" stroke="#94a3b8" strokeWidth="2.5" />
                      <line x1="190" y1="65" x2="570" y2="65" stroke="#475569" strokeDasharray="5 3" />
                      <line x1="190" y1="115" x2="570" y2="115" stroke="#475569" strokeDasharray="5 3" />
                      <circle cx="110" cy="165" r="34" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3.5" />
                      <circle cx="110" cy="165" r="16" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                      <circle cx="400" cy="165" r="34" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3.5" />
                      <circle cx="400" cy="165" r="16" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                      <circle cx="480" cy="165" r="34" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3.5" />
                      <circle cx="480" cy="165" r="16" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                      <rect x="230" y="145" width="80" height="25" rx="4" fill="#334155" stroke="#cbd5e1" />
                      <polygon points="38,125 55,128 50,150 36,145" fill="#fef08a" fillOpacity="0.7" stroke="#facc15" />
                      <polygon points="570,80 550,80 550,130 570,130" fill="#f87171" fillOpacity="0.7" stroke="#ef4444" />
                    </g>
                  )}
                  {activeView === 'lateral_der' && (
                    <g className="opacity-95" transform="translate(600, 0) scale(-1, 1)">
                      <path d="M 40 165 L 75 165 A 35 35 0 0 1 145 165 L 180 165 L 180 20 L 80 20 C 60 20 50 35 45 70 L 40 130 Z" fill="#1e293b" fillOpacity="0.8" stroke="#94a3b8" strokeWidth="2.5" />
                      <path d="M 50 35 L 130 35 L 130 85 L 50 85 Z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                      <rect x="190" y="15" width="380" height="145" rx="3" fill="#0f172a" fillOpacity="0.5" stroke="#94a3b8" strokeWidth="2.5" />
                      <line x1="190" y1="65" x2="570" y2="65" stroke="#475569" strokeDasharray="5 3" />
                      <line x1="190" y1="115" x2="570" y2="115" stroke="#475569" strokeDasharray="5 3" />
                      <circle cx="110" cy="165" r="34" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3.5" />
                      <circle cx="110" cy="165" r="16" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                      <circle cx="400" cy="165" r="34" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3.5" />
                      <circle cx="400" cy="165" r="16" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                      <circle cx="480" cy="165" r="34" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3.5" />
                      <circle cx="480" cy="165" r="16" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                      <rect x="230" y="145" width="80" height="25" rx="4" fill="#334155" stroke="#cbd5e1" />
                      <polygon points="38,125 55,128 50,150 36,145" fill="#fef08a" fillOpacity="0.7" stroke="#facc15" />
                      <polygon points="570,80 550,80 550,130 570,130" fill="#f87171" fillOpacity="0.7" stroke="#ef4444" />
                    </g>
                  )}
                </>
              )}

              {/* SHARED: FRONTAL */}
              {activeView === 'frontal' && (
                <g className="opacity-95">
                  <path d="M 180 50 C 240 45 360 45 420 50 C 445 52 465 85 480 125 C 490 150 485 185 470 195 C 440 200 160 200 130 195 C 115 185 110 150 120 125 C 135 85 155 52 180 50 Z" fill="#1e293b" fillOpacity="0.7" stroke="#94a3b8" strokeWidth="2.5" />
                  <path d="M 195 62 L 405 62 L 430 115 L 170 115 Z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                  <rect x="220" y="145" width="160" height="35" rx="5" fill="#0f172a" stroke="#cbd5e1" />
                  <line x1="220" y1="156" x2="380" y2="156" stroke="#64748b" />
                  <line x1="220" y1="168" x2="380" y2="168" stroke="#64748b" />
                  <polygon points="140,125 190,130 185,150 135,142" fill="#fef08a" fillOpacity="0.7" stroke="#facc15" strokeWidth="2" />
                  <polygon points="460,125 410,130 415,150 465,142" fill="#fef08a" fillOpacity="0.7" stroke="#facc15" strokeWidth="2" />
                  <path d="M 165 110 L 125 98 L 130 122 Z" fill="#334155" stroke="#94a3b8" />
                  <path d="M 435 110 L 475 98 L 470 122 Z" fill="#334155" stroke="#94a3b8" />
                  <rect x="260" y="185" width="80" height="15" rx="2" fill="#1e293b" stroke="#cbd5e1" />
                  <text x="300" y="196" fill="#cbd5e1" fontSize="9" textAnchor="middle" fontWeight="bold">PERÚ</text>
                  <rect x="140" y="185" width="25" height="30" rx="3" fill="#0f172a" stroke="#cbd5e1" />
                  <rect x="435" y="185" width="25" height="30" rx="3" fill="#0f172a" stroke="#cbd5e1" />
                </g>
              )}

              {/* SHARED: TRASERA */}
              {activeView === 'trasera' && (
                <g className="opacity-95">
                  <path d="M 180 50 C 240 45 360 45 420 50 C 445 52 465 85 480 125 C 490 150 485 185 470 195 C 440 200 160 200 130 195 C 115 185 110 150 120 125 C 135 85 155 52 180 50 Z" fill="#1e293b" fillOpacity="0.7" stroke="#94a3b8" strokeWidth="2.5" />
                  <path d="M 200 62 L 400 62 L 425 112 L 175 112 Z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                  <polygon points="140,125 195,128 190,150 135,145" fill="#ef4444" fillOpacity="0.8" stroke="#ef4444" strokeWidth="2" />
                  <polygon points="460,125 405,128 410,150 465,145" fill="#ef4444" fillOpacity="0.8" stroke="#ef4444" strokeWidth="2" />
                  <path d="M 210 145 L 390 145 L 380 185 L 220 185 Z" fill="#0f172a" fillOpacity="0.3" stroke="#94a3b8" />
                  <rect x="260" y="155" width="80" height="20" rx="2" fill="#0f172a" stroke="#cbd5e1" />
                  <text x="300" y="169" fill="#facc15" fontSize="10" textAnchor="middle" fontWeight="bold">PLACA</text>
                  <circle cx="170" cy="195" r="7" fill="#334155" stroke="#cbd5e1" />
                  <rect x="140" y="185" width="25" height="30" rx="3" fill="#0f172a" stroke="#cbd5e1" />
                  <rect x="435" y="185" width="25" height="30" rx="3" fill="#0f172a" stroke="#cbd5e1" />
                </g>
              )}

              {/* SHARED: TECHO */}
              {activeView === 'techo' && (
                <g className="opacity-95">
                  <path d="M 250 25 C 290 20 310 20 350 25 C 380 30 395 55 400 95 L 400 160 C 395 200 380 220 350 225 C 310 230 290 230 250 225 C 220 220 205 200 200 160 L 200 95 C 205 55 220 30 250 25 Z" fill="#1e293b" fillOpacity="0.7" stroke="#94a3b8" strokeWidth="2.5" />
                  <path d="M 220 65 C 260 62 340 62 380 65" stroke="#cbd5e1" strokeWidth="2" />
                  <rect x="225" y="70" width="150" height="42" rx="4" fill="#0f172a" stroke="#cbd5e1" />
                  <rect x="230" y="120" width="140" height="50" rx="3" fill="#1e293b" stroke="#94a3b8" />
                  <rect x="225" y="180" width="150" height="30" rx="4" fill="#0f172a" stroke="#cbd5e1" />
                  <rect x="185" y="75" width="15" height="25" rx="3" fill="#334155" stroke="#cbd5e1" />
                  <rect x="400" y="75" width="15" height="25" rx="3" fill="#334155" stroke="#cbd5e1" />
                </g>
              )}
            </svg>

            {/* Existing Markers */}
            {currentViewDamages.map((dmg, idx) => (
              <div
                key={dmg.id}
                style={{ left: `${dmg.x}%`, top: `${dmg.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black cursor-pointer transition-transform hover:scale-125 ${getSeverityPinBg(
                    dmg.severity
                  )}`}
                  title={`${dmg.damageType} (${dmg.severity}): ${dmg.notes}`}
                >
                  {idx + 1}
                </div>

                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30">
                  <div className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white shadow-2xl whitespace-nowrap space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <span>{dmg.damageType}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${getSeverityBadgeClass(dmg.severity)}`}>
                        {dmg.severity}
                      </span>
                    </p>
                    <p className="text-slate-300 text-[11px]">{dmg.notes}</p>
                    {!readOnly && (
                      <div className="pt-1 border-t border-slate-800 flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">Cambiar:</span>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleChangeDamageSeverity(dmg.id, 'Leve');
                          }}
                          className="px-1.5 py-0.5 text-[9px] bg-amber-400 text-slate-950 font-bold rounded"
                        >
                          Leve
                        </button>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleChangeDamageSeverity(dmg.id, 'Moderado');
                          }}
                          className="px-1.5 py-0.5 text-[9px] bg-orange-500 text-white font-bold rounded"
                        >
                          Mod
                        </button>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleChangeDamageSeverity(dmg.id, 'Severo');
                          }}
                          className="px-1.5 py-0.5 text-[9px] bg-red-600 text-white font-bold rounded"
                        >
                          Sev
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="w-2 h-2 bg-slate-950 border-b border-r border-slate-700 rotate-45 -mt-1"></div>
                </div>
              </div>
            ))}

            {/* Pending Click Marker */}
            {pendingCoords && (
              <div
                style={{ left: `${pendingCoords.x}%`, top: `${pendingCoords.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
              >
                <span className="relative flex h-8 w-8">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      selectedSeverity === 'Severo'
                        ? 'bg-red-500'
                        : selectedSeverity === 'Moderado'
                        ? 'bg-orange-500'
                        : 'bg-amber-400'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-8 w-8 border-2 border-white items-center justify-center text-xs font-black shadow-2xl ${
                      selectedSeverity === 'Severo'
                        ? 'bg-red-600 text-white ring-4 ring-red-400'
                        : selectedSeverity === 'Moderado'
                        ? 'bg-orange-500 text-white ring-4 ring-orange-300'
                        : 'bg-amber-400 text-slate-950 ring-4 ring-amber-200'
                    }`}
                  >
                    +
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>Leyenda de Gravedad:</span>
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 ring-2 ring-amber-300"></span>
                <strong className="text-amber-300 font-bold">Leve</strong> (Rayón / Arañazo superficial)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-orange-500 ring-2 ring-orange-300"></span>
                <strong className="text-orange-300 font-bold">Moderado</strong> (Golpe / Requiere masilla)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 ring-2 ring-red-400"></span>
                <strong className="text-red-400 font-bold">Severo</strong> (Rotura / Planchado estructural)
              </span>
            </div>
          </div>
        </div>

        {/* Action / Marker Form Panel */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
            <span>{pendingCoords ? 'Registrar Daño Marcado' : 'Observaciones & Lista'}</span>
            {pendingCoords && (
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                selectedSeverity === 'Severo'
                  ? 'bg-red-900/80 text-red-200 border border-red-500'
                  : selectedSeverity === 'Moderado'
                  ? 'bg-orange-900/80 text-orange-200 border border-orange-500'
                  : 'bg-amber-900/80 text-amber-200 border border-amber-500'
              }`}>
                Punto fijado ({selectedSeverity})
              </span>
            )}
          </h4>

          {pendingCoords && !readOnly ? (
            <div className="space-y-3.5 bg-slate-900 p-4 rounded-xl border border-blue-500/50 shadow-inner">
              <div className="text-xs text-blue-400 font-mono font-semibold flex items-center justify-between">
                <span>Coordenadas: X: {pendingCoords.x}%, Y: {pendingCoords.y}%</span>
                <span className="text-slate-400 uppercase">({activeView})</span>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tipo de Daño
                </label>
                <select
                  value={selectedDamageType}
                  onChange={e => setSelectedDamageType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="Rayón / Arañazo">Rayón / Arañazo</option>
                  <option value="Abolladura / Golpe">Abolladura / Golpe</option>
                  <option value="Rotura / Fisura">Rotura / Fisura</option>
                  <option value="Descascarado de Pintura">Descascarado de Pintura</option>
                  <option value="Faltante">Pieza Faltante</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Gravedad seleccionada:
                </label>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs rounded-lg font-black border ${getSeverityBadgeClass(selectedSeverity)}`}>
                    {selectedSeverity}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    (Cambia arriba si deseas otro color)
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nota / Detalle del daño
                </label>
                <input
                  type="text"
                  placeholder="Ej: Rayón de 15cm con pintura base visible"
                  value={damageNotes}
                  onChange={e => setDamageNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={confirmAddDamage}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-lg text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" /> Confirmar Daño
                </button>
                <button
                  type="button"
                  onClick={() => setPendingCoords(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-3 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 px-2 border-2 border-dashed border-slate-800 rounded-xl space-y-2">
              <Sparkles className="w-6 h-6 text-blue-400 mx-auto" />
              <p className="text-xs text-slate-300 font-medium">
                {readOnly ? 'Modo de visualización' : 'Haz clic sobre cualquier parte del diagrama vehicular para marcar un nuevo daño.'}
              </p>
            </div>
          )}

          {/* List of damages in CURRENT view */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Daños en esta vista ({currentViewDamages.length})</span>
              <span className="text-[10px] text-slate-400">{activeView}</span>
            </h5>
            {currentViewDamages.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                Sin marcas registradas en {activeView.replace('_', ' ')}.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {currentViewDamages.map((dmg, idx) => (
                  <div
                    key={dmg.id}
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/90 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${getSeverityPinBg(dmg.severity)}`}>
                          {idx + 1}
                        </span>
                        <strong className="text-slate-100 font-bold">{dmg.damageType}</strong>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-black border ${getSeverityBadgeClass(dmg.severity)}`}>
                        {dmg.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{dmg.notes}</p>
                    {!readOnly && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400">Gravedad:</span>
                          <button
                            type="button"
                            onClick={() => handleChangeDamageSeverity(dmg.id, 'Leve')}
                            className={`px-1.5 py-0.5 text-[9px] rounded font-bold transition-all ${
                              dmg.severity === 'Leve'
                                ? 'bg-amber-400 text-slate-950 ring-1 ring-amber-300'
                                : 'bg-slate-800 text-slate-400 hover:text-amber-400'
                            }`}
                          >
                            Leve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeDamageSeverity(dmg.id, 'Moderado')}
                            className={`px-1.5 py-0.5 text-[9px] rounded font-bold transition-all ${
                              dmg.severity === 'Moderado'
                                ? 'bg-orange-500 text-white ring-1 ring-orange-300'
                                : 'bg-slate-800 text-slate-400 hover:text-orange-400'
                            }`}
                          >
                            Mod
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeDamageSeverity(dmg.id, 'Severo')}
                            className={`px-1.5 py-0.5 text-[9px] rounded font-bold transition-all ${
                              dmg.severity === 'Severo'
                                ? 'bg-red-600 text-white ring-1 ring-red-400'
                                : 'bg-slate-800 text-slate-400 hover:text-red-400'
                            }`}
                          >
                            Sev
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveDamage(dmg.id)}
                          className="text-slate-400 hover:text-red-400 p-1 transition-colors"
                          title="Eliminar marca"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
