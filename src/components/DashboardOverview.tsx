'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowRightLeft,
  PackagePlus,
  ShoppingBag,
  Star,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    totalSalesRevenue,
    netProfit,
    warehouses,
    mainWarehouseId,
    getWarehouseStockCount,
    noonReceivablesBalance,
    supplierPayablesBalance,
    formatCurrency,
    sales,
    transfers,
    setCurrentTab,
    t,
    lang,
  } = useApp();

  const totalStock = warehouses.reduce((acc, wh) => acc + getWarehouseStockCount(wh.id), 0);
  const profitMargin = totalSalesRevenue > 0 ? ((netProfit / totalSalesRevenue) * 100).toFixed(1) : '0';

  const warehouseColors = [
    { bg: 'bg-sky-400', dot: 'bg-sky-400' },
    { bg: 'bg-amber-400', dot: 'bg-amber-400' },
    { bg: 'bg-emerald-400', dot: 'bg-emerald-400' },
    { bg: 'bg-purple-400', dot: 'bg-purple-400' },
    { bg: 'bg-rose-400', dot: 'bg-rose-400' },
    { bg: 'bg-indigo-400', dot: 'bg-indigo-400' },
  ];

  const metrics = [
    {
      label: t.kpiTotalSales,
      value: formatCurrency(totalSalesRevenue),
      subtext: `${sales.length} ${lang === 'ar' ? 'طلبية' : 'orders'}`,
      textColor: 'text-zinc-100',
    },
    {
      label: t.kpiNetProfit,
      value: formatCurrency(netProfit),
      subtext: `${profitMargin}% ${lang === 'ar' ? 'هامش الربح' : 'margin'}`,
      textColor: netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400',
    },
    {
      label: t.kpiNoonReceivables,
      value: formatCurrency(noonReceivablesBalance),
      subtext: lang === 'ar' ? 'مستحقات معلقة لدى نون' : 'Pending payout',
      textColor: 'text-amber-400',
    },
    {
      label: t.kpiSupplierPayables,
      value: formatCurrency(supplierPayablesBalance),
      subtext: lang === 'ar' ? 'مستحقات للموردين' : 'Outstanding dues',
      textColor: 'text-rose-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{t.navDashboard}</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {lang === 'ar'
              ? 'مؤشرات الأداء المالي والمخزون عبر المستودعات ونون FBN'
              : 'Multi-warehouse stock parity and financial summary'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentTab('inbound')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-white rounded-md transition-colors shadow-xs"
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>{t.navInbound}</span>
          </button>
          <button
            onClick={() => setCurrentTab('warehouses')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white rounded-md transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-400" />
            <span>{t.navWarehouses}</span>
          </button>
          <button
            onClick={() => setCurrentTab('sales')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white rounded-md transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-zinc-400" />
            <span>{t.navSales}</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((item, idx) => (
          <div key={idx} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
            <span className="text-xs font-medium text-zinc-400 block">{item.label}</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className={`text-xl font-bold tracking-tight font-mono ${item.textColor}`}>
                {item.value}
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">{item.subtext}</span>
          </div>
        ))}
      </div>

      {/* 3. Warehouse Stock Balance */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              {lang === 'ar' ? 'توزيع المخزون بين المستودعات' : 'Warehouse Stock Distribution'}
            </h3>
            <p className="text-xs text-zinc-400">
              {totalStock} {t.units} {lang === 'ar' ? 'إجمالي القطع المتوفرة' : 'total items across all locations'}
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('warehouses')}
            className="text-xs font-medium text-zinc-400 hover:text-zinc-200 underline"
          >
            {lang === 'ar' ? 'إدارة التحويلات' : 'Manage Transfers'}
          </button>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full bg-zinc-950 rounded-full h-2.5 flex overflow-hidden border border-zinc-800/80">
          {warehouses.map((wh, idx) => {
            const count = getWarehouseStockCount(wh.id);
            const pct = totalStock > 0 ? (count / totalStock) * 100 : 0;
            const color = warehouseColors[idx % warehouseColors.length];
            if (pct <= 0) return null;
            return (
              <div
                key={wh.id}
                className={`${color.bg} transition-all duration-300`}
                style={{ width: `${pct}%` }}
                title={`${lang === 'ar' ? wh.nameAr : wh.name}: ${Math.round(pct)}%`}
              />
            );
          })}
        </div>

        {/* Breakdown Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {warehouses.map((wh, idx) => {
            const count = getWarehouseStockCount(wh.id);
            const pct = totalStock > 0 ? Math.round((count / totalStock) * 100) : 0;
            const color = warehouseColors[idx % warehouseColors.length];

            const isMain = wh.id === mainWarehouseId || wh.isMain;

            return (
              <div
                key={wh.id}
                className={`flex items-center justify-between p-3 rounded-md bg-zinc-950/60 border ${
                  isMain ? 'border-amber-500/40 ring-1 ring-amber-500/10' : 'border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${color.dot}`} />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-zinc-200 block">
                        {lang === 'ar' ? wh.nameAr : wh.name}
                      </span>
                      {isMain && (
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-500 block">
                      {pct}% • {wh.code}
                      {isMain && (lang === 'ar' ? ' (رئيسي)' : ' (Main)')}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold text-zinc-100 font-mono">
                  {count} <span className="text-xs font-normal text-zinc-400">{t.units}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Activity Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Sales */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100">
              {lang === 'ar' ? 'أحدث المبيعات' : 'Recent Sales'}
            </h3>
            <button
              onClick={() => setCurrentTab('sales')}
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              {t.viewAll}
            </button>
          </div>

          <div className="divide-y divide-zinc-800/80">
            {sales.slice(0, 5).map(sale => (
              <div key={sale.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-zinc-200">
                    {sale.productName}
                  </span>
                  <div className="text-[11px] text-zinc-500">
                    {sale.orderNumber} • {sale.channel}
                  </div>
                </div>
                <div className="text-end">
                  <span className="font-medium text-zinc-200 font-mono">
                    {formatCurrency(sale.totalRevenue)}
                  </span>
                  <div className="text-[11px] text-emerald-400 font-mono">
                    +{formatCurrency(sale.grossProfit)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transfers */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100">
              {lang === 'ar' ? 'أحدث التحويلات' : 'Recent Transfers'}
            </h3>
            <button
              onClick={() => setCurrentTab('warehouses')}
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              {t.viewAll}
            </button>
          </div>

          <div className="divide-y divide-zinc-800/80">
            {transfers.slice(0, 5).map(item => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-zinc-200">{item.productName}</span>
                  <div className="text-[11px] text-zinc-500">
                    {item.sourceWarehouse === 'main' ? 'Main' : 'Noon'} → {item.targetWarehouse === 'noon' ? 'Noon' : 'Main'}
                    {item.fbnAsnNumber && ` • ASN: ${item.fbnAsnNumber}`}
                  </div>
                </div>
                <div className="text-end">
                  <span className="font-medium text-zinc-200 font-mono">
                    {item.quantity} {t.units}
                  </span>
                  <div className="text-[11px] text-zinc-500">{item.transferDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
