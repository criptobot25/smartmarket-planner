export interface QuantityMultipliers {
  breakfast: number;
  mainMeal: number;
  snack: number;
}

export interface QuantityCalculationResult {
  multipliers: QuantityMultipliers;
  totalDays: number;
  totalPeople: number;
  estimatedServings: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  };
}

/**
 * Calcula multiplicadores de quantidade baseados no número de dias e pessoas
 * 
 * @param days - Número de dias para o planejamento
 * @param people - Número de pessoas que irão consumir as refeições
 * @returns Objeto com multiplicadores e estimativas de porções
 */
export function calculateQuantities(
  days: number,
  people: number
): QuantityCalculationResult {
  if (days <= 0 || people <= 0) {
    throw new Error("Número de dias e pessoas devem ser maiores que zero");
  }

  // Multiplicadores base por tipo de refeição
  // Café da manhã: porções menores (0.8 do padrão)
  const breakfastMultiplier = 0.8;
  
  // Refeições principais: porção padrão (1.0)
  const mainMealMultiplier = 1.0;
  
  // Snacks: porções menores (0.4 do padrão)
  const snackMultiplier = 0.4;

  // Calcula servings totais para cada tipo de refeição
  const breakfastServings = days * people * breakfastMultiplier;
  const lunchServings = days * people * mainMealMultiplier;
  const dinnerServings = days * people * mainMealMultiplier;
  const snackServings = days * people * snackMultiplier;

  return {
    multipliers: {
      breakfast: breakfastMultiplier,
      mainMeal: mainMealMultiplier,
      snack: snackMultiplier,
    },
    totalDays: days,
    totalPeople: people,
    estimatedServings: {
      breakfast: breakfastServings,
      lunch: lunchServings,
      dinner: dinnerServings,
      snack: snackServings,
    },
  };
}

/**
 * Ajusta a quantidade de um ingrediente baseado no multiplicador e número de pessoas
 * 
 * @param baseQuantity - Quantidade base da receita
 * @param baseServings - Número de porções da receita original
 * @param targetServings - Número de porções desejadas
 * @returns Quantidade ajustada
 */
export function adjustIngredientQuantity(
  baseQuantity: number,
  baseServings: number,
  targetServings: number
): number {
  if (baseServings <= 0) {
    throw new Error("Número de porções base deve ser maior que zero");
  }

  const ratio = targetServings / baseServings;
  return baseQuantity * ratio;
}
