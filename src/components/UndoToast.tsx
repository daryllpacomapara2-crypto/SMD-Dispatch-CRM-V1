import React, { useEffect } from 'react';
import { Undo2, X, CheckCircle2 } from 'lucide-react';

export interface ToastAction {
  id: string;
  message: string;
  onUndo?: () => void;
  undoLabel?: string;
  duration?: number;
}

interface UndoToastProps {
  toast: ToastAction | null;
  onDismiss: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="bg-[#18181b] text-zinc-100 border border-zinc-700/80 shadow-2xl rounded-xl p-3 sm:px-4 sm:py-3 flex items-center gap-3 max-w-md">
        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
        
        <p className="text-xs font-medium text-zinc-200 flex-1">
          {toast.message}
        </p>

        {toast.onUndo && (
          <button
            type="button"
            onClick={() => {
              toast.onUndo?.();
              onDismiss();
            }}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-orange-400 hover:text-orange-300 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 border border-zinc-700"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>{toast.undoLabel || 'Undo'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onDismiss}
          className="text-zinc-400 hover:text-zinc-200 p-1 rounded transition-colors cursor-pointer shrink-0"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
