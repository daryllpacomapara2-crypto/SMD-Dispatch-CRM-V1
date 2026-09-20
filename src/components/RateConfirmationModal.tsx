import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { DispatchLoad } from '../types/dispatch';
import { formatCurrency, formatNumber } from '../utils/calculations';
import { Logo } from './Logo';
import { X, Printer, QrCode, CheckCircle, MapPin, Truck, Phone, FileText } from 'lucide-react';

interface RateConfirmationModalProps {
  load: DispatchLoad | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RateConfirmationModal: React.FC<RateConfirmationModalProps> = ({
  load,
  isOpen,
  onClose,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (load) {
      // Generate QR code with load details
      const qrPayload = JSON.stringify({
        company: 'Sound Minded Dispatching, LLC',
        loadNum: load.loadNumber,
        driver: load.driverName,
        truck: load.truckNumber,
        trailer: load.trailerNumber,
        pickup: `${load.originCity}, ${load.originState} (${load.pickupDate})`,
        delivery: `${load.destCity}, ${load.destState} (${load.deliveryDate})`,
        rate: load.rateGross,
        netPay: load.driverNetPay,
      });

      QRCode.toDataURL(qrPayload, { width: 140, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('QR code generation failed', err));
    }
  }, [load]);

  if (!isOpen || !load) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white text-stone-900 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-6 print:m-0 print:w-full print:shadow-none print:border-none">
        {/* Screen Header Controls (hidden when printing) */}
        <div className="p-3.5 bg-stone-900 text-stone-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <FileText className="w-4 h-4" />
            <span>Driver Dispatch Rate Sheet & Trip Summary</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-rate-con" className="p-8 space-y-6 text-xs text-stone-800 font-sans">
          {/* Document Top Header */}
          <div className="flex items-start justify-between border-b-2 border-stone-800 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Logo size="md" />
              </div>
              <p className="text-[11px] text-stone-600 font-medium">
                Professional Freight Dispatch & Logistics Management
              </p>
              <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                Dispatch Desk: (888) 550-SMDL • info@soundmindeddispatching.com
              </p>
            </div>

            {/* Load Identifiers & QR Code */}
            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                  DISPATCH ORDER
                </div>
                <div className="text-2xl font-black font-mono text-stone-900 tracking-tight">
                  {load.loadNumber}
                </div>
                <div className="text-[11px] font-semibold text-stone-600 mt-0.5">
                  Invoice: <span className="font-mono">{load.invoiceNumber}</span>
                </div>
                <div className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  Status: {load.status.replace('_', ' ')}
                </div>
              </div>

              {/* Dynamic QR Code */}
              {qrCodeDataUrl && (
                <div className="p-1 bg-white border border-stone-300 rounded shadow-xs">
                  <img src={qrCodeDataUrl} alt="Load QR" className="w-20 h-20" />
                  <span className="block text-[8px] font-mono text-center text-stone-500 mt-0.5">
                    Scan for Trip
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Grid: Driver & Equipment Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 border border-stone-200 rounded-xl">
            <div>
              <h4 className="font-bold text-stone-900 uppercase text-[10px] tracking-wider mb-2 flex items-center gap-1.5 text-amber-700">
                <Truck className="w-3.5 h-3.5" />
                <span>Assigned Carrier & Driver</span>
              </h4>
              <div className="space-y-1">
                <div className="text-sm font-bold text-stone-900">{load.driverName}</div>
                <div className="text-[11px] text-stone-600 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-stone-400" />
                  <span>{load.driverPhone}</span>
                </div>
                <div className="text-[11px] text-stone-600">
                  Unit: <span className="font-mono font-semibold">{load.truckNumber}</span> | Trailer:{' '}
                  <span className="font-mono font-semibold">{load.trailerNumber}</span>
                </div>
                <div className="text-[11px] text-stone-600">
                  Equipment: <span className="font-semibold">{load.equipmentType}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 uppercase text-[10px] tracking-wider mb-2 flex items-center gap-1.5 text-amber-700">
                <FileText className="w-3.5 h-3.5" />
                <span>Broker & Cargo Details</span>
              </h4>
              <div className="space-y-1">
                <div className="text-sm font-bold text-stone-900">{load.brokerName}</div>
                <div className="text-[11px] text-stone-600">
                  Contact: <span className="font-medium">{load.brokerContact}</span>
                </div>
                <div className="text-[11px] text-stone-600">
                  Commodity: <span className="font-semibold">{load.commodity}</span>
                </div>
                <div className="text-[11px] text-stone-600">
                  Weight: <span className="font-semibold">{formatNumber(load.weightLbs)} lbs</span>
                  {load.bolNumber && (
                    <span className="ml-2 font-mono">BOL: {load.bolNumber}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Route: Origin & Destination */}
          <div className="grid grid-cols-2 gap-4">
            {/* Pickup */}
            <div className="p-4 border border-stone-200 rounded-xl bg-white relative">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                Shipper / Pickup
              </div>
              <div className="flex items-center gap-1 text-blue-700 font-bold uppercase text-[10px] mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Stop 1: Origin</span>
              </div>
              <div className="text-base font-bold text-stone-900">
                {load.originCity}, {load.originState}
              </div>
              <div className="mt-2 space-y-0.5 text-[11px] text-stone-600">
                <div>
                  Date: <span className="font-semibold text-stone-900">{load.pickupDate}</span>
                </div>
                <div>
                  Scheduled Time:{' '}
                  <span className="font-semibold font-mono text-stone-900">{load.pickupTime}</span>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="p-4 border border-stone-200 rounded-xl bg-white relative">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Receiver / Delivery
              </div>
              <div className="flex items-center gap-1 text-emerald-700 font-bold uppercase text-[10px] mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Stop 2: Destination</span>
              </div>
              <div className="text-base font-bold text-stone-900">
                {load.destCity}, {load.destState}
              </div>
              <div className="mt-2 space-y-0.5 text-[11px] text-stone-600">
                <div>
                  Date: <span className="font-semibold text-stone-900">{load.deliveryDate}</span>
                </div>
                <div>
                  Scheduled Time:{' '}
                  <span className="font-semibold font-mono text-stone-900">{load.deliveryTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <div className="bg-stone-100 px-4 py-2 font-bold uppercase tracking-wider text-[10px] text-stone-700 border-b border-stone-200">
              Trip Mileage & Rate Breakdown
            </div>
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-stone-200">
                <tr>
                  <td className="py-2 px-4 text-stone-600">Loaded Mileage</td>
                  <td className="py-2 px-4 font-mono font-semibold text-right">{formatNumber(load.loadedMiles)} mi</td>
                </tr>
                {load.deadheadMiles > 0 && (
                  <tr>
                    <td className="py-2 px-4 text-stone-600">Deadhead Mileage</td>
                    <td className="py-2 px-4 font-mono text-right">{load.deadheadMiles} mi</td>
                  </tr>
                )}
                <tr>
                  <td className="py-2 px-4 text-stone-600">Rate Per Mile (RPM)</td>
                  <td className="py-2 px-4 font-mono text-right">${load.ratePerMile.toFixed(2)} / mi</td>
                </tr>
                <tr className="bg-stone-50 font-bold">
                  <td className="py-2.5 px-4 text-stone-900 text-sm">Total Gross Freight Rate</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-right text-stone-900 text-sm">
                    {formatCurrency(load.rateGross)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-amber-800">
                    Less Sound Minded Dispatch Fee ({load.dispatchFeePercent}%)
                  </td>
                  <td className="py-2 px-4 font-mono text-amber-800 font-semibold text-right">
                    - {formatCurrency(load.dispatchFeeAmount)}
                  </td>
                </tr>
                <tr className="bg-emerald-50 border-t-2 border-emerald-500 font-bold text-emerald-900">
                  <td className="py-3 px-4 text-base">Driver Net Payout Amount</td>
                  <td className="py-3 px-4 font-mono font-black text-right text-base text-emerald-700">
                    {formatCurrency(load.driverNetPay)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Special Instructions */}
          {load.specialInstructions && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="font-bold text-amber-900 text-[10px] uppercase tracking-wider mb-1">
                Special Handling Instructions:
              </div>
              <p className="text-[11px] text-amber-950 font-medium">
                {load.specialInstructions}
              </p>
            </div>
          )}

          {/* Signatures & Terms */}
          <div className="pt-6 border-t border-stone-300 grid grid-cols-2 gap-8 text-[10px] text-stone-500">
            <div>
              <p className="mb-8 font-medium">
                Driver Signature acknowledges receipt and agreed delivery schedule under Sound Minded Dispatching, LLC dispatch agreement.
              </p>
              <div className="border-b border-stone-400 w-full mb-1"></div>
              <div className="flex justify-between font-mono">
                <span>Driver Signature: {load.driverName}</span>
                <span>Date: ____________</span>
              </div>
            </div>

            <div>
              <p className="mb-8 font-medium">
                Authorized Dispatch Representative verification and load confirmation clearance.
              </p>
              <div className="border-b border-stone-400 w-full mb-1"></div>
              <div className="flex justify-between font-mono">
                <span>Authorized Dispatcher: Sound Minded Dispatching</span>
                <span>Date: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
