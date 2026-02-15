import { describe, it, expect } from 'vitest';
import { generateShoppingList } from '../core/logic/generateShoppingList';
import { generateWeeklyPlan } from '../core/logic/generateWeeklyPlan';
import { PlanInput } from '../core/models/PlanInput';
import { getCostTier } from '../core/utils/getCostTier';
import { mockFoods } from '../data/mockFoods';

describe('generateShoppingList', () => {
  it('should generate shopping list with categorized items', () => {
    const input: PlanInput = {
      sex: "male",
      age: 30,
      weightKg: 80,
      heightCm: 175,
      trains: true,
      mealsPerDay: 4,
      dietStyle: 'balanced',
      costTier: 'medium',
      restrictions: []
    };

    const weeklyPlan = generateWeeklyPlan(input);
    const result = generateShoppingList(input, weeklyPlan);

    // Validações básicas
    expect(result.items).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.costTier).toMatch(/low|medium|high/);
    expect(result.totalProtein).toBeGreaterThan(0);
    expect(result.efficiencyScore).toBeGreaterThan(0);
    expect(result.savingsStatus).toBeDefined();
    expect(result.substitutionsApplied).toBeDefined();
    
    // Todos os itens devem ter categoria, reason e estimatedPrice
    result.items.forEach(item => {
      expect(item.category).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.quantity).toBeGreaterThan(0);
      expect(item.pricePerUnit).toBeGreaterThan(0);
      expect(item.reason).toBeDefined();
      expect(item.estimatedPrice).toBeGreaterThan(0);
    });
  });

  it('should group items by category', () => {
    const input: PlanInput = {
      sex: "female",
      age: 28,
      weightKg: 65,
      heightCm: 165,
      trains: true,
      mealsPerDay: 3,
      dietStyle: 'healthy',
      costTier: 'low',
      restrictions: []
    };

    const weeklyPlan = generateWeeklyPlan(input);
    const { items } = generateShoppingList(input, weeklyPlan);

    // Extrai categorias únicas
    const categories = new Set(items.map(item => item.category));
    
    // Deve ter múltiplas categorias
    expect(categories.size).toBeGreaterThan(1);
  });

  it('should calculate correct cost tier', () => {
    const input: PlanInput = {
      sex: "male",
      age: 32,
      weightKg: 85,
      heightCm: 180,
      trains: true,
      mealsPerDay: 5,
      dietStyle: 'balanced',
      costTier: 'high',
      restrictions: [],
      fitnessGoal: 'bulking'
    };

    const weeklyPlan = generateWeeklyPlan(input);
    const { items, costTier } = generateShoppingList(input, weeklyPlan);

    const expectedTier = getCostTier(items);
    expect(costTier).toBe(expectedTier);
  });

  it('should apply Smart Savings adjustments when cost exceeds target', () => {
    const input: PlanInput = {
      sex: "female",
      age: 26,
      weightKg: 62,
      heightCm: 162,
      trains: true,
      mealsPerDay: 4,
      dietStyle: 'balanced',
      costTier: 'low',
      restrictions: [],
      fitnessGoal: 'cutting'
    };

    const weeklyPlan = generateWeeklyPlan(input);
    const { savingsStatus, costTier } = generateShoppingList(input, weeklyPlan);

    // Should attempt to fit budget or mark as over_budget_minimum
    expect(savingsStatus).toMatch(/adjusted_to_savings|over_savings_minimum/);
    expect(costTier).toMatch(/low|medium|high/);
  });

  it('should return within_savings status when cost is under target', () => {
    const input: PlanInput = {
      sex: "male",
      age: 29,
      weightKg: 75,
      heightCm: 178,
      trains: false,
      mealsPerDay: 3,
      dietStyle: 'balanced',
      costTier: 'high',
      restrictions: [],
      fitnessGoal: 'cutting'
    };

    const weeklyPlan = generateWeeklyPlan(input);
    const result = generateShoppingList(input, weeklyPlan);

    expect(result.savingsStatus).toBe('within_savings');
    expect(result.substitutionsApplied).toHaveLength(0);
  });

  it('should fallback to others for unexpected category', () => {
    const originalCategory = mockFoods[0].category;
    (mockFoods[0] as { category: unknown }).category = "mystery";

    const input: PlanInput = {
      sex: "female",
      age: 31,
      weightKg: 68,
      heightCm: 168,
      trains: true,
      mealsPerDay: 4,
      dietStyle: 'balanced',
      costTier: 'medium',
      restrictions: []
    };

    try {
      const weeklyPlan = generateWeeklyPlan(input);
      const result = generateShoppingList(input, weeklyPlan);
      expect(result.items.some(item => item.category === 'others')).toBe(true);
    } finally {
      mockFoods[0].category = originalCategory;
    }
  });
});
