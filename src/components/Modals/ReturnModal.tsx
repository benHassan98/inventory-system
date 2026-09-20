import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WarehouseId } from '../../types';
import { X, RotateCcw, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSaleOrder?: string;
  defaultProductId?: string;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  defaultSaleOrder,
  defaultProductId,
}) => {
  const { products, addReturn, t, lang } = useApp();

  const [orderNumber, setOrderNumber] = useState<string>(defaultSaleOrder || `NON-ORD-${Math.floor(1000 + Math.random() * 9000)}`);
  const [productId, setProductId] = useState<string>(defaultProductId || products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [refundAmount, setRefundAmount] = useState<number>(products[0]?.sellingPrice || 100);
  const [targetWarehouse, setTargetWarehouse] = useState<WarehouseId>('noon');
  const [condition, setCondition] = useState<'Sellable' | 'Damaged'>('Sellable');
  const [restocked, setRestocked] = useState<boolean>(true);
  const [reason, setReason] = useState<string>(
    lang === 'ar' ? 'العميل تراجع عن الطلب / تسليم غير مكتمل' : 'Customer buyer remorse / refused delivery'
  );
  const [returnDate, setReturnDate] = useState<string>(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const selectedProduct = products.find(p => p.id === productId);

  const handleProductChange = (id: string) => {
    setProductId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setRefundAmount(prod.sellingPrice * quantity);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    addReturn({
      orderNumber,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: Number(quantity),
      refundAmount: Number(refundAmount),
      targetWarehouse,
      condition,
      restocked: condition === 'Sellable' && restocked,
      reason,
      returnDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">{t.returnsTitle}</h3>
              <p className="text-xs text-slate-400">{lang === 'ar' ? 'تسجيل المرتجعات وإعادة إضافة المخزون' : 'Log returned items and restock inventory'}</p>
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
          {/* Order Ref & Product */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {lang === 'ar' ? 'رقم طلب البيع' : 'Order Reference'}
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.date}
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={e => setReturnDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {t.product}
            </label>
            <select
              value={productId}
              onChange={e => handleProductChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
              required
            >
              {products.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-800 text-slate-100">
                  {lang === 'ar' ? p.nameAr : p.name} [{p.sku}]
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Refund Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.quantity}
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => {
                  const q = parseInt(e.target.value) || 1;
                  setQuantity(q);
                  if (selectedProduct) {
                    setRefundAmount(selectedProduct.sellingPrice * q);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.refundAmountLabel}
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={refundAmount}
                onChange={e => setRefundAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          {/* Condition: Sellable vs Damaged */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {t.returnConditionLabel}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setCondition('Sellable');
                  setRestocked(true);
                }}
                className={`p-3 rounded-xl border text-start transition-all flex items-center gap-2 ${
                  condition === 'Sellable'
                    ? 'border-emerald-500/80 bg-emerald-500/15 ring-2 ring-emerald-500/30 text-emerald-300'
                    : 'border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold">{t.sellable}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCondition('Damaged');
                  setRestocked(false);
                }}
                className={`p-3 rounded-xl border text-start transition-all flex items-center gap-2 ${
                  condition === 'Damaged'
                    ? 'border-rose-500/80 bg-rose-500/15 ring-2 ring-rose-500/30 text-rose-300'
                    : 'border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-xs font-bold">{t.damaged}</span>
              </button>
            </div>
          </div>

          {/* Restock target warehouse */}
          {condition === 'Sellable' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.restockWarehouseLabel}
              </label>
              <select
                value={targetWarehouse}
                onChange={e => setTargetWarehouse(e.target.value as WarehouseId)}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="noon" className="bg-slate-800 text-slate-100">{t.noonWarehouse}</option>
                <option value="main" className="bg-slate-800 text-slate-100">{t.mainWarehouse}</option>
              </select>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.returnReasonLabel}
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
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
              className="px-5 py-2.5 text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.submit}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
