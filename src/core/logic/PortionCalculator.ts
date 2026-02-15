/**
 * PortionCalculator.ts
 * Calculates ingredient portions (in grams) to hit macro targets per meal
 * 
 * Instead of fixed portions (200g chicken), we calculate:
 * - Target protein = 40g → chicken (31g/100g) → 129g chicken needed
 * 
 * References:
 * - Macro-based portioning: USDA FoodData Central
 * - Meal prep calculations: ISSN Position Stand
 */

import { FoodItem } from "../models/FoodItem";

export interface MacroTargetPerMeal {
  protein: number;  // grams
  carbs: number;    // grams
  fats: number;     // grams
}

export interface FoodPortion {
  foodId: string;
  foodName: string;
  gramsNeeded: number;
  macroContribution: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

/**
 * Calculate grams of food needed to hit protein target
 * 
 * @param food - Food item with macros per 100g
 * @param targetProtein - Target protein in grams
 * @returns Grams of food needed
 * 
 * Example:
 * - Target: 40g protein
 * - Chicken: 31g protein / 100g
 * - Result: (40 / 31) * 100 = 129g chicken
 */
export function gramsForProtein(food: FoodItem, targetProtein: number): number {
  if (!food.macros?.protein || food.macros.protein === 0) {
    return 0;
  }
  
  const gramsNeeded = (targetProtein / food.macros.protein) * 100;
  return Math.round(gramsNeeded);
}

/**
 * Calculate grams of food needed to hit carbs target
 * 
 * @param food - Food item with macros per 100g
 * @param targetCarbs - Target carbs in grams
 * @returns Grams of food needed
 * 
 * Example:
 * - Target: 50g carbs
 * - Rice: 28g carbs / 100g
 * - Result: (50 / 28) * 100 = 179g rice
 */
export function gramsForCarbs(food: FoodItem, targetCarbs: number): number {
  if (!food.macros?.carbs || food.macros.carbs === 0) {
    return 0;
  }
  
  const gramsNeeded = (targetCarbs / food.macros.carbs) * 100;
  return Math.round(gramsNeeded);
}

/**
 * Calculate grams of food needed to hit fats target
 * 
 * @param food - Food item with macros per 100g
 * @param targetFats - Target fats in grams
 * @returns Grams of food needed
 * 
 * Example:
 * - Target: 15g fats
 * - Olive oil: 100g fats / 100g
 * - Result: (15 / 100) * 100 = 15g olive oil
 */
export function gramsForFats(food: FoodItem, targetFats: number): number {
  if (!food.macros?.fat || food.macros.fat === 0) {
    return 0;
  }
  
  const gramsNeeded = (targetFats / food.macros.fat) * 100;
  return Math.round(gramsNeeded);
}

/**
 * Calculate actual macro contribution from a food portion
 * 
 * @param food - Food item with macros per 100g
 * @param grams - Grams of food
 * @returns Actual macros delivered
 */
export function calculateMacroContribution(
  food: FoodItem,
  grams: number
): { protein: number; carbs: number; fats: number } {
  if (!food.macros) {
    return { protein: 0, carbs: 0, fats: 0 };
  }
  
  const factor = grams / 100;
  
  return {
    protein: Math.round(food.macros.protein * factor),
    carbs: Math.round(food.macros.carbs * factor),
    fats: Math.round(food.macros.fat * factor)
  };
}

/**
 * Calculate portions for a complete meal
 * 
 * Strategy:
 * 1. Protein source → hits protein target
 * 2. Carb source → hits carbs target
 * 3. Fat source → hits remaining fats (protein/carbs have some fat)
 * 4. Vegetables → fixed 150g (fiber, micronutrients)
 * 
 * @param macroTarget - Target macros for this meal
 * @param proteinSource - Main protein food
 * @param carbSource - Main carb food
 * @param fatSource - Main fat source (oil, nuts, etc)
 * @param vegetables - Optional vegetables (150g default)
 * @returns Array of food portions with grams
 */
export function calculateMealPortions(
  macroTarget: MacroTargetPerMeal,
  proteinSource: FoodItem,
  carbSource: FoodItem,
  fatSource: FoodItem | null = null,
  vegetables: FoodItem | null = null
): FoodPortion[] {
  const portions: FoodPortion[] = [];
  
  // 1. Protein source
  const proteinGrams = gramsForProtein(proteinSource, macroTarget.protein);
  const proteinContribution = calculateMacroContribution(proteinSource, proteinGrams);
  
  portions.push({
    foodId: proteinSource.id,
    foodName: proteinSource.name,
    gramsNeeded: proteinGrams,
    macroContribution: proteinContribution
  });
  
  // 2. Carb source
  const carbGrams = gramsForCarbs(carbSource, macroTarget.carbs);
  const carbContribution = calculateMacroContribution(carbSource, carbGrams);
  
  portions.push({
    foodId: carbSource.id,
    foodName: carbSource.name,
    gramsNeeded: carbGrams,
    macroContribution: carbContribution
  });
  
  // 3. Fat source (account for fats from protein + carbs)
  if (fatSource) {
    const fatsFromProteinAndCarbs = proteinContribution.fats + carbContribution.fats;
    const remainingFats = Math.max(0, macroTarget.fats - fatsFromProteinAndCarbs);
    
    if (remainingFats > 0) {
      const fatGrams = gramsForFats(fatSource, remainingFats);
      const fatContribution = calculateMacroContribution(fatSource, fatGrams);
      
      portions.push({
        foodId: fatSource.id,
        foodName: fatSource.name,
        gramsNeeded: fatGrams,
        macroContribution: fatContribution
      });
    }
  }
  
  // 4. Vegetables (fixed 150g for fiber/micronutrients)
  if (vegetables) {
    const vegContribution = calculateMacroContribution(vegetables, 150);
    
    portions.push({
      foodId: vegetables.id,
      foodName: vegetables.name,
      gramsNeeded: 150,
      macroContribution: vegContribution
    });
  }
  
  return portions;
}

/**
 * Calculate total macros from portions
 */
export function calculateTotalMacros(portions: FoodPortion[]): MacroTargetPerMeal {
  return portions.reduce(
    (total, portion) => ({
      protein: total.protein + portion.macroContribution.protein,
      carbs: total.carbs + portion.macroContribution.carbs,
      fats: total.fats + portion.macroContribution.fats
    }),
    { protein: 0, carbs: 0, fats: 0 }
  );
}
