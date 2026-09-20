import React, { useState, useEffect } from 'react';
import { LoadItem, Driver, Broker, ExpenseItem, LoadStatus, PaymentStatus } from './types';
import { INITIAL_LOADS, INITIAL_DRIVERS, INITIAL_BROKERS, INITIAL_EXPENSES } from './data/initialData';
import { generateTruckingLoadSchedulerExcel } from './utils/excelGenerator';
import { Header } from './components/Header';
import { LoadSchedulerTable } from './components/LoadSchedulerTable';
import { DispatchCalendar } from './components/DispatchCalendar';
import { FleetManager } from './components/FleetManager';
import { BrokersDirectory } from './components/BrokersDirectory';
import { FinancialDashboard } from './components/FinancialDashboard';
import { IftaExpenseLog } from './components/IftaExpenseLog';
import { DataSetupModal } from './components/DataSetupModal';
import { AddEditLoadModal } from './components/AddEditLoadModal';
import { DownloadModal } from './components/DownloadModal';
import { PrintableLoadSheet } from './components/PrintableLoadSheet';
import { InstallAppModal } from './components/InstallAppModal';
import { QRCodeModal } from './components/QRCodeModal';
import { QRCodeTab } from './components/QRCodeTab';
import { SoundMindedLogo } from './components/SoundMindedLogo';
import { autoSaveService } from './utils/autoSaveService';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { UndoToast, ToastAction } from './components/UndoToast';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminControlCenterModal } from './components/AdminControlCenterModal';
import { AdminPortalLogin } from './components/AdminPortalLogin';
import { Laptop, Smartphone, Download, X, Sparkles, QrCode, ShieldCheck, Lock } from 'lucide-react';
import { getAppBaseUrl, APP_PUBLIC_URL } from './utils/appConfig';

function AppContent() {
  const { 
    adminUser, 
    isAdmin, 
    canEdit, 
    isLoginModalOpen, 
    isControlModalOpen, 
    setIsLoginModalOpen, 
    setIsControlModalOpen, 
    checkPermissionOrPrompt, 
    logAudit 
  } = useAdmin();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<string>('scheduler');

  // Core Data with LocalStorage Persistence
  const [loads, setLoads] = useState<LoadItem[]>(() => {
    const saved = localStorage.getItem('erc_trucking_loads');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved loads', e);
      }
    }
    return INITIAL_LOADS;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('erc_trucking_drivers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved drivers', e);
      }
    }
    return INITIAL_DRIVERS;
  });

  const [brokers, setBrokers] = useState<Broker[]>(() => {
    const saved = localStorage.getItem('erc_trucking_brokers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved brokers', e);
      }
    }
    return INITIAL_BROKERS;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('erc_trucking_expenses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved expenses', e);
      }
    }
    return INITIAL_EXPENSES;
  });

  // Save to LocalStorage and AutoSave Service Engine
  useEffect(() => {
    localStorage.setItem('erc_trucking_loads', JSON.stringify(loads));
    autoSaveService.scheduleSave('loads_update');
  }, [loads]);

  useEffect(() => {
    localStorage.setItem('erc_trucking_drivers', JSON.stringify(drivers));
    autoSaveService.scheduleSave('drivers_update');
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('erc_trucking_brokers', JSON.stringify(brokers));
    autoSaveService.scheduleSave('brokers_update');
  }, [brokers]);

  useEffect(() => {
    localStorage.setItem('erc_trucking_expenses', JSON.stringify(expenses));
    autoSaveService.scheduleSave('expenses_update');
  }, [expenses]);

  // Register data provider with autoSaveService for unified syncing
  useEffect(() => {
    autoSaveService.registerDataProvider(() => ({
      loads,
      drivers,
      brokers,
      expenses,
      activeTab
    }));
  }, [loads, drivers, brokers, expenses, activeTab]);

  // Modal States
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingLoad, setEditingLoad] = useState<LoadItem | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [printableLoad, setPrintableLoad] = useState<LoadItem | null>(null);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);

  // In-App Deletion Modal & Undo Notification
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    itemDetails?: string;
    confirmButtonText?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [toast, setToast] = useState<ToastAction | null>(null);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  useEffect(() => {
    const isRunningStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(isRunningStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (!deferredPrompt) {
      setIsInstallModalOpen(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallModalOpen(false);
      logAudit('BACKUP', 'SYSTEM', 'Installed PWA App', 'User added app to home screen / desktop');
    }
  };

  // Load Actions
  const handleOpenAddModal = () => {
    checkPermissionOrPrompt(() => {
      setEditingLoad(null);
      setIsAddEditOpen(true);
    }, 'Admin authorization is required to book and add loads.');
  };

  const handleEditLoad = (load: LoadItem) => {
    checkPermissionOrPrompt(() => {
      setEditingLoad(load);
      setIsAddEditOpen(true);
    }, 'Admin authorization is required to edit load details.');
  };

  const handleSaveLoad = (load: LoadItem) => {
    checkPermissionOrPrompt(() => {
      if (editingLoad) {
        setLoads(prev => prev.map(l => l.id === load.id ? load : l));
        logAudit('EDIT', 'LOAD', `Updated Load ${load.loadNumber}`, `Origin: ${load.originCity}, ${load.originState} → ${load.destinationCity}, ${load.destinationState} • Gross: $${load.totalGross.toLocaleString()} • Driver: ${load.driverName}`, load.id);
      } else {
        setLoads(prev => [load, ...prev]);
        logAudit('ADD', 'LOAD', `Created Load ${load.loadNumber}`, `Origin: ${load.originCity}, ${load.originState} → ${load.destinationCity}, ${load.destinationState} • Gross: $${load.totalGross.toLocaleString()} • Driver: ${load.driverName}`, load.id);
      }
      setIsAddEditOpen(false);
    }, 'Admin authorization is required to save loads.');
  };

  const handleDuplicateLoad = (load: LoadItem) => {
    checkPermissionOrPrompt(() => {
      const newLoad: LoadItem = {
        ...load,
        id: `LOAD-${Date.now()}`,
        loadNumber: `LD-${Math.floor(8600 + Math.random() * 1000)}`,
        orderNumber: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'Booked',
        invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        paymentStatus: 'Pending'
      };
      setLoads(prev => [newLoad, ...prev]);
      logAudit('ADD', 'LOAD', `Duplicated Load ${newLoad.loadNumber}`, `Copied from ${load.loadNumber} (Driver: ${load.driverName}, Gross: $${load.totalGross.toLocaleString()})`, newLoad.id);
    }, 'Admin authorization is required to duplicate loads.');
  };

  // Load Deletion with Modal & Undo Toast
  const handleDeleteLoad = (loadId: string) => {
    checkPermissionOrPrompt(() => {
      const target = loads.find(l => l.id === loadId);
      if (!target) return;

      setDeleteModal({
        isOpen: true,
        title: `Delete Load ${target.loadNumber}?`,
        message: 'Are you sure you want to remove this load entry from the schedule? You can easily undo this action immediately after deleting.',
        itemName: `${target.loadNumber} (PO: ${target.orderNumber})`,
        itemDetails: `${target.originCity}, ${target.originState} → ${target.destinationCity}, ${target.destinationState} • Gross: $${target.totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 })} • Driver: ${target.driverName}`,
        confirmButtonText: 'Delete Load',
        isDangerous: true,
        onConfirm: () => {
          setLoads(prev => prev.filter(l => l.id !== loadId));
          logAudit('DELETE', 'LOAD', `Deleted Load ${target.loadNumber}`, `Route: ${target.originCity} to ${target.destinationCity} • Driver: ${target.driverName}`, target.id);
          setToast({
            id: Date.now().toString(),
            message: `Load ${target.loadNumber} deleted from schedule.`,
            onUndo: () => {
              setLoads(prev => [target, ...prev]);
              logAudit('RESTORE', 'LOAD', `Restored Load ${target.loadNumber}`, `Reverted deletion`, target.id);
              setToast({
                id: Date.now().toString(),
                message: `Load ${target.loadNumber} restored.`
              });
            },
            undoLabel: 'Undo'
          });
        }
      });
    }, 'Admin authorization is required to delete loads.');
  };

  // Bulk Load Deletion with Modal & Undo Toast
  const handleBulkDeleteLoads = (loadIds: string[]) => {
    checkPermissionOrPrompt(() => {
      if (loadIds.length === 0) return;
      const targets = loads.filter(l => loadIds.includes(l.id));

      setDeleteModal({
        isOpen: true,
        title: `Delete ${loadIds.length} Selected Loads?`,
        message: `Are you sure you want to delete these ${loadIds.length} loads from the dispatch schedule?`,
        itemName: `${loadIds.length} Loads Selected`,
        itemDetails: targets.map(t => t.loadNumber).slice(0, 5).join(', ') + (targets.length > 5 ? ` and ${targets.length - 5} more...` : ''),
        confirmButtonText: `Delete ${loadIds.length} Loads`,
        isDangerous: true,
        onConfirm: () => {
          setLoads(prev => prev.filter(l => !loadIds.includes(l.id)));
          logAudit('DELETE', 'LOAD', `Bulk Deleted ${targets.length} Loads`, `Load numbers: ${targets.map(t => t.loadNumber).join(', ')}`);
          setToast({
            id: Date.now().toString(),
            message: `${targets.length} loads deleted.`,
            onUndo: () => {
              setLoads(prev => [...targets, ...prev]);
              logAudit('RESTORE', 'LOAD', `Restored ${targets.length} Loads`, `Reverted bulk deletion`);
              setToast({
                id: Date.now().toString(),
                message: `${targets.length} loads restored.`
              });
            },
            undoLabel: 'Undo'
          });
        }
      });
    }, 'Admin authorization is required to delete multiple loads.');
  };

  // Clear All Loads from Schedule
  const handleClearAllLoads = () => {
    checkPermissionOrPrompt(() => {
      if (loads.length === 0) return;
      const previousLoads = [...loads];

      setDeleteModal({
        isOpen: true,
        title: 'Clear All Loads from Schedule?',
        message: 'This will remove all load entries from the dispatch table so you can input your own loads from a clean sheet.',
        itemName: `All ${previousLoads.length} Loads`,
        confirmButtonText: 'Clear All Loads',
        isDangerous: true,
        onConfirm: () => {
          setLoads([]);
          logAudit('DELETE', 'LOAD', `Cleared All Loads (${previousLoads.length} records)`, 'Full dispatch scheduler load table wipe');
          setToast({
            id: Date.now().toString(),
            message: `All ${previousLoads.length} loads cleared from schedule.`,
            onUndo: () => {
              setLoads(previousLoads);
              logAudit('RESTORE', 'LOAD', `Restored All Loads (${previousLoads.length} records)`, 'Reverted clear all loads');
              setToast({
                id: Date.now().toString(),
                message: 'Loads restored to schedule.'
              });
            },
            undoLabel: 'Undo'
          });
        }
      });
    }, 'Admin authorization is required to clear all loads.');
  };

  const handleUpdateStatus = (loadId: string, newStatus: LoadStatus) => {
    checkPermissionOrPrompt(() => {
      const target = loads.find(l => l.id === loadId);
      setLoads(prev => prev.map(l => l.id === loadId ? { ...l, status: newStatus } : l));
      logAudit('EDIT', 'LOAD', `Updated Status: ${newStatus}`, `Load ${target?.loadNumber || loadId}`, loadId);
    }, 'Admin authorization is required to change load status.');
  };

  const handlePrintLoad = (load: LoadItem) => {
    setPrintableLoad(load);
    setIsPrintOpen(true);
  };

  // Direct Excel Download
  const handleDirectExcelDownload = () => {
    generateTruckingLoadSchedulerExcel(loads, drivers, brokers, expenses);
    logAudit('BACKUP', 'SYSTEM', 'Exported Excel (.XLSX) Workbook', `Exported ${loads.length} loads, ${drivers.length} drivers, ${brokers.length} brokers, ${expenses.length} expenses`);
  };

  // Driver Actions
  const handleAddDriver = (newDriver: Driver) => {
    setDrivers(prev => [...prev, newDriver]);
    logAudit('ADD', 'DRIVER', `Added Driver ${newDriver.name}`, `Assigned Truck: ${newDriver.assignedTruck}, Phone: ${newDriver.phone}`, newDriver.id);
  };

  const handleUpdateDriver = (updated: Driver) => {
    setDrivers(prev => prev.map(d => d.id === updated.id ? updated : d));
    logAudit('EDIT', 'DRIVER', `Updated Driver ${updated.name}`, `Assigned Truck: ${updated.assignedTruck}, Phone: ${updated.phone}`, updated.id);
  };

  const handleDeleteDriver = (id: string) => {
    const target = drivers.find(d => d.id === id);
    if (!target) return;

    setDeleteModal({
      isOpen: true,
      title: `Delete Driver ${target.name}?`,
      message: `Are you sure you want to remove ${target.name} from the fleet roster? Existing loads assigned to this driver will be preserved.`,
      itemName: target.name,
      itemDetails: `Assigned: ${target.assignedTruck} • ${target.equipmentType} • Phone: ${target.phone}`,
      confirmButtonText: 'Delete Driver',
      isDangerous: true,
      onConfirm: () => {
        setDrivers(prev => prev.filter(d => d.id !== id));
        logAudit('DELETE', 'DRIVER', `Deleted Driver ${target.name}`, `Removed from fleet roster`, target.id);
        setToast({
          id: Date.now().toString(),
          message: `Driver ${target.name} deleted.`,
          onUndo: () => {
            setDrivers(prev => [...prev, target]);
            logAudit('RESTORE', 'DRIVER', `Restored Driver ${target.name}`, 'Reverted deletion', target.id);
            setToast({
              id: Date.now().toString(),
              message: `Driver ${target.name} restored.`
            });
          },
          undoLabel: 'Undo'
        });
      }
    });
  };

  // Broker Actions
  const handleAddBroker = (newBroker: Broker) => {
    setBrokers(prev => [...prev, newBroker]);
    logAudit('ADD', 'BROKER', `Added Broker ${newBroker.name}`, `MC: ${newBroker.mcNumber}, Payment Terms: ${newBroker.paymentTerms}`, newBroker.id);
  };

  const handleUpdateBroker = (updated: Broker) => {
    setBrokers(prev => prev.map(b => b.id === updated.id ? updated : b));
    logAudit('EDIT', 'BROKER', `Updated Broker ${updated.name}`, `MC: ${updated.mcNumber}, Terms: ${updated.paymentTerms}`, updated.id);
  };

  const handleDeleteBroker = (id: string) => {
    const target = brokers.find(b => b.id === id);
    if (!target) return;

    setDeleteModal({
      isOpen: true,
      title: `Delete Broker ${target.name}?`,
      message: `Are you sure you want to remove ${target.name} from your broker directory?`,
      itemName: target.name,
      itemDetails: `MC: ${target.mcNumber} • Terms: ${target.paymentTerms} • Phone: ${target.phone}`,
      confirmButtonText: 'Delete Broker',
      isDangerous: true,
      onConfirm: () => {
        setBrokers(prev => prev.filter(b => b.id !== id));
        logAudit('DELETE', 'BROKER', `Deleted Broker ${target.name}`, `Removed from directory`, target.id);
        setToast({
          id: Date.now().toString(),
          message: `Broker ${target.name} deleted.`,
          onUndo: () => {
            setBrokers(prev => [...prev, target]);
            logAudit('RESTORE', 'BROKER', `Restored Broker ${target.name}`, 'Reverted deletion', target.id);
            setToast({
              id: Date.now().toString(),
              message: `Broker ${target.name} restored.`
            });
          },
          undoLabel: 'Undo'
        });
      }
    });
  };

  // Expense Actions
  const handleAddExpense = (newExpense: ExpenseItem) => {
    setExpenses(prev => [newExpense, ...prev]);
    logAudit('ADD', 'EXPENSE', `Added Expense $${newExpense.cost.toFixed(2)} (${newExpense.category})`, `Vendor: ${newExpense.vendor}, State: ${newExpense.state}`, newExpense.id);
  };

  const handleUpdateExpense = (updated: ExpenseItem) => {
    setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
    logAudit('EDIT', 'EXPENSE', `Updated Expense $${updated.cost.toFixed(2)}`, `${updated.category} at ${updated.vendor}`, updated.id);
  };

  const handleDeleteExpense = (id: string) => {
    const target = expenses.find(e => e.id === id);
    if (!target) return;

    setDeleteModal({
      isOpen: true,
      title: 'Delete Expense Log Entry?',
      message: 'Are you sure you want to delete this trip/fuel expense entry?',
      itemName: `${target.category}: $${target.cost.toFixed(2)}`,
      itemDetails: `${target.vendor} • State: ${target.state} • Load: ${target.loadNumber}`,
      confirmButtonText: 'Delete Expense',
      isDangerous: true,
      onConfirm: () => {
        setExpenses(prev => prev.filter(e => e.id !== id));
        logAudit('DELETE', 'EXPENSE', `Deleted Expense $${target.cost.toFixed(2)}`, `${target.category} at ${target.vendor}`, target.id);
        setToast({
          id: Date.now().toString(),
          message: 'Expense entry deleted.',
          onUndo: () => {
            setExpenses(prev => [target, ...prev]);
            logAudit('RESTORE', 'EXPENSE', `Restored Expense $${target.cost.toFixed(2)}`, 'Reverted deletion', target.id);
            setToast({
              id: Date.now().toString(),
              message: 'Expense entry restored.'
            });
          },
          undoLabel: 'Undo'
        });
      }
    });
  };

  // Reset to default sample template
  const handleResetToDefaults = () => {
    checkPermissionOrPrompt(() => {
      setDeleteModal({
        isOpen: true,
        title: 'Reset to Demo Dataset?',
        message: 'This will reset all loads, drivers, brokers, and expenses back to the default Sound Minded Dispatching, LLC demonstration records.',
        confirmButtonText: 'Reset Demo Data',
        isDangerous: false,
        onConfirm: () => {
          setLoads(INITIAL_LOADS);
          setDrivers(INITIAL_DRIVERS);
          setBrokers(INITIAL_BROKERS);
          setExpenses(INITIAL_EXPENSES);
          localStorage.removeItem('erc_trucking_loads');
          localStorage.removeItem('erc_trucking_drivers');
          localStorage.removeItem('erc_trucking_brokers');
          localStorage.removeItem('erc_trucking_expenses');
          logAudit('RESTORE', 'SYSTEM', 'Reset to Demo Dataset', 'All tables reset to initial sample values');
          setToast({
            id: Date.now().toString(),
            message: 'Reset back to default demo dataset.'
          });
        }
      });
    }, 'Admin authorization is required to reset demo data.');
  };

  // Wipe All Data completely for fresh customized usage
  const handleClearAllData = () => {
    checkPermissionOrPrompt(() => {
      setDeleteModal({
        isOpen: true,
        title: 'Wipe All Data (Fresh Empty App)?',
        message: 'This will delete ALL loads, drivers, brokers, and expense entries from your system so you have complete blank spreadsheets to input your own company data.',
        confirmButtonText: 'Wipe All Data',
        isDangerous: true,
        onConfirm: () => {
          setLoads([]);
          setDrivers([]);
          setBrokers([]);
          setExpenses([]);
          localStorage.removeItem('erc_trucking_loads');
          localStorage.removeItem('erc_trucking_drivers');
          localStorage.removeItem('erc_trucking_brokers');
          localStorage.removeItem('erc_trucking_expenses');
          logAudit('RESET', 'SYSTEM', 'Wiped All Application Data', 'Empty clean slate initialized');
          setToast({
            id: Date.now().toString(),
            message: 'All application data has been wiped. You now have a clean slate.'
          });
        }
      });
    }, 'Admin authorization is required to wipe application data.');
  };

  const handleQuickUpdateLoad = (loadId: string, updates: Partial<LoadItem>) => {
    checkPermissionOrPrompt(() => {
      setLoads(prev => prev.map(l => {
        if (l.id !== loadId) return l;
        const updated = { ...l, ...updates };
        // Recalculate totals and margins
        if ('loadedMiles' in updates || 'deadheadMiles' in updates) {
          updated.totalMiles = (updated.loadedMiles || 0) + (updated.deadheadMiles || 0);
        }
        if ('grossRate' in updates || 'accessorials' in updates) {
          updated.totalGross = (updated.grossRate || 0) + (updated.accessorials || 0);
        }
        if ('grossRate' in updates || 'accessorials' in updates || 'loadedMiles' in updates || 'deadheadMiles' in updates) {
          updated.ratePerMile = updated.totalMiles > 0 ? (updated.totalGross / updated.totalMiles) : 0;
        }
        if ('driverPay' in updates || 'fuelCost' in updates || 'tollsAndOtherExpenses' in updates || 'grossRate' in updates || 'accessorials' in updates) {
          updated.netProfit = updated.totalGross - (updated.driverPay || 0) - (updated.fuelCost || 0) - (updated.tollsAndOtherExpenses || 0);
          updated.profitMargin = updated.totalGross > 0 ? (updated.netProfit / updated.totalGross) * 100 : 0;
        }
        return updated;
      }));
      const keys = Object.keys(updates).join(', ');
      logAudit('EDIT', 'LOAD', `Quick Updated Load fields: ${keys}`, `Load ID ${loadId}`, loadId);
    }, 'Admin authorization is required to modify load records.');
  };

  // Calendar slot booking
  const handleAddLoadOnDate = (dateStr: string, driverName?: string) => {
    checkPermissionOrPrompt(() => {
      setEditingLoad(null);
      setIsAddEditOpen(true);
    }, 'Admin authorization is required to schedule loads.');
  };

  // System Backup / Restore Import Handler
  const handleImportAllData = (imported: { loads?: LoadItem[]; drivers?: Driver[]; brokers?: Broker[]; expenses?: ExpenseItem[] }) => {
    if (imported.loads) setLoads(imported.loads);
    if (imported.drivers) setDrivers(imported.drivers);
    if (imported.brokers) setBrokers(imported.brokers);
    if (imported.expenses) setExpenses(imported.expenses);
    logAudit('RESTORE', 'SYSTEM', 'Imported & Restored Backup', `Loads: ${imported.loads?.length || 0}, Drivers: ${imported.drivers?.length || 0}, Brokers: ${imported.brokers?.length || 0}, Expenses: ${imported.expenses?.length || 0}`);
    setToast({
      id: Date.now().toString(),
      message: 'System backup imported and restored successfully!'
    });
  };

  const driversList = drivers.map(d => d.name);
  const brokersList = brokers.map(b => b.name);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-300 flex flex-col font-sans antialiased selection:bg-orange-500 selection:text-white">
      {/* App Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loads={loads}
        driversCount={drivers.length}
        onOpenAddModal={handleOpenAddModal}
        onDownloadExcel={handleDirectExcelDownload}
        onOpenDownloadModal={() => setIsDownloadOpen(true)}
        onOpenPrintModal={() => {
          if (loads.length > 0) {
            setPrintableLoad(loads[0]);
            setIsPrintOpen(true);
          }
        }}
        onResetTemplate={handleResetToDefaults}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenQRCodeModal={() => setIsQRCodeOpen(true)}
        deferredPrompt={deferredPrompt}
        isStandalone={isStandalone}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* PWA Promotion Notice (dismissible if installed or hidden) */}
        {!isStandalone && showInstallBanner && (
          <div className="mb-4 bg-gradient-to-r from-orange-950/40 via-zinc-900/70 to-[#121214] border border-orange-500/30 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500/20 text-orange-400 p-2 rounded-lg shrink-0 border border-orange-500/30">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-zinc-100">
                    Install Sound Minded Dispatching App
                  </h3>
                  <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/40 px-1.5 py-0.2 rounded font-mono">
                    PWA Offline-Ready
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Full standalone app with instant offline sync, home screen icon, and fast mobile dispatching.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                id="btn-banner-qr-code"
                onClick={() => setIsQRCodeOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-orange-300 border border-orange-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Scan QR Code to open on phone"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code</span>
              </button>
              <button
                id="btn-banner-install-now"
                onClick={() => setIsInstallModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 text-white shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Master Scheduler Sheet View */}
        {activeTab === 'scheduler' && (
          <LoadSchedulerTable
            loads={loads}
            onEditLoad={handleEditLoad}
            onDuplicateLoad={handleDuplicateLoad}
            onDeleteLoad={handleDeleteLoad}
            onBulkDeleteLoads={handleBulkDeleteLoads}
            onClearAllLoads={handleClearAllLoads}
            onUpdateStatus={handleUpdateStatus}
            onPrintLoad={handlePrintLoad}
            onOpenAddModal={handleOpenAddModal}
            driversList={driversList}
            brokersList={brokersList}
            subSheetView="master"
            onSelectSubSheet={(sheet) => {
              if (sheet === 'active') setActiveTab('active-dispatches');
              else if (sheet === 'delivered') setActiveTab('delivered-settlement');
              else setActiveTab('scheduler');
            }}
            onQuickUpdateLoad={handleQuickUpdateLoad}
            onNavigateToFleet={() => setActiveTab('drivers')}
          />
        )}

        {/* Active Dispatches & In-Transit Sub-Sheet */}
        {activeTab === 'active-dispatches' && (
          <LoadSchedulerTable
            loads={loads}
            onEditLoad={handleEditLoad}
            onDuplicateLoad={handleDuplicateLoad}
            onDeleteLoad={handleDeleteLoad}
            onBulkDeleteLoads={handleBulkDeleteLoads}
            onClearAllLoads={handleClearAllLoads}
            onUpdateStatus={handleUpdateStatus}
            onPrintLoad={handlePrintLoad}
            onOpenAddModal={handleOpenAddModal}
            driversList={driversList}
            brokersList={brokersList}
            subSheetView="active"
            onSelectSubSheet={(sheet) => {
              if (sheet === 'active') setActiveTab('active-dispatches');
              else if (sheet === 'delivered') setActiveTab('delivered-settlement');
              else setActiveTab('scheduler');
            }}
            onQuickUpdateLoad={handleQuickUpdateLoad}
            onNavigateToFleet={() => setActiveTab('drivers')}
          />
        )}

        {/* Delivered, Invoicing & Settlement Sub-Sheet */}
        {activeTab === 'delivered-settlement' && (
          <LoadSchedulerTable
            loads={loads}
            onEditLoad={handleEditLoad}
            onDuplicateLoad={handleDuplicateLoad}
            onDeleteLoad={handleDeleteLoad}
            onBulkDeleteLoads={handleBulkDeleteLoads}
            onClearAllLoads={handleClearAllLoads}
            onUpdateStatus={handleUpdateStatus}
            onPrintLoad={handlePrintLoad}
            onOpenAddModal={handleOpenAddModal}
            driversList={driversList}
            brokersList={brokersList}
            subSheetView="delivered"
            onSelectSubSheet={(sheet) => {
              if (sheet === 'active') setActiveTab('active-dispatches');
              else if (sheet === 'delivered') setActiveTab('delivered-settlement');
              else setActiveTab('scheduler');
            }}
            onQuickUpdateLoad={handleQuickUpdateLoad}
            onNavigateToFleet={() => setActiveTab('drivers')}
          />
        )}

        {activeTab === 'calendar' && (
          <DispatchCalendar
            loads={loads}
            drivers={drivers}
            onSelectLoad={handleEditLoad}
            onAddLoadOnDate={handleAddLoadOnDate}
          />
        )}

        {activeTab === 'drivers' && (
          <FleetManager
            drivers={drivers}
            onAddDriver={handleAddDriver}
            onUpdateDriver={handleUpdateDriver}
            onDeleteDriver={handleDeleteDriver}
          />
        )}

        {activeTab === 'brokers' && (
          <BrokersDirectory
            brokers={brokers}
            onAddBroker={handleAddBroker}
            onUpdateBroker={handleUpdateBroker}
            onDeleteBroker={handleDeleteBroker}
          />
        )}

        {activeTab === 'financials' && (
          <FinancialDashboard
            loads={loads}
            drivers={drivers}
            onSelectLoad={handleEditLoad}
            onQuickUpdatePaymentStatus={(loadId, status) => handleQuickUpdateLoad(loadId, { paymentStatus: status })}
          />
        )}

        {activeTab === 'ifta' && (
          <IftaExpenseLog
            expenses={expenses}
            drivers={drivers}
            loads={loads}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onUpdateExpense={handleUpdateExpense}
          />
        )}

        {activeTab === 'qrcode' && (
          <QRCodeTab
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
          />
        )}

        {activeTab === 'setup' && (
          <DataSetupModal
            onResetToDefaults={handleResetToDefaults}
            onClearAllLoads={handleClearAllLoads}
            onClearAllData={handleClearAllData}
            onDownloadExcel={handleDirectExcelDownload}
          />
        )}
      </main>

      {/* Add / Edit Load Modal */}
      <AddEditLoadModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleSaveLoad}
        onDelete={handleDeleteLoad}
        editingLoad={editingLoad}
        drivers={drivers}
        brokers={brokers}
      />

      {/* Download Export Hub Modal */}
      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        loads={loads}
        onDownloadExcel={handleDirectExcelDownload}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenQRCodeModal={() => setIsQRCodeOpen(true)}
      />

      {/* Printable Driver Rate Confirmation / BOL Sheet */}
      <PrintableLoadSheet
        load={printableLoad}
        onClose={() => setIsPrintOpen(false)}
      />

      {/* Install App Modal (PC, iPhone & Android) */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        isStandalone={isStandalone}
        onTriggerInstall={handleTriggerInstall}
        onOpenQRCodeModal={() => setIsQRCodeOpen(true)}
      />

      {/* Standalone Universal QR Code Generator & Poster Modal */}
      <QRCodeModal
        isOpen={isQRCodeOpen}
        onClose={() => setIsQRCodeOpen(false)}
        defaultUrl={getAppBaseUrl()}
      />

      {/* Intentional Deletion Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={deleteModal.onConfirm}
        title={deleteModal.title}
        message={deleteModal.message}
        itemName={deleteModal.itemName}
        itemDetails={deleteModal.itemDetails}
        confirmButtonText={deleteModal.confirmButtonText}
        isDangerous={deleteModal.isDangerous}
      />

      {/* Admin Authentication & PIN Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Admin Control Center & Audit Trail Modal */}
      <AdminControlCenterModal
        isOpen={isControlModalOpen}
        onClose={() => setIsControlModalOpen(false)}
        allData={{ loads, drivers, brokers, expenses }}
        onImportData={handleImportAllData}
      />

      {/* Undo Toast Notification */}
      {toast && (
        <UndoToast
          toast={toast}
          onClose={() => setToast(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-[#0E0E10] border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Trucking Dispatch Load Scheduler &bull; Compatible with Microsoft Excel &amp; Google Sheets
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            {canEdit ? (
              <button
                onClick={() => setIsControlModalOpen(true)}
                className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Hub: {adminUser?.name || 'Super Admin'}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-zinc-400 hover:text-orange-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Access</span>
              </button>
            )}
            <span>&bull;</span>
            <button
              onClick={() => setIsQRCodeOpen(true)}
              className="text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Direct QR Code</span>
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Laptop className="w-3.5 h-3.5" />
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install on PC / Phone</span>
            </button>
            <span>&bull;</span>
            <span>Sound Minded Dispatching, LLC</span>
            <span>&bull;</span>
            <button
              onClick={handleDirectExcelDownload}
              className="text-orange-400 hover:text-orange-300 hover:underline font-medium cursor-pointer"
            >
              Export .XLSX
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated } = useAdmin();

  if (!isAuthenticated) {
    return <AdminPortalLogin />;
  }

  return <AppContent />;
}

export default function App() {
  return (
    <AdminProvider>
      <AuthenticatedApp />
    </AdminProvider>
  );
}
