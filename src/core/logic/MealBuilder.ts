/**
 * MealBuilder.ts
 * Dynamically builds meals from macro targets instead of hardcoded templates
 * 
 * Strategy:
 * 1. Select best protein source (based on cost tier and protein content)
 * 2. Select best carb source (based on cost tier and carb content)
 * 3. Add vegetable (150g fixed for fiber/micronutrients)
 * 4. Use PortionCalculator to compute exact grams
 * 5. Generate descriptive meal name
 * 
 * References:
 * - Meal composition: ISSN Position Stand on Nutrient Timing
 * - Food selection: Protein-per-cost optimization (PASSO 3)
 */

import { FoodItem } from "../models/FoodItem";
import { CostTier } from "../models/CostTier";
import { 
  calculateMealPortions, 
  MacroTargetPerMeal,
  calculateTotalMacros
} from "./PortionCalculator";

export interface MealIngredient {
  foodId: string;
  foodName: string;
  grams: number;
}

export interface BuiltMeal {
  name: string;
  ingredients: MealIngredient[];
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface MealBuilderInput {
  macroTargetsPerMeal: MacroTargetPerMeal;
  availableFoods: FoodItem[];
  excludedFoods?: string[];
  costTier: CostTier;
}

/**
 * Calculate protein per euro for food selection
 */
function getProteinPerCost(food: FoodItem): number {
  if (!food.macros?.protein || food.pricePerUnit === 0) return 0;
  return food.macros.protein / food.pricePerUnit;
}

/**
 * Calculate carbs per euro for food selection
 */
function getCarbsPerCost(food: FoodItem): number {
  if (!food.macros?.carbs || food.pricePerUnit === 0) return 0;
  return food.macros.carbs / food.pricePerUnit;
}

/**
 * Filter out excluded foods
 */
function filterExcludedFoods(foods: FoodItem[], excludedFoods: string[] = []): FoodItem[] {
  if (excludedFoods.length === 0) return foods;
  
  return foods.filter(food => !excludedFoods.includes(food.name));
}

/**
 * Select best protein source based on cost tier
 * 
 * Low tier: Highest protein per euro (tuna, eggs, chicken)
 * Medium tier: Balance of protein content and quality
 * High tier: Highest protein content (salmon, premium meats)
 */
function selectProteinSource(
  availableFoods: FoodItem[],
  costTier: CostTier,
  excludedFoods: string[] = []
): FoodItem | null {
  const proteinFoods = filterExcludedFoods(availableFoods, excludedFoods)
    .filter(f => 
      f.category === "proteins" && 
      f.macros && 
      f.macros.protein > 15 // At least 15g protein per 100g
    );
  
  if (proteinFoods.length === 0) return null;
  
  if (costTier === "low") {
    // Maximize protein per euro
    return proteinFoods.sort((a, b) => 
      getProteinPerCost(b) - getProteinPerCost(a)
    )[0];
  } else if (costTier === "high") {
    // Maximize protein content (quality)
    return proteinFoods.sort((a, b) => 
      (b.macros?.protein || 0) - (a.macros?.protein || 0)
    )[0];
  } else {
    // Medium: Balance (protein * protein_per_cost)
    return proteinFoods.sort((a, b) => {
      const scoreA = (a.macros?.protein || 0) * getProteinPerCost(a);
      const scoreB = (b.macros?.protein || 0) * getProteinPerCost(b);
      return scoreB - scoreA;
    })[0];
  }
}

/**
 * Select best carb source based on cost tier
 * 
 * Low tier: Highest carbs per euro (rice, pasta, oats)
 * Medium tier: Balance of carbs and quality
 * High tier: Highest quality carbs (quinoa, sweet potato)
 */
function selectCarbSource(
  availableFoods: FoodItem[],
  costTier: CostTier,
  excludedFoods: string[] = []
): FoodItem | null {
  const carbFoods = filterExcludedFoods(availableFoods, excludedFoods)
    .filter(f => 
      (f.category === "grains" || f.category === "vegetables") &&
      f.macros && 
      f.macros.carbs > 15 && // At least 15g carbs per 100g
      f.macros.carbs > f.macros.protein && // More carbs than protein
      !f.name.toLowerCase().includes("oat") // Exclude oats (breakfast only)
    );
  
  if (carbFoods.length === 0) return null;
  
  if (costTier === "low") {
    // Maximize carbs per euro
    return carbFoods.sort((a, b) => 
      getCarbsPerCost(b) - getCarbsPerCost(a)
    )[0];
  } else if (costTier === "high") {
    // Prefer quinoa, sweet potato (lower GI, nutrient-dense)
    const premium = carbFoods.find(f => 
      f.name.toLowerCase().includes("quinoa") || 
      f.name.toLowerCase().includes("sweet potato")
    );
    return premium || carbFoods.sort((a, b) => 
      (b.macros?.carbs || 0) - (a.macros?.carbs || 0)
    )[0];
  } else {
    // Medium: Brown rice, whole wheat
    const balanced = carbFoods.find(f => 
      f.name.toLowerCase().includes("brown") || 
      f.name.toLowerCase().includes("whole")
    );
    return balanced || carbFoods.sort((a, b) => 
      getCarbsPerCost(b) - getCarbsPerCost(a)
    )[0];
  }
}

/**
 * Select vegetable (fixed 150g for fiber/micronutrients)
 */
function selectVegetable(
  availableFoods: FoodItem[],
  excludedFoods: string[] = []
): FoodItem | null {
  const vegetables = filterExcludedFoods(availableFoods, excludedFoods)
    .filter(f => 
      f.category === "vegetables" &&
      f.macros &&
      f.macros.carbs < 15 // Low-carb vegetables (broccoli, spinach, not sweet potato)
    );
  
  if (vegetables.length === 0) return null;
  
  // Prefer broccoli, spinach (nutrient-dense)
  const preferred = vegetables.find(f => 
    f.name.toLowerCase().includes("broccoli") || 
    f.name.toLowerCase().includes("spinach")
  );
  
  return preferred || vegetables[0];
}

/**
 * Select fat source (oil, nuts, etc.)
 */
function selectFatSource(
  availableFoods: FoodItem[],
  excludedFoods: string[] = []
): FoodItem | null {
  const fatFoods = filterExcludedFoods(availableFoods, excludedFoods)
    .filter(f => 
      f.category === "oils" && 
      f.macros && 
      f.macros.fat > 50
    );
  
  if (fatFoods.length === 0) return null;
  
  // Prefer olive oil (heart-healthy)
  const preferred = fatFoods.find(f => 
    f.name.toLowerCase().includes("olive")
  );
  
  return preferred || fatFoods[0];
}

/**
 * Generate meal name from ingredients
 */
function generateMealName(
  proteinSource: FoodItem | null,
  carbSource: FoodItem | null,
  vegetable: FoodItem | null
): string {
  const parts: string[] = [];
  
  if (proteinSource) {
    parts.push(proteinSource.name.replace(/ \(.*\)/, "")); // Remove "(canned)" etc.
  }
  
  if (carbSource) {
    parts.push(carbSource.name.replace(/ \(.*\)/, ""));
  }
  
  if (vegetable) {
    parts.push(vegetable.name.replace(/ \(.*\)/, ""));
  }
  
  return parts.length > 0 ? parts.join(" + ") : "Simple Meal";
}

/**
 * Build meal dynamically from macro targets
 * 
 * @param input - Meal builder configuration
 * @returns Built meal with ingredients and macros
 * 
 * Example:
 * Input: 40g protein, 50g carbs, 15g fats, low tier
 * Output: Chicken + Rice + Broccoli (130g chicken, 179g rice, 150g broccoli)
 */
export function buildMeal(input: MealBuilderInput): BuiltMeal {
  const { macroTargetsPerMeal, availableFoods, excludedFoods = [], costTier } = input;
  
  // 1. Select food sources
  const proteinSource = selectProteinSource(availableFoods, costTier, excludedFoods);
  const carbSource = selectCarbSource(availableFoods, costTier, excludedFoods);
  const vegetable = selectVegetable(availableFoods, excludedFoods);
  const fatSource = selectFatSource(availableFoods, excludedFoods);
  
  // 2. Validate we have at least protein and carbs
  if (!proteinSource || !carbSource) {
    throw new Error(
      `Cannot build meal: Missing ${!proteinSource ? "protein source" : "carb source"}`
    );
  }
  
  // 3. Calculate portions using PortionCalculator
  const portions = calculateMealPortions(
    macroTargetsPerMeal,
    proteinSource,
    carbSource,
    fatSource,
    vegetable
  );
  
  // 4. Convert to MealIngredient format
  const ingredients: MealIngredient[] = portions.map(portion => ({
    foodId: portion.foodId,
    foodName: portion.foodName,
    grams: portion.gramsNeeded
  }));
  
  // 5. Calculate total macros
  const totalMacros = calculateTotalMacros(portions);
  
  // 6. Generate meal name
  const name = generateMealName(proteinSource, carbSource, vegetable);
  
  return {
    name,
    ingredients,
    macros: {
      protein: totalMacros.protein,
      carbs: totalMacros.carbs,
      fats: totalMacros.fats
    }
  };
}

/**
 * Build breakfast meal (different strategy - carb-focused)
 */
export function buildBreakfast(input: MealBuilderInput): BuiltMeal {
  const { availableFoods, excludedFoods = [] } = input;
  
  // Breakfast strategy: Oats + Dairy + Fruit
  const oats = filterExcludedFoods(availableFoods, excludedFoods)
    .find(f => f.name.toLowerCase().includes("oat"));
  
  const dairy = filterExcludedFoods(availableFoods, excludedFoods)
    .find(f => 
      f.category === "dairy" && 
      f.macros && 
      f.macros.protein > 5
    );
  
  const fruit = filterExcludedFoods(availableFoods, excludedFoods)
    .find(f => f.category === "fruits");
  
  // Fallback to regular meal builder if breakfast-specific foods not available
  if (!oats || !dairy) {
    return buildMeal(input);
  }
  
  // Simple breakfast portions (not macro-optimized, traditional portions)
  const ingredients: MealIngredient[] = [
    { foodId: oats.id, foodName: oats.name, grams: 80 },
    { foodId: dairy.id, foodName: dairy.name, grams: 150 }
  ];
  
  if (fruit) {
    ingredients.push({ foodId: fruit.id, foodName: fruit.name, grams: 100 });
  }
  
  // Calculate macros from portions
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  
  ingredients.forEach(ing => {
    const food = availableFoods.find(f => f.id === ing.foodId);
    if (food?.macros) {
      const factor = ing.grams / 100;
      totalProtein += food.macros.protein * factor;
      totalCarbs += food.macros.carbs * factor;
      totalFats += food.macros.fat * factor;
    }
  });
  
  const name = [oats.name, dairy.name, fruit?.name]
    .filter(Boolean)
    .map(n => n!.replace(/ \(.*\)/, ""))
    .join(" + ");
  
  return {
    name,
    ingredients,
    macros: {
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fats: Math.round(totalFats)
    }
  };
}
