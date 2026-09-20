import React from 'react';
import { useApp } from '../context/AppContext';
import { Product, Sale, InboundShipment } from '../types';
import {
  TrendingUp,
  Boxes,
  Building2,
  Store,
  Landmark,
  HandCoins,
  ArrowUpRight,
  PackagePlus,
  ArrowRightLeft,
  ShoppingBag,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface DashboardOverviewProps {
  onOpenInbound: () => void;
  onOpenTransfer: () => void;
  onOpenSale: () => void;
  onOpenNoonPayout: () => void;
  onOpenSupplierPayment: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onOpenInbound,
  onOpenTransfer,
  onOpenSale,
  onOpenNoonPayout,
  onOpenSupplierPayment,
}) => {
  const {
    totalSalesRevenue,
    netProfit,
    mainWarehouseStockCount,
    noonWarehouseStockCount,
    noonReceivablesBalance,
    supplierPayablesBalance,
    formatCurrency,
    lowStockProducts,
    sales,
    transfers,
    inboundShipments,
    setCurrentTab,
    t,
    lang,
  } = useApp();

  const totalStockAll = mainWarehouseStockCount + noonWarehouseStockCount;
  const noonPercentage = totalStockAll > 0 ? Math.round((noonWarehouseStockCount / totalStockAll) * 100) : 0;
  const mainPercentage = 100 - noonPercentage;

  // Profit margin calculation
  const profitMarginPercent = totalSalesRevenue > 0 ? ((netProfit / totalSalesRevenue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* 1. KPI Cards Grid - The 6 Core Required KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* KPI 1: Total Sales */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.kpiTotalSales}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">
              {formatCurrency(totalSalesRevenue)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{sales.length} {lang === 'ar' ? 'عملية بيع مكتملة' : 'completed orders'}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Net Profit/Loss */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.kpiNetProfit}
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${netProfit >= 0 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/15 text-rose-400 border-rose-500/20'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black font-mono tracking-tight ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(netProfit)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 font-bold text-[10px]">
                {profitMarginPercent}% {t.margin}
              </span>
              <span>{lang === 'ar' ? 'بعد خصم التكلفة وعمولات نون' : 'Net of COGS & fees'}</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Main Warehouse Stock Count */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.kpiMainStock}
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-100 font-mono tracking-tight flex items-baseline gap-1.5">
              {mainWarehouseStockCount}
              <span className="text-sm font-semibold text-slate-400">{t.units}</span>
            </div>
            <div className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>{lang === 'ar' ? 'المستودع الرئيسي (القاهرة)' : 'Cairo Central Hub'}</span>
            </div>
          </div>
        </div>

        {/* KPI 4: External Warehouse (Noon FBN) Stock Count */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.kpiNoonStock}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-100 font-mono tracking-tight flex items-baseline gap-1.5">
              {noonWarehouseStockCount}
              <span className="text-sm font-semibold text-slate-400">{t.units}</span>
            </div>
            <div className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>{lang === 'ar' ? 'مستودع نون FBN (السادس من أكتوبر)' : 'FBN 6th of October Prime Ready'}</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Noon Receivables Balance (فلوسك عند نون) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 shadow-sm group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                {t.kpiNoonReceivables}
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-sm">
                Noon FBN
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-400 font-mono tracking-tight">
              {formatCurrency(noonReceivablesBalance)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-slate-400">{t.kpiNoonReceivablesSub}</span>
              <button
                onClick={onOpenNoonPayout}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-0.5"
              >
                {lang === 'ar' ? 'تسجيل حوالة' : 'Disburse'}
              </button>
            </div>
          </div>
        </div>

        {/* KPI 6: Supplier Payables Balance (حسابات التجار) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.kpiSupplierPayables}
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/20 flex items-center justify-center">
              <HandCoins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">
              {formatCurrency(supplierPayablesBalance)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-slate-400">{t.kpiSupplierPayablesSub}</span>
              <button
                onClick={onOpenSupplierPayment}
                className="text-[11px] font-bold text-teal-400 hover:text-teal-300 underline flex items-center gap-0.5"
              >
                {lang === 'ar' ? 'سداد دفعة' : 'Record Pay'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Toolbar & Warehouse Distribution Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Warehouse Inventory Ratio & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inventory Distribution Panel */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-slate-400" />
                  {lang === 'ar' ? 'توزيع المخزون بين المستودعات' : 'Inventory Warehouse Allocation'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar'
                    ? `إجمالي المخزون المتاح: ${totalStockAll} قطعة عبر كافة المواقع`
                    : `Total across all facilities: ${totalStockAll} units`}
                </p>
              </div>

              <button
                onClick={onOpenTransfer}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.transferStockBtn}</span>
              </button>
            </div>

            {/* Split Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-700/60">
                <div
                  style={{ width: `${mainPercentage}%` }}
                  className="h-full bg-blue-500 rounded-s-full transition-all duration-500"
                  title={`Main Warehouse: ${mainPercentage}%`}
                />
                <div
                  style={{ width: `${noonPercentage}%` }}
                  className="h-full bg-amber-500 rounded-e-full transition-all duration-500"
                  title={`Noon Warehouse: ${noonPercentage}%`}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                  <span className="text-slate-300">{t.mainWarehouse}:</span>
                  <span className="text-slate-100 font-mono font-bold">{mainWarehouseStockCount} ({mainPercentage}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                  <span className="text-slate-300">{t.noonWarehouse}:</span>
                  <span className="text-slate-100 font-mono font-bold">{noonWarehouseStockCount} ({noonPercentage}%)</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons Grid */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t border-slate-800">
              <button
                onClick={onOpenInbound}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-emerald-300 border border-slate-700/80 hover:border-emerald-500/40 transition-all text-start group"
              >
                <PackagePlus className="w-4 h-4 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold">{t.newInboundBtn}</div>
                <div className="text-[10px] text-slate-400">{lang === 'ar' ? 'استلام بضاعة' : 'Incoming PO'}</div>
              </button>

              <button
                onClick={onOpenTransfer}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/40 transition-all text-start group"
              >
                <ArrowRightLeft className="w-4 h-4 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold">{t.transferStockBtn}</div>
                <div className="text-[10px] text-slate-400">{lang === 'ar' ? 'نقل إلى نون' : 'Move stock'}</div>
              </button>

              <button
                onClick={onOpenSale}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-blue-300 border border-slate-700/80 hover:border-blue-500/40 transition-all text-start group"
              >
                <ShoppingBag className="w-4 h-4 text-blue-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold">{t.newSaleBtn}</div>
                <div className="text-[10px] text-slate-400">{lang === 'ar' ? 'تسجيل بيع' : 'Record sale'}</div>
              </button>

              <button
                onClick={onOpenNoonPayout}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/40 transition-all text-start group"
              >
                <Landmark className="w-4 h-4 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold">{t.recordNoonPayoutBtn}</div>
                <div className="text-[10px] text-slate-400">{lang === 'ar' ? 'سحب رصيد نون' : 'Noon payout'}</div>
              </button>
            </div>
          </div>

          {/* Recent Sales Activity Stream */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                {lang === 'ar' ? 'أحدث المبيعات وحركات الصرف' : 'Recent Sales & Stock Movements'}
              </h3>
              <button
                onClick={() => setCurrentTab('sales')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>{t.viewAll}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-800">
              {sales.slice(0, 4).map((sale: Sale) => (
                <div key={sale.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${sale.sourceWarehouse === 'noon' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-blue-500/15 text-blue-300 border-blue-500/30'}`}>
                      {sale.sourceWarehouse === 'noon' ? 'FBN' : 'DIR'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-200 truncate">
                        {sale.productName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{sale.orderNumber}</span>
                        <span>•</span>
                        <span>{sale.quantity} {t.units}</span>
                        <span>•</span>
                        <span>{sale.saleDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-end shrink-0">
                    <div className="text-xs font-bold font-mono text-slate-100">
                      {formatCurrency(sale.totalRevenue)}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-400">
                      +{formatCurrency(sale.grossProfit)} {lang === 'ar' ? 'ربح' : 'profit'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Low Stock Alerts & Operational Summary */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                {t.lowStockWarning}
              </h3>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {lowStockProducts.length}
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-300 font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'ar' ? 'كافة المنتجات بمستوى مخزون صحي ومستقر!' : 'All stock levels are optimal.'}</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockProducts.map((prod: Product) => (
                  <div
                    key={prod.id}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800/70 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate">
                          {lang === 'ar' ? prod.nameAr : prod.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{prod.sku}</div>
                      </div>
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">
                        {lang === 'ar' ? 'تنبيه' : 'Low'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`p-1.5 rounded-lg border text-center ${prod.stockMain <= prod.minStockAlert ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                        <div className="text-[10px] text-slate-400">{lang === 'ar' ? 'الرئيسي' : 'Main'}</div>
                        <div>{prod.stockMain} {t.units}</div>
                      </div>

                      <div className={`p-1.5 rounded-lg border text-center ${prod.stockNoon <= prod.minStockAlert ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                        <div className="text-[10px] text-slate-400">Noon FBN</div>
                        <div>{prod.stockNoon} {t.units}</div>
                      </div>
                    </div>

                    <button
                      onClick={onOpenTransfer}
                      className="w-full py-1 text-center text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg transition-colors"
                    >
                      {lang === 'ar' ? 'تحويل كمية إلى نون الآن' : 'Transfer to Noon'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Inbound Shipments Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-emerald-400" />
                {lang === 'ar' ? 'آخر التوريدات الواردة' : 'Latest Inbounds'}
              </h3>
              <button
                onClick={() => setCurrentTab('inbound')}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                {t.viewAll}
              </button>
            </div>

            <div className="space-y-2.5">
              {inboundShipments.slice(0, 3).map((inb: InboundShipment) => (
                <div key={inb.id} className="p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 text-xs flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate">{inb.productName}</div>
                    <div className="text-[10px] text-slate-400">{inb.supplierName} • {inb.quantity} {t.units}</div>
                  </div>
                  <div className="text-end shrink-0">
                    <div className="font-mono font-bold text-slate-100">{formatCurrency(inb.totalCost)}</div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${inb.paymentStatus === 'Paid' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30'}`}>
                      {inb.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
