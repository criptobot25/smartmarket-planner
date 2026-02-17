/**
 * PASSO 31: Personalization Guarantee Test Suite
 * 
 * Ensures that different PlanInputs produce meaningfully different plans.
 * Critical product requirement: No "same list for everyone" syndrome.
 * 
 * Tests verify:
 * - Male bulking ≠ Female cutting
 * - Weight 90kg ≠ Weight 60kg
 * - Trains true ≠ Trains false
 * - Plan fingerprints change with input changes
 * - Recompute guardrail invalidates stale plans
 */

import { describe, it, expect } from "vitest";
import { generateWeeklyPlan } from "../core/logic/generateWeeklyPlan";
import { generateShoppingList } from "../core/logic/generateShoppingList";
import { PlanInput } from "../core/models/PlanInput";
import { generatePlanFingerprint, isPlanValidForInput } from "../core/utils/planFingerprint";
import { createPlanInput } from "./factories/createPlanInput";

describe("PASSO 31 - Personalization Guarantee", () => {
  
  describe("1. Plan Fingerprint System", () => {
    it("should generate different fingerprints for different inputs", () => {
      const input1: PlanInput = {
        fitnessGoal: "bulking",
        sex: "male",
        age: 25,
        weightKg: 90,
        heightCm: 180,
        trains: true,
        mealsPerDay: 4,
        dietStyle: "healthy",
        costTier: "medium",
        restrictions: []
      };

      const input2: PlanInput = {
        fitnessGoal: "cutting",
        sex: "female",
        age: 28,
        weightKg: 60,
        heightCm: 165,
        trains: false,
        mealsPerDay: 3,
        dietStyle: "balanced",
        costTier: "low",
        restrictions: []
      };

      const hash1 = generatePlanFingerprint(input1);
      const hash2 = generatePlanFingerprint(input2);

      expect(hash1).not.toBe(hash2);
      console.log(`✓ Different inputs → Different fingerprints: ${hash1.substring(0, 8)}... ≠ ${hash2.substring(0, 8)}...`);
    });

    it("should generate same fingerprint for identical inputs", () => {
      const input: PlanInput = {
        fitnessGoal: "bulking",
        sex: "male",
        age: 25,
        weightKg: 80,
        heightCm: 180,
        trains: true,
        mealsPerDay: 4,
        dietStyle: "healthy",
        costTier: "medium",
        restrictions: []
      };

      const hash1 = generatePlanFingerprint(input);
      const hash2 = generatePlanFingerprint(input);

      expect(hash1).toBe(hash2);
      console.log(`✓ Identical inputs → Same fingerprint: ${hash1}`);
    });

    it("should detect when single parameter changes", () => {
      const baseInput: PlanInput = {
        fitnessGoal: "maintenance",
        sex: "male",
        age: 30,
        weightKg: 75,
        heightCm: 175,
        trains: false,
        mealsPerDay: 4,
        dietStyle: "balanced",
        costTier: "medium",
        restrictions: []
      };

      // Change only weight
      const changedInput = { ...baseInput, weightKg: 85 };

      const originalHash = generatePlanFingerprint(baseInput);
      const changedHash = generatePlanFingerprint(changedInput);

      expect(originalHash).not.toBe(changedHash);
      console.log(`✓ Weight change detected: 75kg → 85kg changes fingerprint`);
    });

    it("should validate plan against current input", () => {
      const input: PlanInput = {
        fitnessGoal: "bulking",
        sex: "male",
        age: 25,
        weightKg: 80,
        heightCm: 180,
        trains: true,
        mealsPerDay: 4,
        dietStyle: "healthy",
        costTier: "medium",
        restrictions: []
      };

      const plan = generateWeeklyPlan(input);

      // Plan should be valid for its own input
      expect(isPlanValidForInput(plan.planHash, input)).toBe(true);

      // Plan should be invalid for different input
      const differentInput = { ...input, weightKg: 70 };
      expect(isPlanValidForInput(plan.planHash, differentInput)).toBe(false);

      console.log(`✓ Plan validation works correctly`);
    });
  });

  describe("2. Male Bulking vs Female Cutting", () => {
    it("should produce different plans for male bulking vs female cutting", () => {
      const maleBulking: PlanInput = {
        fitnessGoal: "bulking",
        sex: "male",
        age: 25,
        weightKg: 90,
        heightCm: 180,
        trains: true,
        mealsPerDay: 4,
        dietStyle: "healthy",
        costTier: "medium",
        restrictions: []
      };

      const femaleCutting: PlanInput = {
        fitnessGoal: "cutting",
        sex: "female",
        age: 28,
        weightKg: 60,
        heightCm: 165,
        trains: true,
        mealsPerDay: 3,
        dietStyle: "healthy",
        costTier: "medium",
        restrictions: []
      };

      const plan1 = generateWeeklyPlan(maleBulking);
      const plan2 = generateWeeklyPlan(femaleCutting);

      // Plans should have different fingerprints
      expect(plan1.planHash).not.toBe(plan2.planHash);

      // Plans should have different macro targets
      expect(plan1.caloriesTargetPerDay).toBeGreaterThan(plan2.caloriesTargetPerDay);
      expect(plan1.proteinTargetPerDay).toBeGreaterThan(plan2.proteinTargetPerDay);
      expect(plan1.carbsTargetPerDay).toBeGreaterThan(plan2.carbsTargetPerDay);

      // Shopping lists should be different in quantities or items
      const { items: items1 } = generateShoppingList(maleBulking, plan1);
      const { items: items2 } = generateShoppingList(femaleCutting, plan2);

      // Either different foods OR different quantities
      const totalQuantity1 = items1.reduce((sum, item) => sum + item.quantity, 0);
      const totalQuantity2 = items2.reduce((sum, item) => sum + item.quantity, 0);

      // Male bulking should have more food
      expect(totalQuantity1).toBeGreaterThan(totalQuantity2);

      console.log(`✓ Male bulking (${plan1.caloriesTargetPerDay} kcal) ≠ Female cutting (${plan2.caloriesTargetPerDay} kcal)`);
      console.log(`✓ Shopping lists differ: ${items1.length} items (${totalQuantity1.toFixed(2)}kg) vs ${items2.length} items (${totalQuantity2.toFixed(2)}kg)`);
    });
  });

  describe("3. Weight Variation (90kg vs 60kg)", () => {
    it("should produce different plans for different body weights", () => {
      const heavy: PlanInput = {
        fitnessGoal: "bulking",
        sex: "male",
        age: 25,
        weightKg: 90,
        heightCm: 180,
        trains: true,
        mealsPerDay: 4,
        dietStyle: "healthy",
        costTier: "medium",
        restrictions: []
      };

      const light: PlanInput = {
        ...heavy,
        weightKg: 60
      };

      const plan1 = generateWeeklyPlan(heavy);
      const plan2 = generateWeeklyPlan(light);

      // Different fingerprints
      expect(plan1.planHash).not.toBe(plan2.planHash);

      // Higher weight = more calories
      expect(plan1.caloriesTargetPerDay).toBeGreaterThan(plan2.caloriesTargetPerDay);
      
      // Higher weight = more protein
      expect(plan1.proteinTargetPerDay).toBeGreaterThan(plan2.proteinTargetPerDay);

      console.log(`✓ 90kg (${plan1.caloriesTargetPerDay} kcal) > 60kg (${plan2.caloriesTargetPerDay} kcal)`);
      console.log(`✓ 90kg (${plan1.proteinTargetPerDay}g protein) > 60kg (${plan2.proteinTargetPerDay}g protein)`);
    });
  });

  describe("4. Training Status (trains: true vs false)", () => {
    it("should produce different plans for training vs sedentary", () => {
      const training: PlanInput = {
        fitnessGoal: "bulking",
        sex: "male",
        age: 25,
        weightKg: 80,
        heightCm: 180,
        trains: true,
        mealsPerDay: 4,
        dietStyle: "healthy",
        costTier: "medium",
        restrictions: []
      };

      const sedentary: PlanInput = {
        ...training,
        trains: false
      };

      const plan1 = generateWeeklyPlan(training);
      const plan2 = generateWeeklyPlan(sedentary);

      // Different fingerprints
      expect(plan1.planHash).not.toBe(plan2.planHash);

      // Training = more calories
      expect(plan1.caloriesTargetPerDay).toBeGreaterThan(plan2.caloriesTargetPerDay);

      // Training plan should have training days flagged
      const trainingDaysCount1 = plan1.days.filter(d => d.trainingDay).length;
      const trainingDaysCount2 = plan2.days.filter(d => d.trainingDay).length;

      expect(trainingDaysCount1).toBe(4); // 4 training days
      expect(trainingDaysCount2).toBe(0); // No training days

      console.log(`✓ Training (${plan1.caloriesTargetPerDay} kcal, ${trainingDaysCount1} training days) ≠ Sedentary (${plan2.caloriesTargetPerDay} kcal, ${trainingDaysCount2} training days)`);
    });
  });

  describe("5. Budget Tier Variations", () => {
    it("should produce different shopping lists for different budget tiers", () => {
      const lowBudget = createPlanInput({
        fitnessGoal: "maintenance",
        sex: "male",
        age: 30,
        weightKg: 75,
        heightCm: 175,
        trains: false,
        mealsPerDay: 4,
        dietStyle: "balanced",
        costTier: "low",
        restrictions: []
      });

      const highBudget = createPlanInput({
        fitnessGoal: "maintenance",
        sex: "male",
        age: 30,
        weightKg: 75,
        heightCm: 175,
        trains: false,
        mealsPerDay: 4,
        dietStyle: "balanced",
        costTier: "high",
        restrictions: []
      });

      const plan1 = generateWeeklyPlan(lowBudget);
      const plan2 = generateWeeklyPlan(highBudget);

      const { items: items1 } = generateShoppingList(lowBudget, plan1);
      const { items: items2 } = generateShoppingList(highBudget, plan2);

      // Different fingerprints
      expect(plan1.planHash).not.toBe(plan2.planHash);

      // Budget should affect food selection
      const itemNames1 = items1.map(i => i.name);
      const itemNames2 = items2.map(i => i.name);

      // At least some items should be different
      const commonItems = itemNames1.filter(name => itemNames2.includes(name));
      const differentPercentage = 1 - (commonItems.length / Math.max(itemNames1.length, itemNames2.length));

      expect(differentPercentage).toBeGreaterThan(0); // Some difference expected

      console.log(`✓ Budget variation creates ${(differentPercentage * 100).toFixed(0)}% different shopping lists`);
    });
  });

  describe("6. Excluded Foods Personalization", () => {
    it("should produce different plans when excluding foods", () => {
      const noExclusions: PlanInput = {
        fitnessGoal: "bulking",
        sex: "male",
        age: 25,
        weightKg: 80,
        heightCm: 180,
        trains: true,
        mealsPerDay: 4,
        dietStyle: "healthy",
        costTier: "medium",
        restrictions: [],
        excludedFoods: []
      };

      const withExclusions: PlanInput = {
        ...noExclusions,
        excludedFoods: ["Chicken breast (skinless)", "White rice"]
      };

      const plan1 = generateWeeklyPlan(noExclusions);
      const plan2 = generateWeeklyPlan(withExclusions);

      const { items: items2 } = generateShoppingList(withExclusions, plan2);

      // Different fingerprints
      expect(plan1.planHash).not.toBe(plan2.planHash);

      // Excluded foods should not appear in second list
      const names2 = items2.map(i => i.name);
      expect(names2).not.toContain("Chicken breast (skinless)");
      expect(names2).not.toContain("White rice");

      console.log(`✓ Excluded foods properly removed from plan`);
      console.log(`✓ Different foods selected to compensate`);
    });
  });

  describe("7. Meals Per Day Variation", () => {
    it("should produce different plans for 3 vs 5 meals per day", () => {
      const threeMeals: PlanInput = {
        fitnessGoal: "maintenance",
        sex: "male",
        age: 30,
        weightKg: 75,
        heightCm: 175,
        trains: false,
        mealsPerDay: 3,
        dietStyle: "balanced",
        costTier: "medium",
        restrictions: []
      };

      const fiveMeals: PlanInput = {
        ...threeMeals,
        mealsPerDay: 5
      };

      const plan1 = generateWeeklyPlan(threeMeals);
      const plan2 = generateWeeklyPlan(fiveMeals);

      // Different fingerprints
      expect(plan1.planHash).not.toBe(plan2.planHash);

      // Different protein per meal
      expect(plan1.proteinPerMeal).toBeGreaterThan(plan2.proteinPerMeal);

      // 5 meals should include snacks
      const hasSnack1 = plan1.days.some(d => d.meals.snack);
      const hasSnack2 = plan2.days.some(d => d.meals.snack);

      expect(hasSnack1).toBe(false);
      expect(hasSnack2).toBe(true);

      console.log(`✓ 3 meals (${plan1.proteinPerMeal}g/meal) ≠ 5 meals (${plan2.proteinPerMeal}g/meal)`);
      console.log(`✓ 5 meals includes snacks`);
    });
  });

  describe("8. Real-World Personalization Scenarios", () => {
    it("Scenario: Busy professional (3 meals, budget conscious)", () => {
      const input: PlanInput = {
        fitnessGoal: "maintenance",
        sex: "male",
        age: 35,
        weightKg: 75,
        heightCm: 175,
        trains: false,
        mealsPerDay: 3,
        dietStyle: "balanced",
        costTier: "low",
        restrictions: []
      };

      const plan = generateWeeklyPlan(input);
      const { items } = generateShoppingList(input, plan);

      expect(plan.planHash).toBeDefined();
      expect(plan.caloriesTargetPerDay).toBeGreaterThan(1800);
      expect(plan.caloriesTargetPerDay).toBeLessThan(2500);
      expect(items.length).toBeGreaterThan(0);

      console.log(`✓ Professional plan: ${plan.caloriesTargetPerDay} kcal, ${items.length} items`);
    });

    it("Scenario: Athlete (5 meals, high protein, trains)", () => {
      const input: PlanInput = {
        fitnessGoal: "bulking",
        sex: "male",
        age: 22,
        weightKg: 85,
        heightCm: 185,
        trains: true,
        mealsPerDay: 5,
        dietStyle: "healthy",
        costTier: "high",
        restrictions: [],
        proteinTargetPerDay: 200
      };

      const plan = generateWeeklyPlan(input);
      const { items } = generateShoppingList(input, plan);

      expect(plan.planHash).toBeDefined();
      expect(plan.caloriesTargetPerDay).toBeGreaterThan(2500);
      expect(plan.proteinTargetPerDay).toBeGreaterThanOrEqual(150); // Realistic for 85kg bulking
      expect(items.length).toBeGreaterThan(0);

      const trainingDays = plan.days.filter(d => d.trainingDay).length;
      expect(trainingDays).toBe(4);

      console.log(`✓ Athlete plan: ${plan.caloriesTargetPerDay} kcal, ${plan.proteinTargetPerDay}g protein, ${trainingDays} training days`);
    });

    it("Scenario: Weight loss journey (female, cutting, moderate activity)", () => {
      const input: PlanInput = {
        fitnessGoal: "cutting",
        sex: "female",
        age: 32,
        weightKg: 65,
        heightCm: 165,
        trains: true,
        mealsPerDay: 4,
        dietStyle: "healthy",
        costTier: "medium",
        restrictions: [],
        proteinTargetPerDay: 130
      };

      const plan = generateWeeklyPlan(input);
      const { items } = generateShoppingList(input, plan);

      expect(plan.planHash).toBeDefined();
      expect(plan.caloriesTargetPerDay).toBeLessThan(2000); // Cutting = calorie deficit
      expect(plan.proteinTargetPerDay).toBeGreaterThanOrEqual(120);
      expect(items.length).toBeGreaterThan(0);

      console.log(`✓ Weight loss plan: ${plan.caloriesTargetPerDay} kcal (deficit), ${plan.proteinTargetPerDay}g protein`);
    });
  });
});
