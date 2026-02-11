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
  totalCost: number; // Original cost from weekly plan generation
  budgetAdjustedCost: number; // Final cost after budget adjustments
  proteinPerDay: number;  // Protein target in grams per person per day
  // Budget optimization data
  totalProtein?: number; // Total protein in shopping list (grams)
  efficiencyScore?: number; // Protein per euro
  budgetStatus?: 'within_budget' | 'adjusted_to_fit' | 'over_budget_minimum';
  substitutionsApplied?: Array<{
    from: string;
    to: string;
    reason: string;
    savings: number;
    proteinImpact: number;
  }>;
}
