import React, { useState, useEffect } from 'react';
import { 
  LoadItem, 
  Driver, 
  Broker, 
  LoadStatus, 
  EquipmentType, 
  PaymentTerms, 
  PaymentStatus,
  STATUS_OPTIONS,
  EQUIPMENT_OPTIONS,
  PAYMENT_TERMS_OPTIONS,
  US_STATES
} from '../types';
import { 
  DollarSign, 
  Truck, 
  MapPin, 
  Calendar, 
  Building2, 
  Package, 
  CheckCircle2, 
  Sparkles,
  Calculator,
  Trash2
} from 'lucide-react';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { autoSaveService } from '../utils/autoSaveService';

interface AddEditLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (load: LoadItem) => void;
  onDelete?: (loadId: string) => void;
  editingLoad: LoadItem | null;
  drivers: Driver[];
  brokers: Broker[];
}

export const AddEditLoadModal: React.FC<AddEditLoadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingLoad,
  drivers,
  brokers
}) => {
  const [loadNumber, setLoadNumber] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [status, setStatus] = useState<LoadStatus>('Booked');

  // Dates
  const [pickupDate, setPickupDate] = useState('2026-08-27');
  const [pickupTime, setPickupTime] = useState('08:00 - 11:00');
  const [deliveryDate, setDeliveryDate] = useState('2026-08-29');
  const [deliveryTime, setDeliveryTime] = useState('13:00 - 16:00');

  // Shipper & Origin
  const [shipperName, setShipperName] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [originState, setOriginState] = useState('GA');
  const [originZip, setOriginZip] = useState('');

  // Receiver & Destination
  const [receiverName, setReceiverName] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [destinationState, setDestinationState] = useState('IL');
  const [destinationZip, setDestinationZip] = useState('');

  // Driver & Equipment
  const [driverId, setDriverId] = useState('');
  const [driverName, setDriverName] = useState('');
  const [truckNumber, setTruckNumber] = useState('');
  const [trailerNumber, setTrailerNumber] = useState('');
  const [equipmentType, setEquipmentType] = useState<EquipmentType>('Dry Van 53\'');

  // Commodity
  const [commodity, setCommodity] = useState('');
  const [weightLbs, setWeightLbs] = useState<number>(38000);

  // Broker
  const [brokerName, setBrokerName] = useState('');
  const [brokerPhone, setBrokerPhone] = useState('');
  const [brokerEmail, setBrokerEmail] = useState('');
  const [brokerMcNumber, setBrokerMcNumber] = useState('');

  // Miles & Rates
  const [loadedMiles, setLoadedMiles] = useState<number>(650);
  const [deadheadMiles, setDeadheadMiles] = useState<number>(40);
  const [grossRate, setGrossRate] = useState<number>(2500);
  const [accessorials, setAccessorials] = useState<number>(0);
  const [driverPay, setDriverPay] = useState<number>(700);
  const [fuelCost, setFuelCost] = useState<number>(550);
  const [tollsAndOtherExpenses, setTollsAndOtherExpenses] = useState<number>(60);

  // Billing
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('Net 30');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pending');
  const [notes, setNotes] = useState('');

  // Auto Calculations
  const totalMiles = (loadedMiles || 0) + (deadheadMiles || 0);
  const totalGross = (grossRate || 0) + (accessorials || 0);
  const ratePerMile = totalMiles > 0 ? totalGross / totalMiles : 0;
  const netProfit = totalGross - (driverPay || 0) - (fuelCost || 0) - (tollsAndOtherExpenses || 0);
  const profitMargin = totalGross > 0 ? (netProfit / totalGross) * 100 : 0;

  // Initialize or reset form
  useEffect(() => {
    if (editingLoad) {
      setLoadNumber(editingLoad.loadNumber);
      setOrderNumber(editingLoad.orderNumber);
      setStatus(editingLoad.status);
      setPickupDate(editingLoad.pickupDate);
      setPickupTime(editingLoad.pickupTime || '');
      setDeliveryDate(editingLoad.deliveryDate);
      setDeliveryTime(editingLoad.deliveryTime || '');
      setShipperName(editingLoad.shipperName);
      setOriginCity(editingLoad.originCity);
      setOriginState(editingLoad.originState);
      setOriginZip(editingLoad.originZip || '');
      setReceiverName(editingLoad.receiverName);
      setDestinationCity(editingLoad.destinationCity);
      setDestinationState(editingLoad.destinationState);
      setDestinationZip(editingLoad.destinationZip || '');
      setDriverId(editingLoad.driverId);
      setDriverName(editingLoad.driverName);
      setTruckNumber(editingLoad.truckNumber);
      setTrailerNumber(editingLoad.trailerNumber);
      setEquipmentType(editingLoad.equipmentType);
      setCommodity(editingLoad.commodity);
      setWeightLbs(editingLoad.weightLbs);
      setBrokerName(editingLoad.brokerName);
      setBrokerPhone(editingLoad.brokerPhone);
      setBrokerEmail(editingLoad.brokerEmail || '');
      setBrokerMcNumber(editingLoad.brokerMcNumber || '');
      setLoadedMiles(editingLoad.loadedMiles);
      setDeadheadMiles(editingLoad.deadheadMiles);
      setGrossRate(editingLoad.grossRate);
      setAccessorials(editingLoad.accessorials);
      setDriverPay(editingLoad.driverPay);
      setFuelCost(editingLoad.fuelCost);
      setTollsAndOtherExpenses(editingLoad.tollsAndOtherExpenses);
      setInvoiceNumber(editingLoad.invoiceNumber || '');
      setPaymentTerms(editingLoad.paymentTerms);
      setPaymentStatus(editingLoad.paymentStatus);
      setNotes(editingLoad.notes || '');
    } else {
      const newNum = `LD-${Math.floor(8500 + Math.random() * 1400)}`;
      const firstDrv = drivers[0];
      const firstBrk = brokers[0];
      
      setLoadNumber(newNum);
      setOrderNumber(`REF-${Math.floor(100000 + Math.random() * 900000)}`);
      setStatus('Booked');
      setPickupDate('2026-08-28');
      setPickupTime('08:00 - 11:00');
      setDeliveryDate('2026-08-30');
      setDeliveryTime('09:00 - 13:00');
      setShipperName('');
      setOriginCity('Atlanta');
      setOriginState('GA');
      setOriginZip('');
      setReceiverName('');
      setDestinationCity('Chicago');
      setDestinationState('IL');
      setDestinationZip('');
      
      if (firstDrv) {
        setDriverId(firstDrv.id);
        setDriverName(firstDrv.name);
        setTruckNumber(firstDrv.assignedTruck);
        setTrailerNumber(firstDrv.assignedTrailer);
        setEquipmentType(firstDrv.equipmentType);
      } else {
        setDriverId('DRV-001');
        setDriverName('Unassigned');
        setTruckNumber('TRK-100');
        setTrailerNumber('TRL-500');
        setEquipmentType('Dry Van 53\'');
      }

      if (firstBrk) {
        setBrokerName(firstBrk.name);
        setBrokerPhone(firstBrk.phone);
        setBrokerEmail(firstBrk.email);
        setBrokerMcNumber(firstBrk.mcNumber);
        setPaymentTerms(firstBrk.paymentTerms);
      }

      setCommodity('General Freight / Consumer Goods');
      setWeightLbs(36000);
      setLoadedMiles(710);
      setDeadheadMiles(40);
      setGrossRate(2600);
      setAccessorials(0);
      setDriverPay(728);
      setFuelCost(580);
      setTollsAndOtherExpenses(50);
      setInvoiceNumber(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
      setPaymentStatus('Pending');
      setNotes('');
    }
  }, [editingLoad, isOpen, drivers, brokers]);

  // When driver selection changes, autofill equipment & calculate suggested driver pay
  const handleDriverChange = (selectedName: string) => {
    setDriverName(selectedName);
    const drv = drivers.find(d => d.name === selectedName);
    if (drv) {
      setDriverId(drv.id);
      setTruckNumber(drv.assignedTruck);
      setTrailerNumber(drv.assignedTrailer);
      setEquipmentType(drv.equipmentType);

      // Auto compute driver pay suggestion
      if (drv.payType === 'Percentage') {
        const pay = (totalGross * drv.payRateValue) / 100;
        setDriverPay(Math.round(pay));
      } else if (drv.payType === 'Per Mile') {
        const pay = totalMiles * drv.payRateValue;
        setDriverPay(Math.round(pay));
      }
    }
  };

  // When broker selection changes, autofill contact & terms
  const handleBrokerChange = (selectedName: string) => {
    setBrokerName(selectedName);
    const brk = brokers.find(b => b.name === selectedName);
    if (brk) {
      setBrokerPhone(brk.phone);
      setBrokerEmail(brk.email);
      setBrokerMcNumber(brk.mcNumber);
      setPaymentTerms(brk.paymentTerms);
    }
  };

  const handleRecalculateDriverPay = () => {
    const drv = drivers.find(d => d.name === driverName);
    if (drv) {
      if (drv.payType === 'Percentage') {
        setDriverPay(Math.round((totalGross * drv.payRateValue) / 100));
      } else if (drv.payType === 'Per Mile') {
        setDriverPay(Math.round(totalMiles * drv.payRateValue));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loadNumber.trim() || !driverName.trim()) return;

    const payload: LoadItem = {
      id: editingLoad ? editingLoad.id : `LOAD-${Date.now()}`,
      loadNumber,
      orderNumber,
      status,
      pickupDate,
      pickupTime,
      deliveryDate,
      deliveryTime,
      shipperName: shipperName || 'Shipper Facility',
      originCity,
      originState,
      originZip,
      receiverName: receiverName || 'Consignee Receiver',
      destinationCity,
      destinationState,
      destinationZip,
      driverId,
      driverName,
      truckNumber,
      trailerNumber,
      equipmentType,
      commodity,
      weightLbs,
      brokerName,
      brokerPhone,
      brokerEmail,
      brokerMcNumber,
      loadedMiles,
      deadheadMiles,
      totalMiles,
      grossRate,
      accessorials,
      totalGross,
      ratePerMile: parseFloat(ratePerMile.toFixed(2)),
      driverPay,
      fuelCost,
      tollsAndOtherExpenses,
      netProfit: parseFloat(netProfit.toFixed(2)),
      profitMargin: parseFloat(profitMargin.toFixed(2)),
      invoiceNumber,
      paymentTerms,
      paymentStatus,
      notes
    };

    onSave(payload);
    autoSaveService.clearFormDraft('add-edit-load-form');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#141417] rounded-2xl shadow-2xl border border-zinc-800 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-zinc-300">
        {/* Modal Header */}
        <div className="bg-[#0e0e10] text-zinc-100 px-6 py-4 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-600 p-2 rounded-lg text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {editingLoad ? `Edit Load: ${editingLoad.loadNumber}` : 'Add New Freight Load & Schedule'}
              </h2>
              <p className="text-xs text-zinc-400">
                Automatic mileage, rate per mile (RPM), driver split, and profit calculation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AutoSaveIndicator variant="compact" />
            <button 
              onClick={onClose}
              className="text-zinc-400 hover:text-white text-2xl font-light cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Live Calculation Bar */}
        <div className="bg-[#1a1412] border-b border-orange-950/60 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span>Total Miles: <strong className="text-zinc-100 font-bold">{totalMiles.toLocaleString()} mi</strong></span>
            <span>Total Gross: <strong className="text-emerald-400 font-bold">${totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
            <span>Rate / Mile: <strong className="text-orange-400 font-bold">${ratePerMile.toFixed(2)}/mi</strong></span>
          </div>
          <div className="flex items-center gap-4">
            <span>Driver Pay: <strong className="text-zinc-200 font-bold">${driverPay.toFixed(2)}</strong></span>
            <span>Est. Fuel: <strong className="text-amber-400 font-bold">${fuelCost.toFixed(2)}</strong></span>
            <span>Net Profit: <strong className="text-orange-400 font-bold">${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> ({profitMargin.toFixed(1)}%)</span>
          </div>
        </div>

        {/* Form Body */}
        <form 
          id="add-edit-load-form"
          data-form-id="add-edit-load-form"
          onSubmit={handleSubmit} 
          className="p-6 overflow-y-auto space-y-5 text-xs flex-1"
        >
          {/* Section 1: Identifiers & Status */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
              Load Identification &amp; Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Load ID # *</label>
                <input
                  type="text"
                  required
                  value={loadNumber}
                  onChange={e => setLoadNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg font-bold text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Broker PO / Ref #</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={e => setOrderNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Dispatch Status *</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as LoadStatus)}
                  className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg font-semibold text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Equipment Type *</label>
                <select
                  value={equipmentType}
                  onChange={e => setEquipmentType(e.target.value as EquipmentType)}
                  className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
                >
                  {EQUIPMENT_OPTIONS.map(eq => (
                    <option key={eq} value={eq}>{eq}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Origin & Destination */}
          <div className="pt-3 border-t border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              Route, Shipper &amp; Receiver Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pickup / Origin */}
              <div className="bg-[#18181b] p-3.5 rounded-xl border border-zinc-800 space-y-2.5">
                <span className="font-bold text-zinc-200 block text-xs">Origin (Pickup)</span>
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-0.5">Shipper Facility Name</label>
                  <input
                    type="text"
                    value={shipperName}
                    onChange={e => setShipperName(e.target.value)}
                    placeholder="e.g. Apex Cold Storage"
                    className="w-full px-2.5 py-1.5 bg-[#202024] border border-zinc-700 rounded-md text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-zinc-400 text-[11px] mb-0.5">City *</label>
                    <input
                      type="text"
                      required
                      value={originCity}
                      onChange={e => setOriginCity(e.target.value)}
                      placeholder="Atlanta"
                      className="w-full px-2.5 py-1.5 bg-[#202024] border border-zinc-700 rounded-md text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-0.5">State</label>
                    <select
                      value={originState}
                      onChange={e => setOriginState(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#202024] border border-zinc-700 rounded-md text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
                    >
                      {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-0.5">Pickup Date *</label>
                    <input
                      type="date"
                      required
                      value={pickupDate}
                      onChange={e => setPickupDate(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#202024] border border-zinc-700 rounded-md text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-0.5">Appointment Window</label>
                    <input
                      type="text"
                      value={pickupTime}
                      onChange={e => setPickupTime(e.target.value)}
                      placeholder="08:00 - 12:00"
                      className="w-full px-2 py-1.5 bg-[#202024] border border-zinc-700 rounded-md text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery / Destination */}
              <div className="bg-[#18181b] p-3.5 rounded-xl border border-zinc-800 space-y-2.5">
                <span className="font-bold text-zinc-200 block text-xs">Destination (Delivery)</span>
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-0.5">Receiver Facility Name</label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={e => setReceiverName(e.target.value)}
                    placeholder="e.g. Midwest Distribution Hub"
                    className="w-full px-2.5 py-1.5 bg-[#202024] border border-zinc-700 rounded-md text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-zinc-400 text-[11px] mb-0.5">City *</label>
                    <input
                      type="text"
                      required
                      value={destinationCity}
                      onChange={e => setDestinationCity(e.target.value)}
                      placeholder="Chicago"
                      className="w-full px-2.5 py-1.5 bg-[#202024] border border-zinc-700 rounded-md text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-0.5">State</label>
                    <select
                      value={destinationState}
                      onChange={e => setDestinationState(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#202024] border border-zinc-700 rounded-md text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
                    >
                      {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-0.5">Delivery Date *</label>
                    <input
                      type="date"
                      required
                      value={deliveryDate}
                      onChange={e => setDeliveryDate(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#202024] border border-zinc-700 rounded-md text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-0.5">Delivery Window</label>
                    <input
                      type="text"
                      value={deliveryTime}
                      onChange={e => setDeliveryTime(e.target.value)}
                      placeholder="06:00 - 10:00"
                      className="w-full px-2 py-1.5 bg-[#202024] border border-zinc-700 rounded-md text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Driver & Broker Assignment */}
          <div className="pt-3 border-t border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-orange-500" />
              Driver &amp; Freight Broker Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Driver Details */}
              <div className="bg-[#18181b] p-3 rounded-lg border border-zinc-800 space-y-2">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Assign Driver *</label>
                  <select
                    value={driverName}
                    onChange={e => handleDriverChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#202024] border border-zinc-700 rounded-md font-medium text-zinc-100 focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.name}>{d.name} ({d.assignedTruck})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-0.5">Tractor Truck #</label>
                    <input
                      type="text"
                      value={truckNumber}
                      onChange={e => setTruckNumber(e.target.value)}
                      className="w-full px-2 py-1 bg-[#202024] border border-zinc-700 rounded-md text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-0.5">Trailer #</label>
                    <input
                      type="text"
                      value={trailerNumber}
                      onChange={e => setTrailerNumber(e.target.value)}
                      className="w-full px-2 py-1 bg-[#202024] border border-zinc-700 rounded-md text-zinc-100"
                    />
                  </div>
                </div>
              </div>

              {/* Broker Details */}
              <div className="bg-[#18181b] p-3 rounded-lg border border-zinc-800 space-y-2">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Freight Brokerage *</label>
                  <select
                    value={brokerName}
                    onChange={e => handleBrokerChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#202024] border border-zinc-700 rounded-md font-medium text-zinc-100 focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    {brokers.map(b => (
                      <option key={b.id} value={b.name}>{b.name} ({b.mcNumber})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-0.5">Broker Phone</label>
                    <input
                      type="text"
                      value={brokerPhone}
                      onChange={e => setBrokerPhone(e.target.value)}
                      className="w-full px-2 py-1 bg-[#202024] border border-zinc-700 rounded-md text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-0.5">Broker MC #</label>
                    <input
                      type="text"
                      value={brokerMcNumber}
                      onChange={e => setBrokerMcNumber(e.target.value)}
                      className="w-full px-2 py-1 bg-[#202024] border border-zinc-700 rounded-md text-zinc-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Mileage, Cargo & Financials */}
          <div className="pt-3 border-t border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-orange-500" />
                Miles, Cargo &amp; Financial Compensation
              </span>
              <button
                type="button"
                onClick={handleRecalculateDriverPay}
                className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
              >
                <Calculator className="w-3 h-3" /> Auto-Calculate Driver Pay
              </button>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#18181b] p-3.5 rounded-xl border border-zinc-800">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Loaded Miles (mi)</label>
                <input
                  type="number"
                  value={loadedMiles}
                  onChange={e => setLoadedMiles(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-[#202024] border border-zinc-700 rounded-md font-bold text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Deadhead Miles (mi)</label>
                <input
                  type="number"
                  value={deadheadMiles}
                  onChange={e => setDeadheadMiles(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-[#202024] border border-zinc-700 rounded-md text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Base Freight Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={grossRate}
                  onChange={e => setGrossRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-[#202024] border border-zinc-700 rounded-md font-bold text-emerald-400"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Accessorials ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={accessorials}
                  onChange={e => setAccessorials(parseFloat(e.target.value) || 0)}
                  placeholder="Detention/Tarp"
                  className="w-full px-2.5 py-1.5 bg-[#202024] border border-zinc-700 rounded-md text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3 bg-[#18181b] p-3.5 rounded-xl border border-zinc-800">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Driver Pay ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={driverPay}
                  onChange={e => setDriverPay(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-[#202024] border border-zinc-700 rounded-md font-bold text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Est. Diesel Fuel ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fuelCost}
                  onChange={e => setFuelCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-[#202024] border border-zinc-700 rounded-md text-amber-400"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Tolls &amp; Scales ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={tollsAndOtherExpenses}
                  onChange={e => setTollsAndOtherExpenses(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-[#202024] border border-zinc-700 rounded-md text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Cargo & Billing Notes */}
          <div className="pt-3 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Commodity Description &amp; Weight</label>
              <input
                type="text"
                value={commodity}
                onChange={e => setCommodity(e.target.value)}
                placeholder="e.g. Frozen Food (-10°F), Steel Coils, Beverages"
                className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 mb-2"
              />
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Weight:</span>
                <input
                  type="number"
                  value={weightLbs}
                  onChange={e => setWeightLbs(parseInt(e.target.value) || 0)}
                  className="w-32 px-2 py-1 bg-[#1c1c20] border border-zinc-700/80 rounded-md text-zinc-100"
                />
                <span className="text-zinc-400">lbs</span>
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Dispatch Notes &amp; Special Instructions</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Seal #, check calls, PPE required at dock..."
                className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-3">
              {editingLoad && onDelete ? (
                <button
                  type="button"
                  id="btn-modal-delete-load"
                  onClick={() => {
                    onDelete(editingLoad.id);
                    onClose();
                  }}
                  className="px-3.5 py-2 border border-rose-800/80 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Delete this load entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Load</span>
                </button>
              ) : (
                <span className="text-zinc-500">* Required fields</span>
              )}
              <AutoSaveIndicator variant="compact" />
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-zinc-700 rounded-lg text-zinc-300 font-medium hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
              >
                {editingLoad ? 'Save Changes' : 'Schedule Load'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
