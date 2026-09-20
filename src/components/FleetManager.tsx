import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Phone, 
  Mail, 
  Truck, 
  ShieldCheck, 
  DollarSign, 
  Edit2, 
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Lock
} from 'lucide-react';
import { Driver, EquipmentType, EQUIPMENT_OPTIONS } from '../types';
import { useAdmin } from '../context/AdminContext';

interface FleetManagerProps {
  drivers: Driver[];
  onAddDriver: (driver: Driver) => void;
  onUpdateDriver: (driver: Driver) => void;
  onDeleteDriver: (driverId: string) => void;
}

export const FleetManager: React.FC<FleetManagerProps> = ({
  drivers,
  onAddDriver,
  onUpdateDriver,
  onDeleteDriver
}) => {
  const { canEdit, checkPermissionOrPrompt } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cdlNumber, setCdlNumber] = useState('');
  const [homeBase, setHomeBase] = useState('');
  const [assignedTruck, setAssignedTruck] = useState('');
  const [assignedTrailer, setAssignedTrailer] = useState('');
  const [equipmentType, setEquipmentType] = useState<EquipmentType>('Dry Van 53\'');
  const [payType, setPayType] = useState<'Percentage' | 'Per Mile' | 'Flat Weekly'>('Percentage');
  const [payRateValue, setPayRateValue] = useState<number>(28);
  const [status, setStatus] = useState<'Active' | 'On Road' | 'Off Duty' | 'Maintenance'>('Active');
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    checkPermissionOrPrompt(() => {
      setEditingDriver(null);
      setName('');
      setPhone('');
      setEmail('');
      setCdlNumber(`CDL-${Math.floor(1000000 + Math.random() * 9000000)}`);
      setHomeBase('');
      setAssignedTruck(`TRK-${Math.floor(100 + Math.random() * 900)}`);
      setAssignedTrailer(`TRL-${Math.floor(500 + Math.random() * 400)}`);
      setEquipmentType('Dry Van 53\'');
      setPayType('Percentage');
      setPayRateValue(28);
      setStatus('Active');
      setNotes('');
      setIsModalOpen(true);
    }, 'Admin authorization is required to add drivers to the fleet.');
  };

  const handleOpenEdit = (drv: Driver) => {
    checkPermissionOrPrompt(() => {
      setEditingDriver(drv);
      setName(drv.name);
      setPhone(drv.phone);
      setEmail(drv.email);
      setCdlNumber(drv.cdlNumber);
      setHomeBase(drv.homeBase);
      setAssignedTruck(drv.assignedTruck);
      setAssignedTrailer(drv.assignedTrailer);
      setEquipmentType(drv.equipmentType);
      setPayType(drv.payType);
      setPayRateValue(drv.payRateValue);
      setStatus(drv.status);
      setNotes(drv.notes || '');
      setIsModalOpen(true);
    }, 'Admin authorization is required to edit driver profiles.');
  };

  const handleDelete = (id: string) => {
    checkPermissionOrPrompt(() => {
      onDeleteDriver(id);
    }, 'Admin authorization is required to delete drivers from the fleet.');
  };

  const handleStatusChange = (drv: Driver, newStatus: any) => {
    checkPermissionOrPrompt(() => {
      onUpdateDriver({ ...drv, status: newStatus });
    }, 'Admin authorization is required to update driver status.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingDriver) {
      onUpdateDriver({
        ...editingDriver,
        name,
        phone,
        email,
        cdlNumber,
        homeBase,
        assignedTruck,
        assignedTrailer,
        equipmentType,
        payType,
        payRateValue,
        status,
        notes
      });
    } else {
      onAddDriver({
        id: `DRV-${Date.now().toString().slice(-4)}`,
        name,
        phone,
        email,
        cdlNumber,
        homeBase,
        assignedTruck,
        assignedTrailer,
        equipmentType,
        payType,
        payRateValue,
        status,
        notes
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-[#121214] rounded-xl shadow-md border border-zinc-800/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-500/20 text-orange-400 p-2.5 rounded-lg border border-orange-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-100">Fleet &amp; Driver Roster</h2>
              {canEdit ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Admin Write Access
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" /> Read Only
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Manage truck drivers, equipment assignments, pay structures, and duty statuses with full Admin CRUD controls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-add-driver"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Driver</span>
          </button>
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map(drv => (
          <div 
            key={drv.id} 
            className="bg-[#121214] rounded-xl border border-zinc-800/80 shadow-md hover:border-zinc-700 transition-colors p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">{drv.name}</h3>
                  <p className="text-xs text-zinc-400">{drv.homeBase || 'Unassigned Base'}</p>
                </div>

                {/* Quick Status Switcher Dropdown */}
                <select
                  value={drv.status}
                  onChange={(e) => handleStatusChange(drv, e.target.value)}
                  title="Quick-change duty status (Admin authorized)"
                  className={`text-[11px] font-semibold px-2 py-1 rounded-md border cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    drv.status === 'On Road' ? 'bg-blue-950/80 text-blue-300 border-blue-800/80' :
                    drv.status === 'Active' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80' :
                    drv.status === 'Maintenance' ? 'bg-amber-950/80 text-amber-300 border-amber-800/80' :
                    'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}
                >
                  <option value="Active" className="bg-[#18181b] text-zinc-200">Active</option>
                  <option value="On Road" className="bg-[#18181b] text-zinc-200">On Road</option>
                  <option value="Off Duty" className="bg-[#18181b] text-zinc-200">Off Duty</option>
                  <option value="Maintenance" className="bg-[#18181b] text-zinc-200">Maintenance</option>
                </select>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{drv.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="truncate">{drv.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-mono text-[11px] text-zinc-300">{drv.cdlNumber}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-zinc-800/80 bg-[#18181b] p-2.5 rounded-lg space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Rig:</span>
                  <span className="font-medium text-zinc-200">{drv.assignedTruck}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Trailer:</span>
                  <span className="font-medium text-zinc-200">{drv.assignedTrailer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Equipment:</span>
                  <span className="font-semibold text-orange-400">{drv.equipmentType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Pay Structure:</span>
                  <span className="font-bold text-emerald-400">
                    {drv.payType === 'Percentage' ? `${drv.payRateValue}% of Gross` :
                     drv.payType === 'Per Mile' ? `$${drv.payRateValue}/mile` :
                     `$${drv.payRateValue}/week flat`}
                  </span>
                </div>
              </div>

              {drv.notes && (
                <p className="mt-2 text-[11px] text-zinc-300 italic bg-zinc-800/50 p-1.5 rounded border border-zinc-700/60">
                  {drv.notes}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-end space-x-2">
              <button
                onClick={() => handleOpenEdit(drv)}
                className="px-2.5 py-1 text-xs font-medium text-orange-400 hover:text-orange-300 hover:bg-orange-950/40 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => handleDelete(drv.id)}
                className="px-2.5 py-1 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#141417] rounded-xl shadow-xl border border-zinc-800 max-w-lg w-full p-6 space-y-4 text-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-100">
                {editingDriver ? 'Edit Driver & Fleet Profile' : 'Add New Driver & Rig'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Full Driver Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="e.g. Marcus Vance"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">CDL Number *</label>
                  <input
                    type="text"
                    required
                    value={cdlNumber}
                    onChange={e => setCdlNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="e.g. CDL-TX982341"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="(555) 000-0000"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="driver@soundmindeddispatch.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Assigned Truck #</label>
                  <input
                    type="text"
                    value={assignedTruck}
                    onChange={e => setAssignedTruck(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="TRK-104"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Assigned Trailer #</label>
                  <input
                    type="text"
                    value={assignedTrailer}
                    onChange={e => setAssignedTrailer(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="TRL-504"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Home Base / Hub</label>
                  <input
                    type="text"
                    value={homeBase}
                    onChange={e => setHomeBase(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="Dallas, TX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Equipment Specialization</label>
                  <select
                    value={equipmentType}
                    onChange={e => setEquipmentType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
                  >
                    {EQUIPMENT_OPTIONS.map(eq => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Duty Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Active">Active / Ready for Dispatch</option>
                    <option value="On Road">On Road (In-Transit)</option>
                    <option value="Off Duty">Off Duty / Rest</option>
                    <option value="Maintenance">Truck in Shop / PM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#18181b] p-3 rounded-lg border border-zinc-800">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Pay Method</label>
                  <select
                    value={payType}
                    onChange={e => setPayType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#141417] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Percentage">Percentage of Gross (%)</option>
                    <option value="Per Mile">Per Dispatched Mile ($/mi)</option>
                    <option value="Flat Weekly">Flat Weekly Salary ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    {payType === 'Percentage' ? 'Gross Rate % (e.g. 28)' :
                     payType === 'Per Mile' ? 'Rate / Mile $ (e.g. 0.65)' :
                     'Weekly Amount $ (e.g. 1800)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={payRateValue}
                    onChange={e => setPayRateValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#141417] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold text-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Driver Notes &amp; Endorsements</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="e.g. Hazmat endorsed, TWIC card holder, prefers Midwest lanes"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-700 rounded-lg text-zinc-300 font-medium hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-500 cursor-pointer"
                >
                  {editingDriver ? 'Save Changes' : 'Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
