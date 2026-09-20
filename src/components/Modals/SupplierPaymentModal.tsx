import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, HandCoins, CheckCircle2 } from 'lucide-react';

interface SupplierPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSupplierId?: string;
}

export const SupplierPaymentModal: React.FC<SupplierPaymentModalProps> = ({
  isOpen,
  onClose,
  defaultSupplierId,
}) => {
  const { suppliers, addSupplierPayment, formatCurrency, t, lang } = useApp();

  const [supplierId, setSupplierId] = useState<string>(defaultSupplierId || suppliers[0]?.id || '');
  const [amount, setAmount] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState<string>('Commercial Transfer / InstaPay (إنستاباي)');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const selectedSupplier = suppliers.find(s => s.id === supplierId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || amount <= 0) return;

    addSupplierPayment({
      supplierId: selectedSupplier.id,
      supplierName: lang === 'ar' ? selectedSupplier.nameAr : selectedSupplier.name,
      amount: Number(amount),
      paymentMethod,
      date,
      notes: notes || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center font-bold">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">{t.recordSupplierPaymentBtn}</h3>
              <p className="text-xs text-slate-400">{t.supplierLedgerTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Supplier select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {t.supplier}
            </label>
            <select
              value={supplierId}
              onChange={e => {
                setSupplierId(e.target.value);
                const sup = suppliers.find(s => s.id === e.target.value);
                if (sup) setAmount(Math.min(sup.currentBalance, 5000) || 1000);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              required
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id} className="bg-slate-800 text-slate-100">
                  {lang === 'ar' ? s.nameAr : s.name} — {lang === 'ar' ? 'المستحق: ' : 'Owed: '}
                  {formatCurrency(s.currentBalance)}
                </option>
              ))}
            </select>
          </div>

          {/* Outstanding Balance Notice */}
          <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/30 flex items-center justify-between text-xs">
            <span className="font-semibold text-teal-300">{t.currentOwed}:</span>
            <span className="text-sm font-bold text-teal-200 font-mono">
              {formatCurrency(selectedSupplier?.currentBalance || 0)}
            </span>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.paymentAmountLabel}
            </label>
            <input
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-base font-bold font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {lang === 'ar' ? 'طريقة السداد' : 'Payment Method'}
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            >
              <option value="Commercial Transfer / InstaPay (إنستاباي)" className="bg-slate-800 text-slate-100">Instant Transfer (InstaPay / إنستاباي مصر)</option>
              <option value="Bank Transfer (CIB Egypt)" className="bg-slate-800 text-slate-100">Bank Transfer (CIB Egypt)</option>
              <option value="Bank Transfer (National Bank of Egypt - NBE)" className="bg-slate-800 text-slate-100">Bank Transfer (NBE - البنك الأهلي المصري)</option>
              <option value="Bank Transfer (Banque Misr)" className="bg-slate-800 text-slate-100">Bank Transfer (Banque Misr - بنك مصر)</option>
              <option value="Cheque / سند لأمر" className="bg-slate-800 text-slate-100">Bank Check / شيك بنكي مسطر</option>
              <option value="Cash on Delivery Settlement" className="bg-slate-800 text-slate-100">Cash Settlement (نقداً / إيصال استلام)</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.date}
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.notes}
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={lang === 'ar' ? 'رقم التحويل البنكي أو معاملة إنستاباي، أو رقم الفاتورة...' : 'Invoice ref, InstaPay reference, receipt id...'}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.submit}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
