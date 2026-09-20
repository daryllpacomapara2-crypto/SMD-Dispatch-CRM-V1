import React, { useState, useEffect, useRef } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  Database,
  Cloud,
  Download,
  Upload,
  Clock,
  Sparkles,
  ChevronDown,
  Layers,
  Truck,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { SyncLogEntry, syncManager } from '../utils/syncManager';
import { DispatchLoad, FleetDriver } from '../types/dispatch';

interface SyncStatusBadgeProps {
  lastSyncTime: string;
  isSaving: boolean;
  loads: DispatchLoad[];
  drivers: FleetDriver[];
  onForceSync: () => void;
  onRestoreBackup: (imported: { loads?: DispatchLoad[]; drivers?: FleetDriver[] }) => void;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  lastSyncTime,
  isSaving,
  loads,
  drivers,
  onForceSync,
  onRestoreBackup,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refresh logs when opening
  useEffect(() => {
    if (isOpen) {
      setSyncLogs(syncManager.getSyncLogs());
    }
  }, [isOpen, lastSyncTime]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle file import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = syncManager.parseBackupJSON(content);
        if (parsed) {
          onRestoreBackup(parsed);
          setIsOpen(false);
        } else {
          alert('Invalid backup JSON file format. Please upload a valid SMD CRM backup.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset input
  };

  const getSourceBadge = (source: SyncLogEntry['source']) => {
    switch (source) {
      case 'Master Schedule':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Active Dispatches':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'Delivered & Invoicing':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Fleet Roster':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      default:
        return 'bg-stone-800 text-stone-300 border-stone-700';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Auto-Sync Status & Storage Manager"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
          isSaving
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
            : 'bg-stone-900/90 hover:bg-stone-850 text-stone-300 border-stone-800 hover:border-stone-700'
        }`}
      >
        {isSaving ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span className="font-semibold text-amber-400">Auto-Saving...</span>
          </>
        ) : (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">Auto-Synced</span>
            <span className="hidden sm:inline text-stone-500 text-[10px]">•</span>
            <span className="hidden sm:inline text-stone-400 text-[10px]">{lastSyncTime || 'Active'}</span>
            <ChevronDown className="w-3 h-3 text-stone-500 ml-0.5" />
          </>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-stone-900 border border-stone-750 rounded-xl shadow-2xl z-50 overflow-hidden text-xs animate-fadeIn">
          {/* Header */}
          <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-stone-100 text-xs flex items-center gap-1.5">
                  <span>CRM Real-Time Auto-Sync</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-bold">
                    LIVE
                  </span>
                </h4>
                <p className="text-[10px] text-stone-400">Persistent cross-tab synchronization active</p>
              </div>
            </div>

            <button
              onClick={onForceSync}
              title="Force Sync"
              className="p-1.5 text-stone-400 hover:text-amber-400 hover:bg-stone-850 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-[10px]">Sync</span>
            </button>
          </div>

          {/* Sync Stats Bar */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-stone-950/60 border-b border-stone-800/80 font-mono text-[11px]">
            <div className="bg-stone-900/90 border border-stone-800 p-2 rounded-lg">
              <div className="text-[10px] text-stone-500 uppercase">Synchronized Loads</div>
              <div className="font-bold text-amber-400 text-sm">{loads.length} Records</div>
            </div>
            <div className="bg-stone-900/90 border border-stone-800 p-2 rounded-lg">
              <div className="text-[10px] text-stone-500 uppercase">Fleet Drivers</div>
              <div className="font-bold text-emerald-400 text-sm">{drivers.length} Units</div>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-3 text-[11px] text-stone-400 border-b border-stone-800/80 bg-stone-900/40 leading-relaxed">
            <p className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                All edits in <strong className="text-stone-200">Master Schedule</strong>,{' '}
                <strong className="text-stone-200">Active Dispatches</strong>,{' '}
                <strong className="text-stone-200">Delivered Loads</strong>, and{' '}
                <strong className="text-stone-200">Fleet Roster</strong> auto-save instantly to storage and
                sync across all browser tabs.
              </span>
            </p>
          </div>

          {/* Recent Auto-Save Activity Log */}
          <div className="p-3">
            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-300 mb-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Recent Auto-Save History</span>
              </div>
              <span className="text-[10px] text-stone-500 font-mono">
                {lastSyncTime ? `Last: ${lastSyncTime}` : 'Live'}
              </span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-700">
              {syncLogs.length === 0 ? (
                <div className="text-center py-4 text-[11px] text-stone-500 font-mono">
                  All systems synced. No recent pending operations.
                </div>
              ) : (
                syncLogs.slice(0, 7).map((log) => (
                  <div
                    key={log.id}
                    className="p-1.5 bg-stone-950/70 border border-stone-800/80 rounded-lg flex items-start justify-between gap-2 text-[10px]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`px-1.5 py-0.2 rounded border text-[9px] font-semibold uppercase ${getSourceBadge(
                            log.source
                          )}`}
                        >
                          {log.source}
                        </span>
                        <span className="text-stone-500 font-mono">{log.timestamp}</span>
                      </div>
                      <p className="text-stone-300 truncate font-mono">{log.action}</p>
                    </div>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-1" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Backup & Export Actions */}
          <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-2">
            <button
              onClick={() => syncManager.exportBackupJSON(loads, drivers)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 rounded-lg text-[11px] font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export JSON Backup</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 rounded-lg text-[11px] font-medium transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Restore Backup</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
};
