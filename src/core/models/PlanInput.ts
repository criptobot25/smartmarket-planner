export type DietStyle = "healthy" | "balanced" | "comfort";
export type FitnessGoal = "cutting" | "maintenance" | "bulking";

export interface PlanInput {
  numberOfPeople: number;
  dietStyle: DietStyle;
  budget: number;
  restrictions: string[];
  fitnessGoal?: FitnessGoal;
  proteinTargetPerDay?: number;  // grams per person per day
}
