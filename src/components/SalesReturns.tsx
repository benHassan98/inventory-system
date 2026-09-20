import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WarehouseId } from '../types';
import {
  ShoppingBag,
  RotateCcw,
  Store,
  Building2,
  TrendingUp,
  DollarSign,
  Search,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  ArrowDownRight,
  Plus,
} from 'lucide-react';

interface SalesReturnsProps {
  onOpenSaleModal: () => void;
  onOpenReturnModal: (saleOrder?: string, productId?: string) => void;
}

export const SalesReturns: React.FC<SalesReturnsProps> = ({
  onOpenSaleModal,
  onOpenReturnModal,
}) => {
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

  // Inline Sales Entry Form State
  const [productId, setProductId] = useState<string>(products[0]?.id || '');
  const [sourceWarehouse, setSourceWarehouse] = useState<WarehouseId>('noon');
  const [quantity, setQuantity] = useState<number>(1);
  const [sellingPrice, setSellingPrice] = useState<number>(products[0]?.sellingPrice || 100);
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Search in sales log
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  const selectedProduct = products.find(p => p.id === productId);
  const availableStock = selectedProduct
    ? sourceWarehouse === 'main'
      ? selectedProduct.stockMain
      : selectedProduct.stockNoon
    : 0;

  const handleProductChange = (id: string) => {
    setProductId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setSellingPrice(prod.sellingPrice);
    }
    setErrorMsg('');
  };

  const handleInlineSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (quantity <= 0) {
      setErrorMsg(lang === 'ar' ? 'يرجى إدخال كمية صحيحة' : 'Invalid quantity');
      return;
    }

    if (quantity > availableStock) {
      setErrorMsg(
        lang === 'ar'
          ? `الكمية المتوفرة في المخزن المحدد (${availableStock} قطعة) غير كافية لإتمام البيع!`
          : `Available stock (${availableStock}) is less than order quantity!`
      );
      return;
    }

    const res = addSale({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      quantity: Number(quantity),
      sellingPrice: Number(sellingPrice),
      unitCost: Number(selectedProduct.unitCost),
      sourceWarehouse,
      channel: sourceWarehouse === 'noon' ? 'Noon FBN' : 'Direct / Store',
      saleDate,
    });

    if (res.success) {
      setErrorMsg('');
    }
  };

  // Filtered sales
  const filteredSales = sales.filter(s => {
    const matchesSearch =
      s.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesChannel =
      channelFilter === 'all' ||
      (channelFilter === 'noon' && s.sourceWarehouse === 'noon') ||
      (channelFilter === 'main' && s.sourceWarehouse === 'main');

    return matchesSearch && matchesChannel;
  });

  const totalSalesCount = sales.length;
  const noonSalesRevenue = sales
    .filter(s => s.sourceWarehouse === 'noon')
    .reduce((acc, s) => acc + s.totalRevenue, 0);
  const directSalesRevenue = sales
    .filter(s => s.sourceWarehouse === 'main')
    .reduce((acc, s) => acc + s.totalRevenue, 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Channel Comparison Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">{lang === 'ar' ? 'إجمالي الطلبات المنفذة' : 'Total Orders Processed'}</span>
            <div className="text-xl font-black text-slate-100 font-mono mt-1">{totalSalesCount} <span className="text-xs font-normal text-slate-400">{lang === 'ar' ? 'طلب' : 'orders'}</span></div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-300 uppercase">مبيعات نون (Noon FBN)</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">خصم من FBN</span>
            </div>
            <div className="text-xl font-black text-amber-400 font-mono mt-1">{formatCurrency(noonSalesRevenue)}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase">{lang === 'ar' ? 'المبيعات المباشرة / المتجر' : 'Direct / Store Sales'}</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">خصم من الرئيسي</span>
            </div>
            <div className="text-xl font-black text-slate-100 font-mono mt-1">{formatCurrency(directSalesRevenue)}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. Interactive Sales Entry Form with Live Warehouse Deduction Flow */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
              {t.salesTitle}
            </h3>
            <p className="text-xs text-slate-400">{t.salesSubtitle}</p>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 rounded-lg">
            {lang === 'ar' ? 'خصم فوري للمخزون واحتساب أرباح تلقائي' : 'Instant Stock Deduction & Profit Engine'}
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleInlineSaleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Product selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.product}
              </label>
              <select
                value={productId}
                onChange={e => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {lang === 'ar' ? p.nameAr : p.name} [{p.sku}]
                  </option>
                ))}
              </select>
            </div>

            {/* Source Warehouse with Flow Logic Display */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.salesChannelLabel}
              </label>
              <select
                value={sourceWarehouse}
                onChange={e => {
                  setSourceWarehouse(e.target.value as WarehouseId);
                  setErrorMsg('');
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="noon">Noon FBN (خصم من مستودع نون + رصيد مستحقات نون)</option>
                <option value="main">Direct / Store (خصم من المستودع الرئيسي)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {lang === 'ar' ? 'المخزون المتاح في المستودع المختار: ' : 'Available in chosen facility: '}
                <b className={availableStock > 0 ? 'text-slate-100' : 'text-rose-400'}>{availableStock}</b> {t.units}
              </span>
            </div>

            {/* Quantity */}
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
                  setQuantity(Math.max(1, parseInt(e.target.value) || 0));
                  setErrorMsg('');
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Selling Price */}
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
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Profit Calculation Preview & Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t.newSaleBtn}</span>
              </button>
            </div>
          </div>

          {/* Logic demonstration banner */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${sourceWarehouse === 'noon' ? 'bg-amber-400' : 'bg-blue-400'}`}></span>
              <span>
                {sourceWarehouse === 'noon'
                  ? (lang === 'ar'
                      ? `سوف تُخصم ${quantity} قطعة من مخزون نون (FBN)، وتُضاف ${formatCurrency(quantity * sellingPrice * 0.89)} إلى رصيدك المعلق عند نون.`
                      : `Will deduct ${quantity} units from Noon FBN stock, and add ${formatCurrency(quantity * sellingPrice * 0.89)} net settlement to Noon receivables.`)
                  : (lang === 'ar'
                      ? `سوف تُخصم ${quantity} قطعة من المستودع الرئيسي كطلب متجر مباشر.`
                      : `Will deduct ${quantity} units from Main Warehouse as direct store sale.`)}
              </span>
            </div>

            <div className="font-semibold text-emerald-400 font-mono">
              {lang === 'ar' ? 'إجمالي الإيراد: ' : 'Total: '}
              {formatCurrency(quantity * sellingPrice)}
            </div>
          </div>
        </form>
      </div>

      {/* 3. Sales Transaction Log Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100">{t.salesHistory}</h3>
            <p className="text-xs text-slate-400">{lang === 'ar' ? 'سجل العمليات مع تتبع المستودع وربحية كل منتج' : 'Order transactions with source warehouse and profit margins'}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="w-full ps-8 pe-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
            >
              <option value="all">{lang === 'ar' ? 'كافة القنوات' : 'All Channels'}</option>
              <option value="noon">Noon FBN</option>
              <option value="main">Direct / Store</option>
            </select>

            <button
              onClick={() => onOpenReturnModal()}
              className="px-3.5 py-1.5 text-xs font-bold bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
              <span>{t.newReturnBtn}</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3 text-start">{t.reference}</th>
                <th className="pb-3 text-start">{t.product}</th>
                <th className="pb-3 text-start">{t.warehouse}</th>
                <th className="pb-3 text-center">{t.quantity}</th>
                <th className="pb-3 text-end">{t.sellingPrice}</th>
                <th className="pb-3 text-end">{t.totalRevenue}</th>
                <th className="pb-3 text-end">{t.grossProfit}</th>
                <th className="pb-3 text-center">{t.date}</th>
                <th className="pb-3 text-end">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-slate-300">
                    {sale.orderNumber}
                  </td>
                  <td className="py-3">
                    <div className="font-bold text-slate-100">{sale.productName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{sale.sku}</div>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                      sale.sourceWarehouse === 'noon'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                    }`}>
                      {sale.sourceWarehouse === 'noon' ? <Store className="w-3 h-3 text-amber-400" /> : <Building2 className="w-3 h-3 text-blue-400" />}
                      {sale.sourceWarehouse === 'noon' ? 'Noon FBN' : (lang === 'ar' ? 'المستودع الرئيسي' : 'Direct')}
                    </span>
                  </td>
                  <td className="py-3 text-center font-mono font-bold text-slate-100">
                    {sale.quantity}
                  </td>
                  <td className="py-3 text-end font-mono text-slate-300">
                    {formatCurrency(sale.sellingPrice)}
                  </td>
                  <td className="py-3 text-end font-mono font-bold text-slate-100">
                    {formatCurrency(sale.totalRevenue)}
                  </td>
                  <td className="py-3 text-end font-mono font-bold text-emerald-400">
                    +{formatCurrency(sale.grossProfit)}
                  </td>
                  <td className="py-3 text-center text-slate-400 font-mono">
                    {sale.saleDate}
                  </td>
                  <td className="py-3 text-end">
                    <button
                      onClick={() => onOpenReturnModal(sale.orderNumber, sale.productId)}
                      className="px-2 py-1 text-[11px] font-bold text-purple-300 hover:text-purple-200 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 rounded-lg transition-colors inline-flex items-center gap-1"
                      title={lang === 'ar' ? 'تسجيل مرتجع لهذا الطلب' : 'Process return for order'}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{lang === 'ar' ? 'مرتجع' : 'Return'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Returns & Restocking Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-400" />
              {t.returnsTitle}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar'
                ? 'سجل مرتجعات العملاء وإعادة البضاعة السليمة إلى رصيد المستودع المحدد'
                : 'Processed customer returns with automatic warehouse restocking'}
            </p>
          </div>

          <button
            onClick={() => onOpenReturnModal()}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.newReturnBtn}</span>
          </button>
        </div>

        {returns.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            {lang === 'ar' ? 'لا توجد مرتجعات مسجلة حالياً' : 'No returns recorded yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="pb-3 text-start">{lang === 'ar' ? 'رقم الطلب الأصلي' : 'Order Ref'}</th>
                  <th className="pb-3 text-start">{t.product}</th>
                  <th className="pb-3 text-center">{t.quantity}</th>
                  <th className="pb-3 text-end">{t.refundAmountLabel}</th>
                  <th className="pb-3 text-start">{t.returnConditionLabel}</th>
                  <th className="pb-3 text-start">{lang === 'ar' ? 'المستودع المستلم' : 'Restocked To'}</th>
                  <th className="pb-3 text-start">{t.returnReasonLabel}</th>
                  <th className="pb-3 text-center">{t.date}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {returns.map(ret => (
                  <tr key={ret.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-300">
                      {ret.orderNumber}
                    </td>
                    <td className="py-3 font-bold text-slate-100">
                      {ret.productName}
                    </td>
                    <td className="py-3 text-center font-mono font-bold text-slate-100">
                      {ret.quantity}
                    </td>
                    <td className="py-3 text-end font-mono font-bold text-rose-400">
                      -{formatCurrency(ret.refundAmount)}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                        ret.condition === 'Sellable'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}>
                        {ret.condition === 'Sellable' ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {ret.condition === 'Sellable' ? t.sellable : t.damaged}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-slate-300">
                      {ret.restocked ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          {ret.targetWarehouse === 'noon' ? 'Noon FBN' : (lang === 'ar' ? 'الرئيسي' : 'Main')}
                        </span>
                      ) : (
                        <span className="text-slate-500">{lang === 'ar' ? 'لم يُعد (شطب)' : 'Not restocked'}</span>
                      )}
                    </td>
                    <td className="py-3 text-slate-400 max-w-xs truncate">
                      {ret.reason}
                    </td>
                    <td className="py-3 text-center font-mono text-slate-400">
                      {ret.returnDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
