'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WarehouseId } from '../types';
import { Search, Plus } from 'lucide-react';

export const InboundPurchases: React.FC = () => {
  const {
    inboundShipments,
    products,
    suppliers,
    addInboundShipment,
    formatCurrency,
    t,
    lang,
  } = useApp();

  // Form toggle & state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [productId, setProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(50);
  const [unitCost, setUnitCost] = useState<number>(products[0]?.unitCost || 100);
  const [targetWarehouse, setTargetWarehouse] = useState<WarehouseId>('main');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState<'Unpaid' | 'Partial' | 'Paid'>('Unpaid');
  const [notes, setNotes] = useState<string>('');

  // Table filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');

  const selectedSupplier = suppliers.find(s => s.id === supplierId);
  const selectedProduct = products.find(p => p.id === productId);

  const handleProductSelect = (id: string) => {
    setProductId(id);
    const p = products.find(prod => prod.id === id);
    if (p) setUnitCost(p.unitCost);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !selectedProduct) return;

    addInboundShipment({
      supplierId: selectedSupplier.id,
      supplierName: lang === 'ar' ? selectedSupplier.nameAr : selectedSupplier.name,
      productId: selectedProduct.id,
      productName: lang === 'ar' ? selectedProduct.nameAr : selectedProduct.name,
      sku: selectedProduct.sku,
      quantity: Number(quantity),
      unitCost: Number(unitCost),
      targetWarehouse,
      purchaseDate,
      paymentStatus,
      notes: notes.trim() || undefined,
    });

    // Reset & close form
    setQuantity(50);
    setNotes('');
    setIsFormOpen(false);
  };

  const filteredShipments = inboundShipments.filter(item => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWh = warehouseFilter === 'all' || item.targetWarehouse === warehouseFilter;
    return matchesSearch && matchesWh;
  });

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{t.inboundTitle}</h2>
          <p className="text-xs text-zinc-400 mt-0.5">{t.inboundSubtitle}</p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-white rounded-md transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isFormOpen ? t.cancel : t.newInboundBtn}</span>
        </button>
      </div>

      {/* 2. Collapsible Inbound Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-sm font-semibold text-zinc-100">
              {lang === 'ar' ? 'تسجيل شحنة توريد جديدة' : 'Record New Inbound Shipment'}
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              {lang === 'ar' ? 'الإجمالي المتوقع:' : 'Expected Total:'}{' '}
              <strong className="text-zinc-100 font-bold">{formatCurrency(quantity * unitCost)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Supplier */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.supplierNameLabel}</label>
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id} className="bg-zinc-900 text-zinc-100">
                    {lang === 'ar' ? s.nameAr : s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.productNameLabel}</label>
              <select
                value={productId}
                onChange={e => handleProductSelect(e.target.value)}
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

            {/* Target Warehouse */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.targetWarehouseLabel}</label>
              <select
                value={targetWarehouse}
                onChange={e => setTargetWarehouse(e.target.value as WarehouseId)}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
              >
                <option value="main" className="bg-zinc-900 text-zinc-100">{lang === 'ar' ? 'المستودع الرئيسي (القاهرة)' : 'Main Warehouse (Cairo)'}</option>
                <option value="noon" className="bg-zinc-900 text-zinc-100">{lang === 'ar' ? 'مستودع نون FBN (أكتوبر)' : 'Noon FBN Warehouse'}</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.quantity}</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              />
            </div>

            {/* Unit Cost */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.unitCost} ({t.currency})</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={unitCost}
                onChange={e => setUnitCost(Math.max(0.01, parseFloat(e.target.value) || 0))}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              />
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.paymentStatusLabel}</label>
              <select
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as 'Unpaid' | 'Partial' | 'Paid')}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
              >
                <option value="Unpaid" className="bg-zinc-900 text-zinc-100">{t.unpaid}</option>
                <option value="Paid" className="bg-zinc-900 text-zinc-100">{t.paid}</option>
                <option value="Partial" className="bg-zinc-900 text-zinc-100">{t.partial}</option>
              </select>
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

      {/* 3. Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={warehouseFilter}
            onChange={e => setWarehouseFilter(e.target.value)}
            className="text-xs rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
          >
            <option value="all" className="bg-zinc-900">{t.allWarehouses}</option>
            <option value="main" className="bg-zinc-900">{lang === 'ar' ? 'المستودع الرئيسي' : 'Main Warehouse'}</option>
            <option value="noon" className="bg-zinc-900">Noon FBN</option>
          </select>
        </div>
      </div>

      {/* 4. Shipments Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-medium uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2.5 text-start">{t.reference}</th>
                <th className="px-3 py-2.5 text-start">{t.date}</th>
                <th className="px-3 py-2.5 text-start">{t.supplier}</th>
                <th className="px-3 py-2.5 text-start">{t.product}</th>
                <th className="px-3 py-2.5 text-end">{t.quantity}</th>
                <th className="px-3 py-2.5 text-end">{t.totalCost}</th>
                <th className="px-3 py-2.5 text-start">{t.warehouse}</th>
                <th className="px-3 py-2.5 text-start">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-zinc-500">
                    {lang === 'ar' ? 'لا توجد شحنات تطابق البحث' : 'No shipments found'}
                  </td>
                </tr>
              ) : (
                filteredShipments.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-medium text-zinc-200">{item.reference}</td>
                    <td className="px-3 py-2.5 text-zinc-400">{item.purchaseDate}</td>
                    <td className="px-3 py-2.5 font-medium text-zinc-200">{item.supplierName}</td>
                    <td className="px-3 py-2.5">
                      <span className="font-medium text-zinc-200">{item.productName}</span>
                      <span className="block text-[11px] text-zinc-500">{item.sku}</span>
                    </td>
                    <td className="px-3 py-2.5 text-end font-mono font-medium text-zinc-200">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-2.5 text-end font-mono font-medium text-zinc-100">
                      {formatCurrency(item.totalCost)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium ${
                        item.targetWarehouse === 'noon'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                      }`}>
                        {item.targetWarehouse === 'noon' ? 'Noon FBN' : 'Main'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium ${
                        item.paymentStatus === 'Paid'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                          : item.paymentStatus === 'Partial'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                      }`}>
                        {item.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
