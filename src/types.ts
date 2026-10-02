export interface Warehouse {
  id: number;
  name: string;
  type: 'Noon' | 'Internal';
  isMain: boolean;
}

export interface Product {
  id: number;
  name: string;
  unitCost: number;
  sellingPrice: number;
  stock: Record<number, number>;
}

export interface InboundShipment {
  id: number;
  warehouseId: number;
  supplierId: number;
  productId: number;
  quantity: number;
  unitCost: number;
  totalCost: number;
  purchaseDate: string;
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  paidAmount: number;
}

export interface StockTransfer {
  id: number;
  productId: number;
  sourceWarehouse: number;
  targetWarehouse: number;
  quantity: number;
  status: 'Completed' | 'In Transit';
  transferDate: string;
}

export interface Sale {
  id: number;
  productId: number;
  warehouseId: number;
  quantity: number;
  unitCost: number;
  sellingPrice: number;
  totalRevenue: number;
  saleDate: string;
  status: 'Completed' | 'Returned';
  noonFeeRate: number; // e.g., 0.12 (12%)
  netReceivableAmount: number;
}

export interface ReturnItem {
  id: number;
  saleId: number;
  productId: number;
  quantity: number;
  refundAmount: number;
  warehouseId: number;
  condition: 'Sellable' | 'Damaged';
  restocked: boolean;
  reason: string;
  returnDate: string;
}

export interface NoonSettlement {
  id: number;
  amount: number;
  date: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact?: string;
  phone?: string;
  totalPurchased: number;
  totalPaid: number;
}

export interface SupplierPayment {
  id: number;
  supplierId: number;
  amount: number;
  date: string;
}

export type Language = 'en' | 'ar';
export type CurrencyCode = 'EGP';
export type NavigationTab = 'dashboard' | 'inbound' | 'warehouses' | 'sales' | 'financials';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}
