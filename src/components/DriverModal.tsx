import React, { useState, useEffect } from 'react';
import { FleetDriver, EquipmentType } from '../types/dispatch';
import { X, User, Phone, Mail, Truck, ShieldCheck, MapPin, DollarSign, Check } from 'lucide-react';

interface DriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (driver: FleetDriver) => void;
  existingDriver?: FleetDriver | null;
}

const EQUIPMENT_OPTIONS: EquipmentType[] = [
  '53 Dry Van',
  '53 Reefer',
  'Flatbed',
  'Step Deck',
  'Power Only',
  'Hotshot',
];

export const DriverModal: React.FC<DriverModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingDriver,
}) => {
  const [formData, setFormData] = useState<Partial<FleetDriver>>({
    name: '',
    phone: '',
    email: '',
    truckNumber: '',
    trailerNumber: '',
    equipmentType: '53 Dry Van',
    mcNumber: 'MC-',
    dotNumber: 'DOT-',
    status: 'active',
    homeBase: '',
    currentCityState: '',
    defaultFeePercent: 8,
    totalLoadsCompleted: 0,
    totalGrossEarned: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingDriver) {
      setFormData({ ...existingDriver });
    } else {
      const randId = Math.floor(100 + Math.random() * 900);
      setFormData({
        id: `DRV-${randId}`,
        name: '',
        phone: '',
        email: '',
        truckNumber: `TRK-${randId}`,
        trailerNumber: `TRL-${randId}`,
        equipmentType: '53 Dry Van',
        mcNumber: `MC-1${Math.floor(500000 + Math.random() * 400000)}`,
        dotNumber: `DOT-3${Math.floor(800000 + Math.random() * 190000)}`,
        status: 'active',
        homeBase: 'Atlanta, GA',
        currentCityState: 'Atlanta, GA',
        defaultFeePercent: 8,
        totalLoadsCompleted: 0,
        totalGrossEarned: 0,
      });
    }
    setErrors({});
  }, [existingDriver, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Driver/Carrier name is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.truckNumber?.trim()) newErrors.truckNumber = 'Truck / Power Unit # is required';
    if (!formData.trailerNumber?.trim()) newErrors.trailerNumber = 'Trailer # is required';
    if (!formData.homeBase?.trim()) newErrors.homeBase = 'Home base is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const driverToSave: FleetDriver = {
      id: formData.id || `DRV-${Date.now()}`,
      name: formData.name || 'New Driver',
      phone: formData.phone || '',
      email: formData.email || '',
      truckNumber: formData.truckNumber || 'TRK-999',
      trailerNumber: formData.trailerNumber || 'TRL-999',
      equipmentType: (formData.equipmentType as EquipmentType) || '53 Dry Van',
      mcNumber: formData.mcNumber || 'MC-000000',
      dotNumber: formData.dotNumber || 'DOT-000000',
      status: (formData.status as FleetDriver['status']) || 'active',
      homeBase: formData.homeBase || 'Atlanta, GA',
      currentCityState: formData.currentCityState || formData.homeBase || 'Atlanta, GA',
      defaultFeePercent: Number(formData.defaultFeePercent) || 8,
      totalLoadsCompleted: Number(formData.totalLoadsCompleted) || 0,
      totalGrossEarned: Number(formData.totalGrossEarned) || 0,
    };

    onSave(driverToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-stone-900 border border-stone-850 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">
                {existingDriver ? `Edit Carrier: ${existingDriver.name}` : 'Add New Driver / Carrier Unit'}
              </h3>
              <p className="text-xs text-stone-400">
                Manage Sound Minded Dispatching carrier roster profile, equipment, authority and agreement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Driver Name & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Driver / Owner-Operator Name *</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Marcus Vance or Apex Freight LLC"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 bg-stone-950 border rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500 ${
                  errors.name ? 'border-rose-500' : 'border-stone-700'
                }`}
              />
              {errors.name && <span className="text-[10px] text-rose-400">{errors.name}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300">Carrier Status</label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="active">Active (Available)</option>
                <option value="on_load">On Load (In Transit)</option>
                <option value="off_duty">Off Duty (Home Time)</option>
                <option value="maintenance">In Shop (Maintenance)</option>
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>Phone Number *</span>
              </label>
              <input
                type="text"
                placeholder="(404) 555-0192"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 bg-stone-950 border rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500 ${
                  errors.phone ? 'border-rose-500' : 'border-stone-700'
                }`}
              />
              {errors.phone && <span className="text-[10px] text-rose-400">{errors.phone}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                placeholder="driver@soundmindedfleet.com"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Equipment & Units */}
          <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-xl space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              <span>Assigned Equipment & Units</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-300">Truck / Power Unit # *</label>
                <input
                  type="text"
                  placeholder="e.g. TRK-101"
                  value={formData.truckNumber || ''}
                  onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value })}
                  className={`w-full px-3 py-2 bg-stone-900 border rounded-lg text-xs font-mono text-stone-100 focus:outline-none focus:border-amber-500 ${
                    errors.truckNumber ? 'border-rose-500' : 'border-stone-700'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-300">Trailer # *</label>
                <input
                  type="text"
                  placeholder="e.g. TRL-5301"
                  value={formData.trailerNumber || ''}
                  onChange={(e) => setFormData({ ...formData, trailerNumber: e.target.value })}
                  className={`w-full px-3 py-2 bg-stone-900 border rounded-lg text-xs font-mono text-stone-100 focus:outline-none focus:border-amber-500 ${
                    errors.trailerNumber ? 'border-rose-500' : 'border-stone-700'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-300">Equipment Type</label>
                <select
                  value={formData.equipmentType || '53 Dry Van'}
                  onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value as EquipmentType })}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  {EQUIPMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Authority Compliance & Agreements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>MC Number</span>
              </label>
              <input
                type="text"
                placeholder="MC-1598421"
                value={formData.mcNumber || ''}
                onChange={(e) => setFormData({ ...formData, mcNumber: e.target.value })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300">USDOT Number</label>
              <input
                type="text"
                placeholder="DOT-3982410"
                value={formData.dotNumber || ''}
                onChange={(e) => setFormData({ ...formData, dotNumber: e.target.value })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>Dispatch Fee % *</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={formData.defaultFeePercent || 8}
                  onChange={(e) => setFormData({ ...formData, defaultFeePercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-mono">%</span>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>Home Base (City, ST) *</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Atlanta, GA"
                value={formData.homeBase || ''}
                onChange={(e) => setFormData({ ...formData, homeBase: e.target.value })}
                className={`w-full px-3 py-2 bg-stone-950 border rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500 ${
                  errors.homeBase ? 'border-rose-500' : 'border-stone-700'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Current Real-time Location</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Dallas, TX or En Route I-20"
                value={formData.currentCityState || ''}
                onChange={(e) => setFormData({ ...formData, currentCityState: e.target.value })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              <span>{existingDriver ? 'Save Driver Changes' : 'Register New Carrier'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
