/**
 * PortionCalculator.test.ts
 * Tests for ingredient portion calculations
 */

import { describe, it, expect } from "vitest";
import { CATEGORIES } from "../core/constants/categories";
import {
  gramsForProtein,
  gramsForCarbs,
  gramsForFats,
  calculateMacroContribution,
  calculateMealPortions,
  calculateTotalMacros,
  MacroTargetPerMeal
} from "../core/logic/PortionCalculator";
import { FoodItem } from "../core/models/FoodItem";

describe("PortionCalculator - Protein Calculations", () => {
  it("should calculate grams for protein target - chicken breast", () => {
    const chicken: FoodItem = {
      id: "chicken",
      name: "Chicken Breast",
      category: CATEGORIES.protein,
      unit: "kg",
      pricePerUnit: 12,
      quantity: 1,
      macros: { protein: 31, carbs: 0, fat: 3.6 },
      costLevel: "high" as const
    };
    
    // Target: 40g protein, Chicken has 31g/100g
    // Expected: (40 / 31) * 100 = 129g
    const result = gramsForProtein(chicken, 40);
    expect(result).toBe(129);
  });
  
  it("should calculate grams for protein target - salmon", () => {
    const salmon: FoodItem = {
      id: "salmon",
      name: "Salmon",
      category: CATEGORIES.protein,
      unit: "kg",
      pricePerUnit: 20,
      quantity: 1,
      macros: { protein: 20, carbs: 0, fat: 13 },
      costLevel: "high" as const
    };
    
    // Target: 30g protein, Salmon has 20g/100g
    // Expected: (30 / 20) * 100 = 150g
    const result = gramsForProtein(salmon, 30);
    expect(result).toBe(150);
  });
  
  it("should return 0 when protein is 0 or missing", () => {
    const noProtein: FoodItem = {
      id: "oil",
      name: "Olive Oil",
      category: CATEGORIES.fats,
      unit: "L",
      pricePerUnit: 8,
      quantity: 1,
      macros: { protein: 0, carbs: 0, fat: 100 },
      costLevel: "high" as const
    };
    
    const result = gramsForProtein(noProtein, 40);
    expect(result).toBe(0);
  });
});

describe("PortionCalculator - Carbs Calculations", () => {
  it("should calculate grams for carbs target - white rice", () => {
    const rice: FoodItem = {
      id: "rice",
      name: "White Rice",
      category: CATEGORIES.grains,
      unit: "kg",
      pricePerUnit: 2,
      quantity: 1,
      macros: { protein: 2.7, carbs: 28, fat: 0.3 },
      costLevel: "low" as const
    };
    
    // Target: 50g carbs, Rice has 28g/100g
    // Expected: (50 / 28) * 100 = 179g
    const result = gramsForCarbs(rice, 50);
    expect(result).toBe(179);
  });
  
  it("should calculate grams for carbs target - sweet potato", () => {
    const sweetPotato: FoodItem = {
      id: "sweet-potato",
      name: "Sweet Potato",
      category: CATEGORIES.vegetables,
      unit: "kg",
      pricePerUnit: 3,
      quantity: 1,
      macros: { protein: 1.6, carbs: 20, fat: 0.1 },
      costLevel: "medium" as const
    };
    
    // Target: 40g carbs, Sweet potato has 20g/100g
    // Expected: (40 / 20) * 100 = 200g
    const result = gramsForCarbs(sweetPotato, 40);
    expect(result).toBe(200);
  });
  
  it("should return 0 when carbs is 0 or missing", () => {
    const noCarbs: FoodItem = {
      id: "chicken",
      name: "Chicken",
      category: CATEGORIES.protein,
      unit: "kg",
      pricePerUnit: 12,
      quantity: 1,
      macros: { protein: 31, carbs: 0, fat: 3.6 },
      costLevel: "high" as const
    };
    
    const result = gramsForCarbs(noCarbs, 50);
    expect(result).toBe(0);
  });
});

describe("PortionCalculator - Fats Calculations", () => {
  it("should calculate grams for fats target - olive oil", () => {
    const oil: FoodItem = {
      id: "olive-oil",
      name: "Olive Oil",
      category: CATEGORIES.fats,
      unit: "L",
      pricePerUnit: 8,
      quantity: 1,
      macros: { protein: 0, carbs: 0, fat: 100 },
      costLevel: "high" as const
    };
    
    // Target: 15g fats, Oil has 100g/100g
    // Expected: (15 / 100) * 100 = 15g
    const result = gramsForFats(oil, 15);
    expect(result).toBe(15);
  });
  
  it("should calculate grams for fats target - almonds", () => {
    const almonds: FoodItem = {
      id: "almonds",
      name: "Almonds",
      category: CATEGORIES.protein,
      unit: "kg",
      pricePerUnit: 15,
      quantity: 1,
      macros: { protein: 21, carbs: 22, fat: 49 },
      costLevel: "high" as const
    };
    
    // Target: 20g fats, Almonds have 49g/100g
    // Expected: (20 / 49) * 100 = 41g
    const result = gramsForFats(almonds, 20);
    expect(result).toBe(41);
  });
  
  it("should return 0 when fat is 0 or missing", () => {
    const noFat: FoodItem = {
      id: "rice",
      name: "Rice",
      category: CATEGORIES.grains,
      unit: "kg",
      pricePerUnit: 2,
      quantity: 1,
      macros: { protein: 2.7, carbs: 28, fat: 0 },
      costLevel: "low" as const
    };
    
    const result = gramsForFats(noFat, 15);
    expect(result).toBe(0);
  });
});

describe("PortionCalculator - Macro Contribution", () => {
  it("should calculate actual macros from food portion", () => {
    const chicken: FoodItem = {
      id: "chicken",
      name: "Chicken Breast",
      category: CATEGORIES.protein,
      unit: "kg",
      pricePerUnit: 12,
      quantity: 1,
      macros: { protein: 31, carbs: 0, fat: 3.6 },
      costLevel: "high" as const
    };
    
    // 129g chicken
    const result = calculateMacroContribution(chicken, 129);
    
    // Expected: 31 * 1.29 = 40g protein, 0 carbs, 3.6 * 1.29 = 5g fat
    expect(result.protein).toBe(40);
    expect(result.carbs).toBe(0);
    expect(result.fats).toBe(5);
  });
  
  it("should calculate macros from rice portion", () => {
    const rice: FoodItem = {
      id: "rice",
      name: "White Rice",
      category: CATEGORIES.grains,
      unit: "kg",
      pricePerUnit: 2,
      quantity: 1,
      macros: { protein: 2.7, carbs: 28, fat: 0.3 },
      costLevel: "low" as const
    };
    
    // 179g rice
    const result = calculateMacroContribution(rice, 179);
    
    // Expected: 2.7 * 1.79 = 5g protein, 28 * 1.79 = 50g carbs, 0.3 * 1.79 = 1g fat
    expect(result.protein).toBe(5);
    expect(result.carbs).toBe(50);
    expect(result.fats).toBe(1);
  });
  
  it("should return 0 macros when macros are missing", () => {
    const noMacros: FoodItem = {
      id: "test",
      name: "Test Food",
      category: CATEGORIES.others,
      unit: "kg",
      pricePerUnit: 1,
      quantity: 1,
      costLevel: "low" as const
    };
    
    const result = calculateMacroContribution(noMacros, 100);
    expect(result).toEqual({ protein: 0, carbs: 0, fats: 0 });
  });
});

describe("PortionCalculator - Complete Meal", () => {
  const macroTarget: MacroTargetPerMeal = {
    protein: 40,
    carbs: 50,
    fats: 15
  };
  
  const chicken: FoodItem = {
    id: "chicken",
    name: "Chicken Breast",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 12,
    quantity: 1,
    macros: { protein: 31, carbs: 0, fat: 3.6 },
    costLevel: "high" as const
  };
  
  const rice: FoodItem = {
    id: "rice",
    name: "White Rice",
    category: CATEGORIES.grains,
    unit: "kg",
    pricePerUnit: 2,
    quantity: 1,
    macros: { protein: 2.7, carbs: 28, fat: 0.3 },
    costLevel: "low" as const
  };
  
  const oil: FoodItem = {
    id: "olive-oil",
    name: "Olive Oil",
    category: CATEGORIES.fats,
    unit: "L",
    pricePerUnit: 8,
    quantity: 1,
    macros: { protein: 0, carbs: 0, fat: 100 },
    costLevel: "high" as const
  };
  
  const broccoli: FoodItem = {
    id: "broccoli",
    name: "Broccoli",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 3,
    quantity: 1,
    macros: { protein: 2.8, carbs: 7, fat: 0.4 },
    costLevel: "medium" as const
  };
  
  it("should calculate portions for complete meal with all components", () => {
    const portions = calculateMealPortions(
      macroTarget,
      chicken,
      rice,
      oil,
      broccoli
    );
    
    expect(portions).toHaveLength(4);
    
    // Chicken: 129g for 40g protein
    expect(portions[0].foodId).toBe("chicken");
    expect(portions[0].gramsNeeded).toBe(129);
    expect(portions[0].macroContribution.protein).toBe(40);
    
    // Rice: 179g for 50g carbs
    expect(portions[1].foodId).toBe("rice");
    expect(portions[1].gramsNeeded).toBe(179);
    expect(portions[1].macroContribution.carbs).toBe(50);
    
    // Oil: accounts for fats from chicken (5g) + rice (1g) = 6g
    // Remaining: 15 - 6 = 9g → 9g oil
    expect(portions[2].foodId).toBe("olive-oil");
    expect(portions[2].gramsNeeded).toBe(9);
    
    // Broccoli: fixed 150g
    expect(portions[3].foodId).toBe("broccoli");
    expect(portions[3].gramsNeeded).toBe(150);
  });
  
  it("should calculate portions without fat source", () => {
    const portions = calculateMealPortions(
      macroTarget,
      chicken,
      rice,
      null,
      broccoli
    );
    
    expect(portions).toHaveLength(3);
    expect(portions.map(p => p.foodId)).toEqual(["chicken", "rice", "broccoli"]);
  });
  
  it("should calculate portions without vegetables", () => {
    const portions = calculateMealPortions(
      macroTarget,
      chicken,
      rice,
      oil,
      null
    );
    
    expect(portions).toHaveLength(3);
    expect(portions.map(p => p.foodId)).toEqual(["chicken", "rice", "olive-oil"]);
  });
  
  it("should skip fat source when protein + carbs already meet fat target", () => {
    const highFatProtein: FoodItem = {
      id: "salmon",
      name: "Salmon",
      category: CATEGORIES.protein,
      unit: "kg",
      pricePerUnit: 20,
      quantity: 1,
      macros: { protein: 20, carbs: 0, fat: 13 },
      costLevel: "high" as const
    };
    
    const portions = calculateMealPortions(
      macroTarget,
      highFatProtein,
      rice,
      oil,
      null
    );
    
    // Salmon: 200g for 40g protein → 26g fat
    // Rice: 179g for 50g carbs → 1g fat
    // Total: 27g fat > 15g target, so no oil added
    const hasOil = portions.some(p => p.foodId === "olive-oil");
    expect(hasOil).toBe(false);
  });
});

describe("PortionCalculator - Total Macros", () => {
  it("should sum up total macros from portions", () => {
    const portions = [
      {
        foodId: "chicken",
        foodName: "Chicken",
        gramsNeeded: 129,
        macroContribution: { protein: 40, carbs: 0, fats: 5 }
      },
      {
        foodId: "rice",
        foodName: "Rice",
        gramsNeeded: 179,
        macroContribution: { protein: 5, carbs: 50, fats: 1 }
      },
      {
        foodId: "oil",
        foodName: "Oil",
        gramsNeeded: 9,
        macroContribution: { protein: 0, carbs: 0, fats: 9 }
      }
    ];
    
    const total = calculateTotalMacros(portions);
    
    expect(total.protein).toBe(45);
    expect(total.carbs).toBe(50);
    expect(total.fats).toBe(15);
  });
  
  it("should return zero macros for empty portions", () => {
    const total = calculateTotalMacros([]);
    
    expect(total).toEqual({ protein: 0, carbs: 0, fats: 0 });
  });
});


