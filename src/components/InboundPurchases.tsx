'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WarehouseId } from '../types';
import { Search, Plus, UserPlus, PackagePlus, Building2, Check, X, Star } from 'lucide-react';

export const InboundPurchases: React.FC = () => {
  const {
    inboundShipments,
    products,
    suppliers,
    warehouses,
    mainWarehouseId,
    addWarehouse,
    addInboundShipment,
    addSupplier,
    addProduct,
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
  const [targetWarehouse, setTargetWarehouse] = useState<WarehouseId>(mainWarehouseId || 'main');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState<'Unpaid' | 'Partial' | 'Paid'>('Unpaid');
  const [partialCash, setPartialCash] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Quick Supplier Add inside Inbound
  const [isQuickSupplierOpen, setIsQuickSupplierOpen] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newSupNameAr, setNewSupNameAr] = useState('');
  const [newSupContact, setNewSupContact] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupBalance, setNewSupBalance] = useState<number>(0);

  // Quick Product Add inside Inbound
  const [isQuickProductOpen, setIsQuickProductOpen] = useState(false);
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdName, setNewProdName] = useState('');
  const [newProdNameAr, setNewProdNameAr] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Electronics');
  const [newProdUnitCost, setNewProdUnitCost] = useState<number>(100);
  const [newProdSellingPrice, setNewProdSellingPrice] = useState<number>(180);
  const [newProdMinAlert, setNewProdMinAlert] = useState<number>(10);

  // Quick Warehouse Add inside Inbound
  const [isQuickWarehouseOpen, setIsQuickWarehouseOpen] = useState(false);
  const [newWhName, setNewWhName] = useState('');
  const [newWhNameAr, setNewWhNameAr] = useState('');
  const [newWhCode, setNewWhCode] = useState('');
  const [newWhType, setNewWhType] = useState<'Internal' | 'FBN 3PL'>('Internal');
  const [newWhLocation, setNewWhLocation] = useState('');
  const [newWhLocationAr, setNewWhLocationAr] = useState('');
  const [newWhIsMain, setNewWhIsMain] = useState(false);

  // Table filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');

  const selectedSupplier = suppliers.find(s => s.id === supplierId);
  const selectedProduct = products.find(p => p.id === productId);
  const totalCost = quantity * unitCost;

  const handleProductSelect = (id: string) => {
    setProductId(id);
    const p = products.find(prod => prod.id === id);
    if (p) {
      setUnitCost(p.unitCost);
      if (paymentStatus === 'Partial') {
        setPartialCash(Math.round((quantity * p.unitCost) * 0.5));
      }
    }
  };

  const handlePaymentStatusChange = (status: 'Unpaid' | 'Partial' | 'Paid') => {
    setPaymentStatus(status);
    if (status === 'Partial') {
      if (partialCash <= 0 || partialCash > totalCost) {
        setPartialCash(Math.round(totalCost * 0.5));
      }
    }
  };

  const handleQuickSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) return;

    const created = addSupplier({
      name: newSupName,
      nameAr: newSupNameAr,
      contact: newSupContact,
      phone: newSupPhone,
      initialBalance: newSupBalance,
    });

    setSupplierId(created.id);
    setNewSupName('');
    setNewSupNameAr('');
    setNewSupContact('');
    setNewSupPhone('');
    setNewSupBalance(0);
    setIsQuickSupplierOpen(false);
  };

  const handleQuickProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const created = addProduct({
      sku: newProdSku,
      name: newProdName,
      nameAr: newProdNameAr,
      category: newProdCategory,
      unitCost: Number(newProdUnitCost),
      sellingPrice: Number(newProdSellingPrice),
      stockMain: 0,
      stockNoon: 0,
      minStockAlert: Number(newProdMinAlert),
    });

    setProductId(created.id);
    setUnitCost(created.unitCost);
    if (paymentStatus === 'Partial') {
      setPartialCash(Math.round((quantity * created.unitCost) * 0.5));
    }
    setNewProdSku('');
    setNewProdName('');
    setNewProdNameAr('');
    setNewProdCategory('Electronics');
    setNewProdUnitCost(100);
    setNewProdSellingPrice(180);
    setNewProdMinAlert(10);
    setIsQuickProductOpen(false);
  };

  const handleQuickWarehouseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhName.trim()) return;

    const createdWh = addWarehouse({
      name: newWhName,
      nameAr: newWhNameAr,
      code: newWhCode,
      type: newWhType,
      location: newWhLocation,
      locationAr: newWhLocationAr,
      isMain: newWhIsMain,
    });

    setTargetWarehouse(createdWh.id);
    setNewWhName('');
    setNewWhNameAr('');
    setNewWhCode('');
    setNewWhType('Internal');
    setNewWhLocation('');
    setNewWhLocationAr('');
    setNewWhIsMain(false);
    setIsQuickWarehouseOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !selectedProduct) return;

    let cashAmount = 0;
    if (paymentStatus === 'Paid') {
      cashAmount = totalCost;
    } else if (paymentStatus === 'Partial') {
      cashAmount = Math.min(totalCost, Math.max(0, Number(partialCash) || 0));
    } else {
      cashAmount = 0;
    }

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
      paidAmount: cashAmount,
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
              <strong className="text-zinc-100 font-bold">{formatCurrency(totalCost)}</strong>
            </span>
          </div>

          {/* Quick Add Supplier Sub-Panel */}
          {isQuickSupplierOpen && (
            <div className="p-3 bg-zinc-950 border border-zinc-700/80 rounded-md space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-semibold text-zinc-200 inline-flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                  {t.addSupplierModalTitle || (lang === 'ar' ? 'إضافة مورد / تاجر جديد سريعاً' : 'Quick Add Supplier')}
                </span>
                <button
                  type="button"
                  onClick={() => setIsQuickSupplierOpen(false)}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-0.5">
                    {t.supplierNameEnLabel} *
                  </label>
                  <input
                    type="text"
                    value={newSupName}
                    onChange={e => setNewSupName(e.target.value)}
                    placeholder="e.g. Nile Tech Supplies"
                    className="w-full text-xs rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-0.5">
                    {t.supplierNameArLabel}
                  </label>
                  <input
                    type="text"
                    value={newSupNameAr}
                    onChange={e => setNewSupNameAr(e.target.value)}
                    placeholder="مثال: شركة النيل للتوريدات"
                    className="w-full text-xs rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-0.5">
                    {t.phoneLabel}
                  </label>
                  <input
                    type="text"
                    value={newSupPhone}
                    onChange={e => setNewSupPhone(e.target.value)}
                    placeholder="+20 10 1234 5678"
                    className="w-full text-xs rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-0.5">
                    {t.initialBalanceLabel} ({t.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newSupBalance}
                    onChange={e => setNewSupBalance(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full text-xs rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsQuickSupplierOpen(false)}
                  className="px-2.5 py-1 text-xs border border-zinc-700 rounded text-zinc-400 hover:text-zinc-200"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleQuickSupplierSubmit}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 rounded"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'حفظ واختيار المورد' : 'Save & Select Supplier'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Add Product Sub-Panel */}
          {isQuickProductOpen && (
            <div className="p-3 bg-zinc-950 border border-zinc-700/80 rounded-md space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-semibold text-zinc-200 inline-flex items-center gap-1.5">
                  <PackagePlus className="w-3.5 h-3.5 text-emerald-400" />
                  {t.addProductModalTitle || (lang === 'ar' ? 'إضافة منتج جديد سريعاً' : 'Quick Add Product')}
                </span>
                <button
                  type="button"
                  onClick={() => setIsQuickProductOpen(false)}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-0.5">{t.productSkuLabel} *</label>
                  <input
                    type="text"
                    placeholder="e.g. ELC-SPK-BT5"
                    value={newProdSku}
                    onChange={e => setNewProdSku(e.target.value)}
                    className="w-full text-xs font-mono uppercase rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-0.5">{t.productNameEnLabel} *</label>
                  <input
                    type="text"
                    placeholder="e.g. Bluetooth Speaker 20W"
                    value={newProdName}
                    onChange={e => setNewProdName(e.target.value)}
                    className="w-full text-xs rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-0.5">{t.productNameArLabel}</label>
                  <input
                    type="text"
                    placeholder="مثال: سماعة بلوتوث لاسلكية"
                    value={newProdNameAr}
                    onChange={e => setNewProdNameAr(e.target.value)}
                    className="w-full text-xs rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-0.5">{t.categoryLabel}</label>
                  <select
                    value={newProdCategory}
                    onChange={e => setNewProdCategory(e.target.value)}
                    className="w-full text-xs rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Perfumes">Perfumes</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-0.5">{t.unitCost} ({t.currency}) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProdUnitCost}
                    onChange={e => setNewProdUnitCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full text-xs font-mono rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-0.5">{t.sellingPrice} ({t.currency}) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProdSellingPrice}
                    onChange={e => setNewProdSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full text-xs font-mono rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsQuickProductOpen(false)}
                  className="px-2.5 py-1 text-xs border border-zinc-700 rounded text-zinc-400 hover:text-zinc-200"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleQuickProductSubmit}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 rounded"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'حفظ واختيار المنتج' : 'Save & Select Product'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Add Warehouse Sub-Panel */}
          {isQuickWarehouseOpen && (
            <div className="p-3 bg-zinc-950 border border-zinc-700/80 rounded-md space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-semibold text-zinc-200 inline-flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  {t.addWarehouseModalTitle || (lang === 'ar' ? 'تسجيل مستودع جديد سريعاً' : 'Quick Add Warehouse')}
                </span>
                <button
                  type="button"
                  onClick={() => setIsQuickWarehouseOpen(false)}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-0.5">{t.warehouseNameEnLabel} *</label>
                  <input
                    type="text"
                    placeholder="e.g. Alexandria Distribution Hub"
                    value={newWhName}
                    onChange={e => setNewWhName(e.target.value)}
                    className="w-full text-xs rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-0.5">{t.warehouseNameArLabel}</label>
                  <input
                    type="text"
                    placeholder="مثال: مستودع الإسكندرية اللوجستي"
                    value={newWhNameAr}
                    onChange={e => setNewWhNameAr(e.target.value)}
                    className="w-full text-xs rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-0.5">{t.warehouseCodeLabel}</label>
                  <input
                    type="text"
                    placeholder="e.g. WH-ALX-01"
                    value={newWhCode}
                    onChange={e => setNewWhCode(e.target.value)}
                    className="w-full text-xs font-mono uppercase rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-0.5">{t.warehouseTypeLabel}</label>
                  <select
                    value={newWhType}
                    onChange={e => setNewWhType(e.target.value as 'Internal' | 'FBN 3PL')}
                    className="w-full text-xs rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                  >
                    <option value="Internal">{t.typeInternal}</option>
                    <option value="FBN 3PL">{t.type3PL}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-0.5">{t.locationEnLabel}</label>
                  <input
                    type="text"
                    placeholder="e.g. Alexandria Port Free Zone"
                    value={newWhLocation}
                    onChange={e => setNewWhLocation(e.target.value)}
                    className="w-full text-xs rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-0.5">{t.locationArLabel}</label>
                  <input
                    type="text"
                    placeholder="مثال: المنطقة الحرة بالعامرية، الإسكندرية"
                    value={newWhLocationAr}
                    onChange={e => setNewWhLocationAr(e.target.value)}
                    className="w-full text-xs rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
              </div>

              {/* Set as Main Checkbox */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="newWhIsMainInbound"
                  checked={newWhIsMain}
                  onChange={e => setNewWhIsMain(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="newWhIsMainInbound" className="text-xs text-zinc-300 flex items-center gap-1 cursor-pointer select-none">
                  <Star className="w-3 h-3 text-amber-400" />
                  <span>{t.setAsMainCheckbox || (lang === 'ar' ? 'تعيين كمستودع رئيسي افتراضي' : 'Set as Default Main Warehouse')}</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsQuickWarehouseOpen(false)}
                  className="px-2.5 py-1 text-xs border border-zinc-700 rounded text-zinc-400 hover:text-zinc-200"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleQuickWarehouseSubmit}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-sky-500 text-zinc-950 hover:bg-sky-400 rounded"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'حفظ واختيار المستودع' : 'Save & Select Warehouse'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Supplier Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-300">{t.supplierNameLabel}</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickSupplierOpen(!isQuickSupplierOpen);
                    if (isQuickProductOpen) setIsQuickProductOpen(false);
                    if (isQuickWarehouseOpen) setIsQuickWarehouseOpen(false);
                  }}
                  className="text-[11px] text-zinc-400 hover:text-zinc-100 inline-flex items-center gap-0.5 font-medium underline"
                >
                  <Plus className="w-3 h-3" />
                  {t.newSupplierQuickBtn || (lang === 'ar' ? '+ مورد جديد' : '+ New Supplier')}
                </button>
              </div>
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id} className="bg-zinc-900 text-zinc-100">
                    {lang === 'ar' ? s.nameAr : s.name} ({formatCurrency(s.currentBalance)})
                  </option>
                ))}
              </select>
            </div>

            {/* Product Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-300">{t.productNameLabel}</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickProductOpen(!isQuickProductOpen);
                    if (isQuickSupplierOpen) setIsQuickSupplierOpen(false);
                    if (isQuickWarehouseOpen) setIsQuickWarehouseOpen(false);
                  }}
                  className="text-[11px] text-zinc-400 hover:text-zinc-100 inline-flex items-center gap-0.5 font-medium underline"
                >
                  <Plus className="w-3 h-3" />
                  {t.newProductQuickBtn || (lang === 'ar' ? '+ منتج جديد' : '+ New Product')}
                </button>
              </div>
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-300">{t.targetWarehouseLabel}</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickWarehouseOpen(!isQuickWarehouseOpen);
                    if (isQuickSupplierOpen) setIsQuickSupplierOpen(false);
                    if (isQuickProductOpen) setIsQuickProductOpen(false);
                  }}
                  className="text-[11px] text-zinc-400 hover:text-zinc-100 inline-flex items-center gap-0.5 font-medium underline"
                >
                  <Plus className="w-3 h-3" />
                  {t.newWarehouseQuickBtn || (lang === 'ar' ? '+ مستودع جديد' : '+ New Warehouse')}
                </button>
              </div>
              <select
                value={targetWarehouse}
                onChange={e => setTargetWarehouse(e.target.value as WarehouseId)}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
              >
                {warehouses.map(wh => {
                  const isMain = wh.id === mainWarehouseId || wh.isMain;
                  return (
                    <option key={wh.id} value={wh.id} className="bg-zinc-900 text-zinc-100">
                      {isMain ? '★ ' : ''}{lang === 'ar' ? wh.nameAr : wh.name} ({wh.code}){isMain ? (lang === 'ar' ? ' - الرئيسي' : ' - Primary Main') : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.quantity}</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => {
                  const qty = Math.max(1, parseInt(e.target.value) || 1);
                  setQuantity(qty);
                  if (paymentStatus === 'Partial') {
                    setPartialCash(Math.min(qty * unitCost, partialCash));
                  }
                }}
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
                onChange={e => {
                  const cost = Math.max(0.01, parseFloat(e.target.value) || 0);
                  setUnitCost(cost);
                  if (paymentStatus === 'Partial') {
                    setPartialCash(Math.min(quantity * cost, partialCash));
                  }
                }}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                required
              />
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">{t.paymentStatusLabel}</label>
              <select
                value={paymentStatus}
                onChange={e => handlePaymentStatusChange(e.target.value as 'Unpaid' | 'Partial' | 'Paid')}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
              >
                <option value="Unpaid" className="bg-zinc-900 text-zinc-100">{t.unpaid}</option>
                <option value="Partial" className="bg-zinc-900 text-zinc-100">{t.partial}</option>
                <option value="Paid" className="bg-zinc-900 text-zinc-100">{t.paid}</option>
              </select>
            </div>
          </div>

          {/* Partial Cash Input & Financial Breakdown */}
          {paymentStatus === 'Partial' && (
            <div className="p-3 bg-zinc-950/80 border border-amber-900/40 rounded-lg space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-semibold text-amber-300">
                    {t.partialCashAmountLabel} ({t.currency}) *
                  </label>
                  <p className="text-[11px] text-zinc-400">
                    {lang === 'ar'
                      ? 'حدد المبلغ النقدي المسدد فعلياً للمورد الآن والباقي يضاف آلياً لحسابه'
                      : 'Specify the cash amount paid upfront now; remaining is added to merchant debt'}
                  </p>
                </div>

                {/* Quick percentage buttons */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-zinc-500">{lang === 'ar' ? 'نسب سريعة:' : 'Quick:'}</span>
                  <button
                    type="button"
                    onClick={() => setPartialCash(Math.round(totalCost * 0.25))}
                    className="px-2 py-0.5 text-[11px] font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartialCash(Math.round(totalCost * 0.5))}
                    className="px-2 py-0.5 text-[11px] font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartialCash(Math.round(totalCost * 0.75))}
                    className="px-2 py-0.5 text-[11px] font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                  >
                    75%
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <input
                    type="number"
                    min="0"
                    max={totalCost}
                    step="1"
                    value={partialCash}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      setPartialCash(Math.max(0, Math.min(totalCost, val)));
                    }}
                    className="w-full text-xs font-mono font-medium rounded-md border border-amber-600/50 bg-zinc-900 px-2.5 py-1.5 text-amber-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    placeholder="e.g. 5000"
                    required
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800 text-xs">
                  <span className="text-zinc-400">{lang === 'ar' ? 'المدفوع نقداً:' : 'Cash Paid:'}</span>
                  <span className="font-mono font-bold text-emerald-400">{formatCurrency(partialCash)}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800 text-xs">
                  <span className="text-zinc-400">{t.remainingBalanceDueLabel || (lang === 'ar' ? 'المتبقي كدين:' : 'Remaining Due:')}</span>
                  <span className="font-mono font-bold text-rose-400">{formatCurrency(Math.max(0, totalCost - partialCash))}</span>
                </div>
              </div>
            </div>
          )}

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
            {warehouses.map(wh => (
              <option key={wh.id} value={wh.id} className="bg-zinc-900">
                {lang === 'ar' ? wh.nameAr : wh.name}
              </option>
            ))}
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
                filteredShipments.map(item => {
                  const paid = item.paidAmount !== undefined
                    ? item.paidAmount
                    : item.paymentStatus === 'Paid'
                    ? item.totalCost
                    : item.paymentStatus === 'Partial'
                    ? item.totalCost * 0.5
                    : 0;
                  const remaining = Math.max(0, item.totalCost - paid);

                  return (
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
                        {(() => {
                          const whObj = warehouses.find(w => w.id === item.targetWarehouse);
                          const is3pl = whObj ? whObj.type === 'FBN 3PL' : item.targetWarehouse === 'noon';
                          const whTitle = whObj ? (lang === 'ar' ? whObj.nameAr : whObj.name) : item.targetWarehouse;
                          return (
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium ${
                              is3pl
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                                : 'bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                            }`}>
                              {whTitle}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-2.5">
                        {item.paymentStatus === 'Paid' ? (
                          <div className="flex flex-col items-start">
                            <span className="inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                              {t.paid}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                              {lang === 'ar' ? 'كاش: ' : 'Paid: '}{formatCurrency(paid)}
                            </span>
                          </div>
                        ) : item.paymentStatus === 'Partial' ? (
                          <div className="flex flex-col items-start">
                            <span className="inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60">
                              {t.partial}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                              <span className="text-zinc-200">{formatCurrency(paid)}</span>
                              <span className="text-zinc-500"> / </span>
                              <span className="text-rose-300">{formatCurrency(remaining)}</span>
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-start">
                            <span className="inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium bg-rose-950/60 text-rose-300 border border-rose-800/60">
                              {t.unpaid}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                              {lang === 'ar' ? 'آجل: ' : 'Due: '}{formatCurrency(remaining)}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
