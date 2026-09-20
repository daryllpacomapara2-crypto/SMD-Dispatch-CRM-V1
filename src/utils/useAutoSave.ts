import { useState, useEffect, useCallback } from 'react';
import { autoSaveService, AutoSaveState, AutoSaveStatus } from './autoSaveService';

export function useAutoSave(dataProvider?: () => any) {
  const [state, setState] = useState<AutoSaveState>(() => autoSaveService.getState());

  // Register data provider if supplied
  useEffect(() => {
    if (dataProvider) {
      autoSaveService.registerDataProvider(dataProvider);
    }
  }, [dataProvider]);

  // Subscribe to autoSave updates
  useEffect(() => {
    const unsubscribe = autoSaveService.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const saveNow = useCallback(() => {
    return autoSaveService.triggerManualSave();
  }, []);

  const scheduleSave = useCallback((reason?: string) => {
    autoSaveService.scheduleSave(reason);
  }, []);

  const clearDraft = useCallback((formId: string) => {
    autoSaveService.clearFormDraft(formId);
  }, []);

  const restoreDrafts = useCallback((container: HTMLElement, formId?: string) => {
    return autoSaveService.restoreFormDrafts(container, formId);
  }, []);

  return {
    ...state,
    isSaving: state.status === 'saving',
    isSaved: state.status === 'saved',
    isOffline: !state.isOnline || state.status === 'offline',
    saveNow,
    scheduleSave,
    clearDraft,
    restoreDrafts
  };
}
