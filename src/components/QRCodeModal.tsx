import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  X,
  ExternalLink,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Camera,
  Share2,
  RefreshCw
} from 'lucide-react';
import { SoundMindedLogo } from './SoundMindedLogo';
import companyLogo from '../assets/images/regenerated_image_1788645584950.png';
import { getAppBaseUrl, APP_PUBLIC_URL } from '../utils/appConfig';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUrl?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  defaultUrl
}) => {
  // Production shared URL that anyone can open without login
  const SHARED_PRODUCTION_URL = defaultUrl || APP_PUBLIC_URL;
  
  const [selectedUrlType, setSelectedUrlType] = useState<'shared' | 'current' | 'custom'>('shared');
  const [customUrl, setCustomUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('/qr-code.png');
  const [isGenerating, setIsGenerating] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Compute active target URL
  const getActiveUrl = () => {
    if (selectedUrlType === 'shared') {
      return SHARED_PRODUCTION_URL;
    }
    if (selectedUrlType === 'current') {
      return getAppBaseUrl();
    }
    return customUrl.trim() || SHARED_PRODUCTION_URL;
  };

  const targetUrl = getActiveUrl();

  // Generate QR Code on canvas with center logo embedding
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    const generateBrandedQR = async () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 600;
        canvas.width = size;
        canvas.height = size;

        // Generate base high-res QR code with High error correction (Level H allows up to 30% occluded by center logo)
        await QRCode.toCanvas(canvas, targetUrl, {
          width: size,
          margin: 3,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#0A0A0C', // deep obsidian for optimal camera optical contrast
            light: '#FFFFFF'
          }
        });

        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Load logo to draw in the center
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          logoImg.src = companyLogo;

          await new Promise((resolve) => {
            logoImg.onload = resolve;
            logoImg.onerror = resolve; // proceed even if image load fails
          });

          if (logoImg.complete && logoImg.naturalWidth > 0) {
            const logoSize = Math.floor(size * 0.23); // 23% center overlay safe margin
            const x = (size - logoSize) / 2;
            const y = (size - logoSize) / 2;
            const radius = 16;

            // Draw white background pill behind logo for crisp QR boundary separation
            ctx.save();
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.roundRect(x - 6, y - 6, logoSize + 12, logoSize + 12, radius + 4);
            ctx.fill();
            ctx.restore();

            // Draw border outline
            ctx.save();
            ctx.strokeStyle = '#EA580C'; // orange-600 border matching brand
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.roundRect(x - 2, y - 2, logoSize + 4, logoSize + 4, radius);
            ctx.stroke();
            ctx.restore();

            // Clip and draw rounded logo image
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, logoSize, logoSize, radius - 2);
            ctx.clip();
            ctx.drawImage(logoImg, x, y, logoSize, logoSize);
            ctx.restore();
          }
        }

        if (isMounted) {
          setQrDataUrl(canvas.toDataURL('image/png'));
          setIsGenerating(false);
        }
      } catch (err) {
        console.error('Failed to generate branded QR code', err);
        if (isMounted) setIsGenerating(false);
      }
    };

    generateBrandedQR();

    return () => {
      isMounted = false;
    };
  }, [isOpen, targetUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `Sound_Minded_Dispatching_QRCode_${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSVG = async () => {
    try {
      const svgString = await QRCode.toString(targetUrl, {
        type: 'svg',
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#0A0A0C',
          light: '#FFFFFF'
        }
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Sound_Minded_Dispatching_QRCode_${new Date().toISOString().split('T')[0]}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate SVG QR code', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="modal-qr-code-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static"
      onClick={onClose}
    >
      <div
        id="modal-qr-code-content"
        className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl text-zinc-200 relative overflow-hidden print:border-none print:shadow-none print:p-0 print:max-w-none print:bg-white print:text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-sky-500 print:hidden" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-800/60 hover:bg-zinc-800 transition-colors cursor-pointer print:hidden"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 print:hidden">
          <div className="shrink-0">
            <SoundMindedLogo variant="full" className="h-10 sm:h-12 w-auto drop-shadow" />
          </div>
          <div className="flex-1 pr-6 border-l border-zinc-800 sm:pl-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800/60 uppercase tracking-wider flex items-center gap-1">
                <QrCode className="w-3 h-3" /> Universal QR Code
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Error-Resistant Level H
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Direct Mobile &amp; PC Access QR Code</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Anyone with an iPhone, Android, tablet, or webcam can point their camera to launch Sound Minded Dispatching instantly.
            </p>
          </div>
        </div>

        {/* Printable Poster Section (Optimized for both modal view and paper print) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* QR Code Display Canvas / Card */}
          <div className="md:col-span-6 flex flex-col items-center justify-center">
            <div className="relative bg-white p-5 rounded-2xl shadow-xl border-4 border-zinc-700/60 flex flex-col items-center group">
              {/* Corner Registration Accents */}
              <div className="w-full flex items-center justify-between text-[11px] font-black text-slate-800 tracking-wider uppercase mb-2 border-b border-slate-200 pb-1.5">
                <span className="flex items-center gap-1 text-orange-600">
                  <Sparkles className="w-3 h-3" /> Scan to Launch
                </span>
                <span className="text-slate-400 font-mono text-[10px]">SOUND MINDED</span>
              </div>

              {/* QR Image */}
              <div className="relative w-64 h-64 sm:w-68 sm:h-68 bg-white flex items-center justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Sound Minded Dispatching QR Code"
                    className="w-full h-full object-contain rounded-lg transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                    <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
                    <span className="text-xs">Generating QR Code...</span>
                  </div>
                )}
              </div>

              {/* Bottom Instructions Badge */}
              <div className="mt-3 pt-2 border-t border-slate-200 w-full text-center">
                <div className="text-[11px] font-bold text-slate-900 flex items-center justify-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-orange-600" />
                  <span>Point Phone Camera to Scan</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Compatible with iOS Safari, Chrome, Edge &amp; Android
                </div>
              </div>
            </div>

            {/* Quick action buttons right below QR on mobile */}
            <div className="flex items-center gap-2 mt-3 w-full max-w-[280px] print:hidden">
              <button
                id="btn-download-qr-png"
                onClick={handleDownloadPNG}
                className="flex-1 py-2 px-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PNG</span>
              </button>
              <button
                id="btn-download-qr-svg"
                onClick={handleDownloadSVG}
                className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Download Vector SVG for high-res printing"
              >
                <span>SVG Vector</span>
              </button>
              <button
                id="btn-print-qr-poster"
                onClick={handlePrint}
                className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Print 8.5x11 Dispatch Flyer"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Configuration, Link Options & Instructions */}
          <div className="md:col-span-6 space-y-4 print:hidden">
            {/* Target URL Selector */}
            <div className="bg-[#17171C] p-4 rounded-xl border border-zinc-800 space-y-3">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Linked Application Destination</span>
                <span className="text-[10px] text-emerald-400 font-normal">Active Link</span>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label
                  onClick={() => setSelectedUrlType('shared')}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    selectedUrlType === 'shared'
                      ? 'bg-orange-950/40 border-orange-500/60 text-white shadow-xs'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="urlType"
                    checked={selectedUrlType === 'shared'}
                    onChange={() => setSelectedUrlType('shared')}
                    className="mt-1 text-orange-500 focus:ring-orange-500"
                  />
                  <div className="flex-1 text-xs">
                    <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                      <span>Shared Cloud Live URL</span>
                      <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-mono">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 break-all font-mono">
                      {SHARED_PRODUCTION_URL}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Works for anyone on any network, phone, or laptop without authentication barriers.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setSelectedUrlType('current')}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    selectedUrlType === 'current'
                      ? 'bg-orange-950/40 border-orange-500/60 text-white shadow-xs'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="urlType"
                    checked={selectedUrlType === 'current'}
                    onChange={() => setSelectedUrlType('current')}
                    className="mt-1 text-orange-500 focus:ring-orange-500"
                  />
                  <div className="flex-1 text-xs">
                    <div className="font-semibold text-zinc-200">Current Browser Workspace URL</div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 break-all font-mono truncate max-w-[280px]">
                      {typeof window !== 'undefined' ? window.location.href : 'Current window origin'}
                    </p>
                  </div>
                </label>
              </div>

              {/* Direct Copy Bar */}
              <div className="pt-2 flex items-center gap-2">
                <div className="flex-1 bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800 text-[11px] font-mono text-orange-300 truncate">
                  {targetUrl}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                  title="Test Link in New Tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Scanning Guide for Drivers & Dispatchers */}
            <div className="bg-[#17171C] p-4 rounded-xl border border-zinc-800 space-y-2.5 text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>How to use this QR Code</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold">•</span>
                  <span><strong>On Trucks &amp; Fleet:</strong> Print and stick in truck cabs so drivers can pull up live load schedules and IFTA logging instantly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold">•</span>
                  <span><strong>Shipper &amp; Receiver Verification:</strong> Place QR codes on rate sheets and BOLs for instant load status check.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold">•</span>
                  <span><strong>Fast Device Handoff:</strong> Scanning on iPhone or Android prompts to "Add to Home Screen" for zero-lag native app use.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Printable-only Page Layout */}
        <div className="hidden print:block text-black p-8 font-sans">
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-black tracking-tight uppercase">SOUND MINDED DISPATCHING, LLC</h1>
            <p className="text-sm font-semibold text-gray-700 mt-1">
              Trucking Dispatch Load Scheduler &bull; Mobile &amp; Desktop App Access
            </p>
          </div>

          <div className="flex flex-col items-center justify-center my-6">
            <div className="border-4 border-black p-4 rounded-2xl">
              {qrDataUrl && (
                <img src={qrDataUrl} alt="Sound Minded Dispatching QR Code" className="w-80 h-80 object-contain" />
              )}
            </div>
            <div className="mt-4 text-center">
              <div className="text-lg font-black tracking-wide uppercase">Scan with Camera to Open Live App</div>
              <div className="text-xs text-gray-600 font-mono mt-1 max-w-md break-all">{targetUrl}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 pt-4 border-t border-gray-300 text-xs">
            <div>
              <div className="font-bold uppercase text-gray-800">For Drivers &amp; Operators:</div>
              <p className="text-gray-600 mt-0.5">
                Scan with any iPhone or Android camera to view assignments, mileage logs, and rate sheets.
              </p>
            </div>
            <div>
              <div className="font-bold uppercase text-gray-800">Offline Ready:</div>
              <p className="text-gray-600 mt-0.5">
                Save to your Home Screen from Safari or Chrome to access schedules even without cellular service.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
          <div className="text-zinc-500 text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sound Minded Dispatching QR Engine &bull; High-res 600x600px Output</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPNG}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download Image</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
