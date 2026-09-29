'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Supplier,
  InboundShipment,
  StockTransfer,
  Sale,
  ReturnItem,
  NoonSettlement,
  SupplierPayment,
  Warehouse,
  Language,
  CurrencyCode,
  NavigationTab,
  ToastMessage,
  WarehouseId
} from '../types';
import {
  INITIAL_WAREHOUSES,
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_INBOUND_SHIPMENTS,
  INITIAL_TRANSFERS,
  INITIAL_SALES,
  INITIAL_RETURNS,
  INITIAL_NOON_SETTLEMENTS,
  INITIAL_SUPPLIER_PAYMENTS,
} from '../data/initialData';
import { TRANSLATIONS } from '../utils/translations';

interface AppContextType {
  // Navigation & Preferences
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof TRANSLATIONS.en;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatCurrency: (amount: number) => string;

  // Warehouses & Inventory
  warehouses: Warehouse[];
  mainWarehouseId: string;
  setMainWarehouse: (warehouseId: string) => void;
  products: Product[];
  lowStockProducts: Product[];
  mainWarehouseStockCount: number;
  noonWarehouseStockCount: number;
  getProductStock: (product: Product, warehouseId: string) => number;
  getWarehouseStockCount: (warehouseId: string) => number;
  addWarehouse: (data: {
    name: string;
    nameAr?: string;
    code?: string;
    type?: 'Internal' | 'FBN 3PL';
    location?: string;
    locationAr?: string;
    isMain?: boolean;
  }) => Warehouse;
  addProduct: (data: {
    sku?: string;
    name: string;
    nameAr?: string;
    category?: string;
    categoryAr?: string;
    unitCost: number;
    sellingPrice: number;
    stockMain?: number;
    stockNoon?: number;
    minStockAlert?: number;
  }) => Product;

  // Inbound & Purchases
  inboundShipments: InboundShipment[];
  addInboundShipment: (shipment: Omit<InboundShipment, 'id' | 'reference' | 'totalCost'>) => void;

  // Stock Transfers
  transfers: StockTransfer[];
  addStockTransfer: (transfer: Omit<StockTransfer, 'id' | 'reference'>) => { success: boolean; error?: string };

  // Sales & Returns
  sales: Sale[];
  returns: ReturnItem[];
  addSale: (sale: Omit<Sale, 'id' | 'orderNumber' | 'totalRevenue' | 'cogs' | 'grossProfit' | 'noonFeeRate' | 'netReceivableAmount' | 'status'>) => { success: boolean; error?: string };
  addReturn: (ret: Omit<ReturnItem, 'id'>) => void;

  // Financials & Ledgers
  suppliers: Supplier[];
  noonSettlements: NoonSettlement[];
  supplierPayments: SupplierPayment[];
  totalSalesRevenue: number;
  totalCOGS: number;
  netProfit: number;
  noonReceivablesBalance: number;
  supplierPayablesBalance: number;
  addSupplier: (data: {
    name: string;
    nameAr?: string;
    contact?: string;
    phone?: string;
    initialBalance?: number;
  }) => Supplier;
  addNoonSettlement: (payout: Omit<NoonSettlement, 'id' | 'reference'>) => void;
  addSupplierPayment: (payment: Omit<SupplierPayment, 'id' | 'reference'>) => void;

  // Notifications
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Demo Helpers
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'omnistock_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  // Persisted or default states
  const [lang, setLangState] = useState<Language>('ar');

  const currency: CurrencyCode = 'EGP';
  const setCurrency = (_c: CurrencyCode) => {};

  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  const [warehouses, setWarehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [mainWarehouseId, setMainWarehouseId] = useState<string>('main');

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [inboundShipments, setInboundShipments] = useState<InboundShipment[]>(INITIAL_INBOUND_SHIPMENTS);
  const [transfers, setTransfers] = useState<StockTransfer[]>(INITIAL_TRANSFERS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [returns, setReturns] = useState<ReturnItem[]>(INITIAL_RETURNS);
  const [noonSettlements, setNoonSettlements] = useState<NoonSettlement[]>(INITIAL_NOON_SETTLEMENTS);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(INITIAL_SUPPLIER_PAYMENTS);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Hydrate from localStorage once on client
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(`${STORAGE_KEY_PREFIX}lang`);
      if (savedLang) setLangState(savedLang as Language);

      const savedWarehouses = localStorage.getItem(`${STORAGE_KEY_PREFIX}warehouses`);
      let loadedWarehouses = INITIAL_WAREHOUSES;
      if (savedWarehouses) {
        loadedWarehouses = JSON.parse(savedWarehouses);
        setWarehouses(loadedWarehouses);
      }

      const savedMainWh = localStorage.getItem(`${STORAGE_KEY_PREFIX}mainWarehouse`);
      if (savedMainWh) {
        setMainWarehouseId(savedMainWh);
      } else {
        const designated = loadedWarehouses.find(w => w.isMain);
        if (designated) setMainWarehouseId(designated.id);
      }

      const savedProducts = localStorage.getItem(`${STORAGE_KEY_PREFIX}products`);
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedSuppliers = localStorage.getItem(`${STORAGE_KEY_PREFIX}suppliers`);
      if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));

      const savedInbound = localStorage.getItem(`${STORAGE_KEY_PREFIX}inbound`);
      if (savedInbound) setInboundShipments(JSON.parse(savedInbound));

      const savedTransfers = localStorage.getItem(`${STORAGE_KEY_PREFIX}transfers`);
      if (savedTransfers) setTransfers(JSON.parse(savedTransfers));

      const savedSales = localStorage.getItem(`${STORAGE_KEY_PREFIX}sales`);
      if (savedSales) setSales(JSON.parse(savedSales));

      const savedReturns = localStorage.getItem(`${STORAGE_KEY_PREFIX}returns`);
      if (savedReturns) setReturns(JSON.parse(savedReturns));

      const savedNoon = localStorage.getItem(`${STORAGE_KEY_PREFIX}noonSettlements`);
      if (savedNoon) setNoonSettlements(JSON.parse(savedNoon));

      const savedPayments = localStorage.getItem(`${STORAGE_KEY_PREFIX}supplierPayments`);
      if (savedPayments) setSupplierPayments(JSON.parse(savedPayments));
    } catch (e) {
      console.error('Failed to load data from localStorage', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Apply RTL/LTR and font dynamically
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
    if (isHydrated && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}lang`, lang);
      } catch {}
    }
  }, [lang, isHydrated]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  // Persist items
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}warehouses`, JSON.stringify(warehouses));
    } catch {}
  }, [warehouses, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}mainWarehouse`, mainWarehouseId);
    } catch {}
  }, [mainWarehouseId, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}products`, JSON.stringify(products));
    } catch {}
  }, [products, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}suppliers`, JSON.stringify(suppliers));
    } catch {}
  }, [suppliers, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}inbound`, JSON.stringify(inboundShipments));
    } catch {}
  }, [inboundShipments, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}transfers`, JSON.stringify(transfers));
    } catch {}
  }, [transfers, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}sales`, JSON.stringify(sales));
    } catch {}
  }, [sales, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}returns`, JSON.stringify(returns));
    } catch {}
  }, [returns, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}noonSettlements`, JSON.stringify(noonSettlements));
    } catch {}
  }, [noonSettlements, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}supplierPayments`, JSON.stringify(supplierPayments));
    } catch {}
  }, [supplierPayments, isHydrated]);

  // Translation lookup
  const t = TRANSLATIONS[lang];

  // Toast Helper
  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(item => item.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(item => item.id !== id));
  };

  // Currency Formatter - strictly EGP
  const formatCurrency = (amount: number): string => {
    const formatted = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

    return lang === 'ar' ? `${formatted} ج.م` : `EGP ${formatted}`;
  };

  // Helper: Retrieve Stock for a product in any warehouse
  const getProductStock = (product: Product, warehouseId: string): number => {
    if (product.warehouseStocks && product.warehouseStocks[warehouseId] !== undefined) {
      return product.warehouseStocks[warehouseId];
    }
    if (warehouseId === 'main') return product.stockMain;
    if (warehouseId === 'noon') return product.stockNoon;
    return 0;
  };

  // Helper: Retrieve Total Stock across all products in a warehouse
  const getWarehouseStockCount = (warehouseId: string): number => {
    return products.reduce((acc, p) => acc + getProductStock(p, warehouseId), 0);
  };

  // Set Main Warehouse Logic
  const setMainWarehouse = (warehouseId: string) => {
    setMainWarehouseId(warehouseId);
    setWarehouses(prev =>
      prev.map(wh => ({
        ...wh,
        isMain: wh.id === warehouseId,
      }))
    );
    const targetWh = warehouses.find(w => w.id === warehouseId);
    const whName = targetWh ? (lang === 'ar' ? targetWh.nameAr : targetWh.name) : warehouseId;
    addToast(
      'success',
      t.confirmed,
      t.mainWarehouseAssignedSuccess
        ? `${whName} ${t.mainWarehouseAssignedSuccess}`
        : `${whName} is now designated as the main warehouse.`
    );
  };

  // Add Warehouse Logic
  const addWarehouse = (data: {
    name: string;
    nameAr?: string;
    code?: string;
    type?: 'Internal' | 'FBN 3PL';
    location?: string;
    locationAr?: string;
    isMain?: boolean;
  }): Warehouse => {
    const id = `wh-${Date.now()}`;
    const generatedCode = data.code?.trim().toUpperCase() || `WH-0${warehouses.length + 1}`;
    const shouldBeMain = !!data.isMain || warehouses.length === 0;

    const newWarehouse: Warehouse = {
      id,
      name: data.name.trim(),
      nameAr: data.nameAr?.trim() || data.name.trim(),
      code: generatedCode,
      type: data.type || 'Internal',
      location: data.location?.trim() || 'Cairo / Egypt',
      locationAr: data.locationAr?.trim() || (lang === 'ar' ? 'مصر' : 'Cairo / Egypt'),
      isMain: shouldBeMain,
    };

    if (shouldBeMain) {
      setMainWarehouseId(id);
      setWarehouses(prev => [...prev.map(w => ({ ...w, isMain: false })), newWarehouse]);
    } else {
      setWarehouses(prev => [...prev, newWarehouse]);
    }

    addToast('success', t.confirmed, t.warehouseAddedSuccess || 'New warehouse registered successfully!');
    return newWarehouse;
  };

  // Inbound Stock Logic
  const addInboundShipment = (data: Omit<InboundShipment, 'id' | 'reference' | 'totalCost'>) => {
    const totalCost = data.quantity * data.unitCost;
    const refNum = `PO-${new Date().getFullYear()}-${String(inboundShipments.length + 85).padStart(3, '0')}`;
    
    let paidAmount = 0;
    let addedBalance = totalCost;

    if (data.paymentStatus === 'Paid') {
      paidAmount = totalCost;
      addedBalance = 0;
    } else if (data.paymentStatus === 'Partial') {
      const requestedPaid = Number(data.paidAmount);
      paidAmount = isNaN(requestedPaid) ? 0 : Math.min(totalCost, Math.max(0, requestedPaid));
      addedBalance = Math.max(0, totalCost - paidAmount);
    } else {
      paidAmount = 0;
      addedBalance = totalCost;
    }

    const newShipment: InboundShipment = {
      ...data,
      id: `inb-${Date.now()}`,
      reference: refNum,
      totalCost,
      paidAmount,
    };

    // 1. Update Product Stock in the target warehouse
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        if (prod.id === data.productId) {
          const currentWhStock = getProductStock(prod, data.targetWarehouse);
          const newWhStock = currentWhStock + data.quantity;
          const updatedStocks = {
            ...(prod.warehouseStocks || { main: prod.stockMain, noon: prod.stockNoon }),
            [data.targetWarehouse]: newWhStock,
          };
          return {
            ...prod,
            unitCost: data.unitCost, // Update latest unit cost
            stockMain: data.targetWarehouse === 'main' ? newWhStock : prod.stockMain,
            stockNoon: data.targetWarehouse === 'noon' ? newWhStock : prod.stockNoon,
            warehouseStocks: updatedStocks,
          };
        }
        return prod;
      })
    );

    // 2. Update Supplier Accounts Payable & totals
    setSuppliers(prevSuppliers =>
      prevSuppliers.map(sup => {
        if (sup.id === data.supplierId || sup.name === data.supplierName) {
          return {
            ...sup,
            totalPurchased: sup.totalPurchased + totalCost,
            totalPaid: sup.totalPaid + paidAmount,
            currentBalance: sup.currentBalance + addedBalance,
          };
        }
        return sup;
      })
    );

    // 3. If upfront cash was paid (Partial or Paid), record it in the supplier payments log
    if (paidAmount > 0) {
      const payRef = `PAY-ADV-${String(supplierPayments.length + 50).padStart(3, '0')}`;
      const advancePayment: SupplierPayment = {
        id: `pay-${Date.now()}`,
        reference: payRef,
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        amount: paidAmount,
        paymentMethod: 'Cash / Direct Advance',
        date: data.purchaseDate,
        notes: `Advance cash payment for inbound PO ${refNum}`,
      };
      setSupplierPayments(prev => [advancePayment, ...prev]);
    }

    setInboundShipments(prev => [newShipment, ...prev]);
    addToast('success', t.confirmed, t.inboundSuccess);
  };

  // Transfer Stock Logic
  const addStockTransfer = (data: Omit<StockTransfer, 'id' | 'reference'>) => {
    const product = products.find(p => p.id === data.productId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    const availableStock = getProductStock(product, data.sourceWarehouse);
    if (availableStock < data.quantity) {
      addToast('error', t.critical, t.insufficientStock);
      return { success: false, error: t.insufficientStock };
    }

    // Decrement source warehouse, increment target warehouse
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === data.productId) {
          const srcStock = getProductStock(p, data.sourceWarehouse) - data.quantity;
          const tgtStock = getProductStock(p, data.targetWarehouse) + data.quantity;
          const updatedStocks = {
            ...(p.warehouseStocks || { main: p.stockMain, noon: p.stockNoon }),
            [data.sourceWarehouse]: srcStock,
            [data.targetWarehouse]: tgtStock,
          };
          return {
            ...p,
            stockMain:
              data.sourceWarehouse === 'main' ? srcStock : data.targetWarehouse === 'main' ? tgtStock : p.stockMain,
            stockNoon:
              data.sourceWarehouse === 'noon' ? srcStock : data.targetWarehouse === 'noon' ? tgtStock : p.stockNoon,
            warehouseStocks: updatedStocks,
          };
        }
        return p;
      })
    );

    const refNum = `TR-${String(transfers.length + 45).padStart(3, '0')}`;
    const newTransfer: StockTransfer = {
      ...data,
      id: `tr-${Date.now()}`,
      reference: refNum,
    };

    setTransfers(prev => [newTransfer, ...prev]);
    addToast('success', t.completed, t.transferSuccess);
    return { success: true };
  };

  // Sales Logic
  const addSale = (data: Omit<Sale, 'id' | 'orderNumber' | 'totalRevenue' | 'cogs' | 'grossProfit' | 'noonFeeRate' | 'netReceivableAmount' | 'status'>) => {
    const product = products.find(p => p.id === data.productId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    const sourceStock = getProductStock(product, data.sourceWarehouse);
    if (sourceStock < data.quantity) {
      addToast('error', t.critical, t.insufficientStock);
      return { success: false, error: t.insufficientStock };
    }

    const totalRevenue = data.quantity * data.sellingPrice;
    const cogs = data.quantity * (data.unitCost || product.unitCost);
    const grossProfit = totalRevenue - cogs;
    const isNoon = data.sourceWarehouse === 'noon' || data.channel === 'Noon FBN';
    const noonFeeRate = isNoon ? 0.11 : 0; // 11% average Noon commission + pick & pack
    const netReceivableAmount = isNoon ? totalRevenue * (1 - noonFeeRate) : 0;

    // Deduct stock from the source warehouse
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === data.productId) {
          const newWhStock = getProductStock(p, data.sourceWarehouse) - data.quantity;
          const updatedStocks = {
            ...(p.warehouseStocks || { main: p.stockMain, noon: p.stockNoon }),
            [data.sourceWarehouse]: newWhStock,
          };
          return {
            ...p,
            stockMain: data.sourceWarehouse === 'main' ? newWhStock : p.stockMain,
            stockNoon: data.sourceWarehouse === 'noon' ? newWhStock : p.stockNoon,
            warehouseStocks: updatedStocks,
          };
        }
        return p;
      })
    );

    const prefix = isNoon ? 'NON-ORD' : 'DIR-ORD';
    const orderNumber = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSale: Sale = {
      ...data,
      id: `sale-${Date.now()}`,
      orderNumber,
      totalRevenue,
      cogs,
      grossProfit,
      noonFeeRate,
      netReceivableAmount,
      status: 'Completed',
    };

    setSales(prev => [newSale, ...prev]);
    addToast('success', t.completed, t.saleSuccess);
    return { success: true };
  };

  // Returns Logic
  const addReturn = (retData: Omit<ReturnItem, 'id'>) => {
    const newReturn: ReturnItem = {
      ...retData,
      id: `ret-${Date.now()}`,
    };

    // If sellable and restock requested, return to stock
    if (retData.condition === 'Sellable' && retData.restocked) {
      setProducts(prevProducts =>
        prevProducts.map(p => {
          if (p.id === retData.productId) {
            const newWhStock = getProductStock(p, retData.targetWarehouse) + retData.quantity;
            const updatedStocks = {
              ...(p.warehouseStocks || { main: p.stockMain, noon: p.stockNoon }),
              [retData.targetWarehouse]: newWhStock,
            };
            return {
              ...p,
              stockMain: retData.targetWarehouse === 'main' ? newWhStock : p.stockMain,
              stockNoon: retData.targetWarehouse === 'noon' ? newWhStock : p.stockNoon,
              warehouseStocks: updatedStocks,
            };
          }
          return p;
        })
      );
    }

    setReturns(prev => [newReturn, ...prev]);
    addToast('info', t.returned, t.returnSuccess);
  };

  // Noon Settlement Payout Logic
  const addNoonSettlement = (payout: Omit<NoonSettlement, 'id' | 'reference'>) => {
    const ref = `SET-NOON-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSettlement: NoonSettlement = {
      ...payout,
      id: `set-${Date.now()}`,
      reference: ref,
    };
    setNoonSettlements(prev => [newSettlement, ...prev]);
    addToast('success', t.confirmed, t.payoutSuccess);
  };

  // Supplier Payment Logic
  const addSupplierPayment = (payment: Omit<SupplierPayment, 'id' | 'reference'>) => {
    const ref = `PAY-SUP-${String(supplierPayments.length + 50).padStart(3, '0')}`;
    const newPayment: SupplierPayment = {
      ...payment,
      id: `pay-${Date.now()}`,
      reference: ref,
    };

    setSuppliers(prevSuppliers =>
      prevSuppliers.map(sup => {
        if (sup.id === payment.supplierId || sup.name === payment.supplierName) {
          return {
            ...sup,
            totalPaid: sup.totalPaid + payment.amount,
            currentBalance: Math.max(0, sup.currentBalance - payment.amount),
          };
        }
        return sup;
      })
    );

    setSupplierPayments(prev => [newPayment, ...prev]);
    addToast('success', t.confirmed, t.paymentSuccess);
  };

  // Add Supplier Logic
  const addSupplier = (data: {
    name: string;
    nameAr?: string;
    contact?: string;
    phone?: string;
    initialBalance?: number;
  }): Supplier => {
    const initialBal = Math.max(0, Number(data.initialBalance) || 0);
    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: data.name.trim(),
      nameAr: (data.nameAr && data.nameAr.trim()) ? data.nameAr.trim() : data.name.trim(),
      contact: data.contact?.trim() || '',
      phone: data.phone?.trim() || '',
      totalPurchased: initialBal,
      totalPaid: 0,
      currentBalance: initialBal,
    };

    setSuppliers(prev => [newSupplier, ...prev]);
    addToast('success', t.confirmed, t.supplierAddedSuccess || 'Supplier registered successfully!');
    return newSupplier;
  };

  // Add Product Logic
  const addProduct = (data: {
    sku?: string;
    name: string;
    nameAr?: string;
    category?: string;
    categoryAr?: string;
    unitCost: number;
    sellingPrice: number;
    stockMain?: number;
    stockNoon?: number;
    minStockAlert?: number;
  }): Product => {
    const cleanSku = data.sku?.trim() || `SKU-${Date.now().toString().slice(-5)}`;
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku: cleanSku.toUpperCase(),
      name: data.name.trim(),
      nameAr: (data.nameAr && data.nameAr.trim()) ? data.nameAr.trim() : data.name.trim(),
      category: data.category?.trim() || 'General',
      categoryAr: data.categoryAr?.trim() || (lang === 'ar' ? 'عام' : 'General'),
      unitCost: Math.max(0, Number(data.unitCost) || 0),
      sellingPrice: Math.max(0, Number(data.sellingPrice) || 0),
      stockMain: Math.max(0, Number(data.stockMain) || 0),
      stockNoon: Math.max(0, Number(data.stockNoon) || 0),
      minStockAlert: Math.max(1, Number(data.minStockAlert) || 10),
    };

    setProducts(prev => [newProduct, ...prev]);
    addToast('success', t.confirmed, t.productAddedSuccess || 'Product added successfully to inventory!');
    return newProduct;
  };

  // Calculated Aggregate Values
  const mainWarehouseStockCount = products.reduce((acc, p) => acc + p.stockMain, 0);
  const noonWarehouseStockCount = products.reduce((acc, p) => acc + p.stockNoon, 0);

  const lowStockProducts = products.filter(
    p => p.stockMain <= p.minStockAlert || p.stockNoon <= p.minStockAlert
  );

  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.totalRevenue, 0);
  const totalCOGS = sales.reduce((acc, s) => acc + s.cogs, 0);
  const totalRefunds = returns.reduce((acc, r) => acc + r.refundAmount, 0);
  const totalNoonFees = sales.filter(s => s.sourceWarehouse === 'noon').reduce((acc, s) => acc + (s.totalRevenue * s.noonFeeRate), 0);
  const netProfit = totalSalesRevenue - totalCOGS - totalNoonFees - totalRefunds;

  // Noon Receivables:
  // Base initial starting ledger balance + all net receivables from Noon sales - all payouts received
  const initialNoonSalesNet = 2400.33 + 1580.48 + 1282.5 + 47500; // Prior cycles + seed sales
  const totalNoonSalesReceivables = sales
    .filter(s => s.sourceWarehouse === 'noon')
    .reduce((acc, s) => acc + s.netReceivableAmount, 0);
  const totalNoonPayouts = noonSettlements.reduce((acc, p) => acc + p.amount, 0);
  // Net balance: positive represents money currently owed by Noon to the seller
  const noonReceivablesBalance = Math.max(0, (initialNoonSalesNet + totalNoonSalesReceivables) - totalNoonPayouts);

  // Supplier Payables: Sum of current balances across all suppliers
  const supplierPayablesBalance = suppliers.reduce((acc, s) => acc + s.currentBalance, 0);

  // Reset to Default Demo Data
  const resetToDefaultData = () => {
    setWarehouses(INITIAL_WAREHOUSES);
    setMainWarehouseId('main');
    setProducts(INITIAL_PRODUCTS);
    setSuppliers(INITIAL_SUPPLIERS);
    setInboundShipments(INITIAL_INBOUND_SHIPMENTS);
    setTransfers(INITIAL_TRANSFERS);
    setSales(INITIAL_SALES);
    setReturns(INITIAL_RETURNS);
    setNoonSettlements(INITIAL_NOON_SETTLEMENTS);
    setSupplierPayments(INITIAL_SUPPLIER_PAYMENTS);
    addToast('info', t.resetDemo, 'All demo inventory and ledger data restored to initial state.');
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        lang,
        setLang,
        t,
        currency,
        setCurrency,
        formatCurrency,
        warehouses,
        mainWarehouseId,
        setMainWarehouse,
        addWarehouse,
        products,
        addProduct,
        getProductStock,
        getWarehouseStockCount,
        lowStockProducts,
        mainWarehouseStockCount,
        noonWarehouseStockCount,
        inboundShipments,
        addInboundShipment,
        transfers,
        addStockTransfer,
        sales,
        returns,
        addSale,
        addReturn,
        suppliers,
        noonSettlements,
        supplierPayments,
        totalSalesRevenue,
        totalCOGS,
        netProfit,
        noonReceivablesBalance,
        supplierPayablesBalance,
        addSupplier,
        addNoonSettlement,
        addSupplierPayment,
        toasts,
        addToast,
        removeToast,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
