/**
 * SmartBudgetOptimizer.test.ts
 * Unit tests for protein-per-euro budget optimization
 */

import { describe, it, expect } from "vitest";
import { optimizeBudget } from "../core/logic/SmartBudgetOptimizer";
import { FoodItem } from "../core/models/FoodItem";

describe("SmartBudgetOptimizer", () => {
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
    
    expect(result.budgetStatus).toBe("within_budget");
    expect(result.substitutionsApplied).toHaveLength(0);
    expect(result.totalEstimatedCost).toBe(totalCost);
    expect(result.items).toHaveLength(2);
  });
  
  /**
   * Test: Substitute expensive proteins
   */
  it("should substitute salmon with tuna when over budget", () => {
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
    
    const totalCost = 45.45;
    const budget = 30.00;
    
    const result = optimizeBudget(items, totalCost, budget);
    
    // Should substitute salmon
    expect(result.substitutionsApplied.length).toBeGreaterThan(0);
    
    // Check first substitution
    const substitution = result.substitutionsApplied[0];
    expect(substitution.from).toBe("Salmon fillet");
    expect(substitution.to).toContain("Tuna"); // Tuna or Chicken
    expect(substitution.savings).toBeGreaterThan(0);
    
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
    
    const totalCost = 32.97;
    const budget = 20.00;
    
    const result = optimizeBudget(items, totalCost, budget);
    
    // Should apply substitutions
    expect(result.substitutionsApplied.length).toBeGreaterThan(0);
    
    // Efficiency score should be calculated
    expect(result.efficiencyScore).toBeGreaterThan(0);
    
    // Total protein should be calculated
    expect(result.totalProtein).toBeGreaterThan(0);
    
    // Budget status should be adjusted or over minimum
    expect(["adjusted_to_fit", "over_budget_minimum"]).toContain(result.budgetStatus);
  });
  
  /**
   * Test: No substitutions available
   */
  it("should return over_budget_minimum when no substitutions help", () => {
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
    expect(result.budgetStatus).toBe("over_budget_minimum");
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
    
    const totalCost = 46.96;
    const budget = 30.00;
    
    const result = optimizeBudget(items, totalCost, budget);
    
    // Should try multiple substitutions
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
});
