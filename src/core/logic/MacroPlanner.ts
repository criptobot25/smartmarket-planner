import { FitnessGoal, PlanInput } from "../models/PlanInput";
import { calculateTDEE } from "./calculateTDEE";

const GOAL_CALORIE_MULTIPLIER: Record<FitnessGoal, number> = {
  cutting: 0.85,
  maintenance: 1,
  bulking: 1.1,
};

const GOAL_PROTEIN_PER_KG: Record<FitnessGoal, number> = {
  cutting: 2.2,
  maintenance: 1.8,
  bulking: 2.0,
};

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
  if (input.fitnessGoal) {
    return input.fitnessGoal;
  }

  if (input.dietStyle === "healthy") {
    return "cutting";
  }

  if (input.dietStyle === "comfort") {
    return "bulking";
  }

  return "maintenance";
}

export function calculateMacroPlan(input: PlanInput): MacroPlan {
  const { tdee } = calculateTDEE(input);
  const goal = resolveFitnessGoal(input);

  const calorieTargetPerDay = Math.round(tdee * GOAL_CALORIE_MULTIPLIER[goal]);

  const baselineProtein = Math.round(input.weightKg * GOAL_PROTEIN_PER_KG[goal]);
  const proteinTargetPerDay = Math.max(baselineProtein, input.proteinTargetPerDay || baselineProtein);

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
    tdee: Math.round(tdee),
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
