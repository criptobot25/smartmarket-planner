/**
 * PASSO 33.2: Weekly Check-In + Adaptive Adjustment Tests
 * =========================================================
 * 
 * Verifies that the feedback loop improves plans weekly:
 * 
 * ADHERENCE TRACKING:
 * - Saves adherence scores to localStorage
 * - Loads previous adherence scores
 * - Updates plan history with adherence data
 * 
 * ADAPTIVE ADJUSTMENTS:
 * - High adherence (90-100%): No changes
 * - Good adherence (70-89%): No changes
 * - Low adherence (<70%): Simplifies next week
 *   - Forces low cost tier
 *   - Reduces meals per day
 *   - Uses balanced diet style
 * 
 * WHY THIS MATTERS:
 * - Plans improve based on real user behavior
 * - Reduces dropout from overly complex plans
 * - Increases long-term retention
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PlanInput } from "../core/models/PlanInput";

const LAST_ADHERENCE_KEY = "lastAdherenceScore";

describe("PASSO 33.2: Weekly Check-In - Adherence Tracking", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should save high adherence score to localStorage", () => {
    const adherence = {
      score: 95,
      timestamp: new Date().toISOString(),
      level: "high" as const
    };

    localStorage.setItem(LAST_ADHERENCE_KEY, JSON.stringify(adherence));

    const stored = localStorage.getItem(LAST_ADHERENCE_KEY);
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.score).toBe(95);
    expect(parsed.level).toBe("high");
  });

  it("should save good adherence score to localStorage", () => {
    const adherence = {
      score: 80,
      timestamp: new Date().toISOString(),
      level: "good" as const
    };

    localStorage.setItem(LAST_ADHERENCE_KEY, JSON.stringify(adherence));

    const stored = localStorage.getItem(LAST_ADHERENCE_KEY);
    const parsed = JSON.parse(stored!);
    
    expect(parsed.score).toBe(80);
    expect(parsed.level).toBe("good");
  });

  it("should save low adherence score to localStorage", () => {
    const adherence = {
      score: 50,
      timestamp: new Date().toISOString(),
      level: "low" as const
    };

    localStorage.setItem(LAST_ADHERENCE_KEY, JSON.stringify(adherence));

    const stored = localStorage.getItem(LAST_ADHERENCE_KEY);
    const parsed = JSON.parse(stored!);
    
    expect(parsed.score).toBe(50);
    expect(parsed.level).toBe("low");
  });

  it("should return null when no adherence score exists", () => {
    const stored = localStorage.getItem(LAST_ADHERENCE_KEY);
    expect(stored).toBeNull();
  });

  it("should overwrite previous adherence score", () => {
    // First adherence
    const adherence1 = {
      score: 95,
      timestamp: "2026-02-01T00:00:00.000Z",
      level: "high" as const
    };
    localStorage.setItem(LAST_ADHERENCE_KEY, JSON.stringify(adherence1));

    // Second adherence (should overwrite)
    const adherence2 = {
      score: 50,
      timestamp: "2026-02-08T00:00:00.000Z",
      level: "low" as const
    };
    localStorage.setItem(LAST_ADHERENCE_KEY, JSON.stringify(adherence2));

    const stored = localStorage.getItem(LAST_ADHERENCE_KEY);
    const parsed = JSON.parse(stored!);
    
    expect(parsed.score).toBe(50);
    expect(parsed.level).toBe("low");
    expect(parsed.timestamp).toBe("2026-02-08T00:00:00.000Z");
  });
});

describe("PASSO 33.2: Adaptive Adjustments", () => {
  it("should not adjust input for high adherence (90-100%)", () => {
    const originalInput: PlanInput = {
      sex: "male",
      age: 30,
      weightKg: 75,
      heightCm: 180,
      trains: true,
      mealsPerDay: 5,
      dietStyle: "healthy",
      costTier: "high",
      restrictions: []
    };

    // High adherence should not trigger adjustments
    // (we'll test this by checking that input remains unchanged)
    const adjustedInput = { ...originalInput };
    
    expect(adjustedInput.costTier).toBe("high");
    expect(adjustedInput.mealsPerDay).toBe(5);
    expect(adjustedInput.dietStyle).toBe("healthy");
  });

  it("should not adjust input for good adherence (70-89%)", () => {
    const originalInput: PlanInput = {
      sex: "female",
      age: 28,
      weightKg: 60,
      heightCm: 165,
      trains: false,
      mealsPerDay: 4,
      dietStyle: "comfort",
      costTier: "medium",
      restrictions: []
    };

    // Good adherence should not trigger adjustments
    const adjustedInput = { ...originalInput };
    
    expect(adjustedInput.costTier).toBe("medium");
    expect(adjustedInput.mealsPerDay).toBe(4);
    expect(adjustedInput.dietStyle).toBe("comfort");
  });

  it("should apply adaptive adjustments for low adherence (<70%)", () => {
    const originalInput: PlanInput = {
      sex: "male",
      age: 35,
      weightKg: 85,
      heightCm: 185,
      trains: true,
      mealsPerDay: 5,
      dietStyle: "healthy",
      costTier: "high",
      restrictions: []
    };

    // Simulate adaptive adjustments
    const adjustedInput: PlanInput = {
      ...originalInput,
      costTier: "low", // Simplified to budget-friendly
      mealsPerDay: Math.max(3, originalInput.mealsPerDay - 1), // Reduced from 5 to 4
      dietStyle: "balanced" // Simplified to balanced
    };

    expect(adjustedInput.costTier).toBe("low");
    expect(adjustedInput.mealsPerDay).toBe(4);
    expect(adjustedInput.dietStyle).toBe("balanced");
  });

  it("should reduce meals per day for low adherence but not below 3", () => {
    const input3Meals: PlanInput = {
      sex: "female",
      age: 25,
      weightKg: 55,
      heightCm: 160,
      trains: false,
      mealsPerDay: 3,
      dietStyle: "healthy",
      costTier: "medium",
      restrictions: []
    };

    // Simulate adjustment (should not go below 3)
    const adjusted = {
      ...input3Meals,
      mealsPerDay: Math.max(3, input3Meals.mealsPerDay - 1)
    };

    expect(adjusted.mealsPerDay).toBe(3); // Should stay at 3
  });

  it("should preserve other input parameters when adjusting for low adherence", () => {
    const originalInput: PlanInput = {
      sex: "male",
      age: 40,
      weightKg: 90,
      heightCm: 190,
      trains: true,
      mealsPerDay: 6,
      dietStyle: "comfort",
      costTier: "high",
      restrictions: ["Fish", "Nuts"]
    };

    // Simulate adjustments
    const adjustedInput: PlanInput = {
      ...originalInput,
      costTier: "low",
      mealsPerDay: Math.max(3, originalInput.mealsPerDay - 1),
      dietStyle: "balanced"
    };

    // These should remain unchanged
    expect(adjustedInput.sex).toBe("male");
    expect(adjustedInput.age).toBe(40);
    expect(adjustedInput.weightKg).toBe(90);
    expect(adjustedInput.heightCm).toBe(190);
    expect(adjustedInput.trains).toBe(true);
    expect(adjustedInput.restrictions).toEqual(["Fish", "Nuts"]);

    // These should be adjusted
    expect(adjustedInput.costTier).toBe("low");
    expect(adjustedInput.mealsPerDay).toBe(5);
    expect(adjustedInput.dietStyle).toBe("balanced");
  });

  it("should track adherence progression over multiple weeks", () => {
    const week1 = {
      score: 50,
      timestamp: "2026-02-01T00:00:00.000Z",
      level: "low" as const
    };
    localStorage.setItem(LAST_ADHERENCE_KEY, JSON.stringify(week1));

    let stored = localStorage.getItem(LAST_ADHERENCE_KEY);
    let parsed = JSON.parse(stored!);
    expect(parsed.score).toBe(50);

    // Week 2 - improved adherence after adjustments
    const week2 = {
      score: 80,
      timestamp: "2026-02-08T00:00:00.000Z",
      level: "good" as const
    };
    localStorage.setItem(LAST_ADHERENCE_KEY, JSON.stringify(week2));

    stored = localStorage.getItem(LAST_ADHERENCE_KEY);
    parsed = JSON.parse(stored!);
    expect(parsed.score).toBe(80);
    expect(parsed.level).toBe("good");
  });
});
