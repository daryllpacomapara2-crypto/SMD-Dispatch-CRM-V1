import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  Truck,
  CheckCircle2,
  Shield
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const AdminPortalLogin: React.FC = () => {
  const {
    loginAdmin,
    verifyCredentials
  } = useAdmin();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDenied, setIsDenied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsDenied(false);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your authorized administrator email or username.');
      triggerShake();
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your administrator password or PIN.');
      triggerShake();
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const verifyRes = verifyCredentials(identifier, password);

      if (!verifyRes.success) {
        setIsLoading(false);
        setIsDenied(true);
        setErrorMessage(verifyRes.error || 'ACCESS DENIED: Unauthorized account or invalid credentials.');
        triggerShake();
      } else {
        setIsLoading(false);
        setIsSuccess(true);
        // Show verified green alert, then transition smoothly into CRM dashboard
        setTimeout(() => {
          loginAdmin(identifier, password);
        }, 650);
      }
    }, 350);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="min-h-screen bg-[#070709] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(234,88,12,0.15),rgba(255,255,255,0))] text-zinc-200 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased selection:bg-orange-500 selection:text-white">
      {/* Top Bar Branding */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2 border-b border-zinc-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 overflow-hidden shadow-inner">
            <img
              src="/logo.jpg"
              alt="SMD Dispatch"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <Truck className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="text-sm font-black tracking-wider text-zinc-100 uppercase">
              Sound Minded Dispatching, LLC
            </div>
            <div className="text-[11px] text-zinc-500 font-mono">
              Enterprise Freight Load Scheduler & CRM
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            System Live & Secure
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">v2.6 Enterprise</span>
        </div>
      </header>

      {/* Main Login Window Card */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div
          className={`bg-[#0f1013] border ${
            isDenied
              ? 'border-red-500/80 shadow-2xl shadow-red-950/40 ring-2 ring-red-500/30'
              : 'border-zinc-800 shadow-2xl shadow-black/80'
          } rounded-2xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300 ${
            shake ? 'animate-bounce' : ''
          }`}
        >
          {/* Subtle top accent gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600"></div>

          {/* Portal Title & Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-950/40 border border-orange-500/40 text-orange-400 mb-3 shadow-lg shadow-orange-950/30">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              SMD Dispatch CRM Login
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5">
              Authorized Administrator & Dispatcher Portal
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-orange-400/90 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full uppercase">
              <Lock className="w-3 h-3" />
              Restricted Access &bull; No Public Registration
            </div>
          </div>

          {/* ACCESS DENIED ALERT BANNER */}
          {isDenied && (
            <div className="mb-5 bg-red-950/40 border border-red-500/50 rounded-xl p-3.5 flex items-start space-x-3 text-red-200 shadow-inner animate-in fade-in">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-red-400 uppercase tracking-wide">
                  Access Denied — Unauthorized Entry
                </div>
                <div className="text-red-300/90 leading-relaxed">
                  {errorMessage}
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS BANNER */}
          {isSuccess && (
            <div className="mb-5 bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-3.5 flex items-center space-x-3 text-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-emerald-400">Credentials Verified!</div>
                <div className="text-emerald-300/90">Redirecting to SMD Dispatch CRM Dashboard...</div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Admin Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (isDenied) setIsDenied(false);
                  }}
                  placeholder="e.g. daryllpacomapara2@gmail.com"
                  className="w-full bg-[#16181d] border border-zinc-700/80 rounded-xl pl-10 pr-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Security Password or PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (isDenied) setIsDenied(false);
                  }}
                  placeholder="Enter administrator password or PIN"
                  className="w-full bg-[#16181d] border border-zinc-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg ${
                isSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-900/40'
                  : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-orange-950/50 hover:shadow-orange-900/50 active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying Authorization...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Access Granted — Redirecting...</span>
                </>
              ) : (
                <>
                  <span>Authenticate & Enter Dispatch CRM</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80">
            <div className="flex items-center gap-2 text-zinc-400 text-xs">
              <Shield className="w-4 h-4 text-orange-400 shrink-0" />
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Access is restricted to authorized personnel. Random or unregistered logins are strictly denied. Credentials are created and managed by System Administrators inside the Admin Control Center.
              </p>
            </div>
          </div>
        </div>

        {/* Security Policy Footer Note */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-zinc-500 leading-relaxed max-w-sm mx-auto">
            Sound Minded Dispatching, LLC &bull; Confidential Freight System. Unauthorized access or tampering is strictly prohibited and subject to legal action.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-2">
        <div>
          &copy; {new Date().getFullYear()} Sound Minded Dispatching, LLC &bull; All Rights Reserved.
        </div>
        <div className="flex items-center gap-3">
          <span>Trucking Load Scheduler System (CRM)</span>
          <span>&bull;</span>
          <span>Security Protocol TLS 1.3</span>
        </div>
      </footer>
    </div>
  );
};
