export interface ProductRecord {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface OrderItemRecord {
  id: string;
  quantity: number;
}

export interface OrderRecord {
  id: string;
  customerId: string;
  items: OrderItemRecord[];
  total: number;
}

export interface LowDbSchema {
  products: ProductRecord[];
  orders: OrderRecord[];
}
