import { describe, it, expect } from "vitest";
import { buildMeal } from "../core/logic/MealBuilder";
import {
  FoodRotationEngine,
  classifyProteinRotationGroup,
  classifyCarbRotationGroup,
  getRotationNoise,
} from "../core/logic/FoodRotation";
import { VarietyTracker } from "../core/logic/VarietyConstraints";
import { generateWeeklyPlan } from "../core/logic/generateWeeklyPlan";
import { CATEGORIES } from "../core/constants/categories";
import { mockFoods } from "../data/mockFoods";
import type { PlanInput } from "../core/models/PlanInput";

describe("FoodRotationEngine", () => {
  it("should enforce max 2 usage per food", () => {
    const engine = new FoodRotationEngine();

    expect(engine.canUseFood("Chicken breast (skinless)")).toBe(true);
    engine.recordFood(mockFoods.find(f => f.name === "Chicken breast (skinless)")!);
    engine.recordFood(mockFoods.find(f => f.name === "Chicken breast (skinless)")!);
    expect(engine.canUseFood("Chicken breast (skinless)")).toBe(false);
  });

  it("should classify protein groups correctly", () => {
    expect(classifyProteinRotationGroup("Chicken breast")).toBe("chicken");
    expect(classifyProteinRotationGroup("Lean ground beef")).toBe("beef");
    expect(classifyProteinRotationGroup("Salmon fillet")).toBe("fish");
    expect(classifyProteinRotationGroup("Eggs (large)")).toBe("eggs");
    expect(classifyProteinRotationGroup("Tofu (firm)")).toBe("vegetarian");
  });

  it("should classify carb groups correctly", () => {
    expect(classifyCarbRotationGroup("White rice")).toBe("rice");
    expect(classifyCarbRotationGroup("Pasta (whole wheat)")).toBe("pasta");
    expect(classifyCarbRotationGroup("Oats (rolled)")).toBe("oats");
    expect(classifyCarbRotationGroup("Sweet potato")).toBe("potatoes");
  });

  it("should generate deterministic noise from seed", () => {
    const a = getRotationNoise("Chicken", "user-a-week-10");
    const b = getRotationNoise("Chicken", "user-a-week-10");
    const c = getRotationNoise("Chicken", "user-a-week-11");

    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});

describe("Food Rotation integration in MealBuilder", () => {
  const macroTargets = { protein: 40, carbs: 50, fats: 15 };

  it("should rotate proteins and carbs while keeping vegetables diverse", () => {
    const varietyTracker = new VarietyTracker();
    const foodRotation = new FoodRotationEngine();

    const proteins = new Set<string>();
    const proteinGroups = new Set<string>();
    const carbGroups = new Set<string>();
    const vegetables = new Set<string>();
    const proteinUsage = new Map<string, number>();
    const carbUsage = new Map<string, number>();

    for (let i = 0; i < 14; i++) {
      const meal = buildMeal({
        macroTargetsPerMeal: macroTargets,
        availableFoods: mockFoods,
        excludedFoods: [],
        costTier: "medium",
        varietyTracker,
        foodRotation,
        rotationSeed: `same-user-week-10-meal-${i}`,
      });

      meal.ingredients.forEach(ingredient => {
        const food = mockFoods.find(f => f.id === ingredient.foodId);
        if (!food) return;

        if (food.category === CATEGORIES.protein) {
          proteins.add(food.name);
          proteinGroups.add(classifyProteinRotationGroup(food.name));
          proteinUsage.set(food.name, (proteinUsage.get(food.name) || 0) + 1);
        }

        if (
          food.category === CATEGORIES.grains ||
          (food.category === CATEGORIES.vegetables && (food.macros?.carbs || 0) >= 15)
        ) {
          carbGroups.add(classifyCarbRotationGroup(food.name));
          carbUsage.set(food.name, (carbUsage.get(food.name) || 0) + 1);
        }

        if (food.category === CATEGORIES.vegetables && (food.macros?.carbs || 0) < 15) {
          vegetables.add(food.name);
        }
      });
    }

    expect(proteins.size).toBeGreaterThanOrEqual(4);
    expect(proteinGroups.size).toBeGreaterThanOrEqual(3);
    expect(carbGroups.size).toBeGreaterThanOrEqual(3);
    expect(vegetables.size).toBeGreaterThanOrEqual(5);

    // Rule enforcement on primary rotation sources
    const maxProteinUsage = Math.max(...Array.from(proteinUsage.values()));
    const maxCarbUsage = Math.max(...Array.from(carbUsage.values()));
    expect(maxProteinUsage).toBeLessThanOrEqual(2);
    expect(maxCarbUsage).toBeLessThanOrEqual(2);
  });
});

describe("Acceptance criteria - user-level variation", () => {
  const baseInput: PlanInput = {
    sex: "male",
    age: 30,
    weightKg: 78,
    heightCm: 178,
    trains: true,
    mealsPerDay: 4,
    dietStyle: "balanced",
    costTier: "medium",
    restrictions: [],
    fitnessGoal: "maintenance",
  };

  it("different users should receive different weekly food selections", () => {
    const userAPlan = generateWeeklyPlan(baseInput);
    const userBPlan = generateWeeklyPlan({
      ...baseInput,
      age: 36,
      weightKg: 92,
      heightCm: 186,
      sex: "female",
    });

    const sequenceA = userAPlan.days.map(day => `${day.meals.breakfast.name}|${day.meals.lunch.name}|${day.meals.dinner.name}`);
    const sequenceB = userBPlan.days.map(day => `${day.meals.breakfast.name}|${day.meals.lunch.name}|${day.meals.dinner.name}`);

    expect(sequenceA).not.toEqual(sequenceB);
  });

  it("same user should get automatic variation when week seed changes", () => {
    const buildWeekMeals = (weekSeed: string) => {
      const varietyTracker = new VarietyTracker();
      const foodRotation = new FoodRotationEngine();

      const names: string[] = [];
      for (let i = 0; i < 9; i++) {
        const meal = buildMeal({
          macroTargetsPerMeal: { protein: 40, carbs: 50, fats: 15 },
          availableFoods: mockFoods,
          excludedFoods: [],
          costTier: "medium",
          varietyTracker,
          foodRotation,
          rotationSeed: `${weekSeed}-meal-${i}`,
        });
        names.push(meal.name);
      }
      return names;
    };

    const weekA = buildWeekMeals("user-1-2026-W07");
    const weekB = buildWeekMeals("user-1-2026-W08");

    expect(weekA).not.toEqual(weekB);
  });
});

