export type FoodCategory = 
  | "vegetables"
  | "fruits"
  | "proteins"
  | "grains"
  | "dairy"
  | "spices"
  | "oils"
  | "beverages"
  | "others";

/**
 * PASSO 24 - Cost tier classification
 * Determines food availability based on user's budget tier
 */
export type CostLevel = "low" | "medium" | "high";

export interface Macros {
  protein: number;  // grams per 100g
  carbs: number;    // grams per 100g
  fat: number;      // grams per 100g
}

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  unit: string;
  pricePerUnit: number;
  quantity: number;
  costLevel: CostLevel;     // PASSO 24: Budget tier classification
  macros?: Macros;
  reason?: string;           // "Breakfast for 7 days", "Lunch protein (14 meals)"
  estimatedPrice?: number;   // quantity * pricePerUnit
}
