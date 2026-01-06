import type { CustomerLocation } from "./discount.type.js";
import type { Product } from "@modules/product";

export interface OrderItemInput {
  id: string;
  quantity: number;
}

export interface CalculateOrderTotalInput {
  products: Product[];
  items: OrderItemInput[];
  location: CustomerLocation;
  orderDate?: Date;
}

export interface CalculateItemTotalInput {
  product: Product;
  quantity: number;
  location: CustomerLocation;
  orderDate: Date;
}
