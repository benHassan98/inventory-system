import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Landmark, CheckCircle } from 'lucide-react';

interface NoonPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NoonPayoutModal: React.FC<NoonPayoutModalProps> = ({ isOpen, onClose }) => {
  const { noonReceivablesBalance, addNoonSettlement, formatCurrency, t, lang } = useApp();

  const [amount, setAmount] = useState<number>(Math.min(15000, noonReceivablesBalance));
  const [bankReference, setBankReference] = useState<string>(`TXN-EGP-${Math.floor(100000 + Math.random() * 900000)}`);
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer (Commercial International Bank - CIB)');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    addNoonSettlement({
      amount: Number(amount),
      paymentMethod,
      bankReference,
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
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">{t.recordNoonPayoutBtn}</h3>
              <p className="text-xs text-slate-400">{t.noonLedgerTitle}</p>
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
          {/* Current balance card */}
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">{t.noonPendingBalance}:</span>
            <span className="text-base font-bold text-amber-200 font-mono">
              {formatCurrency(noonReceivablesBalance)}
            </span>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.payoutAmountLabel}
            </label>
            <input
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-base font-bold font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              required
            />
            <span className="text-xs text-slate-400 mt-1 block">
              {lang === 'ar'
                ? 'المبلغ الذي تم إيداعه في حسابك البنكي من قبل شركة نون'
                : 'Net disbursed funds received into your bank account from Noon'}
            </span>
          </div>

          {/* Bank Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.bankRefLabel}
            </label>
            <input
              type="text"
              value={bankReference}
              onChange={e => setBankReference(e.target.value)}
              placeholder="e.g. TXN-EGP-909281"
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              required
            />
          </div>

          {/* Payment Method / Bank */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {lang === 'ar' ? 'الحساب البنكي المستلم' : 'Destination Bank Account'}
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            >
              <option value="Bank Transfer (Commercial International Bank - CIB)" className="bg-slate-800 text-slate-100">CIB Egypt (IBAN EG...9021)</option>
              <option value="Bank Transfer (National Bank of Egypt - NBE)" className="bg-slate-800 text-slate-100">National Bank of Egypt - NBE (IBAN EG...4180)</option>
              <option value="Bank Transfer (Banque Misr)" className="bg-slate-800 text-slate-100">Banque Misr (IBAN EG...1294)</option>
              <option value="Bank Transfer (QNB AlAhli)" className="bg-slate-800 text-slate-100">QNB AlAhli Egypt (IBAN EG...7811)</option>
              <option value="Direct Seller Balance Check" className="bg-slate-800 text-slate-100">Noon Manual Check / Reversal</option>
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
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
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
              placeholder={lang === 'ar' ? 'دورة تسوية نون مصر رقم 26-B...' : 'Settlement cycle 26-B notes...'}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              className="px-5 py-2.5 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t.submit}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
