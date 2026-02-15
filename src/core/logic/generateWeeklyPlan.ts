import { PlanInput } from "../models/PlanInput";
import { WeeklyPlan, DayOfWeek, DayPlan, DayMeals, Meal, FoodPortion } from "../models/WeeklyPlan";
import { calculateMacroTargets } from "./MacroCalculator";
import { MacroTargetPerMeal } from "./PortionCalculator";
import { buildMeal, buildBreakfast } from "./MealBuilder";
import { VarietyTracker, DEFAULT_VARIETY_CONSTRAINTS } from "./VarietyConstraints";
import { mockFoods } from "../../data/mockFoods";

/**
 * FITNESS-FIRST WEEKLY PLAN GENERATOR (PASSO 23 - Variety Engine v2)
 * 
 * Gera plano semanal DINÂMICO baseado em macro targets:
 * - Meals built from macro targets (não templates fixos)
 * - MealBuilder seleciona melhores fontes (protein/carb/vegetable)
 * - Portions calculadas via PortionCalculator
 * - Cost tier influencia seleção de alimentos
 * - Variety constraints prevent diet monotony (PASSO 23)
 * 
 * Evolution:
 * - PASSO 20: MacroCalculator (BMR, TDEE, macro targets)
 * - PASSO 21: PortionCalculator (grams from macros)
 * - PASSO 22: MealBuilder (dynamic meal composition)
 * - PASSO 23: VarietyConstraints (diet adherence, prevent monotony)
 * 
 * Fonte: Meal prep behavior patterns (NCBI PMC7071223)
 */

/**
 * Gera um plano semanal FITNESS-AWARE (PASSO 23 - Variety Engine v2)
 * 
 * Now uses MealBuilder with VarietyTracker to ensure diet diversity
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
  
  // PASSO 23: Create variety tracker
  const varietyTracker = new VarietyTracker(DEFAULT_VARIETY_CONSTRAINTS);
  
  // Build different meals for variety (not same meal all week)
  // Strategy: Build 2-3 different lunches, 2-3 different dinners
  // Breakfast uses buildBreakfast (oats-based)
  const breakfastMeal = buildBreakfast({
    macroTargetsPerMeal: mealMacroTarget,
    availableFoods: mockFoods,
    excludedFoods: input.excludedFoods || [],
    costTier,
    varietyTracker
  });
  
  const lunchMeal1 = buildMeal({
    macroTargetsPerMeal: mealMacroTarget,
    availableFoods: mockFoods,
    excludedFoods: input.excludedFoods || [],
    costTier,
    varietyTracker
  });
  
  const lunchMeal2 = buildMeal({
    macroTargetsPerMeal: mealMacroTarget,
    availableFoods: mockFoods,
    excludedFoods: input.excludedFoods || [],
    costTier,
    varietyTracker
  });
  
  const dinnerMeal1 = buildMeal({
    macroTargetsPerMeal: mealMacroTarget,
    availableFoods: mockFoods,
    excludedFoods: input.excludedFoods || [],
    costTier,
    varietyTracker
  });
  
  const dinnerMeal2 = buildMeal({
    macroTargetsPerMeal: mealMacroTarget,
    availableFoods: mockFoods,
    excludedFoods: input.excludedFoods || [],
    costTier,
    varietyTracker
  });
  
  // Snack for 5+ meals per day (simple: yogurt + fruit)
  const includeSnack = input.mealsPerDay >= 5;
  const snackMeal = includeSnack ? buildSnack(mockFoods, input.excludedFoods || []) : null;
  
  // PASSO 23: Variety pattern - rotate meals throughout week
  // Mon/Thu: Lunch1 + Dinner1
  // Tue/Fri: Lunch2 + Dinner2  
  // Wed: Lunch1 + Dinner2
  // Sat/Sun: Lunch2 + Dinner1
  // Max 4 repetitions per meal (meets constraint)
  const mealPattern = [
    { lunch: lunchMeal1, dinner: dinnerMeal1 },  // Mon
    { lunch: lunchMeal2, dinner: dinnerMeal2 },  // Tue
    { lunch: lunchMeal1, dinner: dinnerMeal2 },  // Wed
    { lunch: lunchMeal1, dinner: dinnerMeal1 },  // Thu
    { lunch: lunchMeal2, dinner: dinnerMeal2 },  // Fri
    { lunch: lunchMeal2, dinner: dinnerMeal1 },  // Sat
    { lunch: lunchMeal2, dinner: dinnerMeal1 }   // Sun
  ];
  
  // Generate daily meals with variety pattern
  const days: DayPlan[] = daysOfWeek.map((day, index) => {
    const breakfast = convertBuiltMealToMeal(breakfastMeal);
    const lunch = convertBuiltMealToMeal(mealPattern[index].lunch);
    const dinner = convertBuiltMealToMeal(mealPattern[index].dinner);
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
