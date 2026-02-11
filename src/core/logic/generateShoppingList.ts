import { WeeklyPlan } from "../models/WeeklyPlan";
import { FoodItem, FoodCategory } from "../models/FoodItem";
import { Recipe, RecipeIngredient } from "../models/Recipe";
import { mockFoods } from "../../data/mockFoods";
import { adjustIngredientQuantity } from "./calculateQuantities";

interface AggregatedIngredient {
  foodItemId: string;
  name: string;
  category: FoodCategory;
  unit: string;
  totalQuantity: number;
}

/**
 * Gera uma lista de compras consolidada baseada no plano semanal
 * 
 * @param weeklyPlan - Plano semanal com todas as refeições
 * @returns Lista de itens alimentares com quantidades ajustadas
 */
export function generateShoppingList(weeklyPlan: WeeklyPlan): FoodItem[] {
  const numberOfPeople = weeklyPlan.planInput.numberOfPeople;
  const aggregatedIngredients = new Map<string, AggregatedIngredient>();

  // Percorre todos os dias e refeições do plano
  weeklyPlan.days.forEach(dayPlan => {
    const meals = [
      dayPlan.meals.breakfast,
      dayPlan.meals.lunch,
      dayPlan.meals.dinner,
      dayPlan.meals.snack
    ];

    meals.forEach(recipe => {
      if (recipe) {
        processRecipeIngredients(
          recipe,
          numberOfPeople,
          aggregatedIngredients
        );
      }
    });
  });

  // Converte os ingredientes agregados em FoodItems
  const shoppingList = convertToFoodItems(aggregatedIngredients);

  // Organiza por categoria
  return sortByCategory(shoppingList);
}

/**
 * Processa os ingredientes de uma receita e agrega as quantidades
 * 
 * @param recipe - Receita a ser processada
 * @param numberOfPeople - Número de pessoas do plano
 * @param aggregatedIngredients - Map para acumular ingredientes
 */
function processRecipeIngredients(
  recipe: Recipe,
  numberOfPeople: number,
  aggregatedIngredients: Map<string, AggregatedIngredient>
): void {
  recipe.ingredients.forEach(ingredient => {
    // Ajusta quantidade baseado no número de pessoas
    const adjustedQuantity = adjustIngredientQuantity(
      ingredient.quantity,
      recipe.servings,
      numberOfPeople
    );

    // Verifica se já existe esse ingrediente agregado
    const existing = aggregatedIngredients.get(ingredient.foodItemId);

    if (existing) {
      // Soma a quantidade ao existente
      existing.totalQuantity += adjustedQuantity;
    } else {
      // Adiciona novo ingrediente
      aggregatedIngredients.set(ingredient.foodItemId, {
        foodItemId: ingredient.foodItemId,
        name: ingredient.name,
        category: ingredient.category,
        unit: ingredient.unit,
        totalQuantity: adjustedQuantity
      });
    }
  });
}

/**
 * Converte ingredientes agregados em FoodItems com preços
 * 
 * @param aggregatedIngredients - Map de ingredientes agregados
 * @returns Array de FoodItems
 */
function convertToFoodItems(
  aggregatedIngredients: Map<string, AggregatedIngredient>
): FoodItem[] {
  const foodItems: FoodItem[] = [];

  aggregatedIngredients.forEach(ingredient => {
    // Busca informações do alimento no mock
    const foodData = mockFoods.find(f => f.id === ingredient.foodItemId);

    if (foodData) {
      foodItems.push({
        id: ingredient.foodItemId,
        name: ingredient.name,
        category: ingredient.category,
        unit: ingredient.unit,
        pricePerUnit: foodData.pricePerUnit,
        quantity: roundQuantity(ingredient.totalQuantity)
      });
    }
  });

  return foodItems;
}

/**
 * Arredonda quantidades para valores mais realistas
 * 
 * @param quantity - Quantidade original
 * @returns Quantidade arredondada
 */
function roundQuantity(quantity: number): number {
  // Arredonda para 2 casas decimais
  return Math.round(quantity * 100) / 100;
}

/**
 * Ordena a lista de compras por categoria
 * 
 * @param foodItems - Lista de itens alimentares
 * @returns Lista ordenada por categoria
 */
function sortByCategory(foodItems: FoodItem[]): FoodItem[] {
  const categoryOrder: Record<FoodCategory, number> = {
    vegetables: 1,
    fruits: 2,
    proteins: 3,
    grains: 4,
    dairy: 5,
    oils: 6,
    spices: 7,
    beverages: 8,
    others: 9
  };

  return foodItems.sort((a, b) => {
    const orderA = categoryOrder[a.category];
    const orderB = categoryOrder[b.category];
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // Se mesma categoria, ordena alfabeticamente
    return a.name.localeCompare(b.name);
  });
}

/**
 * Calcula o custo total da lista de compras
 * 
 * @param shoppingList - Lista de itens alimentares
 * @returns Custo total
 */
export function calculateTotalCost(shoppingList: FoodItem[]): number {
  const total = shoppingList.reduce((sum, item) => {
    return sum + (item.pricePerUnit * item.quantity);
  }, 0);

  return Math.round(total * 100) / 100;
}
