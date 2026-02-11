import { FoodItem } from "../models/FoodItem";
import { Recipe } from "../models/Recipe";
import { mockRecipes } from "../../data/mockRecipes";

interface RecipeMatch {
  recipe: Recipe;
  matchScore: number;
  matchedIngredients: number;
  totalIngredients: number;
  matchPercentage: number;
}

/**
 * Sugere receitas baseadas nos ingredientes disponíveis
 * 
 * @param items - Lista de ingredientes disponíveis (lista de compras)
 * @returns Array de receitas sugeridas, ordenadas por compatibilidade
 */
export function suggestRecipes(items: FoodItem[]): Recipe[] {
  if (items.length === 0) {
    // Se não há ingredientes, retorna as 3 primeiras receitas
    return mockRecipes.slice(0, 3);
  }

  // Cria um Set de IDs de alimentos disponíveis para busca rápida
  const availableFoodIds = new Set(items.map(item => item.id));

  // Calcula compatibilidade de cada receita
  const recipeMatches: RecipeMatch[] = mockRecipes.map(recipe => {
    return calculateRecipeMatch(recipe, availableFoodIds);
  });

  // Filtra receitas com pelo menos alguma compatibilidade
  const viableRecipes = recipeMatches.filter(match => match.matchScore > 0);

  // Ordena por score de compatibilidade (descendente)
  const sortedRecipes = viableRecipes.sort((a, b) => {
    // Primeiro ordena por porcentagem de match
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    // Se empate, ordena por número absoluto de ingredientes
    return b.matchedIngredients - a.matchedIngredients;
  });

  // Retorna as receitas (sem o score)
  const suggestions = sortedRecipes.map(match => match.recipe);

  // Garante pelo menos 3 sugestões
  if (suggestions.length < 3) {
    // Adiciona receitas aleatórias que não estão na lista
    const remainingRecipes = mockRecipes.filter(
      recipe => !suggestions.includes(recipe)
    );
    
    while (suggestions.length < 3 && remainingRecipes.length > 0) {
      suggestions.push(remainingRecipes.shift()!);
    }
  }

  return suggestions;
}

/**
 * Calcula o score de compatibilidade entre uma receita e ingredientes disponíveis
 * 
 * @param recipe - Receita a ser avaliada
 * @param availableFoodIds - Set de IDs de alimentos disponíveis
 * @returns Objeto com informações de compatibilidade
 */
function calculateRecipeMatch(
  recipe: Recipe,
  availableFoodIds: Set<string>
): RecipeMatch {
  const totalIngredients = recipe.ingredients.length;
  
  // Conta quantos ingredientes da receita estão disponíveis
  const matchedIngredients = recipe.ingredients.filter(ingredient =>
    availableFoodIds.has(ingredient.foodItemId)
  ).length;

  // Calcula porcentagem de match
  const matchPercentage = totalIngredients > 0
    ? (matchedIngredients / totalIngredients) * 100
    : 0;

  // Score de compatibilidade (pode ser usado para ordenação)
  const matchScore = matchedIngredients;

  return {
    recipe,
    matchScore,
    matchedIngredients,
    totalIngredients,
    matchPercentage
  };
}

/**
 * Filtra receitas que podem ser completamente feitas com os ingredientes disponíveis
 * 
 * @param items - Lista de ingredientes disponíveis
 * @returns Receitas que têm 100% dos ingredientes disponíveis
 */
export function getFullyMatchedRecipes(items: FoodItem[]): Recipe[] {
  const availableFoodIds = new Set(items.map(item => item.id));

  return mockRecipes.filter(recipe => {
    return recipe.ingredients.every(ingredient =>
      availableFoodIds.has(ingredient.foodItemId)
    );
  });
}

/**
 * Sugere receitas por tipo de refeição
 * 
 * @param items - Lista de ingredientes disponíveis
 * @param mealType - Tipo de refeição desejada
 * @param limit - Número máximo de sugestões
 * @returns Array de receitas sugeridas para o tipo de refeição
 */
export function suggestRecipesByMealType(
  items: FoodItem[],
  mealType: "breakfast" | "lunch" | "dinner" | "snack",
  limit: number = 3
): Recipe[] {
  const allSuggestions = suggestRecipes(items);
  
  // Filtra pelo tipo de refeição
  const filteredSuggestions = allSuggestions.filter(
    recipe => recipe.mealType === mealType
  );

  // Retorna até o limite especificado
  return filteredSuggestions.slice(0, limit);
}
