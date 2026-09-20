import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  itemDetails?: string;
  confirmButtonText?: string;
  isDangerous?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  itemDetails,
  confirmButtonText = 'Delete Entry',
  isDangerous = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        className="bg-[#141417] rounded-2xl border border-zinc-700/80 shadow-2xl max-w-md w-full p-6 text-zinc-200 space-y-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDangerous ? 'bg-rose-950/80 text-rose-400 border border-rose-800/80' : 'bg-amber-950/80 text-amber-400 border border-amber-800/80'}`}>
              {isDangerous ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">{title}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Permanent data management action</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <p className="text-zinc-300 leading-relaxed">{message}</p>

          {(itemName || itemDetails) && (
            <div className="bg-[#1a1a1e] border border-zinc-800 rounded-lg p-3 space-y-1">
              {itemName && (
                <div className="font-bold text-sm text-zinc-100">{itemName}</div>
              )}
              {itemDetails && (
                <div className="text-zinc-400 text-[11px]">{itemDetails}</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            id="btn-confirm-delete"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg text-white shadow-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              isDangerous 
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40' 
                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/40'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
