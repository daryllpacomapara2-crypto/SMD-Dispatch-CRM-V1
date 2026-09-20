import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Phone, 
  Mail, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  Edit2, 
  Trash2,
  Lock
} from 'lucide-react';
import { Broker, PaymentTerms, PAYMENT_TERMS_OPTIONS } from '../types';
import { useAdmin } from '../context/AdminContext';

interface BrokersDirectoryProps {
  brokers: Broker[];
  onAddBroker: (broker: Broker) => void;
  onUpdateBroker: (broker: Broker) => void;
  onDeleteBroker: (brokerId: string) => void;
}

export const BrokersDirectory: React.FC<BrokersDirectoryProps> = ({
  brokers,
  onAddBroker,
  onUpdateBroker,
  onDeleteBroker
}) => {
  const { canEdit, checkPermissionOrPrompt } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState<Broker | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [mcNumber, setMcNumber] = useState('');
  const [dotNumber, setDotNumber] = useState('');
  const [creditScore, setCreditScore] = useState<number>(95);
  const [creditRating, setCreditRating] = useState<'A+ High' | 'A Good' | 'B Medium' | 'C Caution'>('A+ High');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('Net 30');
  const [factoringApproved, setFactoringApproved] = useState<boolean>(true);
  const [daysToPay, setDaysToPay] = useState<number>(25);
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    checkPermissionOrPrompt(() => {
      setEditingBroker(null);
      setName('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setMcNumber(`MC-${Math.floor(100000 + Math.random() * 900000)}`);
      setDotNumber(`DOT-${Math.floor(1000000 + Math.random() * 9000000)}`);
      setCreditScore(95);
      setCreditRating('A+ High');
      setPaymentTerms('Net 30');
      setFactoringApproved(true);
      setDaysToPay(25);
      setNotes('');
      setIsModalOpen(true);
    }, 'Admin authorization is required to add broker profiles.');
  };

  const handleOpenEdit = (b: Broker) => {
    checkPermissionOrPrompt(() => {
      setEditingBroker(b);
      setName(b.name);
      setContactPerson(b.contactPerson);
      setPhone(b.phone);
      setEmail(b.email);
      setMcNumber(b.mcNumber);
      setDotNumber(b.dotNumber || '');
      setCreditScore(b.creditScore);
      setCreditRating(b.creditRating);
      setPaymentTerms(b.paymentTerms);
      setFactoringApproved(b.factoringApproved);
      setDaysToPay(b.daysToPay);
      setNotes(b.notes || '');
      setIsModalOpen(true);
    }, 'Admin authorization is required to edit broker accounts.');
  };

  const handleDelete = (id: string) => {
    checkPermissionOrPrompt(() => {
      onDeleteBroker(id);
    }, 'Admin authorization is required to delete broker records.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingBroker) {
      onUpdateBroker({
        ...editingBroker,
        name,
        contactPerson,
        phone,
        email,
        mcNumber,
        dotNumber,
        creditScore,
        creditRating,
        paymentTerms,
        factoringApproved,
        daysToPay,
        notes
      });
    } else {
      onAddBroker({
        id: `BRK-${Date.now().toString().slice(-4)}`,
        name,
        contactPerson,
        phone,
        email,
        mcNumber,
        dotNumber,
        creditScore,
        creditRating,
        paymentTerms,
        factoringApproved,
        daysToPay,
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
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-100">Freight Brokers &amp; Customers Directory</h2>
              {canEdit ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Admin Authorized
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" /> Read Only
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              MC authority, credit risk scores, factoring eligibility, and payment schedules
            </p>
          </div>
        </div>

        <button
          id="btn-add-broker"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 text-white shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Broker</span>
        </button>
      </div>

      {/* Grid of Brokers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brokers.map(b => (
          <div 
            key={b.id} 
            className="bg-[#121214] rounded-xl border border-zinc-800/80 shadow-md hover:border-zinc-700 transition-colors p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">{b.name}</h3>
                  <p className="text-xs text-zinc-400">Attn: {b.contactPerson || 'Dispatch Team'}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  b.creditRating === 'A+ High' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80' :
                  b.creditRating === 'A Good' ? 'bg-blue-950/80 text-blue-300 border-blue-800/80' :
                  'bg-amber-950/80 text-amber-300 border-amber-800/80'
                }`}>
                  Score: {b.creditScore} ({b.creditRating})
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{b.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="truncate">{b.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-mono text-[11px] text-zinc-300">{b.mcNumber} {b.dotNumber && `| ${b.dotNumber}`}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-zinc-800/80 bg-[#18181b] p-2.5 rounded-lg space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Payment Terms:</span>
                  <span className="font-semibold text-zinc-200">{b.paymentTerms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Avg Days to Pay:</span>
                  <span className="font-medium text-zinc-300">{b.daysToPay} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Factoring Approved:</span>
                  <span className={`font-semibold flex items-center gap-1 ${
                    b.factoringApproved ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {b.factoringApproved ? (
                      <><CheckCircle className="w-3 h-3" /> Yes (Approved)</>
                    ) : (
                      <><AlertTriangle className="w-3 h-3" /> No (Direct)</>
                    )}
                  </span>
                </div>
              </div>

              {b.notes && (
                <p className="mt-2 text-[11px] text-zinc-300 italic bg-zinc-800/50 p-1.5 rounded border border-zinc-700/60">
                  {b.notes}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-end space-x-2">
              <button
                onClick={() => handleOpenEdit(b)}
                className="px-2.5 py-1 text-xs font-medium text-orange-400 hover:text-orange-300 hover:bg-orange-950/40 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => handleDelete(b.id)}
                className="px-2.5 py-1 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Broker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#141417] rounded-xl shadow-xl border border-zinc-800 max-w-lg w-full p-6 space-y-4 text-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-100">
                {editingBroker ? 'Edit Brokerage Account' : 'Add New Broker / Customer'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Company / Brokerage Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="e.g. C.H. Robinson Worldwide"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Contact Person / Rep</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="Logistics Agent"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="(800) 555-0199"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Email / Invoicing</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="invoicing@brokerage.com"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">MC Number *</label>
                  <input
                    type="text"
                    required
                    value={mcNumber}
                    onChange={e => setMcNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="MC-123456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Credit Score (1-100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={creditScore}
                    onChange={e => setCreditScore(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 font-bold text-emerald-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Risk Tier</label>
                  <select
                    value={creditRating}
                    onChange={e => setCreditRating(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
                  >
                    <option value="A+ High">A+ High</option>
                    <option value="A Good">A Good</option>
                    <option value="B Medium">B Medium</option>
                    <option value="C Caution">C Caution</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Days to Pay</label>
                  <input
                    type="number"
                    value={daysToPay}
                    onChange={e => setDaysToPay(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#18181b] p-3 rounded-lg border border-zinc-800">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Default Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={e => setPaymentTerms(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#141417] border border-zinc-700/80 rounded-lg text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
                  >
                    {PAYMENT_TERMS_OPTIONS.map(term => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col justify-center">
                  <label className="text-zinc-300 font-semibold mb-1">Factoring Status</label>
                  <label className="flex items-center space-x-2 text-zinc-200 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={factoringApproved}
                      onChange={e => setFactoringApproved(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-orange-500 focus:ring-orange-500 cursor-pointer"
                    />
                    <span className="text-xs">Approved for Factoring</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Notes / Specific Lane Preferences</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1c1c20] border border-zinc-700/80 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="e.g. Requires clean bill of lading within 24 hours, quick pay 2% discount"
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
                  {editingBroker ? 'Save Changes' : 'Add Broker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
