import { PlanInput } from "../models/PlanInput";
import { WeeklyPlan, DayOfWeek, DayPlan, DayMeals, Meal, FoodPortion } from "../models/WeeklyPlan";
import { calculateMacroTargets } from "./MacroCalculator";
import { MacroTargetPerMeal } from "./PortionCalculator";
import { buildMeal, buildBreakfast } from "./MealBuilder";
import { mockFoods } from "../../data/mockFoods";

/**
 * FITNESS-FIRST WEEKLY PLAN GENERATOR (PASSO 22 - Meal Builder)
 * 
 * Gera plano semanal DINÂMICO baseado em macro targets:
 * - Meals built from macro targets (não templates fixos)
 * - MealBuilder seleciona melhores fontes (protein/carb/vegetable)
 * - Portions calculadas via PortionCalculator
 * - Cost tier influencia seleção de alimentos
 * 
 * Evolution:
 * - PASSO 20: MacroCalculator (BMR, TDEE, macro targets)
 * - PASSO 21: PortionCalculator (grams from macros)
 * - PASSO 22: MealBuilder (dynamic meal composition)
 * 
 * Fonte: Meal prep behavior patterns (NCBI PMC7071223)
 */

/**
 * Gera um plano semanal FITNESS-AWARE (PASSO 22 - MealBuilder)
 * 
 * Now uses MealBuilder to dynamically create meals from macro targets
 * instead of hardcoded templates
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

  const macroTargets = calculateMacroTargets(input);
  const costTier = input.costTier;
  
  // Calculate meal macro targets
  const mealMacroTarget: MacroTargetPerMeal = {
    protein: macroTargets.proteinPerMeal,
    carbs: macroTargets.carbsPerMeal,
    fats: macroTargets.fatsPerMeal
  };
  
  // Build 2 different lunches and 2 different dinners for variety (meal prep pattern)
  // Breakfast uses buildBreakfast (oats-based)
  const breakfastMeal = buildBreakfast({
    macroTargetsPerMeal: mealMacroTarget,
    availableFoods: mockFoods,
    excludedFoods: input.excludedFoods || [],
    costTier
  });
  
  const lunchMeal1 = buildMeal({
    macroTargetsPerMeal: mealMacroTarget,
    availableFoods: mockFoods,
    excludedFoods: input.excludedFoods || [],
    costTier
  });
  
  const dinnerMeal1 = buildMeal({
    macroTargetsPerMeal: mealMacroTarget,
    availableFoods: mockFoods,
    excludedFoods: input.excludedFoods || [],
    costTier
  });
  
  // Snack for 5+ meals per day (simple: yogurt + fruit)
  const includeSnack = input.mealsPerDay >= 5;
  const snackMeal = includeSnack ? buildSnack(mockFoods, input.excludedFoods || []) : null;
  
  // Padrão de repetição semanal (meal prep real)
  // All days get same meals (true meal prep - cook once, eat all week)
  const days: DayPlan[] = daysOfWeek.map((day) => {
    const breakfast = convertBuiltMealToMeal(breakfastMeal);
    const lunch = convertBuiltMealToMeal(lunchMeal1);
    const dinner = convertBuiltMealToMeal(dinnerMeal1);
    const snack = snackMeal ? convertBuiltMealToMeal(snackMeal) : null;

    const meals: DayMeals = {
      breakfast,
      lunch,
      dinner,
      snack
    };

    return { day, meals };
  });

  const weeklyPlan: WeeklyPlan = {
    id: generatePlanId(),
    createdAt: new Date(),
    planInput: input,
    days,
    shoppingList: [],
    costTier: costTier,
    caloriesTargetPerDay: macroTargets.caloriesTargetPerDay,
    proteinTargetPerDay: macroTargets.proteinTargetPerDay,
    carbsTargetPerDay: macroTargets.carbsTargetPerDay,
    fatTargetPerDay: macroTargets.fatTargetPerDay,
    proteinPerMeal: macroTargets.proteinPerMeal,
    carbsPerMeal: macroTargets.carbsPerMeal,
    fatsPerMeal: macroTargets.fatsPerMeal
  };

  return weeklyPlan;
}

/**
 * Convert BuiltMeal (from MealBuilder) to Meal (WeeklyPlan format)
 */
function convertBuiltMealToMeal(builtMeal: ReturnType<typeof buildMeal>): Meal {
  const portions: FoodPortion[] = builtMeal.ingredients.map(ing => ({
    foodId: ing.foodId,
    gramsNeeded: ing.grams
  }));
  
  const foodIds = builtMeal.ingredients.map(ing => ing.foodId);
  
  return {
    id: `meal-${builtMeal.name.toLowerCase().replace(/\s+/g, "-")}`,
    name: builtMeal.name,
    foodIds,
    portions,
    protein: builtMeal.macros.protein
  };
}

/**
 * Build simple snack (yogurt + fruit)
 */
function buildSnack(
  availableFoods: typeof mockFoods,
  excludedFoods: string[]
): ReturnType<typeof buildMeal> {
  const yogurt = availableFoods.find(f => 
    f.category === "dairy" && 
    !excludedFoods.includes(f.name) &&
    f.name.toLowerCase().includes("yogurt")
  );
  
  const fruit = availableFoods.find(f => 
    f.category === "fruits" && 
    !excludedFoods.includes(f.name)
  );
  
  const ingredients = [];
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  
  if (yogurt) {
    ingredients.push({ foodId: yogurt.id, foodName: yogurt.name, grams: 150 });
    if (yogurt.macros) {
      totalProtein += yogurt.macros.protein * 1.5;
      totalCarbs += yogurt.macros.carbs * 1.5;
      totalFats += yogurt.macros.fat * 1.5;
    }
  }
  
  if (fruit) {
    ingredients.push({ foodId: fruit.id, foodName: fruit.name, grams: 100 });
    if (fruit.macros) {
      totalProtein += fruit.macros.protein * 1.0;
      totalCarbs += fruit.macros.carbs * 1.0;
      totalFats += fruit.macros.fat * 1.0;
    }
  }
  
  const name = ingredients.map(i => i.foodName).join(" + ");
  
  return {
    name: name || "Simple Snack",
    ingredients,
    macros: {
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fats: Math.round(totalFats)
    }
  };
}

/**
 * Gera ID único para o plano
 */
function generatePlanId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `plan-${timestamp}-${random}`;
}
