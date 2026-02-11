import { describe, it, expect } from 'vitest';
import { generateShoppingList, calculateTotalCost } from '../core/logic/generateShoppingList';
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
    const shoppingList = generateShoppingList(weeklyPlan);

    // Validações básicas
    expect(shoppingList).toBeDefined();
    expect(shoppingList.length).toBeGreaterThan(0);
    
    // Todos os itens devem ter categoria
    shoppingList.forEach(item => {
      expect(item.category).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.quantity).toBeGreaterThan(0);
      expect(item.pricePerUnit).toBeGreaterThan(0);
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
    const shoppingList = generateShoppingList(weeklyPlan);

    // Extrai categorias únicas
    const categories = new Set(shoppingList.map(item => item.category));
    
    // Deve ter múltiplas categorias
    expect(categories.size).toBeGreaterThan(1);
  });

  it('should calculate correct total cost', () => {
    const input: PlanInput = {
      numberOfPeople: 2,
      dietStyle: 'balanced',
      budget: 300,
      restrictions: []
    };

    const weeklyPlan = generateWeeklyPlan(input);
    const shoppingList = generateShoppingList(weeklyPlan);
    const totalCost = calculateTotalCost(shoppingList);

    // Custo deve ser positivo
    expect(totalCost).toBeGreaterThan(0);
    
    // Custo deve ser número com 2 casas decimais
    expect(totalCost).toBe(Math.round(totalCost * 100) / 100);
  });
});
