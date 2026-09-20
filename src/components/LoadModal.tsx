import React, { useState, useEffect } from 'react';
import { DispatchLoad, EquipmentType, FleetDriver, LoadStatus, PaymentStatus } from '../types/dispatch';
import { X, Calculator, Truck, MapPin, DollarSign, Calendar, FileText } from 'lucide-react';

interface LoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (load: DispatchLoad) => void;
  drivers: FleetDriver[];
  existingLoad?: DispatchLoad | null;
  defaultStatus?: LoadStatus;
}

export const LoadModal: React.FC<LoadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  drivers,
  existingLoad,
  defaultStatus = 'booked',
}) => {
  const [formData, setFormData] = useState<Partial<DispatchLoad>>({
    loadNumber: '',
    status: defaultStatus,
    driverId: '',
    driverName: '',
    driverPhone: '',
    truckNumber: '',
    trailerNumber: '',
    equipmentType: '53 Dry Van',
    originCity: '',
    originState: '',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: '08:00',
    destCity: '',
    destState: '',
    deliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    deliveryTime: '12:00',
    brokerName: '',
    brokerContact: '',
    commodity: 'General Freight',
    weightLbs: 38000,
    loadedMiles: 500,
    deadheadMiles: 25,
    rateGross: 2000,
    dispatchFeePercent: 8,
    paymentStatus: 'unpaid',
    specialInstructions: '',
    bolNumber: '',
  });

  useEffect(() => {
    if (existingLoad) {
      setFormData({ ...existingLoad });
    } else {
      // Generate sequential load number
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const defaultDriver = drivers[0];
      setFormData({
        loadNumber: `SM-${randomNum}`,
        status: defaultStatus || 'booked',
        driverId: defaultDriver ? defaultDriver.id : '',
        driverName: defaultDriver ? defaultDriver.name : '',
        driverPhone: defaultDriver ? defaultDriver.phone : '',
        truckNumber: defaultDriver ? defaultDriver.truckNumber : 'TRK-101',
        trailerNumber: defaultDriver ? defaultDriver.trailerNumber : 'TRL-5301',
        equipmentType: defaultDriver ? defaultDriver.equipmentType : '53 Dry Van',
        originCity: 'Atlanta',
        originState: 'GA',
        pickupDate: new Date().toISOString().split('T')[0],
        pickupTime: '08:00',
        destCity: 'Dallas',
        destState: 'TX',
        deliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        deliveryTime: '14:00',
        brokerName: 'C.H. Robinson',
        brokerContact: 'Dispatch Desk (800) 323-7308',
        commodity: 'General Freight',
        weightLbs: 38500,
        loadedMiles: 780,
        deadheadMiles: 30,
        rateGross: 2600,
        dispatchFeePercent: defaultDriver ? defaultDriver.defaultFeePercent : 8,
        paymentStatus: 'unpaid',
        specialInstructions: 'Standard freight delivery. Maintain seal.',
        bolNumber: `BOL-${randomNum}`,
      });
    }
  }, [existingLoad, drivers, isOpen]);

  if (!isOpen) return null;

  // Real-time calculations
  const gross = Number(formData.rateGross) || 0;
  const miles = Number(formData.loadedMiles) || 0;
  const feePct = Number(formData.dispatchFeePercent) || 8;
  const rpm = miles > 0 ? gross / miles : 0;
  const feeAmt = gross * (feePct / 100);
  const netPay = gross - feeAmt;

  const handleDriverSelect = (driverId: string) => {
    const selected = drivers.find((d) => d.id === driverId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        driverId: selected.id,
        driverName: selected.name,
        driverPhone: selected.phone,
        truckNumber: selected.truckNumber,
        trailerNumber: selected.trailerNumber,
        equipmentType: selected.equipmentType,
        dispatchFeePercent: selected.defaultFeePercent,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const completeLoad: DispatchLoad = {
      id: existingLoad ? existingLoad.id : `L-${Date.now()}`,
      loadNumber: formData.loadNumber || `SM-${Math.floor(1000 + Math.random() * 9000)}`,
      status: (formData.status as LoadStatus) || 'booked',
      driverId: formData.driverId || 'DRV-101',
      driverName: formData.driverName || 'Marcus Vance',
      driverPhone: formData.driverPhone || '',
      truckNumber: formData.truckNumber || 'TRK-101',
      trailerNumber: formData.trailerNumber || 'TRL-5301',
      equipmentType: (formData.equipmentType as EquipmentType) || '53 Dry Van',
      originCity: formData.originCity || 'Atlanta',
      originState: (formData.originState || 'GA').toUpperCase(),
      pickupDate: formData.pickupDate || new Date().toISOString().split('T')[0],
      pickupTime: formData.pickupTime || '08:00',
      destCity: formData.destCity || 'Dallas',
      destState: (formData.destState || 'TX').toUpperCase(),
      deliveryDate: formData.deliveryDate || new Date().toISOString().split('T')[0],
      deliveryTime: formData.deliveryTime || '12:00',
      brokerName: formData.brokerName || 'Freight Broker',
      brokerContact: formData.brokerContact || '',
      commodity: formData.commodity || 'General Freight',
      weightLbs: Number(formData.weightLbs) || 35000,
      loadedMiles: miles,
      deadheadMiles: Number(formData.deadheadMiles) || 0,
      rateGross: gross,
      dispatchFeePercent: feePct,
      dispatchFeeAmount: feeAmt,
      driverNetPay: netPay,
      ratePerMile: rpm,
      paymentStatus: (formData.paymentStatus as PaymentStatus) || 'unpaid',
      invoiceNumber: existingLoad?.invoiceNumber || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      specialInstructions: formData.specialInstructions || '',
      bolNumber: formData.bolNumber || '',
      createdAt: existingLoad ? existingLoad.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(completeLoad);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100">
                {existingLoad ? `Edit Load ${existingLoad.loadNumber}` : 'Book New Dispatch Load'}
              </h2>
              <p className="text-xs text-stone-400">Sound Minded Dispatching, LLC Scheduling System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Load ID & Driver Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Load Number</label>
              <input
                type="text"
                value={formData.loadNumber || ''}
                onChange={(e) => setFormData({ ...formData, loadNumber: e.target.value })}
                required
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Assign Driver</label>
              <select
                value={formData.driverId || ''}
                onChange={(e) => handleDriverSelect(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.truckNumber} - {d.equipmentType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Dispatch Status</label>
              <select
                value={formData.status || 'booked'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as LoadStatus })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="booked">Booked</option>
                <option value="dispatched">Dispatched</option>
                <option value="at_pickup">At Pickup</option>
                <option value="in_transit">In Transit</option>
                <option value="at_delivery">At Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="invoiced">Invoiced</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Section 2: Equipment & Truck / Trailer details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Equipment Type</label>
              <select
                value={formData.equipmentType || '53 Dry Van'}
                onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value as EquipmentType })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="53 Dry Van">53' Dry Van</option>
                <option value="53 Reefer">53' Reefer</option>
                <option value="Flatbed">Flatbed</option>
                <option value="Step Deck">Step Deck</option>
                <option value="Power Only">Power Only</option>
                <option value="Hotshot">Hotshot</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Truck Number</label>
              <input
                type="text"
                value={formData.truckNumber || ''}
                onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Trailer Number</label>
              <input
                type="text"
                value={formData.trailerNumber || ''}
                onChange={(e) => setFormData({ ...formData, trailerNumber: e.target.value })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Section 3: Route & Schedule (Origin / Dest) */}
          <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Lane & Schedule Information</span>
            </h3>

            {/* Origin (Pickup) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Pickup City</label>
                <input
                  type="text"
                  placeholder="e.g. Atlanta"
                  value={formData.originCity || ''}
                  onChange={(e) => setFormData({ ...formData, originCity: e.target.value })}
                  required
                  className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">State (2-letter)</label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="GA"
                  value={formData.originState || ''}
                  onChange={(e) => setFormData({ ...formData, originState: e.target.value.toUpperCase() })}
                  required
                  className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs uppercase font-bold text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Pickup Date</label>
                <input
                  type="date"
                  value={formData.pickupDate || ''}
                  onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                  className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Pickup Time</label>
                <input
                  type="text"
                  placeholder="08:00"
                  value={formData.pickupTime || ''}
                  onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                  className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Destination (Delivery) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Delivery City</label>
                <input
                  type="text"
                  placeholder="e.g. Dallas"
                  value={formData.destCity || ''}
                  onChange={(e) => setFormData({ ...formData, destCity: e.target.value })}
                  required
                  className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">State (2-letter)</label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="TX"
                  value={formData.destState || ''}
                  onChange={(e) => setFormData({ ...formData, destState: e.target.value.toUpperCase() })}
                  required
                  className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs uppercase font-bold text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Delivery Date</label>
                <input
                  type="date"
                  value={formData.deliveryDate || ''}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Delivery Time</label>
                <input
                  type="text"
                  placeholder="14:00"
                  value={formData.deliveryTime || ''}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                  className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Broker, Commodity, Weight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Broker / Customer</label>
              <input
                type="text"
                placeholder="e.g. C.H. Robinson, TQL"
                value={formData.brokerName || ''}
                onChange={(e) => setFormData({ ...formData, brokerName: e.target.value })}
                required
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Commodity</label>
              <input
                type="text"
                placeholder="e.g. Commercial HVAC, Frozen Food"
                value={formData.commodity || ''}
                onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Weight (lbs)</label>
              <input
                type="number"
                value={formData.weightLbs || ''}
                onChange={(e) => setFormData({ ...formData, weightLbs: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Section 5: Financials & Mileage (Real-time calculation box) */}
          <div className="p-4 bg-stone-950/80 border border-stone-800 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Rates, Mileage & Dispatch Fee Calculations</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Gross Freight Rate ($)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.rateGross || ''}
                  onChange={(e) => setFormData({ ...formData, rateGross: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm font-bold font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Loaded Miles</label>
                <input
                  type="number"
                  value={formData.loadedMiles || ''}
                  onChange={(e) => setFormData({ ...formData, loadedMiles: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Deadhead Miles</label>
                <input
                  type="number"
                  value={formData.deadheadMiles || 0}
                  onChange={(e) => setFormData({ ...formData, deadheadMiles: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Dispatch Fee (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.dispatchFeePercent || 8}
                  onChange={(e) => setFormData({ ...formData, dispatchFeePercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Calculated Output Display */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-stone-800/80 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-center">
                <span className="text-stone-500 text-[10px] uppercase block">Rate Per Mile (RPM)</span>
                <span className="text-sm font-bold text-violet-400">${rpm.toFixed(2)}/mi</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-center">
                <span className="text-amber-500/80 text-[10px] uppercase block">Sound Minded Fee ({feePct}%)</span>
                <span className="text-sm font-bold text-amber-400">${feeAmt.toFixed(2)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-center">
                <span className="text-blue-500/80 text-[10px] uppercase block">Driver Net Pay</span>
                <span className="text-sm font-bold text-blue-400">${netPay.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Section 6: Special Instructions */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Dispatch Instructions & Notes (Appears on Rate Confirmation)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Appointment required. Pre-cool trailer to -10°F. Call 1 hour prior to arrival."
              value={formData.specialInstructions || ''}
              onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              {existingLoad ? 'Save Changes' : 'Confirm & Schedule Load'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
