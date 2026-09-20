import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WarehouseId } from '../../types';
import { X, ShoppingBag, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProductId?: string;
  defaultWarehouse?: WarehouseId;
}

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  defaultProductId,
  defaultWarehouse = 'noon',
}) => {
  const { products, addSale, formatCurrency, t, lang } = useApp();

  const [productId, setProductId] = useState<string>(defaultProductId || products[0]?.id || '');
  const [sourceWarehouse, setSourceWarehouse] = useState<WarehouseId>(defaultWarehouse);
  const [quantity, setQuantity] = useState<number>(1);
  const [sellingPrice, setSellingPrice] = useState<number>(products[0]?.sellingPrice || 0);
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const selectedProduct = products.find(p => p.id === productId);

  const handleProductChange = (id: string) => {
    setProductId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setSellingPrice(prod.sellingPrice);
    }
    setErrorMsg('');
  };

  const availableStock = selectedProduct
    ? sourceWarehouse === 'main'
      ? selectedProduct.stockMain
      : selectedProduct.stockNoon
    : 0;

  const totalRevenue = quantity * sellingPrice;
  const unitCost = selectedProduct?.unitCost || 0;
  const totalCogs = quantity * unitCost;
  const isNoon = sourceWarehouse === 'noon';
  const noonFeeEst = isNoon ? totalRevenue * 0.11 : 0;
  const grossProfitEst = totalRevenue - totalCogs - noonFeeEst;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (quantity <= 0) {
      setErrorMsg(lang === 'ar' ? 'يرجى إدخال كمية صحيحة' : 'Please enter a valid quantity');
      return;
    }

    if (quantity > availableStock) {
      setErrorMsg(
        lang === 'ar'
          ? `الكمية المتوفرة في المخزن المحدد (${availableStock} قطعة) غير كافية لإتمام البيع!`
          : `Available stock in selected warehouse (${availableStock}) is insufficient!`
      );
      return;
    }

    const res = addSale({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      quantity: Number(quantity),
      sellingPrice: Number(sellingPrice),
      unitCost: Number(unitCost),
      sourceWarehouse,
      channel: isNoon ? 'Noon FBN' : 'Direct / Store',
      saleDate,
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
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">{t.newSaleBtn}</h3>
              <p className="text-xs text-slate-400">{t.salesSubtitle}</p>
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

          {/* Product */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {t.product}
            </label>
            <select
              value={productId}
              onChange={e => handleProductChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              required
            >
              {products.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-800 text-slate-100">
                  {lang === 'ar' ? p.nameAr : p.name} [{p.sku}]
                </option>
              ))}
            </select>
          </div>

          {/* Source Warehouse with Flow Logic Highlighter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {t.salesChannelLabel}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSourceWarehouse('noon');
                  setErrorMsg('');
                }}
                className={`p-3 rounded-xl border text-start transition-all ${
                  sourceWarehouse === 'noon'
                    ? 'border-amber-500/80 bg-amber-500/15 ring-2 ring-amber-500/30'
                    : 'border-slate-700 bg-slate-800/70 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">Noon FBN</span>
                  {sourceWarehouse === 'noon' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {lang === 'ar' ? 'مخزون نون المتاح: ' : 'Noon Stock: '}
                  <span className="font-bold text-slate-200">{selectedProduct?.stockNoon || 0}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSourceWarehouse('main');
                  setErrorMsg('');
                }}
                className={`p-3 rounded-xl border text-start transition-all ${
                  sourceWarehouse === 'main'
                    ? 'border-blue-500/80 bg-blue-500/15 ring-2 ring-blue-500/30'
                    : 'border-slate-700 bg-slate-800/70 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300">
                    {lang === 'ar' ? 'المستودع الرئيسي' : 'Main Warehouse'}
                  </span>
                  {sourceWarehouse === 'main' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {lang === 'ar' ? 'المخزون المتاح: ' : 'Main Stock: '}
                  <span className="font-bold text-slate-200">{selectedProduct?.stockMain || 0}</span>
                </div>
              </button>
            </div>

            {/* Warehouse deduction logic notice */}
            <div className="mt-2 text-xs p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
              <span>
                {sourceWarehouse === 'noon'
                  ? (lang === 'ar'
                      ? 'سيتم خصم الكمية من مستودع نون (FBN) وإضافة صافي البيع إلى رصيد مستحقات نون (فلوسك عند نون).'
                      : 'Sale will deduct stock directly from Noon FBN warehouse & credit Noon settlement receivables.')
                  : (lang === 'ar'
                      ? 'سيتم خصم الكمية من المستودع الرئيسي واحتسابها كمبيعات مباشرة/متجر.'
                      : 'Sale will deduct stock directly from Main Central Warehouse as direct sales.')}
              </span>
            </div>
          </div>

          {/* Quantity & Selling Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.quantity}
              </label>
              <input
                type="number"
                min="1"
                max={availableStock || 1}
                value={quantity}
                onChange={e => {
                  setQuantity(parseInt(e.target.value) || 0);
                  setErrorMsg('');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <span className="text-xs text-slate-400 mt-1 block">
                {lang === 'ar' ? 'الحد الأقصى المتاح: ' : 'Max available: '}
                <b className="text-slate-200">{availableStock}</b> {t.units}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.sellingPrice}
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={sellingPrice}
                onChange={e => setSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <span className="text-xs text-slate-400 mt-1 block">
                {lang === 'ar' ? 'تكلفة الحبة: ' : 'Unit Cost: '}
                {formatCurrency(unitCost)}
              </span>
            </div>
          </div>

          {/* Sale Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.date}
            </label>
            <input
              type="date"
              value={saleDate}
              onChange={e => setSaleDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Financial Preview Card */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>{t.totalRevenue}:</span>
              <span className="font-semibold text-slate-100">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>{t.totalCogs}:</span>
              <span className="text-rose-400">-{formatCurrency(totalCogs)}</span>
            </div>
            {isNoon && (
              <div className="flex justify-between text-amber-300">
                <span>{lang === 'ar' ? 'عمولة ورسوم نون FBN (~11%):' : 'Noon FBN Fee (~11%):'}</span>
                <span className="text-amber-400">-{formatCurrency(noonFeeEst)}</span>
              </div>
            )}
            <div className="pt-1.5 border-t border-slate-700 flex justify-between font-bold text-slate-100">
              <span className="flex items-center gap-1 text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'صافي الربح التقديري:' : 'Estimated Net Profit:'}
              </span>
              <span className="text-emerald-400 font-mono">{formatCurrency(grossProfitEst)}</span>
            </div>
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
              className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.submit}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
