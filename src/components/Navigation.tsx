'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { NavigationTab } from '../types';
import {
  LayoutDashboard,
  PackagePlus,
  ArrowRightLeft,
  ShoppingBag,
  CircleDollarSign,
  Globe,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    lang,
    setLang,
    currency,
    lowStockProducts,
    resetToDefaultData,
    t,
  } = useApp();

  const tabs: { id: NavigationTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'inbound', label: t.navInbound, icon: PackagePlus },
    { id: 'warehouses', label: t.navWarehouses, icon: ArrowRightLeft },
    { id: 'sales', label: t.navSales, icon: ShoppingBag },
    { id: 'financials', label: t.navFinancials, icon: CircleDollarSign },
  ];

  return (
    <header className="sticky top-0 z-30 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top brand & controls bar */}
        <div className="flex items-center justify-between h-14 border-b border-zinc-800/80 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              OS
            </div>
            <div>
              <span className="font-semibold text-zinc-100 text-sm tracking-tight">
                {lang === 'ar' ? 'أومني ستوك' : 'OmniStock'}
              </span>
              <span className="ms-2 px-1.5 py-0.5 text-[11px] font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/60 rounded">
                {currency}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lowStockProducts.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60 rounded-md">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{lowStockProducts.length} {t.lowStockWarning}</span>
              </span>
            )}

            {/* Language Switch */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              title="Toggle Language / تغيير اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Reset Demo Data */}
            <button
              onClick={() => {
                if (window.confirm(lang === 'ar' ? 'هل تريد استعادة البيانات الافتراضية؟' : 'Reset all records to default demo data?')) {
                  resetToDefaultData();
                }
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
              title={t.resetDemo}
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">{t.resetDemo}</span>
            </button>
          </div>
        </div>

        {/* Minimal Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar" aria-label="Tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
