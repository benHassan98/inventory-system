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
} from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { loadFromFile, saveToFile } from '../utils/data-utils';

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
  mainWarehouseId: number;
  setMainWarehouse: (warehouseId: number) => void;
  products: Product[];
  // lowStockProducts: Product[];
  mainWarehouseStockCount: number;
  noonWarehouseStockCount: number;
  getProductStock: (product: Product, warehouseId: number) => number;
  getWarehouseStockCount: (warehouseId: number) => number;
  addWarehouse: (data: Omit<Warehouse, "id">) => Warehouse;
  addProduct: (data: Omit<Product, "id">) => Product;

  // Inbound & Purchases
  inboundShipments: InboundShipment[];
  addInboundShipment: (shipment: Omit<InboundShipment, 'id' | 'totalCost'>) => void;

  // Stock Transfers
  transfers: StockTransfer[];
  addStockTransfer: (transfer: Omit<StockTransfer, 'id'>) => { success: boolean; error?: string };

  // Sales & Returns
  sales: Sale[];
  returns: ReturnItem[];
  addSale: (sale: Omit<Sale, 'id' | 'totalRevenue' | 'noonFeeRate' | 'netReceivableAmount' | 'status'>) => { success: boolean; error?: string };
  addReturn: (ret: Omit<ReturnItem, 'id'>) => void;

  // Financials & Ledgers
  suppliers: Supplier[];
  noonSettlements: NoonSettlement[];
  supplierPayments: SupplierPayment[];
  totalSalesRevenue: number;
  netProfit: number;
  noonReceivablesBalance: number;
  supplierPayablesBalance: number;
  addSupplier: (data: {
    name: string;
    contact?: string;
    phone?: string;
    initialBalance?: number;
  }) => Supplier;
  addNoonSettlement: (payout: Omit<NoonSettlement, 'id'>) => void;
  addSupplierPayment: (payment: Omit<SupplierPayment, 'id'>) => void;

  // Notifications
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

}
const warehouseList: Warehouse[] = await loadFromFile<Warehouse>("warehouses");
const productList: Product[] = await loadFromFile<Product>("products");
const supplierList: Supplier[] = await loadFromFile<Supplier>("suppliers");
const inboundShipmentList: InboundShipment[] = await loadFromFile<InboundShipment>("inbound-shipments");
const stockTransferList: StockTransfer[] = await loadFromFile<StockTransfer>("stock-transfers");
const saleList: Sale[] = await loadFromFile<Sale>("sales");
const returnItemList: ReturnItem[] = await loadFromFile<ReturnItem>("return-items");
const noonSettlementList: NoonSettlement[] = await loadFromFile<NoonSettlement>("noon-settlements");
const supplierPaymentList: SupplierPayment[] = await loadFromFile<SupplierPayment>("supplier-payments");

const getMainWarehouseId = (): number => {
  const mainWarehouse = warehouseList.filter(w => w.isMain);
  if (!mainWarehouse.length) {
    return -1;
  }
  return mainWarehouse[0].id;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'omnistock_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persisted or default states
  const [lang, setLangState] = useState<Language>('ar');

  const currency: CurrencyCode = 'EGP';
  const setCurrency = (_c: CurrencyCode) => { };

  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  const [warehouses, setWarehouses] = useState<Warehouse[]>(warehouseList);
  const [mainWarehouseId, setMainWarehouseId] = useState<number>(getMainWarehouseId());

  const [products, setProducts] = useState<Product[]>(productList);
  const [suppliers, setSuppliers] = useState<Supplier[]>(supplierList);
  const [inboundShipments, setInboundShipments] = useState<InboundShipment[]>(inboundShipmentList);
  const [transfers, setTransfers] = useState<StockTransfer[]>(stockTransferList);
  const [sales, setSales] = useState<Sale[]>(saleList);
  const [returns, setReturns] = useState<ReturnItem[]>(returnItemList);
  const [noonSettlements, setNoonSettlements] = useState<NoonSettlement[]>(noonSettlementList);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(supplierPaymentList);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Hydrate from localStorage once on client
  // useEffect(() => {
  //   try {
  //     const savedLang = localStorage.getItem(`${STORAGE_KEY_PREFIX}lang`);
  //     if (savedLang) setLangState(savedLang as Language);
  //
  //     const savedWarehouses = localStorage.getItem(`${STORAGE_KEY_PREFIX}warehouses`);
  //     let loadedWarehouses = warehouseList;
  //     if (savedWarehouses) {
  //       loadedWarehouses = JSON.parse(savedWarehouses);
  //       setWarehouses(loadedWarehouses);
  //     }
  //
  //     const savedMainWh = localStorage.getItem(`${STORAGE_KEY_PREFIX}mainWarehouse`);
  //     if (savedMainWh) {
  //       setMainWarehouseId(savedMainWh);
  //     } else {
  //       const designated = loadedWarehouses.find(w => w.isMain);
  //       if (designated) setMainWarehouseId(designated.id);
  //     }
  //
  //     const savedProducts = localStorage.getItem(`${STORAGE_KEY_PREFIX}products`);
  //     if (savedProducts) setProducts(JSON.parse(savedProducts));
  //
  //     const savedSuppliers = localStorage.getItem(`${STORAGE_KEY_PREFIX}suppliers`);
  //     if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
  //
  //     const savedInbound = localStorage.getItem(`${STORAGE_KEY_PREFIX}inbound`);
  //     if (savedInbound) setInboundShipments(JSON.parse(savedInbound));
  //
  //     const savedTransfers = localStorage.getItem(`${STORAGE_KEY_PREFIX}transfers`);
  //     if (savedTransfers) setTransfers(JSON.parse(savedTransfers));
  //
  //     const savedSales = localStorage.getItem(`${STORAGE_KEY_PREFIX}sales`);
  //     if (savedSales) setSales(JSON.parse(savedSales));
  //
  //     const savedReturns = localStorage.getItem(`${STORAGE_KEY_PREFIX}returns`);
  //     if (savedReturns) setReturns(JSON.parse(savedReturns));
  //
  //     const savedNoon = localStorage.getItem(`${STORAGE_KEY_PREFIX}noonSettlements`);
  //     if (savedNoon) setNoonSettlements(JSON.parse(savedNoon));
  //
  //     const savedPayments = localStorage.getItem(`${STORAGE_KEY_PREFIX}supplierPayments`);
  //     if (savedPayments) setSupplierPayments(JSON.parse(savedPayments));
  //   } catch (e) {
  //     console.error('Failed to load data from localStorage', e);
  //   } finally {
  //     setIsHydrated(true);
  //   }
  // }, []);

  // Apply RTL/LTR and font dynamically
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}lang`, lang);
      } catch { }
    }
  }, [lang]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  // Persist items
  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveToFile(warehouseList, "warehouses");
  }, [warehouses, mainWarehouseId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveToFile(productList, "products");
  }, [products]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveToFile(supplierList, "suppliers");
  }, [suppliers]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveToFile(inboundShipmentList, "inbound-shipments");
  }, [inboundShipments]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveToFile(stockTransferList, "stock-transfers");
  }, [transfers]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveToFile(saleList, "sales");
  }, [sales]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveToFile(returnItemList, "return-items");
  }, [returns]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveToFile(noonSettlementList, "noon-settlements");
  }, [noonSettlements]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveToFile(supplierPaymentList, "supplier-payments");
  }, [supplierPayments]);

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
  const getProductStock = (product: Product, warehouseId: number): number => {
    if (product.stock[warehouseId] !== undefined) {
      return product.stock[warehouseId];
    }
    return 0;
  };

  // Helper: Retrieve Total Stock across all products in a warehouse
  const getWarehouseStockCount = (warehouseId: number): number => {
    return products.reduce((acc, p) => acc + getProductStock(p, warehouseId), 0);
  };

  // Set Main Warehouse Logic
  const setMainWarehouse = (warehouseId: number) => {
    setMainWarehouseId(warehouseId);
    setWarehouses(prev =>
      prev.map(wh => ({
        ...wh,
        isMain: wh.id === warehouseId,
      }))
    );
    const targetWh = warehouses.find(w => w.id === warehouseId);
    const whName = targetWh ? (lang === 'ar' ? targetWh.name : targetWh.name) : warehouseId;
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
    type?: 'Internal' | 'Noon';
    location?: string;
    locationAr?: string;
    isMain?: boolean;
  }): Warehouse => {
    const id = warehouses.length + 1;
    const shouldBeMain = !!data.isMain || warehouses.length === 0;

    const newWarehouse: Warehouse = {
      id,
      name: data.name.trim(),
      type: data.type || 'Internal',
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
  const addInboundShipment = (data: Omit<InboundShipment, 'id' | 'totalCost'>) => {
    const totalCost = data.quantity * data.unitCost;

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
      id: inboundShipments.length + 1,
      totalCost,
      paidAmount,
    };

    // 1. Update Product Stock in the target warehouse
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        if (prod.id === data.productId) {
          const currentWhStock = getProductStock(prod, data.warehouseId);
          const newWhStock = currentWhStock + data.quantity;
          const updatedStocks = {
            ...(prod.stock),
            [data.warehouseId]: newWhStock,
          };
          return {
            ...prod,
            unitCost: data.unitCost, // Update latest unit cost
            warehouseStocks: updatedStocks,
          };
        }
        return prod;
      })
    );

    // 2. Update Supplier Accounts Payable & totals
    setSuppliers(prevSuppliers =>
      prevSuppliers.map(sup => {
        if (sup.id === data.supplierId) {
          return {
            ...sup,
            totalPurchased: sup.totalPurchased + totalCost,
            totalPaid: sup.totalPaid + paidAmount,
          };
        }
        return sup;
      })
    );

    // 3. If upfront cash was paid (Partial or Paid), record it in the supplier payments log
    if (paidAmount > 0) {
      const advancePayment: SupplierPayment = {
        id: supplierPayments.length + 1,
        supplierId: data.supplierId,
        amount: paidAmount,
        date: data.purchaseDate,
      };
      setSupplierPayments(prev => [advancePayment, ...prev]);
    }

    setInboundShipments(prev => [newShipment, ...prev]);
    addToast('success', t.confirmed, t.inboundSuccess);
  };

  // Transfer Stock Logic
  const addStockTransfer = (data: Omit<StockTransfer, 'id'>) => {
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
            ...(p.stock),
            [data.sourceWarehouse]: srcStock,
            [data.targetWarehouse]: tgtStock,
          };
          return {
            ...p,
            warehouseStocks: updatedStocks,
          };
        }
        return p;
      })
    );

    const newTransfer: StockTransfer = {
      ...data,
      id: transfers.length + 1,
    };

    setTransfers(prev => [newTransfer, ...prev]);
    addToast('success', t.completed, t.transferSuccess);
    return { success: true };
  };

  // Sales Logic
  const addSale = (data: Omit<Sale, 'id' | 'totalRevenue' | 'noonFeeRate' | 'netReceivableAmount' | 'status'>) => {
    const product = products.find(p => p.id === data.productId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    const sourceStock = getProductStock(product, data.warehouseId);
    if (sourceStock < data.quantity) {
      addToast('error', t.critical, t.insufficientStock);
      return { success: false, error: t.insufficientStock };
    }

    const totalRevenue = data.quantity * data.sellingPrice;
    const isNoon = warehouses[data.warehouseId].type === "Noon";
    const noonFeeRate = isNoon ? 0.11 : 0; // 11% average Noon commission + pick & pack
    const netReceivableAmount = isNoon ? totalRevenue * (1 - noonFeeRate) : 0;

    // Deduct stock from the source warehouse
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === data.productId) {
          const newWhStock = getProductStock(p, data.warehouseId) - data.quantity;
          const updatedStocks = {
            ...(p.stock),
            [data.warehouseId]: newWhStock,
          };
          return {
            ...p,
            warehouseStocks: updatedStocks,
          };
        }
        return p;
      })
    );

    const newSale: Sale = {
      ...data,
      id: sales.length + 1,
      totalRevenue,
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
      id: returns.length + 1,
    };

    // If sellable and restock requested, return to stock
    if (retData.condition === 'Sellable' && retData.restocked) {
      setProducts(prevProducts =>
        prevProducts.map(p => {
          if (p.id === retData.productId) {
            const newWhStock = getProductStock(p, retData.warehouseId) + retData.quantity;
            const updatedStocks = {
              ...(p.stock),
              [retData.warehouseId]: newWhStock,
            };
            return {
              ...p,
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
  const addNoonSettlement = (payout: Omit<NoonSettlement, 'id'>) => {
    const newSettlement: NoonSettlement = {
      ...payout,
      id: noonSettlements.length + 1,
    };
    setNoonSettlements(prev => [newSettlement, ...prev]);
    addToast('success', t.confirmed, t.payoutSuccess);
  };

  // Supplier Payment Logic
  const addSupplierPayment = (payment: Omit<SupplierPayment, 'id'>) => {
    const newPayment: SupplierPayment = {
      ...payment,
      id: supplierPayments.length + 1,
    };

    setSuppliers(prevSuppliers =>
      prevSuppliers.map(sup => {
        if (sup.id === payment.supplierId) {
          return {
            ...sup,
            totalPaid: sup.totalPaid + payment.amount,
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
      id: suppliers.length + 1,
      name: data.name.trim(),
      contact: data.contact?.trim() || '',
      phone: data.phone?.trim() || '',
      totalPurchased: initialBal,
      totalPaid: 0,
    };

    setSuppliers(prev => [newSupplier, ...prev]);
    addToast('success', t.confirmed, t.supplierAddedSuccess || 'Supplier registered successfully!');
    return newSupplier;
  };

  // Add Product Logic
  const addProduct = (data: {
    name: string;
    unitCost: number;
    sellingPrice: number;
  }): Product => {
    const newProduct: Product = {
      id: products.length + 1,
      name: data.name.trim(),
      unitCost: Math.max(0, Number(data.unitCost) || 0),
      sellingPrice: Math.max(0, Number(data.sellingPrice) || 0),
      stock: {}
    };

    setProducts(prev => [newProduct, ...prev]);
    addToast('success', t.confirmed, t.productAddedSuccess || 'Product added successfully to inventory!');
    return newProduct;
  };

  // get stock count in main warehouses
  const getMainWarehouseStock = (stock: Record<number, number>): number => {
    let ans = 0;
    Object.entries(stock).forEach(([k, v]) => {
      if (warehouses[Number(k)].isMain) {
        ans += v;
      }
    });
    return ans;
  };

  // get stock count in noon warehouses
  const getNoonWarehouseStock = (stock: Record<number, number>): number => {
    let ans = 0;
    Object.entries(stock).forEach(([k, v]) => {
      if (warehouses[Number(k)].type === "Noon") {
        ans += v;
      }
    });
    return ans;
  };

  // Calculated Aggregate Values
  const mainWarehouseStockCount = products.reduce((acc, p) => acc + getMainWarehouseStock(p.stock), 0);
  const noonWarehouseStockCount = products.reduce((acc, p) => acc + getNoonWarehouseStock(p.stock), 0);

  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.totalRevenue, 0);
  const totalRefunds = returns.reduce((acc, r) => acc + r.refundAmount, 0);
  const totalNoonFees = sales.filter(s => warehouses[s.warehouseId].type === "Noon").reduce((acc, s) => acc + (s.totalRevenue * s.noonFeeRate), 0);
  const netProfit = totalSalesRevenue - totalNoonFees - totalRefunds;

  // Noon Receivables:
  // Base initial starting ledger balance + all net receivables from Noon sales - all payouts received
  const initialNoonSalesNet = 0;
  const totalNoonSalesReceivables = sales
    .filter(s => warehouses[s.warehouseId].type === "Noon")
    .reduce((acc, s) => acc + s.netReceivableAmount, 0);
  const totalNoonPayouts = noonSettlements.reduce((acc, p) => acc + p.amount, 0);
  // Net balance: positive represents money currently owed by Noon to the seller
  const noonReceivablesBalance = Math.max(0, (initialNoonSalesNet + totalNoonSalesReceivables) - totalNoonPayouts);

  // Supplier Payables: Sum of current balances across all suppliers
  const supplierPayablesBalance = suppliers.reduce((acc, s) => acc + (s.totalPurchased - s.totalPaid), 0);

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
        netProfit,
        noonReceivablesBalance,
        supplierPayablesBalance,
        addSupplier,
        addNoonSettlement,
        addSupplierPayment,
        toasts,
        addToast,
        removeToast,
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
