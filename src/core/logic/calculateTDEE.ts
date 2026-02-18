import { PlanInput, Sex } from "../models/PlanInput";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "high";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
};

export function getActivityLevelFromTraining(trains: boolean): ActivityLevel {
  return trains ? "moderate" : "sedentary";
}

export function calculateBMRMifflinStJeor(input: {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
}): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return input.sex === "male" ? base + 5 : base - 161;
}

export function calculateTDEE(input: PlanInput): {
  bmr: number;
  activityMultiplier: number;
  activityLevel: ActivityLevel;
  tdee: number;
} {
  const activityLevel = getActivityLevelFromTraining(input.trains);
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  const bmr = calculateBMRMifflinStJeor(input);

  return {
    bmr,
    activityMultiplier,
    activityLevel,
    tdee: bmr * activityMultiplier,
  };
}
