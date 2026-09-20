import { DispatchLoad, FleetDriver } from '../types/dispatch';

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  source: 'Master Schedule' | 'Active Dispatches' | 'Delivered & Invoicing' | 'Fleet Roster' | 'System';
  action: string;
  status: 'saved' | 'synced' | 'error';
}

export interface SyncState {
  isAutoSyncEnabled: boolean;
  lastSyncedAt: string | null;
  syncStatus: 'idle' | 'saving' | 'synced' | 'error';
  recentLogs: SyncLogEntry[];
}

const SYNC_CHANNEL_NAME = 'smd_crm_broadcast_channel_v1';
const LOADS_KEY = 'sound_minded_dispatch_loads';
const DRIVERS_KEY = 'sound_minded_fleet_drivers';
const SYNC_LOG_KEY = 'sound_minded_sync_logs';

class SyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Array<(payload: { type: string; data?: any }) => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported or blocked in this context', e);
      }
    }
  }

  // Subscribe to external sync events (from other tabs/windows)
  public subscribe(callback: (payload: { type: string; data?: any }) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(payload: { type: string; data?: any }) {
    this.listeners.forEach((cb) => {
      try {
        cb(payload);
      } catch (err) {
        console.error('Error in sync listener', err);
      }
    });
  }

  // Broadcast to other tabs
  public broadcast(type: string, data?: any) {
    if (this.channel) {
      try {
        this.channel.postMessage({ type, data, timestamp: new Date().toISOString() });
      } catch (e) {
        console.error('Error broadcasting sync event', e);
      }
    }
  }

  // Save Loads with automatic broadcast
  public saveLoads(
    loads: DispatchLoad[],
    source: SyncLogEntry['source'] = 'Master Schedule',
    actionDescription?: string
  ): boolean {
    try {
      localStorage.setItem(LOADS_KEY, JSON.stringify(loads));
      this.broadcast('LOADS_UPDATED', loads);
      if (actionDescription) {
        this.addSyncLog(source, actionDescription);
      }
      return true;
    } catch (e) {
      console.error('Failed to auto-save loads to storage', e);
      return false;
    }
  }

  // Save Drivers with automatic broadcast
  public saveDrivers(
    drivers: FleetDriver[],
    source: SyncLogEntry['source'] = 'Fleet Roster',
    actionDescription?: string
  ): boolean {
    try {
      localStorage.setItem(DRIVERS_KEY, JSON.stringify(drivers));
      this.broadcast('DRIVERS_UPDATED', drivers);
      if (actionDescription) {
        this.addSyncLog(source, actionDescription);
      }
      return true;
    } catch (e) {
      console.error('Failed to auto-save drivers to storage', e);
      return false;
    }
  }

  // Log auto-save activity
  public addSyncLog(source: SyncLogEntry['source'], action: string) {
    try {
      const logs = this.getSyncLogs();
      const newEntry: SyncLogEntry = {
        id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        source,
        action,
        status: 'synced',
      };
      const updated = [newEntry, ...logs.slice(0, 19)]; // keep 20 most recent
      localStorage.setItem(SYNC_LOG_KEY, JSON.stringify(updated));
    } catch (e) {
      // silently ignore log storage quota
    }
  }

  public getSyncLogs(): SyncLogEntry[] {
    try {
      const saved = localStorage.getItem(SYNC_LOG_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  }

  // Export full CRM database backup
  public exportBackupJSON(loads: DispatchLoad[], drivers: FleetDriver[]) {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: 'Sound Minded Dispatching, LLC CRM',
      totalLoads: loads.length,
      totalDrivers: drivers.length,
      loads,
      drivers,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('download', `SMD_Dispatch_Backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // Parse imported backup JSON
  public parseBackupJSON(jsonString: string): { loads?: DispatchLoad[]; drivers?: FleetDriver[] } | null {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && (Array.isArray(parsed.loads) || Array.isArray(parsed.drivers))) {
        return {
          loads: Array.isArray(parsed.loads) ? parsed.loads : undefined,
          drivers: Array.isArray(parsed.drivers) ? parsed.drivers : undefined,
        };
      }
    } catch (e) {
      console.error('Invalid backup JSON format', e);
    }
    return null;
  }
}

export const syncManager = new SyncManager();
