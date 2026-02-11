import { describe, it, expect } from 'vitest';
import { generateShoppingList } from '../core/logic/generateShoppingList';
import { generateWeeklyPlan } from '../core/logic/generateWeeklyPlan';
import { PlanInput } from '../core/models/PlanInput';

describe('generateShoppingList', () => {
  it('should generate shopping list with categorized items', () => {
    const input: PlanInput = {
      numberOfPeople: 2,
      dietStyle: 'balanced',
      budget: 300,
      restrictions: []
    };

    const weeklyPlan = generateWeeklyPlan(input);
    const { items, totalEstimatedCost, budgetStatus, adjustmentsMade } = generateShoppingList(input, weeklyPlan);

    // Validações básicas
    expect(items).toBeDefined();
    expect(items.length).toBeGreaterThan(0);
    expect(totalEstimatedCost).toBeGreaterThan(0);
    expect(budgetStatus).toBeDefined();
    expect(adjustmentsMade).toBeDefined();
    
    // Todos os itens devem ter categoria, reason e estimatedPrice
    items.forEach(item => {
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

  it('should calculate correct total cost', () => {
    const input: PlanInput = {
      numberOfPeople: 2,
      dietStyle: 'balanced',
      budget: 300,
      restrictions: [],
      fitnessGoal: 'bulking'
    };

    const weeklyPlan = generateWeeklyPlan(input);
    const { items, totalEstimatedCost } = generateShoppingList(input, weeklyPlan);

    // Custo deve ser positivo
    expect(totalEstimatedCost).toBeGreaterThan(0);
    
    // Total deve ser soma dos estimatedPrice
    const manualTotal = items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
    expect(totalEstimatedCost).toBeCloseTo(manualTotal, 2);
  });

  it('should apply budget adjustments when cost exceeds budget', () => {
    const input: PlanInput = {
      numberOfPeople: 2,
      dietStyle: 'balanced',
      budget: 40, // Very low budget to force adjustments
      restrictions: [],
      fitnessGoal: 'cutting'
    };

    const weeklyPlan = generateWeeklyPlan(input);
    const { totalEstimatedCost, budgetStatus } = generateShoppingList(input, weeklyPlan);

    // Should attempt to fit budget or mark as over_budget_minimum
    expect(budgetStatus).toMatch(/adjusted_to_fit|over_budget_minimum/);
    
    // If budget is too low, status should be over_budget_minimum
    if (budgetStatus === 'over_budget_minimum') {
      expect(totalEstimatedCost).toBeGreaterThan(input.budget);
      console.log(`Note: Minimum cost €${totalEstimatedCost} exceeds budget €${input.budget}`);
    }
    
    // Cost should not increase (substitutions should reduce or maintain cost)
    expect(totalEstimatedCost).toBeLessThanOrEqual(200); // Sanity check
  });

  it('should return within_budget status when cost is under budget', () => {
    const input: PlanInput = {
      numberOfPeople: 1,
      dietStyle: 'balanced',
      budget: 500, // High budget
      restrictions: [],
      fitnessGoal: 'cutting'
    };

    const weeklyPlan = generateWeeklyPlan(input);
    const { budgetStatus, adjustmentsMade } = generateShoppingList(input, weeklyPlan);

    expect(budgetStatus).toBe('within_budget');
    expect(adjustmentsMade).toHaveLength(0);
  });
});
