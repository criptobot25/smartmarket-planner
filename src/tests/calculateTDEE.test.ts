import { describe, expect, it } from "vitest";
import { calculateBMRMifflinStJeor, calculateTDEE, getActivityLevelFromTraining } from "../core/logic/calculateTDEE";
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

describe("calculateTDEE", () => {
  it("calculates male TDEE with training (moderate activity)", () => {
    const input = buildInput({ sex: "male", trains: true, weightKg: 80, heightCm: 180, age: 30 });
    const result = calculateTDEE(input);

    const expectedBmr = 10 * 80 + 6.25 * 180 - 5 * 30 + 5;
    expect(result.activityLevel).toBe("moderate");
    expect(result.activityMultiplier).toBe(1.55);
    expect(result.bmr).toBe(expectedBmr);
    expect(result.tdee).toBeCloseTo(expectedBmr * 1.55, 6);
  });

  it("calculates female TDEE without training (sedentary activity)", () => {
    const input = buildInput({ sex: "female", trains: false, weightKg: 60, heightCm: 165, age: 25 });
    const result = calculateTDEE(input);

    const expectedBmr = 10 * 60 + 6.25 * 165 - 5 * 25 - 161;
    expect(result.activityLevel).toBe("sedentary");
    expect(result.activityMultiplier).toBe(1.2);
    expect(result.bmr).toBeCloseTo(expectedBmr, 6);
    expect(result.tdee).toBeCloseTo(expectedBmr * 1.2, 6);
  });

  it("maps training flag to supported activity levels", () => {
    expect(getActivityLevelFromTraining(true)).toBe("moderate");
    expect(getActivityLevelFromTraining(false)).toBe("sedentary");
  });

  it("handles edge profile (extreme weight + low height + high training demand) safely", () => {
    const highDemand = buildInput({ weightKg: 170, heightCm: 145, trains: true, age: 21 });
    const lowDemand = buildInput({ weightKg: 170, heightCm: 145, trains: false, age: 21 });

    const highDemandResult = calculateTDEE(highDemand);
    const lowDemandResult = calculateTDEE(lowDemand);

    expect(Number.isFinite(highDemandResult.tdee)).toBe(true);
    expect(highDemandResult.tdee).toBeGreaterThan(0);
    expect(highDemandResult.tdee).toBeGreaterThan(lowDemandResult.tdee);
  });

  it("exposes deterministic BMR by sex", () => {
    const maleBmr = calculateBMRMifflinStJeor({ sex: "male", age: 30, weightKg: 80, heightCm: 180 });
    const femaleBmr = calculateBMRMifflinStJeor({ sex: "female", age: 30, weightKg: 80, heightCm: 180 });

    expect(maleBmr - femaleBmr).toBe(166);
  });
});
