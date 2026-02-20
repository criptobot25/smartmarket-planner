import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { __adaptiveTestables } from "../contexts/ShoppingPlanContext";
import { calculateNutritionTargets } from "../core/logic/calculateNutritionTargets";
import type { PlanInput } from "../core/models/PlanInput";

function buildInput(overrides: Partial<PlanInput> = {}): PlanInput {
  return {
    sex: "male",
    age: 32,
    weightKg: 82,
    heightCm: 178,
    trains: true,
    mealsPerDay: 5,
    dietStyle: "comfort",
    costTier: "high",
    restrictions: [],
    ...overrides,
  };
}

describe("Adaptive weekly adjustment logic", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("simulates 4 weeks of low adherence and validates calorie adjustment with stable convergence", () => {
    const week0Input = buildInput({ fitnessGoal: undefined, dietStyle: "comfort" });
    const baselineCalories = calculateNutritionTargets(week0Input).caloriesPerDay;

    const weeklyCalories: number[] = [];
    let currentInput = week0Input;

    for (let week = 1; week <= 4; week += 1) {
      const adjusted = __adaptiveTestables.applyAdaptiveAdjustments(
        currentInput,
        { score: 50, level: "low", timestamp: `2026-W${week}` },
        [],
      );

      const calories = calculateNutritionTargets(adjusted).caloriesPerDay;
      weeklyCalories.push(calories);
      currentInput = adjusted;
    }

    // EWMA + hysteresis: first week is buffered, then simplification kicks in.
    expect(weeklyCalories[0]).toBe(baselineCalories);
    expect(weeklyCalories[1]).toBeLessThan(baselineCalories);

    // No instability after activation.
    expect(weeklyCalories[2]).toBe(weeklyCalories[1]);
    expect(weeklyCalories[3]).toBe(weeklyCalories[1]);

    // Input also converges to simplified profile.
    expect(currentInput.dietStyle).toBe("balanced");
    expect(currentInput.costTier).toBe("low");
    expect(currentInput.mealsPerDay).toBe(3);
    expect(currentInput.fitnessGoal).toBe("maintenance");
  });

  it("simulates 4 weeks of high adherence and keeps calorie targets stable", () => {
    const initialInput = buildInput({ fitnessGoal: "maintenance", dietStyle: "balanced", mealsPerDay: 4, costTier: "medium" });
    const baselineCalories = calculateNutritionTargets(initialInput).caloriesPerDay;

    const weeklyCalories: number[] = [];
    let currentInput = initialInput;

    for (let week = 1; week <= 4; week += 1) {
      const adjusted = __adaptiveTestables.applyAdaptiveAdjustments(
        currentInput,
        { score: 95, level: "high", timestamp: `2026-W${week}` },
        [],
      );

      const calories = calculateNutritionTargets(adjusted).caloriesPerDay;
      weeklyCalories.push(calories);
      currentInput = adjusted;
    }

    expect(weeklyCalories).toEqual([baselineCalories, baselineCalories, baselineCalories, baselineCalories]);
    expect(currentInput.mealsPerDay).toBe(initialInput.mealsPerDay);
    expect(currentInput.costTier).toBe(initialInput.costTier);
    expect(currentInput.dietStyle).toBe(initialInput.dietStyle);
  });

  it("does not oscillate under consistent low adherence (bounded step change)", () => {
    const initialInput = buildInput({ fitnessGoal: undefined, dietStyle: "comfort", mealsPerDay: 6, costTier: "high" });

    const states: PlanInput[] = [];
    let currentInput = initialInput;

    for (let week = 1; week <= 4; week += 1) {
      currentInput = __adaptiveTestables.applyAdaptiveAdjustments(
        currentInput,
        { score: 50, level: "low", timestamp: `2026-W${week}` },
        [],
      );
      states.push(currentInput);
    }

    // First week is buffered by smoothing/hysteresis.
    expect(states[0].mealsPerDay).toBe(6);

    // Then bounded and monotonic decrease to floor=3 without bouncing.
    const mealsSeries = states.map((s) => s.mealsPerDay);
    expect(mealsSeries).toEqual([6, 5, 4, 3]);
    expect(Math.min(...mealsSeries)).toBeGreaterThanOrEqual(3);
  });

  it("applies EWMA smoothing with hysteresis counters", () => {
    const state1 = __adaptiveTestables.updateAdherenceSmoothingState({ score: 50, level: "low", timestamp: "2026-W1" });
    const state2 = __adaptiveTestables.updateAdherenceSmoothingState({ score: 50, level: "low", timestamp: "2026-W2" });
    const state3 = __adaptiveTestables.loadAdherenceSmoothingState();

    expect(state1.smoothedScore).toBe(50);
    expect(state1.lowStreak).toBe(1);
    expect(state2.lowStreak).toBe(2);
    expect(state3?.lowStreak).toBe(2);
  });
});
