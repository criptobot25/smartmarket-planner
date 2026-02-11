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
    const { items, totalEstimatedCost } = generateShoppingList(input, weeklyPlan);

    // Validações básicas
    expect(items).toBeDefined();
    expect(items.length).toBeGreaterThan(0);
    expect(totalEstimatedCost).toBeGreaterThan(0);
    
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
});
