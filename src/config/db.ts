import { JSONFileSyncPreset } from "lowdb/node";
import { InboundShipment, NoonSettlement, Product, ReturnItem, Sale, StockTransfer, Supplier, SupplierPayment, Warehouse } from "../types";

type defaultDataType = {
  warehouses: Warehouse[],
  products: Product[],
  inboundShipments: InboundShipment[],
  stockTransfers: StockTransfer[],
  sales: Sale[],
  returnItems: ReturnItem[],
  noonSettlements: NoonSettlement[],
  suppliers: Supplier[],
  supplierPayments: SupplierPayment[]
};
const defaultData: defaultDataType = {
  warehouses: [],
  products: [],
  inboundShipments: [],
  stockTransfers: [],
  sales: [],
  returnItems: [],
  noonSettlements: [],
  suppliers: [],
  supplierPayments: []
};

export const dp = JSONFileSyncPreset("db.json", defaultData);
