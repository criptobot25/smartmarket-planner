import { FoodItem } from "./FoodItem";
import { PlanInput } from "./PlanInput";
import { CostTier } from "./CostTier";

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
  costTier: CostTier; // Low / Medium / High cost tier
  proteinPerDay: number;  // Protein target in grams per person per day
  // Smart Savings optimization data
  totalProtein?: number; // Total protein in shopping list (grams)
  efficiencyScore?: number; // Protein per euro
  savingsStatus?: 'within_savings' | 'adjusted_to_savings' | 'over_savings_minimum';
  substitutionsApplied?: Array<{
    from: string;
    to: string;
    reason: string;
    savings: number;
    proteinImpact: number;
  }>;
}
