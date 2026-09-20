import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  Laptop,
  CheckCircle2,
  Share2,
  PlusSquare,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  X,
  Apple,
  Chrome,
  ShieldCheck,
  WifiOff,
  FileSpreadsheet,
  QrCode
} from 'lucide-react';
import QRCode from 'qrcode';
import { SoundMindedLogo } from './SoundMindedLogo';
import companyLogo from '../assets/images/regenerated_image_1788645584950.png';
import { getAppBaseUrl } from '../utils/appConfig';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  isStandalone: boolean;
  onTriggerInstall: () => void;
  onOpenQRCodeModal?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  isStandalone,
  onTriggerInstall,
  onOpenQRCodeModal
}) => {
  const [activeTab, setActiveTab] = useState<'pc' | 'ios' | 'android' | 'qr' | 'features'>('pc');
  const [copied, setCopied] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>('');

  const SHARED_PRODUCTION_URL = getAppBaseUrl();

  useEffect(() => {
    QRCode.toDataURL(SHARED_PRODUCTION_URL, {
      margin: 2,
      width: 260,
      errorCorrectionLevel: 'M',
      color: { dark: '#0A0A0C', light: '#FFFFFF' }
    }).then(setQrUrl).catch(console.error);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(userAgent);
      const isGoogle = /android/.test(userAgent);
      setIsIOS(isApple);
      setIsAndroid(isGoogle);

      if (isApple) {
        setActiveTab('ios');
      } else if (isGoogle) {
        setActiveTab('android');
      } else {
        setActiveTab('pc');
      }
    }
  }, []);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      id="modal-install-app-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="modal-install-app-content"
        className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-zinc-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-800/60 hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="shrink-0">
            <SoundMindedLogo variant="full" className="h-11 sm:h-12 w-auto drop-shadow" />
          </div>
          <div className="flex-1 pr-6 border-l border-zinc-800 sm:pl-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800/60 uppercase tracking-wider">
                Download &amp; Install
              </span>
              {isStandalone && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Installed
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Sound Minded Dispatching App</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Install directly to your PC desktop or Mobile Phone for 1-click access and offline dispatching.
            </p>
          </div>
        </div>

        {/* One-Click Install Banner if available */}
        {deferredPrompt && (
          <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-orange-950/70 to-zinc-900 border border-orange-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-500 text-white rounded-xl shadow">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  1-Click Direct Installation Ready <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xs text-zinc-300">
                  Your browser supports native 1-click app installation.
                </div>
              </div>
            </div>
            <button
              id="btn-install-pwa-direct"
              onClick={onTriggerInstall}
              className="w-full sm:w-auto px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-950/50 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Install App Now</span>
            </button>
          </div>
        )}

        {/* Device Selection Tabs */}
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-5">
          <button
            onClick={() => setActiveTab('pc')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'pc'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <Laptop className="w-4 h-4 text-sky-400" />
            <span>PC &amp; Mac Desktop</span>
            {!isIOS && !isAndroid && (
              <span className="text-[9px] bg-sky-950 text-sky-300 border border-sky-800 px-1.5 py-0.2 rounded font-mono">
                Detected
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <Apple className="w-4 h-4 text-zinc-200" />
            <span>iPhone &amp; iPad</span>
            {isIOS && (
              <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.2 rounded font-mono">
                Detected
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Android Phone</span>
            {isAndroid && (
              <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-mono">
                Detected
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-zinc-800 text-white border border-orange-500/50 shadow-xs text-orange-300'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <QrCode className="w-4 h-4 text-orange-400" />
            <span>Scan QR Code</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'features'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>App Benefits</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4 text-xs">
          {/* PC & Mac Tab */}
          {activeTab === 'pc' && (
            <div className="space-y-3 bg-[#17171C] p-4 rounded-xl border border-zinc-800/80">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-sky-400" />
                How to install on Windows PC, Mac, or Chromebook:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="bg-[#1E1E24] p-3 rounded-lg border border-zinc-700/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Step 1</span>
                    <Chrome className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <p className="text-zinc-300">
                    Open in <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong>, or <strong>Brave</strong>.
                  </p>
                </div>

                <div className="bg-[#1E1E24] p-3 rounded-lg border border-zinc-700/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Step 2</span>
                    <Download className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <p className="text-zinc-300">
                    Look at the right side of the browser address bar for the <strong>Install icon</strong> (computer monitor or <span className="font-mono text-orange-300">(+)</span> icon).
                  </p>
                </div>

                <div className="bg-[#1E1E24] p-3 rounded-lg border border-zinc-700/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Step 3</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-zinc-300">
                    Click <strong>"Install"</strong>. The app launches in its own dedicated window and pins to your Taskbar or Desktop!
                  </p>
                </div>
              </div>

              <div className="p-3 bg-sky-950/40 border border-sky-800/60 rounded-lg text-sky-200 text-[11px] flex items-center gap-2 mt-2">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  <strong>Tip:</strong> In Microsoft Edge or Chrome, you can also click the 3-dot menu <strong>⋮</strong> &gt; <strong>Apps</strong> &gt; <strong>"Install Sound Minded Dispatching"</strong>.
                </span>
              </div>
            </div>
          )}

          {/* iPhone & iPad (iOS) Tab */}
          {activeTab === 'ios' && (
            <div className="space-y-3 bg-[#17171C] p-4 rounded-xl border border-zinc-800/80">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Apple className="w-4 h-4 text-zinc-200" />
                How to install on iPhone &amp; iPad (iOS):
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="bg-[#1E1E24] p-3 rounded-lg border border-zinc-700/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Step 1</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <p className="text-zinc-300">
                    Open this website in the <strong>Safari</strong> browser on your iPhone or iPad.
                  </p>
                </div>

                <div className="bg-[#1E1E24] p-3 rounded-lg border border-zinc-700/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Step 2</span>
                    <Share2 className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <p className="text-zinc-300">
                    Tap the <strong>Share</strong> button at the bottom of Safari (the square with an arrow pointing up <span className="font-mono text-sky-300">[↑]</span>).
                  </p>
                </div>

                <div className="bg-[#1E1E24] p-3 rounded-lg border border-zinc-700/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Step 3</span>
                    <PlusSquare className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-zinc-300">
                    Scroll down and tap <strong>"Add to Home Screen"</strong>, then tap <strong>"Add"</strong> in the top right corner.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-amber-200 text-[11px] flex items-center gap-2 mt-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  The app icon will immediately appear on your iPhone home screen and run full-screen without any browser toolbars!
                </span>
              </div>
            </div>
          )}

          {/* Android Tab */}
          {activeTab === 'android' && (
            <div className="space-y-3 bg-[#17171C] p-4 rounded-xl border border-zinc-800/80">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                How to install on Android Phones &amp; Tablets:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="bg-[#1E1E24] p-3 rounded-lg border border-zinc-700/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Step 1</span>
                    <Chrome className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-zinc-300">
                    Open in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your phone.
                  </p>
                </div>

                <div className="bg-[#1E1E24] p-3 rounded-lg border border-zinc-700/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Step 2</span>
                    <Download className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <p className="text-zinc-300">
                    Tap the <strong>"Install App Now"</strong> banner button, or tap the <strong>3 dots ⋮</strong> menu at the top right.
                  </p>
                </div>

                <div className="bg-[#1E1E24] p-3 rounded-lg border border-zinc-700/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Step 3</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-zinc-300">
                    Select <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong> and tap <strong>Install</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-200 text-[11px] flex items-center gap-2 mt-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  The app is added to your phone's App Drawer and Home Screen with instant offline startup.
                </span>
              </div>
            </div>
          )}

          {/* QR Code Tab */}
          {activeTab === 'qr' && (
            <div className="bg-[#17171C] p-4 rounded-xl border border-zinc-800/80 flex flex-col sm:flex-row items-center gap-5">
              <div className="bg-white p-3 rounded-xl border-2 border-orange-500/40 shadow-lg shrink-0">
                {qrUrl ? (
                  <img src={qrUrl} alt="Scan QR Code" className="w-36 h-36 object-contain" />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center text-zinc-400">Loading QR...</div>
                )}
                <div className="text-[10px] font-black text-center text-slate-800 mt-1 uppercase tracking-wider">
                  Scan With Camera
                </div>
              </div>

              <div className="space-y-2 text-xs flex-1">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-orange-400" />
                  <span>Instant Mobile Access</span>
                </div>
                <p className="text-zinc-300 text-xs">
                  Scan this QR code with any iPhone or Android camera to open the application directly on your phone. Once opened, tap <strong>"Add to Home Screen"</strong> to install.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  {onOpenQRCodeModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenQRCodeModal();
                      }}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Full QR Hub &amp; Print Poster</span>
                    </button>
                  )}
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Direct Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Benefits Tab */}
          {activeTab === 'features' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#17171C] p-4 rounded-xl border border-zinc-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <WifiOff className="w-4 h-4" />
                  <span>Works Offline</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  All loads, drivers, brokers, and IFTA logs are stored securely on your device and load instantly even without cellular service.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Full Excel Export</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Generate multi-sheet Microsoft Excel (.xlsx) files with live formulas and rate calculations directly on your phone or PC.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>No App Store Needed</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Instant installation with zero waiting for app store approvals, zero forced updates, and minimal device storage footprint.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Link Share & QR / Copy Bar */}
        <div className="mt-5 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-400 w-full sm:w-auto">
            <span className="text-zinc-300 font-medium whitespace-nowrap">App Web Link:</span>
            <code className="bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800 text-[11px] text-orange-300 truncate max-w-[280px]">
              {currentUrl}
            </code>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 w-full sm:w-auto justify-center"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              <span>{copied ? 'Link Copied!' : 'Copy Link for Phone'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
