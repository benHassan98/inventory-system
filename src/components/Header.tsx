import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu,
  Globe,
  Plus,
  PackagePlus,
  ArrowRightLeft,
  ShoppingBag,
  Landmark,
  HandCoins,
  RotateCcw,
  AlertTriangle,
  RotateCcw as ResetIcon,
  ChevronDown,
} from 'lucide-react';
import { CurrencyCode } from '../types';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenInbound: () => void;
  onOpenTransfer: () => void;
  onOpenSale: () => void;
  onOpenReturn: () => void;
  onOpenNoonPayout: () => void;
  onOpenSupplierPayment: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenInbound,
  onOpenTransfer,
  onOpenSale,
  onOpenReturn,
  onOpenNoonPayout,
  onOpenSupplierPayment,
}) => {
  const {
    currentTab,
    setCurrentTab,
    lang,
    setLang,
    currency,
    setCurrency,
    lowStockProducts,
    resetToDefaultData,
    t,
  } = useApp();

  const [actionsOpen, setActionsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: t.navDashboard, desc: lang === 'ar' ? 'نظرة شاملة على مؤشرات الأداء، المخزون، وحسابات نون والموردين' : 'Overview of inventory metrics, sales performance & ledgers' };
      case 'inbound':
        return { title: t.inboundTitle, desc: t.inboundSubtitle };
      case 'warehouses':
        return { title: t.warehousesTitle, desc: t.warehousesSubtitle };
      case 'sales':
        return { title: t.salesTitle, desc: t.salesSubtitle };
      case 'financials':
        return { title: t.financialsTitle, desc: t.financialsSubtitle };
      default:
        return { title: t.navDashboard, desc: '' };
    }
  };

  const { title, desc } = getTabTitle();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ms-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl lg:hidden transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg lg:text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            {title}
            {lowStockProducts.length > 0 && currentTab === 'warehouses' && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                {lowStockProducts.length} {t.lowStockWarning}
              </span>
            )}
          </h1>
          <p className="hidden md:block text-xs text-slate-400 line-clamp-1 max-w-xl">{desc}</p>
        </div>
      </div>

      {/* Right: Quick Actions, EGP Badge, Language, Reset */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setActionsOpen(!actionsOpen)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'عملية سريعة' : 'Quick Action'}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {actionsOpen && (
            <div className={`absolute top-full mt-2 w-64 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${lang === 'ar' ? 'left-0' : 'right-0'}`}>
              <button
                onClick={() => {
                  setActionsOpen(false);
                  onOpenInbound();
                }}
                className="w-full px-3.5 py-2.5 text-start flex items-center gap-2.5 text-xs font-semibold text-slate-200 hover:bg-emerald-500/15 hover:text-emerald-300 transition-colors"
              >
                <PackagePlus className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold">{t.newInboundBtn}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{lang === 'ar' ? 'تسجيل بضاعة مورد جديدة' : 'Incoming supplier delivery'}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActionsOpen(false);
                  onOpenTransfer();
                }}
                className="w-full px-3.5 py-2.5 text-start flex items-center gap-2.5 text-xs font-semibold text-slate-200 hover:bg-amber-500/15 hover:text-amber-300 transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-bold">{t.transferStockBtn}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{lang === 'ar' ? 'تحويل للمستودع أو FBN' : 'Main <-> Noon FBN'}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActionsOpen(false);
                  onOpenSale();
                }}
                className="w-full px-3.5 py-2.5 text-start flex items-center gap-2.5 text-xs font-semibold text-slate-200 hover:bg-blue-500/15 hover:text-blue-300 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-bold">{t.newSaleBtn}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{lang === 'ar' ? 'بيع نون أو بيع مباشر' : 'Noon FBN or Store direct'}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActionsOpen(false);
                  onOpenReturn();
                }}
                className="w-full px-3.5 py-2.5 text-start flex items-center gap-2.5 text-xs font-semibold text-slate-200 hover:bg-purple-500/15 hover:text-purple-300 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="font-bold">{t.newReturnBtn}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{lang === 'ar' ? 'تسجيل مرتجع وإعادة للمخزن' : 'Restock return'}</div>
                </div>
              </button>

              <div className="my-1 border-t border-slate-800" />

              <button
                onClick={() => {
                  setActionsOpen(false);
                  onOpenNoonPayout();
                }}
                className="w-full px-3.5 py-2.5 text-start flex items-center gap-2.5 text-xs font-semibold text-slate-200 hover:bg-amber-500/15 hover:text-amber-300 transition-colors"
              >
                <Landmark className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-bold">{t.recordNoonPayoutBtn}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{lang === 'ar' ? 'إيداع حوالة نون بنكياً' : 'Disburse pending FBN'}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActionsOpen(false);
                  onOpenSupplierPayment();
                }}
                className="w-full px-3.5 py-2.5 text-start flex items-center gap-2.5 text-xs font-semibold text-slate-200 hover:bg-teal-500/15 hover:text-teal-300 transition-colors"
              >
                <HandCoins className="w-4 h-4 text-teal-400" />
                <div>
                  <div className="font-bold">{t.recordSupplierPaymentBtn}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{lang === 'ar' ? 'سداد مستحقات تاجر/مورد' : 'Pay supplier invoice'}</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Currency Display (EGP Only) */}
        <div
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-slate-800/90 border border-slate-700/80 rounded-xl text-amber-400 font-mono tracking-tight"
          title={lang === 'ar' ? 'العملة المعتمدة: الجنيه المصري (EGP)' : 'Active Currency: Egyptian Pound (EGP)'}
        >
          <span className="text-[10px] text-slate-400 uppercase font-sans">EGP</span>
          <span className="text-slate-500">·</span>
          <span>{lang === 'ar' ? 'ج.م' : 'EGP'}</span>
        </div>

        {/* Language Switcher Button */}
        <button
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700/80 text-slate-200 rounded-xl border border-slate-700/80 transition-colors"
          title={lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (window.confirm(lang === 'ar' ? 'هل تريد استعادة البيانات التجريبية الأولية؟' : 'Reset all data to initial demo state?')) {
              resetToDefaultData();
            }
          }}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-xl border border-transparent hover:border-rose-500/20 transition-colors"
          title={t.resetDemo}
        >
          <ResetIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
