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

function solveCarbsAndFatsForCalories(calorieTargetPerDay: number, proteinTargetPerDay: number): { carbsTargetPerDay: number; fatsTargetPerDay: number } {
  const remainingCalories = Math.max(0, calorieTargetPerDay - proteinTargetPerDay * 4);
  const desiredFats = (calorieTargetPerDay * 0.25) / 9;

  const maxFats = Math.floor(remainingCalories / 9);
  let bestFats = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let fats = 0; fats <= maxFats; fats += 1) {
    const carbCalories = remainingCalories - fats * 9;
    if (carbCalories < 0) {
      break;
    }

    if (carbCalories % 4 !== 0) {
      continue;
    }

    const distance = Math.abs(fats - desiredFats);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestFats = fats;
    }
  }

  const carbsTargetPerDay = Math.max(0, (remainingCalories - bestFats * 9) / 4);
  return {
    carbsTargetPerDay,
    fatsTargetPerDay: bestFats,
  };
}

export function calculateMacroPlan(input: PlanInput): MacroPlan {
  const nutritionTargets = calculateNutritionTargets(input);
  const calorieTargetPerDay = nutritionTargets.caloriesPerDay;
  const proteinTargetPerDay = nutritionTargets.proteinPerDay;

  const { carbsTargetPerDay, fatsTargetPerDay } = solveCarbsAndFatsForCalories(
    calorieTargetPerDay,
    proteinTargetPerDay,
  );

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
