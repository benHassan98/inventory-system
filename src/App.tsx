'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';
import { DashboardOverview } from './components/DashboardOverview';
import { InboundPurchases } from './components/InboundPurchases';
import { WarehouseTransfers } from './components/WarehouseTransfers';
import { SalesReturns } from './components/SalesReturns';
import { FinancialsLedgers } from './components/FinancialsLedgers';
import { InboundModal } from './components/Modals/InboundModal';
import { TransferModal } from './components/Modals/TransferModal';
import { SaleModal } from './components/Modals/SaleModal';
import { ReturnModal } from './components/Modals/ReturnModal';
import { NoonPayoutModal } from './components/Modals/NoonPayoutModal';
import { SupplierPaymentModal } from './components/Modals/SupplierPaymentModal';
import { WarehouseId } from './types';

const AppContent: React.FC = () => {
  const { currentTab } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Modal states
  const [inboundModalOpen, setInboundModalOpen] = useState<boolean>(false);

  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false);
  const [transferProductId, setTransferProductId] = useState<string | undefined>(undefined);
  const [transferSource, setTransferSource] = useState<WarehouseId | undefined>(undefined);

  const [saleModalOpen, setSaleModalOpen] = useState<boolean>(false);
  const [saleProductId, setSaleProductId] = useState<string | undefined>(undefined);
  const [saleWarehouse, setSaleWarehouse] = useState<WarehouseId | undefined>(undefined);

  const [returnModalOpen, setReturnModalOpen] = useState<boolean>(false);
  const [returnOrderNum, setReturnOrderNum] = useState<string | undefined>(undefined);
  const [returnProductId, setReturnProductId] = useState<string | undefined>(undefined);

  const [noonPayoutModalOpen, setNoonPayoutModalOpen] = useState<boolean>(false);

  const [supplierPaymentModalOpen, setSupplierPaymentModalOpen] = useState<boolean>(false);
  const [supplierPaymentSupplierId, setSupplierPaymentSupplierId] = useState<string | undefined>(undefined);

  // Helper openers
  const openTransfer = (prodId?: string, source?: WarehouseId) => {
    setTransferProductId(prodId);
    setTransferSource(source);
    setTransferModalOpen(true);
  };

  const openSale = (prodId?: string, warehouse?: WarehouseId) => {
    setSaleProductId(prodId);
    setSaleWarehouse(warehouse);
    setSaleModalOpen(true);
  };

  const openReturn = (orderNum?: string, prodId?: string) => {
    setReturnOrderNum(orderNum);
    setReturnProductId(prodId);
    setReturnModalOpen(true);
  };

  const openSupplierPayment = (supId?: string) => {
    setSupplierPaymentSupplierId(supId);
    setSupplierPaymentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Sidebar navigation */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area - uses lg:ps-72 for automatic RTL/LTR padding */}
      <div className="flex-1 flex flex-col min-w-0 lg:ps-72 transition-all duration-300">
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenInbound={() => setInboundModalOpen(true)}
          onOpenTransfer={() => openTransfer()}
          onOpenSale={() => openSale()}
          onOpenReturn={() => openReturn()}
          onOpenNoonPayout={() => setNoonPayoutModalOpen(true)}
          onOpenSupplierPayment={() => openSupplierPayment()}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardOverview
              onOpenInbound={() => setInboundModalOpen(true)}
              onOpenTransfer={() => openTransfer()}
              onOpenSale={() => openSale()}
              onOpenNoonPayout={() => setNoonPayoutModalOpen(true)}
              onOpenSupplierPayment={() => openSupplierPayment()}
            />
          )}

          {currentTab === 'inbound' && (
            <InboundPurchases
              onOpenInboundModal={() => setInboundModalOpen(true)}
            />
          )}

          {currentTab === 'warehouses' && (
            <WarehouseTransfers
              onOpenTransferModal={openTransfer}
            />
          )}

          {currentTab === 'sales' && (
            <SalesReturns
              onOpenSaleModal={() => openSale()}
              onOpenReturnModal={openReturn}
            />
          )}

          {currentTab === 'financials' && (
            <FinancialsLedgers
              onOpenNoonPayout={() => setNoonPayoutModalOpen(true)}
              onOpenSupplierPayment={openSupplierPayment}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <InboundModal
        isOpen={inboundModalOpen}
        onClose={() => setInboundModalOpen(false)}
      />

      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        defaultProductId={transferProductId}
        defaultSource={transferSource}
      />

      <SaleModal
        isOpen={saleModalOpen}
        onClose={() => setSaleModalOpen(false)}
        defaultProductId={saleProductId}
        defaultWarehouse={saleWarehouse}
      />

      <ReturnModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        defaultSaleOrder={returnOrderNum}
        defaultProductId={returnProductId}
      />

      <NoonPayoutModal
        isOpen={noonPayoutModalOpen}
        onClose={() => setNoonPayoutModalOpen(false)}
      />

      <SupplierPaymentModal
        isOpen={supplierPaymentModalOpen}
        onClose={() => setSupplierPaymentModalOpen(false)}
        defaultSupplierId={supplierPaymentSupplierId}
      />

      {/* Notifications */}
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
