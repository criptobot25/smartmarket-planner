import { describe, expect, it } from "vitest";
import { CATEGORIES } from "../core/constants/categories";
import { __shoppingListTestables } from "../core/logic/generateShoppingList";
import type { FoodItem } from "../core/models/FoodItem";

const macroScale = { protein: 1, carbs: 1, fats: 1 };

describe("generateShoppingList helpers", () => {
  it("covers quantity heuristics for multiple categories and special-case foods", () => {
    const proteinFood: FoodItem = {
      id: "p1",
      name: "Chicken Breast",
      category: CATEGORIES.protein,
      unit: "kg",
      pricePerUnit: 10,
      quantity: 0,
      macros: { protein: 31, carbs: 0, fat: 3.6 },
    };

    const eggsFood: FoodItem = {
      id: "p2",
      name: "Eggs",
      category: CATEGORIES.protein,
      unit: "pack",
      pricePerUnit: 3,
      quantity: 0,
      macros: { protein: 13, carbs: 1, fat: 11 },
    };

    const tunaFood: FoodItem = {
      id: "p3",
      name: "Tuna in water",
      category: CATEGORIES.protein,
      unit: "can",
      pricePerUnit: 1.5,
      quantity: 0,
      macros: { protein: 25, carbs: 0, fat: 1 },
    };

    const grainsFood: FoodItem = {
      id: "g1",
      name: "Brown rice",
      category: CATEGORIES.grains,
      unit: "kg",
      pricePerUnit: 2,
      quantity: 0,
      macros: { protein: 2.6, carbs: 23, fat: 0.9 },
    };

    const fruitPack: FoodItem = {
      id: "f1",
      name: "Berries",
      category: CATEGORIES.fruits,
      unit: "pack",
      pricePerUnit: 4,
      quantity: 0,
      macros: { protein: 1, carbs: 14, fat: 0.3 },
    };

    const dairyLiter: FoodItem = {
      id: "d1",
      name: "Milk",
      category: CATEGORIES.dairy,
      unit: "L",
      pricePerUnit: 1.2,
      quantity: 0,
      macros: { protein: 3.4, carbs: 5, fat: 1.5 },
    };

    const fatsFood: FoodItem = {
      id: "o1",
      name: "Olive oil",
      category: CATEGORIES.fats,
      unit: "L",
      pricePerUnit: 8,
      quantity: 0,
      macros: { protein: 0, carbs: 0, fat: 100 },
    };

    const snackJar: FoodItem = {
      id: "s1",
      name: "Peanut butter",
      category: CATEGORIES.snacks,
      unit: "jar",
      pricePerUnit: 5,
      quantity: 0,
      macros: { protein: 25, carbs: 20, fat: 50 },
    };

    const otherFood: FoodItem = {
      id: "x1",
      name: "Salt",
      category: CATEGORIES.others,
      unit: "g",
      pricePerUnit: 0.01,
      quantity: 0,
      macros: { protein: 0, carbs: 0, fat: 0 },
    };

    expect(__shoppingListTestables.calculateRealisticQuantity(proteinFood, "lunch", 4, 4, macroScale)).toBeGreaterThan(0);
    expect(__shoppingListTestables.calculateRealisticQuantity(eggsFood, "breakfast", 4, 4, macroScale)).toBeCloseTo(1, 2);
    expect(__shoppingListTestables.calculateRealisticQuantity(tunaFood, "lunch", 3, 4, macroScale)).toBe(3);
    expect(__shoppingListTestables.calculateRealisticQuantity(grainsFood, "dinner", 5, 5, macroScale)).toBeGreaterThan(0);
    expect(__shoppingListTestables.calculateRealisticQuantity(fruitPack, "snack", 2, 5, macroScale)).toBeGreaterThan(0);
    expect(__shoppingListTestables.calculateRealisticQuantity(dairyLiter, "breakfast", 3, 4, macroScale)).toBeGreaterThan(0);
    expect(__shoppingListTestables.calculateRealisticQuantity(fatsFood, "dinner", 4, 4, macroScale)).toBeGreaterThan(0);
    expect(__shoppingListTestables.calculateRealisticQuantity(snackJar, "snack", 4, 5, macroScale)).toBeGreaterThan(0);
    expect(__shoppingListTestables.calculateRealisticQuantity(otherFood, "dinner", 2, 4, macroScale)).toBeGreaterThan(0);
  });

  it("builds reason text for single and multi meal types", () => {
    const food: FoodItem = {
      id: "p1",
      name: "Chicken",
      category: CATEGORIES.protein,
      unit: "kg",
      pricePerUnit: 10,
      quantity: 1,
      macros: { protein: 31, carbs: 0, fat: 3.6 },
    };

    const single = __shoppingListTestables.generateReasonFromMealTypes(food, ["lunch"], 1);
    const multiple = __shoppingListTestables.generateReasonFromMealTypes(food, ["breakfast", "dinner"], 4);

    expect(single).toContain("Lunch");
    expect(single).toContain("(1 meal)");
    expect(multiple).toContain("Breakfast, Dinner");
    expect(multiple).toContain("for 4 meals");

    const singleMany = __shoppingListTestables.generateReasonFromMealTypes(food, ["dinner"], 3);
    expect(singleMany).toContain("Dinner");
    expect(singleMany).toContain("for 3 meals");
  });

  it("covers legacy _generateReason helper branch behavior", () => {
    const proteinFood: FoodItem = {
      id: "p1",
      name: "Chicken",
      category: CATEGORIES.protein,
      unit: "kg",
      pricePerUnit: 10,
      quantity: 1,
      macros: { protein: 31, carbs: 0, fat: 3.6 },
    };

    const otherFood: FoodItem = {
      id: "o1",
      name: "Spice Mix",
      category: CATEGORIES.others,
      unit: "g",
      pricePerUnit: 0.05,
      quantity: 20,
      macros: { protein: 0, carbs: 0, fat: 0 },
    };

    const once = __shoppingListTestables._generateReason(proteinFood, "lunch", 1);
    const many = __shoppingListTestables._generateReason(otherFood, "dinner", 5);

    expect(once).toBe("Lunch protein (1 meal)");
    expect(many).toBe("Dinner seasoning (5 meals)");
  });

  it("converts and reconverts base quantities correctly", () => {
    expect(__shoppingListTestables.toBaseQuantity(2, "kg")).toEqual({ quantity: 2000, unit: "g" });
    expect(__shoppingListTestables.toBaseQuantity(1.5, "L")).toEqual({ quantity: 1500, unit: "ml" });
    expect(__shoppingListTestables.fromBaseQuantity(2200, "g")).toEqual({ quantity: 2.2, unit: "kg" });
    expect(__shoppingListTestables.fromBaseQuantity(1250, "ml")).toEqual({ quantity: 1.25, unit: "L" });
    expect(__shoppingListTestables.fromBaseQuantity(123.456, "g")).toEqual({ quantity: 123.46, unit: "g" });
  });

  it("consolidates duplicated items by normalized name/category", () => {
    const items: FoodItem[] = [
      {
        id: "1",
        name: "Chicken Breast",
        category: CATEGORIES.protein,
        unit: "kg",
        pricePerUnit: 10,
        quantity: 1,
        estimatedPrice: 10,
        reason: "Lunch protein for 3 meals",
        macros: { protein: 31, carbs: 0, fat: 3.6 },
      },
      {
        id: "2",
        name: " chicken breast ",
        category: CATEGORIES.protein,
        unit: "kg",
        pricePerUnit: 10,
        quantity: 0.5,
        estimatedPrice: 5,
        reason: "Dinner protein for 2 meals",
        macros: { protein: 31, carbs: 0, fat: 3.6 },
      },
      {
        id: "3",
        name: "Milk",
        category: CATEGORIES.dairy,
        unit: "L",
        pricePerUnit: 1.2,
        quantity: 0.5,
        estimatedPrice: 0.6,
        reason: "Breakfast dairy for 2 meals",
        macros: { protein: 3.4, carbs: 5, fat: 1.5 },
      },
      {
        id: "4",
        name: "Milk",
        category: CATEGORIES.dairy,
        unit: "L",
        pricePerUnit: 1.2,
        quantity: 0.75,
        estimatedPrice: 0.9,
        reason: "Snack dairy for 3 meals",
        macros: { protein: 3.4, carbs: 5, fat: 1.5 },
      },
    ];

    const consolidated = __shoppingListTestables.consolidateItemsByName(items);

    expect(consolidated).toHaveLength(2);

    const chicken = consolidated.find((item) => item.name.toLowerCase().includes("chicken"));
    const milk = consolidated.find((item) => item.name.toLowerCase().includes("milk"));

    expect(chicken?.quantity).toBe(1.5);
    expect(chicken?.estimatedPrice).toBe(15);
    expect(chicken?.reason).toContain("Lunch protein");
    expect(chicken?.reason).toContain("Dinner protein");

    expect(milk?.quantity).toBe(1.25);
    expect(milk?.unit).toBe("L");
    expect(milk?.estimatedPrice).toBe(1.5);
  });
});
