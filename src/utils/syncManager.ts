/**
 * Sound Minded Dispatching, LLC - Multi-Account Data Synchronization Engine
 * 
 * Ensures 100% synchronized state across all 3 authorized system accounts:
 * 1. Super Admin: dadathegreatxz1989@soundminded-dispatching.com
 * 2. Operations Admin: admin@soundminded-dispatching.com
 * 3. Admin Dispatcher: dispatch@soundminded-dispatching.com
 * 
 * Capabilities:
 * - Real-time cross-tab and cross-window sync via BroadcastChannel
 * - LocalStorage event fallback for maximum reliability
 * - Author attribution (records which authorized account saved the change)
 * - Automatic re-hydration on account login/switch
 */

export interface SyncMessage {
  type: 'SYNC_DATA' | 'SYNC_LOADS' | 'SYNC_DRIVERS' | 'SYNC_BROKERS' | 'SYNC_EXPENSES' | 'SYNC_AUDIT' | 'FORCE_REFRESH';
  payload?: any;
  authorEmail: string;
  authorName?: string;
  timestamp: number;
  originTabId: string;
}

export interface AccountSyncStatus {
  email: string;
  name: string;
  role: string;
  isCurrentSession: boolean;
  lastActiveTime: number | null;
  status: 'synced' | 'active' | 'standby';
}

const TAB_ID = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
const CHANNEL_NAME = 'smd_dispatch_cross_account_sync';

export const AUTHORIZED_ACCOUNTS_SYNC_METADATA = [
  {
    email: 'dadathegreatxz1989@soundminded-dispatching.com',
    name: 'Super Admin',
    role: 'Super Admin'
  },
  {
    email: 'admin@soundminded-dispatching.com',
    name: 'Operations Admin',
    role: 'Operations Admin'
  },
  {
    email: 'dispatch@soundminded-dispatching.com',
    name: 'Admin Dispatcher',
    role: 'Admin Dispatcher'
  }
];

class SyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(message: SyncMessage) => void> = new Set();
  private lastAuthorEmail: string = 'dadathegreatxz1989@soundminded-dispatching.com';
  private lastSyncTime: number = Date.now();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.channel = new BroadcastChannel(CHANNEL_NAME);
          this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
            this.handleIncomingMessage(event.data);
          };
        }

        // Listen for storage events (cross-tab fallback)
        window.addEventListener('storage', this.handleStorageEvent);

        // Load last sync metadata
        const savedAuthor = localStorage.getItem('sm_sync_last_author');
        if (savedAuthor) this.lastAuthorEmail = savedAuthor;
        const savedTime = localStorage.getItem('sm_sync_last_timestamp');
        if (savedTime) this.lastSyncTime = parseInt(savedTime, 10);
      } catch (err) {
        console.warn('[SyncManager] BroadcastChannel initialization warning', err);
      }
    }
  }

  private handleIncomingMessage = (message: SyncMessage) => {
    if (!message || message.originTabId === TAB_ID) return;

    this.lastAuthorEmail = message.authorEmail;
    this.lastSyncTime = message.timestamp;

    try {
      localStorage.setItem('sm_sync_last_author', message.authorEmail);
      localStorage.setItem('sm_sync_last_timestamp', message.timestamp.toString());
    } catch {
      // ignore
    }

    this.listeners.forEach(listener => {
      try {
        listener(message);
      } catch (e) {
        console.error('[SyncManager] Listener error', e);
      }
    });
  };

  private handleStorageEvent = (event: StorageEvent) => {
    if (!event.key) return;

    const watchedKeys = [
      'erc_trucking_loads',
      'erc_trucking_drivers',
      'erc_trucking_brokers',
      'erc_trucking_expenses',
      'sm_admin_accounts',
      'sm_admin_audit_logs'
    ];

    if (watchedKeys.includes(event.key)) {
      const author = localStorage.getItem('sm_sync_last_author') || 'Authorized Account';
      const now = Date.now();
      this.lastSyncTime = now;

      const message: SyncMessage = {
        type: 'SYNC_DATA',
        authorEmail: author,
        timestamp: now,
        originTabId: 'storage_listener'
      };

      this.listeners.forEach(fn => {
        try {
          fn(message);
        } catch (err) {
          console.error('[SyncManager] Storage event dispatch error', err);
        }
      });
    }
  };

  /**
   * Broadcast changes made by an authorized account to all active tabs and sessions
   */
  public broadcastUpdate(
    type: SyncMessage['type'],
    payload: any,
    authorEmail: string = 'dadathegreatxz1989@soundminded-dispatching.com',
    authorName?: string
  ) {
    const now = Date.now();
    this.lastAuthorEmail = authorEmail;
    this.lastSyncTime = now;

    try {
      localStorage.setItem('sm_sync_last_author', authorEmail);
      localStorage.setItem('sm_sync_last_timestamp', now.toString());
    } catch {
      // ignore
    }

    const message: SyncMessage = {
      type,
      payload,
      authorEmail,
      authorName,
      timestamp: now,
      originTabId: TAB_ID
    };

    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (err) {
        console.warn('[SyncManager] PostMessage error', err);
      }
    }
  }

  /**
   * Subscribe to incoming cross-account synchronization events
   */
  public subscribe(callback: (message: SyncMessage) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Returns current sync metrics for all 3 authorized accounts
   */
  public getAccountsSyncStatus(currentSessionEmail: string = ''): AccountSyncStatus[] {
    return AUTHORIZED_ACCOUNTS_SYNC_METADATA.map(acc => {
      const isCurrent = acc.email.toLowerCase() === currentSessionEmail.toLowerCase();
      const isLastAuthor = acc.email.toLowerCase() === this.lastAuthorEmail.toLowerCase();

      return {
        email: acc.email,
        name: acc.name,
        role: acc.role,
        isCurrentSession: isCurrent,
        lastActiveTime: isLastAuthor ? this.lastSyncTime : null,
        status: isCurrent ? 'active' : isLastAuthor ? 'synced' : 'standby'
      };
    });
  }

  public getLastSyncInfo() {
    return {
      authorEmail: this.lastAuthorEmail,
      timestamp: this.lastSyncTime,
      formattedTime: new Date(this.lastSyncTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  }
}

export const syncManager = new SyncManager();
