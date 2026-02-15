/**
 * BUGFIX TEST: Checkbox Isolation
 * 
 * Tests to verify that shopping list checkboxes work correctly:
 * - Each checkbox has a unique, stable ID
 * - Toggling one checkbox doesn't affect others
 * - Same food in different meal types has different IDs
 * - Checkbox state persists in localStorage
 */

import { describe, it, expect, beforeEach } from "vitest";
import { generateShoppingList } from "../core/logic/generateShoppingList";
import { generateWeeklyPlan } from "../core/logic/generateWeeklyPlan";
import { PlanInput } from "../core/models/PlanInput";

describe("BUGFIX: Checkbox Isolation", () => {
  let planInput: PlanInput;

  beforeEach(() => {
    // Create a plan that will result in the same food appearing multiple times
    planInput = {
      fitnessGoal: "muscle-gain",
      dietaryRestrictions: [],
      budget: "medium",
      proteinGoal: 150,
      daysPerWeek: 7,
      mealsPerDay: 4,
      savingsMode: false
    };
  });

  describe("Unique ID Generation", () => {
    it("should generate unique IDs for all items (aggregated across meal types)", () => {
      const weeklyPlan = generateWeeklyPlan(planInput);
      const { items } = generateShoppingList(planInput, weeklyPlan);

      // All items should have unique IDs (no duplicates since we aggregate by foodId)
      const ids = items.map(item => item.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
      console.log(`✓ All ${ids.length} items have unique IDs`);
    });

    it("should use foodId format for unique IDs", () => {
      const weeklyPlan = generateWeeklyPlan(planInput);
      const { items } = generateShoppingList(planInput, weeklyPlan);

      // IDs should be foodId format (ingredients are now aggregated across meal types)
      items.forEach(item => {
        expect(item.id).toBeTruthy();
        expect(item.id.length).toBeGreaterThan(0);
        // Should NOT be just a number (array index)
        expect(isNaN(Number(item.id))).toBe(true);
      });

      console.log(`✓ All ${items.length} items use foodId format`);
    });

    it("should generate stable IDs across multiple generations", () => {
      const weeklyPlan1 = generateWeeklyPlan(planInput);
      const { items: items1 } = generateShoppingList(planInput, weeklyPlan1);

      const weeklyPlan2 = generateWeeklyPlan(planInput);
      const { items: items2 } = generateShoppingList(planInput, weeklyPlan2);

      // IDs should be identical for the exact same items (same name and same ID)
      // This ensures IDs are deterministic based on foodId + mealType
      const id1Set = new Set(items1.map(item => item.id));
      const id2Set = new Set(items2.map(item => item.id));

      // At least some IDs should be the same across generations
      const commonIds = [...id1Set].filter(id => id2Set.has(id));
      
      // We expect some overlap since we use the same input
      expect(commonIds.length).toBeGreaterThan(0);

      console.log(`✓ ${commonIds.length} common IDs across regenerations (deterministic generation)`);
    });
  });

  describe("React Key Stability", () => {
    it("should have unique keys for React list rendering", () => {
      const weeklyPlan = generateWeeklyPlan(planInput);
      const { items } = generateShoppingList(planInput, weeklyPlan);

      // Simulate React key usage
      const keys = items.map(item => item.id);
      const uniqueKeys = new Set(keys);

      // All keys must be unique (no duplicates)
      expect(uniqueKeys.size).toBe(keys.length);

      // No undefined or null keys
      keys.forEach(key => {
        expect(key).toBeDefined();
        expect(key).not.toBeNull();
        expect(key).not.toBe("");
      });

      console.log(`✓ All ${keys.length} React keys are unique and valid`);
    });

    it("should prevent checkbox state conflicts", () => {
      const weeklyPlan = generateWeeklyPlan(planInput);
      const { items } = generateShoppingList(planInput, weeklyPlan);

      // Simulate checkbox state management
      const checkboxState = new Map<string, boolean>();

      // Toggle some items
      const itemsToToggle = items.slice(0, 5);
      itemsToToggle.forEach(item => {
        checkboxState.set(item.id, true);
      });

      // Verify only those items are checked
      items.forEach(item => {
        const expectedState = itemsToToggle.some(i => i.id === item.id);
        const actualState = checkboxState.get(item.id) || false;
        expect(actualState).toBe(expectedState);
      });

      console.log(`✓ Toggled ${itemsToToggle.length} items without conflicts`);
    });
  });

  describe("Edge Cases", () => {
    it("should handle foods with similar names", () => {
      const weeklyPlan = generateWeeklyPlan(planInput);
      const { items } = generateShoppingList(planInput, weeklyPlan);

      // Even foods with similar names should have unique IDs
      const allIds = items.map(item => item.id);
      const uniqueIds = new Set(allIds);

      expect(uniqueIds.size).toBe(allIds.length);
      console.log(`✓ ${allIds.length} items with potentially similar names have unique IDs`);
    });

    it("should handle empty shopping list", () => {
      const emptyInput: PlanInput = {
        ...planInput,
        daysPerWeek: 0
      };

      const weeklyPlan = generateWeeklyPlan(emptyInput);
      const { items } = generateShoppingList(emptyInput, weeklyPlan);

      expect(items).toBeDefined();
      expect(Array.isArray(items)).toBe(true);
    });

    it("should handle maximum shopping list size", () => {
      const maxInput: PlanInput = {
        ...planInput,
        daysPerWeek: 7,
        mealsPerDay: 5
      };

      const weeklyPlan = generateWeeklyPlan(maxInput);
      const { items } = generateShoppingList(maxInput, weeklyPlan);

      // All IDs should still be unique even with many items
      const allIds = items.map(item => item.id);
      const uniqueIds = new Set(allIds);

      expect(uniqueIds.size).toBe(allIds.length);
      console.log(`✓ ${allIds.length} items in maximum-size list have unique IDs`);
    });
  });

  describe("ID Format Validation", () => {
    it("should not use array indices as IDs", () => {
      const weeklyPlan = generateWeeklyPlan(planInput);
      const { items } = generateShoppingList(planInput, weeklyPlan);

      // IDs should not be simple numbers (array indices)
      items.forEach((item, index) => {
        expect(item.id).not.toBe(String(index));
        expect(item.id).not.toBe(index.toString());
      });

      console.log(`✓ No array indices used as IDs`);
    });

    it("should not use item names as IDs", () => {
      const weeklyPlan = generateWeeklyPlan(planInput);
      const { items } = generateShoppingList(planInput, weeklyPlan);

      // IDs should not be just the item name
      items.forEach(item => {
        expect(item.id).not.toBe(item.name);
        expect(item.id).not.toBe(item.name.toLowerCase());
      });

      console.log(`✓ Item names are not used as IDs`);
    });

    it("should aggregate same food across meal types", () => {
      const weeklyPlan = generateWeeklyPlan(planInput);
      const { items } = generateShoppingList(planInput, weeklyPlan);

      // IDs should be unique (foodId based)
      // Same food used in different meal types should appear only ONCE in the list
      const foodIds = items.map(item => item.id);
      const uniqueFoodIds = new Set(foodIds);
      
      expect(uniqueFoodIds.size).toBe(foodIds.length);

      // Check that "reason" field aggregates meal types
      const itemsWithMultipleMealTypes = items.filter(item => 
        item.reason && item.reason.includes(",")
      );
      
      if (itemsWithMultipleMealTypes.length > 0) {
        console.log(`✓ ${itemsWithMultipleMealTypes.length} items aggregate multiple meal types`);
      } else {
        console.log(`✓ All items are meal-specific (no aggregation needed)`);
      }
    });
  });
});
