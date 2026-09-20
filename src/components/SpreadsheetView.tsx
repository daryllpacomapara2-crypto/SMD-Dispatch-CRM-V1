import React, { useState, useMemo } from 'react';
import { DispatchLoad, FleetDriver, LoadStatus, PaymentStatus } from '../types/dispatch';
import { formatCurrency, formatNumber } from '../utils/calculations';
import {
  Search,
  Filter,
  ArrowUpDown,
  Printer,
  Copy,
  Edit2,
  Trash2,
  Plus,
  Truck,
  Calendar,
  Layers,
  CheckSquare,
  Square,
  Shield,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';

interface SpreadsheetViewProps {
  loads: DispatchLoad[];
  drivers?: FleetDriver[];
  isAdmin: boolean;
  onUpdateLoadStatus: (id: string, newStatus: LoadStatus) => void;
  onUpdatePaymentStatus: (id: string, newPayment: PaymentStatus) => void;
  onQuickUpdateLoad?: (id: string, updates: Partial<DispatchLoad>, actionMsg?: string) => void;
  onEditLoad: (load: DispatchLoad) => void;
  onDuplicateLoad: (load: DispatchLoad) => void;
  onDeleteLoad: (id: string, loadNumber?: string) => void;
  onBulkDeleteLoads?: (ids: string[]) => void;
  onBulkUpdateStatus?: (ids: string[], newStatus: LoadStatus) => void;
  onBulkUpdatePayment?: (ids: string[], newPayment: PaymentStatus) => void;
  onViewRateCon: (load: DispatchLoad) => void;
  onAddNewLoad: () => void;
  statusFilterPreset?: 'all' | 'active' | 'delivered';
  addRecordButtonLabel?: string;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  loads,
  drivers = [],
  isAdmin,
  onUpdateLoadStatus,
  onUpdatePaymentStatus,
  onQuickUpdateLoad,
  onEditLoad,
  onDuplicateLoad,
  onDeleteLoad,
  onBulkDeleteLoads,
  onBulkUpdateStatus,
  onBulkUpdatePayment,
  onViewRateCon,
  onAddNewLoad,
  statusFilterPreset = 'all',
  addRecordButtonLabel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(statusFilterPreset);
  const [driverFilter, setDriverFilter] = useState<string>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof DispatchLoad>('pickupDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedLoadIds, setSelectedLoadIds] = useState<string[]>([]);

  // Quick inline cell editing state
  const [inlineEdit, setInlineEdit] = useState<{
    loadId: string;
    field: 'rateGross' | 'loadedMiles';
    value: string;
  } | null>(null);

  // Sync with preset if passed
  React.useEffect(() => {
    if (statusFilterPreset !== 'all') {
      setStatusFilter(statusFilterPreset);
    }
  }, [statusFilterPreset]);

  // Unique list of drivers & equipment for filter dropdowns
  const uniqueDrivers = useMemo(() => {
    const set = new Set(loads.map((l) => l.driverName));
    return Array.from(set).filter(Boolean);
  }, [loads]);

  const uniqueEquipment = useMemo(() => {
    const set = new Set(loads.map((l) => l.equipmentType));
    return Array.from(set).filter(Boolean);
  }, [loads]);

  // Filtering
  const filteredLoads = useMemo(() => {
    return loads.filter((l) => {
      // Preset / Status
      if (statusFilter === 'active') {
        const activeList = ['booked', 'dispatched', 'at_pickup', 'in_transit', 'at_delivery'];
        if (!activeList.includes(l.status)) return false;
      } else if (statusFilter === 'delivered') {
        const deliveredList = ['delivered', 'invoiced', 'paid'];
        if (!deliveredList.includes(l.status)) return false;
      } else if (statusFilter !== 'all' && l.status !== statusFilter) {
        return false;
      }

      // Driver
      if (driverFilter !== 'all' && l.driverName !== driverFilter) return false;

      // Equipment
      if (equipmentFilter !== 'all' && l.equipmentType !== equipmentFilter) return false;

      // Search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const match =
          l.loadNumber.toLowerCase().includes(q) ||
          l.driverName.toLowerCase().includes(q) ||
          l.originCity.toLowerCase().includes(q) ||
          l.originState.toLowerCase().includes(q) ||
          l.destCity.toLowerCase().includes(q) ||
          l.destState.toLowerCase().includes(q) ||
          l.brokerName.toLowerCase().includes(q) ||
          l.truckNumber.toLowerCase().includes(q) ||
          l.commodity.toLowerCase().includes(q) ||
          (l.bolNumber && l.bolNumber.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [loads, statusFilter, driverFilter, equipmentFilter, searchQuery]);

  // Sorting
  const sortedLoads = useMemo(() => {
    return [...filteredLoads].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') aVal = (aVal as string).toLowerCase();
      if (typeof bVal === 'string') bVal = (bVal as string).toLowerCase();

      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;

      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredLoads, sortField, sortAsc]);

  // Handle Sort Toggle
  const handleSort = (field: keyof DispatchLoad) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Selection helpers
  const handleSelectAll = () => {
    if (selectedLoadIds.length === sortedLoads.length) {
      setSelectedLoadIds([]);
    } else {
      setSelectedLoadIds(sortedLoads.map((l) => l.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedLoadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Aggregates for current filtered view
  const filteredAggregates = useMemo(() => {
    const gross = sortedLoads.reduce((sum, l) => sum + (Number(l.rateGross) || 0), 0);
    const fees = sortedLoads.reduce((sum, l) => sum + (Number(l.dispatchFeeAmount) || 0), 0);
    const net = sortedLoads.reduce((sum, l) => sum + (Number(l.driverNetPay) || 0), 0);
    const miles = sortedLoads.reduce((sum, l) => sum + (Number(l.loadedMiles) || 0), 0);
    const avgRpm = miles > 0 ? gross / miles : 0;
    return { gross, fees, net, miles, avgRpm };
  }, [sortedLoads]);

  // Inline cell edit commit
  const handleCommitInlineEdit = (load: DispatchLoad) => {
    if (!inlineEdit || inlineEdit.loadId !== load.id) return;
    const { field, value } = inlineEdit;
    const numVal = parseFloat(value) || 0;

    if (field === 'rateGross') {
      const gross = numVal;
      const rpm = load.loadedMiles > 0 ? gross / load.loadedMiles : 0;
      const feePercent = load.dispatchFeePercent || 10;
      const feeAmt = (gross * feePercent) / 100;
      const netPay = gross - feeAmt;

      onQuickUpdateLoad?.(
        load.id,
        {
          rateGross: gross,
          ratePerMile: Number(rpm.toFixed(2)),
          dispatchFeeAmount: Number(feeAmt.toFixed(2)),
          driverNetPay: Number(netPay.toFixed(2)),
        },
        `Auto-saved Gross Rate $${gross} for load ${load.loadNumber}`
      );
    } else if (field === 'loadedMiles') {
      const miles = numVal;
      const rpm = miles > 0 ? load.rateGross / miles : 0;
      onQuickUpdateLoad?.(
        load.id,
        {
          loadedMiles: miles,
          ratePerMile: Number(rpm.toFixed(2)),
        },
        `Auto-saved Loaded Miles ${miles} for load ${load.loadNumber}`
      );
    }

    setInlineEdit(null);
  };

  const handleDriverChange = (load: DispatchLoad, newDriverId: string) => {
    const selectedDriver = drivers.find((d) => d.id === newDriverId);
    if (selectedDriver) {
      const feePct = selectedDriver.defaultFeePercent || load.dispatchFeePercent || 10;
      const feeAmt = (load.rateGross * feePct) / 100;
      const netPay = load.rateGross - feeAmt;

      onQuickUpdateLoad?.(
        load.id,
        {
          driverId: selectedDriver.id,
          driverName: selectedDriver.name,
          driverPhone: selectedDriver.phone,
          truckNumber: selectedDriver.truckNumber,
          trailerNumber: selectedDriver.trailerNumber,
          equipmentType: selectedDriver.equipmentType,
          dispatchFeePercent: feePct,
          dispatchFeeAmount: Number(feeAmt.toFixed(2)),
          driverNetPay: Number(netPay.toFixed(2)),
        },
        `Auto-synced driver ${selectedDriver.name} to load ${load.loadNumber}`
      );
    }
  };

  const getStatusBadge = (status: LoadStatus) => {
    switch (status) {
      case 'booked':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'dispatched':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'at_pickup':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'in_transit':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold';
      case 'at_delivery':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'delivered':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'invoiced':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'paid':
        return 'bg-green-600/20 text-green-300 border-green-500/40';
      case 'cancelled':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-stone-800 text-stone-300 border-stone-700';
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'quickpay':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'factored':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'unpaid':
      default:
        return 'text-stone-400 bg-stone-800/60 border-stone-700';
    }
  };

  // Button label fallback
  const defaultAddLabel =
    statusFilterPreset === 'active'
      ? '+ Dispatch New Load'
      : statusFilterPreset === 'delivered'
      ? '+ Add Delivered / Invoiced Record'
      : '+ Add Load to Schedule';

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Top Header Toolbar with Add Button */}
      <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search load #, driver, lane, broker, truck..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 px-2.5 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-stone-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-stone-900">All Statuses</option>
              <option value="active" className="bg-stone-900">Active (In Transit / Booked)</option>
              <option value="delivered" className="bg-stone-900">Delivered & Closed</option>
              <option value="booked" className="bg-stone-900">Booked</option>
              <option value="dispatched" className="bg-stone-900">Dispatched</option>
              <option value="at_pickup" className="bg-stone-900">At Pickup</option>
              <option value="in_transit" className="bg-stone-900">In Transit</option>
              <option value="at_delivery" className="bg-stone-900">At Delivery</option>
              <option value="delivered" className="bg-stone-900">Delivered</option>
              <option value="invoiced" className="bg-stone-900">Invoiced</option>
              <option value="paid" className="bg-stone-900">Paid</option>
              <option value="cancelled" className="bg-stone-900">Cancelled</option>
            </select>
          </div>

          {/* Driver Filter */}
          <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 px-2.5 py-1.5 rounded-lg text-xs">
            <Truck className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              className="bg-transparent text-stone-200 text-xs focus:outline-none cursor-pointer max-w-[130px] truncate"
            >
              <option value="all" className="bg-stone-900">All Drivers</option>
              {uniqueDrivers.map((d) => (
                <option key={d} value={d} className="bg-stone-900">
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment Filter */}
          <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 px-2.5 py-1.5 rounded-lg text-xs">
            <Layers className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={equipmentFilter}
              onChange={(e) => setEquipmentFilter(e.target.value)}
              className="bg-transparent text-stone-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-stone-900">All Equipment</option>
              {uniqueEquipment.map((eq) => (
                <option key={eq} value={eq} className="bg-stone-900">
                  {eq}
                </option>
              ))}
            </select>
          </div>

          {/* Records Counter */}
          <div className="text-xs text-stone-400 px-1">
            <span className="font-semibold text-amber-400 font-mono">{sortedLoads.length}</span> records
          </div>

          {/* Admin Add Load Button */}
          {isAdmin && (
            <button
              onClick={onAddNewLoad}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>{addRecordButtonLabel || defaultAddLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Multi-Select Action Bar (appears when rows are selected) */}
      {isAdmin && selectedLoadIds.length > 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-300 font-semibold">
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <span>{selectedLoadIds.length} loads selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bulk Status Update */}
            {onBulkUpdateStatus && (
              <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-700 px-2.5 py-1 rounded-lg">
                <span className="text-stone-400 text-[11px]">Set Status:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      onBulkUpdateStatus(selectedLoadIds, e.target.value as LoadStatus);
                    }
                  }}
                  defaultValue=""
                  className="bg-transparent text-stone-200 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>Choose...</option>
                  <option value="booked" className="bg-stone-900">Booked</option>
                  <option value="dispatched" className="bg-stone-900">Dispatched</option>
                  <option value="at_pickup" className="bg-stone-900">At Pickup</option>
                  <option value="in_transit" className="bg-stone-900">In Transit</option>
                  <option value="at_delivery" className="bg-stone-900">At Delivery</option>
                  <option value="delivered" className="bg-stone-900">Delivered</option>
                  <option value="invoiced" className="bg-stone-900">Invoiced</option>
                  <option value="paid" className="bg-stone-900">Paid</option>
                </select>
              </div>
            )}

            {/* Bulk Payment Update */}
            {onBulkUpdatePayment && (
              <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-700 px-2.5 py-1 rounded-lg">
                <span className="text-stone-400 text-[11px]">Set Payment:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      onBulkUpdatePayment(selectedLoadIds, e.target.value as PaymentStatus);
                    }
                  }}
                  defaultValue=""
                  className="bg-transparent text-stone-200 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>Choose...</option>
                  <option value="unpaid" className="bg-stone-900">Unpaid</option>
                  <option value="factored" className="bg-stone-900">Factored</option>
                  <option value="quickpay" className="bg-stone-900">QuickPay</option>
                  <option value="paid" className="bg-stone-900">Paid</option>
                </select>
              </div>
            )}

            {/* Bulk Delete */}
            {onBulkDeleteLoads && (
              <button
                onClick={() => onBulkDeleteLoads(selectedLoadIds)}
                className="px-3 py-1 bg-rose-600/90 hover:bg-rose-500 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedLoadIds.length})</span>
              </button>
            )}

            {/* Deselect */}
            <button
              onClick={() => setSelectedLoadIds([])}
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Table Grid */}
      <div className="overflow-x-auto max-h-[640px] relative scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-stone-900">
        <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
          {/* Table Header (Excel style) */}
          <thead className="sticky top-0 z-20 bg-stone-950/95 backdrop-blur-sm border-b border-stone-800 text-stone-300 select-none shadow-sm">
            <tr>
              {/* Checkbox / Row # */}
              <th className="py-2.5 px-3 font-semibold text-stone-400 w-10 text-center border-r border-stone-800/80">
                {isAdmin ? (
                  <button
                    onClick={handleSelectAll}
                    title="Select / Deselect all visible loads"
                    className="text-stone-400 hover:text-amber-400"
                  >
                    {selectedLoadIds.length === sortedLoads.length && sortedLoads.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                ) : (
                  '#'
                )}
              </th>

              <th
                onClick={() => handleSort('loadNumber')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-amber-400 transition-colors border-r border-stone-800/80"
              >
                <div className="flex items-center gap-1">
                  <span>Load #</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('status')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-amber-400 transition-colors border-r border-stone-800/80"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('driverName')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-amber-400 transition-colors border-r border-stone-800/80"
              >
                <div className="flex items-center gap-1">
                  <span>Driver & Unit</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('equipmentType')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-amber-400 transition-colors border-r border-stone-800/80"
              >
                <div className="flex items-center gap-1">
                  <span>Equipment</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('originCity')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-amber-400 transition-colors border-r border-stone-800/80"
              >
                <div className="flex items-center gap-1">
                  <span>Pickup (Origin)</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('destCity')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-amber-400 transition-colors border-r border-stone-800/80"
              >
                <div className="flex items-center gap-1">
                  <span>Delivery (Dest)</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('brokerName')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-amber-400 transition-colors border-r border-stone-800/80"
              >
                <div className="flex items-center gap-1">
                  <span>Broker / Customer</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('loadedMiles')}
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-amber-400 transition-colors border-r border-stone-800/80"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Loaded Mi</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('deadheadMiles')}
                className="py-2.5 px-2.5 font-semibold text-right cursor-pointer hover:text-amber-400 transition-colors border-r border-stone-800/80"
              >
                <span>DH Mi</span>
              </th>

              <th
                onClick={() => handleSort('rateGross')}
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-amber-400 transition-colors border-r border-stone-800/80"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Gross Rate</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('ratePerMile')}
                className="py-2.5 px-2.5 font-semibold text-right cursor-pointer hover:text-amber-400 transition-colors border-r border-stone-800/80"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>RPM</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('dispatchFeeAmount')}
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-amber-400 transition-colors border-r border-stone-800/80"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Fee ($)</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('driverNetPay')}
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-amber-400 transition-colors border-r border-stone-800/80"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Carrier Net</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('paymentStatus')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-amber-400 transition-colors border-r border-stone-800/80"
              >
                <div className="flex items-center gap-1">
                  <span>Payment</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-500" />
                </div>
              </th>

              <th className="py-2.5 px-3 font-semibold text-center w-28">
                {isAdmin ? 'Admin Actions' : 'Actions'}
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-stone-800/60 bg-stone-900/50">
            {sortedLoads.length === 0 ? (
              <tr>
                <td colSpan={16} className="py-12 text-center text-stone-400">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-stone-300">No dispatch loads found matching filters.</p>
                    {isAdmin && (
                      <button
                        onClick={onAddNewLoad}
                        className="px-4 py-2 bg-amber-500 text-stone-950 font-bold rounded-lg text-xs inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{addRecordButtonLabel || defaultAddLabel}</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              sortedLoads.map((load, index) => {
                const isSelected = selectedLoadIds.includes(load.id);

                return (
                  <tr
                    key={load.id}
                    className={`hover:bg-stone-800/40 transition-colors border-b border-stone-850/60 ${
                      isSelected ? 'bg-amber-500/10' : ''
                    }`}
                  >
                    {/* Checkbox / Row Index */}
                    <td className="py-2.5 px-3 text-center text-stone-400 border-r border-stone-800/60 font-mono">
                      {isAdmin ? (
                        <button
                          onClick={() => handleToggleSelect(load.id)}
                          className="text-stone-400 hover:text-amber-400"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      ) : (
                        index + 1
                      )}
                    </td>

                    {/* Load Number */}
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-400 border-r border-stone-800/60">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="hover:underline cursor-pointer"
                          onClick={() => onEditLoad(load)}
                          title="Click to Edit Load"
                        >
                          {load.loadNumber}
                        </span>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-2 px-3 border-r border-stone-800/60">
                      {isAdmin ? (
                        <select
                          value={load.status}
                          onChange={(e) => onUpdateLoadStatus(load.id, e.target.value as LoadStatus)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border focus:outline-none cursor-pointer uppercase tracking-wider ${getStatusBadge(
                            load.status
                          )}`}
                        >
                          <option value="booked" className="bg-stone-900 text-sky-400">Booked</option>
                          <option value="dispatched" className="bg-stone-900 text-indigo-400">Dispatched</option>
                          <option value="at_pickup" className="bg-stone-900 text-purple-400">At Pickup</option>
                          <option value="in_transit" className="bg-stone-900 text-amber-400">In Transit</option>
                          <option value="at_delivery" className="bg-stone-900 text-orange-400">At Delivery</option>
                          <option value="delivered" className="bg-stone-900 text-emerald-400">Delivered</option>
                          <option value="invoiced" className="bg-stone-900 text-cyan-400">Invoiced</option>
                          <option value="paid" className="bg-stone-900 text-green-400">Paid</option>
                          <option value="cancelled" className="bg-stone-900 text-rose-400">Cancelled</option>
                        </select>
                      ) : (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(
                            load.status
                          )}`}
                        >
                          {load.status.replace('_', ' ')}
                        </span>
                      )}
                    </td>

                    {/* Driver & Power Unit */}
                    <td className="py-2.5 px-3 border-r border-stone-800/60">
                      {isAdmin && drivers && drivers.length > 0 ? (
                        <div className="space-y-1">
                          <select
                            value={load.driverId || ''}
                            onChange={(e) => handleDriverChange(load, e.target.value)}
                            className="text-xs font-semibold bg-stone-900 border border-stone-750 text-stone-100 rounded px-1.5 py-0.5 w-full focus:border-amber-400 focus:outline-none cursor-pointer max-w-[150px] truncate"
                            title="Assign Driver from Fleet Roster (Auto-Syncs)"
                          >
                            {!drivers.some((d) => d.id === load.driverId) && (
                              <option value="">{load.driverName || 'Assign Driver'}</option>
                            )}
                            {drivers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.truckNumber})
                              </option>
                            ))}
                          </select>
                          <div className="text-[10px] text-stone-400 font-mono">
                            {load.truckNumber} • {load.trailerNumber}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="font-semibold text-stone-100 flex items-center gap-1.5">
                            <span>{load.driverName}</span>
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            {load.truckNumber} • {load.trailerNumber}
                          </div>
                        </>
                      )}
                    </td>

                    {/* Equipment */}
                    <td className="py-2.5 px-3 text-stone-300 border-r border-stone-800/60">
                      <span className="px-1.5 py-0.5 rounded bg-stone-800/80 text-[11px] font-medium text-stone-300">
                        {load.equipmentType}
                      </span>
                    </td>

                    {/* Origin */}
                    <td className="py-2.5 px-3 border-r border-stone-800/60">
                      <div className="font-semibold text-stone-200">
                        {load.originCity}, {load.originState}
                      </div>
                      <div className="text-[10px] text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-500" />
                        <span>{load.pickupDate}</span>
                        <span className="text-stone-500">{load.pickupTime}</span>
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="py-2.5 px-3 border-r border-stone-800/60">
                      <div className="font-semibold text-stone-200">
                        {load.destCity}, {load.destState}
                      </div>
                      <div className="text-[10px] text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-500" />
                        <span>{load.deliveryDate}</span>
                        <span className="text-stone-500">{load.deliveryTime}</span>
                      </div>
                    </td>

                    {/* Broker & Commodity */}
                    <td className="py-2.5 px-3 border-r border-stone-800/60 max-w-[180px]">
                      <div className="font-medium text-stone-200 truncate" title={load.brokerName}>
                        {load.brokerName}
                      </div>
                      <div className="text-[10px] text-stone-400 truncate" title={load.commodity}>
                        {load.commodity} ({formatNumber(load.weightLbs)} lbs)
                      </div>
                    </td>

                    {/* Loaded Miles */}
                    <td className="py-2.5 px-3 text-right font-mono text-stone-300 border-r border-stone-800/60">
                      {isAdmin && inlineEdit?.loadId === load.id && inlineEdit.field === 'loadedMiles' ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            autoFocus
                            value={inlineEdit.value}
                            onChange={(e) => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCommitInlineEdit(load);
                              if (e.key === 'Escape') setInlineEdit(null);
                            }}
                            onBlur={() => handleCommitInlineEdit(load)}
                            className="w-20 px-1 py-0.5 bg-stone-950 border border-amber-500 text-stone-100 text-right rounded font-mono text-xs focus:outline-none"
                          />
                        </div>
                      ) : (
                        <span
                          className={isAdmin ? 'cursor-pointer hover:text-amber-400 hover:underline' : ''}
                          onClick={() => {
                            if (isAdmin) setInlineEdit({ loadId: load.id, field: 'loadedMiles', value: String(load.loadedMiles) });
                          }}
                          title={isAdmin ? 'Click to edit loaded miles (Auto-saves on Enter)' : undefined}
                        >
                          {formatNumber(load.loadedMiles)}
                        </span>
                      )}
                    </td>

                    {/* Deadhead Miles */}
                    <td className="py-2.5 px-2.5 text-right font-mono text-stone-400 border-r border-stone-800/60">
                      {load.deadheadMiles > 0 ? formatNumber(load.deadheadMiles) : '-'}
                    </td>

                    {/* Gross Rate */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 border-r border-stone-800/60">
                      {isAdmin && inlineEdit?.loadId === load.id && inlineEdit.field === 'rateGross' ? (
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-stone-500">$</span>
                          <input
                            type="number"
                            autoFocus
                            value={inlineEdit.value}
                            onChange={(e) => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCommitInlineEdit(load);
                              if (e.key === 'Escape') setInlineEdit(null);
                            }}
                            onBlur={() => handleCommitInlineEdit(load)}
                            className="w-24 px-1 py-0.5 bg-stone-950 border border-emerald-500 text-emerald-400 text-right rounded font-mono text-xs focus:outline-none"
                          />
                        </div>
                      ) : (
                        <span
                          className={isAdmin ? 'cursor-pointer hover:text-amber-300 hover:underline' : ''}
                          onClick={() => {
                            if (isAdmin) setInlineEdit({ loadId: load.id, field: 'rateGross', value: String(load.rateGross) });
                          }}
                          title={isAdmin ? 'Click to edit gross rate (Auto-saves on Enter)' : undefined}
                        >
                          {formatCurrency(load.rateGross)}
                        </span>
                      )}
                    </td>

                    {/* Rate Per Mile (RPM) */}
                    <td className="py-2.5 px-2.5 text-right font-mono text-violet-300 border-r border-stone-800/60">
                      ${load.ratePerMile.toFixed(2)}
                    </td>

                    {/* Dispatch Fee */}
                    <td className="py-2.5 px-3 text-right font-mono text-amber-400 border-r border-stone-800/60">
                      <div>{formatCurrency(load.dispatchFeeAmount)}</div>
                      <div className="text-[9px] text-stone-500">{load.dispatchFeePercent}%</div>
                    </td>

                    {/* Driver Net Pay */}
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-blue-400 border-r border-stone-800/60">
                      {formatCurrency(load.driverNetPay)}
                    </td>

                    {/* Payment Status Dropdown */}
                    <td className="py-2 px-3 border-r border-stone-800/60">
                      {isAdmin ? (
                        <select
                          value={load.paymentStatus}
                          onChange={(e) => onUpdatePaymentStatus(load.id, e.target.value as PaymentStatus)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border focus:outline-none cursor-pointer uppercase ${getPaymentBadge(
                            load.paymentStatus
                          )}`}
                        >
                          <option value="unpaid" className="bg-stone-900 text-stone-400">Unpaid</option>
                          <option value="factored" className="bg-stone-900 text-blue-400">Factored</option>
                          <option value="quickpay" className="bg-stone-900 text-amber-400">QuickPay</option>
                          <option value="paid" className="bg-stone-900 text-emerald-400">Paid</option>
                        </select>
                      ) : (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${getPaymentBadge(
                            load.paymentStatus
                          )}`}
                        >
                          {load.paymentStatus}
                        </span>
                      )}
                    </td>

                    {/* Row Actions */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Dispatch Sheet / Print */}
                        <button
                          onClick={() => onViewRateCon(load)}
                          title="Print / View Dispatch Sheet"
                          className="p-1.5 text-stone-400 hover:text-amber-400 hover:bg-stone-800 rounded transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Load */}
                        {isAdmin && (
                          <button
                            onClick={() => onEditLoad(load)}
                            title="Edit Load"
                            className="p-1.5 text-stone-400 hover:text-blue-400 hover:bg-stone-800 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Duplicate */}
                        {isAdmin && (
                          <button
                            onClick={() => onDuplicateLoad(load)}
                            title="Duplicate Load"
                            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Load */}
                        {isAdmin && (
                          <button
                            onClick={() => onDeleteLoad(load.id, load.loadNumber)}
                            title="Delete Load"
                            className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Spreadsheet Bottom Status / Formula Aggregates Bar */}
      <div className="p-3 bg-stone-950 border-t border-stone-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-stone-300">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">COUNT:</span>
            <span className="font-bold text-stone-200">{sortedLoads.length}</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-stone-800 pl-3">
            <span className="text-stone-500">TOTAL MILES:</span>
            <span className="font-bold text-stone-200">{formatNumber(filteredAggregates.miles)} mi</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-stone-800 pl-3">
            <span className="text-stone-500">AVG RPM:</span>
            <span className="font-bold text-violet-400">${filteredAggregates.avgRpm.toFixed(2)}/mi</span>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Auto-Sync: Changes Saved Instantly</span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">GROSS REVENUE:</span>
            <span className="font-bold text-emerald-400">{formatCurrency(filteredAggregates.gross)}</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-stone-800 pl-3">
            <span className="text-stone-500">DISPATCH FEES:</span>
            <span className="font-bold text-amber-400">{formatCurrency(filteredAggregates.fees)}</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-stone-800 pl-3">
            <span className="text-stone-500">DRIVER NET:</span>
            <span className="font-bold text-blue-400">{formatCurrency(filteredAggregates.net)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
