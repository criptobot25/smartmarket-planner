import { FoodItem } from "../../core/models/FoodItem";
import { CATEGORIES } from "../../core/constants/categories";

export function createFoodItem(overrides: Partial<FoodItem> = {}): FoodItem {
  return {
    id: "food-default",
    name: "Default Food",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 5.0,
    quantity: 1.0,
    costLevel: "medium",
    macros: {
      protein: 20,
      carbs: 5,
      fat: 3,
    },
    ...overrides,
  };
}

