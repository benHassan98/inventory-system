import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WarehouseId } from '../types';
import {
  PackagePlus,
  Search,
  Filter,
  DollarSign,
  Boxes,
  Building2,
  Store,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

interface InboundPurchasesProps {
  onOpenInboundModal: () => void;
}

export const InboundPurchases: React.FC<InboundPurchasesProps> = ({ onOpenInboundModal }) => {
  const {
    inboundShipments,
    products,
    suppliers,
    addInboundShipment,
    formatCurrency,
    t,
    lang,
  } = useApp();

  // Inline Quick Entry Form State
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [productId, setProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(50);
  const [unitCost, setUnitCost] = useState<number>(products[0]?.unitCost || 100);
  const [targetWarehouse, setTargetWarehouse] = useState<WarehouseId>('main');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState<'Unpaid' | 'Partial' | 'Paid'>('Unpaid');
  const [notes, setNotes] = useState<string>('');

  // Table Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('all');
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState<string>('all');

  const selectedSupplier = suppliers.find(s => s.id === supplierId);
  const selectedProduct = products.find(p => p.id === productId);

  const handleProductSelect = (id: string) => {
    setProductId(id);
    const p = products.find(prod => prod.id === id);
    if (p) setUnitCost(p.unitCost);
  };

  const handleInlineSubmit = (e: React.FormEvent) => {
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
      notes: notes || undefined,
    });

    // Reset notes
    setNotes('');
  };

  // Filtered shipments
  const filteredShipments = inboundShipments.filter(item => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reference.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesWarehouse =
      selectedWarehouseFilter === 'all' || item.targetWarehouse === selectedWarehouseFilter;

    const matchesSupplier =
      selectedSupplierFilter === 'all' || item.supplierId === selectedSupplierFilter;

    return matchesSearch && matchesWarehouse && matchesSupplier;
  });

  const totalInboundValue = inboundShipments.reduce((acc, item) => acc + item.totalCost, 0);
  const totalInboundUnits = inboundShipments.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">{lang === 'ar' ? 'إجمالي قيمة التوريدات' : 'Total Inbound Value'}</span>
            <div className="text-xl font-black text-slate-100 font-mono mt-1">{formatCurrency(totalInboundValue)}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">{lang === 'ar' ? 'إجمالي القطع المستلمة' : 'Total Units Received'}</span>
            <div className="text-xl font-black text-slate-100 font-mono mt-1">{totalInboundUnits} <span className="text-xs font-normal text-slate-400">{t.units}</span></div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Boxes className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">{lang === 'ar' ? 'عدد الشحنات المسجلة' : 'Shipment Batches'}</span>
            <div className="text-xl font-black text-slate-100 font-mono mt-1">{inboundShipments.length}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. Inbound Entry Form - Explicit Requirement */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-emerald-400" />
              {t.inboundTitle}
            </h3>
            <p className="text-xs text-slate-400">{t.inboundSubtitle}</p>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-lg">
            {lang === 'ar' ? 'تحديث فوري للمخزون والذمم الدائنة' : 'Live Inventory & AP Sync'}
          </span>
        </div>

        <form onSubmit={handleInlineSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Supplier Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.supplierNameLabel}
              </label>
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {lang === 'ar' ? s.nameAr : s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.productNameLabel}
              </label>
              <select
                value={productId}
                onChange={e => handleProductSelect(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {lang === 'ar' ? p.nameAr : p.name} [{p.sku}]
                  </option>
                ))}
              </select>
            </div>

            {/* Target Warehouse */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.targetWarehouseLabel}
              </label>
              <select
                value={targetWarehouse}
                onChange={e => setTargetWarehouse(e.target.value as WarehouseId)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="main">{t.mainWarehouse}</option>
                <option value="noon">{t.noonWarehouse}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.quantity}
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Unit Cost */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.unitCost}
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={unitCost}
                onChange={e => setUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.purchaseDateLabel}
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.paymentStatusLabel}
              </label>
              <select
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as 'Unpaid' | 'Partial' | 'Paid')}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Unpaid">{t.unpaid}</option>
                <option value="Partial">{t.partial}</option>
                <option value="Paid">{t.paid}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="font-semibold text-slate-300">{t.totalCost}:</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {formatCurrency(quantity * unitCost)}
              </span>
              <span className="text-[11px] text-slate-400">
                ({quantity} × {formatCurrency(unitCost)})
              </span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <PackagePlus className="w-4 h-4" />
              <span>{t.newInboundBtn}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Summary Table: Recent Incoming Shipments */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100">{t.inboundHistory}</h3>
            <p className="text-xs text-slate-400">{lang === 'ar' ? 'سجل كافة التوريدات السابقة والمستودعات المستلمة' : 'Audit trail of past supplier consignments'}</p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="w-full ps-8 pe-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <select
              value={selectedWarehouseFilter}
              onChange={e => setSelectedWarehouseFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
            >
              <option value="all">{t.allWarehouses}</option>
              <option value="main">{t.mainWarehouse}</option>
              <option value="noon">{t.noonWarehouse}</option>
            </select>

            <select
              value={selectedSupplierFilter}
              onChange={e => setSelectedSupplierFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
            >
              <option value="all">{t.allSuppliers}</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {lang === 'ar' ? s.nameAr : s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3 text-start">{t.reference}</th>
                <th className="pb-3 text-start">{t.product}</th>
                <th className="pb-3 text-start">{t.supplier}</th>
                <th className="pb-3 text-start">{t.warehouse}</th>
                <th className="pb-3 text-center">{t.quantity}</th>
                <th className="pb-3 text-end">{t.unitCost}</th>
                <th className="pb-3 text-end">{t.totalCost}</th>
                <th className="pb-3 text-center">{t.date}</th>
                <th className="pb-3 text-center">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredShipments.map(ship => (
                <tr key={ship.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-slate-300">
                    {ship.reference}
                  </td>
                  <td className="py-3">
                    <div className="font-bold text-slate-100">{ship.productName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{ship.sku}</div>
                  </td>
                  <td className="py-3 text-slate-300 font-medium">{ship.supplierName}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                      ship.targetWarehouse === 'noon'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                    }`}>
                      {ship.targetWarehouse === 'noon' ? <Store className="w-3 h-3 text-amber-400" /> : <Building2 className="w-3 h-3 text-blue-400" />}
                      {ship.targetWarehouse === 'noon' ? 'Noon FBN' : (lang === 'ar' ? 'الرئيسي' : 'Main')}
                    </span>
                  </td>
                  <td className="py-3 text-center font-mono font-bold text-slate-100">
                    {ship.quantity}
                  </td>
                  <td className="py-3 text-end font-mono text-slate-300">
                    {formatCurrency(ship.unitCost)}
                  </td>
                  <td className="py-3 text-end font-mono font-bold text-slate-100">
                    {formatCurrency(ship.totalCost)}
                  </td>
                  <td className="py-3 text-center text-slate-400 font-mono">
                    {ship.purchaseDate}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      ship.paymentStatus === 'Paid'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : ship.paymentStatus === 'Partial'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    }`}>
                      {ship.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredShipments.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              {lang === 'ar' ? 'لا توجد شحنات مطابقة لشروط البحث' : 'No shipments found matching filters'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
