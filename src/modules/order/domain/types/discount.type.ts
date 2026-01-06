export type CustomerLocation = "US" | "EU" | "ASIA";

export interface DiscountContext {
  quantity: number;
  date: Date;
  location: CustomerLocation;
}

export interface DiscountStrategy {
  calculate(context: DiscountContext): number;
}
