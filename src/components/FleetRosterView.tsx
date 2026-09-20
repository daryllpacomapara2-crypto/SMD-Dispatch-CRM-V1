import React from 'react';
import { FleetDriver, DispatchLoad } from '../types/dispatch';
import { formatCurrency, formatNumber } from '../utils/calculations';
import {
  Truck,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  User,
  UserPlus,
  Edit2,
  Trash2,
  Briefcase,
  Layers,
} from 'lucide-react';

interface FleetRosterViewProps {
  drivers: FleetDriver[];
  loads: DispatchLoad[];
  isAdmin: boolean;
  onSelectDriverLoads: (driverName: string) => void;
  onOpenNewDriverModal: () => void;
  onEditDriver: (driver: FleetDriver) => void;
  onDeleteDriver: (driverId: string, driverName: string) => void;
  onUpdateDriverStatus: (driverId: string, newStatus: FleetDriver['status']) => void;
}

export const FleetRosterView: React.FC<FleetRosterViewProps> = ({
  drivers,
  loads,
  isAdmin,
  onSelectDriverLoads,
  onOpenNewDriverModal,
  onEditDriver,
  onDeleteDriver,
  onUpdateDriverStatus,
}) => {
  const getDriverLoadCount = (driverId: string, driverName: string) => {
    return loads.filter((l) => l.driverId === driverId || l.driverName === driverName).length;
  };

  const getDriverActiveLoad = (driverId: string, driverName: string) => {
    const activeStatuses = ['booked', 'dispatched', 'at_pickup', 'in_transit', 'at_delivery'];
    return loads.find(
      (l) => (l.driverId === driverId || l.driverName === driverName) && activeStatuses.includes(l.status)
    );
  };

  const getStatusBadge = (status: FleetDriver['status']) => {
    switch (status) {
      case 'on_load':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'active':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'off_duty':
        return 'bg-stone-700/40 text-stone-400 border-stone-600';
      case 'maintenance':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-stone-800 text-stone-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900/60 border border-stone-800/80 p-4 rounded-xl">
        <div>
          <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <span>Sound Minded Carrier Fleet & Driver Roster</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Auto-Sync Active
            </span>
          </h3>
          <p className="text-xs text-stone-400">
            Assigned power units, trailers, authority compliance, and dispatch fee agreements. Changes save and sync immediately across all sheets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-stone-400 bg-stone-950 border border-stone-800 px-3 py-1.5 rounded-lg">
            Total Fleet: <span className="font-bold text-amber-400">{drivers.length} Units</span>
          </div>

          {isAdmin && (
            <button
              onClick={onOpenNewDriverModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Carrier / Driver</span>
            </button>
          )}
        </div>
      </div>

      {/* Driver Grid */}
      {drivers.length === 0 ? (
        <div className="p-12 text-center bg-stone-900 border border-stone-800 rounded-xl space-y-3">
          <Truck className="w-10 h-10 text-stone-600 mx-auto" />
          <h4 className="text-base font-bold text-stone-200">No Carrier Drivers in Fleet</h4>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Click the button below to register your first power unit or owner-operator to Sound Minded Dispatching.
          </p>
          {isAdmin && (
            <button
              onClick={onOpenNewDriverModal}
              className="px-4 py-2 bg-amber-500 text-stone-950 font-bold rounded-lg text-xs inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add First Driver</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((driver) => {
            const activeLoad = getDriverActiveLoad(driver.id, driver.name);
            const totalAssignedLoads = getDriverLoadCount(driver.id, driver.name);

            return (
              <div
                key={driver.id}
                className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm hover:border-amber-500/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Header with Avatar & Admin Actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-amber-400 text-sm">
                        {driver.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-100 text-sm">{driver.name}</h4>
                        <div className="text-[11px] text-stone-400 font-mono">{driver.id}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isAdmin ? (
                        <select
                          value={driver.status}
                          onChange={(e) => onUpdateDriverStatus(driver.id, e.target.value as any)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider cursor-pointer focus:outline-none ${getStatusBadge(
                            driver.status
                          )}`}
                        >
                          <option value="active" className="bg-stone-900 text-emerald-400">ACTIVE</option>
                          <option value="on_load" className="bg-stone-900 text-amber-400">ON LOAD</option>
                          <option value="off_duty" className="bg-stone-900 text-stone-400">OFF DUTY</option>
                          <option value="maintenance" className="bg-stone-900 text-rose-400">IN SHOP</option>
                        </select>
                      ) : (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(
                            driver.status
                          )}`}
                        >
                          {driver.status.replace('_', ' ')}
                        </span>
                      )}

                      {/* Admin Edit & Delete buttons */}
                      {isAdmin && (
                        <div className="flex items-center gap-1 pl-1 border-l border-stone-800">
                          <button
                            onClick={() => onEditDriver(driver)}
                            title="Edit Driver"
                            className="p-1 text-stone-400 hover:text-blue-400 hover:bg-stone-800 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteDriver(driver.id, driver.name)}
                            title="Delete Driver"
                            className="p-1 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Equipment & Unit */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-stone-950/70 border border-stone-800/80 rounded-lg text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-stone-500 uppercase block">Power Unit</span>
                      <span className="font-mono font-semibold text-stone-200">{driver.truckNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 uppercase block">Trailer</span>
                      <span className="font-mono font-semibold text-stone-200">{driver.trailerNumber}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-stone-800/60 flex items-center justify-between">
                      <span className="text-stone-400">{driver.equipmentType}</span>
                      <span className="text-amber-400 font-mono font-medium">{driver.defaultFeePercent}% Fee</span>
                    </div>
                  </div>

                  {/* Contact & Authority */}
                  <div className="space-y-1 text-xs text-stone-300 mb-3">
                    <div className="flex items-center gap-1.5 text-stone-400">
                      <Phone className="w-3.5 h-3.5 text-stone-500" />
                      <span>{driver.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-400 truncate">
                      <Mail className="w-3.5 h-3.5 text-stone-500" />
                      <span className="truncate">{driver.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-400">
                      <MapPin className="w-3.5 h-3.5 text-stone-500" />
                      <span>
                        Home: {driver.homeBase} • Now: <span className="text-stone-200">{driver.currentCityState}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-mono pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{driver.mcNumber}</span>
                      <span>•</span>
                      <span>{driver.dotNumber}</span>
                    </div>
                  </div>

                  {/* Current Active Load if any */}
                  {activeLoad ? (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs mb-3">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-amber-400 mb-1">
                        <span>Active Load: {activeLoad.loadNumber}</span>
                        <span>{activeLoad.status.replace('_', ' ')}</span>
                      </div>
                      <div className="text-stone-200 font-medium">
                        {activeLoad.originCity}, {activeLoad.originState} → {activeLoad.destCity},{' '}
                        {activeLoad.destState}
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center justify-between mt-1">
                        <span>Rate: {formatCurrency(activeLoad.rateGross)}</span>
                        <span className="text-blue-400">Net: {formatCurrency(activeLoad.driverNetPay)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-stone-950/40 border border-stone-800 rounded-lg text-xs text-stone-500 mb-3 text-center">
                      No active load currently in transit
                    </div>
                  )}
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-2 border-t border-stone-800/80 flex items-center gap-2">
                  <button
                    onClick={() => onSelectDriverLoads(driver.name)}
                    className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-amber-400 border border-stone-700/80 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View Loads ({totalAssignedLoads})</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => onEditDriver(driver)}
                      className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-blue-400 border border-stone-700 rounded-lg text-xs transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
