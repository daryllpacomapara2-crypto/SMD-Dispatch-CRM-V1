/**
 * Robust Universal Auto-Save Engine for Sound Minded Dispatching
 * 
 * Capabilities:
 * - Listens for 'input' and 'change' events across all form fields (input, textarea, select, contenteditable)
 * - Strict 1-second (1000ms) debounce delay to eliminate server spam
 * - Dual persistence: LocalStorage backup + /api/autosave endpoint
 * - Graceful network drop handling with offline queuing and auto-sync upon reconnection
 * - Page unload safety via immediate localStorage flush and navigator.sendBeacon
 * - Discreet state updates ('Saving...', 'All changes saved', 'Offline - Saved locally')
 */

import { syncManager } from './syncManager';

export type AutoSaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'offline' | 'error';

export interface FieldDraft {
  formId: string;
  fieldName: string;
  value: any;
  type: string;
  timestamp: number;
}

export interface AutoSavePayload {
  timestamp: number;
  fieldDrafts: Record<string, Record<string, FieldDraft>>;
  appData?: any;
  source?: string;
  authorEmail?: string;
  authorName?: string;
}

export interface AutoSaveState {
  status: AutoSaveStatus;
  statusText: string;
  lastSavedTime: number | null;
  pendingCount: number;
  isOnline: boolean;
  offlineQueueCount: number;
  lastError: string | null;
}

type Listener = (state: AutoSaveState) => void;
type DataProvider = () => any;

class AutoSaveService {
  private status: AutoSaveStatus = 'saved';
  private lastSavedTime: number | null = null;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private lastError: string | null = null;

  // Timers & Delays
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly DEBOUNCE_DELAY_MS = 1000; // 1-second debounce delay as requested
  private statusResetTimer: ReturnType<typeof setTimeout> | null = null;

  // Field drafts memory cache: formId -> (fieldName -> FieldDraft)
  private fieldDrafts: Record<string, Record<string, FieldDraft>> = {};
  private dirtyFieldCount = 0;

  // External data provider (e.g. loads, drivers, brokers, expenses)
  private dataProvider: DataProvider | null = null;

  // Active Authorized Account metadata
  private currentUserEmail: string = 'dadathegreatxz1989@soundminded-dispatching.com';
  private currentUserName: string = 'Super Admin';

  // Subscribed listeners
  private listeners: Set<Listener> = new Set();

  // Storage Keys
  private readonly STORAGE_DRAFTS_KEY = 'sm_autosave_field_drafts';
  private readonly STORAGE_OFFLINE_QUEUE_KEY = 'sm_autosave_offline_queue';
  private readonly STORAGE_LAST_SAVED_KEY = 'sm_autosave_last_saved_time';
  private readonly API_ENDPOINT = '/api/autosave';

  private isInitialized = false;

  constructor() {
    // Load previously saved timestamps and drafts from localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedTime = localStorage.getItem(this.STORAGE_LAST_SAVED_KEY);
        if (savedTime) {
          this.lastSavedTime = parseInt(savedTime, 10);
        }
        const savedDrafts = localStorage.getItem(this.STORAGE_DRAFTS_KEY);
        if (savedDrafts) {
          this.fieldDrafts = JSON.parse(savedDrafts);
        }
      } catch (e) {
        console.warn('[AutoSave] Could not hydrate initial cache', e);
      }
    }
  }

  /**
   * Initializes global DOM listeners, network listeners, and unload safety
   */
  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 1. Listen for input & change events across all form fields (with capture)
    document.addEventListener('input', this.handleUniversalInput, true);
    document.addEventListener('change', this.handleUniversalInput, true);

    // 2. Network connectivity detection
    window.addEventListener('online', this.handleNetworkOnline);
    window.addEventListener('offline', this.handleNetworkOffline);

    // 3. Tab visibility / Page unload protection
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.dirtyFieldCount > 0) {
        this.flushImmediate(false);
      }
    });

    // Check if there are queued offline saves from a previous session
    const queue = this.getOfflineQueue();
    if (queue.length > 0 && this.isOnline) {
      setTimeout(() => this.flushOfflineQueue(), 2000);
    }
  }

  /**
   * Register a callback that provides app-level state (loads, drivers, brokers, etc.)
   */
  public registerDataProvider(provider: DataProvider) {
    this.dataProvider = provider;
  }

  /**
   * Set active authorized account attribution for auto-saved entries and updates
   */
  public setCurrentUser(email: string, name?: string) {
    if (email) {
      this.currentUserEmail = email;
      if (name) this.currentUserName = name;
    }
  }

  public getCurrentUser() {
    return {
      email: this.currentUserEmail,
      name: this.currentUserName
    };
  }

  /**
   * Subscribe to auto-save state changes
   */
  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current state
   */
  public getState(): AutoSaveState {
    const queue = this.getOfflineQueue();
    return {
      status: this.status,
      statusText: this.computeStatusText(),
      lastSavedTime: this.lastSavedTime,
      pendingCount: this.dirtyFieldCount,
      isOnline: this.isOnline,
      offlineQueueCount: queue.length,
      lastError: this.lastError
    };
  }

  private computeStatusText(): string {
    switch (this.status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'All changes saved';
      case 'unsaved':
        return 'Unsaved changes...';
      case 'offline':
        return 'Offline - Saved locally';
      case 'error':
        return 'Offline - Saved locally';
      default:
        return 'All changes saved';
    }
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(fn => {
      try {
        fn(state);
      } catch (err) {
        console.error('[AutoSave] Listener error', err);
      }
    });
  }

  /**
   * Universal DOM event listener that intercepts any input or change on all form elements
   */
  private handleUniversalInput = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Only process form field controls
    const tagName = target.tagName.toLowerCase();
    const isFormField = 
      tagName === 'input' || 
      tagName === 'textarea' || 
      tagName === 'select' || 
      target.isContentEditable;

    if (!isFormField) return;

    const inputElement = target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    // Skip ignored or non-persisted controls (e.g. purely internal search filters or file uploads)
    if (inputElement.getAttribute('data-no-autosave') === 'true' || inputElement.type === 'file' || inputElement.type === 'password') {
      return;
    }

    // Determine field identity
    const placeholder = 'placeholder' in inputElement ? (inputElement as HTMLInputElement).placeholder : '';
    const fieldName = 
      inputElement.name || 
      inputElement.id || 
      inputElement.getAttribute('data-field') || 
      inputElement.getAttribute('aria-label') || 
      placeholder || 
      `field_${tagName}`;

    // Determine form or context identity
    const formElement = inputElement.closest('form');
    const modalElement = inputElement.closest('[role="dialog"]');
    const formId = 
      formElement?.id || 
      formElement?.getAttribute('data-form-id') || 
      modalElement?.id || 
      'global_form';

    // Extract current value safely
    let value: any;
    if (inputElement.type === 'checkbox') {
      value = (inputElement as HTMLInputElement).checked;
    } else if (inputElement.type === 'radio') {
      if (!(inputElement as HTMLInputElement).checked) return;
      value = inputElement.value;
    } else if (tagName === 'select' && (inputElement as HTMLSelectElement).multiple) {
      const selected = Array.from((inputElement as HTMLSelectElement).selectedOptions).map(o => o.value);
      value = selected;
    } else {
      value = inputElement.value;
    }

    // Record in drafts
    if (!this.fieldDrafts[formId]) {
      this.fieldDrafts[formId] = {};
    }

    this.fieldDrafts[formId][fieldName] = {
      formId,
      fieldName,
      value,
      type: inputElement.type || tagName,
      timestamp: Date.now()
    };

    this.dirtyFieldCount++;

    // Instant local backup so even instant crashes preserve the keystroke
    this.saveDraftsToLocalStorage();

    // Set status to unsaved
    this.status = 'unsaved';
    this.notify();

    // Debounce the actual save by exactly 1-second (1000ms) to prevent server spam
    this.scheduleSave('form_input');
  };

  /**
   * Schedules a debounced save with a strict 1-second delay to prevent server spam
   */
  public scheduleSave(trigger: string = 'change') {
    this.status = 'unsaved';
    this.notify();

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.executeSave(trigger);
    }, this.DEBOUNCE_DELAY_MS);
  }

  /**
   * Executes the auto-save operation: writes to local storage and attempts API endpoint sync
   */
  public async executeSave(trigger: string = 'manual'): Promise<boolean> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Update status to 'Saving...'
    this.status = 'saving';
    this.notify();

    const now = Date.now();
    const appData = this.dataProvider ? this.dataProvider() : null;

    const payload: AutoSavePayload = {
      timestamp: now,
      fieldDrafts: { ...this.fieldDrafts },
      appData,
      source: trigger,
      authorEmail: this.currentUserEmail,
      authorName: this.currentUserName
    };

    // 1. Dual Persistence Step A: LocalStorage (Always immediate and reliable)
    try {
      localStorage.setItem('sm_autosave_latest_payload', JSON.stringify(payload));
      localStorage.setItem(this.STORAGE_LAST_SAVED_KEY, now.toString());
      this.lastSavedTime = now;
      this.saveDraftsToLocalStorage();

      // Broadcast update to all active sessions & tabs for authorized accounts
      if (appData) {
        syncManager.broadcastUpdate('SYNC_DATA', appData, this.currentUserEmail, this.currentUserName);
      }
    } catch (err) {
      console.warn('[AutoSave] LocalStorage write warning', err);
    }

    // 2. Dual Persistence Step B: API Endpoint (/api/autosave)
    // Check network connectivity first
    if (!this.isOnline || !navigator.onLine) {
      this.isOnline = false;
      this.enqueueOfflineSave(payload);
      this.status = 'offline';
      this.lastError = 'Network offline. Saved safely to local storage.';
      this.dirtyFieldCount = 0;
      this.notify();
      return true; // gracefully saved locally
    }

    try {
      // Send to server with 4-second timeout to handle slow/hung networks gracefully
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Autosave-Client': 'SoundMinded-App'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      // Success!
      this.status = 'saved';
      this.lastError = null;
      this.dirtyFieldCount = 0;
      this.notify();

      // Flush any queued offline saves since we have verified server connection
      this.flushOfflineQueue();

      return true;
    } catch (error: any) {
      // Handle network drops gracefully without losing inputs
      console.warn('[AutoSave] Network sync failed, falling back to offline local queue:', error.message);
      this.enqueueOfflineSave(payload);
      
      // Determine if offline or network error
      if (!navigator.onLine || error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
        this.isOnline = false;
        this.status = 'offline';
      } else {
        this.status = 'error';
      }

      this.lastError = error.message || 'Network connection dropped. Changes saved locally.';
      this.dirtyFieldCount = 0;
      this.notify();
      return false;
    }
  }

  /**
   * Enqueues an autosave payload into the offline queue in localStorage
   */
  private enqueueOfflineSave(payload: AutoSavePayload) {
    try {
      const queue = this.getOfflineQueue();
      // Keep only up to 10 most recent offline payloads to prevent localStorage bloat
      queue.unshift(payload);
      if (queue.length > 10) queue.length = 10;
      localStorage.setItem(this.STORAGE_OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('[AutoSave] Failed to enqueue offline payload', e);
    }
  }

  private getOfflineQueue(): AutoSavePayload[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Flushes any pending offline payloads when network connectivity is restored
   */
  public async flushOfflineQueue() {
    const queue = this.getOfflineQueue();
    if (queue.length === 0 || !navigator.onLine) return;

    try {
      // Send the latest payload to server
      const latestPayload = queue[0];
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...latestPayload, source: 'offline_queue_flush' }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        localStorage.removeItem(this.STORAGE_OFFLINE_QUEUE_KEY);
        this.status = 'saved';
        this.lastError = null;
        this.notify();
      }
    } catch (err) {
      console.warn('[AutoSave] Could not flush offline queue yet:', err);
    }
  }

  /**
   * Network event handlers
   */
  private handleNetworkOnline = () => {
    this.isOnline = true;
    this.status = 'saving';
    this.notify();

    // Trigger auto-sync
    this.flushOfflineQueue().then(() => {
      this.executeSave('reconnect');
    });
  };

  private handleNetworkOffline = () => {
    this.isOnline = false;
    this.status = 'offline';
    this.notify();
  };

  /**
   * Unload safety - flushes any uncommitted changes immediately
   */
  private handleBeforeUnload = () => {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.flushImmediate(true);
  };

  private flushImmediate(useBeacon = false) {
    const now = Date.now();
    const appData = this.dataProvider ? this.dataProvider() : null;
    const payload: AutoSavePayload = {
      timestamp: now,
      fieldDrafts: this.fieldDrafts,
      appData,
      source: 'beforeunload'
    };

    // Save to localStorage synchronously
    try {
      localStorage.setItem('sm_autosave_latest_payload', JSON.stringify(payload));
      localStorage.setItem(this.STORAGE_LAST_SAVED_KEY, now.toString());
      this.saveDraftsToLocalStorage();
    } catch (e) {
      // ignore
    }

    // Send beacon if closing
    if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(this.API_ENDPOINT, blob);
      } catch (e) {
        // ignore
      }
    }
  }

  private saveDraftsToLocalStorage() {
    try {
      localStorage.setItem(this.STORAGE_DRAFTS_KEY, JSON.stringify(this.fieldDrafts));
    } catch {
      // storage quota or disabled
    }
  }

  /**
   * Helper to restore field drafts for a given form/dialog element
   */
  public restoreFormDrafts(container: HTMLElement, formId: string = 'global_form') {
    const drafts = this.fieldDrafts[formId];
    if (!drafts) return 0;

    let restoredCount = 0;
    const inputs = container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input, textarea, select'
    );

    inputs.forEach(el => {
      const placeholder = 'placeholder' in el ? (el as HTMLInputElement).placeholder : '';
      const fieldName = 
        el.name || 
        el.id || 
        el.getAttribute('data-field') || 
        el.getAttribute('aria-label') || 
        placeholder || 
        `field_${el.tagName.toLowerCase()}`;

      const draft = drafts[fieldName];
      if (draft && draft.value !== undefined) {
        if (el.type === 'checkbox') {
          (el as HTMLInputElement).checked = Boolean(draft.value);
        } else if (el.type === 'radio') {
          if (el.value === draft.value) (el as HTMLInputElement).checked = true;
        } else {
          el.value = draft.value;
        }
        // Trigger synthetic input event so React state updates
        el.dispatchEvent(new Event('input', { bubbles: true }));
        restoredCount++;
      }
    });

    return restoredCount;
  }

  /**
   * Clear saved drafts for a specific form (e.g. after successful submit)
   */
  public clearFormDraft(formId: string) {
    if (this.fieldDrafts[formId]) {
      delete this.fieldDrafts[formId];
      this.saveDraftsToLocalStorage();
    }
  }

  /**
   * Trigger manual save
   */
  public triggerManualSave(): Promise<boolean> {
    return this.executeSave('manual_trigger');
  }
}

// Export singleton instance
export const autoSaveService = new AutoSaveService();

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  autoSaveService.init();
}
