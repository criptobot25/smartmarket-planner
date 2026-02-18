import { PlanInput } from "../models/PlanInput";
import { FitnessGoal } from "../models/PlanInput";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "high";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
};

const PROTEIN_MULTIPLIERS: Record<FitnessGoal, number> = {
  cutting: 2.2,
  maintenance: 1.8,
  bulking: 2.0,
};

function getActivityLevel(trains: boolean): ActivityLevel {
  return trains ? "moderate" : "sedentary";
}

export function calculateBmr(input: PlanInput): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return input.sex === "male" ? base + 5 : base - 161;
}

export function calculateTdee(input: PlanInput): number {
  const activity = getActivityLevel(input.trains);
  return calculateBmr(input) * ACTIVITY_MULTIPLIERS[activity];
}

export function calculateMacroTargets(input: PlanInput): {
  caloriesTargetPerDay: number;
  proteinTargetPerDay: number;
  carbsTargetPerDay: number;
  fatTargetPerDay: number;
  proteinPerMeal: number;
  carbsPerMeal: number;
  fatsPerMeal: number;
} {
  const goal: FitnessGoal = input.fitnessGoal || "maintenance";
  const tdee = calculateTdee(input);

  let calories = tdee;
  if (goal === "cutting") {
    calories = tdee * 0.85; // -15%
  } else if (goal === "bulking") {
    calories = tdee * 1.1; // +10%
  }

  // Protein: goal-based g/kg (can be overridden for adaptive loops)
  const baselineProteinTarget = Math.round(input.weightKg * PROTEIN_MULTIPLIERS[goal]);
  const proteinTargetPerDay = Math.max(
    baselineProteinTarget,
    input.proteinTargetPerDay || baselineProteinTarget
  );
  
  // Fats: 25% of calories
  const caloriesFromFat = Math.round(calories * 0.25);
  const fatTargetPerDay = Math.round(caloriesFromFat / 9);
  
  // Carbs: remaining calories
  const caloriesFromProtein = proteinTargetPerDay * 4;
  const remainingCalories = Math.max(0, calories - caloriesFromProtein - caloriesFromFat);
  const carbsTargetPerDay = Math.round(remainingCalories / 4);

  // Per-meal breakdown
  const mealsPerDay = input.mealsPerDay || 3;
  const proteinPerMeal = Math.round(proteinTargetPerDay / mealsPerDay);
  const carbsPerMeal = Math.round(carbsTargetPerDay / mealsPerDay);
  const fatsPerMeal = Math.round(fatTargetPerDay / mealsPerDay);

  return {
    caloriesTargetPerDay: Math.round(calories),
    proteinTargetPerDay,
    carbsTargetPerDay,
    fatTargetPerDay,
    proteinPerMeal,
    carbsPerMeal,
    fatsPerMeal,
  };
}
