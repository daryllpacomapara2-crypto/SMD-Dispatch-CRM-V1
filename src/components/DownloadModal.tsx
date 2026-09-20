import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Sparkles,
  Layers,
  HelpCircle,
  Laptop,
  Smartphone,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LoadItem } from '../types';
import { copyTableToClipboardForSheets, downloadLoadsCSV } from '../utils/csvGenerator';
import { SoundMindedLogo } from './SoundMindedLogo';
import companyLogo from '../assets/images/regenerated_image_1788645584950.png';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  loads: LoadItem[];
  onDownloadExcel: () => void;
  onOpenInstallModal?: () => void;
  onOpenQRCodeModal?: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  loads,
  onDownloadExcel,
  onOpenInstallModal,
  onOpenQRCodeModal
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // ignore
    }
  };

  const handleExcelClick = () => {
    triggerConfetti();
    onDownloadExcel();
  };

  const handleCsvClick = () => {
    triggerConfetti();
    downloadLoadsCSV(loads);
  };

  const handleCopyForSheets = () => {
    const ok = copyTableToClipboardForSheets(loads);
    if (ok) {
      setCopied(true);
      triggerConfetti();
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#141417] rounded-2xl shadow-2xl border border-zinc-800 max-w-2xl w-full p-6 space-y-6 text-zinc-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="shrink-0">
              <SoundMindedLogo variant="full" className="h-9 w-auto drop-shadow" />
            </div>
            <div className="border-l border-zinc-800 sm:pl-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-zinc-100">Download Spreadsheet &amp; Duplicate</h2>
                <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full uppercase">
                  Excel &amp; Sheets
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Download formatted Excel (.xlsx) file, CSV dataset, or copy directly into Google Sheets
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 text-2xl font-light cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Download & Access Options Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Option 1: Microsoft Excel (.xlsx) Multi-Sheet */}
          <div className="bg-[#18181b] border-2 border-emerald-500/40 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/80 transition-colors shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="p-2 bg-emerald-600 text-white rounded-lg inline-block">
                  <FileSpreadsheet className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                  Spreadsheet
                </span>
              </div>
              <h3 className="text-sm font-bold text-zinc-100 mt-2.5">
                Microsoft Excel (.xlsx)
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Full 7-tab workbook formatted with live formulas (SUM, RPM, Net Profit, Margin %), column widths &amp; styling.
              </p>
            </div>
            <button
              id="btn-modal-download-xlsx"
              onClick={handleExcelClick}
              className="mt-4 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              Download .XLSX
            </button>
          </div>

          {/* Option 2: Google Sheets Direct Copy */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-orange-500/60 transition-colors shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="p-2 bg-orange-600 text-white rounded-lg inline-block">
                  <ExternalLink className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300 bg-orange-950/80 border border-orange-800 px-2 py-0.5 rounded">
                  Google Drive
                </span>
              </div>
              <h3 className="text-sm font-bold text-zinc-100 mt-2.5">
                Google Sheets Copy
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Copy formatted table clipboard data or upload the .XLSX to Google Drive to open instantly in Sheets.
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                id="btn-copy-for-sheets"
                onClick={handleCopyForSheets}
                className="w-full py-2.5 px-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy for Sheets</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 3: Universal QR Code Mobile Access */}
          <div className="bg-[#18181b] border border-orange-500/40 rounded-xl p-4 flex flex-col justify-between hover:border-orange-500/80 transition-colors shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="p-2 bg-orange-600 text-white rounded-lg inline-block">
                  <QrCode className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300 bg-orange-950/80 border border-orange-800 px-2 py-0.5 rounded">
                  Mobile QR
                </span>
              </div>
              <h3 className="text-sm font-bold text-zinc-100 mt-2.5">
                Universal QR Code
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Scan with any iPhone or Android camera to launch live app on phones or generate printable posters.
              </p>
            </div>
            <button
              id="btn-modal-open-qr-code"
              onClick={() => {
                onClose();
                if (onOpenQRCodeModal) onOpenQRCodeModal();
              }}
              className="mt-4 w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Show QR Code</span>
            </button>
          </div>

          {/* Option 4: Install as Native App (PC & Phone) */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-sky-500/60 transition-colors shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="p-2 bg-sky-600 text-white rounded-lg inline-block flex items-center gap-1">
                  <Laptop className="w-4 h-4" />
                  <Smartphone className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 bg-sky-950/80 border border-sky-800 px-2 py-0.5 rounded">
                  Installable
                </span>
              </div>
              <h3 className="text-sm font-bold text-zinc-100 mt-2.5">
                Install on PC / Phone
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Install as a standalone desktop or mobile application with offline support and home screen icon.
              </p>
            </div>
            <button
              id="btn-modal-install-app-trigger"
              onClick={() => {
                onClose();
                if (onOpenInstallModal) onOpenInstallModal();
              }}
              className="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Install Guide</span>
            </button>
          </div>
        </div>

        {/* CSV & Additional Formats */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-zinc-400" />
            <div>
              <h4 className="text-xs font-bold text-zinc-100">Download Raw CSV File (.csv)</h4>
              <p className="text-[11px] text-zinc-400">Universal comma-separated format for TMS and accounting imports</p>
            </div>
          </div>
          <button
            onClick={handleCsvClick}
            className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors border border-zinc-700"
          >
            <Download className="w-3.5 h-3.5" /> Download CSV
          </button>
        </div>

        {/* Multi-Sheet Content Guide */}
        <div className="border-t border-zinc-800 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-zinc-400" />
            Included Worksheets in the Downloaded Excel (.xlsx):
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-zinc-300">
            <div className="p-2 bg-[#18181b] rounded border border-zinc-800">
              <strong className="text-zinc-100 block text-[11px]">1. Load_Scheduler</strong>
              <span className="text-[10px] text-zinc-400">Main dispatch table with live formulas</span>
            </div>
            <div className="p-2 bg-[#18181b] rounded border border-zinc-800">
              <strong className="text-zinc-100 block text-[11px]">2. Dispatch_Calendar</strong>
              <span className="text-[10px] text-zinc-400">Weekly driver lane schedule</span>
            </div>
            <div className="p-2 bg-[#18181b] rounded border border-zinc-800">
              <strong className="text-zinc-100 block text-[11px]">3. Drivers_Fleet</strong>
              <span className="text-[10px] text-zinc-400">CDL, tractor rigs, pay plans</span>
            </div>
            <div className="p-2 bg-[#18181b] rounded border border-zinc-800">
              <strong className="text-zinc-100 block text-[11px]">4. Brokers_Directory</strong>
              <span className="text-[10px] text-zinc-400">MC numbers, credit scores, terms</span>
            </div>
            <div className="p-2 bg-[#18181b] rounded border border-zinc-800">
              <strong className="text-zinc-100 block text-[11px]">5. Financial_KPIs</strong>
              <span className="text-[10px] text-zinc-400">Revenue, fuel, profit summary</span>
            </div>
            <div className="p-2 bg-[#18181b] rounded border border-zinc-800">
              <strong className="text-zinc-100 block text-[11px]">6. IFTA_Expenses</strong>
              <span className="text-[10px] text-zinc-400">State fuel tax &amp; receipts log</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs text-zinc-400">
          <span>Compatible with Excel 2016+, Office 365, Google Sheets, Apple Numbers</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-zinc-700 rounded-lg text-zinc-300 font-medium hover:bg-zinc-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
