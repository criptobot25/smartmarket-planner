import { FitnessGoal, PlanInput } from "../models/PlanInput";

export const ACTIVITY_MULTIPLIER = {
  nonTraining: 1.2,
  training: 1.55,
} as const;

export const GOAL_CALORIE_MULTIPLIER: Record<FitnessGoal, number> = {
  cutting: 0.85,
  maintenance: 1,
  bulking: 1.1,
};

export const GOAL_PROTEIN_PER_KG: Record<FitnessGoal, number> = {
  cutting: 2.2,
  maintenance: 1.8,
  bulking: 2.0,
};

export interface NutritionTargets {
  goal: FitnessGoal;
  bmr: number;
  tdee: number;
  activityMultiplier: number;
  caloriesPerDay: number;
  proteinPerDay: number;
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

export function calculateBmrMifflinStJeor(input: Pick<PlanInput, "sex" | "age" | "weightKg" | "heightCm">): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return input.sex === "male" ? base + 5 : base - 161;
}

export function getActivityMultiplier(trains: boolean): number {
  return trains ? ACTIVITY_MULTIPLIER.training : ACTIVITY_MULTIPLIER.nonTraining;
}

export function calculateNutritionTargets(input: PlanInput): NutritionTargets {
  const goal = resolveFitnessGoal(input);
  const bmr = calculateBmrMifflinStJeor(input);
  const activityMultiplier = getActivityMultiplier(input.trains);
  const tdee = bmr * activityMultiplier;

  const caloriesPerDay = Math.round(tdee * GOAL_CALORIE_MULTIPLIER[goal]);

  const baselineProtein = Math.round(input.weightKg * GOAL_PROTEIN_PER_KG[goal]);
  const proteinPerDay = Math.max(baselineProtein, input.proteinTargetPerDay || baselineProtein);

  return {
    goal,
    bmr,
    tdee,
    activityMultiplier,
    caloriesPerDay,
    proteinPerDay,
  };
}
