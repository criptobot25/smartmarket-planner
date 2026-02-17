import { PlanInput } from "../../core/models/PlanInput";

export function createPlanInput(overrides: Partial<PlanInput> = {}): PlanInput {
  return {
    sex: "male",
    age: 25,
    weightKg: 70,
    heightCm: 175,
    trains: true,
    mealsPerDay: 3,
    dietStyle: "balanced",
    costTier: "medium",
    restrictions: [],
    fitnessGoal: "maintenance",
    excludedFoods: [],
    ...overrides,
  };
}
