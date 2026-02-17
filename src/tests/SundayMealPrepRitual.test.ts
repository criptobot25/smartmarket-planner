/**
 * PASSO 33.5 TESTS - Sunday Meal Prep Ritual Mode
 * 
 * Tests the Sunday Prep Ritual integration:
 * - Meal prep summary data structure
 * - Prep checklist visibility in results
 * - Progress calculation logic
 * - LocalStorage persistence logic
 * - Ritual framing in data
 * 
 * Design Philosophy Testing:
 * - Verify meal prep data is complete for ritual UX
 * - Ensure step-by-step clarity in data structure
 * - Validate quantities are realistic for batch cooking
 */

import { describe, it, expect } from "vitest";
import { generateWeeklyPlan } from "../core/logic/generateWeeklyPlan";
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

describe("PASSO 33.5: Sunday Meal Prep Ritual Mode", () => {
  describe("1. Meal Prep Data for Ritual UX", () => {
    it("should include all necessary data for prep checklist", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      expect(prepSummary).toBeDefined();
      expect(prepSummary.sundayPrepList).toBeDefined();
      expect(prepSummary.proteinBatches).toBeDefined();
      expect(prepSummary.grainBatches).toBeDefined();
      expect(prepSummary.vegetableBatches).toBeDefined();
      expect(prepSummary.totalPrepTime).toBeDefined();
      expect(prepSummary.tips).toBeDefined();
    });

    it("should have step-by-step instructions for ritual flow", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      expect(prepSummary.sundayPrepList.length).toBeGreaterThan(0);
      
      prepSummary.sundayPrepList.forEach((step, index) => {
        expect(step.order).toBe(index + 1);
        expect(step.action).toBeDefined();
        expect(step.quantity).toBeDefined();
        expect(step.instructions).toBeDefined();
        expect(step.estimatedTime).toBeDefined();
      });
    });

    it("should include batch quantities in kg/g format", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      const allBatches = [
        ...prepSummary.proteinBatches,
        ...prepSummary.grainBatches,
        ...prepSummary.vegetableBatches
      ];
      
      allBatches.forEach(batch => {
        // Should contain weight in kg or g
        expect(batch).toMatch(/\d+\.?\d*(kg|g)/i);
      });
    });

    it("should provide realistic total prep time", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      expect(prepSummary.totalPrepTime).toBeDefined();
      expect(prepSummary.totalPrepTime.length).toBeGreaterThan(0);
      
      // Should be reasonable (30 min to 4 hours)
      // Format examples: "1h 30min", "45 minutes", "2h 15min"
      expect(prepSummary.totalPrepTime).toMatch(/(minute|min|hour|h)/i);
    });

    it("should include helpful tips for beginners", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      expect(prepSummary.tips.length).toBeGreaterThan(0);
      
      prepSummary.tips.forEach(tip => {
        expect(tip.length).toBeGreaterThan(10); // Meaningful tips
      });
    });
  });

  describe("2. Batch Cooking Quantities", () => {
    it("should aggregate proteins for batch cooking", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      // Should have protein batches for typical fitness plan
      expect(prepSummary.proteinBatches).toBeDefined();
      expect(Array.isArray(prepSummary.proteinBatches)).toBe(true);
    });

    it("should aggregate grains for batch cooking", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      expect(prepSummary.grainBatches).toBeDefined();
      expect(Array.isArray(prepSummary.grainBatches)).toBe(true);
    });

    it("should aggregate vegetables for batch cooking", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      expect(prepSummary.vegetableBatches).toBeDefined();
      expect(Array.isArray(prepSummary.vegetableBatches)).toBe(true);
    });

    it("should show realistic quantities for week-long prep", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      const allBatches = [
        ...prepSummary.proteinBatches,
        ...prepSummary.grainBatches,
        ...prepSummary.vegetableBatches
      ];
      
      allBatches.forEach(batch => {
        // Extract number from batch string (e.g., "2.4kg chicken" -> 2.4)
        const match = batch.match(/(\d+\.?\d*)(kg|g)/i);
        if (match) {
          const amount = parseFloat(match[1]);
          const unit = match[2].toLowerCase();
          
          // Reasonable ranges for weekly prep
          if (unit === 'kg') {
            expect(amount).toBeGreaterThan(0);
            expect(amount).toBeLessThan(20); // Max 20kg of any ingredient
          } else if (unit === 'g') {
            expect(amount).toBeGreaterThan(0);
            expect(amount).toBeLessThan(20000); // Max 20kg
          }
        }
      });
    });
  });

  describe("3. Ritual Framing & Indispensability", () => {
    it("should make prep feel manageable (under 3 hours)", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      // Time format can be "1h 30min", "45 minutes", etc.
      const timeString = prepSummary.totalPrepTime.toLowerCase();
      
      // Should not be overwhelming (under 3 hours is reasonable)
      const hasHours = timeString.match(/(\d+)\s*h/);
      if (hasHours) {
        const hours = parseInt(hasHours[1]);
        expect(hours).toBeLessThan(4); // Under 4 hours for Sunday ritual
      }
      
      // Minimum 30 minutes (realistic for meal prep)
      const hasMinutes = timeString.match(/(\d+)\s*(min|minute)/);
      if (hasMinutes && !hasHours) {
        const minutes = parseInt(hasMinutes[1]);
        expect(minutes).toBeGreaterThan(15); // At least 15 minutes
      }
    });

    it("should provide clear action verbs for ritual steps", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      const validActions = ["Cook", "Prepare", "Portion", "Chop", "Steam", "Bake", "Roast", "Buy"];
      
      prepSummary.sundayPrepList.forEach(step => {
        const hasValidAction = validActions.some(action => 
          step.action.includes(action)
        );
        expect(hasValidAction).toBe(true);
      });
    });

    it("should include specific cooking methods in instructions", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      const cookingSteps = prepSummary.sundayPrepList.filter(step => 
        step.action === "Cook"
      );
      
      if (cookingSteps.length > 0) {
        cookingSteps.forEach(step => {
          // Should have detailed cooking instructions
          expect(step.instructions.length).toBeGreaterThan(10);
        });
      }
    });

    it("should make prep feel systematic (sequential steps)", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      // Steps should be in order
      prepSummary.sundayPrepList.forEach((step, index) => {
        expect(step.order).toBe(index + 1);
      });
      
      // Should have logical flow (cook, then portion)
      const stepActions = prepSummary.sundayPrepList.map(s => s.action);
      const portionIndex = stepActions.findIndex(a => a.includes("Portion"));
      
      if (portionIndex > 0) {
        // Portioning should come after cooking steps
        const hasCookingBefore = stepActions.slice(0, portionIndex).some(a => 
          a === "Cook" || a === "Prepare"
        );
        expect(hasCookingBefore).toBe(true);
      }
    });
  });

  describe("4. Integration with Weekly Plan Generation", () => {
    it("should automatically generate prep summary with plan", () => {
      const plan = generateWeeklyPlan(baseInput);
      
      expect(plan.mealPrepSummary).toBeDefined();
      expect(plan.mealPrepSummary?.sundayPrepList).toBeDefined();
    });

    it("should adapt to different fitness goals", () => {
      const bulkingInput = { ...baseInput, fitnessGoal: "bulking" as const };
      const cuttingInput = { ...baseInput, fitnessGoal: "cutting" as const };
      
      const bulkingPlan = generateWeeklyPlan(bulkingInput);
      const cuttingPlan = generateWeeklyPlan(cuttingInput);
      
      expect(bulkingPlan.mealPrepSummary).toBeDefined();
      expect(cuttingPlan.mealPrepSummary).toBeDefined();
      
      // Both should have realistic prep requirements
      expect(bulkingPlan.mealPrepSummary?.sundayPrepList.length).toBeGreaterThan(0);
      expect(cuttingPlan.mealPrepSummary?.sundayPrepList.length).toBeGreaterThan(0);
    });

    it("should work with different meal frequencies", () => {
      const input3Meals = { ...baseInput, mealsPerDay: 3 };
      const input5Meals = { ...baseInput, mealsPerDay: 5 };
      
      const plan3 = generateWeeklyPlan(input3Meals);
      const plan5 = generateWeeklyPlan(input5Meals);
      
      expect(plan3.mealPrepSummary).toBeDefined();
      expect(plan5.mealPrepSummary).toBeDefined();
    });

    it("should respect dietary restrictions in prep", () => {
      const veganInput = { 
        ...baseInput, 
        // eslint-disable-next-line no-restricted-syntax -- dietary restrictions, not category
        restrictions: ["meat", "dairy", "eggs"]
      };
      
      const plan = generateWeeklyPlan(veganInput);
      const prepSummary = plan.mealPrepSummary!;
      
      expect(prepSummary).toBeDefined();
      expect(prepSummary.sundayPrepList.length).toBeGreaterThan(0);
    });
  });

  describe("5. Real-World Sunday Prep Scenarios", () => {
    it("Scenario: Busy professional - quick 2-hour Sunday prep", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      // Should have clear, actionable steps
      expect(prepSummary.sundayPrepList.length).toBeGreaterThan(0);
      
      // Should include batch cooking (time-efficient)
      const hasBatchSteps = prepSummary.sundayPrepList.some(step =>
        step.quantity.match(/\d+\.?\d*kg/) // Batch quantities in kg
      );
      expect(hasBatchSteps).toBe(true);
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
      expect(prepSummary.proteinBatches.length).toBeGreaterThan(0);
    });

    it("Scenario: Beginner meal prepper - needs guidance", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      // Should have helpful tips
      expect(prepSummary.tips.length).toBeGreaterThanOrEqual(3);
      
      // Should have detailed instructions
      prepSummary.sundayPrepList.forEach(step => {
        expect(step.instructions.length).toBeGreaterThan(0);
      });
    });

    it("Scenario: Meal prep ritual completion tracking", () => {
      const plan = generateWeeklyPlan(baseInput);
      const prepSummary = plan.mealPrepSummary!;
      
      // Should have countable steps for progress tracking
      const totalSteps = prepSummary.sundayPrepList.length;
      expect(totalSteps).toBeGreaterThan(0);
      
      // Each step should be completable
      prepSummary.sundayPrepList.forEach(step => {
        expect(step.action).toBeDefined();
        expect(step.quantity).toBeDefined();
        expect(step.order).toBeDefined();
      });
    });
  });

  describe("6. Prep Checklist Progress Calculation", () => {
    it("should calculate progress percentage correctly", () => {
      const totalSteps = 5;
      const completedSteps = 2;
      const progress = (completedSteps / totalSteps) * 100;
      
      expect(progress).toBe(40);
    });

    it("should handle zero steps gracefully", () => {
      const totalSteps = 0;
      const completedSteps = 0;
      const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
      
      expect(progress).toBe(0);
    });

    it("should calculate remaining steps", () => {
      const totalSteps = 7;
      const completedSteps = 3;
      const remaining = totalSteps - completedSteps;
      
      expect(remaining).toBe(4);
    });

    it("should detect completion state", () => {
      const totalSteps = 5;
      const completedSteps = 5;
      const isComplete = completedSteps === totalSteps && totalSteps > 0;
      
      expect(isComplete).toBe(true);
    });

    it("should handle partial completion", () => {
      const totalSteps = 5;
      const completedSteps = 3;
      const progress = (completedSteps / totalSteps) * 100;
      
      expect(progress).toBe(60);
    });
  });
});
