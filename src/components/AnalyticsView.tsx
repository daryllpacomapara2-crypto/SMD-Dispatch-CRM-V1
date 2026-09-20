import React, { useMemo } from 'react';
import { DispatchLoad } from '../types/dispatch';
import { formatCurrency, formatNumber } from '../utils/calculations';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon, DollarSign, Award } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AnalyticsViewProps {
  loads: DispatchLoad[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ loads }) => {
  const { isLightMode } = useTheme();

  const gridColor = isLightMode ? '#e2e8f0' : '#292524';
  const axisColor = isLightMode ? '#64748b' : '#78716C';
  const tooltipBg = isLightMode ? '#ffffff' : '#1C1917';
  const tooltipBorder = isLightMode ? '#cbd5e1' : '#44403C';
  const tooltipTextColor = isLightMode ? '#0f172a' : '#f8fafc';

  // 1. Revenue by Broker
  const brokerData = useMemo(() => {
    const map = new Map<string, { broker: string; gross: number; count: number }>();
    loads.forEach((l) => {
      const existing = map.get(l.brokerName) || { broker: l.brokerName, gross: 0, count: 0 };
      existing.gross += Number(l.rateGross) || 0;
      existing.count += 1;
      map.set(l.brokerName, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.gross - a.gross);
  }, [loads]);

  // 2. RPM & Miles Trend across Loads
  const rpmData = useMemo(() => {
    return loads.map((l) => ({
      load: l.loadNumber,
      rpm: Number(l.ratePerMile.toFixed(2)),
      gross: l.rateGross,
      miles: l.loadedMiles,
      driver: l.driverName,
      lane: `${l.originState} → ${l.destState}`,
    }));
  }, [loads]);

  // 3. Equipment Breakdown
  const equipmentData = useMemo(() => {
    const map = new Map<string, number>();
    loads.forEach((l) => {
      map.set(l.equipmentType, (map.get(l.equipmentType) || 0) + 1);
    });
    const colors = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#6366F1'];
    return Array.from(map.entries()).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length],
    }));
  }, [loads]);

  // Top broker
  const topBroker = brokerData[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          <span>Dispatch Performance & Rate Analytics</span>
        </h3>
        <p className="text-xs text-stone-400">
          Financial yield, broker volume distribution, equipment profitability, and RPM benchmarks
        </p>
      </div>

      {/* Top Broker Highlight Banner */}
      {topBroker && (
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-stone-900 to-stone-900 border border-amber-500/30 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Top Revenue Broker Partner
              </span>
              <h4 className="text-base font-bold text-stone-100">{topBroker.broker}</h4>
              <p className="text-xs text-stone-400">
                {topBroker.count} loads booked • {formatCurrency(topBroker.gross)} billed
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-400 block font-mono">Broker Share</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {formatCurrency(topBroker.gross)}
            </span>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue by Broker */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Gross Revenue by Broker ($)</span>
            </h4>
            <span className="text-[11px] font-mono text-stone-500">Top Freight Brokers</span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brokerData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="broker"
                  stroke={axisColor}
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis stroke={axisColor} fontSize={10} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    color: tooltipTextColor,
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Gross Revenue']}
                />
                <Bar dataKey="gross" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: RPM Performance per Load */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <span>Rate Per Mile (RPM) by Load ($/mi)</span>
            </h4>
            <span className="text-[11px] font-mono text-violet-400">Target: &gt; $3.50/mi</span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rpmData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="load" stroke={axisColor} fontSize={10} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={10} domain={['dataMin - 0.5', 'dataMax + 0.5']} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    color: tooltipTextColor,
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}/mi`, 'Rate Per Mile']}
                />
                <Line
                  type="monotone"
                  dataKey="rpm"
                  stroke="#A78BFA"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#8B5CF6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Equipment Breakdown */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-amber-400" />
              <span>Equipment Fleet Load Share</span>
            </h4>
          </div>
          <div className="h-[260px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={equipmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {equipmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    color: tooltipTextColor,
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Financial Breakdown (Gross vs Dispatch Fee vs Driver Net) */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Revenue Distribution Structure</span>
            </h4>
            <p className="text-xs text-stone-400 mb-4">
              How gross freight revenue is distributed between fleet carrier net pay and Sound Minded Dispatching, LLC fees
            </p>
          </div>

          <div className="space-y-3 p-3 bg-stone-950/60 rounded-xl border border-stone-800/80 font-mono text-xs">
            {loads.slice(0, 4).map((l) => (
              <div key={l.id} className="flex items-center justify-between py-1.5 border-b border-stone-850 last:border-0">
                <div>
                  <span className="font-bold text-stone-200">{l.loadNumber}</span>
                  <span className="text-stone-500 ml-2">({l.driverName})</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-stone-400">Gross: {formatCurrency(l.rateGross)}</span>
                  <span className="text-amber-400 font-semibold">Fee: {formatCurrency(l.dispatchFeeAmount)}</span>
                  <span className="text-blue-400 font-semibold">Net: {formatCurrency(l.driverNetPay)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300 mt-4 flex items-center justify-between">
            <span>Average Dispatch Fee Rate:</span>
            <span className="font-bold font-mono text-sm">8.8%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
