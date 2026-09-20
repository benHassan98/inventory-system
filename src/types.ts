export type WarehouseId = 'main' | 'noon';

export interface Warehouse {
  id: WarehouseId;
  name: string;
  nameAr: string;
  code: string;
  type: 'Internal' | 'FBN 3PL';
  location: string;
  locationAr: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  nameAr: string;
  category: string;
  categoryAr: string;
  unitCost: number;
  sellingPrice: number;
  stockMain: number;
  stockNoon: number;
  minStockAlert: number;
}

export interface InboundShipment {
  id: string;
  reference: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  targetWarehouse: WarehouseId;
  purchaseDate: string;
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  notes?: string;
}

export interface StockTransfer {
  id: string;
  reference: string;
  productId: string;
  productName: string;
  sku: string;
  sourceWarehouse: WarehouseId;
  targetWarehouse: WarehouseId;
  quantity: number;
  status: 'Completed' | 'In Transit';
  fbnAsnNumber?: string;
  transferDate: string;
  notes?: string;
}

export interface Sale {
  id: string;
  orderNumber: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  sellingPrice: number;
  unitCost: number;
  totalRevenue: number;
  cogs: number;
  grossProfit: number;
  sourceWarehouse: WarehouseId;
  channel: 'Noon FBN' | 'Direct / Store';
  saleDate: string;
  status: 'Completed' | 'Returned';
  noonFeeRate: number; // e.g., 0.12 (12%)
  netReceivableAmount: number;
}

export interface ReturnItem {
  id: string;
  saleId?: string;
  orderNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  refundAmount: number;
  targetWarehouse: WarehouseId;
  condition: 'Sellable' | 'Damaged';
  restocked: boolean;
  reason: string;
  returnDate: string;
}

export interface NoonSettlement {
  id: string;
  reference: string;
  amount: number;
  paymentMethod: string;
  bankReference: string;
  date: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  nameAr: string;
  contact: string;
  phone: string;
  totalPurchased: number;
  totalPaid: number;
  currentBalance: number; // Accounts Payable
}

export interface SupplierPayment {
  id: string;
  reference: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  paymentMethod: string;
  date: string;
  notes?: string;
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
