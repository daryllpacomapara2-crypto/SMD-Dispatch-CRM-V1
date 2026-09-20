import React, { useState, useMemo } from 'react';
import { 
  Fuel, 
  Plus, 
  Receipt, 
  MapPin, 
  DollarSign, 
  Gauge, 
  Trash2, 
  Edit2,
  Filter,
  FileSpreadsheet,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { ExpenseItem, Driver, LoadItem, US_STATES } from '../types';
import { useAdmin } from '../context/AdminContext';

interface IftaExpenseLogProps {
  expenses: ExpenseItem[];
  drivers: Driver[];
  loads: LoadItem[];
  onAddExpense: (expense: ExpenseItem) => void;
  onUpdateExpense?: (expense: ExpenseItem) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const IftaExpenseLog: React.FC<IftaExpenseLogProps> = ({
  expenses,
  drivers,
  loads,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense
}) => {
  const { isAdmin, canEdit, checkPermissionOrPrompt } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [stateFilter, setStateFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Form State
  const [date, setDate] = useState('2026-08-26');
  const [loadNumber, setLoadNumber] = useState('LD-8491');
  const [driverName, setDriverName] = useState(drivers[0]?.name || '');
  const [category, setCategory] = useState<ExpenseItem['category']>('Fuel');
  const [state, setState] = useState('TX');
  const [odometer, setOdometer] = useState<number>(145000);
  const [gallons, setGallons] = useState<number>(100);
  const [cost, setCost] = useState<number>(380);
  const [vendor, setVendor] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (stateFilter !== 'ALL' && e.state !== stateFilter) return false;
      if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;
      return true;
    });
  }, [expenses, stateFilter, categoryFilter]);

  const summary = useMemo(() => {
    const totalCost = filteredExpenses.reduce((sum, e) => sum + e.cost, 0);
    const totalGallons = filteredExpenses.reduce((sum, e) => sum + (e.gallons || 0), 0);
    const fuelExpenses = filteredExpenses.filter(e => e.category === 'Fuel');
    const fuelCost = fuelExpenses.reduce((sum, e) => sum + e.cost, 0);
    const avgPricePerGallon = totalGallons > 0 ? fuelCost / totalGallons : 0;

    return {
      count: filteredExpenses.length,
      totalCost,
      totalGallons,
      fuelCost,
      avgPricePerGallon
    };
  }, [filteredExpenses]);

  const handleOpenAdd = () => {
    checkPermissionOrPrompt(() => {
      setEditingExpense(null);
      setDate(new Date().toISOString().split('T')[0]);
      setLoadNumber(loads[0]?.loadNumber || 'LD-8491');
      setDriverName(drivers[0]?.name || '');
      setCategory('Fuel');
      setState('TX');
      setOdometer(145000);
      setGallons(100);
      setCost(380);
      setVendor('');
      setReceiptNumber(`RCP-${Math.floor(10000 + Math.random() * 90000)}`);
      setNotes('');
      setIsModalOpen(true);
    }, 'Admin authorization is required to add an expense entry.');
  };

  const handleOpenEdit = (item: ExpenseItem) => {
    checkPermissionOrPrompt(() => {
      setEditingExpense(item);
      setDate(item.date);
      setLoadNumber(item.loadNumber || '');
      setDriverName(item.driverName);
      setCategory(item.category);
      setState(item.state);
      setOdometer(item.odometer || 0);
      setGallons(item.gallons || 0);
      setCost(item.cost);
      setVendor(item.vendor);
      setReceiptNumber(item.receiptNumber || '');
      setNotes(item.notes || '');
      setIsModalOpen(true);
    }, 'Admin authorization is required to edit an expense record.');
  };

  const handleDelete = (id: string) => {
    checkPermissionOrPrompt(() => {
      onDeleteExpense(id);
    }, 'Admin authorization is required to delete an expense entry.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor.trim()) return;

    if (editingExpense && onUpdateExpense) {
      onUpdateExpense({
        ...editingExpense,
        date,
        loadNumber,
        driverName,
        category,
        state,
        odometer,
        gallons: category === 'Fuel' || category === 'DEF' ? gallons : undefined,
        cost,
        vendor,
        receiptNumber,
        notes
      });
    } else {
      onAddExpense({
        id: `EXP-${Date.now().toString().slice(-4)}`,
        date,
        loadNumber,
        driverName,
        category,
        state,
        odometer,
        gallons: category === 'Fuel' || category === 'DEF' ? gallons : undefined,
        cost,
        vendor,
        receiptNumber,
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
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-100">IFTA Fuel Tax &amp; Fleet Operating Expense Log</h2>
              {canEdit ? (
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Admin Write Access
                </span>
              ) : (
                <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Read Only
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              State jurisdiction fuel tax filings, odometer readings, and toll receipts (Full Admin Add, Edit, Update, Delete)
            </p>
          </div>
        </div>

        <button
          id="btn-add-expense"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 text-white shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense Entry</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#121214] p-3.5 rounded-xl border border-zinc-800/80 shadow-md">
          <span className="text-[11px] text-zinc-400 font-semibold uppercase">Total Filtered Spend</span>
          <div className="text-lg font-black text-zinc-100 mt-1">
            ${summary.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-[#121214] p-3.5 rounded-xl border border-zinc-800/80 shadow-md">
          <span className="text-[11px] text-zinc-400 font-semibold uppercase">Total Diesel Gallons</span>
          <div className="text-lg font-black text-blue-400 mt-1">
            {summary.totalGallons.toFixed(1)} gal
          </div>
        </div>

        <div className="bg-[#121214] p-3.5 rounded-xl border border-zinc-800/80 shadow-md">
          <span className="text-[11px] text-zinc-400 font-semibold uppercase">Avg Diesel $/Gal</span>
          <div className="text-lg font-black text-amber-400 mt-1">
            ${summary.avgPricePerGallon > 0 ? summary.avgPricePerGallon.toFixed(3) : '0.000'}
          </div>
        </div>

        <div className="bg-[#121214] p-3.5 rounded-xl border border-zinc-800/80 shadow-md">
          <span className="text-[11px] text-zinc-400 font-semibold uppercase">Total Receipts</span>
          <div className="text-lg font-black text-emerald-400 mt-1">
            {summary.count} logged
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-[#121214] rounded-xl shadow-md border border-zinc-800/80 p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={stateFilter}
            onChange={e => setStateFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#18181b] border border-zinc-700/80 rounded-lg text-zinc-200 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All IFTA States</option>
            {US_STATES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#18181b] border border-zinc-700/80 rounded-lg text-zinc-200 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Fuel">Fuel (Diesel #2)</option>
            <option value="DEF">DEF Fluid</option>
            <option value="Tolls">Tolls</option>
            <option value="Scale">CAT Scale</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Lumper">Lumper Fee</option>
            <option value="Hotel">Hotel</option>
            <option value="Other">Other</option>
          </select>

          {(stateFilter !== 'ALL' || categoryFilter !== 'ALL') && (
            <button
              onClick={() => {
                setStateFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className="text-xs text-orange-400 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-[#121214] rounded-xl shadow-md border border-zinc-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#18181b] text-zinc-300 font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Load ID</th>
                <th className="px-3 py-2.5">Driver</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5 text-center">State</th>
                <th className="px-3 py-2.5 text-right">Odometer</th>
                <th className="px-3 py-2.5 text-right">Gallons</th>
                <th className="px-3 py-2.5 text-right">Cost ($)</th>
                <th className="px-3 py-2.5">Vendor / Station</th>
                <th className="px-3 py-2.5">Receipt #</th>
                <th className="px-3 py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-zinc-500">
                    No expense entries found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-3 py-2 font-medium">{item.date}</td>
                    <td className="px-3 py-2 font-bold text-zinc-100">{item.loadNumber}</td>
                    <td className="px-3 py-2">{item.driverName}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        item.category === 'Fuel' ? 'bg-amber-950/80 text-amber-300 border-amber-800/80' :
                        item.category === 'Tolls' ? 'bg-blue-950/80 text-blue-300 border-blue-800/80' :
                        item.category === 'Scale' ? 'bg-purple-950/80 text-purple-300 border-purple-800/80' :
                        'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center font-bold text-zinc-200">
                      <span className="bg-[#18181b] px-2 py-0.5 rounded border border-zinc-700">{item.state}</span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{item.odometer?.toLocaleString() || '-'}</td>
                    <td className="px-3 py-2 text-right font-semibold text-blue-400">{item.gallons ? `${item.gallons} gal` : '-'}</td>
                    <td className="px-3 py-2 text-right font-bold text-emerald-400">${item.cost.toFixed(2)}</td>
                    <td className="px-3 py-2 font-medium truncate max-w-[180px] text-zinc-200">{item.vendor}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-zinc-400">{item.receiptNumber || '-'}</td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-zinc-400 hover:text-orange-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                          title="Edit / Update Expense"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#141417] rounded-xl shadow-xl border border-zinc-800 max-w-lg w-full p-6 space-y-4 text-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-100">
                {editingExpense ? 'Edit / Update Expense Entry' : 'Add IFTA & Trip Expense'}
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
                  <label className="block text-zinc-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Fuel">Fuel (Diesel #2)</option>
                    <option value="DEF">DEF Fluid</option>
                    <option value="Tolls">Tolls</option>
                    <option value="Scale">CAT Scale</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Lumper">Lumper Fee</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Assigned Driver</label>
                  <select
                    value={driverName}
                    onChange={e => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Load ID #</label>
                  <select
                    value={loadNumber}
                    onChange={e => setLoadNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
                  >
                    {loads.map(l => (
                      <option key={l.id} value={l.loadNumber}>{l.loadNumber} ({l.originCity} to {l.destinationCity})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">State (IFTA)</label>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
                  >
                    {US_STATES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Odometer</label>
                  <input
                    type="number"
                    value={odometer}
                    onChange={e => setOdometer(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="145000"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Total Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cost}
                    onChange={e => setCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {(category === 'Fuel' || category === 'DEF') && (
                <div className="bg-[#18181b] p-3 rounded-lg border border-zinc-800">
                  <label className="block text-zinc-300 font-semibold mb-1">Gallons Purchased</label>
                  <input
                    type="number"
                    step="0.1"
                    value={gallons}
                    onChange={e => setGallons(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="100.0"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Vendor / Truck Stop Name *</label>
                  <input
                    type="text"
                    required
                    value={vendor}
                    onChange={e => setVendor(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="e.g. Love's Travel Stop #402"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Receipt / Invoice #</label>
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={e => setReceiptNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="RCP-12345"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="Optional details..."
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
                  {editingExpense ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
