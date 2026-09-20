import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Copy, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Truck,
  DollarSign,
  MapPin,
  Sparkles,
  RefreshCw,
  Plus,
  CheckSquare,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { LoadItem, LoadStatus, STATUS_OPTIONS, EQUIPMENT_OPTIONS, PaymentStatus } from '../types';
import { useAdmin } from '../context/AdminContext';

interface LoadSchedulerTableProps {
  loads: LoadItem[];
  onEditLoad: (load: LoadItem) => void;
  onDuplicateLoad: (load: LoadItem) => void;
  onDeleteLoad: (loadId: string) => void;
  onBulkDeleteLoads?: (loadIds: string[]) => void;
  onClearAllLoads?: () => void;
  onUpdateStatus: (loadId: string, newStatus: LoadStatus) => void;
  onPrintLoad: (load: LoadItem) => void;
  onOpenAddModal: () => void;
  driversList: string[];
  brokersList: string[];
  subSheetView?: 'master' | 'active' | 'delivered';
  onSelectSubSheet?: (sheet: 'master' | 'active' | 'delivered') => void;
  onQuickUpdateLoad?: (loadId: string, updates: Partial<LoadItem>) => void;
  onNavigateToFleet?: () => void;
}

export const LoadSchedulerTable: React.FC<LoadSchedulerTableProps> = ({
  loads,
  onEditLoad,
  onDuplicateLoad,
  onDeleteLoad,
  onBulkDeleteLoads,
  onClearAllLoads,
  onUpdateStatus,
  onPrintLoad,
  onOpenAddModal,
  driversList,
  brokersList,
  subSheetView = 'master',
  onSelectSubSheet,
  onQuickUpdateLoad,
  onNavigateToFleet
}) => {
  const { adminUser, canEdit, setIsLoginModalOpen, setIsControlModalOpen, checkPermissionOrPrompt } = useAdmin();

  const handleProtectedAdd = () => {
    checkPermissionOrPrompt(onOpenAddModal, 'Admin authorization is required to add loads.');
  };

  const handleProtectedEdit = (load: LoadItem) => {
    checkPermissionOrPrompt(() => onEditLoad(load), 'Admin authorization is required to edit loads.');
  };

  const handleProtectedDuplicate = (load: LoadItem) => {
    checkPermissionOrPrompt(() => onDuplicateLoad(load), 'Admin authorization is required to duplicate loads.');
  };

  const handleProtectedDelete = (loadId: string) => {
    checkPermissionOrPrompt(() => onDeleteLoad(loadId), 'Admin authorization is required to delete loads.');
  };

  const handleProtectedBulkDelete = (ids: string[]) => {
    checkPermissionOrPrompt(() => {
      if (onBulkDeleteLoads) {
        onBulkDeleteLoads(ids);
        setSelectedIds([]);
      }
    }, 'Admin authorization is required to delete loads.');
  };

  const handleProtectedClearAll = () => {
    checkPermissionOrPrompt(() => {
      if (onClearAllLoads) onClearAllLoads();
    }, 'Admin authorization is required to clear all loads.');
  };

  const handleProtectedStatusUpdate = (loadId: string, newStatus: LoadStatus) => {
    checkPermissionOrPrompt(() => {
      onUpdateStatus(loadId, newStatus);
    }, 'Admin authorization is required to update load status.');
  };

  const handleProtectedQuickUpdate = (loadId: string, updates: Partial<LoadItem>) => {
    checkPermissionOrPrompt(() => {
      if (onQuickUpdateLoad) onQuickUpdateLoad(loadId, updates);
    }, 'Admin authorization is required to update load details.');
  };

  // Sub-sheet summary counts
  const allLoadsCount = loads.length;
  const activeLoadsCount = loads.filter(l => 
    ['Booked', 'Dispatched', 'Arrived Pickup', 'Loaded', 'In Transit', 'Arrived Delivery'].includes(l.status)
  ).length;
  const deliveredLoadsCount = loads.filter(l => 
    ['Delivered', 'Invoiced', 'Paid'].includes(l.status)
  ).length;

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [driverFilter, setDriverFilter] = useState('ALL');
  const [brokerFilter, setBrokerFilter] = useState('ALL');
  const [equipmentFilter, setEquipmentFilter] = useState('ALL');

  // Sorting
  const [sortField, setSortField] = useState<keyof LoadItem>('pickupDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof LoadItem) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredLoads = useMemo(() => {
    return loads.filter(item => {
      // Sub-sheet view constraint
      if (subSheetView === 'active') {
        const isActive = ['Booked', 'Dispatched', 'Arrived Pickup', 'Loaded', 'In Transit', 'Arrived Delivery'].includes(item.status);
        if (!isActive) return false;
      } else if (subSheetView === 'delivered') {
        const isDelivered = ['Delivered', 'Invoiced', 'Paid'].includes(item.status);
        if (!isDelivered) return false;
      }

      // Search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesSearch = 
          item.loadNumber.toLowerCase().includes(q) ||
          item.orderNumber.toLowerCase().includes(q) ||
          item.shipperName.toLowerCase().includes(q) ||
          item.receiverName.toLowerCase().includes(q) ||
          item.originCity.toLowerCase().includes(q) ||
          item.originState.toLowerCase().includes(q) ||
          item.destinationCity.toLowerCase().includes(q) ||
          item.destinationState.toLowerCase().includes(q) ||
          item.driverName.toLowerCase().includes(q) ||
          item.brokerName.toLowerCase().includes(q) ||
          item.commodity.toLowerCase().includes(q) ||
          (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(q));

        if (!matchesSearch) return false;
      }

      // Dropdown filters
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (driverFilter !== 'ALL' && item.driverName !== driverFilter) return false;
      if (brokerFilter !== 'ALL' && item.brokerName !== brokerFilter) return false;
      if (equipmentFilter !== 'ALL' && item.equipmentType !== equipmentFilter) return false;

      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      return 0;
    });
  }, [loads, searchQuery, statusFilter, driverFilter, brokerFilter, equipmentFilter, sortField, sortDirection]);

  // Aggregate Totals
  const totals = useMemo(() => {
    const totalMiles = filteredLoads.reduce((sum, l) => sum + l.totalMiles, 0);
    const totalLoadedMiles = filteredLoads.reduce((sum, l) => sum + l.loadedMiles, 0);
    const totalGross = filteredLoads.reduce((sum, l) => sum + l.totalGross, 0);
    const totalDriverPay = filteredLoads.reduce((sum, l) => sum + l.driverPay, 0);
    const totalFuel = filteredLoads.reduce((sum, l) => sum + l.fuelCost, 0);
    const totalTolls = filteredLoads.reduce((sum, l) => sum + l.tollsAndOtherExpenses, 0);
    const totalNetProfit = filteredLoads.reduce((sum, l) => sum + l.netProfit, 0);
    const avgRPM = totalMiles > 0 ? totalGross / totalMiles : 0;
    const avgMargin = totalGross > 0 ? (totalNetProfit / totalGross) * 100 : 0;

    return {
      count: filteredLoads.length,
      totalMiles,
      totalLoadedMiles,
      totalGross,
      totalDriverPay,
      totalFuel,
      totalTolls,
      totalNetProfit,
      avgRPM,
      avgMargin
    };
  }, [filteredLoads]);

  const isAllSelected = filteredLoads.length > 0 && selectedIds.length === filteredLoads.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLoads.map(l => l.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const getStatusBadge = (status: LoadStatus) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      case 'Delivered':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
      case 'Invoiced':
        return 'bg-teal-950/80 text-teal-300 border-teal-800/80';
      case 'In Transit':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      case 'Loaded':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800/80';
      case 'Arrived Pickup':
      case 'Arrived Delivery':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/80';
      case 'Dispatched':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'Booked':
        return 'bg-sky-950/80 text-sky-300 border-sky-800/80';
      case 'Cancelled':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
      default:
        return 'bg-zinc-900 text-zinc-300 border-zinc-700';
    }
  };

  const getSortIcon = (field: keyof LoadItem) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 opacity-60 inline-block ml-1" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-orange-400 inline-block ml-1" />
      : <ArrowDown className="w-3.5 h-3.5 text-orange-400 inline-block ml-1" />;
  };

  return (
    <div className="space-y-4">
      {/* Interactive Sub-Sheet Navigator & Live Auto-Sync Status */}
      <div className="bg-[#121214] rounded-xl shadow-md border border-zinc-800/80 p-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-subsheet-master"
              type="button"
              onClick={() => onSelectSubSheet ? onSelectSubSheet('master') : null}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                subSheetView === 'master' || !subSheetView
                  ? 'bg-orange-500 text-white border-orange-400 shadow-sm ring-1 ring-orange-400/40'
                  : 'bg-[#18181b] text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-inherit" />
              <span>Master Schedule Sheet</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                subSheetView === 'master' || !subSheetView ? 'bg-orange-950/80 text-orange-200' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {allLoadsCount}
              </span>
            </button>

            <button
              id="btn-subsheet-active"
              type="button"
              onClick={() => onSelectSubSheet ? onSelectSubSheet('active') : null}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                subSheetView === 'active'
                  ? 'bg-orange-500 text-white border-orange-400 shadow-sm ring-1 ring-orange-400/40'
                  : 'bg-[#18181b] text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4 text-inherit" />
              <span>Active Dispatches &amp; In-Transit</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                subSheetView === 'active' ? 'bg-orange-950/80 text-orange-200' : 'bg-blue-950/80 text-blue-300 border border-blue-800/40'
              }`}>
                {activeLoadsCount}
              </span>
            </button>

            <button
              id="btn-subsheet-delivered"
              type="button"
              onClick={() => onSelectSubSheet ? onSelectSubSheet('delivered') : null}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                subSheetView === 'delivered'
                  ? 'bg-orange-500 text-white border-orange-400 shadow-sm ring-1 ring-orange-400/40'
                  : 'bg-[#18181b] text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4 text-inherit" />
              <span>Delivered Loads, Invoicing &amp; Settlement</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                subSheetView === 'delivered' ? 'bg-orange-950/80 text-orange-200' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
              }`}>
                {deliveredLoadsCount}
              </span>
            </button>

            {onNavigateToFleet && (
              <button
                id="btn-subsheet-fleet"
                type="button"
                onClick={onNavigateToFleet}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-[#18181b] text-zinc-300 border border-zinc-700 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-zinc-400" />
                <span>Fleet &amp; Driver Roster</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400 font-semibold">
                  {driversList.length}
                </span>
              </button>
            )}
          </div>

          {/* Real-Time Auto-Sync Live Status & Admin Status */}
          <div className="flex items-center gap-2 justify-end shrink-0">
            {canEdit ? (
              <button
                type="button"
                id="btn-table-admin-badge"
                onClick={() => setIsControlModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-orange-950/40 hover:bg-orange-900/60 text-orange-300 border border-orange-500/30 shadow-xs cursor-pointer transition-colors"
                title="Admin CRUD Unlocked. Click to view Audit Trail & Backups"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                <span>Admin CRUD</span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-table-admin-lock"
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 shadow-xs cursor-pointer transition-colors"
                title="Click to authenticate as Admin for full CRUD control"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Unlock Admin</span>
              </button>
            )}

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Auto-Sync Active</span>
              <span className="text-[10px] text-zinc-400 border-l border-emerald-500/30 pl-1.5 hidden sm:inline">
                Instant Save
              </span>
            </span>
          </div>
        </div>

        {/* View Description Subtitle */}
        <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
          <span>
            {subSheetView === 'active' ? (
              <strong className="text-orange-400">Active Freight Board:</strong>
            ) : subSheetView === 'delivered' ? (
              <strong className="text-emerald-400">Financial Clearance Board:</strong>
            ) : (
              <strong className="text-zinc-200">Full Dispatch Master:</strong>
            )}
            {' '}
            {subSheetView === 'active' 
              ? 'Showing loads rolling, loaded, or dispatched in-transit' 
              : subSheetView === 'delivered'
              ? 'Showing completed shipments awaiting invoice submission or factoring settlement'
              : 'Showing all planned, active, delivered, and invoiced freight'}
          </span>
          <span className="text-zinc-500 font-mono">
            Displaying {filteredLoads.length} of {loads.length} loads
          </span>
        </div>
      </div>

      {/* Control Bar: Filters, Search & Summary */}
      <div className="bg-[#121214] rounded-xl shadow-md border border-zinc-800/80 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              id="input-table-search"
              type="text"
              placeholder="Search load #, shipper, receiver, city, driver, broker..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#18181b] border border-zinc-700/80 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-zinc-100 placeholder-zinc-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              id="select-status-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#18181b] border border-zinc-700/80 rounded-lg text-xs font-medium text-zinc-200 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses ({loads.length})</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Driver Filter */}
            <select
              id="select-driver-filter"
              value={driverFilter}
              onChange={e => setDriverFilter(e.target.value)}
              className="px-3 py-2 bg-[#18181b] border border-zinc-700/80 rounded-lg text-xs font-medium text-zinc-200 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Drivers</option>
              {driversList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Broker Filter */}
            <select
              id="select-broker-filter"
              value={brokerFilter}
              onChange={e => setBrokerFilter(e.target.value)}
              className="px-3 py-2 bg-[#18181b] border border-zinc-700/80 rounded-lg text-xs font-medium text-zinc-200 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Brokers</option>
              {brokersList.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Equipment Filter */}
            <select
              id="select-equipment-filter"
              value={equipmentFilter}
              onChange={e => setEquipmentFilter(e.target.value)}
              className="px-3 py-2 bg-[#18181b] border border-zinc-700/80 rounded-lg text-xs font-medium text-zinc-200 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Equipment</option>
              {EQUIPMENT_OPTIONS.map(eq => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>

            {(statusFilter !== 'ALL' || driverFilter !== 'ALL' || brokerFilter !== 'ALL' || equipmentFilter !== 'ALL' || searchQuery !== '') && (
              <button
                id="btn-clear-filters"
                onClick={() => {
                  setStatusFilter('ALL');
                  setDriverFilter('ALL');
                  setBrokerFilter('ALL');
                  setEquipmentFilter('ALL');
                  setSearchQuery('');
                }}
                className="px-2.5 py-2 text-xs font-medium text-orange-400 hover:text-orange-300 hover:bg-orange-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-orange-900/50"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary Pill Bar */}
        <div className="mt-3 pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-zinc-100">{filteredLoads.length}</strong> of <strong className="text-zinc-100">{loads.length}</strong> loads
            </span>
            {onClearAllLoads && loads.length > 0 && (
              <button
                type="button"
                id="btn-clear-all-loads"
                onClick={handleProtectedClearAll}
                className="ml-2 text-[11px] text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1 border-l border-zinc-700 pl-3"
                title="Remove all loads from dispatch schedule"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span>Clear All Loads</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>Filtered Gross: <strong className="text-emerald-400 font-semibold">${totals.totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
            <span>Avg RPM: <strong className="text-orange-400 font-semibold">${totals.avgRPM.toFixed(2)}/mi</strong></span>
            <span>Net Profit: <strong className="text-cyan-400 font-semibold">${totals.totalNetProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
          </div>
        </div>
      </div>

      {/* Bulk Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-800/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-200 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-rose-400" />
            <span className="font-semibold text-zinc-100">
              {selectedIds.length} of {filteredLoads.length} loads selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors cursor-pointer"
            >
              Deselect All
            </button>
            {onBulkDeleteLoads && (
              <button
                type="button"
                id="btn-delete-selected-loads"
                onClick={() => handleProtectedBulkDelete(selectedIds)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Interactive Spreadsheet Table */}
      <div className="bg-[#121214] rounded-xl shadow-md border border-zinc-800/80 overflow-hidden">
        <div className="overflow-x-auto max-h-[640px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#18181b] text-zinc-300 font-semibold sticky top-0 z-20 shadow-sm border-b border-zinc-800">
              <tr className="divide-x divide-zinc-800">
                <th className="px-3 py-3 w-10 text-center sticky left-0 bg-[#18181b] z-30">
                  <input 
                    type="checkbox"
                    id="checkbox-select-all"
                    aria-label="Select all displayed loads"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-800 text-orange-500 focus:ring-orange-500 cursor-pointer"
                  />
                </th>
                <th 
                  onClick={() => handleSort('loadNumber')}
                  className="px-3 py-3 font-semibold cursor-pointer hover:bg-zinc-800 whitespace-nowrap min-w-[110px]"
                >
                  Load ID {getSortIcon('loadNumber')}
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="px-3 py-3 font-semibold cursor-pointer hover:bg-zinc-800 whitespace-nowrap min-w-[130px]"
                >
                  Status {getSortIcon('status')}
                </th>
                <th 
                  onClick={() => handleSort('pickupDate')}
                  className="px-3 py-3 font-semibold cursor-pointer hover:bg-zinc-800 whitespace-nowrap min-w-[115px]"
                >
                  Pickup Date {getSortIcon('pickupDate')}
                </th>
                <th 
                  onClick={() => handleSort('deliveryDate')}
                  className="px-3 py-3 font-semibold cursor-pointer hover:bg-zinc-800 whitespace-nowrap min-w-[115px]"
                >
                  Delivery Date {getSortIcon('deliveryDate')}
                </th>
                <th 
                  onClick={() => handleSort('originCity')}
                  className="px-3 py-3 font-semibold cursor-pointer hover:bg-zinc-800 min-w-[170px]"
                >
                  Origin (Shipper) {getSortIcon('originCity')}
                </th>
                <th 
                  onClick={() => handleSort('destinationCity')}
                  className="px-3 py-3 font-semibold cursor-pointer hover:bg-zinc-800 min-w-[170px]"
                >
                  Destination (Receiver) {getSortIcon('destinationCity')}
                </th>
                <th 
                  onClick={() => handleSort('driverName')}
                  className="px-3 py-3 font-semibold cursor-pointer hover:bg-zinc-800 min-w-[150px]"
                >
                  Driver & Rig {getSortIcon('driverName')}
                </th>
                <th 
                  onClick={() => handleSort('equipmentType')}
                  className="px-3 py-3 font-semibold cursor-pointer hover:bg-zinc-800 min-w-[120px]"
                >
                  Equipment {getSortIcon('equipmentType')}
                </th>
                <th 
                  onClick={() => handleSort('totalMiles')}
                  className="px-3 py-3 font-semibold cursor-pointer hover:bg-zinc-800 text-right whitespace-nowrap min-w-[95px]"
                >
                  Miles {getSortIcon('totalMiles')}
                </th>
                <th 
                  onClick={() => handleSort('totalGross')}
                  className="px-3 py-3 font-semibold cursor-pointer hover:bg-zinc-800 text-right whitespace-nowrap min-w-[110px]"
                >
                  Gross Rate {getSortIcon('totalGross')}
                </th>
                <th 
                  onClick={() => handleSort('ratePerMile')}
                  className="px-3 py-3 font-semibold cursor-pointer hover:bg-zinc-800 text-right whitespace-nowrap min-w-[95px]"
                >
                  Rate/Mi {getSortIcon('ratePerMile')}
                </th>
                <th 
                  onClick={() => handleSort('driverPay')}
                  className="px-3 py-3 font-semibold cursor-pointer hover:bg-zinc-800 text-right whitespace-nowrap min-w-[100px]"
                >
                  Driver Pay {getSortIcon('driverPay')}
                </th>
                <th 
                  onClick={() => handleSort('fuelCost')}
                  className="px-3 py-3 font-semibold cursor-pointer hover:bg-zinc-800 text-right whitespace-nowrap min-w-[95px]"
                >
                  Fuel Cost {getSortIcon('fuelCost')}
                </th>
                <th 
                  onClick={() => handleSort('netProfit')}
                  className="px-3 py-3 font-semibold cursor-pointer hover:bg-zinc-800 text-right whitespace-nowrap min-w-[105px]"
                >
                  Net Profit {getSortIcon('netProfit')}
                </th>
                <th 
                  onClick={() => handleSort('profitMargin')}
                  className="px-3 py-3 font-semibold cursor-pointer hover:bg-zinc-800 text-right whitespace-nowrap min-w-[85px]"
                >
                  Margin {getSortIcon('profitMargin')}
                </th>
                <th 
                  onClick={() => handleSort('brokerName')}
                  className="px-3 py-3 font-semibold cursor-pointer hover:bg-zinc-800 min-w-[160px]"
                >
                  Broker / Customer {getSortIcon('brokerName')}
                </th>
                <th 
                  onClick={() => handleSort('paymentStatus')}
                  className="px-3 py-3 font-semibold cursor-pointer hover:bg-zinc-800 whitespace-nowrap min-w-[130px]"
                >
                  Settlement &amp; Pay {getSortIcon('paymentStatus')}
                </th>
                <th className="px-3 py-3 font-semibold text-center whitespace-nowrap min-w-[110px] sticky right-0 bg-[#18181b] z-10 border-l border-zinc-800">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
              {filteredLoads.length === 0 ? (
                <tr>
                  <td colSpan={18} className="text-center py-12 text-zinc-500">
                    <Truck className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
                    <p className="text-sm font-medium text-zinc-400">No loads found matching current criteria</p>
                    <p className="text-xs text-zinc-500 mt-1">Try clearing filters or add a new load</p>
                    <button
                      onClick={handleProtectedAdd}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-md text-xs font-semibold hover:bg-orange-600 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Load
                    </button>
                  </td>
                </tr>
              ) : (
                filteredLoads.map((load, idx) => (
                  <tr 
                    key={load.id} 
                    className={`divide-x divide-zinc-800/60 hover:bg-zinc-800/50 transition-colors ${
                      selectedIds.includes(load.id) 
                        ? 'bg-orange-950/20' 
                        : idx % 2 === 1 ? 'bg-[#151518]' : 'bg-[#121214]'
                    }`}
                  >
                    {/* Row Selector Checkbox */}
                    <td className="px-3 py-2.5 text-center sticky left-0 bg-inherit z-10">
                      <input 
                        type="checkbox"
                        id={`checkbox-select-${load.id}`}
                        aria-label={`Select load ${load.loadNumber}`}
                        checked={selectedIds.includes(load.id)}
                        onChange={() => toggleSelectRow(load.id)}
                        className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-800 text-orange-500 focus:ring-orange-500 cursor-pointer"
                      />
                    </td>

                    {/* Load ID & PO */}
                    <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                      <div className="font-bold text-zinc-100 flex items-center gap-1">
                        <span>{load.loadNumber}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">PO: {load.orderNumber}</div>
                    </td>

                    {/* Status Badge with Quick Update Dropdown */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="relative inline-block">
                        <select
                          value={load.status}
                          onChange={(e) => handleProtectedStatusUpdate(load.id, e.target.value as LoadStatus)}
                          className={`text-[11px] font-semibold px-2 py-1 rounded-md border cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500 ${getStatusBadge(load.status)}`}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt} className="bg-[#18181b] text-zinc-200">{opt}</option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Pickup Date */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="font-medium text-zinc-200">{load.pickupDate}</div>
                      <div className="text-[10px] text-zinc-500">{load.pickupTime || 'Flexible'}</div>
                    </td>

                    {/* Delivery Date */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="font-medium text-zinc-200">{load.deliveryDate}</div>
                      <div className="text-[10px] text-zinc-500">{load.deliveryTime || 'Flexible'}</div>
                    </td>

                    {/* Origin */}
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-zinc-100">
                        {load.originCity}, {load.originState}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate max-w-[160px]" title={load.shipperName}>
                        {load.shipperName}
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-zinc-100">
                        {load.destinationCity}, {load.destinationState}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate max-w-[160px]" title={load.receiverName}>
                        {load.receiverName}
                      </div>
                    </td>

                    {/* Driver & Rig with Quick Reassignment */}
                    <td className="px-3 py-2.5 min-w-[150px]">
                      {onQuickUpdateLoad ? (
                        <div>
                          <select
                            value={load.driverName}
                            onChange={(e) => handleProtectedQuickUpdate(load.id, { driverName: e.target.value })}
                            title="Quick re-assign driver (auto-syncs immediately)"
                            className="text-xs font-semibold px-2 py-1 bg-[#18181b] text-zinc-200 border border-zinc-700/80 rounded focus:ring-1 focus:ring-orange-500 cursor-pointer w-full"
                          >
                            {driversList.map(d => (
                              <option key={d} value={d} className="bg-[#18181b] text-zinc-200">{d}</option>
                            ))}
                            {!driversList.includes(load.driverName) && (
                              <option value={load.driverName} className="bg-[#18181b] text-zinc-200">{load.driverName}</option>
                            )}
                          </select>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            {load.truckNumber} / {load.trailerNumber}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-zinc-200">{load.driverName}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            {load.truckNumber} / {load.trailerNumber}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Equipment Type */}
                    <td className="px-3 py-2.5 whitespace-nowrap text-zinc-400">
                      <span className="inline-block bg-zinc-800/80 px-2 py-0.5 rounded text-[11px] font-medium border border-zinc-700/80 text-zinc-300">
                        {load.equipmentType}
                      </span>
                    </td>

                    {/* Miles */}
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      <div className="font-semibold text-zinc-100">{load.totalMiles.toLocaleString()} mi</div>
                      <div className="text-[10px] text-zinc-500">({load.loadedMiles}L + {load.deadheadMiles}DH)</div>
                    </td>

                    {/* Gross Rate */}
                    <td className="px-3 py-2.5 text-right font-bold text-emerald-400 whitespace-nowrap">
                      ${load.totalGross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      {load.accessorials > 0 && (
                        <div className="text-[10px] text-emerald-500 font-normal">
                          +${load.accessorials} acc.
                        </div>
                      )}
                    </td>

                    {/* Rate Per Mile */}
                    <td className="px-3 py-2.5 text-right font-semibold text-orange-400 whitespace-nowrap">
                      ${load.ratePerMile.toFixed(2)}/mi
                    </td>

                    {/* Driver Pay */}
                    <td className="px-3 py-2.5 text-right font-medium text-zinc-300 whitespace-nowrap">
                      ${load.driverPay.toFixed(2)}
                    </td>

                    {/* Fuel Cost */}
                    <td className="px-3 py-2.5 text-right font-medium text-amber-400 whitespace-nowrap">
                      ${load.fuelCost.toFixed(2)}
                    </td>

                    {/* Net Profit */}
                    <td className="px-3 py-2.5 text-right font-bold text-cyan-400 whitespace-nowrap">
                      ${load.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Margin % */}
                    <td className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold border ${
                        load.profitMargin >= 50 
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80' 
                          : load.profitMargin >= 40 
                          ? 'bg-blue-950/80 text-blue-300 border-blue-800/80' 
                          : 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                      }`}>
                        {load.profitMargin.toFixed(1)}%
                      </span>
                    </td>

                    {/* Broker */}
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-zinc-200 truncate max-w-[150px]" title={load.brokerName}>
                        {load.brokerName}
                      </div>
                      <div className="text-[10px] text-zinc-500">{load.brokerPhone}</div>
                    </td>

                    {/* Invoicing & Settlement Payment Status */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {onQuickUpdateLoad ? (
                        <select
                          value={load.paymentStatus}
                          onChange={(e) => handleProtectedQuickUpdate(load.id, { paymentStatus: e.target.value as PaymentStatus })}
                          title="Quick update payment/factoring status (auto-syncs immediately)"
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                            load.paymentStatus === 'Paid' 
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80' 
                              : load.paymentStatus === 'Submitted to Factoring' 
                              ? 'bg-blue-950/80 text-blue-300 border-blue-800/80' 
                              : load.paymentStatus === 'Invoiced' 
                              ? 'bg-purple-950/80 text-purple-300 border-purple-800/80' 
                              : load.paymentStatus === 'Overdue' 
                              ? 'bg-rose-950/80 text-rose-300 border-rose-800/80' 
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          <option value="Pending" className="bg-[#18181b] text-zinc-200">Pending</option>
                          <option value="Invoiced" className="bg-[#18181b] text-zinc-200">Invoiced</option>
                          <option value="Submitted to Factoring" className="bg-[#18181b] text-zinc-200">Factoring</option>
                          <option value="Paid" className="bg-[#18181b] text-zinc-200">Paid</option>
                          <option value="Overdue" className="bg-[#18181b] text-zinc-200">Overdue</option>
                        </select>
                      ) : (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {load.paymentStatus}
                        </span>
                      )}
                      {load.invoiceNumber && (
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          #{load.invoiceNumber}
                        </div>
                      )}
                    </td>

                    {/* Actions Sticky Column */}
                    <td className="px-2 py-2.5 text-center whitespace-nowrap sticky right-0 bg-[#121214] z-10 border-l border-zinc-800">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          id={`btn-edit-${load.id}`}
                          onClick={() => handleProtectedEdit(load)}
                          className="p-1 text-zinc-400 hover:text-orange-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                          title="Edit Load"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-print-${load.id}`}
                          onClick={() => onPrintLoad(load)}
                          className="p-1 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                          title="Print Dispatch Sheet / Rate Confirmation"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-duplicate-${load.id}`}
                          onClick={() => handleProtectedDuplicate(load)}
                          className="p-1 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                          title="Duplicate Load"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-delete-${load.id}`}
                          onClick={() => handleProtectedDelete(load.id)}
                          className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                          title="Delete Load"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Bottom Spreadsheet Summary Totals Row */}
            <tfoot className="bg-[#0E0E11] text-white font-semibold sticky bottom-0 z-20 border-t-2 border-zinc-700 shadow-lg">
              <tr className="divide-x divide-zinc-800 text-xs">
                <td className="px-3 py-3 sticky left-0 bg-[#0E0E11] z-30"></td>
                <td className="px-3 py-3 font-bold text-orange-400">TOTALS</td>
                <td className="px-3 py-3">{totals.count} Loads</td>
                <td className="px-3 py-3" colSpan={6}></td>
                <td className="px-3 py-3 text-right font-bold text-amber-300 whitespace-nowrap">
                  {totals.totalMiles.toLocaleString()} mi
                </td>
                <td className="px-3 py-3 text-right font-bold text-emerald-400 whitespace-nowrap">
                  ${totals.totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-3 text-right font-bold text-orange-400 whitespace-nowrap">
                  ${totals.avgRPM.toFixed(2)}/mi
                </td>
                <td className="px-3 py-3 text-right font-bold text-zinc-200 whitespace-nowrap">
                  ${totals.totalDriverPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-3 text-right font-bold text-amber-300 whitespace-nowrap">
                  ${totals.totalFuel.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-3 text-right font-bold text-cyan-400 whitespace-nowrap">
                  ${totals.totalNetProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-3 text-right font-bold text-emerald-400 whitespace-nowrap">
                  {totals.avgMargin.toFixed(1)}%
                </td>
                <td className="px-3 py-3" colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
