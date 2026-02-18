import { PlanInput } from "../models/PlanInput";
import { CATEGORIES } from "../../core/constants/categories";
import { WeeklyPlan, DayOfWeek, DayPlan, DayMeals, Meal, FoodPortion } from "../models/WeeklyPlan";
import { calculateMacroTargets } from "./MacroCalculator";
import { calculateTDEE } from "./calculateTDEE";
import { MacroTargetPerMeal } from "./PortionCalculator";
import { buildMeal, buildBreakfast } from "./MealBuilder";
import { VarietyTracker, DEFAULT_VARIETY_CONSTRAINTS } from "./VarietyConstraints";
import { FoodRotationEngine } from "./FoodRotation";
import { mockFoods } from "../../data/mockFoods";
import { userPreferencesStore } from "../stores/UserPreferencesStore";
import { generateMealPrepSummary } from "./MealPrepSummary";
import { generatePlanFingerprint } from "../utils/planFingerprint";

/**
 * FITNESS-FIRST WEEKLY PLAN GENERATOR (PASSO 25 - Training Day Nutrition)
 * 
 * Gera plano semanal DINÂMICO baseado em macro targets:
 * - Meals built from macro targets (não templates fixos)
 * - MealBuilder seleciona melhores fontes (protein/carb/vegetable)
 * - Portions calculadas via PortionCalculator
 * - Cost tier influencia seleção de alimentos
 * - Variety constraints prevent diet monotony (PASSO 23)
 * - Training day adjustments: +15% carbs, +10% calories (PASSO 25)
 * 
 * Evolution:
 * - PASSO 20: MacroCalculator (BMR, TDEE, macro targets)
 * - PASSO 21: PortionCalculator (grams from macros)
 * - PASSO 22: MealBuilder (dynamic meal composition)
 * - PASSO 23: VarietyConstraints (diet adherence, prevent monotony)
 * - PASSO 25: Training day nutrition (carb boost for workouts)
 * 
 * Fonte: Nutrient timing for performance (ISSN Position Stand 2017)
 */

/**
 * Gera um plano semanal FITNESS-AWARE (PASSO 25 - Training Day Nutrition)
 * 
 * Now uses MealBuilder with VarietyTracker to ensure diet diversity
 * and adjusts macros for training days (+15% carbs, +10% calories)
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

  // PASSO 25: Determine training days (4 days/week if trains=true)
  const trainingDays = determineTrainingDays(input.trains);

  const macroTargets = calculateMacroTargets(input);
  const tdeeData = calculateTDEE(input);
  const costTier = input.costTier;
  
  // Calculate meal macro targets (rest days - baseline)
  const restDayMacroTarget: MacroTargetPerMeal = {
    protein: macroTargets.proteinPerMeal,
    carbs: macroTargets.carbsPerMeal,
    fats: macroTargets.fatsPerMeal
  };
  
  // PASSO 25: Training day macro targets (+15% carbs, +10% calories via fats)
  const trainingDayMacroTarget: MacroTargetPerMeal = {
    protein: macroTargets.proteinPerMeal, // Stays constant
    carbs: Math.round(macroTargets.carbsPerMeal * 1.15), // +15% carbs
    fats: Math.round(macroTargets.fatsPerMeal * 1.05) // +5% fats for +10% total calories
  };
  
  // PASSO 23: Create variety tracker
  const varietyTracker = new VarietyTracker(DEFAULT_VARIETY_CONSTRAINTS);
  const foodRotation = new FoodRotationEngine();
  const rotationSeed = generateWeeklyRotationSeed(input);
  
  // Snack for 5+ meals per day (simple: yogurt + fruit)
  const includeSnack = input.mealsPerDay >= 5;
  const snackMeal = includeSnack ? buildSnack(mockFoods, input.excludedFoods || []) : null;

  // Generate daily meals with training day awareness
  const days: DayPlan[] = daysOfWeek.map((day, index) => {
    const isTrainingDay = trainingDays.includes(day);
    const macroTargetForDay = isTrainingDay ? trainingDayMacroTarget : restDayMacroTarget;

    const breakfastBuilt = buildBreakfast({
      macroTargetsPerMeal: macroTargetForDay,
      availableFoods: mockFoods,
      excludedFoods: input.excludedFoods || [],
      costTier,
      varietyTracker,
      foodRotation,
      rotationSeed: `${rotationSeed}-breakfast-${index}`
    });

    const lunchBuilt = buildMeal({
      macroTargetsPerMeal: macroTargetForDay,
      availableFoods: mockFoods,
      excludedFoods: input.excludedFoods || [],
      costTier,
      varietyTracker,
      foodRotation,
      rotationSeed: `${rotationSeed}-lunch-${index}`
    });

    const dinnerBuilt = buildMeal({
      macroTargetsPerMeal: macroTargetForDay,
      availableFoods: mockFoods,
      excludedFoods: input.excludedFoods || [],
      costTier,
      varietyTracker,
      foodRotation,
      rotationSeed: `${rotationSeed}-dinner-${index}`
    });

    const breakfast = convertBuiltMealToMeal(breakfastBuilt);
    const lunch = convertBuiltMealToMeal(lunchBuilt);
    const dinner = convertBuiltMealToMeal(dinnerBuilt);
    const snack = snackMeal ? convertBuiltMealToMeal(snackMeal) : null;

    const meals: DayMeals = {
      breakfast,
      lunch,
      dinner,
      snack
    };

    return { day, meals, trainingDay: isTrainingDay };
  });

  const weeklyPlan: WeeklyPlan = {
    id: generatePlanId(),
    createdAt: new Date(),
    planInput: input,
    days,
    shoppingList: [],
    costTier: costTier,
    tdee: Math.round(tdeeData.tdee),
    calorieTargetPerDay: macroTargets.caloriesTargetPerDay,
    caloriesTargetPerDay: macroTargets.caloriesTargetPerDay,
    proteinTargetPerDay: macroTargets.proteinTargetPerDay,
    carbsTargetPerDay: macroTargets.carbsTargetPerDay,
    fatTargetPerDay: macroTargets.fatTargetPerDay,
    proteinPerMeal: macroTargets.proteinPerMeal,
    carbsPerMeal: macroTargets.carbsPerMeal,
    fatsPerMeal: macroTargets.fatsPerMeal,
    // PASSO 31: Add plan fingerprint for personalization guarantee
    planHash: generatePlanFingerprint(input)
  };

  // PASSO 27: Generate meal prep summary (Sunday prep list)
  const mealPrepSummary = generateMealPrepSummary(weeklyPlan);
  weeklyPlan.mealPrepSummary = mealPrepSummary;

  return weeklyPlan;
}

function generateWeeklyRotationSeed(input: PlanInput): string {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const daysSinceStart = Math.floor((today.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekOfYear = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);

  return `${today.getFullYear()}-W${weekOfYear}-${input.sex}-${input.age}-${input.weightKg}-${input.heightCm}-${input.mealsPerDay}-${input.dietStyle}-${input.costTier}-${input.fitnessGoal || "maintenance"}`;
}

/**
 * Convert BuiltMeal (from MealBuilder) to Meal (WeeklyPlan format)
 * 
 * PASSO 26: Track food selections to learn user preferences automatically
 */
function convertBuiltMealToMeal(builtMeal: ReturnType<typeof buildMeal>): Meal {
  const portions: FoodPortion[] = builtMeal.ingredients.map(ing => ({
    foodId: ing.foodId,
    gramsNeeded: ing.grams
  }));
  
  const foodIds = builtMeal.ingredients.map(ing => ing.foodId);
  
  // PASSO 26: Track each food selection to learn preferences
  builtMeal.ingredients.forEach(ing => {
    userPreferencesStore.trackFoodSelection(ing.foodName);
  });
  
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
    f.category === CATEGORIES.dairy && 
    !excludedFoods.includes(f.name) &&
    f.name.toLowerCase().includes("yogurt")
  );
  
  const fruit = availableFoods.find(f => 
    f.category === CATEGORIES.fruits && 
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

/**
 * PASSO 25: Determine which days are training days
 * 
 * Strategy for 4 training days/week (trains=true):
 * - Monday: Training (start week strong)
 * - Tuesday: Rest
 * - Wednesday: Training (mid-week)
 * - Thursday: Training (consistency)
 * - Friday: Rest (recovery before weekend)
 * - Saturday: Training (weekend energy)
 * - Sunday: Rest (full recovery)
 * 
 * Pattern: Mon-Wed-Thu-Sat (common 4-day split)
 * 
 * @param trains - Whether user trains (from PlanInput)
 * @returns Array of days that are training days
 */
function determineTrainingDays(trains: boolean): DayOfWeek[] {
  if (!trains) {
    return []; // No training days
  }
  
  // 4 training days: Mon, Wed, Thu, Sat
  return ["monday", "wednesday", "thursday", "saturday"];
}
