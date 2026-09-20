import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Landmark,
  HandCoins,
  DollarSign,
  Receipt,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  Plus,
  Percent,
} from 'lucide-react';

interface FinancialsLedgersProps {
  onOpenNoonPayout: () => void;
  onOpenSupplierPayment: (supplierId?: string) => void;
}

export const FinancialsLedgers: React.FC<FinancialsLedgersProps> = ({
  onOpenNoonPayout,
  onOpenSupplierPayment,
}) => {
  const {
    sales,
    returns,
    suppliers,
    noonSettlements,
    supplierPayments,
    totalSalesRevenue,
    totalCOGS,
    netProfit,
    noonReceivablesBalance,
    supplierPayablesBalance,
    formatCurrency,
    t,
    lang,
  } = useApp();

  const [activeLedgerTab, setActiveLedgerTab] = useState<'pnl' | 'noon' | 'suppliers'>('pnl');

  // Breakdown calculations
  const totalNoonGrossSales = sales
    .filter(s => s.sourceWarehouse === 'noon')
    .reduce((acc, s) => acc + s.totalRevenue, 0);

  const totalDirectGrossSales = sales
    .filter(s => s.sourceWarehouse === 'main')
    .reduce((acc, s) => acc + s.totalRevenue, 0);

  const totalNoonFees = sales
    .filter(s => s.sourceWarehouse === 'noon')
    .reduce((acc, s) => acc + s.totalRevenue * s.noonFeeRate, 0);

  const totalRefunds = returns.reduce((acc, r) => acc + r.refundAmount, 0);
  const totalNoonPayoutsReceived = noonSettlements.reduce((acc, p) => acc + p.amount, 0);
  const totalSupplierPaymentsMade = supplierPayments.reduce((acc, p) => acc + p.amount, 0);

  const profitMargin = totalSalesRevenue > 0 ? ((netProfit / totalSalesRevenue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* 1. Module Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit shadow-xs">
        <button
          onClick={() => setActiveLedgerTab('pnl')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeLedgerTab === 'pnl'
              ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>{t.pnlSummary}</span>
        </button>

        <button
          onClick={() => setActiveLedgerTab('noon')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeLedgerTab === 'noon'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Landmark className="w-4 h-4 text-amber-900" />
          <span>{lang === 'ar' ? 'فلوسك عند نون (FBN)' : 'Noon Settlement'}</span>
          <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold border border-amber-500/30">
            {formatCurrency(noonReceivablesBalance)}
          </span>
        </button>

        <button
          onClick={() => setActiveLedgerTab('suppliers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeLedgerTab === 'suppliers'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <HandCoins className="w-4 h-4 text-teal-200" />
          <span>{lang === 'ar' ? 'حسابات التجار والموردين' : 'Supplier Payables'}</span>
          <span className="px-1.5 py-0.2 bg-teal-500/20 text-teal-300 rounded text-[10px] font-bold border border-teal-500/30">
            {formatCurrency(supplierPayablesBalance)}
          </span>
        </button>
      </div>

      {/* 2. SECTION A: Profit & Loss Summary */}
      {activeLedgerTab === 'pnl' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">{t.totalRevenue}</span>
              <div className="text-2xl font-black text-slate-100 font-mono mt-1">{formatCurrency(totalSalesRevenue)}</div>
              <span className="text-xs text-slate-400 mt-1 block">
                {sales.length} {lang === 'ar' ? 'طلبات عبر نون والمتجر' : 'total fulfilled orders'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">{t.totalCogs}</span>
              <div className="text-2xl font-black text-slate-200 font-mono mt-1">{formatCurrency(totalCOGS)}</div>
              <span className="text-xs text-slate-400 mt-1 block">
                {lang === 'ar' ? 'تكلفة شراء المنتجات المباعة' : 'Actual inventory cost base'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 shadow-sm">
              <span className="text-xs font-bold text-emerald-400 uppercase">{t.kpiNetProfit}</span>
              <div className="text-2xl font-black text-emerald-300 font-mono mt-1">{formatCurrency(netProfit)}</div>
              <span className="text-xs text-emerald-400 font-bold mt-1 block">
                {profitMargin}% {t.netProfitRate}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">{t.noonFeesDeducted}</span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">{formatCurrency(totalNoonFees)}</div>
              <span className="text-xs text-slate-400 mt-1 block">
                {lang === 'ar' ? 'عمولات منصة وفاء نون' : 'FBN commission & handling'}
              </span>
            </div>
          </div>

          {/* Mathematical Statement Breakdown Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-400" />
              {lang === 'ar' ? 'تفصيل معادلة الأرباح والخسائر: Net Profit = (Selling Price - Unit Cost) * Qty' : 'Profit & Loss Detailed Breakdown'}
            </h3>

            <div className="space-y-3 pt-2 text-xs">
              {/* Line 1: Gross Sales */}
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="font-semibold text-slate-300">{lang === 'ar' ? '(+) إجمالي المبيعات المحققة (Gross Revenue)' : '(+) Gross Revenue'}</span>
                <span className="font-mono font-bold text-slate-100 text-sm">{formatCurrency(totalSalesRevenue)}</span>
              </div>

              {/* Line 2: COGS */}
              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-slate-300">
                <span className="font-semibold">(-) تكلفة البضاعة المباعة (Cost of Goods Sold - COGS)</span>
                <span className="font-mono font-bold text-rose-400">-{formatCurrency(totalCOGS)}</span>
              </div>

              {/* Line 3: Noon Fees */}
              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-slate-300">
                <span className="font-semibold">(-) عمولات ورسوم تشغيل مستودع نون FBN</span>
                <span className="font-mono font-bold text-amber-400">-{formatCurrency(totalNoonFees)}</span>
              </div>

              {/* Line 4: Refunds */}
              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-slate-300">
                <span className="font-semibold">(-) مبالغ المرتجعات المستردة للعملاء (Customer Refunds)</span>
                <span className="font-mono font-bold text-rose-400">-{formatCurrency(totalRefunds)}</span>
              </div>

              {/* Net Profit Total */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 text-white">
                <div>
                  <div className="text-sm font-bold flex items-center gap-1.5 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'صافي الربح الفعلي (Net Profit)' : 'Net Operating Profit'}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {lang === 'ar' ? `هامش الربح التشغيلي: ${profitMargin}%` : `Net Margin: ${profitMargin}%`}
                  </div>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  {formatCurrency(netProfit)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SECTION B: Noon Settlement Ledger (فلوسك عند نون) */}
      {activeLedgerTab === 'noon' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Noon settlement summary card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-amber-300 flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-amber-400" />
                    {t.noonLedgerTitle}
                  </h3>
                  <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                    Noon FBN
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">{t.noonLedgerDesc}</p>
              </div>

              <button
                onClick={onOpenNoonPayout}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{t.recordNoonPayoutBtn}</span>
              </button>
            </div>

            {/* Balances grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase">{t.noonGrossSales}</span>
                <div className="text-lg font-black font-mono text-slate-100 mt-1">
                  {formatCurrency(totalNoonGrossSales)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase">{t.noonFeesDeducted}</span>
                <div className="text-lg font-black font-mono text-amber-400 mt-1">
                  -{formatCurrency(totalNoonFees)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase">{t.noonPayoutsReceived}</span>
                <div className="text-lg font-black font-mono text-emerald-400 mt-1">
                  {formatCurrency(totalNoonPayoutsReceived)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30">
                <span className="text-[11px] font-bold text-amber-300 uppercase">{t.noonPendingBalance}</span>
                <div className="text-xl font-black font-mono text-amber-300 mt-1">
                  {formatCurrency(noonReceivablesBalance)}
                </div>
              </div>
            </div>
          </div>

          {/* Payout records table */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">{t.payoutHistory}</h3>
                <p className="text-xs text-slate-400">{lang === 'ar' ? 'سجل الحوالات البنكية المحولة من نون إلى حسابك' : 'Historical disbursement wires from Noon to your account'}</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">{noonSettlements.length} {lang === 'ar' ? 'حوالات' : 'payouts'}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="pb-3 text-start">{t.reference}</th>
                    <th className="pb-3 text-start">{lang === 'ar' ? 'الحساب البنكي' : 'Bank Account'}</th>
                    <th className="pb-3 text-start">{t.bankRefLabel}</th>
                    <th className="pb-3 text-center">{t.date}</th>
                    <th className="pb-3 text-start">{t.notes}</th>
                    <th className="pb-3 text-end">{lang === 'ar' ? 'المبلغ المحول' : 'Payout Amount'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {noonSettlements.map(set => (
                    <tr key={set.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-300">
                        {set.reference}
                      </td>
                      <td className="py-3 font-medium text-slate-100">
                        {set.paymentMethod}
                      </td>
                      <td className="py-3 font-mono text-slate-400">
                        {set.bankReference}
                      </td>
                      <td className="py-3 text-center text-slate-400 font-mono">
                        {set.date}
                      </td>
                      <td className="py-3 text-slate-400 max-w-xs truncate">
                        {set.notes || '—'}
                      </td>
                      <td className="py-3 text-end font-mono font-black text-emerald-400 text-sm">
                        +{formatCurrency(set.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. SECTION C: Supplier Accounts Payable (حسابات التجار) */}
      {activeLedgerTab === 'suppliers' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Supplier balances overview card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-teal-500/30 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                  <HandCoins className="w-5 h-5 text-teal-400" />
                  {t.supplierLedgerTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">{t.supplierLedgerDesc}</p>
              </div>

              <button
                onClick={() => onOpenSupplierPayment()}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{t.recordSupplierPaymentBtn}</span>
              </button>
            </div>

            {/* Total balance owed badge */}
            <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-teal-300 uppercase">{lang === 'ar' ? 'إجمالي الديون والذمم الدائنة لكافة الموردين' : 'Total Outstanding Accounts Payable'}</span>
                <div className="text-2xl font-black text-teal-200 font-mono mt-1">
                  {formatCurrency(supplierPayablesBalance)}
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-teal-500/20 text-teal-300 rounded-lg border border-teal-500/30">
                {suppliers.length} {lang === 'ar' ? 'موردين معتمدين' : 'Active Vendors'}
              </span>
            </div>
          </div>

          {/* Supplier Balances Table */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-100">{t.supplierBalancesTable}</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="pb-3 text-start">{t.supplier}</th>
                    <th className="pb-3 text-start">{lang === 'ar' ? 'مسؤول التواصل' : 'Contact Person'}</th>
                    <th className="pb-3 text-end">{t.totalPurchased}</th>
                    <th className="pb-3 text-end">{t.totalPaid}</th>
                    <th className="pb-3 text-end">{t.currentOwed}</th>
                    <th className="pb-3 text-end">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {suppliers.map(sup => (
                    <tr key={sup.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 font-bold text-slate-100">
                        {lang === 'ar' ? sup.nameAr : sup.name}
                      </td>
                      <td className="py-3.5 text-slate-400">
                        <div className="text-slate-200">{sup.contact}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{sup.phone}</div>
                      </td>
                      <td className="py-3.5 text-end font-mono font-semibold text-slate-300">
                        {formatCurrency(sup.totalPurchased)}
                      </td>
                      <td className="py-3.5 text-end font-mono font-semibold text-emerald-400">
                        {formatCurrency(sup.totalPaid)}
                      </td>
                      <td className="py-3.5 text-end">
                        <span className={`font-mono font-bold text-sm ${sup.currentBalance > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                          {formatCurrency(sup.currentBalance)}
                        </span>
                      </td>
                      <td className="py-3.5 text-end">
                        <button
                          onClick={() => onOpenSupplierPayment(sup.id)}
                          className="px-2.5 py-1 text-xs font-bold text-teal-300 hover:text-teal-200 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <HandCoins className="w-3 h-3" />
                          <span>{lang === 'ar' ? 'سداد دفعة' : 'Pay'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supplier Payment History Table */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">{t.paymentHistory}</h3>
                <p className="text-xs text-slate-400">{lang === 'ar' ? 'سجل السدادات والحوالات البنكية الصادرة للموردين' : 'Outgoing supplier remittances log'}</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">{supplierPayments.length} {lang === 'ar' ? 'سجلات' : 'records'}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="pb-3 text-start">{t.reference}</th>
                    <th className="pb-3 text-start">{t.supplier}</th>
                    <th className="pb-3 text-start">{lang === 'ar' ? 'طريقة السداد' : 'Method'}</th>
                    <th className="pb-3 text-center">{t.date}</th>
                    <th className="pb-3 text-start">{t.notes}</th>
                    <th className="pb-3 text-end">{lang === 'ar' ? 'المبلغ المسدد' : 'Amount Paid'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {supplierPayments.map(pay => (
                    <tr key={pay.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-300">
                        {pay.reference}
                      </td>
                      <td className="py-3 font-bold text-slate-100">
                        {pay.supplierName}
                      </td>
                      <td className="py-3 text-slate-400">
                        {pay.paymentMethod}
                      </td>
                      <td className="py-3 text-center text-slate-400 font-mono">
                        {pay.date}
                      </td>
                      <td className="py-3 text-slate-400 max-w-xs truncate">
                        {pay.notes || '—'}
                      </td>
                      <td className="py-3 text-end font-mono font-bold text-slate-100 text-sm">
                        {formatCurrency(pay.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
