import { FoodItem } from "../models/FoodItem";
import { Recipe } from "../models/Recipe";
import { mockRecipes } from "../../data/mockRecipes";
import { userPreferencesStore } from "../stores/UserPreferencesStore";

interface RecipeMatch {
  recipe: Recipe;
  matchScore: number;
  matchedIngredients: number;
  totalIngredients: number;
  matchPercentage: number;
  personalizationBoost: number;
}

type HabitEvent = "chosen" | "executed";

interface RecipeHabitState {
  recipeScores: Record<string, number>;
  mealTypeScores: Record<Recipe["mealType"], number>;
}

const HABIT_STORAGE_KEY = "nutripilot_recipe_habits";
const EMPTY_HABITS: RecipeHabitState = {
  recipeScores: {},
  mealTypeScores: {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
  },
};

function loadHabitState(): RecipeHabitState {
  if (typeof window === "undefined") {
    return EMPTY_HABITS;
  }

  try {
    const raw = window.localStorage.getItem(HABIT_STORAGE_KEY);
    if (!raw) {
      return EMPTY_HABITS;
    }

    const parsed = JSON.parse(raw) as Partial<RecipeHabitState>;
    return {
      recipeScores: parsed.recipeScores || {},
      mealTypeScores: {
        breakfast: parsed.mealTypeScores?.breakfast || 0,
        lunch: parsed.mealTypeScores?.lunch || 0,
        dinner: parsed.mealTypeScores?.dinner || 0,
        snack: parsed.mealTypeScores?.snack || 0,
      },
    };
  } catch {
    return EMPTY_HABITS;
  }
}

function saveHabitState(state: RecipeHabitState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // no-op
  }
}

function getPersonalizationBoost(recipe: Recipe): number {
  const habits = loadHabitState();
  const recipeScore = habits.recipeScores[recipe.id] || 0;
  const mealTypeScore = habits.mealTypeScores[recipe.mealType] || 0;
  const ingredientPreferenceScore = recipe.ingredients.reduce((sum, ingredient) => {
    return sum + userPreferencesStore.getPreferenceScore(ingredient.name);
  }, 0);

  // Keep behavior influence bounded so ingredient match remains the dominant factor
  const boundedIngredientScore = Math.max(-10, Math.min(20, ingredientPreferenceScore * 0.1));
  return recipeScore * 1.25 + mealTypeScore * 0.2 + boundedIngredientScore;
}

export function trackRecipeHabit(recipe: Recipe, event: HabitEvent): void {
  const habits = loadHabitState();
  const recipeIncrement = event === "executed" ? 4 : 2;
  const mealTypeIncrement = event === "executed" ? 2 : 1;

  habits.recipeScores[recipe.id] = (habits.recipeScores[recipe.id] || 0) + recipeIncrement;
  habits.mealTypeScores[recipe.mealType] = (habits.mealTypeScores[recipe.mealType] || 0) + mealTypeIncrement;

  saveHabitState(habits);

  // Also reinforce food preferences for ingredients selected/executed
  userPreferencesStore.trackFoodSelections(recipe.ingredients.map((ingredient) => ingredient.name));
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
    if (b.personalizationBoost !== a.personalizationBoost) {
      return b.personalizationBoost - a.personalizationBoost;
    }
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
  const personalizationBoost = getPersonalizationBoost(recipe);

  return {
    recipe,
    matchScore,
    matchedIngredients,
    totalIngredients,
    matchPercentage,
    personalizationBoost
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
