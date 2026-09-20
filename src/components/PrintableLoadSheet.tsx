import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { LoadItem } from '../types';
import { Printer, Truck, FileText, MapPin, Phone, Building2, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';
import { SoundMindedLogo } from './SoundMindedLogo';
import companyLogo from '../assets/images/regenerated_image_1788645584950.png';
import { getAppBaseUrl } from '../utils/appConfig';

interface PrintableLoadSheetProps {
  load: LoadItem | null;
  onClose: () => void;
}

export const PrintableLoadSheet: React.FC<PrintableLoadSheetProps> = ({ load, onClose }) => {
  const [sheetQrUrl, setSheetQrUrl] = useState<string>('');
  const SHARED_URL = getAppBaseUrl();

  useEffect(() => {
    QRCode.toDataURL(SHARED_URL, {
      margin: 1,
      width: 140,
      errorCorrectionLevel: 'M',
      color: { dark: '#0A0A0C', light: '#FFFFFF' }
    }).then(setSheetQrUrl).catch(console.error);
  }, []);

  if (!load) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-[#141417] rounded-2xl shadow-2xl border border-zinc-800 max-w-3xl w-full p-8 space-y-6 print:border-none print:shadow-none print:p-4 print:bg-white text-zinc-300">
        {/* Actions Bar (hidden in print) */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-zinc-100">Driver Dispatch Rate Confirmation Sheet</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 border border-zinc-700 rounded-lg text-zinc-300 text-xs font-medium hover:bg-zinc-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Content - Light sheet card inside dark modal or printable white */}
        <div className="space-y-6 bg-white text-slate-800 p-6 rounded-xl border border-zinc-700 print:border-none print:p-0 text-xs font-sans">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <SoundMindedLogo variant="full" className="h-10 w-auto" />
              <div className="hidden sm:block border-l-2 border-slate-300 pl-3">
                <p className="text-slate-500 text-[11px] font-semibold">Motor Carrier Dispatch &amp; Freight Confirmation</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-orange-950">LOAD #{load.loadNumber}</div>
              <div className="text-slate-500 text-[11px]">Broker Ref / PO: <strong>{load.orderNumber}</strong></div>
              <div className="text-slate-500 text-[11px]">Status: <strong className="text-emerald-700">{load.status}</strong></div>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Assigned Driver</span>
              <div className="font-bold text-slate-900 text-sm">{load.driverName}</div>
              <div className="text-slate-600">{load.truckNumber} / {load.trailerNumber}</div>
              <div className="text-orange-700 font-semibold">{load.equipmentType}</div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Brokerage / Customer</span>
              <div className="font-bold text-slate-900 text-sm">{load.brokerName}</div>
              <div className="text-slate-600">Phone: {load.brokerPhone}</div>
              <div className="text-slate-600">Authority: {load.brokerMcNumber || 'MC-Verified'}</div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Cargo &amp; Mileage</span>
              <div className="font-bold text-slate-900">{load.commodity}</div>
              <div className="text-slate-600">Weight: <strong>{load.weightLbs.toLocaleString()} lbs</strong></div>
              <div className="text-slate-600">Total Route: <strong>{load.totalMiles} mi</strong> ({load.loadedMiles} loaded)</div>
            </div>
          </div>

          {/* Route Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Origin */}
            <div className="border border-slate-300 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-orange-700 font-bold text-xs uppercase">
                <MapPin className="w-4 h-4" /> 1. Pickup Origin (Shipper)
              </div>
              <div className="font-bold text-sm text-slate-900">{load.shipperName}</div>
              <div className="text-slate-700">{load.originCity}, {load.originState} {load.originZip}</div>
              <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-xs">
                <span>Date: <strong>{load.pickupDate}</strong></span>
                <span>Window: <strong>{load.pickupTime || 'Flexible'}</strong></span>
              </div>
            </div>

            {/* Destination */}
            <div className="border border-slate-300 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase">
                <MapPin className="w-4 h-4" /> 2. Delivery Destination (Receiver)
              </div>
              <div className="font-bold text-sm text-slate-900">{load.receiverName}</div>
              <div className="text-slate-700">{load.destinationCity}, {load.destinationState} {load.destinationZip}</div>
              <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-xs">
                <span>Date: <strong>{load.deliveryDate}</strong></span>
                <span>Window: <strong>{load.deliveryTime || 'Flexible'}</strong></span>
              </div>
            </div>
          </div>

          {/* Rate Breakdown Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 border-b border-slate-200">
              Freight Compensation &amp; Rate Breakdown
            </div>
            <div className="p-4 grid grid-cols-4 gap-4 text-center">
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Agreed Gross Rate</span>
                <div className="font-bold text-slate-900 text-sm">${load.grossRate.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Accessorials</span>
                <div className="font-bold text-slate-900 text-sm">${load.accessorials.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Total Confirmed</span>
                <div className="font-bold text-emerald-700 text-base">${load.totalGross.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Rate Per Mile</span>
                <div className="font-bold text-orange-700 text-sm">${load.ratePerMile.toFixed(2)}/mi</div>
              </div>
            </div>
          </div>

          {/* Dispatch Notes */}
          {load.notes && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs">
              <strong className="text-amber-900 block mb-1">Special Dispatch &amp; Driver Instructions:</strong>
              <p className="text-amber-950">{load.notes}</p>
            </div>
          )}

          {/* Signatures & Mobile Load Verification QR */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center text-[11px]">
            <div className="sm:col-span-8 grid grid-cols-2 gap-4">
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1"></div>
                <div className="text-slate-500">Authorized Dispatcher Signature / Date</div>
              </div>
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1"></div>
                <div className="text-slate-500">Driver Confirmation Signature / Date</div>
              </div>
            </div>

            <div className="sm:col-span-4 flex items-center justify-end gap-2.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
              {sheetQrUrl && (
                <img src={sheetQrUrl} alt="Scan Load Scheduler" className="w-14 h-14 object-contain border border-slate-300 rounded bg-white p-0.5" />
              )}
              <div className="text-left text-[10px]">
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-orange-600" />
                  <span>Scan Mobile App</span>
                </div>
                <div className="text-slate-500 leading-tight">
                  Track schedule &amp; rates on your phone
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
