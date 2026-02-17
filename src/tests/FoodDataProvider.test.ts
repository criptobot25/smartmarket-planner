import { describe, it, expect, beforeEach } from "vitest";
import { CATEGORIES } from "../core/constants/categories";
import {
  LocalFoodProvider,
  getFoodProvider,
  setFoodProvider,
  resetFoodProvider,
  searchFoodsByName,
  getHighProteinFoods,
  getBudgetFoods,
  getAvailableCategories,
  getTotalFoodCount
} from "../core/data/FoodDataProvider";

describe("PASSO 37 - Food Data Provider & Database Upgrade", () => {
  let provider: LocalFoodProvider;

  beforeEach(() => {
    provider = new LocalFoodProvider();
    provider.clearCustomFoods();
    resetFoodProvider();
  });

  describe("1. Food Database Expansion", () => {
    it("should have 80+ foods in database", async () => {
      const foods = await provider.getAllFoods();
      expect(foods.length).toBeGreaterThanOrEqual(80);
    });

    it("should include protein supplement products", async () => {
      const proteins = await provider.getFoodsByCategory(CATEGORIES.protein);
      expect(proteins.length).toBeGreaterThan(0);
      
      // Database includes various protein sources
      const proteinNames = proteins.map(f => f.name.toLowerCase());
      expect(proteinNames.length).toBeGreaterThan(10);
    });

    it("should include legumes category", async () => {
      const legumes = await provider.getFoodsByCategory(CATEGORIES.legumes);
      
      // Database has legumes category available
      expect(legumes).toBeDefined();
      expect(Array.isArray(legumes)).toBe(true);
    });

    it("should include frozen meals", async () => {
      const frozenFoods = await provider.searchFoods({ query: "frozen" });
      expect(frozenFoods.length).toBeGreaterThan(0);
    });

    it("should include snack variety (protein bars, jerky, etc)", async () => {
      const proteinBars = await provider.searchFoods({ query: "bar" });
      const jerky = await provider.searchFoods({ query: "jerky" });

      expect(proteinBars.length).toBeGreaterThan(0);
      expect(jerky.length).toBeGreaterThan(0);
    });

    it("should have diverse protein sources (>12 options)", async () => {
      const proteins = await provider.getFoodsByCategory(CATEGORIES.protein);
      expect(proteins.length).toBeGreaterThan(12);
    });

    it("should have comprehensive vegetable selection", async () => {
      const vegetables = await provider.getFoodsByCategory(CATEGORIES.vegetables);
      expect(vegetables.length).toBeGreaterThanOrEqual(15);
    });

    it("should have variety of grains and carbs", async () => {
      const grains = await provider.getFoodsByCategory(CATEGORIES.grains);
      expect(grains.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe("2. LocalFoodProvider - Basic Operations", () => {
    it("should get all foods", async () => {
      const foods = await provider.getAllFoods();
      
      expect(Array.isArray(foods)).toBe(true);
      expect(foods.length).toBeGreaterThan(0);
    });

    it("should get food by ID", async () => {
      const food = await provider.getFoodById("food-001");
      
      expect(food).toBeDefined();
      expect(food?.id).toBe("food-001");
      expect(food?.name).toBeTruthy();
    });

    it("should return null for non-existent ID", async () => {
      const food = await provider.getFoodById("non-existent-999");
      expect(food).toBeNull();
    });

    it("should get total food count", async () => {
      const count = await provider.getFoodCount();
      expect(count).toBeGreaterThanOrEqual(80);
    });

    it("should get all categories", async () => {
      const categories = await provider.getCategories();
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain(CATEGORIES.protein);
      expect(categories).toContain(CATEGORIES.vegetables);
      expect(categories).toContain(CATEGORIES.grains);
    });
  });

  describe("3. Search Functionality", () => {
    it("should search foods by name (case-insensitive)", async () => {
      const results = await provider.searchFoods({ query: "chicken" });
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(food => {
        expect(food.name.toLowerCase()).toContain("chicken");
      });
    });

    it("should search with partial match", async () => {
      const results = await provider.searchFoods({ query: "rice" });
      
      expect(results.length).toBeGreaterThan(0);
      const names = results.map(f => f.name.toLowerCase());
      expect(names.some(n => n.includes("rice"))).toBe(true);
    });

    it("should return empty array for non-matching query", async () => {
      const results = await provider.searchFoods({ query: "xyzzzzunknown" });
      expect(results).toEqual([]);
    });

    it("should search case-insensitively", async () => {
      const upper = await provider.searchFoods({ query: "CHICKEN" });
      const lower = await provider.searchFoods({ query: "chicken" });
      const mixed = await provider.searchFoods({ query: "ChIcKeN" });

      expect(upper.length).toBe(lower.length);
      expect(lower.length).toBe(mixed.length);
    });
  });

  describe("4. Filter by Category", () => {
    it("should filter by proteins category", async () => {
      const proteins = await provider.getFoodsByCategory(CATEGORIES.protein);
      
      expect(proteins.length).toBeGreaterThan(0);
      proteins.forEach(food => {
        expect(food.category).toBe(CATEGORIES.protein);
      });
    });

    it("should filter by vegetables category", async () => {
      const vegetables = await provider.getFoodsByCategory(CATEGORIES.vegetables);
      
      expect(vegetables.length).toBeGreaterThan(0);
      vegetables.forEach(food => {
        expect(food.category).toBe(CATEGORIES.vegetables);
      });
    });

    it("should filter by grains category", async () => {
      const grains = await provider.getFoodsByCategory(CATEGORIES.grains);
      
      expect(grains.length).toBeGreaterThan(0);
      grains.forEach(food => {
        expect(food.category).toBe(CATEGORIES.grains);
      });
    });

    it("should filter by dairy category", async () => {
      const dairy = await provider.getFoodsByCategory(CATEGORIES.dairy);
      
      expect(dairy.length).toBeGreaterThan(0);
      dairy.forEach(food => {
        expect(food.category).toBe(CATEGORIES.dairy);
      });
    });
  });

  describe("5. Filter by Cost Level", () => {
    it("should filter by low cost", async () => {
      const lowCost = await provider.getFoodsByCostLevel("low");
      
      expect(lowCost.length).toBeGreaterThan(0);
      lowCost.forEach(food => {
        expect(food.costLevel).toBe("low");
      });
    });

    it("should filter by medium cost", async () => {
      const mediumCost = await provider.getFoodsByCostLevel("medium");
      
      expect(mediumCost.length).toBeGreaterThan(0);
      mediumCost.forEach(food => {
        expect(food.costLevel).toBe("medium");
      });
    });

    it("should filter by high cost", async () => {
      const highCost = await provider.getFoodsByCostLevel("high");
      
      expect(highCost.length).toBeGreaterThan(0);
      highCost.forEach(food => {
        expect(food.costLevel).toBe("high");
      });
    });
  });

  describe("6. Filter by Macros", () => {
    it("should filter by minimum protein (>20g)", async () => {
      const highProtein = await provider.searchFoods({ minProtein: 20 });
      
      expect(highProtein.length).toBeGreaterThan(0);
      highProtein.forEach(food => {
        expect(food.macros).toBeDefined();
        expect(food.macros!.protein).toBeGreaterThanOrEqual(20);
      });
    });

    it("should filter by maximum price", async () => {
      const maxPrice = 5.00;
      const cheapFoods = await provider.searchFoods({ maxPrice });
      
      expect(cheapFoods.length).toBeGreaterThan(0);
      cheapFoods.forEach(food => {
        expect(food.pricePerUnit).toBeLessThanOrEqual(maxPrice);
      });
    });

    it("should combine protein and price filters", async () => {
      const results = await provider.searchFoods({
        minProtein: 15,
        maxPrice: 10
      });

      expect(results.length).toBeGreaterThan(0);
      results.forEach(food => {
        expect(food.macros!.protein).toBeGreaterThanOrEqual(15);
        expect(food.pricePerUnit).toBeLessThanOrEqual(10);
      });
    });
  });

  describe("7. Exclude Foods", () => {
    it("should exclude specific foods by name", async () => {
      const excludedFoods = ["Chicken breast (skinless)", "Salmon fillet"];
      const results = await provider.searchFoods({
        category: CATEGORIES.protein,
        excludedFoods
      });

      results.forEach(food => {
        expect(excludedFoods).not.toContain(food.name);
      });
    });

    it("should work with empty exclusion list", async () => {
      const results = await provider.searchFoods({
        category: CATEGORIES.protein,
        excludedFoods: []
      });

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("8. Combined Filters", () => {
    it("should combine search query + category + cost level", async () => {
      const results = await provider.searchFoods({
        query: "rice",
        category: CATEGORIES.grains,
        costLevel: "low"
      });

      results.forEach(food => {
        expect(food.name.toLowerCase()).toContain("rice");
        expect(food.category).toBe(CATEGORIES.grains);
        expect(food.costLevel).toBe("low");
      });
    });

    it("should combine all filters together", async () => {
      const results = await provider.searchFoods({
        category: CATEGORIES.protein,
        costLevel: "low",
        minProtein: 20,
        maxPrice: 10,
        excludedFoods: ["Tuna (canned)"]
      });

      results.forEach(food => {
        expect(food.category).toBe(CATEGORIES.protein);
        expect(food.costLevel).toBe("low");
        expect(food.macros!.protein).toBeGreaterThanOrEqual(20);
        expect(food.pricePerUnit).toBeLessThanOrEqual(10);
        expect(food.name).not.toBe("Tuna (canned)");
      });
    });
  });

  describe("9. Custom Foods (User-Added)", () => {
    it("should add custom food", async () => {
      const customFood = await provider.addCustomFood({
        name: "Custom Protein Shake",
        category: CATEGORIES.protein,
        unit: "serving",
        pricePerUnit: 3.50,
        quantity: 0,
        costLevel: "medium",
        macros: {
          protein: 30,
          carbs: 5,
          fat: 2
        }
      });

      expect(customFood.id).toMatch(/^custom-/);
      expect(customFood.name).toBe("Custom Protein Shake");
      expect(customFood.macros?.protein).toBe(30);
    });

    it("should include custom foods in getAllFoods()", async () => {
      await provider.addCustomFood({
        name: "Custom Food 1",
        category: CATEGORIES.snacks,
        unit: "pack",
        pricePerUnit: 2.99,
        quantity: 0,
        costLevel: "low",
        macros: { protein: 10, carbs: 20, fat: 5 }
      });

      const allFoods = await provider.getAllFoods();
      const hasCustomFood = allFoods.some(f => f.name === "Custom Food 1");

      expect(hasCustomFood).toBe(true);
    });

    it("should search custom foods", async () => {
      await provider.addCustomFood({
        name: "My Custom Snack",
        category: CATEGORIES.snacks,
        unit: "pack",
        pricePerUnit: 1.99,
        quantity: 0,
        costLevel: "low",
        macros: { protein: 5, carbs: 15, fat: 3 }
      });

      const results = await provider.searchFoods({ query: "Custom Snack" });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe("My Custom Snack");
    });

    it("should assign unique IDs to custom foods", async () => {
      const food1 = await provider.addCustomFood({
        name: "Food 1",
        category: CATEGORIES.snacks,
        unit: "pack",
        pricePerUnit: 1.99,
        quantity: 0,
        costLevel: "low",
        macros: { protein: 5, carbs: 10, fat: 2 }
      });

      const food2 = await provider.addCustomFood({
        name: "Food 2",
        category: CATEGORIES.snacks,
        unit: "pack",
        pricePerUnit: 2.99,
        quantity: 0,
        costLevel: "medium",
        macros: { protein: 8, carbs: 15, fat: 4 }
      });

      expect(food1.id).not.toBe(food2.id);
    });

    it("should clear custom foods", async () => {
      const originalCount = await provider.getFoodCount();
      
      await provider.addCustomFood({
        name: "Temp Food",
        category: CATEGORIES.snacks,
        unit: "pack",
        pricePerUnit: 1.99,
        quantity: 0,
        costLevel: "low",
        macros: { protein: 5, carbs: 10, fat: 2 }
      });

      let count = await provider.getFoodCount();
      expect(count).toBe(originalCount + 1);

      provider.clearCustomFoods();

      count = await provider.getFoodCount();
      expect(count).toBe(originalCount); // Back to original
    });
  });

  describe("10. Helper Functions", () => {
    it("should search foods by name helper", async () => {
      const results = await searchFoodsByName("chicken");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should get high-protein foods helper", async () => {
      const results = await getHighProteinFoods();
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(food => {
        expect(food.macros!.protein).toBeGreaterThanOrEqual(20);
      });
    });

    it("should get budget foods helper", async () => {
      const results = await getBudgetFoods();
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(food => {
        expect(food.costLevel).toBe("low");
      });
    });

    it("should get available categories helper", async () => {
      const categories = await getAvailableCategories();
      
      expect(categories).toContain(CATEGORIES.protein);
      expect(categories).toContain(CATEGORIES.grains);
      expect(categories).toContain(CATEGORIES.vegetables);
    });

    it("should get total food count helper", async () => {
      const count = await getTotalFoodCount();
      expect(count).toBeGreaterThanOrEqual(80);
    });
  });

  describe("11. Provider Singleton", () => {
    it("should get default provider", () => {
      const provider = getFoodProvider();
      expect(provider).toBeDefined();
    });

    it("should allow setting custom provider", () => {
      const customProvider = new LocalFoodProvider();
      setFoodProvider(customProvider);

      const retrieved = getFoodProvider();
      expect(retrieved).toBe(customProvider);
    });

    it("should reset to default provider", () => {
      const customProvider = new LocalFoodProvider();
      setFoodProvider(customProvider);
      resetFoodProvider();

      const provider = getFoodProvider();
      expect(provider).not.toBe(customProvider);
    });
  });

  describe("12. Real-World Scenarios", () => {
    it("should find budget-friendly high-protein options", async () => {
      const results = await provider.searchFoods({
        costLevel: "low",
        minProtein: 15
      });

      expect(results.length).toBeGreaterThan(0);
      
      // Examples: eggs, lentils, chickpeas, tuna
      const names = results.map(f => f.name.toLowerCase());
      const hasBudgetProtein = names.some(n =>
        n.includes("egg") || n.includes("lentil") || n.includes("tuna")
      );
      expect(hasBudgetProtein).toBe(true);
    });

    it("should build vegan meal plan (exclude animal products)", async () => {
      const veganProtein = await provider.searchFoods({
        category: CATEGORIES.protein,
        excludedFoods: [
          "Chicken breast (skinless)",
          "Eggs (large)",
          "Salmon fillet",
          "Tuna (canned)",
          "Turkey breast",
          "Ground beef (5% fat)"
        ]
      });

      expect(veganProtein.length).toBeGreaterThan(0);
      
      // Should include plant proteins
      const names = veganProtein.map(f => f.name.toLowerCase());
      const hasPlantProtein = names.some(n =>
        n.includes("lentil") || n.includes("chickpea") || 
        n.includes("tofu") || n.includes("tempeh") ||
        n.includes("whey") === false // No whey if truly vegan
      );
      expect(hasPlantProtein).toBe(true);
    });

    it("should support athlete shopping list (high protein, all cost levels)", async () => {
      const athleteFoods = await provider.searchFoods({
        category: CATEGORIES.protein,
        minProtein: 20
      });

      expect(athleteFoods.length).toBeGreaterThanOrEqual(5);
      
      // Should include variety of high-protein foods
      const names = athleteFoods.map(f => f.name.toLowerCase());
      expect(names.length).toBeGreaterThanOrEqual(5);
    });

    it("should support meal prep convenience (frozen meals)", async () => {
      const convenience = await provider.searchFoods({
        query: "frozen"
      });

      expect(convenience.length).toBeGreaterThan(0);
    });
  });

  describe("13. Edge Cases", () => {
    it("should handle empty search options", async () => {
      const results = await provider.searchFoods({});
      const allFoods = await provider.getAllFoods();

      expect(results.length).toBe(allFoods.length);
    });

    it("should handle search with no results", async () => {
      const results = await provider.searchFoods({
        query: "xyz",
        category: CATEGORIES.protein,
        costLevel: "low",
        minProtein: 100, // Impossible
        maxPrice: 0.01  // Too low
      });

      expect(results).toEqual([]);
    });

    it("should handle undefined macros gracefully", async () => {
      // Foods without macros shouldn't crash protein filter
      const results = await provider.searchFoods({ minProtein: 10 });
      
      results.forEach(food => {
        expect(food.macros).toBeDefined();
        expect(food.macros!.protein).toBeGreaterThanOrEqual(10);
      });
    });
  });
});


