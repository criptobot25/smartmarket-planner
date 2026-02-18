export type DietStyle = "healthy" | "balanced" | "comfort";
export type FitnessGoal = "cutting" | "maintenance" | "bulking";
export type Sex = "male" | "female";
export type CostTier = "low" | "medium" | "high";

export interface PlanInput {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  trains: boolean;
  mealsPerDay: number;
  dietStyle: DietStyle;
  costTier: CostTier;
  restrictions: string[];
  // Mandatory in onboarding flow; optional here for backward compatibility in legacy tests/data.
  fitnessGoal?: FitnessGoal;
  proteinTargetPerDay?: number;  // grams per person per day
  excludedFoods?: string[];      // Food names to exclude (e.g., ["tuna", "salmon"] for no fish)
}
