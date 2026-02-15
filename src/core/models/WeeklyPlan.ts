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
 * Food portion with calculated grams
 */
export interface FoodPortion {
  foodId: string;
  gramsNeeded: number;
}

/**
 * Refeição simples (não depende de Recipe)
 * Uses portion-based system with calculated grams
 */
export interface Meal {
  id: string;
  name: string;
  foodIds: string[];  // IDs do mockFoods (kept for backwards compatibility)
  portions: FoodPortion[]; // Calculated portions in grams based on macro targets
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
  caloriesTargetPerDay: number;
  proteinTargetPerDay: number;
  carbsTargetPerDay: number;
  fatTargetPerDay: number;
  proteinPerMeal: number;
  carbsPerMeal: number;
  fatsPerMeal: number;
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
