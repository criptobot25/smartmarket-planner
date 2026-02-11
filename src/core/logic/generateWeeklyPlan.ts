import { PlanInput } from "../models/PlanInput";
import { WeeklyPlan, DayOfWeek, DayPlan, DayMeals } from "../models/WeeklyPlan";
import { Recipe, MealType } from "../models/Recipe";
import { mockRecipes } from "../../data/mockRecipes";

/**
 * Gera um plano semanal de refeições baseado nas preferências do usuário
 * 
 * @param input - Configurações do plano (pessoas, estilo, orçamento, restrições)
 * @returns Plano semanal completo com refeições para cada dia
 */
export function generateWeeklyPlan(input: PlanInput): WeeklyPlan {
  const daysOfWeek: DayOfWeek[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
  ];

  // Filtra receitas compatíveis com o dietStyle escolhido
  const compatibleRecipes = mockRecipes.filter(recipe =>
    recipe.dietStyle.includes(input.dietStyle)
  );

  // Separa receitas por tipo de refeição
  const breakfastRecipes = compatibleRecipes.filter(r => r.mealType === "breakfast");
  const lunchRecipes = compatibleRecipes.filter(r => r.mealType === "lunch");
  const dinnerRecipes = compatibleRecipes.filter(r => r.mealType === "dinner");
  const snackRecipes = compatibleRecipes.filter(r => r.mealType === "snack");

  // Gera os dias da semana com refeições
  const days: DayPlan[] = daysOfWeek.map((day, index) => {
    const meals: DayMeals = {
      breakfast: selectRecipe(breakfastRecipes, index),
      lunch: selectRecipe(lunchRecipes, index),
      dinner: selectRecipe(dinnerRecipes, index),
      snack: selectRecipe(snackRecipes, index)
    };

    return {
      day,
      meals
    };
  });

  // Cria o plano semanal
  const weeklyPlan: WeeklyPlan = {
    id: generatePlanId(),
    createdAt: new Date(),
    planInput: input,
    days,
    shoppingList: [], // Será preenchida em outra função
    totalCost: 0 // Será calculado com a shopping list
  };

  return weeklyPlan;
}

/**
 * Seleciona uma receita da lista com rotação baseada no índice
 * Garante variedade ao longo da semana
 * 
 * @param recipes - Lista de receitas disponíveis
 * @param dayIndex - Índice do dia (0-6)
 * @returns Receita selecionada ou null se não houver receitas
 */
function selectRecipe(recipes: Recipe[], dayIndex: number): Recipe | null {
  if (recipes.length === 0) {
    return null;
  }

  // Usa módulo para rotacionar entre as receitas disponíveis
  const recipeIndex = dayIndex % recipes.length;
  return recipes[recipeIndex];
}

/**
 * Gera um ID único para o plano
 * 
 * @returns ID único baseado em timestamp e random
 */
function generatePlanId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `plan-${timestamp}-${random}`;
}

/**
 * Filtra receitas que não contêm ingredientes restritos
 * 
 * @param recipes - Lista de receitas
 * @param restrictions - Lista de restrições alimentares
 * @returns Receitas filtradas
 */
export function filterByRestrictions(
  recipes: Recipe[],
  restrictions: string[]
): Recipe[] {
  if (restrictions.length === 0) {
    return recipes;
  }

  return recipes.filter(recipe => {
    // Verifica se algum ingrediente está na lista de restrições
    const hasRestriction = recipe.ingredients.some(ingredient =>
      restrictions.some(restriction =>
        ingredient.name.toLowerCase().includes(restriction.toLowerCase())
      )
    );

    return !hasRestriction;
  });
}
