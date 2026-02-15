/**
 * PASSO 35 TESTS - Grocery Unit Normalization
 * 
 * Tests the unit conversion system for real-world shopping units.
 * 
 * Coverage:
 * - Yogurt → tubs
 * - Milk → bottles
 * - Tuna → cans
 * - Tomatoes → units (countable)
 * - Oils → bottles
 * - Default conversions (kg/g, L/ml)
 */

import { describe, it, expect } from "vitest";
import {
  normalizeQuantity,
  normalizeFoodItem,
  normalizeShoppingList,
  supportsConversion,
  getSupportedConversions,
  type NormalizedQuantity
} from "../core/utils/QuantityNormalizer";
import type { FoodItem } from "../core/models/FoodItem";

describe("PASSO 35: Grocery Unit Normalization", () => {
  describe("1. Yogurt Normalization (Tubs)", () => {
    it("should convert 1200g yogurt to 6 tubs (200g each)", () => {
      const result = normalizeQuantity("Yogurt (plain)", 1.2, "kg");
      
      expect(result.value).toBe(6);
      expect(result.unit).toBe("tubs");
      expect(result.displayText).toBe("6 tubs (200g each)");
      expect(result.originalValue).toBe(1.2);
      expect(result.originalUnit).toBe("kg");
    });

    it("should convert 400g yogurt to 2 tubs", () => {
      const result = normalizeQuantity("Yogurt (plain)", 400, "g");
      
      expect(result.value).toBe(2);
      expect(result.unit).toBe("tubs");
      expect(result.displayText).toBe("2 tubs (200g each)");
    });

    it("should convert 150g yogurt to 1 tub (round up)", () => {
      const result = normalizeQuantity("Yogurt (plain)", 150, "g");
      
      expect(result.value).toBe(1);
      expect(result.unit).toBe("tubs");
      expect(result.displayText).toBe("1 tub (200g each)");
    });

    it("should handle Greek yogurt similarly", () => {
      const result = normalizeQuantity("Greek yogurt", 600, "g");
      
      expect(result.value).toBe(3);
      expect(result.unit).toBe("tubs");
      expect(result.displayText).toBe("3 tubs (200g each)");
    });
  });

  describe("2. Milk Normalization (Bottles)", () => {
    it("should convert 2L milk to 2 bottles", () => {
      const result = normalizeQuantity("Milk (whole)", 2, "L");
      
      expect(result.value).toBe(2);
      expect(result.unit).toBe("bottles");
      expect(result.displayText).toBe("2 bottles (1L each)");
    });

    it("should convert 1500ml milk to 2 bottles (round up)", () => {
      const result = normalizeQuantity("Milk (whole)", 1.5, "L");
      
      expect(result.value).toBe(2);
      expect(result.unit).toBe("bottles");
      expect(result.displayText).toBe("2 bottles (1L each)");
    });

    it("should convert 750ml milk to 1 bottle", () => {
      const result = normalizeQuantity("Milk (skim)", 750, "ml");
      
      expect(result.value).toBe(1);
      expect(result.unit).toBe("bottles");
      expect(result.displayText).toBe("1 bottle (1L each)");
    });
  });

  describe("3. Canned Foods Normalization", () => {
    it("should convert 360g tuna to 3 cans", () => {
      const result = normalizeQuantity("Tuna (canned)", 360, "g");
      
      expect(result.value).toBe(3);
      expect(result.unit).toBe("cans");
      expect(result.displayText).toBe("3 cans (120g each)");
    });

    it("should convert 240g sardines to 2 cans", () => {
      const result = normalizeQuantity("Sardines (canned)", 240, "g");
      
      expect(result.value).toBe(2);
      expect(result.unit).toBe("cans");
      expect(result.displayText).toBe("2 cans (120g each)");
    });

    it("should round up partial cans", () => {
      const result = normalizeQuantity("Tuna (canned)", 250, "g");
      
      expect(result.value).toBe(3); // 250g needs 3 cans (120g each)
      expect(result.unit).toBe("cans");
    });
  });

  describe("4. Countable Vegetables (Units)", () => {
    it("should convert 300g tomatoes to 2 tomatoes", () => {
      const result = normalizeQuantity("Tomatoes", 300, "g");
      
      expect(result.value).toBe(2);
      expect(result.unit).toBe("units");
      expect(result.displayText).toBe("2 units");
    });

    it("should convert 0.5kg bell peppers to 3 peppers", () => {
      const result = normalizeQuantity("Bell peppers", 0.5, "kg");
      
      expect(result.value).toBe(3); // 500g / 200g = 2.5 → round up to 3
      expect(result.unit).toBe("units");
      expect(result.displayText).toBe("3 units");
    });

    it("should convert 150g onions to 1 onion", () => {
      const result = normalizeQuantity("Onions", 150, "g");
      
      expect(result.value).toBe(1);
      expect(result.unit).toBe("units");
      expect(result.displayText).toBe("1 unit");
    });

    it("should convert 600g broccoli to 2 heads", () => {
      const result = normalizeQuantity("Broccoli", 600, "g");
      
      expect(result.value).toBe(2);
      expect(result.unit).toBe("heads");
      expect(result.displayText).toBe("2 heads");
    });

    it("should convert 50g garlic to 1 head", () => {
      const result = normalizeQuantity("Garlic", 50, "g");
      
      expect(result.value).toBe(1);
      expect(result.unit).toBe("heads");
      expect(result.displayText).toBe("1 head");
    });
  });

  describe("5. Bunched Vegetables", () => {
    it("should convert 400g spinach to 2 bunches", () => {
      const result = normalizeQuantity("Spinach (fresh)", 400, "g");
      
      expect(result.value).toBe(2);
      expect(result.unit).toBe("bunches");
      expect(result.displayText).toBe("2 bunches (200g each)");
    });

    it("should convert 200g kale to 1 bunch", () => {
      const result = normalizeQuantity("Kale", 200, "g");
      
      expect(result.value).toBe(1);
      expect(result.unit).toBe("bunches");
      expect(result.displayText).toBe("1 bunch (200g each)");
    });

    it("should convert 50g parsley to 1 bunch", () => {
      const result = normalizeQuantity("Parsley", 50, "g");
      
      expect(result.value).toBe(1);
      expect(result.unit).toBe("bunches");
      expect(result.displayText).toBe("1 bunch (50g each)");
    });
  });

  describe("6. Oil Normalization (Bottles)", () => {
    it("should convert 1kg olive oil to 2 bottles", () => {
      const result = normalizeQuantity("Olive oil", 1, "kg");
      
      expect(result.value).toBe(2);
      expect(result.unit).toBe("bottles");
      expect(result.displayText).toBe("2 bottles (500g each)");
    });

    it("should convert 400g coconut oil to 1 bottle", () => {
      const result = normalizeQuantity("Coconut oil", 400, "g");
      
      expect(result.value).toBe(1);
      expect(result.unit).toBe("bottles");
      expect(result.displayText).toBe("1 bottle (400g each)");
    });
  });

  describe("7. Countable Fruits", () => {
    it("should convert 360g bananas to 3 bananas", () => {
      const result = normalizeQuantity("Bananas", 360, "g");
      
      expect(result.value).toBe(3);
      expect(result.unit).toBe("units");
      expect(result.displayText).toBe("3 units");
    });

    it("should convert 540g apples to 3 apples", () => {
      const result = normalizeQuantity("Apples", 540, "g");
      
      expect(result.value).toBe(3);
      expect(result.unit).toBe("units");
      expect(result.displayText).toBe("3 units");
    });

    it("should convert 300g avocados to 2 avocados", () => {
      const result = normalizeQuantity("Avocados", 300, "g");
      
      expect(result.value).toBe(2);
      expect(result.unit).toBe("units");
      expect(result.displayText).toBe("2 units");
    });
  });

  describe("8. Default Conversions (No Specific Rule)", () => {
    it("should convert 2.5kg chicken to 2.5kg (default)", () => {
      const result = normalizeQuantity("Chicken breast", 2.5, "kg");
      
      expect(result.value).toBe(2.5);
      expect(result.unit).toBe("kg");
      expect(result.displayText).toBe("2.50kg");
    });

    it("should convert 750g rice to 750g (default)", () => {
      const result = normalizeQuantity("Brown rice", 750, "g");
      
      expect(result.value).toBe(750);
      expect(result.unit).toBe("g");
      expect(result.displayText).toBe("750g");
    });

    it("should convert 1200g oats to 1.2kg (default)", () => {
      const result = normalizeQuantity("Oats (rolled)", 1200, "g");
      
      expect(result.value).toBe(1.2);
      expect(result.unit).toBe("kg");
      expect(result.displayText).toBe("1.20kg");
    });

    it("should detect liquids and use liters (milk without conversion rule)", () => {
      const result = normalizeQuantity("Almond milk", 1500, "ml");
      
      expect(result.value).toBe(1.5);
      expect(result.unit).toBe("L");
      expect(result.displayText).toBe("1.50L");
    });

    it("should detect oils and use liters (oil without conversion rule)", () => {
      const result = normalizeQuantity("Sunflower oil", 750, "ml");
      
      expect(result.value).toBe(750);
      expect(result.unit).toBe("ml");
      expect(result.displayText).toBe("750ml");
    });
  });

  describe("9. FoodItem Normalization", () => {
    it("should normalize a FoodItem with all properties preserved", () => {
      const foodItem: FoodItem = {
        id: "yogurt-1",
        name: "Yogurt (plain)",
        quantity: 1.2,
        unit: "kg",
        category: "dairy",
        pricePerUnit: 2.5,
        costLevel: "medium"
      };

      const normalized = normalizeFoodItem(foodItem);

      expect(normalized.id).toBe("yogurt-1");
      expect(normalized.name).toBe("Yogurt (plain)");
      expect(normalized.normalizedQuantity.value).toBe(6);
      expect(normalized.normalizedQuantity.unit).toBe("tubs");
      expect(normalized.normalizedQuantity.displayText).toBe("6 tubs (200g each)");
    });

    it("should normalize a countable FoodItem", () => {
      const foodItem: FoodItem = {
        id: "tomato-1",
        name: "Tomatoes",
        quantity: 0.3,
        unit: "kg",
        category: "vegetables",
        pricePerUnit: 3.0,
        costLevel: "medium"
      };

      const normalized = normalizeFoodItem(foodItem);

      expect(normalized.normalizedQuantity.value).toBe(2);
      expect(normalized.normalizedQuantity.unit).toBe("units");
      expect(normalized.normalizedQuantity.displayText).toBe("2 units");
    });
  });

  describe("10. Shopping List Normalization", () => {
    it("should normalize entire shopping list", () => {
      const shoppingList: FoodItem[] = [
        {
          id: "yogurt-1",
          name: "Yogurt (plain)",
          quantity: 1.2,
          unit: "kg",
          category: "dairy",
          pricePerUnit: 2.5,
          costLevel: "medium"
        },
        {
          id: "tomato-1",
          name: "Tomatoes",
          quantity: 0.3,
          unit: "kg",
          category: "vegetables",
          pricePerUnit: 3.0,
          costLevel: "medium"
        },
        {
          id: "tuna-1",
          name: "Tuna (canned)",
          quantity: 360,
          unit: "g",
          category: "proteins",
          pricePerUnit: 1.5,
          costLevel: "medium"
        }
      ];

      const normalized = normalizeShoppingList(shoppingList);

      expect(normalized).toHaveLength(3);
      expect(normalized[0].normalizedQuantity.displayText).toBe("6 tubs (200g each)");
      expect(normalized[1].normalizedQuantity.displayText).toBe("2 units");
      expect(normalized[2].normalizedQuantity.displayText).toBe("3 cans (120g each)");
    });

    it("should preserve original quantities in normalized items", () => {
      const shoppingList: FoodItem[] = [
        {
          id: "milk-1",
          name: "Milk (whole)",
          quantity: 2,
          unit: "L",
          category: "dairy",
          pricePerUnit: 1.8,
          costLevel: "low"
        }
      ];

      const normalized = normalizeShoppingList(shoppingList);

      expect(normalized[0].normalizedQuantity.originalValue).toBe(2);
      expect(normalized[0].normalizedQuantity.originalUnit).toBe("L");
      expect(normalized[0].quantity).toBe(2); // Original item unchanged
    });
  });

  describe("11. Conversion Support Queries", () => {
    it("should return list of supported conversions", () => {
      const supported = getSupportedConversions();

      expect(supported).toContain("Yogurt (plain)");
      expect(supported).toContain("Tuna (canned)");
      expect(supported).toContain("Tomatoes");
      expect(supported).toContain("Milk (whole)");
      expect(supported).toContain("Olive oil");
    });

    it("should check if food supports conversion", () => {
      expect(supportsConversion("Yogurt (plain)")).toBe(true);
      expect(supportsConversion("Chicken breast")).toBe(false);
      expect(supportsConversion("Tuna (canned)")).toBe(true);
      expect(supportsConversion("Brown rice")).toBe(false);
    });
  });

  describe("12. Edge Cases & Rounding", () => {
    it("should always round up to ensure enough quantity", () => {
      // 1 tomato weighs 150g, so 151g needs 2 tomatoes
      const result = normalizeQuantity("Tomatoes", 151, "g");
      
      expect(result.value).toBe(2);
      expect(result.unit).toBe("units");
    });

    it("should handle very small quantities", () => {
      const result = normalizeQuantity("Yogurt (plain)", 50, "g");
      
      expect(result.value).toBe(1); // Still need 1 tub
      expect(result.unit).toBe("tubs");
    });

    it("should handle very large quantities", () => {
      const result = normalizeQuantity("Milk (whole)", 10, "L");
      
      expect(result.value).toBe(10);
      expect(result.unit).toBe("bottles");
      expect(result.displayText).toBe("10 bottles (1L each)");
    });

    it("should handle exact package sizes", () => {
      const result = normalizeQuantity("Yogurt (plain)", 600, "g");
      
      expect(result.value).toBe(3); // Exactly 3 tubs
      expect(result.unit).toBe("tubs");
    });
  });

  describe("13. Real-World Shopping Scenarios", () => {
    it("should create realistic grocery list for meal prep", () => {
      const groceryList: FoodItem[] = [
        { id: "1", name: "Yogurt (plain)", quantity: 1.4, unit: "kg", category: "dairy", pricePerUnit: 2.5, costLevel: "medium" },
        { id: "2", name: "Tomatoes", quantity: 0.6, unit: "kg", category: "vegetables", pricePerUnit: 3.0, costLevel: "medium" },
        { id: "3", name: "Bananas", quantity: 0.48, unit: "kg", category: "fruits", pricePerUnit: 2.0, costLevel: "low" },
        { id: "4", name: "Tuna (canned)", quantity: 480, unit: "g", category: "proteins", pricePerUnit: 1.5, costLevel: "medium" },
        { id: "5", name: "Milk (whole)", quantity: 3, unit: "L", category: "dairy", pricePerUnit: 1.8, costLevel: "low" },
        { id: "6", name: "Spinach (fresh)", quantity: 600, unit: "g", category: "vegetables", pricePerUnit: 2.2, costLevel: "medium" }
      ];

      const normalized = normalizeShoppingList(groceryList);

      expect(normalized[0].normalizedQuantity.displayText).toBe("7 tubs (200g each)");
      expect(normalized[1].normalizedQuantity.displayText).toBe("4 units");
      expect(normalized[2].normalizedQuantity.displayText).toBe("4 units");
      expect(normalized[3].normalizedQuantity.displayText).toBe("4 cans (120g each)");
      expect(normalized[4].normalizedQuantity.displayText).toBe("3 bottles (1L each)");
      expect(normalized[5].normalizedQuantity.displayText).toBe("3 bunches (200g each)");
    });

    it("should feel supermarket-native (no decimal grams)", () => {
      const groceryList: FoodItem[] = [
        { id: "1", name: "Bell peppers", quantity: 0.4, unit: "kg", category: "vegetables", pricePerUnit: 4.0, costLevel: "high" },
        { id: "2", name: "Avocados", quantity: 0.45, unit: "kg", category: "fruits", pricePerUnit: 3.5, costLevel: "high" },
        { id: "3", name: "Garlic", quantity: 100, unit: "g", category: "vegetables", pricePerUnit: 5.0, costLevel: "medium" }
      ];

      const normalized = normalizeShoppingList(groceryList);

      // Should show as countable units, not "0.4kg"
      expect(normalized[0].normalizedQuantity.displayText).toBe("2 units");
      expect(normalized[1].normalizedQuantity.displayText).toBe("3 units");
      expect(normalized[2].normalizedQuantity.displayText).toBe("2 heads");
    });
  });

  describe("14. Singular vs Plural Unit Names", () => {
    it("should use singular for 1 item", () => {
      const result1 = normalizeQuantity("Yogurt (plain)", 200, "g");
      expect(result1.displayText).toBe("1 tub (200g each)");

      const result2 = normalizeQuantity("Tomatoes", 150, "g");
      expect(result2.displayText).toBe("1 unit");

      const result3 = normalizeQuantity("Milk (whole)", 1, "L");
      expect(result3.displayText).toBe("1 bottle (1L each)");
    });

    it("should use plural for multiple items", () => {
      const result1 = normalizeQuantity("Yogurt (plain)", 400, "g");
      expect(result1.displayText).toBe("2 tubs (200g each)");

      const result2 = normalizeQuantity("Tomatoes", 300, "g");
      expect(result2.displayText).toBe("2 units");

      const result3 = normalizeQuantity("Milk (whole)", 2, "L");
      expect(result3.displayText).toBe("2 bottles (1L each)");
    });
  });
});
