'use client';

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { ToastContainer } from './components/ToastContainer';
import { DashboardOverview } from './components/DashboardOverview';
import { InboundPurchases } from './components/InboundPurchases';
import { WarehouseTransfers } from './components/WarehouseTransfers';
import { SalesReturns } from './components/SalesReturns';
import { FinancialsLedgers } from './components/FinancialsLedgers';

const AppContent: React.FC = () => {
  const { currentTab } = useApp();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-zinc-800 selection:text-white">
      {/* 1. Dark Navigation Bar */}
      <Navigation />

      {/* 2. Active Tab Module */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && <DashboardOverview />}
        {currentTab === 'inbound' && <InboundPurchases />}
        {currentTab === 'warehouses' && <WarehouseTransfers />}
        {currentTab === 'sales' && <SalesReturns />}
        {currentTab === 'financials' && <FinancialsLedgers />}
      </main>

      {/* 3. Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
