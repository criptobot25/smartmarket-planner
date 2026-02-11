export type DietStyle = "healthy" | "balanced" | "comfort";

export interface PlanInput {
  numberOfPeople: number;
  dietStyle: DietStyle;
  budget: number;
  restrictions: string[];
}
