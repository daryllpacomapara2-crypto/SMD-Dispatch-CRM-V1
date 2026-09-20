import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { DispatchLoad, FleetDriver, ActiveTab, LoadStatus, PaymentStatus } from './types/dispatch';
import { INITIAL_LOADS, SAMPLE_DRIVERS } from './data/sampleLoads';
import { calculateSummaryMetrics } from './utils/calculations';
import { exportDispatchToExcel, exportDispatchToCSV } from './utils/excelExport';
import { syncManager } from './utils/syncManager';

import { Navbar } from './components/Navbar';
import { AdminControlBanner } from './components/AdminControlBanner';
import { KPICards } from './components/KPICards';
import { SpreadsheetView } from './components/SpreadsheetView';
import { LoadModal } from './components/LoadModal';
import { DriverModal } from './components/DriverModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { RateConfirmationModal } from './components/RateConfirmationModal';
import { FleetRosterView } from './components/FleetRosterView';
import { AnalyticsView } from './components/AnalyticsView';
import { DispatchCalculatorModal } from './components/DispatchCalculatorModal';
import { Logo } from './components/Logo';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { theme, isLightMode } = useTheme();

  // Admin control state (persisted, default true for admin user)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sound_minded_is_admin');
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading admin state', e);
    }
    return true;
  });

  // Load initial data from localStorage if available
  const [loads, setLoads] = useState<DispatchLoad[]>(() => {
    try {
      const saved = localStorage.getItem('sound_minded_dispatch_loads');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved loads from localStorage', e);
    }
    return INITIAL_LOADS;
  });

  const [drivers, setDrivers] = useState<FleetDriver[]>(() => {
    try {
      const saved = localStorage.getItem('sound_minded_fleet_drivers');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved drivers from localStorage', e);
    }
    return SAMPLE_DRIVERS;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('master_sheet');
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [editingLoad, setEditingLoad] = useState<DispatchLoad | null>(null);
  const [defaultLoadStatus, setDefaultLoadStatus] = useState<LoadStatus>('booked');

  // Driver modal state
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<FleetDriver | null>(null);

  // Unified Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    itemName: string;
    itemType: 'load' | 'driver' | 'records';
    warningMessage?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    itemName: '',
    itemType: 'load',
    onConfirm: () => {},
  });

  const [isRateConModalOpen, setIsRateConModalOpen] = useState(false);
  const [selectedRateConLoad, setSelectedRateConLoad] = useState<DispatchLoad | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Auto-Sync and saving pulse state
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  });
  const [isSaving, setIsSaving] = useState(false);

  const triggerSyncPulse = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setLastSyncTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    }, 250);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sound_minded_is_admin', JSON.stringify(isAdmin));
    } catch (e) {
      console.error('Error saving admin mode', e);
    }
  }, [isAdmin]);

  // Auto-Save loads & broadcast
  useEffect(() => {
    try {
      localStorage.setItem('sound_minded_dispatch_loads', JSON.stringify(loads));
      syncManager.broadcast('LOADS_UPDATED', loads);
      triggerSyncPulse();
    } catch (e) {
      console.error('Error saving loads to localStorage', e);
    }
  }, [loads, triggerSyncPulse]);

  // Auto-Save drivers & broadcast
  useEffect(() => {
    try {
      localStorage.setItem('sound_minded_fleet_drivers', JSON.stringify(drivers));
      syncManager.broadcast('DRIVERS_UPDATED', drivers);
      triggerSyncPulse();
    } catch (e) {
      console.error('Error saving drivers to localStorage', e);
    }
  }, [drivers, triggerSyncPulse]);

  // Cross-tab real-time sync listener
  useEffect(() => {
    const unsubscribe = syncManager.subscribe((payload) => {
      if (payload.type === 'LOADS_UPDATED' && Array.isArray(payload.data)) {
        setLoads(payload.data);
        triggerSyncPulse();
      } else if (payload.type === 'DRIVERS_UPDATED' && Array.isArray(payload.data)) {
        setDrivers(payload.data);
        triggerSyncPulse();
      }
    });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sound_minded_dispatch_loads' && e.newValue) {
        try {
          setLoads(JSON.parse(e.newValue));
          triggerSyncPulse();
        } catch (err) {}
      } else if (e.key === 'sound_minded_fleet_drivers' && e.newValue) {
        try {
          setDrivers(JSON.parse(e.newValue));
          triggerSyncPulse();
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, [triggerSyncPulse]);

  // Toast notification helper
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Metrics
  const metrics = calculateSummaryMetrics(loads);

  // Toggle Admin Mode
  const handleToggleAdmin = () => {
    setIsAdmin((prev) => {
      const next = !prev;
      showNotification(
        next
          ? 'Admin Mode Activated: Full Add, Edit & Delete access enabled.'
          : 'Read-Only Mode Activated: Modifications locked.'
      );
      return next;
    });
  };

  // Update Load Status
  const handleUpdateLoadStatus = (id: string, newStatus: LoadStatus) => {
    setLoads((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          // Celebrate on delivery!
          if (newStatus === 'delivered' && l.status !== 'delivered') {
            confetti({
              particleCount: 75,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#F59E0B', '#10B981', '#3B82F6'],
            });
            showNotification(`Load ${l.loadNumber} marked as DELIVERED!`);
          }
          return { ...l, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return l;
      })
    );
  };

  // Update Payment Status
  const handleUpdatePaymentStatus = (id: string, newPayment: PaymentStatus) => {
    setLoads((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          if (newPayment === 'paid' && l.paymentStatus !== 'paid') {
            confetti({
              particleCount: 50,
              spread: 45,
              origin: { y: 0.8 },
              colors: ['#10B981', '#34D399'],
            });
            showNotification(`Payment collected for Load ${l.loadNumber}!`);
          }
          return { ...l, paymentStatus: newPayment, updatedAt: new Date().toISOString() };
        }
        return l;
      })
    );
  };

  // Save Load (Add or Edit)
  const handleSaveLoad = (loadToSave: DispatchLoad) => {
    setLoads((prev) => {
      const exists = prev.some((l) => l.id === loadToSave.id);
      if (exists) {
        showNotification(`Load ${loadToSave.loadNumber} updated successfully.`);
        return prev.map((l) => (l.id === loadToSave.id ? loadToSave : l));
      } else {
        showNotification(`New load ${loadToSave.loadNumber} scheduled!`);
        return [loadToSave, ...prev];
      }
    });
  };

  // Duplicate Load
  const handleDuplicateLoad = (load: DispatchLoad) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const duplicated: DispatchLoad = {
      ...load,
      id: `L-${Date.now()}`,
      loadNumber: `SM-${randomNum}`,
      status: 'booked',
      paymentStatus: 'unpaid',
      invoiceNumber: `INV-2026-${randomNum}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLoads((prev) => [duplicated, ...prev]);
    showNotification(`Duplicated as new load ${duplicated.loadNumber}`);
  };

  // Delete Single Load with Custom Confirmation Modal
  const handleDeleteLoad = (id: string, loadNumber?: string) => {
    const target = loads.find((l) => l.id === id);
    const displayName = loadNumber || target?.loadNumber || id;

    setDeleteModal({
      isOpen: true,
      title: 'Delete Load Entry',
      itemName: `Load ${displayName}`,
      itemType: 'load',
      warningMessage: 'This will permanently remove this load from the Master Schedule and financial metrics.',
      onConfirm: () => {
        setLoads((prev) => prev.filter((l) => l.id !== id));
        showNotification(`Load ${displayName} deleted successfully.`);
        setDeleteModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Bulk Delete Loads
  const handleBulkDeleteLoads = (ids: string[]) => {
    if (ids.length === 0) return;

    setDeleteModal({
      isOpen: true,
      title: 'Bulk Delete Loads',
      itemName: `${ids.length} selected dispatch load entries`,
      itemType: 'records',
      warningMessage: `Are you sure you want to permanently delete these ${ids.length} records? This action cannot be undone.`,
      onConfirm: () => {
        setLoads((prev) => prev.filter((l) => !ids.includes(l.id)));
        showNotification(`${ids.length} loads deleted successfully.`);
        setDeleteModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Bulk Update Status
  const handleBulkUpdateStatus = (ids: string[], newStatus: LoadStatus) => {
    setLoads((prev) =>
      prev.map((l) => (ids.includes(l.id) ? { ...l, status: newStatus, updatedAt: new Date().toISOString() } : l))
    );
    showNotification(`Updated status to ${newStatus.toUpperCase()} for ${ids.length} loads.`);
  };

  // Bulk Update Payment Status
  const handleBulkUpdatePayment = (ids: string[], newPayment: PaymentStatus) => {
    setLoads((prev) =>
      prev.map((l) => (ids.includes(l.id) ? { ...l, paymentStatus: newPayment, updatedAt: new Date().toISOString() } : l))
    );
    showNotification(`Updated payment status to ${newPayment.toUpperCase()} for ${ids.length} loads.`);
  };

  // ---------------- DRIVER CRUD HANDLERS ----------------
  const handleOpenAddDriver = () => {
    setEditingDriver(null);
    setIsDriverModalOpen(true);
  };

  const handleOpenEditDriver = (driver: FleetDriver) => {
    setEditingDriver(driver);
    setIsDriverModalOpen(true);
  };

  const handleSaveDriver = (savedDriver: FleetDriver) => {
    setDrivers((prev) => {
      const exists = prev.some((d) => d.id === savedDriver.id);
      if (exists) {
        showNotification(`Driver ${savedDriver.name} profile updated.`);
        return prev.map((d) => (d.id === savedDriver.id ? savedDriver : d));
      } else {
        showNotification(`New carrier driver ${savedDriver.name} added to fleet!`);
        return [savedDriver, ...prev];
      }
    });

    // Also update driver info in existing loads if name/phone/truck changed
    setLoads((prev) =>
      prev.map((l) => {
        if (l.driverId === savedDriver.id) {
          return {
            ...l,
            driverName: savedDriver.name,
            driverPhone: savedDriver.phone,
            truckNumber: savedDriver.truckNumber,
            trailerNumber: savedDriver.trailerNumber,
            equipmentType: savedDriver.equipmentType,
          };
        }
        return l;
      })
    );
  };

  const handleDeleteDriver = (driverId: string, driverName: string) => {
    const assignedLoadsCount = loads.filter((l) => l.driverId === driverId || l.driverName === driverName).length;

    setDeleteModal({
      isOpen: true,
      title: 'Remove Driver / Carrier',
      itemName: driverName,
      itemType: 'driver',
      warningMessage:
        assignedLoadsCount > 0
          ? `Warning: This driver currently has ${assignedLoadsCount} load(s) associated on record. The loads will remain in history with their name retained.`
          : 'This driver will be permanently removed from the active fleet roster.',
      onConfirm: () => {
        setDrivers((prev) => prev.filter((d) => d.id !== driverId));
        showNotification(`Driver ${driverName} removed from fleet.`);
        setDeleteModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleUpdateDriverStatus = (driverId: string, newStatus: FleetDriver['status']) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, status: newStatus } : d))
    );
    showNotification(`Driver status updated.`);
  };

  // Reset to default sample loads
  const handleResetData = () => {
    setDeleteModal({
      isOpen: true,
      title: 'Reset Database to Defaults',
      itemName: 'Sound Minded Dispatching, LLC Default Schedule & Roster',
      itemType: 'records',
      warningMessage: 'This will restore all default carrier dispatches and driver records.',
      onConfirm: () => {
        setLoads(INITIAL_LOADS);
        setDrivers(SAMPLE_DRIVERS);
        localStorage.removeItem('sound_minded_dispatch_loads');
        localStorage.removeItem('sound_minded_fleet_drivers');
        showNotification('Schedule reset to default carrier loads.');
        setDeleteModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Export to Excel
  const handleExportExcel = () => {
    exportDispatchToExcel(loads, drivers);
    showNotification('Excel spreadsheet (.xlsx) downloaded successfully!');
  };

  // Export to CSV / Sheets
  const handleExportCSV = () => {
    exportDispatchToCSV(loads);
    showNotification('CSV exported for Google Sheets import!');
  };

  // Instant inline update for gross rate, miles, driver assignment, etc.
  const handleQuickUpdateLoad = (id: string, updates: Partial<DispatchLoad>, actionMsg?: string) => {
    setLoads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l))
    );
    if (actionMsg) {
      syncManager.addSyncLog(
        activeTab === 'active_loads'
          ? 'Active Dispatches'
          : activeTab === 'delivered_invoiced'
          ? 'Delivered & Invoicing'
          : 'Master Schedule',
        actionMsg
      );
      showNotification(actionMsg);
    }
    triggerSyncPulse();
  };

  // Force sync across tabs & storage
  const handleForceSync = () => {
    syncManager.saveLoads(loads, 'System', 'Manual force sync executed');
    syncManager.saveDrivers(drivers, 'Fleet Roster', 'Manual force sync executed');
    triggerSyncPulse();
    showNotification('All sheets and fleet roster synchronized and saved.');
  };

  // Restore from JSON backup file
  const handleRestoreBackup = (imported: { loads?: DispatchLoad[]; drivers?: FleetDriver[] }) => {
    if (imported.loads && Array.isArray(imported.loads) && imported.loads.length > 0) {
      setLoads(imported.loads);
      syncManager.saveLoads(imported.loads, 'System', `Restored ${imported.loads.length} loads from JSON backup`);
    }
    if (imported.drivers && Array.isArray(imported.drivers) && imported.drivers.length > 0) {
      setDrivers(imported.drivers);
      syncManager.saveDrivers(imported.drivers, 'Fleet Roster', `Restored ${imported.drivers.length} drivers from JSON backup`);
    }
    triggerSyncPulse();
    showNotification(`Backup restored: ${imported.loads?.length || 0} loads, ${imported.drivers?.length || 0} drivers.`);
  };

  // Quick Open Edit Load Modal
  const handleOpenEdit = (load: DispatchLoad) => {
    setEditingLoad(load);
    setDefaultLoadStatus(load.status);
    setIsLoadModalOpen(true);
  };

  // Quick Open Add Load Modal
  const handleOpenAddWithStatus = (status: LoadStatus = 'booked') => {
    setEditingLoad(null);
    setDefaultLoadStatus(status);
    setIsLoadModalOpen(true);
  };

  // Open Rate Con Print View
  const handleViewRateCon = (load: DispatchLoad) => {
    setSelectedRateConLoad(load);
    setIsRateConModalOpen(true);
  };

  return (
    <div
      data-theme={theme}
      className={`min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950 theme-${theme} ${
        isLightMode ? 'theme-light' : 'theme-dark'
      } transition-colors duration-200`}
    >
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-amber-500 text-stone-950 px-4 py-2.5 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
          <span>✓</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Control Header Banner */}
      <AdminControlBanner
        isAdmin={isAdmin}
        onToggleAdmin={handleToggleAdmin}
        onOpenNewLoad={() => handleOpenAddWithStatus('booked')}
        onOpenNewDriver={handleOpenAddDriver}
        totalLoads={loads.length}
        totalDrivers={drivers.length}
      />

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewLoadModal={() => handleOpenAddWithStatus('booked')}
        onOpenNewDriverModal={handleOpenAddDriver}
        onExportExcel={handleExportExcel}
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
        totalLoadsCount={loads.length}
        activeLoadsCount={metrics.activeLoads}
        isAdmin={isAdmin}
        onToggleAdmin={handleToggleAdmin}
        lastSyncTime={lastSyncTime}
        isSaving={isSaving}
        loads={loads}
        drivers={drivers}
        onForceSync={handleForceSync}
        onRestoreBackup={handleRestoreBackup}
      />

      {/* Content Container */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 py-6">
        {/* KPI Financial & Operational Metrics */}
        <KPICards
          metrics={metrics}
          onFilterActive={() => setActiveTab('active_loads')}
          onFilterDelivered={() => setActiveTab('delivered_invoiced')}
        />

        {/* Tab Views */}

        {/* 1. MASTER SCHEDULE SHEET */}
        {activeTab === 'master_sheet' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/60 border border-stone-800/80 p-3.5 rounded-xl">
              <div>
                <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <span>Master Dispatch & Schedule Sheet</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/30">
                    Full Schedule ({loads.length} Loads)
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Auto-Sync Active
                  </span>
                </h3>
                <p className="text-xs text-stone-400">
                  Real-time master ledger for all booked, dispatched, in-transit, and settled loads. All edits, rate changes, and reassignments sync and save instantly.
                </p>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAddWithStatus('booked')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
                  >
                    <span>+ Add Load to Master Schedule</span>
                  </button>
                </div>
              )}
            </div>

            <SpreadsheetView
              loads={loads}
              drivers={drivers}
              isAdmin={isAdmin}
              onUpdateLoadStatus={handleUpdateLoadStatus}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
              onQuickUpdateLoad={handleQuickUpdateLoad}
              onEditLoad={handleOpenEdit}
              onDuplicateLoad={handleDuplicateLoad}
              onDeleteLoad={handleDeleteLoad}
              onBulkDeleteLoads={handleBulkDeleteLoads}
              onBulkUpdateStatus={handleBulkUpdateStatus}
              onBulkUpdatePayment={handleBulkUpdatePayment}
              onViewRateCon={handleViewRateCon}
              onAddNewLoad={() => handleOpenAddWithStatus('booked')}
              statusFilterPreset="all"
              addRecordButtonLabel="+ Add Load to Schedule"
            />
          </div>
        )}

        {/* 2. ACTIVE DISPATCHES & IN-TRANSIT */}
        {activeTab === 'active_loads' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/60 border border-stone-800/80 p-3.5 rounded-xl">
              <div>
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <span>Active Dispatches & Loads In-Transit</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/30">
                    {metrics.activeLoads} Active
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Auto-Sync Active
                  </span>
                </h3>
                <p className="text-xs text-stone-400">
                  Loads currently booked, dispatched, at shipper, or rolling in-transit across highways. Instant status updates sync to Master Schedule and Financials.
                </p>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAddWithStatus('dispatched')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
                  >
                    <span>+ Dispatch New Active Load</span>
                  </button>
                </div>
              )}
            </div>

            <SpreadsheetView
              loads={loads}
              drivers={drivers}
              isAdmin={isAdmin}
              onUpdateLoadStatus={handleUpdateLoadStatus}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
              onQuickUpdateLoad={handleQuickUpdateLoad}
              onEditLoad={handleOpenEdit}
              onDuplicateLoad={handleDuplicateLoad}
              onDeleteLoad={handleDeleteLoad}
              onBulkDeleteLoads={handleBulkDeleteLoads}
              onBulkUpdateStatus={handleBulkUpdateStatus}
              onBulkUpdatePayment={handleBulkUpdatePayment}
              onViewRateCon={handleViewRateCon}
              onAddNewLoad={() => handleOpenAddWithStatus('dispatched')}
              statusFilterPreset="active"
              addRecordButtonLabel="+ Dispatch New Active Load"
            />
          </div>
        )}

        {/* 3. DELIVERED LOADS, INVOICING & SETTLEMENT */}
        {activeTab === 'delivered_invoiced' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/60 border border-stone-800/80 p-3.5 rounded-xl">
              <div>
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <span>Delivered Loads, Invoicing & Settlement</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                    Delivered & Settled
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Auto-Sync Active
                  </span>
                </h3>
                <p className="text-xs text-stone-400">
                  Delivered freight, pending factoring/quickpay receivables, and completed carrier settlements. Payment status changes auto-sync immediately.
                </p>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAddWithStatus('delivered')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-lg text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                  >
                    <span>+ Add Delivered / Invoiced Record</span>
                  </button>
                </div>
              )}
            </div>

            <SpreadsheetView
              loads={loads}
              drivers={drivers}
              isAdmin={isAdmin}
              onUpdateLoadStatus={handleUpdateLoadStatus}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
              onQuickUpdateLoad={handleQuickUpdateLoad}
              onEditLoad={handleOpenEdit}
              onDuplicateLoad={handleDuplicateLoad}
              onDeleteLoad={handleDeleteLoad}
              onBulkDeleteLoads={handleBulkDeleteLoads}
              onBulkUpdateStatus={handleBulkUpdateStatus}
              onBulkUpdatePayment={handleBulkUpdatePayment}
              onViewRateCon={handleViewRateCon}
              onAddNewLoad={() => handleOpenAddWithStatus('delivered')}
              statusFilterPreset="delivered"
              addRecordButtonLabel="+ Add Delivered / Invoiced Record"
            />
          </div>
        )}

        {/* 4. FLEET & DRIVER ROSTER */}
        {activeTab === 'fleet_roster' && (
          <FleetRosterView
            drivers={drivers}
            loads={loads}
            isAdmin={isAdmin}
            onSelectDriverLoads={(driverName) => {
              setActiveTab('master_sheet');
            }}
            onOpenNewDriverModal={handleOpenAddDriver}
            onEditDriver={handleOpenEditDriver}
            onDeleteDriver={handleDeleteDriver}
            onUpdateDriverStatus={handleUpdateDriverStatus}
          />
        )}

        {/* 5. RATE ANALYTICS */}
        {activeTab === 'rate_analytics' && <AnalyticsView loads={loads} />}

        {/* 6. CALCULATOR */}
        {activeTab === 'calculator' && <DispatchCalculatorModal />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-850 py-5 bg-stone-950/80 text-center text-xs text-stone-400">
        <div className="max-w-[1700px] mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" showSubtitle={false} />
            <span>• Professional Trucking Dispatch & Logistics Management</span>
          </div>
          <div className="text-[11px] font-mono text-stone-400">
            Admin Controlled: Add, Edit, and Delete authorization active across all sheets and roster.
          </div>
          <div className="text-[11px] text-stone-400">
            © {new Date().getFullYear()} Sound Minded Dispatching, LLC. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Modal: Book / Edit Load */}
      <LoadModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        onSave={handleSaveLoad}
        drivers={drivers}
        existingLoad={editingLoad}
        defaultStatus={defaultLoadStatus}
      />

      {/* Modal: Add / Edit Fleet Driver */}
      <DriverModal
        isOpen={isDriverModalOpen}
        onClose={() => setIsDriverModalOpen(false)}
        onSave={handleSaveDriver}
        existingDriver={editingDriver}
      />

      {/* Modal: Rate Confirmation & Driver Dispatch Slip */}
      <RateConfirmationModal
        isOpen={isRateConModalOpen}
        onClose={() => setIsRateConModalOpen(false)}
        load={selectedRateConLoad}
      />

      {/* Modal: Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={deleteModal.onConfirm}
        title={deleteModal.title}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        warningMessage={deleteModal.warningMessage}
      />
    </div>
  );
}
