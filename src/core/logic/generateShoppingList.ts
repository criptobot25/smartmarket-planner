import { PlanInput } from "../models/PlanInput";
import { WeeklyPlan, Meal } from "../models/WeeklyPlan";
import { FoodItem, FoodCategory } from "../models/FoodItem";
import { mockFoods } from "../../data/mockFoods";
import { optimizeBudget, BudgetStatus, SubstitutionRecord } from "./SmartBudgetOptimizer";

/**
 * SHOPPING LIST DERIVADA DO WEEKLY PLAN
 * 
 * Não escolhe alimentos aleatoriamente.
 * Deriva a lista como consequência inevitável do plano semanal.
 * 
 * Cada item tem:
 * - quantity realista (heurísticas de meal prep)
 * - estimatedPrice (quantity * pricePerUnit)
 * - reason ("Lunch protein for 10 meals")
 * 
 * Budget optimization:
 * - SmartBudgetOptimizer maximiza proteína por euro
 * - Substitui itens caros por alternativas eficientes
 * - Mantém macros semelhantes
 * 
 * Objetivo: Usuário deve sentir "Claro que frango está aqui, eu vou comer 6x"
 * 
 * Fonte: Explainability increases trust (NN/g)
 */

interface IngredientOccurrence {
  foodId: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  occurrences: number;
}

interface ShoppingListResult {
  items: FoodItem[];
  totalEstimatedCost: number;
  totalProtein: number; // NEW: Track total protein
  efficiencyScore: number; // NEW: Protein per euro
  budgetStatus: BudgetStatus;
  substitutionsApplied: SubstitutionRecord[]; // NEW: Detailed substitutions
}

/**
 * Gera lista de compras derivada do WeeklyPlan
 */
export function generateShoppingList(
  input: PlanInput,
  weeklyPlan: WeeklyPlan
): ShoppingListResult {
  // 1. Extrair todos os ingredientes do plano com contagem de ocorrências
  const ingredientOccurrences = extractIngredientsFromPlan(weeklyPlan);

  // 2. Converter em FoodItems com quantidades realistas
  const items = ingredientOccurrences.map(occurrence =>
    convertToFoodItem(occurrence, input.numberOfPeople)
  );

  // 3. Ordenar por categoria
  const sortedItems = sortByCategory(items);

  // 4. Calcular custo total inicial
  const initialCost = sortedItems.reduce(
    (sum, item) => sum + (item.estimatedPrice || 0),
    0
  );

  // 5. Aplicar Smart Budget Optimization (protein-per-euro strategy)
  const optimizationResult = optimizeBudget(
    sortedItems,
    initialCost,
    input.budget,
    input.excludedFoods || []
  );

  return {
    items: optimizationResult.items,
    totalEstimatedCost: optimizationResult.totalEstimatedCost,
    totalProtein: optimizationResult.totalProtein,
    efficiencyScore: optimizationResult.efficiencyScore,
    budgetStatus: optimizationResult.budgetStatus,
    substitutionsApplied: optimizationResult.substitutionsApplied,
  };
}

/**
 * Extrai todos os ingredientes do plano semanal com ocorrências
 */
function extractIngredientsFromPlan(
  weeklyPlan: WeeklyPlan
): IngredientOccurrence[] {
  const occurrenceMap = new Map<string, IngredientOccurrence>();

  weeklyPlan.days.forEach(dayPlan => {
    // Processar breakfast
    if (dayPlan.meals.breakfast) {
      countMealIngredients(dayPlan.meals.breakfast, "breakfast", occurrenceMap);
    }

    // Processar lunch
    if (dayPlan.meals.lunch) {
      countMealIngredients(dayPlan.meals.lunch, "lunch", occurrenceMap);
    }

    // Processar dinner
    if (dayPlan.meals.dinner) {
      countMealIngredients(dayPlan.meals.dinner, "dinner", occurrenceMap);
    }

    // Processar snack (apenas bulking)
    if (dayPlan.meals.snack) {
      countMealIngredients(dayPlan.meals.snack, "snack", occurrenceMap);
    }
  });

  return Array.from(occurrenceMap.values());
}

/**
 * Conta ingredientes de uma refeição
 */
function countMealIngredients(
  meal: Meal,
  mealType: "breakfast" | "lunch" | "dinner" | "snack",
  occurrenceMap: Map<string, IngredientOccurrence>
): void {
  meal.foodIds.forEach(foodId => {
    const key = `${foodId}-${mealType}`;
    const existing = occurrenceMap.get(key);

    if (existing) {
      existing.occurrences += 1;
    } else {
      occurrenceMap.set(key, {
        foodId,
        mealType,
        occurrences: 1
      });
    }
  });
}

/**
 * Converte occurrence em FoodItem com quantidade realista
 */
function convertToFoodItem(
  occurrence: IngredientOccurrence,
  numberOfPeople: number
): FoodItem {
  const food = mockFoods.find(f => f.id === occurrence.foodId);

  if (!food) {
    throw new Error(`Food not found: ${occurrence.foodId}`);
  }

  // Heurísticas de quantidade baseadas em meal prep real
  const quantity = calculateRealisticQuantity(
    food,
    occurrence.mealType,
    occurrence.occurrences,
    numberOfPeople
  );

  const estimatedPrice = quantity * food.pricePerUnit;

  const reason = generateReason(
    food,
    occurrence.mealType,
    occurrence.occurrences
  );

  return {
    id: food.id,
    name: food.name,
    category: food.category,
    unit: food.unit,
    pricePerUnit: food.pricePerUnit,
    quantity,
    macros: food.macros,
    reason,
    estimatedPrice
  };
}

/**
 * HEURÍSTICAS DE QUANTIDADE (Meal Prep Real)
 * 
 * Baseado em porções típicas de meal prep fitness:
 * - Proteínas: 200g por refeição principal
 * - Carbs: 150g cooked por refeição
 * - Vegetais: 150g por refeição
 * - Frutas: 1 unidade ou 150g por dia
 * - Ovos: 3 unidades por refeição
 * - Pães: 2 fatias por refeição
 * - Óleos/temperos: mínimo necessário
 * 
 * Fonte: Portion guidance (MyPlate.gov)
 */
function calculateRealisticQuantity(
  food: FoodItem,
  mealType: "breakfast" | "lunch" | "dinner" | "snack",
  occurrences: number,
  numberOfPeople: number
): number {
  const category = food.category;
  const unit = food.unit;

  // Porção base por refeição por pessoa
  let portionPerMeal = 0;

  if (category === "proteins") {
    // 200g de proteína por refeição principal
    if (mealType === "breakfast") {
      portionPerMeal = 0.1; // 100g (ex: ovos)
    } else {
      portionPerMeal = 0.2; // 200g (ex: frango, peixe)
    }
  } else if (category === "grains") {
    // 150g cooked de carbs por refeição
    if (unit === "kg") {
      portionPerMeal = 0.08; // ~80g dry = ~150g cooked
    } else if (unit === "loaf") {
      portionPerMeal = 0.15; // ~15% de um pão (2-3 fatias)
    }
  } else if (category === "vegetables") {
    // 150g de vegetais por refeição
    portionPerMeal = 0.15; // 150g
  } else if (category === "fruits") {
    // 1 fruta por dia ou 150g
    if (unit === "kg") {
      portionPerMeal = 0.15; // 150g (ex: banana grande)
    } else if (unit === "pack") {
      portionPerMeal = 0.2; // 20% de um pack (ex: berries)
    }
  } else if (category === "dairy") {
    // Iogurte/queijo: 150g por refeição
    if (unit === "kg") {
      portionPerMeal = 0.15; // 150g
    } else if (unit === "L") {
      portionPerMeal = 0.25; // 250ml
    }
  } else if (category === "oils") {
    // Azeite: ~1 colher de sopa por refeição (15ml)
    portionPerMeal = 0.015; // 15ml
  } else if (category === "spices") {
    // Temperos: mínimo
    portionPerMeal = 0.01; // 10g total semana
  } else if (category === "others") {
    // Nuts, peanut butter
    if (food.name.includes("butter")) {
      portionPerMeal = 0.03; // 30g (2 colheres)
    } else if (unit === "kg") {
      portionPerMeal = 0.03; // 30g (snack)
    } else if (unit === "jar") {
      portionPerMeal = 0.1; // 10% do jar
    }
  } else if (category === "beverages") {
    portionPerMeal = 0.25; // 250ml
  }

  // Ajuste especial para ovos (pack = 12 unidades)
  if (food.name.includes("Eggs")) {
    // 3 ovos por refeição = 3/12 = 0.25 pack
    portionPerMeal = 0.25;
  }

  // Ajuste especial para latas de atum
  if (food.name.includes("Tuna") && unit === "can") {
    portionPerMeal = 1; // 1 lata por refeição
  }

  // Quantidade total = porção * ocorrências * pessoas
  const totalQuantity = portionPerMeal * occurrences * numberOfPeople;

  // Arredondar para 2 casas decimais
  return Math.round(totalQuantity * 100) / 100;
}

/**
 * Gera reason explicativa para cada item
 * 
 * Objetivo: Usuário entende por que aquele item está na lista
 * Exemplo: "Lunch protein for 10 meals"
 */
function generateReason(
  food: FoodItem,
  mealType: "breakfast" | "lunch" | "dinner" | "snack",
  occurrences: number
): string {
  const mealLabels = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack"
  };

  const mealLabel = mealLabels[mealType];

  // Classificar role do alimento
  let role = "";

  if (food.category === "proteins") {
    role = "protein";
  } else if (food.category === "grains") {
    role = "carbs";
  } else if (food.category === "vegetables") {
    role = "vegetables";
  } else if (food.category === "fruits") {
    role = "fruit";
  } else if (food.category === "dairy") {
    role = "dairy";
  } else if (food.category === "oils") {
    role = "cooking oil";
  } else if (food.category === "spices") {
    role = "seasoning";
  } else {
    role = "ingredient";
  }

  // Construir reason
  if (occurrences === 1) {
    return `${mealLabel} ${role} (1 meal)`;
  } else {
    return `${mealLabel} ${role} (${occurrences} meals)`;
  }
}

/**
 * Ordena itens por categoria (UX: encontrar rápido no mercado)
 */
function sortByCategory(items: FoodItem[]): FoodItem[] {
  const categoryOrder: FoodCategory[] = [
    "proteins",
    "grains",
    "vegetables",
    "fruits",
    "dairy",
    "oils",
    "spices",
    "beverages",
    "others"
  ];

  return items.sort((a, b) => {
    const indexA = categoryOrder.indexOf(a.category);
    const indexB = categoryOrder.indexOf(b.category);
    return indexA - indexB;
  });
}
