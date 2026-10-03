'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Landmark,
  HandCoins,
  Receipt,
  Plus,
  UserPlus,
} from 'lucide-react';

export const FinancialsLedgers: React.FC = () => {
  const {
    sales,
    warehouses,
    returns,
    suppliers,
    noonSettlements,
    supplierPayments,
    totalSalesRevenue,
    netProfit,
    noonReceivablesBalance,
    supplierPayablesBalance,
    addSupplier,
    addNoonSettlement,
    addSupplierPayment,
    formatCurrency,
    t,
    lang,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pnl' | 'noon' | 'suppliers'>('pnl');

  // Noon Payout Form
  const [isNoonFormOpen, setIsNoonFormOpen] = useState(false);
  const [noonPayoutAmount, setNoonPayoutAmount] = useState<number>(noonReceivablesBalance);
  const [noonPayoutDate, setNoonPayoutDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Supplier Payment Form
  const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(suppliers.length ? suppliers[0].id : -1);
  const [supplierPaymentAmount, setSupplierPaymentAmount] = useState<number>(0);
  const [supplierPaymentDate, setSupplierPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Add Supplier Form
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newSupContact, setNewSupContact] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupBalance, setNewSupBalance] = useState<number>(0);

  // P&L Calculations
  const totalNoonFees = sales
    .filter(s => warehouses[s.warehouseId].type === 'Noon')
    .reduce((acc, s) => acc + s.totalRevenue * s.noonFeeRate, 0);

  const totalRefunds = returns.reduce((acc, r) => acc + r.refundAmount, 0);

  const handleNoonPayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (noonPayoutAmount <= 0) return;

    addNoonSettlement({
      amount: Number(noonPayoutAmount),
      date: noonPayoutDate,
    });

    setIsNoonFormOpen(false);
  };

  const handleSupplierPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === selectedSupplierId);
    if (!sup || supplierPaymentAmount <= 0) return;

    addSupplierPayment({
      supplierId: sup.id,
      amount: Number(supplierPaymentAmount),
      date: supplierPaymentDate,
    });

    setIsSupplierFormOpen(false);
  };

  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) return;

    const created = addSupplier({
      name: newSupName,
      contact: newSupContact,
      phone: newSupPhone,
      initialBalance: newSupBalance,
    });

    setSelectedSupplierId(created.id);
    setNewSupName('');
    setNewSupContact('');
    setNewSupPhone('');
    setNewSupBalance(0);
    setIsAddSupplierOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{t.financialsTitle}</h2>
          <p className="text-xs text-zinc-400 mt-0.5">{t.financialsSubtitle}</p>
        </div>

        {activeTab === 'noon' && (
          <button
            onClick={() => setIsNoonFormOpen(!isNoonFormOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-white rounded-md transition-colors self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isNoonFormOpen ? t.cancel : t.recordNoonPayoutBtn}</span>
          </button>
        )}

        {activeTab === 'suppliers' && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setIsAddSupplierOpen(!isAddSupplierOpen);
                if (isSupplierFormOpen) setIsSupplierFormOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white rounded-md transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAddSupplierOpen ? t.cancel : (t.addSupplierBtn || '+ Add Supplier')}</span>
            </button>
            <button
              onClick={() => {
                setIsSupplierFormOpen(!isSupplierFormOpen);
                if (isAddSupplierOpen) setIsAddSupplierOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-white rounded-md transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSupplierFormOpen ? t.cancel : t.recordSupplierPaymentBtn}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Sub Tabs */}
      <div className="flex space-x-1 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('pnl')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'pnl'
            ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'
            }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>{t.pnlSummary}</span>
        </button>
        <button
          onClick={() => setActiveTab('noon')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'noon'
            ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'
            }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>{t.noonLedgerTitle}</span>
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'suppliers'
            ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'
            }`}
        >
          <HandCoins className="w-3.5 h-3.5" />
          <span>{t.supplierLedgerTitle}</span>
        </button>
      </div>

      {/* 3. P&L TAB */}
      {activeTab === 'pnl' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
              <span className="text-xs font-medium text-zinc-400 block">{t.totalRevenue}</span>
              <span className="text-xl font-bold text-zinc-100 font-mono mt-1 block">
                {formatCurrency(totalSalesRevenue)}
              </span>
            </div>
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
              <span className="text-xs font-medium text-zinc-400 block">{t.kpiNetProfit}</span>
              <span className={`text-xl font-bold font-mono mt-1 block ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>

          {/* Minimal Statement Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-zinc-950/80 border-b border-zinc-800">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                {lang === 'ar' ? 'تفصيل الإيرادات والمصروفات' : 'Financial Breakdown'}
              </h3>
            </div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-zinc-800/80">
                <tr className="hover:bg-zinc-800/40">
                  <td className="px-4 py-2.5 text-zinc-400">Less: Noon Marketplace Commissions & FBN Fees</td>
                  <td className="px-4 py-2.5 text-end font-mono font-medium text-rose-400">-{formatCurrency(totalNoonFees)}</td>
                </tr>
                <tr className="hover:bg-zinc-800/40">
                  <td className="px-4 py-2.5 text-zinc-400">Less: Customer Returns & Refunds</td>
                  <td className="px-4 py-2.5 text-end font-mono font-medium text-rose-400">-{formatCurrency(totalRefunds)}</td>
                </tr>
                <tr className="bg-zinc-950/80 font-bold border-t border-zinc-800">
                  <td className="px-4 py-3 text-zinc-100 text-sm">{t.kpiNetProfit}</td>
                  <td className={`px-4 py-3 text-end font-mono text-base ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(netProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. NOON ACCOUNT TAB */}
      {activeTab === 'noon' && (
        <div className="space-y-4">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-400 block">{t.noonPendingBalance}</span>
              <span className="text-xl font-bold text-amber-400 font-mono mt-1 block">
                {formatCurrency(noonReceivablesBalance)}
              </span>
              <span className="text-[11px] text-zinc-500 block mt-0.5">
                {lang === 'ar' ? 'مستحقات معلقة لدى نون بعد خصم العمولات' : 'Owed by Noon after marketplace fees deduction'}
              </span>
            </div>
            <button
              onClick={() => setIsNoonFormOpen(!isNoonFormOpen)}
              className="px-3 py-1.5 text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-white rounded-md shadow-xs"
            >
              {isNoonFormOpen ? t.cancel : t.recordNoonPayoutBtn}
            </button>
          </div>

          {/* Collapsible Noon Payout Form */}
          {isNoonFormOpen && (
            <form onSubmit={handleNoonPayoutSubmit} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-3">
              <h3 className="text-sm font-semibold text-zinc-100 border-b border-zinc-800/80 pb-2">
                {t.recordNoonPayoutBtn}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">{t.payoutAmountLabel} ({t.currency})</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={noonPayoutAmount}
                    onChange={e => setNoonPayoutAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">{t.date}</label>
                  <input
                    type="date"
                    value={noonPayoutDate}
                    onChange={e => setNoonPayoutDate(e.target.value)}
                    className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setIsNoonFormOpen(false)}
                  className="px-3 py-1.5 text-xs border border-zinc-700 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-zinc-100 text-zinc-950 rounded-md hover:bg-white transition-colors"
                >
                  {t.submit}
                </button>
              </div>
            </form>
          )}

          {/* Payout Settlements Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-zinc-950/80 border-b border-zinc-800">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                {t.payoutHistory}
              </h3>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase">
                <tr>
                  <th className="px-3 py-2 text-start">{t.reference}</th>
                  <th className="px-3 py-2 text-start">{t.date}</th>
                  <th className="px-3 py-2 text-start">{lang === 'ar' ? 'طريقة السداد' : 'Method'}</th>
                  <th className="px-3 py-2 text-start">{t.bankRefLabel}</th>
                  <th className="px-3 py-2 text-end">{t.totalAmount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {noonSettlements.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-800/40">
                    <td className="px-3 py-2.5 text-zinc-400">{item.date}</td>
                    <td className="px-3 py-2.5 text-end font-mono font-bold text-emerald-400">
                      +{formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SUPPLIER PAYABLES TAB */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-medium text-zinc-400 block">{t.kpiSupplierPayables}</span>
              <span className="text-xl font-bold text-rose-400 font-mono mt-1 block">
                {formatCurrency(supplierPayablesBalance)}
              </span>
              <span className="text-[11px] text-zinc-500 block mt-0.5">
                {lang === 'ar' ? 'إجمالي الديون المستحقة للموردين' : 'Total due across all suppliers'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsAddSupplierOpen(!isAddSupplierOpen);
                  if (isSupplierFormOpen) setIsSupplierFormOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white rounded-md shadow-xs inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAddSupplierOpen ? t.cancel : (t.addSupplierBtn || '+ Add Supplier')}</span>
              </button>
              <button
                onClick={() => {
                  setIsSupplierFormOpen(!isSupplierFormOpen);
                  if (isAddSupplierOpen) setIsAddSupplierOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-white rounded-md shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSupplierFormOpen ? t.cancel : t.recordSupplierPaymentBtn}</span>
              </button>
            </div>
          </div>

          {/* Collapsible Add Supplier Form */}
          {isAddSupplierOpen && (
            <form onSubmit={handleAddSupplierSubmit} className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>{t.addSupplierModalTitle}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">{t.supplierNameEnLabel} *</label>
                  <input
                    type="text"
                    value={newSupName}
                    onChange={e => setNewSupName(e.target.value)}
                    placeholder="e.g. Cairo Textiles Co."
                    className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">{t.contactPersonLabel}</label>
                  <input
                    type="text"
                    value={newSupContact}
                    onChange={e => setNewSupContact(e.target.value)}
                    placeholder="e.g. Mahmoud Hassan"
                    className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">{t.phoneLabel}</label>
                  <input
                    type="text"
                    value={newSupPhone}
                    onChange={e => setNewSupPhone(e.target.value)}
                    placeholder="+20 10 9876 5432"
                    className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    {t.initialBalanceLabel} ({t.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newSupBalance}
                    onChange={e => setNewSupBalance(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierOpen(false)}
                  className="px-3 py-1.5 text-xs border border-zinc-700 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-500 text-zinc-950 rounded-md hover:bg-emerald-400 transition-colors"
                >
                  {t.submit}
                </button>
              </div>
            </form>
          )}

          {/* Collapsible Supplier Payment Form */}
          {isSupplierFormOpen && (
            <form onSubmit={handleSupplierPaymentSubmit} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-3">
              <h3 className="text-sm font-semibold text-zinc-100 border-b border-zinc-800/80 pb-2">
                {t.recordSupplierPaymentBtn}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">{t.supplier}</label>
                  <select
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(Number(e.target.value))}
                    className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                    required
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id} className="bg-zinc-900 text-zinc-100">
                        {s.name} ({formatCurrency(s.totalPurchased - s.totalPaid)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">{t.paymentAmountLabel} ({t.currency})</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={supplierPaymentAmount}
                    onChange={e => setSupplierPaymentAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">{t.date}</label>
                  <input
                    type="date"
                    value={supplierPaymentDate}
                    onChange={e => setSupplierPaymentDate(e.target.value)}
                    className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setIsSupplierFormOpen(false)}
                  className="px-3 py-1.5 text-xs border border-zinc-700 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-zinc-100 text-zinc-950 rounded-md hover:bg-white transition-colors"
                >
                  {t.submit}
                </button>
              </div>
            </form>
          )}

          {/* Supplier Balances List */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-zinc-950/80 border-b border-zinc-800">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                {t.supplierBalancesTable}
              </h3>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase">
                <tr>
                  <th className="px-3 py-2 text-start">{t.supplier}</th>
                  <th className="px-3 py-2 text-end">{t.totalPurchased}</th>
                  <th className="px-3 py-2 text-end">{t.totalPaid}</th>
                  <th className="px-3 py-2 text-end">{t.currentOwed}</th>
                  <th className="px-3 py-2 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {suppliers.map(s => (
                  <tr key={s.id} className="hover:bg-zinc-800/40">
                    <td className="px-3 py-2.5 font-medium text-zinc-200">
                      {s.name}
                    </td>
                    <td className="px-3 py-2.5 text-end font-mono text-zinc-300">{formatCurrency(s.totalPurchased)}</td>
                    <td className="px-3 py-2.5 text-end font-mono text-emerald-400">{formatCurrency(s.totalPaid)}</td>
                    <td className="px-3 py-2.5 text-end font-mono font-bold text-rose-400">
                      {formatCurrency(s.totalPurchased - s.totalPaid)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => {
                          setSelectedSupplierId(s.id);
                          setSupplierPaymentAmount(s.totalPurchased - s.totalPaid);
                          setIsSupplierFormOpen(true);
                        }}
                        className="px-2 py-1 text-[11px] font-medium border border-zinc-700 bg-zinc-800 rounded text-zinc-200 hover:bg-zinc-700 hover:text-white"
                      >
                        {lang === 'ar' ? 'سداد' : 'Pay'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Supplier Payments History */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-zinc-950/80 border-b border-zinc-800">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                {t.paymentHistory}
              </h3>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase">
                <tr>
                  <th className="px-3 py-2 text-start">{t.reference}</th>
                  <th className="px-3 py-2 text-start">{t.date}</th>
                  <th className="px-3 py-2 text-start">{t.supplier}</th>
                  <th className="px-3 py-2 text-start">{lang === 'ar' ? 'طريقة السداد' : 'Method'}</th>
                  <th className="px-3 py-2 text-end">{t.totalAmount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {supplierPayments.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-800/40">
                    <td className="px-3 py-2.5 text-zinc-400">{p.date}</td>
                    <td className="px-3 py-2.5 font-medium text-zinc-200">{suppliers[p.supplierId].name}</td>
                    <td className="px-3 py-2.5 text-end font-mono font-medium text-zinc-100">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
