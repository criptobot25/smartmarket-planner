/**
 * PASSO 24 - CostTier Food Selection Tests
 * 
 * Tests that cost tier influences ingredient selection:
 * - Low tier: Only low/medium cost foods
 * - Medium tier: Only low/medium cost foods
 * - High tier: All foods including premium
 * - SmartSavings only activates for low tier
 */

import { describe, it, expect } from "vitest";
import { buildMeal, buildBreakfast } from "../core/logic/MealBuilder";
import { mockFoods } from "../data/mockFoods";
import { MacroTargetPerMeal } from "../core/logic/PortionCalculator";

describe("CostTier Food Selection - PASSO 24", () => {
  const macroTarget: MacroTargetPerMeal = {
    protein: 40,
    carbs: 50,
    fats: 15,
  };

  describe("Low tier food selection", () => {
    it("should exclude high-cost foods (salmon, beef, olive oil)", () => {
      const meal = buildMeal({
        macroTargetsPerMeal: macroTarget,
        availableFoods: mockFoods,
        excludedFoods: [],
        costTier: "low",
      });

      // Check that no premium ingredients are used
      const ingredientNames = meal.ingredients.map(i => i.foodName.toLowerCase());
      
      expect(ingredientNames.every(name => !name.includes("salmon"))).toBe(true);
      expect(ingredientNames.every(name => !name.includes("beef"))).toBe(true);
      expect(ingredientNames.every(name => !name.includes("olive oil"))).toBe(true);
      expect(ingredientNames.every(name => !name.includes("almond"))).toBe(true);
    });

    it("should select budget-friendly proteins (eggs, tuna, chicken)", () => {
      const meal = buildMeal({
        macroTargetsPerMeal: macroTarget,
        availableFoods: mockFoods,
        excludedFoods: [],
        costTier: "low",
      });

      const protein = meal.ingredients.find(i => {
        const food = mockFoods.find(f => f.name === i.foodName);
        return food?.category === "proteins";
      });

      expect(protein).toBeDefined();
      
      const proteinFood = mockFoods.find(f => f.name === protein!.foodName);
      expect(proteinFood?.costLevel).toMatch(/low|medium/);
    });

    it("should select budget-friendly carbs (rice, pasta, oats)", () => {
      const meal = buildMeal({
        macroTargetsPerMeal: macroTarget,
        availableFoods: mockFoods,
        excludedFoods: [],
        costTier: "low",
      });

      const carb = meal.ingredients.find(i => {
        const food = mockFoods.find(f => f.name === i.foodName);
        return food?.category === "grains";
      });

      expect(carb).toBeDefined();
      
      const carbFood = mockFoods.find(f => f.name === carb!.foodName);
      expect(carbFood?.costLevel).toMatch(/low|medium/);
      
      // Should not be quinoa (premium carb)
      expect(carb!.foodName.toLowerCase()).not.toContain("quinoa");
    });

    it("should build breakfast without premium foods", () => {
      const breakfast = buildBreakfast({
        macroTargetsPerMeal: macroTarget,
        availableFoods: mockFoods,
        excludedFoods: [],
        costTier: "low",
      });

      breakfast.ingredients.forEach(ing => {
        const food = mockFoods.find(f => f.name === ing.foodName);
        expect(food?.costLevel).toMatch(/low|medium/);
      });
    });
  });

  describe("Medium tier food selection", () => {
    it("should exclude high-cost foods (same as low tier)", () => {
      const meal = buildMeal({
        macroTargetsPerMeal: macroTarget,
        availableFoods: mockFoods,
        excludedFoods: [],
        costTier: "medium",
      });

      const ingredientNames = meal.ingredients.map(i => i.foodName.toLowerCase());
      
      expect(ingredientNames.every(name => !name.includes("salmon"))).toBe(true);
      expect(ingredientNames.every(name => !name.includes("lean ground beef"))).toBe(true);
      expect(ingredientNames.every(name => !name.includes("olive oil"))).toBe(true);
    });

    it("should allow medium-cost foods", () => {
      const meal = buildMeal({
        macroTargetsPerMeal: macroTarget,
        availableFoods: mockFoods,
        excludedFoods: [],
        costTier: "medium",
      });

      meal.ingredients.forEach(ing => {
        const food = mockFoods.find(f => f.name === ing.foodName);
        expect(food?.costLevel).toMatch(/low|medium/);
      });
    });
  });

  describe("High tier food selection", () => {
    it("should have access to ALL foods including premium", () => {
      // High tier should at least have access to premium foods
      // (may not always select them, but they're available)
      const highTierFoods = mockFoods.filter(f => f.costLevel === "high");
      expect(highTierFoods.length).toBeGreaterThan(0);
    });

    it("should be able to select premium proteins (salmon or beef)", () => {
      // Exclude ALL cheaper and medium-cost proteins to force premium selection
      const meal = buildMeal({
        macroTargetsPerMeal: macroTarget,
        availableFoods: mockFoods,
        excludedFoods: [
          "Eggs (large)", 
          "Tuna (canned)", 
          "Chicken breast (skinless)",
          "Turkey breast",
          "Cod fillet",
          "Pork loin",
          "Tilapia fillet",
          "Cottage cheese (low-fat)",
          "Tofu (firm)",
          "Sardines (canned)"
        ],
        costTier: "high",
      });

      const proteinNames = meal.ingredients.map(i => i.foodName);
      const hasPremiumProtein = proteinNames.some(name => 
        name === "Salmon fillet" || 
        name === "Lean ground beef (5% fat)" || 
        name === "Shrimp (raw)" ||
        name === "Lamb chops" ||
        name === "Duck breast"
      );
      expect(hasPremiumProtein).toBe(true);
    });

    it("should be able to select quinoa (premium carb)", () => {
      // Exclude ALL cheaper carbs to force premium selection
      const meal = buildMeal({
        macroTargetsPerMeal: macroTarget,
        availableFoods: mockFoods,
        excludedFoods: [
          "White rice", 
          "Brown rice", 
          "Pasta (whole wheat)",
          "Oats (rolled)",
          "Couscous",
          "Barley",
          "White bread"
        ],
        costTier: "high",
      });

      const carbNames = meal.ingredients.map(i => i.foodName);
      expect(carbNames.some(name => name === "Quinoa" || name === "Sweet potato")).toBe(true);
    });
  });

  describe("Cost tier impact on food availability", () => {
    it("low tier should have fewer protein options than high tier", () => {
      const lowTierProteins = mockFoods.filter(f => 
        f.category === "proteins" && 
        (f.costLevel === "low" || f.costLevel === "medium")
      );

      const highTierProteins = mockFoods.filter(f => 
        f.category === "proteins"
      );

      expect(lowTierProteins.length).toBeLessThan(highTierProteins.length);
    });

    it("all tiers should have access to budget staples", () => {
      const budgetStaples = ["Eggs (large)", "Tuna (canned)", "White rice", "Broccoli"];

      budgetStaples.forEach(staple => {
        const food = mockFoods.find(f => f.name === staple);
        expect(food?.costLevel).toMatch(/low|medium/);
      });
    });

    it("premium foods should be marked as high cost level", () => {
      const premiumFoods = ["Salmon fillet", "Lean ground beef (5% fat)", "Extra virgin olive oil", "Almonds (raw)"];

      premiumFoods.forEach(premium => {
        const food = mockFoods.find(f => f.name === premium);
        expect(food?.costLevel).toBe("high");
      });
    });
  });

  describe("Cost tier consistency", () => {
    it("should consistently exclude premium foods for low tier across multiple meals", () => {
      const meals = [];
      for (let i = 0; i < 5; i++) {
        meals.push(buildMeal({
          macroTargetsPerMeal: macroTarget,
          availableFoods: mockFoods,
          excludedFoods: [],
          costTier: "low",
        }));
      }

      meals.forEach(meal => {
        meal.ingredients.forEach(ing => {
          const food = mockFoods.find(f => f.name === ing.foodName);
          expect(food?.costLevel).toMatch(/low|medium/);
        });
      });
    });

    it("should respect cost tier even with variety constraints", () => {
      // Build multiple meals with low tier to test variety + cost tier interaction
      const meals = [];
      for (let i = 0; i < 7; i++) {
        meals.push(buildMeal({
          macroTargetsPerMeal: macroTarget,
          availableFoods: mockFoods,
          excludedFoods: [],
          costTier: "low",
        }));
      }

      // All meals should still respect low tier (no premium foods)
      meals.forEach(meal => {
        meal.ingredients.forEach(ing => {
          const food = mockFoods.find(f => f.name === ing.foodName);
          expect(food?.costLevel).not.toBe("high");
        });
      });
    });
  });
});
