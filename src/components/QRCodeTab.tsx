import React, { useState } from 'react';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Camera,
  Laptop,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { SoundMindedLogo } from './SoundMindedLogo';
import companyLogo from '../assets/images/regenerated_image_1788645584950.png';
import { getAppBaseUrl, APP_PUBLIC_URL } from '../utils/appConfig';

interface QRCodeTabProps {
  onOpenInstallModal: () => void;
}

export const QRCodeTab: React.FC<QRCodeTabProps> = ({ onOpenInstallModal }) => {
  const SHARED_PRODUCTION_URL = getAppBaseUrl();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SHARED_PRODUCTION_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadPNG = () => {
    const link = document.createElement('a');
    link.href = '/qr-code.png';
    link.download = `Sound_Minded_Dispatching_QRCode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSVG = () => {
    const link = document.createElement('a');
    link.href = '/qr-code.svg';
    link.download = `Sound_Minded_Dispatching_QRCode.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-950/50 via-[#18181B] to-zinc-900 border border-orange-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="shrink-0">
              <SoundMindedLogo variant="full" className="h-12 sm:h-14 w-auto drop-shadow-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/80 px-2.5 py-0.5 rounded border border-orange-800 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" /> Instant Mobile Scanner
                </span>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Live &amp; Scannable
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1.5 tracking-tight">
                Universal Direct Access QR Code
              </h2>
              <p className="text-sm text-zinc-300 mt-1 max-w-2xl">
                Scan this unique QR code with any smartphone or tablet to open and run <strong>Sound Minded Dispatching, LLC</strong> instantly.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              id="btn-qr-tab-download-png"
              onClick={handleDownloadPNG}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res PNG</span>
            </button>
            <button
              id="btn-qr-tab-print"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Poster</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main QR Display & Guide Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Large Prominent Scannable QR Code */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-2xl border-4 border-orange-500 flex flex-col items-center text-slate-900 group">
            {/* Header branding */}
            <div className="w-full flex items-center justify-between pb-3 border-b-2 border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <SoundMindedLogo variant="full" className="h-8 w-auto" />
              </div>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-800 font-bold text-[10px] rounded uppercase">
                Scan Me
              </span>
            </div>

            {/* QR Image Box */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 bg-white flex items-center justify-center p-2 rounded-2xl border border-slate-200 shadow-inner">
              <img
                src="/qr-code.png"
                alt="Sound Minded Dispatching Official QR Code"
                className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Bottom Callout */}
            <div className="mt-4 pt-3 border-t-2 border-slate-200 w-full text-center">
              <div className="text-xs font-black text-slate-900 flex items-center justify-center gap-1.5">
                <Camera className="w-4 h-4 text-orange-600 animate-pulse" />
                <span>Point iPhone / Android Camera</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-1 break-all bg-slate-100 py-1 px-2 rounded">
                {SHARED_PRODUCTION_URL}
              </div>
            </div>
          </div>

          {/* Quick Action Pills Under QR */}
          <div className="flex items-center gap-2 mt-4 w-full max-w-sm">
            <button
              onClick={handleDownloadPNG}
              className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" />
              <span>PNG (1000px)</span>
            </button>
            <button
              onClick={handleDownloadSVG}
              className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Vector SVG</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? 'Copied' : 'Copy URL'}</span>
            </button>
          </div>
        </div>

        {/* Detailed Usage Guides and Instructions */}
        <div className="lg:col-span-7 space-y-4">
          {/* Direct URL Box */}
          <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-5 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-orange-400" /> Direct Application Link
              </span>
              <span className="text-xs text-emerald-400 font-medium bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                Active &amp; Public
              </span>
            </div>

            <div className="flex items-center gap-2 bg-zinc-900/90 p-3 rounded-xl border border-zinc-800">
              <div className="flex-1 font-mono text-xs text-orange-300 truncate">
                {SHARED_PRODUCTION_URL}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
              </button>
              <a
                href={SHARED_PRODUCTION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 3 Simple Steps */}
          <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-md">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-400" /> How to Scan &amp; Run Smoothly
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center mb-2 border border-orange-500/30">
                    1
                  </div>
                  <div className="text-xs font-bold text-zinc-200">Open Camera</div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Open your iPhone camera or Android camera/Google Lens.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center mb-2 border border-amber-500/30">
                    2
                  </div>
                  <div className="text-xs font-bold text-zinc-200">Tap Notification</div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Tap the yellow/white banner that appears at the top of your screen.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center mb-2 border border-emerald-500/30">
                    3
                  </div>
                  <div className="text-xs font-bold text-zinc-200">Save to Home</div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Tap <strong>"Add to Home Screen"</strong> for full-screen offline use anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Where to use the QR Code in your dispatch operations */}
          <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-5 space-y-3 shadow-md">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Dispatch Operations Deployment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-zinc-900/70 rounded-xl border border-zinc-800/80 space-y-1">
                <div className="font-bold text-orange-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Truck &amp; Driver Cabs</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Print the QR code and stick it on vehicle clipboards or driver cabs so drivers can quickly check load details, mileage, and rates on the go.
                </p>
              </div>

              <div className="p-3 bg-zinc-900/70 rounded-xl border border-zinc-800/80 space-y-1">
                <div className="font-bold text-orange-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Office &amp; Wall Posters</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Print the full 8.5x11 poster to display in the dispatch control room or breakroom for instant tablet handoff.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenInstallModal}
                className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Laptop className="w-4 h-4" />
                <Smartphone className="w-4 h-4" />
                <span>View Full PC &amp; Mobile Installation Guide</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
