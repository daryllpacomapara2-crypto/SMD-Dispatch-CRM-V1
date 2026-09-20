import React from 'react';
import { DispatchSummaryMetrics } from '../types/dispatch';
import { formatCurrency, formatNumber } from '../utils/calculations';
import { DollarSign, Truck, TrendingUp, Navigation, Percent, CheckCircle2 } from 'lucide-react';

interface KPICardsProps {
  metrics: DispatchSummaryMetrics;
  onFilterActive?: () => void;
  onFilterDelivered?: () => void;
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics, onFilterActive, onFilterDelivered }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Gross Revenue */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 shadow-sm hover:border-amber-500/40 transition-colors">
        <div className="flex items-center justify-between text-stone-400 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">Gross Freight</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-stone-100 tracking-tight">
          {formatCurrency(metrics.totalGrossRevenue)}
        </div>
        <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
          <span className="text-emerald-400 font-medium">Billed to Brokers</span>
        </div>
      </div>

      {/* 2. Sound Minded Fees */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 shadow-sm hover:border-amber-500/40 transition-colors">
        <div className="flex items-center justify-between text-stone-400 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Dispatch Fee</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-amber-400 tracking-tight">
          {formatCurrency(metrics.totalDispatchFees)}
        </div>
        <div className="text-[11px] text-stone-400 mt-1">
          <span className="text-stone-300 font-medium">Company Revenue</span>
        </div>
      </div>

      {/* 3. Driver Net Payout */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 shadow-sm hover:border-amber-500/40 transition-colors">
        <div className="flex items-center justify-between text-stone-400 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">Driver Payout</span>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-blue-400 tracking-tight">
          {formatCurrency(metrics.totalDriverNetPay)}
        </div>
        <div className="text-[11px] text-stone-400 mt-1">
          <span>Fleet Net Earnings</span>
        </div>
      </div>

      {/* 4. Active Loads */}
      <div
        onClick={onFilterActive}
        className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 shadow-sm hover:border-amber-500/40 cursor-pointer transition-colors group"
      >
        <div className="flex items-center justify-between text-stone-400 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-amber-400 transition-colors">
            Active Loads
          </span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-stone-100 tracking-tight flex items-baseline gap-2">
          <span>{metrics.activeLoads}</span>
          <span className="text-xs font-normal text-stone-400">/ {metrics.totalLoads} total</span>
        </div>
        <div className="text-[11px] text-amber-400/90 mt-1">
          <span>Dispatched & In Transit</span>
        </div>
      </div>

      {/* 5. Avg Rate Per Mile (RPM) */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 shadow-sm hover:border-amber-500/40 transition-colors">
        <div className="flex items-center justify-between text-stone-400 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">Avg RPM</span>
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-violet-300 tracking-tight">
          ${metrics.averageRatePerMile.toFixed(2)}
          <span className="text-xs font-normal text-stone-400"> /mi</span>
        </div>
        <div className="text-[11px] text-stone-400 mt-1">
          <span>Across {formatNumber(metrics.totalLoadedMiles)} loaded mi</span>
        </div>
      </div>

      {/* 6. Completed / Delivered & Deadhead */}
      <div
        onClick={onFilterDelivered}
        className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 shadow-sm hover:border-amber-500/40 cursor-pointer transition-colors group"
      >
        <div className="flex items-center justify-between text-stone-400 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
            Delivered
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-emerald-400 tracking-tight flex items-baseline gap-1.5">
          <span>{metrics.deliveredLoads}</span>
          <span className="text-xs font-normal text-stone-400">loads</span>
        </div>
        <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-between">
          <span>DH: {metrics.averageDeadheadPercent.toFixed(1)}%</span>
          <span className="text-[10px] text-stone-500">({metrics.totalDeadheadMiles} mi)</span>
        </div>
      </div>
    </div>
  );
};
