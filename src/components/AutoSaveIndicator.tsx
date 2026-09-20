import React, { useState, useEffect } from 'react';
import { useAutoSave } from '../utils/useAutoSave';
import { 
  CheckCircle2, 
  Loader2, 
  CloudOff, 
  Clock, 
  HardDrive, 
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react';

interface AutoSaveIndicatorProps {
  className?: string;
  variant?: 'header' | 'compact' | 'modal';
  showDetailsOnClick?: boolean;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  className = '',
  variant = 'header',
  showDetailsOnClick = true
}) => {
  const { 
    status, 
    statusText, 
    lastSavedTime, 
    isOnline, 
    offlineQueueCount, 
    saveNow, 
    lastError 
  } = useAutoSave();

  const [showPopover, setShowPopover] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string>('Just now');

  // Update relative time ago string periodically
  useEffect(() => {
    const updateRelativeTime = () => {
      if (!lastSavedTime) {
        setTimeAgo('Ready');
        return;
      }
      const seconds = Math.floor((Date.now() - lastSavedTime) / 1000);
      if (seconds < 5) {
        setTimeAgo('Just now');
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`);
      } else if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        setTimeAgo(`${mins}m ago`);
      } else {
        const d = new Date(lastSavedTime);
        setTimeAgo(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 5000);
    return () => clearInterval(interval);
  }, [lastSavedTime]);

  // Formatted exact time for tooltip
  const formattedExactTime = lastSavedTime 
    ? new Date(lastSavedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Not yet';

  // Render icons based on state
  const renderIcon = () => {
    switch (status) {
      case 'saving':
        return <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />;
      case 'unsaved':
        return <Clock className="w-3.5 h-3.5 text-amber-400/80 animate-pulse" />;
      case 'offline':
        return <CloudOff className="w-3.5 h-3.5 text-amber-400" />;
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
      case 'saved':
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  // Color theme classes
  const getBadgeStyle = () => {
    switch (status) {
      case 'saving':
        return 'bg-amber-950/40 border-amber-500/40 text-amber-300';
      case 'unsaved':
        return 'bg-zinc-800/80 border-zinc-700 text-zinc-300';
      case 'offline':
        return 'bg-orange-950/60 border-orange-500/50 text-orange-300';
      case 'error':
        return 'bg-rose-950/50 border-rose-500/40 text-rose-300';
      case 'saved':
      default:
        return 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300';
    }
  };

  if (variant === 'compact') {
    return (
      <div 
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${getBadgeStyle()} ${className}`}
        title={`Status: ${statusText} • Last saved: ${formattedExactTime}`}
      >
        {renderIcon()}
        <span>{statusText}</span>
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Discreet Trigger Pill */}
      <button
        type="button"
        id="autosave-status-indicator"
        onClick={() => showDetailsOnClick && setShowPopover(prev => !prev)}
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer select-none hover:bg-opacity-80 active:scale-95 ${getBadgeStyle()}`}
        title="Click to view auto-save status and sync options"
      >
        <div className="flex items-center gap-1.5">
          {renderIcon()}
          <span className="font-medium tracking-tight">
            {statusText}
          </span>
        </div>

        {status === 'saved' && (
          <span className="text-[10px] opacity-70 border-l border-emerald-500/30 pl-1.5 hidden sm:inline">
            {timeAgo}
          </span>
        )}

        {status === 'offline' && (
          <span className="text-[10px] px-1 bg-amber-500/20 rounded text-amber-300">
            LocalStorage
          </span>
        )}
      </button>

      {/* Popover Card */}
      {showPopover && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowPopover(false)} 
          />
          <div className="absolute right-0 mt-2 w-72 bg-[#18181B] border border-zinc-700/80 rounded-xl shadow-2xl p-4 z-50 text-xs text-zinc-300 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-1.5 font-bold text-zinc-100">
                <HardDrive className="w-4 h-4 text-orange-400" />
                <span>Auto-Save Engine</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isOnline ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {isOnline ? 'Online Sync' : 'Offline Mode'}
              </span>
            </div>

            <div className="space-y-2 text-zinc-400">
              <div className="flex justify-between items-center">
                <span>Current Status:</span>
                <span className="font-semibold text-zinc-200 flex items-center gap-1">
                  {renderIcon()} {statusText}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Last Autosave:</span>
                <span className="font-semibold text-zinc-200">{formattedExactTime}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Debounce Delay:</span>
                <span className="font-mono text-zinc-300">1.0s (Anti-Spam)</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Network Link:</span>
                <span className="flex items-center gap-1 font-semibold text-zinc-200">
                  {isOnline ? (
                    <><Wifi className="w-3 h-3 text-emerald-400" /> Connected</>
                  ) : (
                    <><WifiOff className="w-3 h-3 text-amber-400" /> Disconnected</>
                  )}
                </span>
              </div>

              {offlineQueueCount > 0 && (
                <div className="p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-amber-300 text-[11px]">
                  <strong>{offlineQueueCount}</strong> pending save(s) waiting to sync once network connection restores.
                </div>
              )}

              {lastError && (
                <div className="p-2 bg-rose-950/40 border border-rose-500/30 rounded-lg text-rose-300 text-[11px]">
                  {lastError}
                </div>
              )}

              {/* Explicit Synchronized Sheets Status */}
              <div className="p-2.5 bg-[#121214] border border-zinc-800 rounded-lg space-y-1.5">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Auto-Synced Sheets</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div className="flex items-center gap-1 text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="truncate" title="Master Schedule Sheet">Master Schedule</span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="truncate" title="Active Dispatches & In-Transit">Active Dispatches</span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="truncate" title="Delivered Loads, Invoicing & Settlement">Delivered & Billing</span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="truncate" title="Fleet & Driver Roster">Fleet Roster</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  saveNow();
                  setShowPopover(false);
                }}
                className="flex-1 py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-orange-400" />
                <span>Save Now</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPopover(false)}
                className="py-1.5 px-3 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
