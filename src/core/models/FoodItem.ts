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

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  unit: string;
  pricePerUnit: number;
  quantity: number;
}
