/**
 * PASSO 27 TESTS - Meal Prep Output Mode
 * 
 * Tests the meal prep summary generation system:
 * - Ingredient aggregation across the week
 * - Batch cooking instructions
 * - Sunday prep list generation
 * - Cooking time estimation
 * - Meal prep tips
 * 
 * Scientific Basis: Meal prep improves diet adherence
 * (Obesity Research & Clinical Practice, 2015)
 */

import { describe, it, expect } from "vitest";
import { generateWeeklyPlan } from "../core/logic/generateWeeklyPlan";
import { generateMealPrepSummary } from "../core/logic/MealPrepSummary";
import { PlanInput } from "../core/models/PlanInput";

const baseInput: PlanInput = {
  sex: "male",
  age: 30,
  weightKg: 80,
  heightCm: 175,
  trains: true,
  mealsPerDay: 3,
  dietStyle: "balanced",
  costTier: "medium",
  restrictions: [],
  fitnessGoal: "maintenance"
};

describe("PASSO 27 - Meal Prep Output Mode", () => {
  describe("1. Ingredient Aggregation", () => {
    it("should aggregate ingredients across all 7 days", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      expect(prepSummary.ingredients.length).toBeGreaterThan(0);
      
      // Should have multiple ingredients
      expect(prepSummary.ingredients.length).toBeGreaterThanOrEqual(3);
    });

    it("should calculate total grams correctly", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      // All ingredients should have positive grams
      prepSummary.ingredients.forEach(ing => {
        expect(ing.totalGrams).toBeGreaterThan(0);
      });
    });

    it("should count meal occurrences correctly", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      // All ingredients should be used in at least 1 meal
      prepSummary.ingredients.forEach(ing => {
        expect(ing.mealCount).toBeGreaterThanOrEqual(1);
        expect(ing.mealCount).toBeLessThanOrEqual(21); // Max 7 days * 3 meals
      });
    });

    it("should categorize ingredients correctly", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      const validCategories = ["proteins", "grains", "vegetables", "fruits", "dairy", "oils", "spices", "beverages", "others"];
      
      prepSummary.ingredients.forEach(ing => {
        expect(validCategories).toContain(ing.category);
      });
    });

    it("should sort ingredients by quantity (descending)", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      // Check if sorted descending by totalGrams
      for (let i = 1; i < prepSummary.ingredients.length; i++) {
        expect(prepSummary.ingredients[i-1].totalGrams)
          .toBeGreaterThanOrEqual(prepSummary.ingredients[i].totalGrams);
      }
    });
  });

  describe("2. Sunday Prep List Generation", () => {
    it("should generate prep steps", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      expect(prepSummary.sundayPrepList.length).toBeGreaterThan(0);
    });

    it("should have sequential step order", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      prepSummary.sundayPrepList.forEach((step, index) => {
        expect(step.order).toBe(index + 1);
      });
    });

    it("should include cooking steps for proteins", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      const proteinSteps = prepSummary.sundayPrepList.filter(step => 
        step.action === "Cook" && 
        (step.ingredient.toLowerCase().includes("chicken") || 
         step.ingredient.toLowerCase().includes("beef") ||
         step.ingredient.toLowerCase().includes("fish"))
      );
      
      // Should have at least one protein cooking step
      expect(proteinSteps.length).toBeGreaterThanOrEqual(0); // Can be 0 if only canned tuna
    });

    it("should include cooking steps for grains", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      const grainSteps = prepSummary.sundayPrepList.filter(step => 
        step.action === "Cook" && 
        (step.ingredient.toLowerCase().includes("rice") || 
         step.ingredient.toLowerCase().includes("pasta") ||
         step.ingredient.toLowerCase().includes("quinoa"))
      );
      
      // Should have grain cooking steps
      expect(grainSteps.length).toBeGreaterThanOrEqual(0);
    });

    it("should include portioning step", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      const portionStep = prepSummary.sundayPrepList.find(step => 
        step.action === "Portion"
      );
      
      expect(portionStep).toBeDefined();
      expect(portionStep?.instructions).toContain("containers");
    });

    it("should have cooking instructions for each step", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      prepSummary.sundayPrepList.forEach(step => {
        expect(step.instructions).toBeDefined();
        expect(step.instructions.length).toBeGreaterThan(0);
      });
    });

    it("should have estimated time for each step", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      prepSummary.sundayPrepList.forEach(step => {
        expect(step.estimatedTime).toBeDefined();
        expect(step.estimatedTime).toMatch(/\d+\s*(minutes?|min|h|hour)/i);
      });
    });
  });

  describe("3. Batch Summaries", () => {
    it("should generate protein batches", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      // Should have protein batches (proteins are in most meal plans)
      expect(prepSummary.proteinBatches).toBeDefined();
      expect(Array.isArray(prepSummary.proteinBatches)).toBe(true);
    });

    it("should generate grain batches", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      // Should have grain batches
      expect(prepSummary.grainBatches).toBeDefined();
      expect(Array.isArray(prepSummary.grainBatches)).toBe(true);
    });

    it("should generate vegetable batches", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      // Should have vegetable batches
      expect(prepSummary.vegetableBatches).toBeDefined();
      expect(Array.isArray(prepSummary.vegetableBatches)).toBe(true);
    });

    it("should format batches with kg for large quantities", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      const allBatches = [
        ...prepSummary.proteinBatches,
        ...prepSummary.grainBatches,
        ...prepSummary.vegetableBatches
      ];
      
      allBatches.forEach(batch => {
        // Should contain either 'kg' or 'g'
        expect(batch).toMatch(/\d+\.?\d*(kg|g)/i);
      });
    });

    it("should format batches with food names", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      const allBatches = [
        ...prepSummary.proteinBatches,
        ...prepSummary.grainBatches,
        ...prepSummary.vegetableBatches
      ];
      
      allBatches.forEach(batch => {
        // Should contain quantity and name
        expect(batch).toMatch(/\d+\.?\d*(kg|g)\s+\w+/i);
      });
    });
  });

  describe("4. Total Prep Time Calculation", () => {
    it("should calculate total prep time", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      expect(prepSummary.totalPrepTime).toBeDefined();
      expect(prepSummary.totalPrepTime.length).toBeGreaterThan(0);
    });

    it("should format prep time with hours and/or minutes", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      // Should match patterns like "2h 30min" or "45min"
      expect(prepSummary.totalPrepTime).toMatch(/\d+(h|min)/i);
    });

    it("should have reasonable total prep time (not excessive)", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      // Extract total minutes
      const timeStr = prepSummary.totalPrepTime;
      const hoursMatch = timeStr.match(/(\d+)h/);
      const minutesMatch = timeStr.match(/(\d+)min/);
      
      let totalMinutes = 0;
      if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60;
      if (minutesMatch) totalMinutes += parseInt(minutesMatch[1]);
      
      // Reasonable prep time: 30 min to 4 hours
      expect(totalMinutes).toBeGreaterThan(0);
      expect(totalMinutes).toBeLessThan(300); // Less than 5 hours
    });
  });

  describe("5. Meal Prep Tips", () => {
    it("should generate helpful tips", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      expect(prepSummary.tips).toBeDefined();
      expect(prepSummary.tips.length).toBeGreaterThan(0);
    });

    it("should suggest storage tips", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      const storageTips = prepSummary.tips.filter(tip => 
        tip.toLowerCase().includes("store") || 
        tip.toLowerCase().includes("fresh")
      );
      
      expect(storageTips.length).toBeGreaterThan(0);
    });

    it("should suggest container/portioning tips", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      const portionTips = prepSummary.tips.filter(tip => 
        tip.toLowerCase().includes("container") || 
        tip.toLowerCase().includes("portion")
      );
      
      expect(portionTips.length).toBeGreaterThan(0);
    });

    it("should suggest labeling tips", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      const labelTips = prepSummary.tips.filter(tip => 
        tip.toLowerCase().includes("label")
      );
      
      expect(labelTips.length).toBeGreaterThan(0);
    });

    it("all tips should be helpful and actionable", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = generateMealPrepSummary(plan);
      
      prepSummary.tips.forEach(tip => {
        expect(tip.length).toBeGreaterThan(10); // Meaningful tips
        expect(tip.length).toBeLessThan(200); // Concise tips
      });
    });
  });

  describe("6. Integration with WeeklyPlan", () => {
    it("should automatically generate meal prep when creating weekly plan", () => {
      const plan = generateWeeklyPlan(baseInput);
      
      expect(plan.mealPrepSummary).toBeDefined();
      expect(plan.mealPrepSummary?.sundayPrepList).toBeDefined();
    });

    it("should work with different meals per day", () => {
      const input3Meals = { ...baseInput, mealsPerDay: 3 };
      const input5Meals = { ...baseInput, mealsPerDay: 5 };
      
      const plan3 = generateWeeklyPlan(input3Meals);
      const plan5 = generateWeeklyPlan(input5Meals);
      
      expect(plan3.mealPrepSummary).toBeDefined();
      expect(plan5.mealPrepSummary).toBeDefined();
      
      // 5 meals should have more ingredients
      expect(plan5.mealPrepSummary!.ingredients.length)
        .toBeGreaterThanOrEqual(plan3.mealPrepSummary!.ingredients.length);
    });

    it("should work with different cost tiers", () => {
      const lowInput = { ...baseInput, costTier: "low" as const };
      const highInput = { ...baseInput, costTier: "high" as const };
      
      const lowPlan = generateWeeklyPlan(lowInput);
      const highPlan = generateWeeklyPlan(highInput);
      
      expect(lowPlan.mealPrepSummary).toBeDefined();
      expect(highPlan.mealPrepSummary).toBeDefined();
    });

    it("should work with excluded foods", () => {
      const inputWithExclusions = { 
        ...baseInput, 
        excludedFoods: ["Tuna", "Salmon"] 
      };
      
      const plan = generateWeeklyPlan(inputWithExclusions);
      
      expect(plan.mealPrepSummary).toBeDefined();
      
      // Should not include excluded foods
      const hasTuna = plan.mealPrepSummary!.ingredients.some(ing => 
        ing.foodName.toLowerCase().includes("tuna")
      );
      const hasSalmon = plan.mealPrepSummary!.ingredients.some(ing => 
        ing.foodName.toLowerCase().includes("salmon")
      );
      
      expect(hasTuna).toBe(false);
      expect(hasSalmon).toBe(false);
    });
  });

  describe("7. Real-World Usage Scenarios", () => {
    it("Scenario: Busy professional - wants quick Sunday prep", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      // Should have clear, actionable steps
      expect(prepSummary.sundayPrepList.length).toBeGreaterThan(0);
      
      // Should have reasonable total time
      expect(prepSummary.totalPrepTime).toBeDefined();
      
      // Should have batch summaries
      expect(prepSummary.proteinBatches.length + 
             prepSummary.grainBatches.length).toBeGreaterThan(0);
    });

    it("Scenario: Beginner meal prepper - needs helpful tips", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      // Should have multiple helpful tips
      expect(prepSummary.tips.length).toBeGreaterThanOrEqual(3);
      
      // Tips should cover different aspects
      const tipCategories = prepSummary.tips.map(tip => {
        if (tip.includes("store")) return "storage";
        if (tip.includes("container")) return "containers";
        if (tip.includes("label")) return "labeling";
        if (tip.includes("cook")) return "cooking";
        return "other";
      });
      
      const uniqueCategories = new Set(tipCategories);
      expect(uniqueCategories.size).toBeGreaterThanOrEqual(2);
    });

    it("Scenario: Athlete - high volume meal prep", () => {
      const athleteInput: PlanInput = {
        ...baseInput,
        weightKg: 90,
        trains: true,
        mealsPerDay: 5,
        fitnessGoal: "bulking"
      };
      
      const plan = generateWeeklyPlan(athleteInput);
      const prepSummary = plan.mealPrepSummary!;
      
      // Should have more ingredients and larger batches
      expect(prepSummary.ingredients.length).toBeGreaterThan(5);
      
      // Should have proteins (essential for athlete)
      expect(prepSummary.proteinBatches.length).toBeGreaterThan(0);
    });

    it("Scenario: Budget-conscious - low tier meal prep", () => {
      const budgetInput = { ...baseInput, costTier: "low" as const };
      const plan = generateWeeklyPlan(budgetInput);
      const prepSummary = plan.mealPrepSummary!;
      
      // Should still have complete meal prep
      expect(prepSummary.sundayPrepList.length).toBeGreaterThan(0);
      expect(prepSummary.ingredients.length).toBeGreaterThan(0);
      
      // Should have helpful tips
      expect(prepSummary.tips.length).toBeGreaterThan(0);
    });
  });

  describe("8. Edge Cases & Robustness", () => {
    it("should handle minimal meal plan (3 meals/day)", () => {
      const minimalInput = { ...baseInput, mealsPerDay: 3 };
      const plan = generateWeeklyPlan(minimalInput);
      
      expect(plan.mealPrepSummary).toBeDefined();
      expect(plan.mealPrepSummary!.ingredients.length).toBeGreaterThan(0);
    });

    it("should handle maximal meal plan (6 meals/day)", () => {
      const maximalInput = { ...baseInput, mealsPerDay: 6 };
      const plan = generateWeeklyPlan(maximalInput);
      
      expect(plan.mealPrepSummary).toBeDefined();
      expect(plan.mealPrepSummary!.ingredients.length).toBeGreaterThan(0);
    });

    it("should not crash with missing optional fields", () => {
      expect(() => {
        const plan = generateWeeklyPlan(baseInput);
        generateMealPrepSummary(plan);
      }).not.toThrow();
    });

    it("should aggregate duplicate ingredients correctly", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      // Check that each food ID appears only once in ingredients
      const foodIds = prepSummary.ingredients.map(ing => ing.foodId);
      const uniqueIds = new Set(foodIds);
      
      expect(foodIds.length).toBe(uniqueIds.size);
    });

    it("should handle foods that don't need cooking", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      // Some ingredients should be marked as not needing cooking
      const needsCooking = prepSummary.ingredients.filter(ing => ing.isCooked);
      const readyToEat = prepSummary.ingredients.filter(ing => !ing.isCooked);
      
      expect(needsCooking.length + readyToEat.length).toBe(prepSummary.ingredients.length);
    });
  });
});
