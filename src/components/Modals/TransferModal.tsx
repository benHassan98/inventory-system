import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WarehouseId } from '../../types';
import { X, ArrowRightLeft, AlertCircle } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProductId?: string;
  defaultSource?: WarehouseId;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  defaultProductId,
  defaultSource = 'main',
}) => {
  const { products, addStockTransfer, t, lang } = useApp();

  const [productId, setProductId] = useState<string>(defaultProductId || (products[0]?.id ?? ''));
  const [sourceWarehouse, setSourceWarehouse] = useState<WarehouseId>(defaultSource);
  const [targetWarehouse, setTargetWarehouse] = useState<WarehouseId>(defaultSource === 'main' ? 'noon' : 'main');
  const [quantity, setQuantity] = useState<number>(10);
  const [fbnAsnNumber, setFbnAsnNumber] = useState<string>(`ASN-NOON-${Math.floor(10000 + Math.random() * 90000)}`);
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const selectedProduct = products.find(p => p.id === productId);
  const sourceStock = selectedProduct
    ? sourceWarehouse === 'main'
      ? selectedProduct.stockMain
      : selectedProduct.stockNoon
    : 0;

  const handleSourceChange = (newSource: WarehouseId) => {
    setSourceWarehouse(newSource);
    setTargetWarehouse(newSource === 'main' ? 'noon' : 'main');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (quantity <= 0) {
      setErrorMsg(lang === 'ar' ? 'يرجى إدخال كمية صحيحة أكبر من صفر' : 'Quantity must be greater than 0');
      return;
    }

    if (quantity > sourceStock) {
      setErrorMsg(
        lang === 'ar'
          ? `الكمية المتوفرة في المخزن المصدر (${sourceStock} قطعة) أقل من الكمية المطلوبة!`
          : `Available stock in source warehouse (${sourceStock}) is less than requested quantity!`
      );
      return;
    }

    const res = addStockTransfer({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      sourceWarehouse,
      targetWarehouse,
      quantity: Number(quantity),
      status: targetWarehouse === 'noon' ? 'In Transit' : 'Completed',
      fbnAsnNumber: targetWarehouse === 'noon' ? fbnAsnNumber : undefined,
      transferDate,
      notes: notes || undefined,
    });

    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">{t.transferStockBtn}</h3>
              <p className="text-xs text-slate-400">{t.warehousesSubtitle}</p>
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
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Product selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {t.product}
            </label>
            <select
              value={productId}
              onChange={e => {
                setProductId(e.target.value);
                setErrorMsg('');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors"
            >
              {products.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-800 text-slate-100">
                  {lang === 'ar' ? p.nameAr : p.name} ({p.sku}) — {lang === 'ar' ? 'الرئيسي' : 'Main'}: {p.stockMain} | Noon: {p.stockNoon}
                </option>
              ))}
            </select>
          </div>

          {/* Warehouses route */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-850/80 rounded-xl border border-slate-750 bg-slate-800/60 border-slate-700">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.sourceWarehouseLabel}
              </label>
              <select
                value={sourceWarehouse}
                onChange={e => handleSourceChange(e.target.value as WarehouseId)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="main" className="bg-slate-800 text-slate-100">{t.mainWarehouse}</option>
                <option value="noon" className="bg-slate-800 text-slate-100">{t.noonWarehouse}</option>
              </select>
              <p className="mt-1 text-xs text-slate-400">
                {lang === 'ar' ? 'المتوفر حالياً: ' : 'Available: '}
                <span className="font-bold text-amber-400">{sourceStock}</span> {t.units}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.destinationWarehouseLabel}
              </label>
              <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 font-semibold flex items-center h-[38px]">
                {targetWarehouse === 'noon' ? t.noonWarehouse : t.mainWarehouse}
              </div>
              <p className="mt-1 text-xs text-slate-400 truncate">
                {targetWarehouse === 'noon' ? 'Noon FBN (6th of Oct)' : 'Cairo Central'}
              </p>
            </div>
          </div>

          {/* Quantity & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.transferQuantityLabel}
              </label>
              <input
                type="number"
                min="1"
                max={sourceStock || 1}
                value={quantity}
                onChange={e => {
                  setQuantity(parseInt(e.target.value) || 0);
                  setErrorMsg('');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.transferDateLabel}
              </label>
              <input
                type="date"
                value={transferDate}
                onChange={e => setTransferDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Noon ASN field if moving to Noon */}
          {targetWarehouse === 'noon' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.fbnAsnLabel}
              </label>
              <input
                type="text"
                value={fbnAsnNumber}
                onChange={e => setFbnAsnNumber(e.target.value)}
                placeholder="e.g. ASN-NOON-88941"
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="mt-1 text-xs text-amber-400">
                {lang === 'ar'
                  ? 'رقم إشعار الشحن المسبق (ASN) لتتبع استلام شحنة FBN في مستودع نون'
                  : 'Advanced Shipping Notice number generated in Noon Seller Lab'}
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.notes}
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={lang === 'ar' ? 'ملاحظات إضافية، اسم المندوب أو رقم البوليصة...' : 'Carrier info, courier tracking...'}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              className="px-5 py-2.5 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>{t.submit}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
