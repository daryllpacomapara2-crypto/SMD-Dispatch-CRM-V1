import React from 'react';
import { ShieldCheck, ShieldAlert, Lock, Unlock, Plus, UserPlus, Database, CheckCircle2 } from 'lucide-react';

interface AdminControlBannerProps {
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onOpenNewLoad: () => void;
  onOpenNewDriver: () => void;
  userEmail?: string;
  totalLoads: number;
  totalDrivers: number;
}

export const AdminControlBanner: React.FC<AdminControlBannerProps> = ({
  isAdmin,
  onToggleAdmin,
  onOpenNewLoad,
  onOpenNewDriver,
  userEmail = 'dadathegreat1989@gmail.com',
  totalLoads,
  totalDrivers,
}) => {
  return (
    <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border-b border-amber-500/20 px-4 py-2 text-xs">
      <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Admin Status & User info */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${
              isAdmin
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}
          >
            {isAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Mode: FULL ACCESS</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Read-Only Viewer</span>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-stone-400 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-600" />
            <span>Admin Operator:</span>
            <span className="font-mono font-semibold text-stone-200">{userEmail}</span>
            <span className="text-stone-500">•</span>
            <span className="text-emerald-400 font-mono">Full CRUD (Add, Edit, Delete) Authorized</span>
            <span className="text-stone-500">•</span>
            <span className="flex items-center gap-1 text-amber-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Auto-Sync Active (4 Sheets)</span>
            </span>
          </div>
        </div>

        {/* Right: Actions & Toggle */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={onOpenNewLoad}
                className="flex items-center gap-1.5 px-3 py-1 bg-stone-800 hover:bg-stone-750 text-amber-400 hover:text-amber-300 border border-stone-700/80 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Load</span>
              </button>

              <button
                onClick={onOpenNewDriver}
                className="flex items-center gap-1.5 px-3 py-1 bg-stone-800 hover:bg-stone-750 text-amber-400 hover:text-amber-300 border border-stone-700/80 rounded-lg text-xs font-semibold transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Driver</span>
              </button>
            </>
          )}

          {/* Toggle Admin lock */}
          <button
            onClick={onToggleAdmin}
            title={isAdmin ? 'Switch to View-Only Mode' : 'Unlock Admin Controls'}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition-all ${
              isAdmin
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-800'
                : 'bg-amber-500 text-stone-950 font-bold border-amber-400 hover:bg-amber-400'
            }`}
          >
            {isAdmin ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Lock (Active)</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock Admin Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
