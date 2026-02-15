import { describe, it, expect } from 'vitest';
import { generateShoppingList } from '../core/logic/generateShoppingList';
import { generateWeeklyPlan } from '../core/logic/generateWeeklyPlan';
import { PlanInput } from '../core/models/PlanInput';
import { getCostTier } from '../core/utils/getCostTier';

describe('generateShoppingList', () => {
  it('should generate shopping list with categorized items', () => {
    const input: PlanInput = {
      numberOfPeople: 2,
      sex: "male",
      weightKg: 80,
      mealsPerDay: 4,
      dietStyle: 'balanced',
      budget: 300,
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
      numberOfPeople: 2,
      sex: "female",
      weightKg: 65,
      mealsPerDay: 3,
      dietStyle: 'healthy',
      budget: 300,
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
      numberOfPeople: 2,
      sex: "male",
      weightKg: 85,
      mealsPerDay: 5,
      dietStyle: 'balanced',
      budget: 300,
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
      numberOfPeople: 2,
      sex: "female",
      weightKg: 62,
      mealsPerDay: 4,
      dietStyle: 'balanced',
      budget: 40, // Very low budget to force adjustments
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
      numberOfPeople: 1,
      sex: "male",
      weightKg: 75,
      mealsPerDay: 3,
      dietStyle: 'balanced',
      budget: 500, // High budget
      restrictions: [],
      fitnessGoal: 'cutting'
    };

    const weeklyPlan = generateWeeklyPlan(input);
    const result = generateShoppingList(input, weeklyPlan);

    expect(result.savingsStatus).toBe('within_savings');
    expect(result.substitutionsApplied).toHaveLength(0);
  });
});
