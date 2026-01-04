export interface ProductRecord {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface LowDbSchema {
  products: ProductRecord[];
  orders: unknown[];
}
