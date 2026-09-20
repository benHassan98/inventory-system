import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WarehouseId } from '../../types';
import { X, PackagePlus, DollarSign } from 'lucide-react';

interface InboundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InboundModal: React.FC<InboundModalProps> = ({ isOpen, onClose }) => {
  const { products, suppliers, addInboundShipment, formatCurrency, t, lang } = useApp();

  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [productId, setProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(50);
  const [unitCost, setUnitCost] = useState<number>(products[0]?.unitCost || 100);
  const [targetWarehouse, setTargetWarehouse] = useState<WarehouseId>('main');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState<'Unpaid' | 'Partial' | 'Paid'>('Unpaid');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const selectedSupplier = suppliers.find(s => s.id === supplierId);
  const selectedProduct = products.find(p => p.id === productId);

  const handleProductChange = (prodId: string) => {
    setProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setUnitCost(prod.unitCost);
    }
  };

  const totalCost = quantity * unitCost;

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
      notes: notes || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">{t.inboundTitle}</h3>
              <p className="text-xs text-slate-400">{t.inboundSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Supplier */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {t.supplierNameLabel}
            </label>
            <select
              value={supplierId}
              onChange={e => setSupplierId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              required
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id} className="bg-slate-800 text-slate-100">
                  {lang === 'ar' ? s.nameAr : s.name} ({lang === 'ar' ? 'الرصيد المستحق: ' : 'Payable: '}
                  {formatCurrency(s.currentBalance)})
                </option>
              ))}
            </select>
          </div>

          {/* Product */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {t.productNameLabel}
            </label>
            <select
              value={productId}
              onChange={e => handleProductChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              required
            >
              {products.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-800 text-slate-100">
                  {lang === 'ar' ? p.nameAr : p.name} [{p.sku}]
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Unit Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.quantity}
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                required
              />
            </div>

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
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Target Warehouse & Purchase Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.targetWarehouseLabel}
              </label>
              <select
                value={targetWarehouse}
                onChange={e => setTargetWarehouse(e.target.value as WarehouseId)}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="main" className="bg-slate-800 text-slate-100">{t.mainWarehouse}</option>
                <option value="noon" className="bg-slate-800 text-slate-100">{t.noonWarehouse}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.purchaseDateLabel}
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Payment Status & Ledger Impact */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.paymentStatusLabel}
            </label>
            <select
              value={paymentStatus}
              onChange={e => setPaymentStatus(e.target.value as 'Unpaid' | 'Partial' | 'Paid')}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-medium text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Unpaid" className="bg-slate-800 text-slate-100">{t.unpaid}</option>
              <option value="Partial" className="bg-slate-800 text-slate-100">{t.partial}</option>
              <option value="Paid" className="bg-slate-800 text-slate-100">{t.paid}</option>
            </select>
          </div>

          {/* Total Cost Badge */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>{t.totalCost}:</span>
            </div>
            <span className="text-base font-bold text-emerald-200 font-mono">
              {formatCurrency(totalCost)}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.notes}
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={lang === 'ar' ? 'رقم بوليصة الشحن، دفعة التوريد...' : 'Batch number, shipment ref...'}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <PackagePlus className="w-4 h-4" />
              <span>{t.submit}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
