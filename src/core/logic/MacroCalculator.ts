import { PlanInput } from "../models/PlanInput";
import { calculateBMRMifflinStJeor, calculateTDEE } from "./calculateTDEE";
import { calculateMacroPlan } from "./MacroPlanner";

export function calculateBmr(input: PlanInput): number {
  return calculateBMRMifflinStJeor(input);
}

export function calculateTdee(input: PlanInput): number {
  return calculateTDEE(input).tdee;
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
  const macroPlan = calculateMacroPlan(input);

  return {
    caloriesTargetPerDay: macroPlan.caloriesTargetPerDay,
    proteinTargetPerDay: macroPlan.proteinTargetPerDay,
    carbsTargetPerDay: macroPlan.carbsTargetPerDay,
    fatTargetPerDay: macroPlan.fatTargetPerDay,
    proteinPerMeal: macroPlan.proteinPerMeal,
    carbsPerMeal: macroPlan.carbsPerMeal,
    fatsPerMeal: macroPlan.fatsPerMeal,
  };
}
