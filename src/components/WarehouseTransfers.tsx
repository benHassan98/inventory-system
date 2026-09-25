'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WarehouseId } from '../types';
import { ArrowRightLeft, Search, AlertTriangle, Building2, Store } from 'lucide-react';

export const WarehouseTransfers: React.FC = () => {
  const {
    products,
    transfers,
    mainWarehouseStockCount,
    noonWarehouseStockCount,
    addStockTransfer,
    t,
    lang,
  } = useApp();

  // Form toggle & state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productId, setProductId] = useState<string>(products[0]?.id || '');
  const [sourceWarehouse, setSourceWarehouse] = useState<WarehouseId>('main');
  const [targetWarehouse, setTargetWarehouse] = useState<WarehouseId>('noon');
  const [quantity, setQuantity] = useState<number>(20);
  const [fbnAsnNumber, setFbnAsnNumber] = useState<string>('');
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Table search
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedProduct = products.find(p => p.id === productId);
  const availableSourceStock = selectedProduct
    ? sourceWarehouse === 'main'
      ? selectedProduct.stockMain
      : selectedProduct.stockNoon
    : 0;

  const openTransferForProduct = (prodId: string, defaultSource: WarehouseId = 'main') => {
    setProductId(prodId);
    setSourceWarehouse(defaultSource);
    setTargetWarehouse(defaultSource === 'main' ? 'noon' : 'main');
    setIsFormOpen(true);
    setErrorMsg('');
  };

  const handleSourceChange = (src: WarehouseId) => {
    setSourceWarehouse(src);
    setTargetWarehouse(src === 'main' ? 'noon' : 'main');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (quantity > availableSourceStock) {
      setErrorMsg(t.insufficientStock);
      return;
    }

    const res = addStockTransfer({
      productId: selectedProduct.id,
      productName: lang === 'ar' ? selectedProduct.nameAr : selectedProduct.name,
      sku: selectedProduct.sku,
      sourceWarehouse,
      targetWarehouse,
      quantity: Number(quantity),
      status: 'Completed',
      fbnAsnNumber: fbnAsnNumber.trim() || undefined,
      transferDate,
      notes: notes.trim() || undefined,
    });

    if (res.success) {
      setIsFormOpen(false);
      setNotes('');
      setFbnAsnNumber('');
      setErrorMsg('');
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* 1. Header & Stock Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{t.warehousesTitle}</h2>
          <p className="text-xs text-zinc-400 mt-0.5">{t.warehousesSubtitle}</p>
        </div>

        <button
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            setErrorMsg('');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-white rounded-md transition-colors self-start sm:self-auto shadow-xs"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>{isFormOpen ? t.cancel : t.transferStockBtn}</span>
        </button>
      </div>

      {/* Warehouse Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-zinc-400" />
            <div>
              <span className="text-xs font-medium text-zinc-200 block">{t.mainWarehouse}</span>
              <span className="text-[11px] text-zinc-500">WH-CAI-01 • Cairo Central</span>
            </div>
          </div>
          <span className="text-base font-bold text-zinc-100 font-mono">
            {mainWarehouseStockCount} <span className="text-xs font-normal text-zinc-400">{t.units}</span>
          </span>
        </div>

        <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Store className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-xs font-medium text-zinc-200 block">{t.noonWarehouse}</span>
              <span className="text-[11px] text-zinc-500">FBN-6OCT • Noon 3PL Fulfillment</span>
            </div>
          </div>
          <span className="text-base font-bold text-zinc-100 font-mono">
            {noonWarehouseStockCount} <span className="text-xs font-normal text-zinc-400">{t.units}</span>
          </span>
        </div>
      </div>

      {/* 2. Transfer Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-sm font-semibold text-zinc-100">
              {lang === 'ar' ? 'تحويل مخزون بين المستودعات' : 'Execute Stock Transfer'}
            </h3>
            <span className="text-xs text-zinc-400">
              {lang === 'ar' ? 'الرصيد المتاح بالمصدر:' : 'Available in Source:'}{' '}
              <strong className="text-zinc-100 font-mono font-bold">{availableSourceStock} {t.units}</strong>
            </span>
          </div>

          {errorMsg && (
            <div className="p-2 text-xs text-rose-300 bg-rose-950/60 border border-rose-800/60 rounded-md">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Product */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.product}</label>
              <select
                value={productId}
                onChange={e => {
                  setProductId(e.target.value);
                  setErrorMsg('');
                }}
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

            {/* Source Warehouse */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.sourceWarehouseLabel}</label>
              <select
                value={sourceWarehouse}
                onChange={e => handleSourceChange(e.target.value as WarehouseId)}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
              >
                <option value="main" className="bg-zinc-900 text-zinc-100">{lang === 'ar' ? 'المستودع الرئيسي (Cairo)' : 'Main Warehouse (Cairo)'}</option>
                <option value="noon" className="bg-zinc-900 text-zinc-100">{lang === 'ar' ? 'مستودع نون FBN' : 'Noon FBN Warehouse'}</option>
              </select>
            </div>

            {/* Target Warehouse */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.destinationWarehouseLabel}</label>
              <select
                value={targetWarehouse}
                onChange={e => setTargetWarehouse(e.target.value as WarehouseId)}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
              >
                <option value="noon" className="bg-zinc-900 text-zinc-100">{lang === 'ar' ? 'مستودع نون FBN' : 'Noon FBN Warehouse'}</option>
                <option value="main" className="bg-zinc-900 text-zinc-100">{lang === 'ar' ? 'المستودع الرئيسي (Cairo)' : 'Main Warehouse (Cairo)'}</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.quantity}</label>
              <input
                type="number"
                min="1"
                max={availableSourceStock}
                value={quantity}
                onChange={e => {
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1));
                  setErrorMsg('');
                }}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              />
            </div>

            {/* FBN ASN Number */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.fbnAsnLabel}</label>
              <input
                type="text"
                placeholder="e.g. ASN-2026-904"
                value={fbnAsnNumber}
                onChange={e => setFbnAsnNumber(e.target.value)}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            {/* Transfer Date */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.transferDateLabel}</label>
              <input
                type="date"
                value={transferDate}
                onChange={e => setTransferDate(e.target.value)}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.notes}</label>
              <input
                type="text"
                placeholder="Optional transfer note..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
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

      {/* 3. Product Inventory Distribution Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-zinc-100">{t.stockComparisonTable}</h3>
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
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2.5 text-start">SKU</th>
                  <th className="px-3 py-2.5 text-start">{t.product}</th>
                  <th className="px-3 py-2.5 text-end">{lang === 'ar' ? 'المستودع الرئيسي' : 'Main WH'}</th>
                  <th className="px-3 py-2.5 text-end">Noon FBN</th>
                  <th className="px-3 py-2.5 text-end">{lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
                  <th className="px-3 py-2.5 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredProducts.map(p => {
                  const isLow = p.stockMain <= p.minStockAlert || p.stockNoon <= p.minStockAlert;
                  return (
                    <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-3 py-2.5 font-mono font-medium text-zinc-200">{p.sku}</td>
                      <td className="px-3 py-2.5">
                        <span className="font-medium text-zinc-200">
                          {lang === 'ar' ? p.nameAr : p.name}
                        </span>
                        {isLow && (
                          <span className="ms-2 inline-flex items-center gap-0.5 text-[10px] text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60 font-medium">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {t.lowStockWarning}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-end font-mono font-medium text-zinc-200">{p.stockMain}</td>
                      <td className="px-3 py-2.5 text-end font-mono font-medium text-zinc-200">{p.stockNoon}</td>
                      <td className="px-3 py-2.5 text-end font-mono font-bold text-zinc-100">{p.stockMain + p.stockNoon}</td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => openTransferForProduct(p.id, 'main')}
                          className="px-2 py-1 text-[11px] font-medium border border-zinc-700 bg-zinc-800 rounded text-zinc-200 hover:bg-zinc-700 hover:text-white"
                        >
                          {lang === 'ar' ? 'تحويل لـ Noon' : 'Transfer'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Transfer History Log */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-100">{t.transferHistory}</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2.5 text-start">{t.reference}</th>
                  <th className="px-3 py-2.5 text-start">{t.date}</th>
                  <th className="px-3 py-2.5 text-start">{t.product}</th>
                  <th className="px-3 py-2.5 text-start">{lang === 'ar' ? 'المسار' : 'Route'}</th>
                  <th className="px-3 py-2.5 text-end">{t.quantity}</th>
                  <th className="px-3 py-2.5 text-start">ASN</th>
                  <th className="px-3 py-2.5 text-start">{t.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {transfers.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-medium text-zinc-200">{item.reference}</td>
                    <td className="px-3 py-2.5 text-zinc-400">{item.transferDate}</td>
                    <td className="px-3 py-2.5 font-medium text-zinc-200">{item.productName}</td>
                    <td className="px-3 py-2.5 text-zinc-300">
                      {item.sourceWarehouse === 'main' ? 'Main' : 'Noon'} → {item.targetWarehouse === 'noon' ? 'Noon FBN' : 'Main'}
                    </td>
                    <td className="px-3 py-2.5 text-end font-mono font-medium text-zinc-200">{item.quantity}</td>
                    <td className="px-3 py-2.5 font-mono text-zinc-400">{item.fbnAsnNumber || '-'}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
