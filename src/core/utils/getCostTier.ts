import { FoodItem } from "../models/FoodItem";
import { CostTier } from "../models/CostTier";

export function getCostTier(items: FoodItem[]): CostTier {
  const count = items.length;

  if (count < 35) {
    return "low";
  }

  if (count <= 55) {
    return "medium";
  }

  return "high";
}
