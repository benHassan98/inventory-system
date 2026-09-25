'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WarehouseId } from '../types';
import { ShoppingBag, RotateCcw, Search, Plus } from 'lucide-react';

export const SalesReturns: React.FC = () => {
  const {
    products,
    sales,
    returns,
    addSale,
    addReturn,
    formatCurrency,
    t,
    lang,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sales' | 'returns'>('sales');

  // Sales Form State
  const [isSaleFormOpen, setIsSaleFormOpen] = useState(false);
  const [productId, setProductId] = useState<string>(products[0]?.id || '');
  const [sourceWarehouse, setSourceWarehouse] = useState<WarehouseId>('noon');
  const [quantity, setQuantity] = useState<number>(1);
  const [sellingPrice, setSellingPrice] = useState<number>(products[0]?.sellingPrice || 100);
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [saleError, setSaleError] = useState<string>('');

  // Returns Form State
  const [isReturnFormOpen, setIsReturnFormOpen] = useState(false);
  const [returnOrderNum, setReturnOrderNum] = useState<string>('');
  const [returnProductId, setReturnProductId] = useState<string>(products[0]?.id || '');
  const [returnQuantity, setReturnQuantity] = useState<number>(1);
  const [refundAmount, setRefundAmount] = useState<number>(products[0]?.sellingPrice || 100);
  const [returnWarehouse, setReturnWarehouse] = useState<WarehouseId>('main');
  const [returnCondition, setReturnCondition] = useState<'Sellable' | 'Damaged'>('Sellable');
  const [returnReason, setReturnReason] = useState<string>('Customer changed mind');

  // Search
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedProduct = products.find(p => p.id === productId);
  const availableStock = selectedProduct
    ? sourceWarehouse === 'main'
      ? selectedProduct.stockMain
      : selectedProduct.stockNoon
    : 0;

  const handleProductChange = (id: string) => {
    setProductId(id);
    const prod = products.find(p => p.id === id);
    if (prod) setSellingPrice(prod.sellingPrice);
    setSaleError('');
  };

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (quantity > availableStock) {
      setSaleError(t.insufficientStock);
      return;
    }

    const channel = sourceWarehouse === 'noon' ? 'Noon FBN' : 'Direct / Store';
    const res = addSale({
      productId: selectedProduct.id,
      productName: lang === 'ar' ? selectedProduct.nameAr : selectedProduct.name,
      sku: selectedProduct.sku,
      quantity: Number(quantity),
      sellingPrice: Number(sellingPrice),
      unitCost: selectedProduct.unitCost,
      sourceWarehouse,
      channel,
      saleDate,
    });

    if (res.success) {
      setIsSaleFormOpen(false);
      setQuantity(1);
      setSaleError('');
    } else if (res.error) {
      setSaleError(res.error);
    }
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const retProduct = products.find(p => p.id === returnProductId);
    if (!retProduct) return;

    addReturn({
      orderNumber: returnOrderNum.trim() || `ORD-RET-${Date.now().toString().slice(-4)}`,
      productId: retProduct.id,
      productName: lang === 'ar' ? retProduct.nameAr : retProduct.name,
      quantity: Number(returnQuantity),
      refundAmount: Number(refundAmount),
      targetWarehouse: returnWarehouse,
      condition: returnCondition,
      restocked: returnCondition === 'Sellable',
      reason: returnReason,
      returnDate: new Date().toISOString().split('T')[0],
    });

    setIsReturnFormOpen(false);
    setReturnOrderNum('');
  };

  const filteredSales = sales.filter(s =>
    s.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReturns = returns.filter(r =>
    r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* 1. Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{t.salesTitle}</h2>
          <p className="text-xs text-zinc-400 mt-0.5">{t.salesSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'sales' ? (
            <button
              onClick={() => {
                setIsSaleFormOpen(!isSaleFormOpen);
                setSaleError('');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-white rounded-md transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSaleFormOpen ? t.cancel : t.newSaleBtn}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsReturnFormOpen(!isReturnFormOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-white rounded-md transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isReturnFormOpen ? t.cancel : t.newReturnBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub navigation pills */}
      <div className="flex space-x-1 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('sales')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'sales'
              ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'سجل المبيعات' : 'Sales Log'} ({sales.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'returns'
              ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'المرتجعات' : 'Returns'} ({returns.length})</span>
        </button>
      </div>

      {/* 2. New Sale Form */}
      {activeTab === 'sales' && isSaleFormOpen && (
        <form onSubmit={handleSaleSubmit} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-sm font-semibold text-zinc-100">
              {lang === 'ar' ? 'تسجيل عملية بيع جديدة' : 'Record New Sale'}
            </h3>
            <span className="text-xs text-zinc-400">
              {lang === 'ar' ? 'الرصيد المتاح:' : 'Available:'}{' '}
              <strong className="text-zinc-100 font-mono font-bold">{availableStock} {t.units}</strong>
            </span>
          </div>

          {saleError && (
            <div className="p-2 text-xs text-rose-300 bg-rose-950/60 border border-rose-800/60 rounded-md">
              {saleError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Product */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.product}</label>
              <select
                value={productId}
                onChange={e => handleProductChange(e.target.value)}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              >
                {products.map(p => (
                  <option key={p.id} value={p.id} className="bg-zinc-900 text-zinc-100">
                    {p.sku} - {lang === 'ar' ? p.nameAr : p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Warehouse / Channel */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.salesChannelLabel}</label>
              <select
                value={sourceWarehouse}
                onChange={e => {
                  setSourceWarehouse(e.target.value as WarehouseId);
                  setSaleError('');
                }}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
              >
                <option value="noon" className="bg-zinc-900 text-zinc-100">{t.channelNoon}</option>
                <option value="main" className="bg-zinc-900 text-zinc-100">{t.channelDirect}</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.quantity}</label>
              <input
                type="number"
                min="1"
                max={availableStock}
                value={quantity}
                onChange={e => {
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1));
                  setSaleError('');
                }}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.sellingPrice} ({t.currency})</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={sellingPrice}
                onChange={e => setSellingPrice(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <span className="text-xs text-zinc-400 font-mono">
              Total Revenue: <strong className="text-zinc-100">{formatCurrency(quantity * sellingPrice)}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSaleFormOpen(false)}
                className="px-3 py-1.5 text-xs font-medium border border-zinc-700 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white"
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
          </div>
        </form>
      )}

      {/* 3. New Return Form */}
      {activeTab === 'returns' && isReturnFormOpen && (
        <form onSubmit={handleReturnSubmit} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-sm font-semibold text-zinc-100">
              {lang === 'ar' ? 'معالجة مرتجع عميل' : 'Process Customer Return'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{lang === 'ar' ? 'رقم طلب البيع' : 'Order Reference #'}</label>
              <input
                type="text"
                placeholder="e.g. NON-EG-1092"
                value={returnOrderNum}
                onChange={e => setReturnOrderNum(e.target.value)}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.product}</label>
              <select
                value={returnProductId}
                onChange={e => {
                  setReturnProductId(e.target.value);
                  const p = products.find(prod => prod.id === e.target.value);
                  if (p) setRefundAmount(p.sellingPrice);
                }}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id} className="bg-zinc-900 text-zinc-100">
                    {p.sku} - {lang === 'ar' ? p.nameAr : p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.returnConditionLabel}</label>
              <select
                value={returnCondition}
                onChange={e => setReturnCondition(e.target.value as 'Sellable' | 'Damaged')}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
              >
                <option value="Sellable" className="bg-zinc-900 text-zinc-100">{t.sellable}</option>
                <option value="Damaged" className="bg-zinc-900 text-zinc-100">{t.damaged}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.quantity}</label>
              <input
                type="number"
                min="1"
                value={returnQuantity}
                onChange={e => setReturnQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.refundAmountLabel} ({t.currency})</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={refundAmount}
                onChange={e => setRefundAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.restockWarehouseLabel}</label>
              <select
                value={returnWarehouse}
                onChange={e => setReturnWarehouse(e.target.value as WarehouseId)}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
              >
                <option value="main" className="bg-zinc-900 text-zinc-100">{lang === 'ar' ? 'المستودع الرئيسي (Cairo)' : 'Main Warehouse'}</option>
                <option value="noon" className="bg-zinc-900 text-zinc-100">Noon FBN</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={() => setIsReturnFormOpen(false)}
              className="px-3 py-1.5 text-xs font-medium border border-zinc-700 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white"
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

      {/* 4. Search Filter */}
      <div className="relative w-full sm:w-64">
        <Search className="w-3.5 h-3.5 absolute start-2.5 top-2.5 text-zinc-500" />
        <input
          type="text"
          placeholder={t.search}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full ps-8 pe-3 py-1.5 text-xs rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
        />
      </div>

      {/* 5. Tables */}
      {activeTab === 'sales' ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2.5 text-start">{lang === 'ar' ? 'رقم الطلب' : 'Order #'}</th>
                  <th className="px-3 py-2.5 text-start">{t.date}</th>
                  <th className="px-3 py-2.5 text-start">{lang === 'ar' ? 'قناة البيع' : 'Channel'}</th>
                  <th className="px-3 py-2.5 text-start">{t.product}</th>
                  <th className="px-3 py-2.5 text-end">{t.quantity}</th>
                  <th className="px-3 py-2.5 text-end">{t.totalAmount}</th>
                  <th className="px-3 py-2.5 text-end">{t.grossProfit}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-medium text-zinc-200">{sale.orderNumber}</td>
                    <td className="px-3 py-2.5 text-zinc-400">{sale.saleDate}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium ${
                        sale.channel === 'Noon FBN'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                      }`}>
                        {sale.channel}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-medium text-zinc-200">{sale.productName}</span>
                      <span className="block text-[11px] text-zinc-500">{sale.sku}</span>
                    </td>
                    <td className="px-3 py-2.5 text-end font-mono font-medium text-zinc-200">{sale.quantity}</td>
                    <td className="px-3 py-2.5 text-end font-mono font-bold text-zinc-100">
                      {formatCurrency(sale.totalRevenue)}
                    </td>
                    <td className="px-3 py-2.5 text-end font-mono font-medium text-emerald-400">
                      +{formatCurrency(sale.grossProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2.5 text-start">{lang === 'ar' ? 'رقم الطلب' : 'Order #'}</th>
                  <th className="px-3 py-2.5 text-start">{t.date}</th>
                  <th className="px-3 py-2.5 text-start">{t.product}</th>
                  <th className="px-3 py-2.5 text-end">{t.quantity}</th>
                  <th className="px-3 py-2.5 text-end">{lang === 'ar' ? 'المبلغ المسترد' : 'Refund'}</th>
                  <th className="px-3 py-2.5 text-start">{t.returnConditionLabel}</th>
                  <th className="px-3 py-2.5 text-start">{t.warehouse}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredReturns.map(ret => (
                  <tr key={ret.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-medium text-zinc-200">{ret.orderNumber}</td>
                    <td className="px-3 py-2.5 text-zinc-400">{ret.returnDate}</td>
                    <td className="px-3 py-2.5 font-medium text-zinc-200">{ret.productName}</td>
                    <td className="px-3 py-2.5 text-end font-mono font-medium text-zinc-200">{ret.quantity}</td>
                    <td className="px-3 py-2.5 text-end font-mono font-medium text-rose-400">
                      -{formatCurrency(ret.refundAmount)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium ${
                        ret.condition === 'Sellable'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                      }`}>
                        {ret.condition}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-zinc-400">
                      {ret.targetWarehouse === 'noon' ? 'Noon FBN' : 'Main'}
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
