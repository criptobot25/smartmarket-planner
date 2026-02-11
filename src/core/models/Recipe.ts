import { DietStyle } from "./PlanInput";
import { FoodCategory } from "./FoodItem";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface RecipeIngredient {
  foodItemId: string;
  name: string;
  quantity: number;
  unit: string;
  category: FoodCategory;
}

export interface Recipe {
  id: string;
  name: string;
  mealType: MealType;
  servings: number;
  prepTime: number;
  dietStyle: DietStyle[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  tags: string[];
}
