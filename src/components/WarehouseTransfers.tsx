'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRightLeft, Search, Building2, Store, PackagePlus, Plus, Check, Star } from 'lucide-react';

export const WarehouseTransfers: React.FC = () => {
  const {
    products,
    warehouses,
    mainWarehouseId,
    setMainWarehouse,
    transfers,
    addWarehouse,
    addStockTransfer,
    addProduct,
    getProductStock,
    getWarehouseStockCount,
    formatCurrency,
    t,
    lang,
  } = useApp();

  // Transfer Form toggle & state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productId, setProductId] = useState<number>(products.length ? products[0].id : -1);
  const [sourceWarehouse, setSourceWarehouse] = useState<number>(mainWarehouseId);
  const [targetWarehouse, setTargetWarehouse] = useState<number>(
    warehouses.find(w => w.id !== (mainWarehouseId || warehouses[0].id)).id
  );
  const [quantity, setQuantity] = useState<number>(0);
  const [fbnAsnNumber, setFbnAsnNumber] = useState<string>('');
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Add Product Form state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUnitCost, setNewUnitCost] = useState<number>(100);
  const [newSellingPrice, setNewSellingPrice] = useState<number>(180);

  // Add Warehouse Form state
  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);
  const [newWhName, setNewWhName] = useState('');
  const [newWhType, setNewWhType] = useState<'Noon' | 'Internal'>('Internal');
  const [newWhIsMain, setNewWhIsMain] = useState(false);

  // Table search
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedProduct = products.find(p => p.id === productId);
  const availableSourceStock = selectedProduct ? getProductStock(selectedProduct, sourceWarehouse) : 0;

  const openTransferForProduct = (prodId: number, defaultSource?: number) => {
    setProductId(prodId);
    const src = defaultSource || warehouses[0]?.id;
    const tgt = warehouses.find(w => w.id !== src)?.id || warehouses[1]?.id;
    setSourceWarehouse(src);
    setTargetWarehouse(tgt);
    setIsFormOpen(true);
    setIsAddProductOpen(false);
    setIsAddWarehouseOpen(false);
    setErrorMsg('');
  };

  const handleSourceChange = (src: number) => {
    setSourceWarehouse(src);
    if (targetWarehouse === src) {
      const altTarget = warehouses.find(w => w.id !== src);
      if (altTarget) setTargetWarehouse(altTarget.id);
    }
    setErrorMsg('');
  };

  const handleAddWarehouseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhName.trim()) return;

    const createdWh = addWarehouse({
      name: newWhName,
      type: newWhType,
      isMain: newWhIsMain,
    });

    setTargetWarehouse(createdWh.id);
    setNewWhName('');
    setNewWhType('Internal');
    setNewWhIsMain(false);
    setIsAddWarehouseOpen(false);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created = addProduct({
      name: newName,
      unitCost: Number(newUnitCost),
      sellingPrice: Number(newSellingPrice),
      stock: {}
    });

    setProductId(created.id);
    setNewName('');
    setNewUnitCost(100);
    setNewSellingPrice(180);
    setIsAddProductOpen(false);
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
      sourceWarehouse,
      targetWarehouse,
      quantity: Number(quantity),
      status: 'Completed',
      transferDate,
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
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* 1. Header & Stock Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{t.warehousesTitle}</h2>
          <p className="text-xs text-zinc-400 mt-0.5">{t.warehousesSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setIsAddWarehouseOpen(!isAddWarehouseOpen);
              if (isFormOpen) setIsFormOpen(false);
              if (isAddProductOpen) setIsAddProductOpen(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white rounded-md transition-colors shadow-xs"
          >
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            <span>{isAddWarehouseOpen ? t.cancel : (t.addWarehouseBtn || '+ Add Warehouse')}</span>
          </button>
          <button
            onClick={() => {
              setIsAddProductOpen(!isAddProductOpen);
              if (isFormOpen) setIsFormOpen(false);
              if (isAddWarehouseOpen) setIsAddWarehouseOpen(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white rounded-md transition-colors shadow-xs"
          >
            <PackagePlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAddProductOpen ? t.cancel : (t.addProductBtn || '+ Add Product')}</span>
          </button>
          <button
            onClick={() => {
              setIsFormOpen(!isFormOpen);
              if (isAddProductOpen) setIsAddProductOpen(false);
              if (isAddWarehouseOpen) setIsAddWarehouseOpen(false);
              setErrorMsg('');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-white rounded-md transition-colors shadow-xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>{isFormOpen ? t.cancel : t.transferStockBtn}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Warehouse Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {warehouses.map(wh => {
          const isNoon = wh.type === 'Noon';
          const isMain = wh.id === mainWarehouseId || wh.isMain;
          const count = getWarehouseStockCount(wh.id);
          return (
            <div
              key={wh.id}
              className={`p-3.5 bg-zinc-900 border rounded-lg flex flex-col justify-between transition-colors shadow-xs ${isMain
                ? 'border-amber-500/50 ring-1 ring-amber-500/20 bg-linear-to-b from-zinc-900 via-zinc-900 to-amber-950/15'
                : 'border-zinc-800 hover:border-zinc-700'
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-md ${isMain
                      ? 'bg-amber-400/20 text-amber-300'
                      : isNoon
                        ? 'bg-amber-950/50 text-amber-400'
                        : 'bg-sky-950/50 text-sky-400'
                      }`}
                  >
                    {isMain ? (
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ) : isNoon ? (
                      <Store className="w-4 h-4" />
                    ) : (
                      <Building2 className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-100 block">
                      {wh.name}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {isMain && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      {t.mainWarehouseBadge || (lang === 'ar' ? 'المستودع الرئيسي' : 'Primary Main')}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${isNoon
                      ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                      : 'bg-sky-950/60 text-sky-300 border-sky-800/60'
                      }`}
                  >
                    {isNoon ? 'Noon' : 'Internal'}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] text-zinc-400 block">{lang === 'ar' ? 'الرصيد الكلي:' : 'Total Stock:'}</span>
                  <span className="text-base font-bold text-zinc-100 font-mono">
                    {count} <span className="text-xs font-normal text-zinc-400">{t.units}</span>
                  </span>
                </div>

                {!isMain ? (
                  <button
                    type="button"
                    onClick={() => setMainWarehouse(wh.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded border border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:text-amber-300 hover:border-amber-700/60 hover:bg-amber-950/30 transition-all cursor-pointer shadow-xs"
                    title={lang === 'ar' ? 'تعيين هذا المستودع كمستودع رئيسي افتراضي' : 'Designate as default main warehouse'}
                  >
                    <Star className="w-3 h-3 text-zinc-400 group-hover:text-amber-400" />
                    <span>{t.setAsMainWarehouseBtn || (lang === 'ar' ? 'تعيين كرئيسي' : 'Set as Main')}</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400/90 py-1">
                    <Check className="w-3 h-3" />
                    <span>{lang === 'ar' ? 'المستودع المعتمد' : 'Default Facility'}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Quick Add Warehouse Card */}
        <button
          type="button"
          onClick={() => {
            setIsAddWarehouseOpen(true);
            setIsFormOpen(false);
            setIsAddProductOpen(false);
          }}
          className="p-3.5 border border-dashed border-zinc-700 hover:border-sky-500/60 bg-zinc-900/40 hover:bg-sky-950/20 rounded-lg flex flex-col items-center justify-center gap-1.5 text-zinc-400 hover:text-sky-300 transition-colors group cursor-pointer min-h-[96px]"
        >
          <div className="w-7 h-7 rounded-full bg-zinc-800 group-hover:bg-sky-900/50 flex items-center justify-center transition-colors">
            <Plus className="w-4 h-4 text-zinc-400 group-hover:text-sky-400" />
          </div>
          <span className="text-xs font-medium">{t.addWarehouseBtn || '+ Add New Warehouse'}</span>
        </button>
      </div>

      {/* Add Warehouse Form */}
      {isAddWarehouseOpen && (
        <form onSubmit={handleAddWarehouseSubmit} className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>{t.addWarehouseModalTitle || (lang === 'ar' ? 'تسجيل مستودع أو مركز وفاء جديد' : 'Register New Warehouse Facility')}</span>
            </h3>
            <span className="text-xs text-zinc-400">
              {lang === 'ar' ? 'إضافة موقع تخزين جديد لإدارة البضائع والتحويلات' : 'Add a new fulfillment center or internal warehouse'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Name EN */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.warehouseNameEnLabel} *</label>
              <input
                type="text"
                placeholder="e.g. Alexandria Distribution Hub"
                value={newWhName}
                onChange={e => setNewWhName(e.target.value)}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.warehouseTypeLabel}</label>
              <select
                value={newWhType}
                onChange={e => setNewWhType(e.target.value as 'Internal' | 'Noon')}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
              >
                <option value="Internal">{t.typeInternal}</option>
                <option value="FBN 3PL">{t.type3PL}</option>
              </select>
            </div>

            {/* Designate as Main Warehouse Checkbox */}
            <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="newWhIsMain"
                checked={newWhIsMain}
                onChange={e => setNewWhIsMain(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="newWhIsMain" className="text-xs text-zinc-300 flex items-center gap-1.5 cursor-pointer select-none">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.setAsMainCheckbox || (lang === 'ar' ? 'تعيين كمستودع رئيسي افتراضي' : 'Set as Default Main Warehouse')}</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={() => setIsAddWarehouseOpen(false)}
              className="px-3 py-1.5 text-xs font-medium border border-zinc-700 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-sky-500 text-zinc-950 rounded-md hover:bg-sky-400 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'حفظ المستودع' : 'Save Warehouse'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Add Product Form */}
      {isAddProductOpen && (
        <form onSubmit={handleAddProductSubmit} className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
              <PackagePlus className="w-4 h-4 text-emerald-400" />
              <span>{t.addProductModalTitle}</span>
            </h3>
            <span className="text-xs text-zinc-400">
              {lang === 'ar' ? 'إضافة صنف جديد لقاعدة بيانات المخزون' : 'Add new product SKU to master inventory'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Name EN */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.productNameEnLabel} *</label>
              <input
                type="text"
                placeholder="e.g. Wireless Bluetooth Speaker 20W"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              />
            </div>

            {/* Unit Cost */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.unitCost} ({t.currency}) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newUnitCost}
                onChange={e => setNewUnitCost(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full text-xs font-mono rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.sellingPrice} ({t.currency}) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newSellingPrice}
                onChange={e => setNewSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full text-xs font-mono rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              />
            </div>

          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={() => setIsAddProductOpen(false)}
              className="px-3 py-1.5 text-xs font-medium border border-zinc-700 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-emerald-500 text-zinc-950 rounded-md hover:bg-emerald-400 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'حفظ المنتج في المخزون' : 'Save Product to Inventory'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. Transfer Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-4 shadow-sm">
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
                  setProductId(Number(e.target.value));
                  setErrorMsg('');
                }}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              >
                {products.map(p => (
                  <option key={p.id} value={p.id} className="bg-zinc-900 text-zinc-100">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Warehouse */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.sourceWarehouseLabel}</label>
              <select
                value={sourceWarehouse}
                onChange={e => handleSourceChange(Number(e.target.value))}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
              >
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.id} className="bg-zinc-900 text-zinc-100">
                    {wh.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Warehouse */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-300">{t.destinationWarehouseLabel}</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddWarehouseOpen(true);
                    setIsFormOpen(false);
                  }}
                  className="text-[11px] text-zinc-400 hover:text-sky-300 inline-flex items-center gap-0.5 font-medium underline"
                >
                  <Plus className="w-3 h-3" />
                  {t.newWarehouseQuickBtn || (lang === 'ar' ? '+ مستودع جديد' : '+ New Warehouse')}
                </button>
              </div>
              <select
                value={targetWarehouse}
                onChange={e => setTargetWarehouse(Number(e.target.value))}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
              >
                {warehouses
                  .filter(wh => wh.id !== sourceWarehouse)
                  .map(wh => (
                    <option key={wh.id} value={wh.id} className="bg-zinc-900 text-zinc-100">
                      {wh.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-300">{t.quantity}</label>
                {availableSourceStock > 0 && (
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, Math.floor(availableSourceStock * 0.5)))}
                      className="text-zinc-400 hover:text-zinc-200 underline"
                    >
                      50%
                    </button>
                    <span className="text-zinc-600">•</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(availableSourceStock)}
                      className="text-zinc-400 hover:text-zinc-200 underline"
                    >
                      {lang === 'ar' ? 'الكل' : 'Max'}
                    </button>
                  </div>
                )}
              </div>
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
                  {warehouses.map(wh => {
                    const isMain = wh.id === mainWarehouseId || wh.isMain;
                    return (
                      <th key={wh.id} className="px-3 py-2.5 text-end">
                        <span className="inline-flex items-center gap-1 justify-end">
                          {isMain && <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />}
                          <span>{wh.name}</span>
                        </span>
                      </th>
                    );
                  })}
                  <th className="px-3 py-2.5 text-end">{lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
                  <th className="px-3 py-2.5 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredProducts.map(p => {
                  const totalProductStock = warehouses.reduce((acc, wh) => acc + getProductStock(p, wh.id), 0);

                  return (
                    <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-zinc-200">
                            {p.name}
                          </span>
                        </div>
                        <span className="block text-[11px] text-zinc-500 mt-0.5">
                          {lang === 'ar' ? 'التكلفة: ' : 'Cost: '}{formatCurrency(p.unitCost)} • {lang === 'ar' ? 'البيع: ' : 'Price: '}{formatCurrency(p.sellingPrice)}
                        </span>
                      </td>
                      {warehouses.map(wh => (
                        <td key={wh.id} className="px-3 py-2.5 text-end font-mono font-medium text-zinc-200">
                          {getProductStock(p, wh.id)}
                        </td>
                      ))}
                      <td className="px-3 py-2.5 text-end font-mono font-bold text-zinc-100">
                        {totalProductStock}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => openTransferForProduct(p.id)}
                          className="px-2 py-1 text-[11px] font-medium border border-zinc-700 bg-zinc-800 rounded text-zinc-200 hover:bg-zinc-700 hover:text-white"
                        >
                          {lang === 'ar' ? 'تحويل' : 'Transfer'}
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
                {transfers.map(item => {
                  const srcWh = warehouses.find(w => w.id === item.sourceWarehouse);
                  const tgtWh = warehouses.find(w => w.id === item.targetWarehouse);
                  const srcLabel = srcWh ? (srcWh.name) : item.sourceWarehouse;
                  const tgtLabel = tgtWh ? (tgtWh.name) : item.targetWarehouse;

                  return (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-3 py-2.5 text-zinc-400">{item.transferDate}</td>
                      <td className="px-3 py-2.5 font-medium text-zinc-200">{products[item.productId].name}</td>
                      <td className="px-3 py-2.5 text-zinc-300">
                        {srcLabel} → {tgtLabel}
                      </td>
                      <td className="px-3 py-2.5 text-end font-mono font-medium text-zinc-200">{item.quantity}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
