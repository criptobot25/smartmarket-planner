import { describe, expect, it } from "vitest";
import { calculateNutritionTargets, resolveFitnessGoal } from "../core/logic/calculateNutritionTargets";
import { calculateMacroPlan } from "../core/logic/MacroPlanner";
import type { PlanInput } from "../core/models/PlanInput";

function buildInput(overrides: Partial<PlanInput> = {}): PlanInput {
  return {
    sex: "male",
    age: 30,
    weightKg: 80,
    heightCm: 180,
    trains: true,
    mealsPerDay: 4,
    dietStyle: "balanced",
    costTier: "medium",
    restrictions: [],
    fitnessGoal: "maintenance",
    ...overrides,
  };
}

describe("calculateNutritionTargets", () => {
  it("applies a valid deficit window for cutting (15-25%)", () => {
    const targets = calculateNutritionTargets(buildInput({ fitnessGoal: "cutting" }));
    const ratio = targets.caloriesPerDay / targets.tdee;

    expect(ratio).toBeGreaterThanOrEqual(0.75);
    expect(ratio).toBeLessThanOrEqual(0.85);
    expect(ratio).toBeCloseTo(0.85, 2);
  });

  it("applies a valid surplus window for bulking (5-15%)", () => {
    const targets = calculateNutritionTargets(buildInput({ fitnessGoal: "bulking" }));
    const ratio = targets.caloriesPerDay / targets.tdee;

    expect(ratio).toBeGreaterThanOrEqual(1.05);
    expect(ratio).toBeLessThanOrEqual(1.15);
    expect(ratio).toBeCloseTo(1.1, 2);
  });

  it("resolves goal by dietStyle when fitnessGoal is omitted", () => {
    expect(resolveFitnessGoal(buildInput({ fitnessGoal: undefined, dietStyle: "healthy" }))).toBe("cutting");
    expect(resolveFitnessGoal(buildInput({ fitnessGoal: undefined, dietStyle: "comfort" }))).toBe("bulking");
    expect(resolveFitnessGoal(buildInput({ fitnessGoal: undefined, dietStyle: "balanced" }))).toBe("maintenance");
  });

  it("respects explicit protein target when above baseline", () => {
    const targets = calculateNutritionTargets(buildInput({ fitnessGoal: "maintenance", proteinTargetPerDay: 220 }));
    expect(targets.proteinPerDay).toBe(220);
  });

  it("keeps macro energy distribution coherent with calorie target", () => {
    const macroPlan = calculateMacroPlan(buildInput({ fitnessGoal: "maintenance", mealsPerDay: 5 }));
    const macroCalories = macroPlan.proteinTargetPerDay * 4 + macroPlan.carbsTargetPerDay * 4 + macroPlan.fatTargetPerDay * 9;

    expect(Math.abs(macroCalories - macroPlan.caloriesTargetPerDay)).toBeLessThanOrEqual(10);
  });

  it("handles edge profile (extreme weight, low height, active training)", () => {
    const targets = calculateNutritionTargets(
      buildInput({
        sex: "female",
        age: 19,
        weightKg: 160,
        heightCm: 140,
        trains: true,
        fitnessGoal: "cutting",
      }),
    );

    expect(Number.isFinite(targets.tdee)).toBe(true);
    expect(targets.caloriesPerDay).toBeGreaterThan(0);
    expect(targets.proteinPerDay).toBeGreaterThan(0);
  });
});
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
