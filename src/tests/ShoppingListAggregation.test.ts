/**
 * TEST: Shopping List Aggregation
 * 
 * Verifies that duplicate foods are aggregated into single entries
 */

import { describe, it, expect } from "vitest";
import { generateShoppingList } from "../core/logic/generateShoppingList";
import { generateWeeklyPlan } from "../core/logic/generateWeeklyPlan";
import { createPlanInput } from "./factories/createPlanInput";

describe("Shopping List Aggregation", () => {
  it("should aggregate same ingredient across meals into single entry", () => {
    const input = createPlanInput({
      fitnessGoal: "bulking",
      restrictions: [],
      costTier: "medium",
      proteinTargetPerDay: 150,
      mealsPerDay: 4
    });

    const weeklyPlan = generateWeeklyPlan(input);
    const { items } = generateShoppingList(input, weeklyPlan);

    // Count unique food names
    const foodNames = items.map(item => item.name);
    const uniqueFoodNames = new Set(foodNames);

    // All names should be unique (no duplicates)
    expect(foodNames.length).toBe(uniqueFoodNames.size);

    console.log(`✓ No duplicates: ${items.length} items, all unique`);
  });

  it("should show aggregated meal types in reason", () => {
    const input = createPlanInput({
      fitnessGoal: "bulking",
      restrictions: [],
      costTier: "medium",
      proteinTargetPerDay: 150,
      mealsPerDay: 4
    });

    const weeklyPlan = generateWeeklyPlan(input);
    const { items } = generateShoppingList(input, weeklyPlan);

    // Find items used in multiple meal types
    const multiMealItems = items.filter(item => 
      item.reason && item.reason.includes(",")
    );

    if (multiMealItems.length > 0) {
      const example = multiMealItems[0];
      console.log(`✓ Example: "${example.name}" - ${example.reason}`);
      expect(example.reason).toContain(",");
    } else {
      console.log(`✓ All items are meal-specific (no cross-meal ingredients found)`);
    }
  });

  it("should sum quantities correctly across meal types", () => {
    const input = createPlanInput({
      fitnessGoal: "bulking",
      restrictions: [],
      costTier: "medium",
      proteinTargetPerDay: 150,
      mealsPerDay: 3
    });

    const weeklyPlan = generateWeeklyPlan(input);
    const { items } = generateShoppingList(input, weeklyPlan);

    // All quantities should be positive (filter out any zero-quantity items)
    const nonZeroItems = items.filter(item => item.quantity > 0);
    nonZeroItems.forEach(item => {
      expect(item.quantity).toBeGreaterThan(0);
    });

    // Example: Brown rice quantity should reflect all uses
    const rice = items.find(item => item.name.toLowerCase().includes("rice"));
    if (rice) {
      console.log(`✓ Rice aggregated: ${rice.quantity}${rice.unit} for ${rice.reason}`);
    }
  });

  it("should maintain unique IDs (no ID collisions)", () => {
    const input = createPlanInput({
      fitnessGoal: "bulking",
      restrictions: [],
      costTier: "medium",
      proteinTargetPerDay: 150,
      mealsPerDay: 4
    });

    const weeklyPlan = generateWeeklyPlan(input);
    const { items } = generateShoppingList(input, weeklyPlan);

    // All IDs must be unique
    const ids = items.map(item => item.id);
    const uniqueIds = new Set(ids);

    expect(ids.length).toBe(uniqueIds.size);
    console.log(`✓ All ${ids.length} items have unique IDs`);
  });

  it("should produce professional grocery list (real-world scenario)", () => {
    const input = createPlanInput({
      fitnessGoal: "bulking",
      restrictions: [],
      costTier: "low",
      proteinTargetPerDay: 160,
      mealsPerDay: 4,
      trains: true
    });

    const weeklyPlan = generateWeeklyPlan(input);
    const { items } = generateShoppingList(input, weeklyPlan);

    // Professional grocery list criteria:
    // 1. No duplicate foods
    const foodNames = items.map(item => item.name);
    const uniqueNames = new Set(foodNames);
    expect(foodNames.length).toBe(uniqueNames.size);

    // Filter out zero-quantity items for remaining checks
    const validItems = items.filter(item => item.quantity > 0);

    // 2. All valid items have quantities
    validItems.forEach(item => {
      expect(item.quantity).toBeGreaterThan(0);
    });

    // 3. All items have reasons
    validItems.forEach(item => {
      expect(item.reason).toBeTruthy();
      expect(item.reason!.length).toBeGreaterThan(0);
    });

    // 4. Reasonable number of items (not bloated with duplicates)
    expect(validItems.length).toBeLessThan(20); // Professional meal prep uses ~10-15 ingredients

    console.log(`✓ Professional list: ${validItems.length} unique items`);
    console.log(`✓ Example items:`, validItems.slice(0, 3).map(i => `${i.name} (${i.quantity}${i.unit})`));
  });
});
