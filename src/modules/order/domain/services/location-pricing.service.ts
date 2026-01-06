import type { CustomerLocation } from "../types/discount.type.js";

import { Decimal } from "decimal.js";
import { injectable } from "tsyringe";

@injectable()
export class LocationPricingService {
  public applyLocationPricing(
    price: number,
    location: CustomerLocation,
  ): number {
    const adjustment = this.getLocationAdjustment(location);
    const basePrice = new Decimal(price);
    const adjustmentMultiplier = new Decimal(1).minus(adjustment);

    return basePrice.times(adjustmentMultiplier).toNumber();
  }

  private getLocationAdjustment(location: CustomerLocation): number {
    switch (location) {
      case "EU":
        return -0.15;
      case "ASIA":
        return 0.05;
      case "US":
      default:
        return 0;
    }
  }
}
