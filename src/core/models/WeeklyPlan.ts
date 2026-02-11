import { FoodItem } from "./FoodItem";
import { PlanInput } from "./PlanInput";

export type DayOfWeek = 
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

/**
 * Refeição simples (não depende de Recipe)
 */
export interface Meal {
  id: string;
  name: string;
  foodIds: string[];  // IDs do mockFoods
  protein: number;    // grams
}

export interface DayMeals {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal | null;
}

export interface DayPlan {
  day: DayOfWeek;
  meals: DayMeals;
}

export interface WeeklyPlan {
  id: string;
  createdAt: Date;
  planInput: PlanInput;
  days: DayPlan[];
  shoppingList: FoodItem[];
  totalCost: number;
  proteinPerDay: number;  // Protein target in grams per person per day
}
