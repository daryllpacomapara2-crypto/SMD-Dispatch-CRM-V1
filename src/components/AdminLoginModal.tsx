import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  AlertCircle, 
  X 
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const AdminLoginModal: React.FC = () => {
  const { 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    loginAdmin, 
    loginPromptMessage 
  } = useAdmin();

  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isLoginModalOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = loginAdmin(email, pin);
    if (!res.success) {
      setErrorMessage(res.error || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#141417] border border-orange-500/40 rounded-2xl shadow-2xl max-w-md w-full p-6 text-zinc-200 relative overflow-hidden">
        {/* Subtle decorative top glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />

        {/* Close Button */}
        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="p-3 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl shadow-inner shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800/60">
                Security &amp; Permissions
              </span>
              <span className="text-xs text-zinc-400 font-medium">Sound Minded</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Admin Access Control
            </h2>
          </div>
        </div>

        {/* Prompt Notice if triggered by an action */}
        {loginPromptMessage && (
          <div className="mb-4 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Action Restricted: </span>
              {loginPromptMessage}
            </div>
          </div>
        )}

        {/* Manual Credentials Form */}
        <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
          {errorMessage && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Admin Email Address or Username
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="e.g. admin@soundminded-dispatching.com"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Security Password or PIN
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={pin}
                onChange={e => setPin(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono tracking-wider"
                placeholder="Enter password or PIN..."
              />
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="w-1/2 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock Admin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
