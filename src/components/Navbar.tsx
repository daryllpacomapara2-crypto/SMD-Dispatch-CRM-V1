import React from 'react';
import { Logo } from './Logo';
import { ActiveTab, DispatchLoad, FleetDriver } from '../types/dispatch';
import { SyncStatusBadge } from './SyncStatusBadge';
import { PortalThemeDropdown } from './PortalThemeDropdown';
import {
  FileSpreadsheet,
  Truck,
  CheckCircle2,
  Users,
  BarChart3,
  Calculator,
  Plus,
  UserPlus,
  Download,
  FileText,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewLoadModal: () => void;
  onOpenNewDriverModal: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  totalLoadsCount: number;
  activeLoadsCount: number;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  lastSyncTime: string;
  isSaving: boolean;
  loads: DispatchLoad[];
  drivers: FleetDriver[];
  onForceSync: () => void;
  onRestoreBackup: (imported: { loads?: DispatchLoad[]; drivers?: FleetDriver[] }) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewLoadModal,
  onOpenNewDriverModal,
  onExportExcel,
  onExportCSV,
  onResetData,
  totalLoadsCount,
  activeLoadsCount,
  isAdmin,
  onToggleAdmin,
  lastSyncTime,
  isSaving,
  loads,
  drivers,
  onForceSync,
  onRestoreBackup,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-950/95 backdrop-blur-md border-b border-stone-800 shadow-md">
      {/* Top Header Bar */}
      <div className="max-w-[1700px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Slogan */}
        <div className="flex items-center gap-4">
          <Logo size="md" />
          <div className="hidden sm:block pl-4 border-l border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                Active Dispatch Portal
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-mono">
              TMS Dispatch & Excel Engine • {activeLoadsCount} In Transit
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Portal Theme Dropdown Button (Light / Dark) */}
          <PortalThemeDropdown />

          {/* Live Real-time Auto-Sync Status Badge */}
          <SyncStatusBadge
            lastSyncTime={lastSyncTime}
            isSaving={isSaving}
            loads={loads}
            drivers={drivers}
            onForceSync={onForceSync}
            onRestoreBackup={onRestoreBackup}
          />

          {/* Admin Mode Badge & Toggle */}
          <button
            onClick={onToggleAdmin}
            title={isAdmin ? 'Admin Mode Active: Full Add, Edit & Delete access' : 'Click to unlock Admin Mode'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isAdmin
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
                : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-amber-400 hover:border-amber-500/40'
            }`}
          >
            {isAdmin ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Admin Mode:</span>
                <span className="text-emerald-400 font-mono">ON</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-stone-500" />
                <span>Read-Only</span>
              </>
            )}
          </button>

          {/* Quick Reset Sample Data */}
          <button
            onClick={onResetData}
            title="Reset to default sample loads"
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-900 border border-stone-800 rounded-lg text-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Export to CSV / Google Sheets */}
          <button
            onClick={onExportCSV}
            title="Export CSV for Google Sheets"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 rounded-lg text-xs font-medium transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>CSV / Sheets</span>
          </button>

          {/* Export to Excel (.xlsx) */}
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download Excel</span>
          </button>

          {/* New Driver Button (Admin) */}
          {isAdmin && (
            <button
              onClick={onOpenNewDriverModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-amber-400 border border-stone-700/80 rounded-lg text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>+ Driver</span>
            </button>
          )}

          {/* New Load Button */}
          {isAdmin && (
            <button
              onClick={onOpenNewLoadModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Load</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-[1700px] mx-auto px-4 border-t border-stone-850">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('master_sheet')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'master_sheet'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Master Schedule Sheet</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-800 text-stone-300 font-mono">
              {totalLoadsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('active_loads')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'active_loads'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Active Dispatches & Loads In-Transit</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold">
              {activeLoadsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('delivered_invoiced')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'delivered_invoiced'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Delivered Loads, Invoicing & Settlement</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet_roster')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'fleet_roster'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Fleet & Driver Roster</span>
          </button>

          <button
            onClick={() => setActiveTab('rate_analytics')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'rate_analytics'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Rate Analytics & RPM</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'calculator'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Rate & Fuel Calculator</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
