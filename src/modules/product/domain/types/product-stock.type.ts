import type { Product } from "../product.entity.js";

export type ProductQuantity = {
  id: string;
  quantity: number;
};

export type ProductReservation = {
  product: Product;
  quantity: number;
};
