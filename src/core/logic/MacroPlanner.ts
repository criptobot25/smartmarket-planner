import { FitnessGoal, PlanInput } from "../models/PlanInput";
import { calculateNutritionTargets, resolveFitnessGoal as resolveGoalFromNutrition } from "./calculateNutritionTargets";

export interface MacroPlan {
  tdee: number;
  calorieTargetPerDay: number;
  caloriesTargetPerDay: number;
  proteinTargetPerDay: number;
  carbsTargetPerDay: number;
  fatsTargetPerDay: number;
  fatTargetPerDay: number;
  proteinPerMeal: number;
  carbsPerMeal: number;
  fatsPerMeal: number;
}

export function resolveFitnessGoal(input: PlanInput): FitnessGoal {
  return resolveGoalFromNutrition(input);
}

export function calculateMacroPlan(input: PlanInput): MacroPlan {
  const nutritionTargets = calculateNutritionTargets(input);
  const calorieTargetPerDay = nutritionTargets.caloriesPerDay;
  const proteinTargetPerDay = nutritionTargets.proteinPerDay;

  const fatsTargetPerDay = Math.round((calorieTargetPerDay * 0.25) / 9);
  const caloriesFromProtein = proteinTargetPerDay * 4;
  const caloriesFromFats = fatsTargetPerDay * 9;
  const remainingCalories = Math.max(0, calorieTargetPerDay - caloriesFromProtein - caloriesFromFats);
  const carbsTargetPerDay = Math.round(remainingCalories / 4);

  const mealsPerDay = input.mealsPerDay || 3;
  const proteinPerMeal = Math.round(proteinTargetPerDay / mealsPerDay);
  const carbsPerMeal = Math.round(carbsTargetPerDay / mealsPerDay);
  const fatsPerMeal = Math.round(fatsTargetPerDay / mealsPerDay);

  return {
    tdee: Math.round(nutritionTargets.tdee),
    calorieTargetPerDay,
    caloriesTargetPerDay: calorieTargetPerDay,
    proteinTargetPerDay,
    carbsTargetPerDay,
    fatsTargetPerDay,
    fatTargetPerDay: fatsTargetPerDay,
    proteinPerMeal,
    carbsPerMeal,
    fatsPerMeal,
  };
}
