/**
 * PASSO 27 - Meal Prep Output Mode
 * 
 * Generates actionable meal prep instructions from weekly plan:
 * - Aggregates ingredients across the week
 * - Groups by cookable batches (proteins, grains, vegetables)
 * - Provides Sunday prep list with cooking instructions
 * - Makes the app truly useful for weekly meal prep
 * 
 * Scientific basis:
 * - Meal prep improves diet adherence (Obesity Research 2015)
 * - Batch cooking reduces decision fatigue
 * - Advance preparation increases healthy eating compliance
 */

import { WeeklyPlan } from "../models/WeeklyPlan";
import { CATEGORIES } from "../../core/constants/categories";
import { FoodItem } from "../models/FoodItem";
import { mockFoods } from "../../data/mockFoods";

export interface PrepIngredient {
  foodId: string;
  foodName: string;
  totalGrams: number;           // Total grams needed for the week
  category: string;             // proteins, grains, vegetables, etc.
  mealCount: number;            // How many meals use this ingredient
  isCooked: boolean;            // Needs cooking vs. ready-to-eat
}

export interface PrepStep {
  order: number;
  ingredient: string;
  action: string;               // "Cook", "Portion", "Buy frozen", etc.
  quantity: string;             // "1.5kg chicken", "1kg rice"
  instructions: string;         // Detailed cooking instructions
  estimatedTime: string;        // "45 minutes", "1 hour"
}

export interface MealPrepSummary {
  sundayPrepList: PrepStep[];   // Steps to do on Sunday
  ingredients: PrepIngredient[]; // All ingredients aggregated
  totalPrepTime: string;        // Total estimated prep time
  proteinBatches: string[];     // e.g., "1.5kg chicken breast"
  grainBatches: string[];       // e.g., "1kg brown rice"
  vegetableBatches: string[];   // e.g., "800g broccoli"
  tips: string[];               // Meal prep tips
}

/**
 * Generate meal prep summary from weekly plan
 */
export function generateMealPrepSummary(weeklyPlan: WeeklyPlan): MealPrepSummary {
  // 1. Aggregate all ingredients across the week
  const ingredients = aggregateIngredients(weeklyPlan);
  
  // 2. Categorize ingredients by type
  const proteinIngredients = ingredients.filter(i => i.category === CATEGORIES.protein);
  const grainIngredients = ingredients.filter(i => i.category === CATEGORIES.grains);
  const vegetableIngredients = ingredients.filter(i => i.category === CATEGORIES.vegetables);
  
  // 3. Generate prep steps
  const sundayPrepList = generatePrepSteps(ingredients);
  
  // 4. Calculate total prep time
  const totalPrepTime = calculateTotalPrepTime(sundayPrepList);
  
  // 5. Generate batch summaries
  const proteinBatches = generateBatchSummaries(proteinIngredients);
  const grainBatches = generateBatchSummaries(grainIngredients);
  const vegetableBatches = generateBatchSummaries(vegetableIngredients);
  
  // 6. Generate meal prep tips
  const tips = generateMealPrepTips(ingredients);
  
  return {
    sundayPrepList,
    ingredients,
    totalPrepTime,
    proteinBatches,
    grainBatches,
    vegetableBatches,
    tips
  };
}

/**
 * Aggregate all ingredients from weekly plan with total grams
 */
function aggregateIngredients(weeklyPlan: WeeklyPlan): PrepIngredient[] {
  const ingredientMap = new Map<string, PrepIngredient>();
  
  // Iterate through all days and meals
  weeklyPlan.days.forEach(day => {
    const meals = [day.meals.breakfast, day.meals.lunch, day.meals.dinner];
    if (day.meals.snack) meals.push(day.meals.snack);
    
    meals.forEach(meal => {
      if (!meal) return;
      
      meal.portions.forEach(portion => {
        const food = mockFoods.find(f => f.id === portion.foodId);
        if (!food) return;
        
        const existing = ingredientMap.get(portion.foodId);
        if (existing) {
          existing.totalGrams += portion.gramsNeeded;
          existing.mealCount += 1;
        } else {
          ingredientMap.set(portion.foodId, {
            foodId: portion.foodId,
            foodName: food.name,
            totalGrams: portion.gramsNeeded,
            category: food.category,
            mealCount: 1,
            isCooked: needsCooking(food)
          });
        }
      });
    });
  });
  
  return Array.from(ingredientMap.values()).sort((a, b) => 
    b.totalGrams - a.totalGrams // Sort by quantity descending
  );
}

/**
 * Determine if a food needs cooking
 */
function needsCooking(food: FoodItem): boolean {
  const cookedCategories = [CATEGORIES.protein, CATEGORIES.grains];
  const cookedNames = ["chicken", "rice", "pasta", "beef", "pork", "fish", "salmon", "tuna"];
  
  if (cookedCategories.includes(food.category)) return true;
  if (cookedNames.some(name => food.name.toLowerCase().includes(name))) return true;
  
  return false;
}

/**
 * Generate step-by-step prep instructions
 */
function generatePrepSteps(ingredients: PrepIngredient[]): PrepStep[] {
  const steps: PrepStep[] = [];
  let stepOrder = 1;
  
  // Group by category for logical prep order
  const proteins = ingredients.filter(i => i.category === CATEGORIES.protein && i.isCooked);
  const grains = ingredients.filter(i => i.category === CATEGORIES.grains && i.isCooked);
  const vegetables = ingredients.filter(i => i.category === CATEGORIES.vegetables && i.isCooked);
  const readyToEat = ingredients.filter(i => !i.isCooked);
  
  // 1. Cook proteins (longest cooking time)
  proteins.forEach(protein => {
    const kg = (protein.totalGrams / 1000).toFixed(1);
    const cookingMethod = getCookingMethod(protein.foodName);
    const cookingTime = getCookingTime(protein.foodName);
    
    steps.push({
      order: stepOrder++,
      ingredient: protein.foodName,
      action: "Cook",
      quantity: `${kg}kg ${protein.foodName.toLowerCase()}`,
      instructions: `${cookingMethod}. Used in ${protein.mealCount} meals this week.`,
      estimatedTime: cookingTime
    });
  });
  
  // 2. Cook grains (can cook while proteins cook)
  grains.forEach(grain => {
    const kg = (grain.totalGrams / 1000).toFixed(1);
    const cookingTime = getCookingTime(grain.foodName);
    
    steps.push({
      order: stepOrder++,
      ingredient: grain.foodName,
      action: "Cook",
      quantity: `${kg}kg ${grain.foodName.toLowerCase()}`,
      instructions: `Cook in rice cooker or pot. Used in ${grain.mealCount} meals.`,
      estimatedTime: cookingTime
    });
  });
  
  // 3. Prepare vegetables
  vegetables.forEach(veg => {
    const grams = Math.round(veg.totalGrams);
    
    steps.push({
      order: stepOrder++,
      ingredient: veg.foodName,
      action: "Prepare",
      quantity: `${grams}g ${veg.foodName.toLowerCase()}`,
      instructions: `Steam or roast. Used in ${veg.mealCount} meals.`,
      estimatedTime: "20 minutes"
    });
  });
  
  // 4. Buy ready-to-eat items
  if (readyToEat.length > 0) {
    const items = readyToEat.map(i => i.foodName).join(", ");
    steps.push({
      order: stepOrder++,
      ingredient: "Ready-to-eat items",
      action: "Buy",
      quantity: items,
      instructions: "No cooking needed - use fresh or buy pre-prepared.",
      estimatedTime: "0 minutes"
    });
  }
  
  // 5. Final step: Portion into containers
  steps.push({
    order: stepOrder++,
    ingredient: "All cooked foods",
    action: "Portion",
    quantity: "Into meal prep containers",
    instructions: "Divide cooked proteins, grains, and vegetables into individual portions for each meal. Label containers with day/meal type.",
    estimatedTime: "30 minutes"
  });
  
  return steps;
}

/**
 * Get cooking method for a protein
 */
function getCookingMethod(foodName: string): string {
  const name = foodName.toLowerCase();
  
  if (name.includes("chicken")) {
    return "Bake at 180°C for 25-30 minutes or grill on stovetop";
  } else if (name.includes("salmon") || name.includes("fish")) {
    return "Bake at 200°C for 15-20 minutes or pan-sear";
  } else if (name.includes("beef") || name.includes("steak")) {
    return "Grill or pan-sear to desired doneness";
  } else if (name.includes("tuna") && name.includes("canned")) {
    return "No cooking needed - drain and use";
  } else if (name.includes("egg")) {
    return "Boil 10 minutes for hard-boiled eggs";
  } else {
    return "Cook according to package instructions";
  }
}

/**
 * Get estimated cooking time
 */
function getCookingTime(foodName: string): string {
  const name = foodName.toLowerCase();
  
  if (name.includes("chicken")) return "45 minutes";
  if (name.includes("salmon") || name.includes("fish")) return "20 minutes";
  if (name.includes("beef") || name.includes("steak")) return "30 minutes";
  if (name.includes("rice")) return "25 minutes";
  if (name.includes("pasta")) return "15 minutes";
  if (name.includes("quinoa")) return "20 minutes";
  if (name.includes("oat")) return "5 minutes";
  if (name.includes("egg")) return "15 minutes";
  
  return "30 minutes";
}

/**
 * Calculate total prep time from all steps
 */
function calculateTotalPrepTime(steps: PrepStep[]): string {
  const parseMinutes = (value: string): number => {
    const lower = value.toLowerCase();
    const hourMatch = lower.match(/(\d+)\s*h/);
    const minuteMatch = lower.match(/(\d+)\s*(min|minute)/);

    let minutes = 0;
    if (hourMatch) {
      minutes += parseInt(hourMatch[1], 10) * 60;
    }
    if (minuteMatch) {
      minutes += parseInt(minuteMatch[1], 10);
    }

    if (minutes === 0) {
      const fallback = lower.match(/(\d+)/);
      if (fallback) {
        minutes = parseInt(fallback[1], 10);
      }
    }

    return minutes;
  };

  const cookDurations = steps
    .filter(step => step.action === "Cook")
    .map(step => parseMinutes(step.estimatedTime));

  const prepDurations = steps
    .filter(step => step.action === "Prepare")
    .map(step => parseMinutes(step.estimatedTime));

  const portionDurations = steps
    .filter(step => step.action === "Portion")
    .map(step => parseMinutes(step.estimatedTime));

  // Cooking tasks can run mostly in parallel (oven + stovetop), so use longest single cook block.
  const cookBlock = cookDurations.length > 0 ? Math.max(...cookDurations) : 0;

  // Prep tasks are partially batchable; cap cumulative overhead to avoid unrealistic inflation.
  const prepBlock = Math.min(prepDurations.reduce((sum, value) => sum + value, 0), 90);

  const portionBlock = portionDurations.reduce((sum, value) => sum + value, 0);
  const totalMinutes = cookBlock + prepBlock + portionBlock;
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }
  return `${minutes}min`;
}

/**
 * Generate batch summaries (e.g., "1.5kg chicken breast")
 */
function generateBatchSummaries(ingredients: PrepIngredient[]): string[] {
  return ingredients.map(ing => {
    const kg = (ing.totalGrams / 1000).toFixed(1);
    if (ing.totalGrams >= 1000) {
      return `${kg}kg ${ing.foodName}`;
    } else {
      return `${Math.round(ing.totalGrams)}g ${ing.foodName}`;
    }
  });
}

/**
 * Generate helpful meal prep tips
 */
function generateMealPrepTips(ingredients: PrepIngredient[]): string[] {
  const tips: string[] = [];
  
  // Tip 1: Cook proteins together
  const proteins = ingredients.filter(i => i.category === CATEGORIES.protein && i.isCooked);
  if (proteins.length > 1) {
    tips.push("Cook all proteins at once in the oven to save time and energy.");
  }
  
  // Tip 2: Use rice cooker
  const hasRice = ingredients.some(i => i.foodName.toLowerCase().includes("rice"));
  if (hasRice) {
    tips.push("Use a rice cooker for hands-off grain cooking while you prep proteins.");
  }
  
  // Tip 3: Frozen vegetables
  const hasVegetables = ingredients.filter(i => i.category === CATEGORIES.vegetables).length > 0;
  if (hasVegetables) {
    tips.push("Consider buying frozen vegetables to save prep time - they're pre-washed and cut.");
  }
  
  // Tip 4: Storage
  tips.push("Store proteins and grains separately from vegetables to maintain freshness.");
  
  // Tip 5: Portion control
  tips.push("Use identical containers for easy portion control and fridge organization.");
  
  // Tip 6: Labeling
  tips.push("Label containers with meal type and day (e.g., 'Monday Lunch') for easy grabbing.");
  
  // Tip 7: Freezing
  const totalGrams = ingredients.reduce((sum, i) => sum + i.totalGrams, 0);
  if (totalGrams > 5000) {
    tips.push("Consider freezing portions for later in the week to maintain freshness.");
  }
  
  return tips;
}
