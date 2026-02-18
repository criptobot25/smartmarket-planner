/**
 * MealBuilder.test.ts
 * Tests for dynamic meal building from macro targets
 */

import { describe, it, expect, beforeEach } from "vitest";
import { CATEGORIES } from "../core/constants/categories";
import { buildMeal, buildBreakfast } from "../core/logic/MealBuilder";
import { FoodItem } from "../core/models/FoodItem";
import { userPreferencesStore } from "../core/stores/UserPreferencesStore";

// Mock foods for testing
const mockProteinFoods: FoodItem[] = [
  {
    id: "chicken",
    name: "Chicken Breast",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 10,
    quantity: 1,
    macros: { protein: 31, carbs: 0, fat: 3.6 },
    costLevel: "medium"
  },
  {
    id: "salmon",
    name: "Salmon",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 25,
    quantity: 1,
    macros: { protein: 20, carbs: 0, fat: 13 },
    costLevel: "high"
  },
  {
    id: "tuna",
    name: "Tuna",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 8,
    quantity: 1,
    macros: { protein: 26, carbs: 0, fat: 1 },
    costLevel: "low"
  }
];

const mockCarbFoods: FoodItem[] = [
  {
    id: "rice",
    name: "White Rice",
    category: CATEGORIES.grains,
    unit: "kg",
    pricePerUnit: 2,
    quantity: 1,
    macros: { protein: 2.7, carbs: 28, fat: 0.3 },
    costLevel: "low"
  },
  {
    id: "quinoa",
    name: "Quinoa",
    category: CATEGORIES.grains,
    unit: "kg",
    pricePerUnit: 8,
    quantity: 1,
    macros: { protein: 4.4, carbs: 21, fat: 1.9 },
    costLevel: "medium"
  },
  {
    id: "sweet-potato",
    name: "Sweet Potato",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 3,
    quantity: 1,
    macros: { protein: 1.6, carbs: 20, fat: 0.1 },
    costLevel: "low"
  }
];

const mockVegetables: FoodItem[] = [
  {
    id: "broccoli",
    name: "Broccoli",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 4,
    quantity: 1,
    macros: { protein: 2.8, carbs: 7, fat: 0.4 },
    costLevel: "low"
  },
  {
    id: "spinach",
    name: "Spinach",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 5,
    quantity: 1,
    macros: { protein: 2.9, carbs: 3.6, fat: 0.4 },
    costLevel: "medium"
  }
];

const mockFatFoods: FoodItem[] = [
  {
    id: "olive-oil",
    name: "Olive Oil",
    category: CATEGORIES.fats,
    unit: "L",
    pricePerUnit: 8,
    quantity: 1,
    macros: { protein: 0, carbs: 0, fat: 100 },
    costLevel: "high"
  }
];

const mockDairy: FoodItem[] = [
  {
    id: "yogurt",
    name: "Greek Yogurt",
    category: CATEGORIES.dairy,
    unit: "kg",
    pricePerUnit: 6,
    quantity: 1,
    macros: { protein: 10, carbs: 3.6, fat: 5 },
    costLevel: "medium"
  }
];

const mockFruits: FoodItem[] = [
  {
    id: "banana",
    name: "Banana",
    category: CATEGORIES.fruits,
    unit: "kg",
    pricePerUnit: 2,
    quantity: 1,
    macros: { protein: 1.1, carbs: 23, fat: 0.3 },
    costLevel: "low"
  }
];

const mockOats: FoodItem[] = [
  {
    id: "oats",
    name: "Oats",
    category: CATEGORIES.grains,
    unit: "kg",
    pricePerUnit: 3,
    quantity: 1,
    macros: { protein: 13.2, carbs: 67, fat: 6.9 },
    costLevel: "low"
  }
];

const allMockFoods: FoodItem[] = [
  ...mockProteinFoods,
  ...mockCarbFoods,
  ...mockVegetables,
  ...mockFatFoods,
  ...mockDairy,
  ...mockFruits,
  ...mockOats
];

describe("MealBuilder - Protein Source Selection", () => {
  beforeEach(() => {
    userPreferencesStore.clearAll();
  });

  it("should select highest protein-per-cost for low tier", () => {
    const meal = buildMeal({
      macroTargetsPerMeal: { protein: 40, carbs: 50, fats: 15 },
      availableFoods: allMockFoods,
      excludedFoods: [],
      costTier: "low"
    });
    
    // Tuna has best protein-per-cost: 26g / €8 = 3.25
    // Chicken: 31g / €10 = 3.1
    // Salmon: 20g / €25 = 0.8
    expect(meal.ingredients.some(i => i.foodName === "Tuna" || i.foodName === "Chicken Breast")).toBe(true);
  });
  
  it("should select highest protein content for high tier", () => {
    const meal = buildMeal({
      macroTargetsPerMeal: { protein: 40, carbs: 50, fats: 15 },
      availableFoods: allMockFoods,
      excludedFoods: [],
      costTier: "high"
    });
    
    // Chicken has highest protein: 31g/100g
    expect(meal.ingredients.some(i => i.foodName === "Chicken Breast")).toBe(true);
  });
  
  it("should select balanced protein for medium tier", () => {
    const meal = buildMeal({
      macroTargetsPerMeal: { protein: 40, carbs: 50, fats: 15 },
      availableFoods: allMockFoods,
      excludedFoods: [],
      costTier: "medium"
    });
    
    // Medium balances protein content * protein-per-cost
    // Chicken: 31 * 3.1 = 96.1
    // Tuna: 26 * 3.25 = 84.5
    // Salmon: 20 * 0.8 = 16
    expect(meal.ingredients.some(i => i.foodName === "Chicken Breast")).toBe(true);
  });
});

describe("MealBuilder - Carb Source Selection", () => {
  it("should select highest carbs-per-cost for low tier", () => {
    const meal = buildMeal({
      macroTargetsPerMeal: { protein: 40, carbs: 50, fats: 15 },
      availableFoods: allMockFoods,
      excludedFoods: [],
      costTier: "low"
    });
    
    // Rice has best carbs-per-cost: 28g / €2 = 14
    // Quinoa: 21g / €8 = 2.625
    expect(meal.ingredients.some(i => i.foodName === "White Rice" || i.foodName === "Oats")).toBe(true);
  });
  
  it("should prefer quinoa for high tier", () => {
    const meal = buildMeal({
      macroTargetsPerMeal: { protein: 40, carbs: 50, fats: 15 },
      availableFoods: allMockFoods,
      excludedFoods: [
        "White Rice",
        "Brown Rice",
        "Pasta (Whole Wheat)",
        "Oats (Rolled)",
        "Oats",
        "Couscous",
        "Barley",
        "White bread"
      ],
      costTier: "high"
    });
    
    // High tier prefers premium carbs (quinoa, sweet potato)
    const hasQuinoa = meal.ingredients.some(i => i.foodName === "Quinoa");
    const hasSweetPotato = meal.ingredients.some(i => i.foodName === "Sweet Potato");
    expect(hasQuinoa || hasSweetPotato).toBe(true);
  });
});

describe("MealBuilder - Excluded Foods", () => {
  it("should not use excluded protein source", () => {
    const meal = buildMeal({
      macroTargetsPerMeal: { protein: 40, carbs: 50, fats: 15 },
      availableFoods: allMockFoods,
      excludedFoods: ["Tuna"],
      costTier: "low"
    });
    
    expect(meal.ingredients.some(i => i.foodName === "Tuna")).toBe(false);
    expect(meal.ingredients.some(i => i.foodName === "Chicken Breast")).toBe(true);
  });
  
  it("should not use excluded carb source", () => {
    const meal = buildMeal({
      macroTargetsPerMeal: { protein: 40, carbs: 50, fats: 15 },
      availableFoods: allMockFoods,
      excludedFoods: ["White Rice"],
      costTier: "low"
    });
    
    expect(meal.ingredients.some(i => i.foodName === "White Rice")).toBe(false);
    // Should use alternative carb source
    expect(meal.ingredients.some(i => 
      i.foodName === "Quinoa" || i.foodName === "Sweet Potato" || i.foodName === "Oats"
    )).toBe(true);
  });
});

describe("MealBuilder - Meal Composition", () => {
  it("should include protein, carb, vegetable, and fat sources", () => {
    const meal = buildMeal({
      macroTargetsPerMeal: { protein: 40, carbs: 50, fats: 15 },
      availableFoods: allMockFoods,
      excludedFoods: [],
      costTier: "medium"
    });
    
    // Should have at least 3 ingredients (protein + carb + vegetable)
    expect(meal.ingredients.length).toBeGreaterThanOrEqual(3);
    
    // Check for protein source
    const hasProtein = meal.ingredients.some(i => 
      ["Chicken Breast", "Tuna", "Salmon"].includes(i.foodName)
    );
    expect(hasProtein).toBe(true);
    
    // Check for carb source
    const hasCarbs = meal.ingredients.some(i => 
      ["White Rice", "Quinoa", "Sweet Potato", "Oats"].includes(i.foodName)
    );
    expect(hasCarbs).toBe(true);
    
    // Check for vegetable
    const hasVegetable = meal.ingredients.some(i => 
      ["Broccoli", "Spinach"].includes(i.foodName)
    );
    expect(hasVegetable).toBe(true);
  });
  
  it("should calculate portions in grams", () => {
    const meal = buildMeal({
      macroTargetsPerMeal: { protein: 40, carbs: 50, fats: 15 },
      availableFoods: allMockFoods,
      excludedFoods: [],
      costTier: "low"
    });
    
    meal.ingredients.forEach(ing => {
      expect(ing.grams).toBeGreaterThan(0);
      expect(typeof ing.grams).toBe("number");
    });
  });
  
  it("should generate descriptive meal name", () => {
    const meal = buildMeal({
      macroTargetsPerMeal: { protein: 40, carbs: 50, fats: 15 },
      availableFoods: allMockFoods,
      excludedFoods: [],
      costTier: "medium"
    });
    
    expect(meal.name).toContain("+");
    expect(meal.name.length).toBeGreaterThan(5);
  });
  
  it("should calculate total macros", () => {
    const meal = buildMeal({
      macroTargetsPerMeal: { protein: 40, carbs: 50, fats: 15 },
      availableFoods: allMockFoods,
      excludedFoods: [],
      costTier: "high" // Use high tier to ensure fat sources are available
    });
    
    expect(meal.macros.protein).toBeGreaterThan(30); // Close to 40g target
    expect(meal.macros.carbs).toBeGreaterThan(40); // Close to 50g target
    expect(meal.macros.fats).toBeGreaterThan(10); // Close to 15g target
  });
});

describe("MealBuilder - Breakfast", () => {
  it("should build oats-based breakfast", () => {
    const breakfast = buildBreakfast({
      macroTargetsPerMeal: { protein: 30, carbs: 60, fats: 12 },
      availableFoods: allMockFoods,
      excludedFoods: [],
      costTier: "medium"
    });
    
    // Should include oats and dairy
    const hasOats = breakfast.ingredients.some(i => i.foodName === "Oats");
    const hasDairy = breakfast.ingredients.some(i => i.foodName === "Greek Yogurt");
    
    expect(hasOats).toBe(true);
    expect(hasDairy).toBe(true);
  });
  
  it("should include fruit in breakfast", () => {
    const breakfast = buildBreakfast({
      macroTargetsPerMeal: { protein: 30, carbs: 60, fats: 12 },
      availableFoods: allMockFoods,
      excludedFoods: [],
      costTier: "medium"
    });
    
    const hasFruit = breakfast.ingredients.some(i => i.foodName === "Banana");
    expect(hasFruit).toBe(true);
  });
  
  it("should use traditional breakfast portions", () => {
    const breakfast = buildBreakfast({
      macroTargetsPerMeal: { protein: 30, carbs: 60, fats: 12 },
      availableFoods: allMockFoods,
      excludedFoods: [],
      costTier: "medium"
    });
    
    // Breakfast uses fixed portions (80g oats, 150g yogurt, 100g fruit)
    const oatsIng = breakfast.ingredients.find(i => i.foodName === "Oats");
    const yogurtIng = breakfast.ingredients.find(i => i.foodName === "Greek Yogurt");
    
    expect(oatsIng?.grams).toBe(80);
    expect(yogurtIng?.grams).toBe(150);
  });
});

describe("MealBuilder - Error Handling", () => {
  it("should throw error when no protein source available", () => {
    expect(() => {
      buildMeal({
        macroTargetsPerMeal: { protein: 40, carbs: 50, fats: 15 },
        availableFoods: [...mockCarbFoods, ...mockVegetables], // No proteins
        excludedFoods: [],
        costTier: "medium"
      });
    }).toThrow("Missing protein source");
  });
  
  it("should throw error when no carb source available", () => {
    expect(() => {
      buildMeal({
        macroTargetsPerMeal: { protein: 40, carbs: 50, fats: 15 },
        availableFoods: [...mockProteinFoods, ...mockVegetables], // No carbs
        excludedFoods: [],
        costTier: "medium"
      });
    }).toThrow("Missing carb source");
  });
});

describe("MealBuilder - Vegetable Selection", () => {
  it("should prefer broccoli or spinach for vegetables", () => {
    const meal = buildMeal({
      macroTargetsPerMeal: { protein: 40, carbs: 50, fats: 15 },
      availableFoods: allMockFoods,
      excludedFoods: [],
      costTier: "medium"
    });
    
    const vegetable = meal.ingredients.find(i => 
      i.foodName === "Broccoli" || i.foodName === "Spinach"
    );
    expect(vegetable).toBeDefined();
  });
  
  it("should use 150g fixed portion for vegetables", () => {
    const meal = buildMeal({
      macroTargetsPerMeal: { protein: 40, carbs: 50, fats: 15 },
      availableFoods: allMockFoods,
      excludedFoods: [],
      costTier: "medium"
    });
    
    const vegetable = meal.ingredients.find(i => 
      i.foodName === "Broccoli" || i.foodName === "Spinach"
    );
    expect(vegetable?.grams).toBe(150);
  });
});


