import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  KeyRound, 
  History, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  User, 
  RefreshCw, 
  FileSpreadsheet,
  Users,
  Building2,
  Fuel,
  Sparkles,
  UserPlus,
  Eye,
  EyeOff,
  UserCheck,
  ShieldAlert,
  LogOut
} from 'lucide-react';
import { useAdmin, SUPER_ADMIN_EMAIL, SUPER_ADMIN_NAME } from '../context/AdminContext';
import { AdminRole, LoadItem, Driver, Broker, ExpenseItem } from '../types';

interface AdminControlCenterModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  loads?: LoadItem[];
  drivers?: Driver[];
  brokers?: Broker[];
  expenses?: ExpenseItem[];
  allData?: { loads?: LoadItem[]; drivers?: Driver[]; brokers?: Broker[]; expenses?: ExpenseItem[] };
  onImportAllData?: (data: { loads?: LoadItem[]; drivers?: Driver[]; brokers?: Broker[]; expenses?: ExpenseItem[] }) => void;
  onImportData?: (data: { loads?: LoadItem[]; drivers?: Driver[]; brokers?: Broker[]; expenses?: ExpenseItem[] }) => void;
  onResetToDefaults?: () => void;
  onClearAllData?: () => void;
}

export const AdminControlCenterModal: React.FC<AdminControlCenterModalProps> = ({
  isOpen,
  onClose,
  loads: propLoads = [],
  drivers: propDrivers = [],
  brokers: propBrokers = [],
  expenses: propExpenses = [],
  allData,
  onImportAllData,
  onImportData,
  onResetToDefaults,
  onClearAllData
}) => {
  const { 
    isControlModalOpen: ctxIsOpen, 
    setIsControlModalOpen, 
    adminUser, 
    isAdmin, 
    lockAdmin, 
    setRole, 
    adminPin, 
    updateAdminPin, 
    auditLogs, 
    clearAuditLogs,
    logAudit,
    adminAccounts,
    addAdminAccount,
    updateAdminAccount,
    deleteAdminAccount,
    toggleAccountStatus,
    logout
  } = useAdmin();

  const loads = propLoads.length > 0 ? propLoads : (allData?.loads || []);
  const drivers = propDrivers.length > 0 ? propDrivers : (allData?.drivers || []);
  const brokers = propBrokers.length > 0 ? propBrokers : (allData?.brokers || []);
  const expenses = propExpenses.length > 0 ? propExpenses : (allData?.expenses || []);

  const handleClose = onClose || (() => setIsControlModalOpen(false));
  const triggerImport = onImportAllData || onImportData;

  const [activeTab, setActiveTab] = useState<'overview' | 'credentials' | 'audit' | 'security' | 'backup'>('overview');
  const [newPin, setNewPin] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [pinErrorMsg, setPinErrorMsg] = useState('');
  const [auditFilter, setAuditFilter] = useState<string>('ALL');

  // New Credential Creation Form State
  const [newAccName, setNewAccName] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccPass, setNewAccPass] = useState('');
  const [newAccRole, setNewAccRole] = useState<AdminRole>('dispatcher');
  const [newAccNotes, setNewAccNotes] = useState('');
  const [accSuccessMsg, setAccSuccessMsg] = useState('');
  const [accErrorMsg, setAccErrorMsg] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState<{ [id: string]: boolean }>({});

  const togglePasswordReveal = (id: string) => {
    setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAccSuccessMsg('');
    setAccErrorMsg('');

    const res = addAdminAccount({
      name: newAccName,
      email: newAccEmail,
      pinOrPassword: newAccPass,
      role: newAccRole,
      status: 'active',
      notes: newAccNotes
    });

    if (res.success) {
      setAccSuccessMsg(`Login credential successfully created for ${newAccName}!`);
      setNewAccName('');
      setNewAccEmail('');
      setNewAccPass('');
      setNewAccNotes('');
      setTimeout(() => setAccSuccessMsg(''), 4000);
    } else {
      setAccErrorMsg(res.error || 'Failed to create account.');
    }
  };

  const isModalOpen = isOpen !== undefined ? isOpen : ctxIsOpen;
  if (!isModalOpen) return null;

  const handlePinUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPinSuccessMsg('');
    setPinErrorMsg('');
    const res = updateAdminPin(newPin);
    if (res.success) {
      setPinSuccessMsg('Admin PIN successfully updated!');
      setNewPin('');
      setTimeout(() => setPinSuccessMsg(''), 3500);
    } else {
      setPinErrorMsg(res.error || 'Failed to update PIN');
    }
  };

  const handleExportJson = () => {
    const backupData = {
      exportTimestamp: new Date().toISOString(),
      exportedBy: adminUser.email,
      system: 'Sound Minded Dispatching, LLC Trucking CRM',
      recordCounts: {
        loads: loads.length,
        drivers: drivers.length,
        brokers: brokers.length,
        expenses: expenses.length
      },
      data: {
        loads,
        drivers,
        brokers,
        expenses
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sound_minded_dispatch_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    logAudit('BACKUP', 'SYSTEM', 'JSON Database Exported', `Exported ${loads.length} loads, ${drivers.length} drivers, ${brokers.length} brokers, ${expenses.length} expenses.`);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const data = json.data || json;
        if (Array.isArray(data.loads) || Array.isArray(data.drivers)) {
          if (triggerImport) {
            triggerImport({
              loads: data.loads || [],
              drivers: data.drivers || [],
              brokers: data.brokers || [],
              expenses: data.expenses || []
            });
          }
          logAudit('RESTORE', 'SYSTEM', 'Database Restored from JSON', `Imported ${data.loads?.length || 0} loads from backup.`);
          alert(`Successfully restored ${data.loads?.length || 0} loads, ${data.drivers?.length || 0} drivers, ${data.brokers?.length || 0} brokers!`);
        } else {
          alert('Invalid backup file format. Expected JSON backup containing loads and drivers array.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredLogs = auditLogs.filter(log => {
    if (auditFilter === 'ALL') return true;
    return log.action === auditFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#141417] border border-orange-500/40 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col text-zinc-200 relative overflow-hidden">
        {/* Top Gradient Banner */}
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 shrink-0" />

        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-[#16161a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Admin Control Center</h2>
                <span className="text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full font-bold">
                  {adminUser.isUnlocked ? 'Unlocked & Active' : 'Locked (Viewer)'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Primary Administrator: <span className="text-orange-400 font-semibold">{SUPER_ADMIN_EMAIL}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-zinc-800/80 bg-[#121215] text-xs font-semibold shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role &amp; Permissions</span>
          </button>

          <button
            onClick={() => setActiveTab('credentials')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'credentials'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Admin Logins &amp; Credentials ({adminAccounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>PIN &amp; Security</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup &amp; Database</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: OVERVIEW & ROLES */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-[#19191e] p-4 rounded-xl border border-zinc-800 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-zinc-100">{SUPER_ADMIN_NAME}</span>
                    <span className="text-[10px] bg-orange-950/80 text-orange-400 border border-orange-800/80 px-2 py-0.2 rounded font-mono font-bold">
                      SUPER ADMIN
                    </span>
                  </div>
                  <div className="text-zinc-400 text-xs">{SUPER_ADMIN_EMAIL}</div>
                  <p className="text-zinc-400 text-[11px] mt-2">
                    Authorized to add, edit, update, and delete all records across all sheets: Master Loads, Active Dispatches, Settlement, Fleet Drivers, Brokers Directory, Dispatch Calendar, and IFTA Expense Logs.
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {adminUser.isUnlocked ? (
                    <button
                      onClick={lockAdmin}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/40 rounded-lg font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                      title="Temporarily lock admin controls into read-only viewer mode"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock to Viewer</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setRole('super_admin')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlock Super Admin</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Role Selection Matrix */}
              <div>
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Active Access Level
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div 
                    onClick={() => setRole('super_admin')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      adminUser.role === 'super_admin' && adminUser.isUnlocked
                        ? 'bg-orange-950/30 border-orange-500 ring-1 ring-orange-500/50'
                        : 'bg-[#18181b] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-zinc-100">Super Admin</span>
                      <ShieldCheck className="w-4 h-4 text-orange-400" />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Full write, edit, inline update, and deletion across all 9 pages &amp; tabs.
                    </p>
                  </div>

                  <div 
                    onClick={() => setRole('dispatcher')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      adminUser.role === 'dispatcher' && adminUser.isUnlocked
                        ? 'bg-blue-950/30 border-blue-500 ring-1 ring-blue-500/50'
                        : 'bg-[#18181b] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-zinc-100">Dispatcher</span>
                      <Users className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Can create &amp; update loads and drivers, but cannot clear or wipe databases.
                    </p>
                  </div>

                  <div 
                    onClick={() => setRole('viewer')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      adminUser.role === 'viewer' || !adminUser.isUnlocked
                        ? 'bg-zinc-800 border-zinc-500'
                        : 'bg-[#18181b] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-zinc-100">Viewer Mode</span>
                      <Lock className="w-4 h-4 text-zinc-400" />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Read-only access. Modification actions prompt the Admin Login dialog.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Summary Quick Stats */}
              <div className="bg-[#18181b] p-3.5 rounded-xl border border-zinc-800 grid grid-cols-4 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase">Loads</span>
                  <div className="font-bold text-sm text-zinc-100">{loads.length}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase">Fleet Drivers</span>
                  <div className="font-bold text-sm text-zinc-100">{drivers.length}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase">Brokers</span>
                  <div className="font-bold text-sm text-zinc-100">{brokers.length}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase">IFTA Expenses</span>
                  <div className="font-bold text-sm text-zinc-100">{expenses.length}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CREDENTIALS & ADMIN USER MANAGEMENT */}
          {activeTab === 'credentials' && (
            <div className="space-y-4">
              {/* Form: Create New Admin Login */}
              <div className="bg-[#18181c] p-4 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-orange-400" />
                    <h4 className="font-bold text-zinc-100 text-sm">
                      Create Admin / Dispatcher Login
                    </h4>
                  </div>
                  <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded font-mono">
                    Direct Credential Provisioning
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Provision new authorized login credentials for staff. All random, unauthorized logins are denied access.
                </p>

                {accSuccessMsg && (
                  <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-lg p-2.5 flex items-center gap-2 text-emerald-200 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{accSuccessMsg}</span>
                  </div>
                )}

                {accErrorMsg && (
                  <div className="bg-red-950/60 border border-red-500/40 rounded-lg p-2.5 flex items-center gap-2 text-red-200 text-xs">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{accErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleCreateAccount} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={newAccName}
                        onChange={e => setNewAccName(e.target.value)}
                        placeholder="e.g. Marcus Vance"
                        className="w-full bg-[#121215] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                        Login Email / Username *
                      </label>
                      <input
                        type="text"
                        value={newAccEmail}
                        onChange={e => setNewAccEmail(e.target.value)}
                        placeholder="e.g. marcus@soundminded.com"
                        className="w-full bg-[#121215] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                        Password or PIN *
                      </label>
                      <input
                        type="text"
                        value={newAccPass}
                        onChange={e => setNewAccPass(e.target.value)}
                        placeholder="e.g. dispatch2026"
                        className="w-full bg-[#121215] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                        Authorization Role
                      </label>
                      <select
                        value={newAccRole}
                        onChange={e => setNewAccRole(e.target.value as AdminRole)}
                        className="w-full bg-[#121215] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-orange-500"
                      >
                        <option value="dispatcher">Dispatcher (Full CRUD on Loads &amp; Fleet)</option>
                        <option value="super_admin">Super Admin (Full CRUD + User &amp; Settings)</option>
                        <option value="viewer">Viewer (Read-Only Access)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Notes / Shift Details
                    </label>
                    <input
                      type="text"
                      value={newAccNotes}
                      onChange={e => setNewAccNotes(e.target.value)}
                      placeholder="e.g. Day shift dispatch lead - West Coast fleet"
                      className="w-full bg-[#121215] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-[0.98]"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Save &amp; Create Credential</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Roster: Authorized Credentials List */}
              <div className="bg-[#18181c] p-4 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-zinc-100 text-sm flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Authorized System Logins ({adminAccounts.length})</span>
                  </h4>
                  <span className="text-[10px] text-zinc-400">
                    Accounts can sign in at SMD Dispatch CRM Login
                  </span>
                </div>

                <div className="space-y-2">
                  {adminAccounts.map(account => {
                    const isOwner = account.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
                    const isRevealed = revealedPasswords[account.id];

                    return (
                      <div
                        key={account.id}
                        className={`p-3 rounded-xl border transition-all ${
                          account.status === 'suspended'
                            ? 'bg-zinc-900/50 border-red-900/30 opacity-75'
                            : 'bg-[#131317] border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start sm:items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              account.role === 'super_admin'
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                : account.role === 'dispatcher'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}>
                              {account.name.slice(0, 2).toUpperCase()}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-zinc-100 text-xs">{account.name}</span>
                                <span className={`text-[10px] px-2 py-0.2 rounded font-mono font-semibold ${
                                  account.role === 'super_admin'
                                    ? 'bg-orange-950/80 text-orange-300 border border-orange-800/80'
                                    : account.role === 'dispatcher'
                                    ? 'bg-blue-950/80 text-blue-300 border border-blue-800/80'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}>
                                  {account.role.toUpperCase()}
                                </span>
                                <span className={`text-[10px] px-2 py-0.2 rounded font-mono font-semibold ${
                                  account.status === 'active'
                                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                                    : 'bg-red-950/80 text-red-400 border border-red-800/80'
                                }`}>
                                  {account.status.toUpperCase()}
                                </span>
                                {isOwner && (
                                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded">
                                    Primary Owner
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                {account.email}
                              </div>

                              {account.notes && (
                                <div className="text-[10px] text-zinc-500 mt-0.5">
                                  {account.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {/* Password / PIN view */}
                            <div className="flex items-center gap-1 bg-[#1a1a20] px-2.5 py-1 rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-300">
                              <KeyRound className="w-3 h-3 text-orange-400" />
                              <span>{isRevealed ? account.pinOrPassword : '••••••••'}</span>
                              <button
                                type="button"
                                onClick={() => togglePasswordReveal(account.id)}
                                className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer ml-1"
                                title={isRevealed ? 'Hide credential' : 'Show credential'}
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            {/* Status toggle button */}
                            {!isOwner && (
                              <button
                                type="button"
                                onClick={() => toggleAccountStatus(account.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors ${
                                  account.status === 'active'
                                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                    : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200'
                                }`}
                              >
                                {account.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                            )}

                            {/* Delete button */}
                            {!isOwner && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete login credential for ${account.name} (${account.email})?`)) {
                                    deleteAdminAccount(account.id);
                                  }
                                }}
                                className="p-1 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors"
                                title="Delete Login Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT TRAIL LOG */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <select
                    value={auditFilter}
                    onChange={e => setAuditFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-[#1a1a1e] border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="ALL">All Actions</option>
                    <option value="ADD">Add / Create</option>
                    <option value="EDIT">Edit</option>
                    <option value="UPDATE">Update</option>
                    <option value="DELETE">Delete</option>
                    <option value="BACKUP">Backup</option>
                  </select>
                  <span className="text-[11px] text-zinc-400">
                    Showing {filteredLogs.length} audit event{filteredLogs.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {auditLogs.length > 0 && (
                  <button
                    onClick={clearAuditLogs}
                    className="text-zinc-400 hover:text-rose-400 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Logs</span>
                  </button>
                )}
              </div>

              <div className="bg-[#121214] border border-zinc-800 rounded-xl overflow-hidden max-h-[340px] overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500">
                    No activity logs found.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#18181b] text-zinc-400 border-b border-zinc-800 sticky top-0">
                      <tr>
                        <th className="px-3 py-2">Time</th>
                        <th className="px-3 py-2">Action</th>
                        <th className="px-3 py-2">Entity</th>
                        <th className="px-3 py-2">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-zinc-800/30">
                          <td className="px-3 py-2 font-mono text-zinc-400 whitespace-nowrap text-[11px]">
                            {log.timeFormatted}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              log.action === 'ADD' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80' :
                              log.action === 'EDIT' || log.action === 'UPDATE' ? 'bg-blue-950/80 text-blue-300 border-blue-800/80' :
                              log.action === 'DELETE' ? 'bg-rose-950/80 text-rose-300 border-rose-800/80' :
                              'bg-zinc-800 text-zinc-300 border-zinc-700'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-semibold text-zinc-300 text-[11px]">
                            {log.entity}
                          </td>
                          <td className="px-3 py-2 text-zinc-300">
                            <div className="font-medium text-zinc-100">{log.title}</div>
                            <div className="text-[11px] text-zinc-400">{log.details}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & PIN */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-[#18181b] p-4 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">Current Master PIN</span>
                  <span className="font-mono text-orange-400 font-bold bg-[#141417] px-2.5 py-1 rounded border border-zinc-700">
                    {adminPin}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  This PIN allows unlocking Super Admin access on any device or browser session. Default PIN is <span className="font-mono font-bold text-orange-300">admin123</span>.
                </p>
              </div>

              <form onSubmit={handlePinUpdate} className="bg-[#18181b] p-4 rounded-xl border border-zinc-800 space-y-3">
                <h4 className="font-bold text-zinc-200">Update Master PIN / Passcode</h4>

                {pinSuccessMsg && (
                  <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{pinSuccessMsg}</span>
                  </div>
                )}

                {pinErrorMsg && (
                  <div className="p-2.5 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pinErrorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-zinc-400 mb-1">New 4+ Digit PIN or Passphrase</label>
                  <input
                    type="text"
                    required
                    value={newPin}
                    onChange={e => setNewPin(e.target.value)}
                    placeholder="e.g. 8492 or MySecureTruckingPass"
                    className="w-full px-3 py-2 bg-[#141417] border border-zinc-700 rounded-lg text-zinc-100 font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
                >
                  Save New Admin PIN
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: BACKUP & DATABASE MANAGEMENT */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="bg-[#18181b] p-4 rounded-xl border border-zinc-800 space-y-3">
                <h4 className="font-bold text-zinc-200 flex items-center gap-2">
                  <Download className="w-4 h-4 text-orange-400" />
                  <span>Full Database Backup (.JSON)</span>
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Export complete data snapshot containing all loads, drivers, brokers, and expenses into a portable JSON file for offline archival or migration.
                </p>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-3.5 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON Database Snapshot</span>
                </button>
              </div>

              <div className="bg-[#18181b] p-4 rounded-xl border border-zinc-800 space-y-3">
                <h4 className="font-bold text-zinc-200 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Restore Database from File</span>
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Select a previously exported JSON backup file to restore all entries.
                </p>
                <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose JSON File to Restore</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#16161a] border-t border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Admin Active: {SUPER_ADMIN_EMAIL}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsControlModalOpen(false);
                logout();
              }}
              className="px-3.5 py-2 bg-red-950/70 hover:bg-red-900/90 text-red-300 border border-red-800/80 font-semibold rounded-lg text-xs cursor-pointer transition-colors flex items-center gap-1.5"
              title="Lock CRM and return to SMD Dispatch CRM Login Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock &amp; Return to Login Window</span>
            </button>
            <button
              onClick={() => setIsControlModalOpen(false)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
