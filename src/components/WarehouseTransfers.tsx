import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WarehouseId } from '../types';
import {
  ArrowRightLeft,
  Building2,
  Store,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Search,
  ExternalLink,
  Truck,
  Plus,
} from 'lucide-react';

interface WarehouseTransfersProps {
  onOpenTransferModal: (productId?: string, sourceWarehouse?: WarehouseId) => void;
}

export const WarehouseTransfers: React.FC<WarehouseTransfersProps> = ({
  onOpenTransferModal,
}) => {
  const {
    products,
    transfers,
    mainWarehouseStockCount,
    noonWarehouseStockCount,
    formatCurrency,
    t,
    lang,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterLowStock, setFilterLowStock] = useState<boolean>(false);

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const isLow = p.stockMain <= p.minStockAlert || p.stockNoon <= p.minStockAlert;
    return matchesSearch && (!filterLowStock || isLow);
  });

  return (
    <div className="space-y-6">
      {/* 1. Facility Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Warehouse Hub */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 flex items-center justify-center font-black">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-100 text-sm">
                    {lang === 'ar' ? 'المستودع الرئيسي المركزي (القاهرة)' : 'Main Central Warehouse (Cairo)'}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md">
                    WH-CAI-01
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'المنطقة اللوجستية المركزية، القاهرة' : 'Cairo Logistics Zone, Gate 4'}
                </p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-end justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold">{lang === 'ar' ? 'إجمالي المخزون الفعلي:' : 'Total On-Hand Stock:'}</span>
              <div className="text-2xl font-black text-slate-100 font-mono">
                {mainWarehouseStockCount} <span className="text-xs font-normal text-slate-400">{t.units}</span>
              </div>
            </div>

            <button
              onClick={() => onOpenTransferModal(undefined, 'main')}
              className="px-3.5 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 font-bold text-xs rounded-xl border border-blue-500/30 transition-colors flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5 text-blue-400" />
              <span>{lang === 'ar' ? 'شحن إلى نون' : 'Ship to Noon'}</span>
            </button>
          </div>
        </div>

        {/* Noon FBN Warehouse */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-100 text-sm">
                    {lang === 'ar' ? 'مستودع نون FBN (السادس من أكتوبر)' : 'Noon FBN Fulfillment Center (6th of Oct)'}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md">
                    FBN-EGY-02
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'مركز وفاء نون، المنطقة الصناعية 6 أكتوبر' : 'Noon Fulfillment Center, 6th of October'}
                </p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-end justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold">{lang === 'ar' ? 'المخزون الجاهز للشحن السريع:' : 'Prime / Express Stock:'}</span>
              <div className="text-2xl font-black text-slate-100 font-mono">
                {noonWarehouseStockCount} <span className="text-xs font-normal text-slate-400">{t.units}</span>
              </div>
            </div>

            <button
              onClick={() => onOpenTransferModal(undefined, 'noon')}
              className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition-colors flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ar' ? 'استرجاع للمستودع' : 'Pull to Main'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Visual Stock Status Table: Main Warehouse vs. Noon Warehouse */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-amber-400" />
              {t.stockComparisonTable}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar'
                ? 'مقارنة دقيقة وفورية لكميات القطع في المستودع الرئيسي مقارنة برصيد نون FBN'
                : 'Side-by-side stock comparison between Central Warehouse and Noon FBN'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="w-full ps-8 pe-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={() => setFilterLowStock(!filterLowStock)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 ${
                filterLowStock
                  ? 'bg-rose-500/20 border-rose-500/30 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700/80'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t.lowStockWarning}</span>
            </button>

            <button
              onClick={() => onOpenTransferModal()}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{t.transferStockBtn}</span>
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3 text-start">{t.product}</th>
                <th className="pb-3 text-center bg-blue-500/10 text-blue-300 rounded-s-md">{t.mainWarehouse}</th>
                <th className="pb-3 text-center bg-amber-500/10 text-amber-300 rounded-e-md">{t.noonWarehouse}</th>
                <th className="pb-3 text-center">{lang === 'ar' ? 'إجمالي المخزون' : 'Total Units'}</th>
                <th className="pb-3 text-end">{lang === 'ar' ? 'تقييم المخزون' : 'Valuation'}</th>
                <th className="pb-3 text-center">{t.status}</th>
                <th className="pb-3 text-end">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProducts.map(prod => {
                const totalUnits = prod.stockMain + prod.stockNoon;
                const totalValuation = totalUnits * prod.unitCost;
                const isMainLow = prod.stockMain <= prod.minStockAlert;
                const isNoonLow = prod.stockNoon <= prod.minStockAlert;

                return (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5">
                      <div className="font-bold text-slate-100 text-xs">
                        {lang === 'ar' ? prod.nameAr : prod.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {prod.sku} • {lang === 'ar' ? prod.categoryAr : prod.category}
                      </div>
                    </td>

                    {/* Main Warehouse stock column */}
                    <td className="py-3.5 text-center bg-blue-500/5">
                      <div className={`font-mono font-bold text-sm ${isMainLow ? 'text-rose-400' : 'text-slate-100'}`}>
                        {prod.stockMain}
                      </div>
                      {isMainLow && (
                        <span className="text-[9px] font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 px-1.5 py-0.5 rounded">
                          {lang === 'ar' ? 'منخفض' : 'Low'}
                        </span>
                      )}
                    </td>

                    {/* Noon Warehouse stock column */}
                    <td className="py-3.5 text-center bg-amber-500/5">
                      <div className={`font-mono font-bold text-sm ${isNoonLow ? 'text-amber-400' : 'text-slate-100'}`}>
                        {prod.stockNoon}
                      </div>
                      {isNoonLow && (
                        <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded">
                          {lang === 'ar' ? 'تجديد مطلوب' : 'Reorder'}
                        </span>
                      )}
                    </td>

                    {/* Total Units */}
                    <td className="py-3.5 text-center font-mono font-bold text-slate-100">
                      {totalUnits}
                    </td>

                    {/* Valuation */}
                    <td className="py-3.5 text-end font-mono font-medium text-slate-300">
                      {formatCurrency(totalValuation)}
                    </td>

                    {/* Health Status */}
                    <td className="py-3.5 text-center">
                      {!isMainLow && !isNoonLow ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          {t.healthy}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          {lang === 'ar' ? 'توازن مطلوب' : 'Rebalance'}
                        </span>
                      )}
                    </td>

                    {/* Transfer Button */}
                    <td className="py-3.5 text-end">
                      <button
                        onClick={() => onOpenTransferModal(prod.id, prod.stockMain > 0 ? 'main' : 'noon')}
                        className="px-2.5 py-1 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>{lang === 'ar' ? 'تحويل' : 'Transfer'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Transfer History Log Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">{t.transferHistory}</h3>
            <p className="text-xs text-slate-400">{lang === 'ar' ? 'سجل تحويلات البضائع وأرقام بوليصات FBN ASN' : 'Log of stock movements and Noon ASN tracking'}</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{transfers.length} {lang === 'ar' ? 'عملية تحويل' : 'records'}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3 text-start">{t.reference}</th>
                <th className="pb-3 text-start">{t.product}</th>
                <th className="pb-3 text-start">{lang === 'ar' ? 'مسار النقل' : 'Route'}</th>
                <th className="pb-3 text-center">{t.quantity}</th>
                <th className="pb-3 text-start">{t.fbnAsnLabel}</th>
                <th className="pb-3 text-center">{t.date}</th>
                <th className="pb-3 text-center">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transfers.map(tr => (
                <tr key={tr.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-slate-300">
                    {tr.reference}
                  </td>
                  <td className="py-3">
                    <div className="font-bold text-slate-100">{tr.productName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{tr.sku}</div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                      <span>{tr.sourceWarehouse === 'main' ? (lang === 'ar' ? 'الرئيسي' : 'Main') : 'Noon'}</span>
                      <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                      <span>{tr.targetWarehouse === 'noon' ? 'Noon FBN' : (lang === 'ar' ? 'الرئيسي' : 'Main')}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center font-mono font-bold text-slate-100">
                    {tr.quantity} {t.units}
                  </td>
                  <td className="py-3 font-mono text-slate-400">
                    {tr.fbnAsnNumber || '—'}
                  </td>
                  <td className="py-3 text-center text-slate-400 font-mono">
                    {tr.transferDate}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      tr.status === 'Completed'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}>
                      {tr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
