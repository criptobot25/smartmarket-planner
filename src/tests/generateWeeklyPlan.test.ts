import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateWeeklyPlan } from "../core/logic/generateWeeklyPlan";
import { calculateNutritionTargets } from "../core/logic/calculateNutritionTargets";
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
    costTier: "medium",
    restrictions: [],
    fitnessGoal: "maintenance",
  };
}

describe("generateWeeklyPlan - meals per day", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0.123456);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-20T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

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

  it("should keep weekly calories and protein targets aligned with calculated nutrition targets", () => {
    const input = buildInput(4);
    const plan = generateWeeklyPlan(input);
    const targets = calculateNutritionTargets(input);

    expect(plan.caloriesTargetPerDay).toBe(targets.caloriesPerDay);
    expect(plan.proteinTargetPerDay).toBe(targets.proteinPerDay);
    expect(plan.tdee).toBe(Math.round(targets.tdee));
  });

  it("should preserve macro energy consistency", () => {
    const plan = generateWeeklyPlan(buildInput(4));
    const macroCalories = plan.proteinTargetPerDay * 4 + plan.carbsTargetPerDay * 4 + plan.fatTargetPerDay * 9;

    expect(Math.abs(macroCalories - plan.caloriesTargetPerDay)).toBeLessThanOrEqual(10);
  });

  it("should mark 4 training days when trains=true", () => {
    const plan = generateWeeklyPlan(buildInput(4));
    const trainingDays = plan.days.filter((day) => day.trainingDay).map((day) => day.day);

    expect(trainingDays).toEqual(["monday", "wednesday", "thursday", "saturday"]);
  });

  it("should handle edge profile (extreme weight + low height + high training) with valid output", () => {
    const plan = generateWeeklyPlan({
      ...buildInput(5),
      sex: "female",
      age: 20,
      weightKg: 165,
      heightCm: 145,
      trains: true,
      fitnessGoal: "bulking",
    });

    expect(plan.days).toHaveLength(7);
    expect(plan.caloriesTargetPerDay).toBeGreaterThan(0);
    expect(plan.proteinTargetPerDay).toBeGreaterThan(0);
    expect(plan.days.every((day) => day.meals.breakfast.foodIds.length > 0)).toBe(true);
  });
});
