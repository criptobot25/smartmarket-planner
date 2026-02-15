import { describe, it, expect } from 'vitest';
import { suggestRecipes } from '../core/logic/suggestRecipes';
import { FoodItem } from '../core/models/FoodItem';

describe('suggestRecipes', () => {
  it('should return at least 3 recipe suggestions', () => {
    const items: FoodItem[] = [
      {
        id: 'food-007',
        name: 'Ovos',
        category: 'proteins',
        unit: 'dúzia',
        pricePerUnit: 12.00,
        quantity: 1,
        costLevel: 'high' as const
      },
      {
        id: 'food-003',
        name: 'Aveia em flocos',
        category: 'grains',
        unit: 'kg',
        pricePerUnit: 8.50,
        quantity: 0.5,
        costLevel: 'high' as const
      }
    ];

    const suggestions = suggestRecipes(items);

    // Deve retornar pelo menos 3 sugestões
    expect(suggestions.length).toBeGreaterThanOrEqual(3);
    
    // Todas as sugestões devem ter estrutura válida
    suggestions.forEach(recipe => {
      expect(recipe.id).toBeDefined();
      expect(recipe.name).toBeDefined();
      expect(recipe.ingredients).toBeDefined();
      expect(recipe.ingredients.length).toBeGreaterThan(0);
    });
  });

  it('should return recipes compatible with available ingredients', () => {
    const items: FoodItem[] = [
      {
        id: 'food-007',
        name: 'Ovos',
        category: 'proteins',
        unit: 'dúzia',
        pricePerUnit: 12.00,
        quantity: 2,
        costLevel: 'high' as const
      },
      {
        id: 'food-011',
        name: 'Tomate',
        category: 'vegetables',
        unit: 'kg',
        pricePerUnit: 6.00,
        quantity: 0.5,
        costLevel: 'medium' as const
      },
      {
        id: 'food-012',
        name: 'Cebola',
        category: 'vegetables',
        unit: 'kg',
        pricePerUnit: 4.00,
        quantity: 0.3,
        costLevel: 'medium' as const
      },
      {
        id: 'food-028',
        name: 'Óleo de soja',
        category: 'oils',
        unit: 'L',
        pricePerUnit: 8.00,
        quantity: 0.5,
        costLevel: 'high' as const
      },
      {
        id: 'food-029',
        name: 'Sal',
        category: 'spices',
        unit: 'kg',
        pricePerUnit: 2.00,
        quantity: 1,
        costLevel: 'low' as const
      }
    ];

    const suggestions = suggestRecipes(items);

    // Deve retornar receitas
    expect(suggestions.length).toBeGreaterThan(0);
    
    // Pelo menos uma receita deve ter ingredientes compatíveis
    const hasCompatibleRecipe = suggestions.some(recipe => {
      const matchedIngredients = recipe.ingredients.filter(ingredient =>
        items.some(item => item.id === ingredient.foodItemId)
      );
      return matchedIngredients.length > 0;
    });
    
    expect(hasCompatibleRecipe).toBe(true);
  });

  it('should work with empty ingredient list', () => {
    const emptyList: FoodItem[] = [];
    const suggestions = suggestRecipes(emptyList);

    // Mesmo sem ingredientes, deve retornar sugestões padrão
    expect(suggestions.length).toBeGreaterThanOrEqual(3);
  });
});
