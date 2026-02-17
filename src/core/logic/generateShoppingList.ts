import { PlanInput } from "../models/PlanInput";
import { CATEGORIES } from "../../core/constants/categories";
import { WeeklyPlan, Meal } from "../models/WeeklyPlan";
import { FoodItem, FoodCategory } from "../models/FoodItem";
import { CostTier } from "../models/CostTier";
import { mockFoods } from "../../data/mockFoods";
import { optimizeSavings, SavingsStatus, SubstitutionRecord } from "./SmartSavingsOptimizer";
import { getCostTier } from "../utils/getCostTier";

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
 * Smart Savings optimization:
 * - SmartSavingsOptimizer maximiza proteína por custo
 * - Substitui itens caros por alternativas eficientes
 * - Mantém macros semelhantes
 * 
 * Objetivo: Usuário deve sentir "Claro que frango está aqui, eu vou comer 6x"
 * 
 * Fonte: Explainability increases trust (NN/g)
 */

interface IngredientOccurrence {
  foodId: string;
  mealTypes: Set<"breakfast" | "lunch" | "dinner" | "snack">;
  occurrences: number;
}

interface ShoppingListResult {
  items: FoodItem[];
  costTier: CostTier;
  totalProtein: number; // NEW: Track total protein
  efficiencyScore: number; // NEW: Protein per euro
  savingsStatus: SavingsStatus;
  substitutionsApplied: SubstitutionRecord[]; // NEW: Detailed substitutions
}

interface MacroScale {
  protein: number;
  carbs: number;
  fats: number;
}

const VALID_CATEGORIES: FoodCategory[] = [
  CATEGORIES.protein,
  CATEGORIES.grains,
  CATEGORIES.vegetables,
  CATEGORIES.fruits,
  CATEGORIES.dairy,
  CATEGORIES.fats,
  CATEGORIES.others,
  CATEGORIES.others,
  CATEGORIES.others
];

const BASELINE_MACROS = {
  protein: 150,
  carbs: 200,
  fats: 70
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getMacroScale(weeklyPlan: WeeklyPlan): MacroScale {
  const proteinTarget = weeklyPlan.proteinTargetPerDay || BASELINE_MACROS.protein;
  const carbsTarget = weeklyPlan.carbsTargetPerDay || BASELINE_MACROS.carbs;
  const fatTarget = weeklyPlan.fatTargetPerDay || BASELINE_MACROS.fats;

  return {
    protein: clamp(proteinTarget / BASELINE_MACROS.protein, 0.7, 1.6),
    carbs: clamp(carbsTarget / BASELINE_MACROS.carbs, 0.7, 1.6),
    fats: clamp(fatTarget / BASELINE_MACROS.fats, 0.7, 1.6)
  };
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
  const macroScale = getMacroScale(weeklyPlan);
  const items = ingredientOccurrences.map(occurrence =>
    convertToFoodItem(occurrence, input.mealsPerDay, macroScale)
  );

  // 3. Ordenar por categoria
  const sortedItems = sortByCategory(items);

  // 4. Calcular custo total inicial
  const initialCost = sortedItems.reduce(
    (sum, item) => sum + (item.estimatedPrice || 0),
    0
  );

  // 5. PASSO 24: SmartSavings only for low tier users
  // Medium/high tier users get premium foods without optimization
  let optimizationResult;
  
  if (input.costTier === "low") {
    // Low tier: Apply aggressive savings optimization (30% reduction target)
    const savingsTarget = initialCost * 0.7;
    optimizationResult = optimizeSavings(
      sortedItems,
      initialCost,
      savingsTarget,
      input.excludedFoods || []
    );
  } else {
    // Medium/high tier: Skip optimization, use foods as selected by MealBuilder
    optimizationResult = {
      items: sortedItems,
      totalEstimatedCost: initialCost,
      totalProtein: sortedItems.reduce((sum, item) => {
        if (!item.macros?.protein) return sum;
        return sum + (item.quantity * item.macros.protein * 10);
      }, 0),
      savingsStatus: "within_savings" as SavingsStatus,
      substitutionsApplied: [],
      efficiencyScore: initialCost > 0 
        ? sortedItems.reduce((sum, item) => {
            if (!item.macros?.protein) return sum;
            return sum + (item.quantity * item.macros.protein * 10);
          }, 0) / initialCost 
        : 0,
    };
  }

  const costTier = getCostTier(optimizationResult.items);

  return {
    items: optimizationResult.items,
    costTier,
    totalProtein: optimizationResult.totalProtein,
    efficiencyScore: optimizationResult.efficiencyScore,
    savingsStatus: optimizationResult.savingsStatus,
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
    const existing = occurrenceMap.get(foodId);

    if (existing) {
      existing.occurrences += 1;
      existing.mealTypes.add(mealType);
    } else {
      occurrenceMap.set(foodId, {
        foodId,
        mealTypes: new Set([mealType]),
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
  mealsPerDay: number,
  macroScale: MacroScale
): FoodItem {
  const food = mockFoods.find(f => f.id === occurrence.foodId);

  if (!food) {
    throw new Error(`Food not found: ${occurrence.foodId}`);
  }

  const safeCategory: FoodCategory = VALID_CATEGORIES.includes(food.category)
    ? food.category
    : CATEGORIES.others;

  const safeFood: FoodItem = {
    ...food,
    category: safeCategory
  };

  // Heurísticas de quantidade baseadas em meal prep real
  // Use the first meal type for quantity calculation (they're similar anyway)
  const primaryMealType = Array.from(occurrence.mealTypes)[0];
  const quantity = calculateRealisticQuantity(
    safeFood,
    primaryMealType,
    occurrence.occurrences,
    mealsPerDay,
    macroScale
  );

  const estimatedPrice = quantity * food.pricePerUnit;

  const mealTypesArray = Array.from(occurrence.mealTypes);
  const reason = generateReasonFromMealTypes(
    safeFood,
    mealTypesArray,
    occurrence.occurrences
  );

  // Generate unique ID using foodId only since we now aggregate across meal types
  // Add timestamp hash to ensure uniqueness across different plan generations
  const uniqueId = occurrence.foodId;

  return {
    id: uniqueId,
    name: food.name,
    category: safeFood.category,
    unit: food.unit,
    pricePerUnit: food.pricePerUnit,
    quantity,
    macros: food.macros,
    costLevel: food.costLevel, // PASSO 24: Preserve cost tier
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
  mealsPerDay: number,
  macroScale: MacroScale
): number {
  const category = food.category;
  const unit = food.unit;

  // Porção base por refeição por pessoa
  let portionPerMeal = 0;

  if (category === CATEGORIES.protein) {
    // 200g de proteína por refeição principal
    if (mealType === "breakfast") {
      portionPerMeal = 0.1 * macroScale.protein; // 100g (ex: ovos)
    } else {
      portionPerMeal = 0.2 * macroScale.protein; // 200g (ex: frango, peixe)
    }
  } else if (category === CATEGORIES.grains) {
    // 150g cooked de carbs por refeição
    const carbMultiplier = (mealsPerDay >= 5 ? 1.2 : 1) * macroScale.carbs;
    if (unit === "kg") {
      portionPerMeal = 0.08 * carbMultiplier; // ~80g dry = ~150g cooked
    } else if (unit === "loaf") {
      portionPerMeal = 0.15 * carbMultiplier; // ~15% de um pão (2-3 fatias)
    }
  } else if (category === CATEGORIES.vegetables) {
    // 150g de vegetais por refeição
    portionPerMeal = 0.15 * macroScale.carbs; // 150g
  } else if (category === CATEGORIES.fruits) {
    // 1 fruta por dia ou 150g
    if (unit === "kg") {
      portionPerMeal = 0.15 * macroScale.carbs; // 150g (ex: banana grande)
    } else if (unit === "pack") {
      portionPerMeal = 0.2 * macroScale.carbs; // 20% de um pack (ex: berries)
    }
  } else if (category === CATEGORIES.dairy) {
    // Iogurte/queijo: 150g por refeição
    if (unit === "kg") {
      portionPerMeal = 0.15 * macroScale.fats; // 150g
    } else if (unit === "L") {
      portionPerMeal = 0.25 * macroScale.fats; // 250ml
    }
  } else if (category === CATEGORIES.fats) {
    // Azeite: ~1 colher de sopa por refeição (15ml)
    portionPerMeal = 0.015 * macroScale.fats; // 15ml
  } else if (category === CATEGORIES.snacks) {
    // Nuts, peanut butter
    if (food.name.includes("butter")) {
      portionPerMeal = 0.03 * macroScale.fats; // 30g (2 colheres)
    } else if (unit === "kg") {
      portionPerMeal = 0.03 * macroScale.fats; // 30g (snack)
    } else if (unit === "jar") {
      portionPerMeal = 0.1 * macroScale.fats; // 10% do jar
    }
  } else if (category === CATEGORIES.others) {
    portionPerMeal = 0.01; // 10g total semana (temperos, etc.)
  }

  // Ajuste especial para ovos (pack = 12 unidades)
  if (food.name.includes("Eggs")) {
    // 3 ovos por refeição = 3/12 = 0.25 pack
    portionPerMeal = 0.25 * macroScale.protein;
  }

  // Ajuste especial para latas de atum
  if (food.name.includes("Tuna") && unit === "can") {
    portionPerMeal = 1; // 1 lata por refeição
  }

  // Quantidade total = porção * ocorrências
  const totalQuantity = portionPerMeal * occurrences;

  // Arredondar para 2 casas decimais
  return Math.round(totalQuantity * 100) / 100;
}

/**
 * Gera reason explicando por que o item está na lista (com múltiplos tipos de refeição)
 */
function generateReasonFromMealTypes(
  food: FoodItem,
  mealTypes: string[],
  occurrences: number
): string {
  const category = food.category;
  
  // Classificar role do alimento
  /* eslint-disable no-restricted-syntax -- role is display text, not category enum */
  let role = "";
  if (category === CATEGORIES.protein) {
    role = "protein";
  } else if (category === CATEGORIES.grains) {
    role = "carbs";
  } else if (category === CATEGORIES.vegetables) {
    role = "vegetables";
  } else if (category === CATEGORIES.fruits) {
    role = "fruit";
  } else if (category === CATEGORIES.dairy) {
    role = "dairy";
  } else if (category === CATEGORIES.fats) {
    role = "cooking oil";
  } else if (category === CATEGORIES.others) {
    role = "seasoning";
  } else {
    role = "ingredient";
  }
  /* eslint-enable no-restricted-syntax */

  if (mealTypes.length === 1) {
    const mealLabel = {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      snack: "Snack"
    }[mealTypes[0] as "breakfast" | "lunch" | "dinner" | "snack"];
    
    if (occurrences === 1) {
      return `${mealLabel} ${role} (1 meal)`;
    }
    return `${mealLabel} ${role} for ${occurrences} meals`;
  } else {
    // Multiple meal types - show combined
    const mealLabels = mealTypes.map(mt => {
      return {
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        snack: "Snack"
      }[mt as "breakfast" | "lunch" | "dinner" | "snack"];
    });
    return `${mealLabels.join(", ")} ${role} for ${occurrences} meals`;
  }
}

/**
 * Gera reason explicativa para cada item
 * 
 * Objetivo: Usuário entende por que aquele item está na lista
 * Exemplo: "Lunch protein for 10 meals"
 */
function _generateReason(
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
  /* eslint-disable no-restricted-syntax -- role is display text, not category enum */
  let role = "";

  if (food.category === CATEGORIES.protein) {
    role = "protein";
  } else if (food.category === CATEGORIES.grains) {
    role = "carbs";
  } else if (food.category === CATEGORIES.vegetables) {
    role = "vegetables";
  } else if (food.category === CATEGORIES.fruits) {
    role = "fruit";
  } else if (food.category === CATEGORIES.dairy) {
    role = "dairy";
  } else if (food.category === CATEGORIES.fats) {
    role = "cooking oil";
  } else if (food.category === CATEGORIES.others) {
    role = "seasoning";
  } else {
    role = "ingredient";
  }
  /* eslint-enable no-restricted-syntax */

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
    CATEGORIES.protein,
    CATEGORIES.grains,
    CATEGORIES.vegetables,
    CATEGORIES.fruits,
    CATEGORIES.dairy,
    CATEGORIES.fats,
    CATEGORIES.others,
    CATEGORIES.others,
    CATEGORIES.others
  ];

  return items.sort((a, b) => {
    const indexA = categoryOrder.indexOf(a.category);
    const indexB = categoryOrder.indexOf(b.category);
    return indexA - indexB;
  });
}
