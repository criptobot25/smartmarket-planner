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
  macros?: Macros;
  reason?: string;           // "Breakfast for 7 days", "Lunch protein (14 meals)"
  estimatedPrice?: number;   // quantity * pricePerUnit
}
