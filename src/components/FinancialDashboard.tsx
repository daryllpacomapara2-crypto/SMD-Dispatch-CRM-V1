import React, { useMemo } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Truck, 
  Fuel, 
  Users, 
  PieChart as PieIcon,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Edit2,
  CheckCircle2,
  Clock,
  Lock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { LoadItem, Driver, PaymentStatus } from '../types';
import { useAdmin } from '../context/AdminContext';

interface FinancialDashboardProps {
  loads: LoadItem[];
  drivers: Driver[];
  onSelectLoad?: (load: LoadItem) => void;
  onQuickUpdatePaymentStatus?: (loadId: string, status: PaymentStatus) => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ 
  loads, 
  drivers,
  onSelectLoad,
  onQuickUpdatePaymentStatus
}) => {
  const { canEdit, checkPermissionOrPrompt } = useAdmin();

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const grossRev = loads.reduce((s, l) => s + l.totalGross, 0);
    const loadedMiles = loads.reduce((s, l) => s + l.loadedMiles, 0);
    const totalMiles = loads.reduce((s, l) => s + l.totalMiles, 0);
    const driverPay = loads.reduce((s, l) => s + l.driverPay, 0);
    const fuelCost = loads.reduce((s, l) => s + l.fuelCost, 0);
    const tolls = loads.reduce((s, l) => s + l.tollsAndOtherExpenses, 0);
    const netProfit = loads.reduce((s, l) => s + l.netProfit, 0);
    const avgRPM = totalMiles > 0 ? grossRev / totalMiles : 0;
    const margin = grossRev > 0 ? (netProfit / grossRev) * 100 : 0;
    const deadheadRatio = totalMiles > 0 ? ((totalMiles - loadedMiles) / totalMiles) * 100 : 0;

    return {
      grossRev,
      loadedMiles,
      totalMiles,
      driverPay,
      fuelCost,
      tolls,
      netProfit,
      avgRPM,
      margin,
      deadheadRatio
    };
  }, [loads]);

  // Driver Performance Data
  const driverPerformanceData = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; profit: number; miles: number; loads: number }> = {};
    loads.forEach(l => {
      if (!map[l.driverName]) {
        map[l.driverName] = { name: l.driverName.split(' ')[0], revenue: 0, profit: 0, miles: 0, loads: 0 };
      }
      map[l.driverName].revenue += l.totalGross;
      map[l.driverName].profit += l.netProfit;
      map[l.driverName].miles += l.totalMiles;
      map[l.driverName].loads += 1;
    });

    return Object.values(map);
  }, [loads]);

  // Equipment Breakdown Data
  const equipmentData = useMemo(() => {
    const map: Record<string, number> = {};
    loads.forEach(l => {
      map[l.equipmentType] = (map[l.equipmentType] || 0) + l.totalGross;
    });

    const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
    return Object.entries(map).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
  }, [loads]);

  // Broker Performance Data
  const brokerVolumeData = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; loads: number }> = {};
    loads.forEach(l => {
      if (!map[l.brokerName]) {
        map[l.brokerName] = { name: l.brokerName, revenue: 0, loads: 0 };
      }
      map[l.brokerName].revenue += l.totalGross;
      map[l.brokerName].loads += 1;
    });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [loads]);

  const handleEditClick = (load: LoadItem) => {
    checkPermissionOrPrompt(() => {
      if (onSelectLoad) onSelectLoad(load);
    }, 'Admin authorization is required to edit settlement financials.');
  };

  const handleStatusToggle = (loadId: string, currentStatus?: PaymentStatus) => {
    checkPermissionOrPrompt(() => {
      if (onQuickUpdatePaymentStatus) {
        const nextStatus: PaymentStatus = currentStatus === 'Paid' ? 'Pending' : currentStatus === 'Submitted to Factoring' ? 'Paid' : 'Submitted to Factoring';
        onQuickUpdatePaymentStatus(loadId, nextStatus);
      }
    }, 'Admin authorization is required to update payment status.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#121214] rounded-xl shadow-md border border-zinc-800/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500/20 text-emerald-400 p-2.5 rounded-lg border border-emerald-500/30">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-100">Financial &amp; Executive Revenue KPIs</h2>
              {canEdit ? (
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Admin Financial Ledger Active
                </span>
              ) : (
                <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" /> View Only
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Live profit margins, RPM analytics, driver settlements, and net revenue breakdowns
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#121214] p-4 rounded-xl border border-zinc-800/80 shadow-md">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Gross Booked Revenue</span>
          <div className="text-xl font-black text-emerald-400 mt-1">
            ${metrics.grossRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Across {loads.length} booked loads</div>
        </div>

        <div className="bg-[#121214] p-4 rounded-xl border border-zinc-800/80 shadow-md">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Net Operating Profit</span>
          <div className="text-xl font-black text-cyan-400 mt-1">
            ${metrics.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Overall margin: {metrics.margin.toFixed(1)}%</div>
        </div>

        <div className="bg-[#121214] p-4 rounded-xl border border-zinc-800/80 shadow-md">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Avg Rate Per Mile (RPM)</span>
          <div className="text-xl font-black text-orange-400 mt-1">
            ${metrics.avgRPM.toFixed(2)}/mi
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">{metrics.totalMiles.toLocaleString()} total dispatched miles</div>
        </div>

        <div className="bg-[#121214] p-4 rounded-xl border border-zinc-800/80 shadow-md">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Driver Payouts</span>
          <div className="text-xl font-black text-purple-400 mt-1">
            ${metrics.driverPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Direct fleet driver compensation</div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Driver Revenue Chart */}
        <div className="lg:col-span-2 bg-[#121214] rounded-xl p-5 border border-zinc-800/80 shadow-md">
          <h3 className="text-sm font-bold text-zinc-100 mb-1">Driver Revenue vs. Net Profit ($)</h3>
          <p className="text-xs text-zinc-400 mb-4">Comparison of booked gross versus net profit by driver</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={driverPerformanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" fill="#f97316" name="Gross Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#10b981" name="Net Profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Equipment Pie Chart */}
        <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/80 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 mb-1">Equipment Share</h3>
            <p className="text-xs text-zinc-400 mb-4">Revenue distribution by trailer spec</p>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={equipmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {equipmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 space-y-1 text-xs">
              {equipmentData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold text-zinc-100">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Financial Settlement & Rate Adjustment Ledger */}
      <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/80 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-100">Admin Settlement &amp; Rate Adjustment Ledger</h3>
              <span className="text-[10px] bg-orange-950/80 text-orange-400 border border-orange-800/80 px-2 py-0.2 rounded font-bold">
                Direct Update Controls
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Admin can click any load row to edit rates, fuel costs, driver payouts, or toggle payment settlement status
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#18181b] text-zinc-300 font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-3 py-2.5">Load ID</th>
                <th className="px-3 py-2.5">Driver</th>
                <th className="px-3 py-2.5">Broker / Shipper</th>
                <th className="px-3 py-2.5 text-right">Gross Rate</th>
                <th className="px-3 py-2.5 text-right">Driver Pay</th>
                <th className="px-3 py-2.5 text-right">Fuel &amp; Tolls</th>
                <th className="px-3 py-2.5 text-right">Net Profit</th>
                <th className="px-3 py-2.5 text-center">Settlement Status</th>
                <th className="px-3 py-2.5 text-center">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {loads.slice(0, 10).map((load) => (
                <tr key={load.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-3 py-2 font-bold text-zinc-100">{load.loadNumber}</td>
                  <td className="px-3 py-2">{load.driverName}</td>
                  <td className="px-3 py-2 truncate max-w-[140px] text-zinc-300">{load.brokerName}</td>
                  <td className="px-3 py-2 text-right font-bold text-emerald-400">
                    ${load.totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-purple-400">
                    ${load.driverPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-amber-400">
                    ${(load.fuelCost + load.tollsAndOtherExpenses).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-cyan-400">
                    ${load.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => handleStatusToggle(load.id, load.paymentStatus)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        load.paymentStatus === 'Paid'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900'
                          : load.paymentStatus === 'Factored'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-800/80 hover:bg-blue-900'
                          : 'bg-amber-950/80 text-amber-300 border-amber-800/80 hover:bg-amber-900'
                      }`}
                      title="Click to advance settlement status (Pending -> Factored -> Paid)"
                    >
                      {load.paymentStatus || 'Pending'}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => handleEditClick(load)}
                      className="px-2.5 py-1 text-xs font-semibold text-orange-400 hover:text-orange-300 hover:bg-orange-950/40 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                      title="Edit all financial details of this load"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Brokers Leaderboard */}
      <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/80 shadow-md">
        <h3 className="text-sm font-bold text-zinc-100 mb-1">Top Broker Volume &amp; Freight Spend</h3>
        <p className="text-xs text-zinc-400 mb-4">Ranked by total booked freight revenue</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#18181b] text-zinc-300 font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-3 py-2.5">Rank</th>
                <th className="px-3 py-2.5">Broker Name</th>
                <th className="px-3 py-2.5 text-center">Loads Run</th>
                <th className="px-3 py-2.5 text-right">Total Revenue</th>
                <th className="px-3 py-2.5 text-right">Avg Rate / Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {brokerVolumeData.map((b, idx) => (
                <tr key={b.name} className="hover:bg-zinc-800/30">
                  <td className="px-3 py-2 font-bold text-zinc-500">#{idx + 1}</td>
                  <td className="px-3 py-2 font-semibold text-zinc-100">{b.name}</td>
                  <td className="px-3 py-2 text-center">
                    <span className="bg-orange-950/50 text-orange-300 font-semibold px-2 py-0.5 rounded border border-orange-800/50">
                      {b.loads}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-emerald-400">
                    ${b.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-zinc-200">
                    ${(b.revenue / b.loads).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
