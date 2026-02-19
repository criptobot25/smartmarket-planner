import { describe, expect, it } from "vitest";
import { calculateNutritionTargets } from "../core/logic/calculateNutritionTargets";
import type { PlanInput } from "../core/models/PlanInput";

describe("calculateNutritionTargets", () => {
  it("uses Mifflin-St Jeor with training multiplier for cutting", () => {
    const input: PlanInput = {
      sex: "male",
      age: 30,
      weightKg: 80,
      heightCm: 180,
      trains: true,
      mealsPerDay: 4,
      dietStyle: "balanced",
      costTier: "medium",
      restrictions: [],
      fitnessGoal: "cutting",
    };

    const targets = calculateNutritionTargets(input);

    expect(targets.bmr).toBe(1780);
    expect(targets.activityMultiplier).toBe(1.55);
    expect(targets.tdee).toBe(2759);
    expect(targets.caloriesPerDay).toBe(2345);
    expect(targets.proteinPerDay).toBe(176);
  });

  it("uses sedentary multiplier and surplus for bulking", () => {
    const input: PlanInput = {
      sex: "female",
      age: 25,
      weightKg: 60,
      heightCm: 165,
      trains: false,
      mealsPerDay: 3,
      dietStyle: "comfort",
      costTier: "low",
      restrictions: [],
      fitnessGoal: "bulking",
    };

    const targets = calculateNutritionTargets(input);

    expect(targets.bmr).toBeCloseTo(1345.25, 2);
    expect(targets.activityMultiplier).toBe(1.2);
    expect(targets.tdee).toBeCloseTo(1614.3, 1);
    expect(targets.caloriesPerDay).toBe(1776);
    expect(targets.proteinPerDay).toBe(120);
  });
});
