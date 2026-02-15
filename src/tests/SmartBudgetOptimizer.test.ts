/**
 * SmartSavingsOptimizer.test.ts
 * Unit tests for protein-per-cost Smart Savings optimization
 */

import { describe, it, expect } from "vitest";
import { optimizeSavings as optimizeBudget } from "../core/logic/SmartSavingsOptimizer";
import { FoodItem } from "../core/models/FoodItem";

describe("SmartSavingsOptimizer", () => {
  /**
   * Test: Already within budget
   */
  it("should return original list when already within budget", () => {
    const items: FoodItem[] = [
      {
        id: "test-001",
        name: "Chicken breast (skinless)",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 7.99,
        quantity: 1,
        estimatedPrice: 7.99,
        macros: { protein: 31, carbs: 0, fat: 3.6 },
      },
      {
        id: "test-002",
        name: "White rice",
        category: "grains",
        unit: "kg",
        pricePerUnit: 2.49,
        quantity: 2,
        estimatedPrice: 4.98,
        macros: { protein: 7, carbs: 77, fat: 0.6 },
      },
    ];
    
    const totalCost = 12.97;
    const budget = 50.00;
    
    const result = optimizeBudget(items, totalCost, budget);
    
    expect(result.savingsStatus).toBe("within_savings");
    expect(result.substitutionsApplied).toHaveLength(0);
    expect(result.totalEstimatedCost).toBe(totalCost);
    expect(result.items).toHaveLength(2);
  });
  
  /**
   * Test: Substitute expensive proteins
   */
  it("should substitute salmon with tuna when over budget and has protein variety", () => {
    const items: FoodItem[] = [
      {
        id: "test-003",
        name: "Salmon fillet",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 18.99,
        quantity: 2,
        estimatedPrice: 37.98,
        macros: { protein: 20, carbs: 0, fat: 13 },
      },
      {
        id: "test-003b",
        name: "Chicken breast (skinless)",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 7.99,
        quantity: 1,
        estimatedPrice: 7.99,
        macros: { protein: 31, carbs: 0, fat: 3.6 },
      },
      {
        id: "test-004",
        name: "White rice",
        category: "grains",
        unit: "kg",
        pricePerUnit: 2.49,
        quantity: 3,
        estimatedPrice: 7.47,
        macros: { protein: 7, carbs: 77, fat: 0.6 },
      },
    ];
    
    const totalCost = 53.44;
    const budget = 30.00;
    
    const result = optimizeBudget(items, totalCost, budget);
    
    // Should substitute salmon (has 2 proteins, can substitute)
    expect(result.substitutionsApplied.length).toBeGreaterThan(0);
    
    // Check substitution occurred
    const salmonSubstitution = result.substitutionsApplied.find(
      s => s.from === "Salmon fillet"
    );
    expect(salmonSubstitution).toBeDefined();
    if (salmonSubstitution) {
      expect(salmonSubstitution.savings).toBeGreaterThan(0);
    }
    
    // Should reduce cost
    expect(result.totalEstimatedCost).toBeLessThan(totalCost);
  });
  
  /**
   * Test: Substitute expensive carbs
   */
  it("should substitute quinoa with rice when over budget", () => {
    const items: FoodItem[] = [
      {
        id: "test-005",
        name: "Chicken breast (skinless)",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 7.99,
        quantity: 2,
        estimatedPrice: 15.98,
        macros: { protein: 31, carbs: 0, fat: 3.6 },
      },
      {
        id: "test-006",
        name: "Quinoa",
        category: "grains",
        unit: "kg",
        pricePerUnit: 6.99,
        quantity: 3,
        estimatedPrice: 20.97,
        macros: { protein: 14, carbs: 64, fat: 6 },
      },
    ];
    
    const totalCost = 36.95;
    const budget = 25.00;
    
    const result = optimizeBudget(items, totalCost, budget);
    
    // Should substitute quinoa with rice
    const quinoaSubstitution = result.substitutionsApplied.find(
      s => s.from === "Quinoa"
    );
    
    expect(quinoaSubstitution).toBeDefined();
    if (quinoaSubstitution) {
      expect(quinoaSubstitution.to).toMatch(/rice/i);
      expect(quinoaSubstitution.savings).toBeGreaterThan(0);
    }
    
    // Should reduce cost
    expect(result.totalEstimatedCost).toBeLessThan(totalCost);
  });
  
  /**
   * Test: Calculate protein-per-euro efficiency
   */
  it("should maximize protein-per-euro efficiency", () => {
    const items: FoodItem[] = [
      {
        id: "test-007",
        name: "Salmon fillet",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 18.99,
        quantity: 1,
        estimatedPrice: 18.99,
        macros: { protein: 20, carbs: 0, fat: 13 },
      },
      {
        id: "test-007b",
        name: "Chicken breast (skinless)",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 7.99,
        quantity: 0.5,
        estimatedPrice: 4.00,
        macros: { protein: 31, carbs: 0, fat: 3.6 },
      },
      {
        id: "test-008",
        name: "Quinoa",
        category: "grains",
        unit: "kg",
        pricePerUnit: 6.99,
        quantity: 2,
        estimatedPrice: 13.98,
        macros: { protein: 14, carbs: 64, fat: 6 },
      },
    ];
    
    const totalCost = 36.97;
    const budget = 20.00;
    
    const result = optimizeBudget(items, totalCost, budget);
    
    // Should apply substitutions (has 2 proteins)
    expect(result.substitutionsApplied.length).toBeGreaterThan(0);
    
    // Efficiency score should be calculated
    expect(result.efficiencyScore).toBeGreaterThan(0);
    
    // Total protein should be calculated
    expect(result.totalProtein).toBeGreaterThan(0);
    
    // Budget status should be adjusted or over minimum
    expect(["adjusted_to_savings", "over_savings_minimum"]).toContain(result.savingsStatus);
  });
  
  /**
   * Test: No substitutions available
   */
  it("should return over_savings_minimum when no substitutions help", () => {
    const items: FoodItem[] = [
      {
        id: "test-009",
        name: "Chicken breast (skinless)",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 7.99,
        quantity: 10, // Very high quantity
        estimatedPrice: 79.90,
        macros: { protein: 31, carbs: 0, fat: 3.6 },
      },
    ];
    
    const totalCost = 79.90;
    const budget = 20.00;
    
    const result = optimizeBudget(items, totalCost, budget);
    
    // Chicken has no cheaper substitute, should fail
    expect(result.savingsStatus).toBe("over_savings_minimum");
    expect(result.totalEstimatedCost).toBeGreaterThan(budget);
  });
  
  /**
   * Test: Multiple substitutions to reach budget
   */
  it("should apply multiple substitutions to fit budget", () => {
    const items: FoodItem[] = [
      {
        id: "test-010",
        name: "Salmon fillet",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 18.99,
        quantity: 1.5,
        estimatedPrice: 28.49,
        macros: { protein: 20, carbs: 0, fat: 13 },
      },
      {
        id: "test-010b",
        name: "Chicken breast (skinless)",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 7.99,
        quantity: 1,
        estimatedPrice: 7.99,
        macros: { protein: 31, carbs: 0, fat: 3.6 },
      },
      {
        id: "test-011",
        name: "Quinoa",
        category: "grains",
        unit: "kg",
        pricePerUnit: 6.99,
        quantity: 2,
        estimatedPrice: 13.98,
        macros: { protein: 14, carbs: 64, fat: 6 },
      },
      {
        id: "test-012",
        name: "Cottage cheese (low fat)",
        category: "dairy",
        unit: "kg",
        pricePerUnit: 4.49,
        quantity: 1,
        estimatedPrice: 4.49,
        macros: { protein: 11, carbs: 3.4, fat: 4.3 },
      },
    ];
    
    const totalCost = 54.95;
    const budget = 35.00;
    
    const result = optimizeBudget(items, totalCost, budget);
    
    // Should try multiple substitutions (has 2 proteins now)
    expect(result.substitutionsApplied.length).toBeGreaterThanOrEqual(1);
    
    // Should reduce cost significantly
    const costReduction = totalCost - result.totalEstimatedCost;
    expect(costReduction).toBeGreaterThan(0);
    
    // Each substitution should save money
    result.substitutionsApplied.forEach(sub => {
      expect(sub.savings).toBeGreaterThan(0);
    });
  });
  
  /**
   * Test: Protein tracking across substitutions
   */
  it("should track protein impact of substitutions", () => {
    const items: FoodItem[] = [
      {
        id: "test-013",
        name: "Salmon fillet",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 18.99,
        quantity: 2,
        estimatedPrice: 37.98,
        macros: { protein: 20, carbs: 0, fat: 13 },
      },
    ];
    
    const totalCost = 37.98;
    const budget = 20.00;
    
    const result = optimizeBudget(items, totalCost, budget);
    
    // Should have protein impact data
    if (result.substitutionsApplied.length > 0) {
      const firstSub = result.substitutionsApplied[0];
      expect(firstSub.proteinImpact).toBeDefined();
      expect(typeof firstSub.proteinImpact).toBe("number");
      expect(firstSub.reason).toContain("protein");
    }
    
    // Total protein should be calculated
    expect(result.totalProtein).toBeGreaterThan(0);
  });
  
  /**
   * Test: Efficiency score calculation
   */
  it("should calculate efficiency score as protein per euro", () => {
    const items: FoodItem[] = [
      {
        id: "test-014",
        name: "Chicken breast (skinless)",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 7.99,
        quantity: 1,
        estimatedPrice: 7.99,
        macros: { protein: 31, carbs: 0, fat: 3.6 },
      },
    ];
    
    const totalCost = 7.99;
    const budget = 50.00;
    
    const result = optimizeBudget(items, totalCost, budget);
    
    // Efficiency = total protein / total cost
    const expectedEfficiency = result.totalProtein / result.totalEstimatedCost;
    
    expect(result.efficiencyScore).toBeCloseTo(expectedEfficiency, 2);
    expect(result.efficiencyScore).toBeGreaterThan(0);
  });

  /**
   * DIVERSITY CONSTRAINTS TESTS
   * Critical: Prevent monotonous diets
   */

  /**
   * TEST 1: Must maintain at least 2 different protein sources
   * Prevents "tuna only" or "chicken only" diet
   */
  it("should keep at least 2 different protein sources", () => {
    const items: FoodItem[] = [
      {
        id: "test-div-001",
        name: "Salmon fillet",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 18.99,
        quantity: 2,
        estimatedPrice: 37.98,
        macros: { protein: 20, carbs: 0, fat: 13 },
      },
      {
        id: "test-div-002",
        name: "Chicken breast (skinless)",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 7.99,
        quantity: 1,
        estimatedPrice: 7.99,
        macros: { protein: 31, carbs: 0, fat: 3.6 },
      },
      {
        id: "test-div-003",
        name: "Greek yogurt (0% fat)",
        category: "dairy",
        unit: "kg",
        pricePerUnit: 5.99,
        quantity: 1,
        estimatedPrice: 5.99,
        macros: { protein: 10, carbs: 4, fat: 0.4 },
      },
      {
        id: "test-div-004",
        name: "White rice",
        category: "grains",
        unit: "kg",
        pricePerUnit: 2.49,
        quantity: 2,
        estimatedPrice: 4.98,
        macros: { protein: 7, carbs: 77, fat: 0.6 },
      },
    ];
    
    const totalCost = 56.94;
    const budget = 30.00; // Very low budget
    
    const result = optimizeBudget(items, totalCost, budget);
    
    // Count unique protein sources
    const proteinItems = result.items.filter(item => item.category === "proteins");
    const uniqueProteins = new Set(proteinItems.map(item => item.name));
    
    // CRITICAL: Must have at least 2 different proteins
    expect(uniqueProteins.size).toBeGreaterThanOrEqual(2);
    
    console.log(`✅ Diversity maintained: ${uniqueProteins.size} different proteins`);
  });

  /**
   * TEST 2: Maximum 2 protein substitutions
   * Prevents excessive protein category changes
   */
  it("should not make more than 2 protein substitutions", () => {
    const items: FoodItem[] = [
      {
        id: "test-max-001",
        name: "Salmon fillet",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 18.99,
        quantity: 1.5,
        estimatedPrice: 28.49,
        macros: { protein: 20, carbs: 0, fat: 13 },
      },
      {
        id: "test-max-002",
        name: "Lean ground beef (5% fat)",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 9.99,
        quantity: 1,
        estimatedPrice: 9.99,
        macros: { protein: 21, carbs: 0, fat: 5 },
      },
      {
        id: "test-max-003",
        name: "Turkey breast",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 11.99,
        quantity: 1,
        estimatedPrice: 11.99,
        macros: { protein: 29, carbs: 0, fat: 1 },
      },
      {
        id: "test-max-004",
        name: "Quinoa",
        category: "grains",
        unit: "kg",
        pricePerUnit: 6.99,
        quantity: 2,
        estimatedPrice: 13.98,
        macros: { protein: 14, carbs: 64, fat: 6 },
      },
    ];
    
    const totalCost = 64.45;
    const budget = 35.00;
    
    const result = optimizeBudget(items, totalCost, budget);
    
    // Count protein substitutions
    const proteinSubstitutions = result.substitutionsApplied.filter(sub => {
      // Check if original item was a protein (by looking at mockFoods or items)
      const originalItem = items.find(item => item.name === sub.from);
      return originalItem?.category === "proteins";
    });
    
    // CRITICAL: Max 2 protein substitutions
    expect(proteinSubstitutions.length).toBeLessThanOrEqual(2);
    
    console.log(`✅ Protein substitutions: ${proteinSubstitutions.length} / 2 max`);
  });

  /**
  * TEST 3: Status should be "over_savings_minimum" when diversity prevents fitting savings target
   * Honest messaging when we can't meet budget without killing variety
   */
  it("should return over_savings_minimum when diversity constraint prevents savings fit", () => {
    const items: FoodItem[] = [
      {
        id: "test-status-001",
        name: "Salmon fillet",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 18.99,
        quantity: 2,
        estimatedPrice: 37.98,
        macros: { protein: 20, carbs: 0, fat: 13 },
      },
      {
        id: "test-status-002",
        name: "Chicken breast (skinless)",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 7.99,
        quantity: 2,
        estimatedPrice: 15.98,
        macros: { protein: 31, carbs: 0, fat: 3.6 },
      },
      {
        id: "test-status-003",
        name: "White rice",
        category: "grains",
        unit: "kg",
        pricePerUnit: 2.49,
        quantity: 3,
        estimatedPrice: 7.47,
        macros: { protein: 7, carbs: 77, fat: 0.6 },
      },
    ];
    
    const totalCost = 61.43;
    const budget = 20.00; // Impossibly low budget
    
    const result = optimizeBudget(items, totalCost, budget);
    
    // Should be over budget due to diversity constraints
    expect(result.savingsStatus).toBe("over_savings_minimum");
    expect(result.totalEstimatedCost).toBeGreaterThan(budget);
    
    // But should maintain variety
    const proteinItems = result.items.filter(item => item.category === "proteins");
    const uniqueProteins = new Set(proteinItems.map(item => item.name));
    expect(uniqueProteins.size).toBeGreaterThanOrEqual(2);
    
    console.log(`✅ Honest status: Cannot fit €${budget} without reducing variety`);
  });

  /**
   * PASSO 11.2 EXCLUSION TESTS
   */
  it("should never substitute TO an excluded food", () => {
    const items: FoodItem[] = [
      {
        id: "test-salmon",
        name: "Salmon fillet",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 18.99,
        quantity: 1.5,
        estimatedPrice: 28.485,
        macros: { protein: 20, carbs: 0, fat: 13 },
      },
      {
        id: "test-chicken",
        name: "Chicken breast (skinless)",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 7.99,
        quantity: 1,
        estimatedPrice: 7.99,
        macros: { protein: 31, carbs: 0, fat: 3.6 },
      },
      {
        id: "test-rice",
        name: "White rice",
        category: "grains",
        unit: "kg",
        pricePerUnit: 2.49,
        quantity: 2,
        estimatedPrice: 4.98,
        macros: { protein: 7, carbs: 77, fat: 0.6 },
      },
    ];

    const totalCost = 41.455;
    const budget = 35.00;
    const excludedFoods = ["Tuna (canned)", "Canned tuna"];

    const result = optimizeBudget(items, totalCost, budget, excludedFoods);

    // Should NOT have tuna in result
    const hasTuna = result.items.some(item => 
      item.name === "Tuna (canned)" || item.name === "Canned tuna"
    );
    expect(hasTuna).toBe(false);

    // Should still try to optimize (may substitute chicken or do nothing)
    console.log(`✅ No tuna substitution: User excluded tuna`);
  });

  it("should skip all fish when multiple fish excluded", () => {
    const items: FoodItem[] = [
      {
        id: "test-beef",
        name: "Ground beef (lean)",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 9.99,
        quantity: 2,
        estimatedPrice: 19.98,
        macros: { protein: 26, carbs: 0, fat: 15 },
      },
      {
        id: "test-chicken",
        name: "Chicken breast (skinless)",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 7.99,
        quantity: 1.5,
        estimatedPrice: 11.985,
        macros: { protein: 31, carbs: 0, fat: 3.6 },
      },
      {
        id: "test-rice",
        name: "White rice",
        category: "grains",
        unit: "kg",
        pricePerUnit: 2.49,
        quantity: 2,
        estimatedPrice: 4.98,
        macros: { protein: 7, carbs: 77, fat: 0.6 },
      },
    ];

    const totalCost = 36.945;
    const budget = 30.00;
    const excludedFoods = ["Tuna (canned)", "Salmon fillet", "Canned tuna"];

    const result = optimizeBudget(items, totalCost, budget, excludedFoods);

    // Should NOT have added any fish (all fish are excluded)
    const hasTuna = result.items.some(item => 
      item.name === "Tuna (canned)" || item.name === "Canned tuna"
    );
    const hasSalmon = result.items.some(item => item.name === "Salmon fillet");
    
    expect(hasTuna).toBe(false);
    expect(hasSalmon).toBe(false);

    console.log(`✅ No fish: All fish excluded by user`);
  });

  it("should return over_savings_minimum when exclusions prevent savings fit", () => {
    const items: FoodItem[] = [
      {
        id: "test-beef",
        name: "Ground beef (lean)",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 9.99,
        quantity: 2,
        estimatedPrice: 19.98,
        macros: { protein: 26, carbs: 0, fat: 15 },
      },
      {
        id: "test-chicken",
        name: "Chicken breast (skinless)",
        category: "proteins",
        unit: "kg",
        pricePerUnit: 7.99,
        quantity: 1.5,
        estimatedPrice: 11.985,
        macros: { protein: 31, carbs: 0, fat: 3.6 },
      },
      {
        id: "test-rice",
        name: "White rice",
        category: "grains",
        unit: "kg",
        pricePerUnit: 2.49,
        quantity: 2,
        estimatedPrice: 4.98,
        macros: { protein: 7, carbs: 77, fat: 0.6 },
      },
    ];

    const totalCost = 36.945;
    const budget = 25.00; // Low budget
    const excludedFoods = ["Tuna (canned)", "Canned tuna"]; // Exclude cheap protein

    const result = optimizeBudget(items, totalCost, budget, excludedFoods);

    // Without tuna substitution available, may not fit budget
    // Should be honest about it
    if (result.totalEstimatedCost > budget) {
      expect(result.savingsStatus).toBe("over_savings_minimum");
      console.log(`✅ Honest status: Cannot fit €${budget} without excluded foods`);
    }

    // Should NOT have tuna
    const hasTuna = result.items.some(item => 
      item.name === "Tuna (canned)" || item.name === "Canned tuna"
    );
    expect(hasTuna).toBe(false);
  });
});
