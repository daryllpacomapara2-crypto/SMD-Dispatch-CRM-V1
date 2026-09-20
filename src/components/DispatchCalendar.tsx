import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Truck, 
  MapPin, 
  DollarSign, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { LoadItem, Driver } from '../types';
import { useAdmin } from '../context/AdminContext';

interface DispatchCalendarProps {
  loads: LoadItem[];
  drivers: Driver[];
  onSelectLoad: (load: LoadItem) => void;
  onAddLoadOnDate?: (dateStr: string, driverName?: string) => void;
}

export const DispatchCalendar: React.FC<DispatchCalendarProps> = ({
  loads,
  drivers,
  onSelectLoad,
  onAddLoadOnDate
}) => {
  const { canEdit, checkPermissionOrPrompt } = useAdmin();

  // Current view anchor date (defaults to Aug 24, 2026 for sample data window, or current date)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    return new Date(2026, 7, 24); // Monday Aug 24, 2026
  });

  const [selectedDriverId, setSelectedDriverId] = useState<string>('ALL');

  // Generate 7 days of the week starting from currentWeekStart
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      const isoStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({ date: d, isoStr, dayName, monthDay });
    }
    return days;
  }, [currentWeekStart]);

  const handlePrevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const handleCurrentWeek = () => {
    setCurrentWeekStart(new Date(2026, 7, 24));
  };

  const filteredDrivers = useMemo(() => {
    if (selectedDriverId === 'ALL') return drivers;
    return drivers.filter(d => d.id === selectedDriverId);
  }, [drivers, selectedDriverId]);

  const handleSlotAdd = (dateStr: string, driverName?: string) => {
    checkPermissionOrPrompt(() => {
      if (onAddLoadOnDate) {
        onAddLoadOnDate(dateStr, driverName);
      }
    }, 'Admin authorization is required to schedule a load on this date.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
      case 'Delivered':
        return 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300';
      case 'In Transit':
      case 'Loaded':
        return 'bg-blue-950/80 border-blue-800/80 text-blue-300';
      case 'Dispatched':
      case 'Arrived Pickup':
        return 'bg-amber-950/80 border-amber-800/80 text-amber-300';
      case 'Booked':
        return 'bg-sky-950/80 border-sky-800/80 text-sky-300';
      default:
        return 'bg-zinc-900 border-zinc-700 text-zinc-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Calendar Top Controls */}
      <div className="bg-[#121214] rounded-xl shadow-md border border-zinc-800/80 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-500/20 text-orange-400 p-2 rounded-lg border border-orange-500/30">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-100">Weekly Dispatch &amp; Driver Timeline</h2>
              {canEdit ? (
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Admin Edit Active
                </span>
              ) : (
                <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Read Only
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Week of {weekDays[0].monthDay} – {weekDays[6].monthDay}, {weekDays[0].date.getFullYear()} (Click any load to edit/update or click empty slot to add)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Driver Filter */}
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="px-3 py-1.5 bg-[#18181b] border border-zinc-700/80 rounded-lg text-xs font-medium text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option value="ALL">All Drivers ({drivers.length})</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.assignedTruck})</option>
            ))}
          </select>

          {/* Week Navigation */}
          <div className="flex items-center space-x-1 border border-zinc-700/80 rounded-lg p-0.5 bg-[#18181b]">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition-colors cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleCurrentWeek}
              className="px-2.5 py-1 text-xs font-medium hover:bg-zinc-800 text-zinc-200 rounded transition-colors cursor-pointer"
            >
              Active Week
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition-colors cursor-pointer"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Add Load on current date */}
          <button
            onClick={() => handleSlotAdd(weekDays[0].isoStr)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Load</span>
          </button>
        </div>
      </div>

      {/* Interactive Grid Calendar */}
      <div className="bg-[#121214] rounded-xl shadow-md border border-zinc-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[960px]">
            {/* Day Header Row */}
            <div className="grid grid-cols-8 bg-[#18181b] border-b border-zinc-800 text-xs font-semibold text-zinc-300">
              <div className="p-3 border-r border-zinc-800 flex items-center">
                <span>Driver &amp; Fleet Rig</span>
              </div>
              {weekDays.map(day => (
                <div 
                  key={day.isoStr} 
                  className={`p-3 text-center border-r border-zinc-800 relative group ${
                    day.isoStr === '2026-08-26' ? 'bg-orange-950/40 text-orange-300' : ''
                  }`}
                >
                  <div className="font-bold">{day.dayName}</div>
                  <div className="text-[11px] text-zinc-400">{day.monthDay}</div>
                  <button
                    onClick={() => handleSlotAdd(day.isoStr)}
                    className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-orange-400 rounded transition-opacity cursor-pointer"
                    title={`Schedule load for ${day.monthDay}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Driver Rows */}
            <div className="divide-y divide-zinc-800">
              {filteredDrivers.map(drv => (
                <div key={drv.id} className="grid grid-cols-8 min-h-[110px] hover:bg-zinc-800/40 transition-colors">
                  {/* Driver Column */}
                  <div className="p-3 border-r border-zinc-800 bg-[#141417] flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-zinc-100 text-xs">{drv.name}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{drv.assignedTruck}</div>
                      <div className="text-[10px] text-orange-400 font-medium">{drv.equipmentType}</div>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                        drv.status === 'On Road' ? 'bg-blue-950/80 text-blue-300 border-blue-800/80' :
                        drv.status === 'Active' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80' :
                        'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}>
                        {drv.status}
                      </span>
                    </div>
                  </div>

                  {/* 7 Days Columns for this driver */}
                  {weekDays.map(day => {
                    const dayLoads = loads.filter(l => 
                      l.driverName === drv.name && 
                      (l.pickupDate === day.isoStr || l.deliveryDate === day.isoStr || (l.pickupDate <= day.isoStr && l.deliveryDate >= day.isoStr))
                    );

                    return (
                      <div 
                        key={day.isoStr} 
                        className={`p-1.5 border-r border-zinc-800 flex flex-col gap-1.5 relative group ${
                          day.isoStr === '2026-08-26' ? 'bg-orange-950/20' : ''
                        }`}
                      >
                        {dayLoads.length === 0 ? (
                          <div 
                            onClick={() => handleSlotAdd(day.isoStr, drv.name)}
                            className="h-full w-full flex flex-col items-center justify-center text-[10px] text-zinc-600 hover:text-orange-400 hover:bg-orange-950/10 rounded border border-transparent hover:border-orange-500/20 transition-all cursor-pointer select-none"
                            title={`Click to schedule load for ${drv.name} on ${day.monthDay}`}
                          >
                            <span className="group-hover:hidden">Available</span>
                            <span className="hidden group-hover:flex items-center gap-1 font-semibold text-orange-400">
                              <Plus className="w-3 h-3" /> Add Load
                            </span>
                          </div>
                        ) : (
                          dayLoads.map(load => {
                            const isPickup = load.pickupDate === day.isoStr;
                            const isDelivery = load.deliveryDate === day.isoStr;

                            return (
                              <div
                                key={load.id}
                                onClick={() => onSelectLoad(load)}
                                className={`p-2 rounded-lg border text-[11px] shadow-sm hover:scale-[1.02] hover:border-orange-400 transition-all cursor-pointer ${getStatusColor(load.status)}`}
                                title="Click to view & edit all details of this load"
                              >
                                <div className="flex items-center justify-between font-bold">
                                  <span>{load.loadNumber}</span>
                                  <span className="text-[10px] font-bold text-emerald-400">${load.totalGross}</span>
                                </div>
                                <div className="text-[10px] text-zinc-300 mt-1 flex items-center gap-1 font-medium">
                                  <MapPin className="w-2.5 h-2.5 text-zinc-400" />
                                  <span>{load.originState} → {load.destinationState}</span>
                                </div>
                                <div className="text-[9px] text-zinc-400 mt-1 flex items-center justify-between">
                                  <span>{load.status}</span>
                                  {isPickup && <span className="text-blue-400 font-semibold">PU</span>}
                                  {isDelivery && <span className="text-emerald-400 font-semibold">DEL</span>}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
