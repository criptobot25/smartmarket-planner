export type DietStyle = "healthy" | "balanced" | "comfort";
export type FitnessGoal = "cutting" | "maintenance" | "bulking";
export type Sex = "male" | "female";

export interface PlanInput {
  numberOfPeople: number;
  sex: Sex;
  weightKg: number;
  mealsPerDay: number;
  dietStyle: DietStyle;
  budget: number;
  restrictions: string[];
  fitnessGoal?: FitnessGoal;
  proteinTargetPerDay?: number;  // grams per person per day
  excludedFoods?: string[];      // Food names to exclude (e.g., ["tuna", "salmon"] for no fish)
}
