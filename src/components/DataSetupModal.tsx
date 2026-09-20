import React from 'react';
import { 
  SlidersHorizontal, 
  Check, 
  FileSpreadsheet, 
  RotateCcw, 
  Trash2, 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  KeyRound, 
  ExternalLink,
  History
} from 'lucide-react';
import { STATUS_OPTIONS, EQUIPMENT_OPTIONS, PAYMENT_TERMS_OPTIONS, US_STATES } from '../types';
import { useAdmin } from '../context/AdminContext';

interface DataSetupModalProps {
  onResetToDefaults: () => void;
  onClearAllLoads?: () => void;
  onClearAllData?: () => void;
  onDownloadExcel: () => void;
}

export const DataSetupModal: React.FC<DataSetupModalProps> = ({
  onResetToDefaults,
  onClearAllLoads,
  onClearAllData,
  onDownloadExcel
}) => {
  const { adminUser, isAdmin, canEdit, setIsLoginModalOpen, setIsControlModalOpen, checkPermissionOrPrompt } = useAdmin();

  const handleProtectedClearLoads = () => {
    checkPermissionOrPrompt(() => {
      if (onClearAllLoads) onClearAllLoads();
    }, 'Admin authorization is required to clear all loads.');
  };

  const handleProtectedClearAllData = () => {
    checkPermissionOrPrompt(() => {
      if (onClearAllData) onClearAllData();
    }, 'Admin authorization is required to wipe application data.');
  };

  const handleProtectedReset = () => {
    checkPermissionOrPrompt(() => {
      onResetToDefaults();
    }, 'Admin authorization is required to reset demo data.');
  };

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Header */}
      <div className="bg-[#121214] rounded-xl shadow-xs border border-zinc-800/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-500/10 text-orange-400 p-2.5 rounded-lg border border-orange-500/20">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100">System Setup &amp; Admin Lookup Lists</h2>
            <p className="text-xs text-zinc-400">
              Reference lists for Excel validation dropdowns, status stages, and equipment specs
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onClearAllLoads && (
            <button
              id="btn-setup-clear-loads"
              onClick={handleProtectedClearLoads}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/80 transition-colors cursor-pointer"
              title="Empty the dispatch load schedule"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Loads</span>
            </button>
          )}
          {onClearAllData && (
            <button
              id="btn-setup-clear-all-data"
              onClick={handleProtectedClearAllData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-700 transition-colors cursor-pointer"
              title="Delete all loads, drivers, brokers, and expenses to start completely fresh"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Wipe All Data</span>
            </button>
          )}
          <button
            id="btn-setup-reset-demo"
            onClick={handleProtectedReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
          <button
            id="btn-setup-download-excel"
            onClick={onDownloadExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Template (.XLSX)</span>
          </button>
        </div>
      </div>

      {/* Admin Authorization Status Card */}
      <div className="bg-[#121214] rounded-xl border border-zinc-800/80 p-5 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100">Administrator Security &amp; Access Control</h3>
                {canEdit ? (
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full font-bold">
                    Admin Active
                  </span>
                ) : (
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full font-bold">
                    Locked / Viewer Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Active Administrator: <strong className="text-zinc-200">{adminUser ? adminUser.email : 'daryllpacomapara2@gmail.com (Default)'}</strong> • Role: <span className="text-orange-400 font-semibold">{adminUser ? adminUser.role : 'Super Admin'}</span>
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Every Add, Edit, Update, and Delete operation across the entire scheduler is authenticated and tracked with instant timestamps.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-setup-open-control-center"
              onClick={() => setIsControlModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-500 text-white shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>Audit Trail &amp; Backup Hub</span>
            </button>
            <button
              id="btn-setup-toggle-login"
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-orange-400" />
              <span>{canEdit ? 'Switch / Lock Account' : 'Unlock Admin Mode'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lookup Grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Load Statuses */}
        <div className="bg-[#121214] p-4 rounded-xl border border-zinc-800/80 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Load Status Stages ({STATUS_OPTIONS.length})
          </h3>
          <div className="space-y-1.5">
            {STATUS_OPTIONS.map((st, i) => (
              <div key={st} className="flex items-center justify-between p-2 bg-[#18181b] border border-zinc-800 rounded-lg text-xs font-medium text-zinc-200">
                <span>{i + 1}. {st}</span>
                <span className="text-[10px] text-zinc-500 font-mono">Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment Types */}
        <div className="bg-[#121214] p-4 rounded-xl border border-zinc-800/80 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Equipment / Trailer Types ({EQUIPMENT_OPTIONS.length})
          </h3>
          <div className="space-y-1.5">
            {EQUIPMENT_OPTIONS.map(eq => (
              <div key={eq} className="flex items-center justify-between p-2 bg-[#18181b] border border-zinc-800 rounded-lg text-xs font-medium text-zinc-200">
                <span>{eq}</span>
                <span className="text-[10px] text-orange-400 font-mono">Standard</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Terms */}
        <div className="bg-[#121214] p-4 rounded-xl border border-zinc-800/80 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Payment Terms &amp; Options ({PAYMENT_TERMS_OPTIONS.length})
          </h3>
          <div className="space-y-1.5">
            {PAYMENT_TERMS_OPTIONS.map(pt => (
              <div key={pt} className="flex items-center justify-between p-2 bg-[#18181b] border border-zinc-800 rounded-lg text-xs font-medium text-zinc-200">
                <span>{pt}</span>
                <span className="text-[10px] text-emerald-400 font-mono">Enabled</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
