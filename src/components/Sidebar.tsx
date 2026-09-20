import React from 'react';
import { useApp } from '../context/AppContext';
import { NavigationTab } from '../types';
import {
  LayoutDashboard,
  PackagePlus,
  ArrowRightLeft,
  ShoppingBag,
  CircleDollarSign,
  Boxes,
  Building2,
  ChevronRight,
  ChevronLeft,
  Store,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    currentTab,
    setCurrentTab,
    mainWarehouseStockCount,
    noonWarehouseStockCount,
    t,
    lang,
  } = useApp();

  const navItems: {
    id: NavigationTab;
    label: string;
    labelAr: string;
    icon: React.ElementType;
    badge?: string | number;
  }[] = [
    {
      id: 'dashboard',
      label: t.navDashboard,
      labelAr: 'لوحة التحكم',
      icon: LayoutDashboard,
    },
    {
      id: 'inbound',
      label: t.navInbound,
      labelAr: t.navInboundAr,
      icon: PackagePlus,
    },
    {
      id: 'warehouses',
      label: t.navWarehouses,
      labelAr: t.navWarehousesAr,
      icon: ArrowRightLeft,
      badge: `${noonWarehouseStockCount}`,
    },
    {
      id: 'sales',
      label: t.navSales,
      labelAr: t.navSalesAr,
      icon: ShoppingBag,
    },
    {
      id: 'financials',
      label: t.navFinancials,
      labelAr: t.navFinancialsAr,
      icon: CircleDollarSign,
    },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    setCurrentTab(tab);
    setMobileOpen(false);
  };

  const ArrowIcon = lang === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 z-40 flex flex-col w-72 bg-slate-900 border-e border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          lang === 'ar'
            ? mobileOpen
              ? 'translate-x-0 right-0'
              : 'translate-x-full right-0'
            : mobileOpen
            ? 'translate-x-0 left-0'
            : '-translate-x-full left-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-sm">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-100 text-base tracking-tight">
                  {lang === 'ar' ? 'أومني ستوك' : 'OmniStock'}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md">
                  FBN
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {lang === 'ar' ? 'إدارة المخازن والمبيعات' : 'Multi-Warehouse Hub'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {lang === 'ar' ? 'القوائم الرئيسية' : 'Core Modules'}
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{lang === 'ar' ? item.labelAr : item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        isActive
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ArrowIcon
                    className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isActive ? 'opacity-100 text-amber-400' : 'text-slate-500'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Mini Warehouse Quick Status Card */}
        <div className="p-3.5 m-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {lang === 'ar' ? 'حالة المستودعات' : 'Warehouses Status'}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              Live
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span className="text-slate-300 font-medium">
                  {lang === 'ar' ? 'المستودع الرئيسي' : 'Main Warehouse'}
                </span>
              </div>
              <span className="font-bold text-slate-100 font-mono">
                {mainWarehouseStockCount} <span className="text-[10px] text-slate-400">{t.units}</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-slate-300 font-medium flex items-center gap-1">
                  <Store className="w-3 h-3 text-amber-400" />
                  Noon FBN
                </span>
              </div>
              <span className="font-bold text-slate-100 font-mono">
                {noonWarehouseStockCount} <span className="text-[10px] text-slate-400">{t.units}</span>
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
