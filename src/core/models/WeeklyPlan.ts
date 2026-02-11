import { Recipe } from "./Recipe";
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

export interface DayMeals {
  breakfast: Recipe | null;
  lunch: Recipe | null;
  dinner: Recipe | null;
  snack: Recipe | null;
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
}
