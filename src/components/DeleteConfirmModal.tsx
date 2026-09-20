import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  itemType: 'load' | 'driver' | 'records';
  warningMessage?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
  warningMessage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-stone-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-stone-100">{title}</h3>
          <p className="text-xs text-stone-400 mt-1">
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold text-rose-300 font-mono">"{itemName}"</span>?
          </p>
        </div>

        {warningMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{warningMessage}</span>
          </div>
        )}

        <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-[11px] text-stone-400">
          <p>
            <strong className="text-stone-300">Admin Action:</strong> This record will be removed from your
            local database and updated across all revenue calculations, reports, and Excel exports.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/20 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
