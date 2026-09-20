import React from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Plus, 
  Calendar, 
  Users, 
  Building2, 
  BarChart3, 
  Fuel, 
  SlidersHorizontal,
  FileText,
  Truck,
  DollarSign,
  TrendingUp,
  MapPin,
  Sparkles,
  Smartphone,
  Laptop,
  QrCode,
  ShieldCheck,
  Lock,
  LogOut
} from 'lucide-react';
import { LoadItem } from '../types';
import { SoundMindedLogo } from './SoundMindedLogo';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { ThemePortal } from './ThemePortal';
import { useAdmin } from '../context/AdminContext';
import companyLogoPng from '../assets/images/regenerated_image_1788645584950.png';
import companyLogoJpg from '../assets/images/regenerated_image_1788645276060.jpg';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  loads: LoadItem[];
  driversCount?: number;
  onOpenAddModal: () => void;
  onDownloadExcel: () => void;
  onOpenDownloadModal: () => void;
  onOpenPrintModal: () => void;
  onResetTemplate: () => void;
  onOpenInstallModal: () => void;
  onOpenQRCodeModal: () => void;
  deferredPrompt?: any;
  isStandalone?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  loads,
  driversCount = 0,
  onOpenAddModal,
  onDownloadExcel,
  onOpenDownloadModal,
  onOpenPrintModal,
  onResetTemplate,
  onOpenInstallModal,
  onOpenQRCodeModal,
  deferredPrompt,
  isStandalone
}) => {
  const { adminUser, canEdit, setIsLoginModalOpen, setIsControlModalOpen, checkPermissionOrPrompt, logout } = useAdmin();

  const totalRevenue = loads.reduce((acc, l) => acc + l.totalGross, 0);
  const totalMiles = loads.reduce((acc, l) => acc + l.totalMiles, 0);
  const avgRPM = totalMiles > 0 ? (totalRevenue / totalMiles) : 0;
  const activeLoadsCount = loads.filter(l => 
    ['Booked', 'Dispatched', 'Arrived Pickup', 'Loaded', 'In Transit', 'Arrived Delivery'].includes(l.status)
  ).length;
  const deliveredSettledCount = loads.filter(l => 
    ['Delivered', 'Invoiced', 'Paid'].includes(l.status)
  ).length;
  const totalNet = loads.reduce((acc, l) => acc + l.netProfit, 0);
  const avgMargin = totalRevenue > 0 ? ((totalNet / totalRevenue) * 100) : 0;

  const tabs = [
    { id: 'scheduler', label: 'Master Schedule Sheet', icon: FileSpreadsheet, count: loads.length },
    { id: 'active-dispatches', label: 'Active Dispatches & Loads In-Transit', icon: Truck, count: activeLoadsCount },
    { id: 'delivered-settlement', label: 'Delivered Loads, Invoicing & Settlement', icon: DollarSign, count: deliveredSettledCount },
    { id: 'drivers', label: 'Fleet & Driver Roster', icon: Users, count: driversCount },
    { id: 'calendar', label: 'Dispatch Calendar', icon: Calendar },
    { id: 'brokers', label: 'Brokers Directory', icon: Building2 },
    { id: 'financials', label: 'Financial & KPIs', icon: BarChart3 },
    { id: 'ifta', label: 'IFTA & Fuel Log', icon: Fuel },
    { id: 'qrcode', label: 'QR Code & Mobile', icon: QrCode },
    { id: 'setup', label: 'Data Setup', icon: SlidersHorizontal }
  ];

  const handleAddClick = () => {
    checkPermissionOrPrompt(onOpenAddModal, 'Admin authorization is required to book and add loads.');
  };

  return (
    <header className="bg-[#0E0E10] text-white border-b border-zinc-800 sticky top-0 z-30 shadow-lg">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shadow-md border border-zinc-700/80 bg-zinc-900 shrink-0 bg-cover bg-center flex items-center justify-center p-1"
            style={{ backgroundImage: `url(${companyLogoJpg})` }}
          >
            <img
              src={companyLogoPng}
              alt="Sound Minded Dispatching, LLC Logo"
              className="w-full h-full object-contain drop-shadow"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800/60">
                Sound Minded Dispatching, LLC
              </span>
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-400" /> Excel &amp; Google Sheets Duplicate
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
              Trucking Dispatch Load Scheduler
            </h1>
          </div>
        </div>

        {/* Global Quick Action Buttons & Auto-Save Indicator */}
        <div className="flex flex-wrap items-center gap-2.5">
          <ThemePortal />
          <AutoSaveIndicator />

          {/* Admin Status Pill & Lock & Exit to Login Portal */}
          <div className="flex items-center gap-1.5">
            {canEdit ? (
              <button
                id="btn-admin-status-badge"
                onClick={() => setIsControlModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-700/80 shadow-xs transition-all cursor-pointer group"
                title="Admin Authorized. Click to open Audit Trail, Roles, and Backup Hub"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Admin:</span>
                <span className="font-bold max-w-[120px] truncate">{adminUser?.name || 'Super Admin'}</span>
              </button>
            ) : (
              <button
                id="btn-admin-login-trigger"
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 shadow-xs transition-all cursor-pointer group"
                title="Click to authenticate as Admin for Add/Edit/Delete permissions"
              >
                <Lock className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
                <span>Admin Login</span>
              </button>
            )}

            <button
              id="btn-header-admin-logout"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-zinc-300 hover:text-red-400 rounded-lg bg-zinc-800/90 hover:bg-zinc-800 border border-zinc-700 shadow-xs transition-colors cursor-pointer"
              title="Lock CRM & Return to SMD Dispatch CRM Login Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-400" />
              <span className="hidden sm:inline">Lock & Exit</span>
            </button>
          </div>

          <button
            id="btn-qr-code-header"
            onClick={onOpenQRCodeModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-orange-300 hover:text-orange-200 border border-orange-500/40 hover:border-orange-500 shadow-sm transition-all cursor-pointer group"
            title="Generate & scan QR Code for instant phone access"
          >
            <QrCode className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
            <span>QR Code</span>
          </button>

          <button
            id="btn-install-app-header"
            onClick={onOpenInstallModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md shadow-orange-950/40 border border-orange-400/30 transition-all cursor-pointer group"
            title="Install Sound Minded Dispatching on your PC or Phone"
          >
            <div className="flex items-center -space-x-1 text-orange-200 group-hover:text-white">
              <Laptop className="w-4 h-4" />
              <Smartphone className="w-3.5 h-3.5" />
            </div>
            <span>Install App</span>
            {deferredPrompt && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </button>

          <button
            id="btn-add-load"
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Load</span>
          </button>

          <button
            id="btn-download-excel-direct"
            onClick={onDownloadExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer"
            title="Instant multi-sheet formatted Excel (.xlsx) file with live formulas"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel (.xlsx)</span>
          </button>

          <button
            id="btn-open-export-hub"
            onClick={onOpenDownloadModal}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-zinc-400" />
            <span className="hidden sm:inline">Export Options / Sheets</span>
          </button>

          <button
            id="btn-print-bol-sheet"
            onClick={onOpenPrintModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
            title="Print Rate Confirmation or Driver Trip Sheet"
          >
            <FileText className="w-4 h-4 text-zinc-400" />
            <span className="hidden sm:inline">Print BOL</span>
          </button>
        </div>
      </div>

      {/* Real-time KPI Ribbon */}
      <div className="bg-[#18181b]/90 border-t border-b border-zinc-800/80 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2 bg-[#141417] px-3 py-1.5 rounded-lg border border-zinc-800">
            <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-zinc-400 block text-[11px]">Total Gross Revenue</span>
              <span className="text-white font-bold">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-[#141417] px-3 py-1.5 rounded-lg border border-zinc-800">
            <TrendingUp className="w-4 h-4 text-orange-400 shrink-0" />
            <div>
              <span className="text-zinc-400 block text-[11px]">Avg Rate / Mile</span>
              <span className="text-white font-bold">${avgRPM.toFixed(2)}/mi</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-[#141417] px-3 py-1.5 rounded-lg border border-zinc-800">
            <Truck className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-zinc-400 block text-[11px]">Active Loads</span>
              <span className="text-white font-bold">{activeLoadsCount} of {loads.length}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-[#141417] px-3 py-1.5 rounded-lg border border-zinc-800">
            <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-zinc-400 block text-[11px]">Total Fleet Miles</span>
              <span className="text-white font-bold">{totalMiles.toLocaleString()} mi</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-[#141417] px-3 py-1.5 rounded-lg border border-zinc-800">
            <DollarSign className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-zinc-400 block text-[11px]">Net Profit</span>
              <span className="text-white font-bold">${totalNet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-[#141417] px-3 py-1.5 rounded-lg border border-zinc-800">
            <BarChart3 className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="text-zinc-400 block text-[11px]">Avg Net Margin</span>
              <span className="text-white font-bold">{avgMargin.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none" aria-label="Tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-medium rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-orange-500 text-orange-400 bg-zinc-800/60 font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-orange-950/80 text-orange-300 border border-orange-800/60' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
