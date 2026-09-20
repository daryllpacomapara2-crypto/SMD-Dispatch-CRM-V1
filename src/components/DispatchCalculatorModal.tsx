import React, { useState } from 'react';
import { formatCurrency } from '../utils/calculations';
import { Calculator, Fuel, TrendingUp, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';

export const DispatchCalculatorModal: React.FC = () => {
  const [loadedMiles, setLoadedMiles] = useState<number>(750);
  const [deadheadMiles, setDeadheadMiles] = useState<number>(45);
  const [grossRate, setGrossRate] = useState<number>(2750);
  const [fuelPricePerGal, setFuelPricePerGal] = useState<number>(3.85);
  const [truckMpg, setTruckMpg] = useState<number>(6.5);
  const [tollsAndAccessorials, setTollsAndAccessorials] = useState<number>(85);
  const [dispatchFeePct, setDispatchFeePct] = useState<number>(8);

  // Calculations
  const totalMiles = Number(loadedMiles) + Number(deadheadMiles);
  const loadedRpm = loadedMiles > 0 ? grossRate / loadedMiles : 0;
  const allMilesRpm = totalMiles > 0 ? grossRate / totalMiles : 0;

  const gallonsNeeded = truckMpg > 0 ? totalMiles / truckMpg : 0;
  const fuelCost = gallonsNeeded * fuelPricePerGal;
  const dispatchFee = grossRate * (dispatchFeePct / 100);

  const totalOperatingCosts = fuelCost + Number(tollsAndAccessorials) + dispatchFee;
  const driverNetTakeHome = grossRate - totalOperatingCosts;
  const netProfitPerMile = totalMiles > 0 ? driverNetTakeHome / totalMiles : 0;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-100">
              Sound Minded Dispatch Rate & Fuel Profitability Calculator
            </h3>
            <p className="text-xs text-stone-400">
              Live spot-rate analyzer, fuel burn estimator, and net profit per mile benchmark
            </p>
          </div>
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-300">Offered Gross Rate ($)</label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              value={grossRate}
              onChange={(e) => setGrossRate(Number(e.target.value))}
              className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-sm font-bold font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-300">Loaded Miles</label>
          <input
            type="number"
            value={loadedMiles}
            onChange={(e) => setLoadedMiles(Number(e.target.value))}
            className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-300">Deadhead Miles</label>
          <input
            type="number"
            value={deadheadMiles}
            onChange={(e) => setDeadheadMiles(Number(e.target.value))}
            className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-300">Diesel Price ($/gal)</label>
          <div className="relative">
            <Fuel className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              step="0.05"
              value={fuelPricePerGal}
              onChange={(e) => setFuelPricePerGal(Number(e.target.value))}
              className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-300">Truck Fuel Economy (MPG)</label>
          <input
            type="number"
            step="0.1"
            value={truckMpg}
            onChange={(e) => setTruckMpg(Number(e.target.value))}
            className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-300">Dispatch Fee %</label>
          <input
            type="number"
            step="0.5"
            value={dispatchFeePct}
            onChange={(e) => setDispatchFeePct(Number(e.target.value))}
            className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Real-time Calculation Result Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-stone-800">
        <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
          <span className="text-[10px] uppercase font-mono text-stone-500 block">Loaded RPM</span>
          <span className="text-lg font-bold font-mono text-violet-400">${loadedRpm.toFixed(2)}/mi</span>
          <span className="text-[10px] text-stone-500 block mt-0.5">All-miles: ${allMilesRpm.toFixed(2)}</span>
        </div>

        <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
          <span className="text-[10px] uppercase font-mono text-stone-500 block">Est. Fuel Cost</span>
          <span className="text-lg font-bold font-mono text-amber-400">
            {formatCurrency(fuelCost)}
          </span>
          <span className="text-[10px] text-stone-500 block mt-0.5">
            {gallonsNeeded.toFixed(1)} gal @ ${fuelPricePerGal}/gal
          </span>
        </div>

        <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
          <span className="text-[10px] uppercase font-mono text-stone-500 block">
            Sound Minded Fee ({dispatchFeePct}%)
          </span>
          <span className="text-lg font-bold font-mono text-amber-300">
            {formatCurrency(dispatchFee)}
          </span>
          <span className="text-[10px] text-stone-500 block mt-0.5">Dispatch Revenue</span>
        </div>

        <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
          <span className="text-[10px] uppercase font-mono text-emerald-500 block">
            Driver Net Take-Home
          </span>
          <span className="text-lg font-bold font-mono text-emerald-400">
            {formatCurrency(driverNetTakeHome)}
          </span>
          <span className="text-[10px] text-emerald-500/80 block mt-0.5">
            ${netProfitPerMile.toFixed(2)} net/mile
          </span>
        </div>
      </div>

      {/* Decision Summary Banner */}
      <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              loadedRpm >= 3.5 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-100">
              {loadedRpm >= 3.5
                ? 'High-Yield Profitable Load — Recommended to Book'
                : 'Marginal Spot Rate — Negotiate Counter-Offer'}
            </h4>
            <p className="text-xs text-stone-400">
              Target minimum broker rate: ${((fuelCost + dispatchFee + 1000) / (loadedMiles || 1)).toFixed(2)}/mi
            </p>
          </div>
        </div>

        <div className="text-right font-mono">
          <span className="text-xs text-stone-500 block">Total Trip Miles</span>
          <span className="text-sm font-bold text-stone-200">{totalMiles} mi</span>
        </div>
      </div>
    </div>
  );
};
