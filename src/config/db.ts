"use server"
import { JSONFileSyncPreset } from "lowdb/node";
import { InboundShipment, NoonSettlement, Product, ReturnItem, Sale, StockTransfer, Supplier, SupplierPayment, Warehouse } from "../types";

export type DefaultDataType = {
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
const defaultData: DefaultDataType = {
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

const db = JSONFileSyncPreset("db.json", defaultData);

export const dbWrite = async (propName: string, prop: any) => {
  db.data[propName] = prop;
  db.write();
}
export const dbRead = async () => db.read();
export const getData = async () => db.data;
