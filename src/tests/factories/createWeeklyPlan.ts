import { WeeklyPlan } from "../../core/models/WeeklyPlan";
import { createPlanInput } from "./createPlanInput";

export function createWeeklyPlan(overrides: Partial<WeeklyPlan> = {}): WeeklyPlan {
  return {
    id: "plan-default",
    createdAt: new Date("2025-01-01"),
    planInput: createPlanInput(),
    days: [],
    shoppingList: [],
    costTier: "medium",
    caloriesTargetPerDay: 2000,
    proteinTargetPerDay: 120,
    carbsTargetPerDay: 200,
    fatTargetPerDay: 60,
    proteinPerMeal: 40,
    carbsPerMeal: 67,
    fatsPerMeal: 20,
    savingsStatus: "within_savings",
    substitutionsApplied: [],
    ...overrides,
  };
}
