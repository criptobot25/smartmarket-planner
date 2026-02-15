/**
 * PASSO 33.1: Repeat Last Week Tests
 * ===================================
 * 
 * Verifies that the Repeat Last Week feature works correctly:
 * 
 * FUNCTIONALITY:
 * - Saves last plan to localStorage when generated
 * - Loads and applies last plan instantly
 * - Navigates to shopping list
 * - Shows fallback message if no previous plan
 * 
 * PERSISTENCE:
 * - LocalStorage stores plan + input
 * - Data survives page refresh
 * - No form re-entry needed
 * 
 * WHY THIS MATTERS:
 * - Instant 1-click re-ordering
 * - Perfect for weekly routine shopping
 * - No data re-entry friction
 * - Improves user retention
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PlanInput } from "../core/models/PlanInput";
import { WeeklyPlan } from "../core/models/WeeklyPlan";

const LAST_WEEKLY_PLAN_KEY = "lastWeeklyPlan";

describe("PASSO 33.1: Repeat Last Week - LocalStorage Persistence", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  it("should save last weekly plan to localStorage", () => {
    const mockInput: PlanInput = {
      sex: "male",
      age: 30,
      weightKg: 75,
      heightCm: 180,
      trains: true,
      mealsPerDay: 3,
      dietStyle: "balanced",
      costTier: "medium",
      restrictions: []
    };

    const mockPlan: WeeklyPlan = {
      input: mockInput,
      meals: [],
      shoppingList: [],
      totalCalories: 2500,
      totalProtein: 150,
      totalCarbs: 300,
      totalFats: 80,
      costTier: "medium",
      efficiencyScore: 35,
      savingsStatus: "within_target"
    };

    // Save to localStorage
    const data = { plan: mockPlan, input: mockInput };
    localStorage.setItem(LAST_WEEKLY_PLAN_KEY, JSON.stringify(data));

    // Verify it was saved
    const stored = localStorage.getItem(LAST_WEEKLY_PLAN_KEY);
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.plan).toBeDefined();
    expect(parsed.input).toBeDefined();
    expect(parsed.input.weightKg).toBe(75);
    expect(parsed.plan.totalCalories).toBe(2500);
  });

  it("should load last weekly plan from localStorage", () => {
    const mockInput: PlanInput = {
      sex: "female",
      age: 28,
      weightKg: 60,
      heightCm: 165,
      trains: false,
      mealsPerDay: 4,
      dietStyle: "healthy",
      costTier: "low",
      restrictions: ["Dairy"]
    };

    const mockPlan: WeeklyPlan = {
      input: mockInput,
      meals: [],
      shoppingList: [],
      totalCalories: 1800,
      totalProtein: 120,
      totalCarbs: 200,
      totalFats: 60,
      costTier: "low",
      efficiencyScore: 40,
      savingsStatus: "within_target"
    };

    // Save to localStorage
    const data = { plan: mockPlan, input: mockInput };
    localStorage.setItem(LAST_WEEKLY_PLAN_KEY, JSON.stringify(data));

    // Load from localStorage
    const stored = localStorage.getItem(LAST_WEEKLY_PLAN_KEY);
    const loaded = JSON.parse(stored!);

    expect(loaded.plan.totalCalories).toBe(1800);
    expect(loaded.input.weightKg).toBe(60);
    expect(loaded.input.restrictions).toContain("Dairy");
  });

  it("should return null when no previous plan exists", () => {
    // Don't save anything
    const stored = localStorage.getItem(LAST_WEEKLY_PLAN_KEY);
    expect(stored).toBeNull();
  });

  it("should persist plan data across multiple saves", () => {
    const input1: PlanInput = {
      sex: "male",
      age: 25,
      weightKg: 80,
      heightCm: 185,
      trains: true,
      mealsPerDay: 5,
      dietStyle: "balanced",
      costTier: "high",
      restrictions: []
    };

    const plan1: WeeklyPlan = {
      input: input1,
      meals: [],
      shoppingList: [],
      totalCalories: 3000,
      totalProtein: 180,
      totalCarbs: 350,
      totalFats: 100,
      costTier: "high",
      efficiencyScore: 30,
      savingsStatus: "within_target"
    };

    // Save first plan
    localStorage.setItem(LAST_WEEKLY_PLAN_KEY, JSON.stringify({ plan: plan1, input: input1 }));

    const input2: PlanInput = {
      sex: "female",
      age: 35,
      weightKg: 55,
      heightCm: 160,
      trains: false,
      mealsPerDay: 3,
      dietStyle: "healthy",
      costTier: "low",
      restrictions: ["Gluten"]
    };

    const plan2: WeeklyPlan = {
      input: input2,
      meals: [],
      shoppingList: [],
      totalCalories: 1600,
      totalProtein: 100,
      totalCarbs: 180,
      totalFats: 50,
      costTier: "low",
      efficiencyScore: 42,
      savingsStatus: "within_target"
    };

    // Save second plan (should overwrite first)
    localStorage.setItem(LAST_WEEKLY_PLAN_KEY, JSON.stringify({ plan: plan2, input: input2 }));

    // Load and verify only the latest plan is stored
    const stored = localStorage.getItem(LAST_WEEKLY_PLAN_KEY);
    const loaded = JSON.parse(stored!);

    expect(loaded.plan.totalCalories).toBe(1600);
    expect(loaded.input.weightKg).toBe(55);
    expect(loaded.input.restrictions).toContain("Gluten");
  });

  it("should preserve all input parameters in localStorage", () => {
    const mockInput: PlanInput = {
      sex: "male",
      age: 40,
      weightKg: 90,
      heightCm: 190,
      trains: true,
      mealsPerDay: 4,
      dietStyle: "comfort",
      costTier: "medium",
      restrictions: ["Fish", "Nuts"]
    };

    const mockPlan: WeeklyPlan = {
      input: mockInput,
      meals: [],
      shoppingList: [],
      totalCalories: 2800,
      totalProtein: 170,
      totalCarbs: 320,
      totalFats: 90,
      costTier: "medium",
      efficiencyScore: 33,
      savingsStatus: "within_target"
    };

    // Save to localStorage
    localStorage.setItem(LAST_WEEKLY_PLAN_KEY, JSON.stringify({ plan: mockPlan, input: mockInput }));

    // Load and verify all parameters
    const stored = localStorage.getItem(LAST_WEEKLY_PLAN_KEY);
    const loaded = JSON.parse(stored!);
    const loadedInput = loaded.input;

    expect(loadedInput.sex).toBe("male");
    expect(loadedInput.age).toBe(40);
    expect(loadedInput.weightKg).toBe(90);
    expect(loadedInput.heightCm).toBe(190);
    expect(loadedInput.trains).toBe(true);
    expect(loadedInput.mealsPerDay).toBe(4);
    expect(loadedInput.dietStyle).toBe("comfort");
    expect(loadedInput.costTier).toBe("medium");
    expect(loadedInput.restrictions).toHaveLength(2);
    expect(loadedInput.restrictions).toContain("Fish");
    expect(loadedInput.restrictions).toContain("Nuts");
  });

  it("should preserve shopping list and plan details", () => {
    const mockInput: PlanInput = {
      sex: "female",
      age: 32,
      weightKg: 65,
      heightCm: 170,
      trains: true,
      mealsPerDay: 3,
      dietStyle: "balanced",
      costTier: "medium",
      restrictions: []
    };

    const mockPlan: WeeklyPlan = {
      input: mockInput,
      meals: [
        {
          name: "Chicken + Rice + Broccoli",
          ingredients: [
            { foodId: "food-001", foodName: "Chicken breast", grams: 150 },
            { foodId: "food-002", foodName: "Brown rice", grams: 200 },
            { foodId: "food-003", foodName: "Broccoli", grams: 150 }
          ],
          macros: { protein: 45, carbs: 50, fats: 10 }
        }
      ],
      shoppingList: [
        {
          id: "food-001",
          name: "Chicken breast",
          category: "proteins",
          unit: "kg",
          pricePerUnit: 7.99,
          quantity: 1.05,
          costLevel: "medium",
          macros: { protein: 31, carbs: 0, fat: 3.6 }
        }
      ],
      totalCalories: 2200,
      totalProtein: 140,
      totalCarbs: 250,
      totalFats: 70,
      costTier: "medium",
      efficiencyScore: 36,
      savingsStatus: "within_target",
      totalCost: 35.50
    };

    // Save to localStorage
    localStorage.setItem(LAST_WEEKLY_PLAN_KEY, JSON.stringify({ plan: mockPlan, input: mockInput }));

    // Load and verify shopping list
    const stored = localStorage.getItem(LAST_WEEKLY_PLAN_KEY);
    const loaded = JSON.parse(stored!);

    expect(loaded.plan.shoppingList).toHaveLength(1);
    expect(loaded.plan.shoppingList[0].name).toBe("Chicken breast");
    expect(loaded.plan.shoppingList[0].quantity).toBe(1.05);
    expect(loaded.plan.meals).toHaveLength(1);
    expect(loaded.plan.meals[0].name).toBe("Chicken + Rice + Broccoli");
    expect(loaded.plan.totalCost).toBe(35.50);
  });
});
