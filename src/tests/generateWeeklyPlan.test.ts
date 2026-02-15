import { describe, it, expect } from "vitest";
import { generateWeeklyPlan } from "../core/logic/generateWeeklyPlan";
import { PlanInput } from "../core/models/PlanInput";

function buildInput(mealsPerDay: number): PlanInput {
  return {
    sex: "male",
    age: 30,
    weightKg: 80,
    heightCm: 175,
    trains: true,
    mealsPerDay,
    dietStyle: "balanced",
    budget: 300,
    restrictions: [],
    fitnessGoal: "maintenance",
  };
}

describe("generateWeeklyPlan - meals per day", () => {
  it("should not include snack for 3 meals/day", () => {
    const plan = generateWeeklyPlan(buildInput(3));
    const hasSnack = plan.days.some(day => day.meals.snack !== null);
    expect(hasSnack).toBe(false);
  });

  it("should include snack for 5 meals/day", () => {
    const plan = generateWeeklyPlan(buildInput(5));
    const hasSnack = plan.days.some(day => day.meals.snack !== null);
    expect(hasSnack).toBe(true);
  });
});
