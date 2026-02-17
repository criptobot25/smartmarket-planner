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
 * PASSO 23: Variety Engine v2
 * - Enforces diet variety constraints (min proteins, vegetables, max repetition)
 * - Prevents fish/red meat overconsumption
 * - Uses VarietyTracker to ensure adherence
 * 
 * PASSO 24: CostTier Food Selection
 * - Low tier: Only low/medium cost foods (budget-friendly)
 * - Medium tier: Low/medium cost foods (balanced)
 * - High tier: All foods including premium (unrestricted)
 * 
 * PASSO 26: Preference Learning System (Sticky UX)
 * - Prioritizes liked foods (higher selection probability)
 * - Avoids disliked foods (excluded automatically)
 * - Learns from user behavior over time
 * 
 * References:
 * - Meal composition: ISSN Position Stand on Nutrient Timing
 * - Food selection: Protein-per-cost optimization (PASSO 3)
 * - Variety constraints: Diet adherence studies (JAMA 2018)
 * - Personalization: Preference learning improves adherence (Am J Clin Nutr 2019)
 */

import { FoodItem } from "../models/FoodItem";
import { CATEGORIES } from "../../core/constants/categories";
import { CostTier } from "../models/CostTier";
import { 
  calculateMealPortions, 
  MacroTargetPerMeal,
  calculateTotalMacros
} from "./PortionCalculator";
import { VarietyTracker } from "./VarietyConstraints";
import { userPreferencesStore } from "../stores/UserPreferencesStore";
import { RotationEngine } from "./RotationEngine";

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
  varietyTracker?: VarietyTracker; // PASSO 23: Track variety constraints
  rotationEngine?: RotationEngine; // PASSO 32: Track rotation penalties
}

/**
 * PASSO 31-32: Calculate food score with quadratic rotation penalty
 * 
 * Scoring factors:
 * - Base score: protein-per-cost or carbs-per-cost
 * - Rotation penalty: Quadratic penalty (usageCount²) from RotationEngine
 *   - Never used (0): penalty = 0
 *   - Used once (1): penalty = 1
 *   - Used twice (2): penalty = 4
 *   - Used thrice (3): penalty = 9
 *   - Used 4 times (4): penalty = 16
 * - Cost tier match: Ensures appropriate food selection
 * 
 * This creates STRONG preference for variety over repetition
 */
function calculateFoodScore(
  food: FoodItem,
  _costTier: CostTier,
  varietyTracker?: VarietyTracker,
  isProtein: boolean = true,
  rotationEngine?: RotationEngine
): number {
  // Base score
  const baseScore = isProtein 
    ? getProteinPerCost(food)
    : getCarbsPerCost(food);
  
  // If no rotation tracking, use old variety bonus/penalty system
  if (!rotationEngine || !varietyTracker) {
    if (!varietyTracker) return baseScore;
    
    // Fallback to PASSO 31 logic
    const usageCount = varietyTracker.getFoodUsageCount(food.name);
    let multiplier = 1.0;
    
    if (usageCount === 0) {
      multiplier += 0.20; // +20% for fresh variety
    } else if (usageCount === 1) {
      multiplier += 0.10; // +10% for minimal repetition
    }
    
    if (usageCount >= 4) {
      multiplier -= 0.30; // -30% for excessive repetition
    } else if (usageCount >= 3) {
      multiplier -= 0.15; // -15% for high repetition
    }
    
    return baseScore * multiplier;
  }
  
  // PASSO 32: Use quadratic rotation penalty
  const usageCount = varietyTracker.getFoodUsageCount(food.name);
  const penalty = rotationEngine.calculateRotationPenalty(usageCount);
  
  // Apply penalty: higher penalty = lower score
  // Penalty scale: divide by (1 + penalty * 0.5) to avoid negative scores
  const penalizedScore = baseScore / (1 + penalty * 0.5);
  
  return penalizedScore;
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
 * PASSO 24: Filter foods by cost tier availability
 * 
 * Low tier: Only low/medium cost foods (excludes premium)
 * Medium tier: Low/medium cost foods (same as low for consistency)
 * High tier: All foods including premium (unrestricted)
 */
function filterByCostTier(foods: FoodItem[], costTier: CostTier): FoodItem[] {
  if (costTier === "high") {
    return foods; // All foods available
  }
  
  // Low and medium tiers: exclude high-cost foods
  return foods.filter(f => f.costLevel === "low" || f.costLevel === "medium");
}

/**
 * PASSO 26: Sort foods by preference score (liked foods first)
 * 
 * Scoring:
 * - Liked foods: +10 base score
 * - Selection history: +1 per past selection
 * - Disliked foods: -100 (effectively excluded)
 * 
 * Higher scores = more preferred = higher selection priority
 */
function sortByPreference(foods: FoodItem[]): FoodItem[] {
  return [...foods].sort((a, b) => {
    const scoreA = userPreferencesStore.getPreferenceScore(a.name);
    const scoreB = userPreferencesStore.getPreferenceScore(b.name);
    return scoreB - scoreA; // Descending order (highest preference first)
  });
}

/**
 * Select best protein source based on cost tier
 * 
 * PASSO 23: Respects variety constraints (fish limit, red meat limit)
 * PASSO 24: Filters by cost tier (low/medium exclude premium foods)
 * 
 * Low tier: Highest protein per euro (tuna, eggs, chicken)
 * Medium tier: Balance of protein content and quality
 * High tier: Highest protein content (salmon, premium meats)
 */
function selectProteinSource(
  availableFoods: FoodItem[],
  costTier: CostTier,
  excludedFoods: string[] = [],
  varietyTracker?: VarietyTracker,
  rotationEngine?: RotationEngine
): FoodItem | null {
  let proteinFoods = filterExcludedFoods(availableFoods, excludedFoods)
    .filter(f => 
      f.category === CATEGORIES.protein && 
      f.macros && 
      f.macros.protein > 15 // At least 15g protein per 100g
    );
  
  // PASSO 24: Filter by cost tier
  proteinFoods = filterByCostTier(proteinFoods, costTier);
  
  // PASSO 23: Filter by variety constraints
  if (varietyTracker) {
    proteinFoods = proteinFoods.filter(f => varietyTracker.canUseProteinSource(f));
  }
  
  if (proteinFoods.length === 0) return null;
  
  // PASSO 26 & 31: Sort by cost/quality with variety bonus and repetition penalty
  let sorted: FoodItem[];
  if (costTier === "low") {
    // Maximize protein per euro with variety consideration
    sorted = proteinFoods.sort((a, b) => 
      calculateFoodScore(b, costTier, varietyTracker, true, rotationEngine) - 
      calculateFoodScore(a, costTier, varietyTracker, true, rotationEngine)
    );
  } else if (costTier === "high") {
    // Maximize protein content (quality) with variety consideration
    sorted = proteinFoods.sort((a, b) => {
      const scoreA = (a.macros?.protein || 0) * (varietyTracker && varietyTracker.getFoodUsageCount(a.name) === 0 ? 1.2 : 1.0);
      const scoreB = (b.macros?.protein || 0) * (varietyTracker && varietyTracker.getFoodUsageCount(b.name) === 0 ? 1.2 : 1.0);
      return scoreB - scoreA;
    });
  } else {
    // Medium: Balance with variety consideration
    sorted = proteinFoods.sort((a, b) => {
      const scoreA = calculateFoodScore(a, costTier, varietyTracker, true, rotationEngine) * (a.macros?.protein || 0);
      const scoreB = calculateFoodScore(b, costTier, varietyTracker, true, rotationEngine) * (b.macros?.protein || 0);
      return scoreB - scoreA;
    });
  }
  
  // Take top 3 candidates and prioritize by user preference
  const topCandidates = sorted.slice(0, 3);
  return sortByPreference(topCandidates)[0];
}

/**
 * Select best carb source based on cost tier
 * 
 * PASSO 24: Filters by cost tier availability
 * PASSO 31: Adds variety bonus and repetition penalty
 * 
 * Low tier: Highest carbs per euro (rice, pasta, oats)
 * Medium tier: Balance of carbs and quality
 * High tier: Highest quality carbs (quinoa, sweet potato)
 */
function selectCarbSource(
  availableFoods: FoodItem[],
  costTier: CostTier,
  excludedFoods: string[] = [],
  varietyTracker?: VarietyTracker,
  rotationEngine?: RotationEngine
): FoodItem | null {
  let carbFoods = filterExcludedFoods(availableFoods, excludedFoods)
    .filter(f => 
      (f.category === CATEGORIES.grains || f.category === CATEGORIES.vegetables) &&
      f.macros && 
      f.macros.carbs > 15 && // At least 15g carbs per 100g
      f.macros.carbs > f.macros.protein && // More carbs than protein
      !f.name.toLowerCase().includes("oat") // Exclude oats (breakfast only)
    );
  
  // PASSO 24: Filter by cost tier
  carbFoods = filterByCostTier(carbFoods, costTier);
  
  if (carbFoods.length === 0) return null;
  
  // PASSO 26 & 31: Sort by cost/quality with variety bonus and repetition penalty
  let sorted: FoodItem[];
  if (costTier === "low") {
    // Maximize carbs per euro with variety consideration
    sorted = carbFoods.sort((a, b) => 
      calculateFoodScore(b, costTier, varietyTracker, false, rotationEngine) - 
      calculateFoodScore(a, costTier, varietyTracker, false, rotationEngine)
    );
  } else if (costTier === "high") {
    // Prefer quinoa, sweet potato with variety consideration
    if (varietyTracker) {
      const premium = carbFoods.filter(f => 
        f.name.toLowerCase().includes("quinoa") || 
        f.name.toLowerCase().includes("sweet potato")
      ).sort((a, b) => 
        varietyTracker.getFoodUsageCount(a.name) - varietyTracker.getFoodUsageCount(b.name)
      )[0];
      if (premium) return premium;
    }
    sorted = carbFoods.sort((a, b) => 
      (b.macros?.carbs || 0) - (a.macros?.carbs || 0)
    );
  } else {
    // Medium: Balance with variety consideration
    sorted = carbFoods.sort((a, b) => {
      const scoreA = calculateFoodScore(a, costTier, varietyTracker, false, rotationEngine);
      const scoreB = calculateFoodScore(b, costTier, varietyTracker, false, rotationEngine);
      return scoreB - scoreA;
    });
  }
  
  // Take top 3 candidates and prioritize by user preference
  const topCandidates = sorted.slice(0, 3);
  return sortByPreference(topCandidates)[0];
}

/**
 * Select vegetable (fixed 150g for fiber/micronutrients)
 * 
 * PASSO 23: Prioritizes variety - tries to use vegetables not yet used
 * PASSO 24: Filters by cost tier availability
 */
function selectVegetable(
  availableFoods: FoodItem[],
  costTier: CostTier,
  excludedFoods: string[] = [],
  varietyTracker?: VarietyTracker
): FoodItem | null {
  let vegetables = filterExcludedFoods(availableFoods, excludedFoods)
    .filter(f => 
      f.category === CATEGORIES.vegetables &&
      f.macros &&
      f.macros.carbs < 15 // Low-carb vegetables (broccoli, spinach, not sweet potato)
    );
  
  // PASSO 24: Filter by cost tier
  vegetables = filterByCostTier(vegetables, costTier);
  
  if (vegetables.length === 0) return null;
  
  // PASSO 23: Try to use a new vegetable first (for variety)
  if (varietyTracker) {
    const unusedVegetable = varietyTracker.suggestAlternativeVegetable(vegetables, excludedFoods);
    if (unusedVegetable) return unusedVegetable;
  }
  
  // PASSO 26: Prioritize by user preference among available vegetables
  const sortedByPreference = sortByPreference(vegetables);
  
  // Prefer broccoli, spinach (nutrient-dense) if no strong preference
  const topPreferred = sortedByPreference[0];
  const preferenceScore = userPreferencesStore.getPreferenceScore(topPreferred.name);
  
  // If top preference has positive score, use it
  if (preferenceScore > 0) return topPreferred;
  
  // Otherwise, fall back to nutritionist-recommended vegetables
  const preferred = vegetables.find(f => 
    f.name.toLowerCase().includes("broccoli") || 
    f.name.toLowerCase().includes("spinach")
  );
  
  return preferred || topPreferred;
}

/**
 * Select fat source (oil, nuts, etc.)
 * 
 * PASSO 24: Filters by cost tier availability
 */
function selectFatSource(
  availableFoods: FoodItem[],
  costTier: CostTier,
  excludedFoods: string[] = []
): FoodItem | null {
  let fatFoods = filterExcludedFoods(availableFoods, excludedFoods)
    .filter(f => 
      f.category === CATEGORIES.fats && 
      f.macros && 
      f.macros.fat > 50
    );
  
  // PASSO 24: Filter by cost tier
  fatFoods = filterByCostTier(fatFoods, costTier);
  
  if (fatFoods.length === 0) return null;
  
  // PASSO 26: Prioritize by user preference
  const sortedByPreference = sortByPreference(fatFoods);
  
  // Prefer olive oil (heart-healthy) if no strong preference
  const topPreferred = sortedByPreference[0];
  const preferenceScore = userPreferencesStore.getPreferenceScore(topPreferred.name);
  
  // If top preference has positive score, use it
  if (preferenceScore > 0) return topPreferred;
  
  // Otherwise, fall back to nutritionist-recommended oil
  const preferred = fatFoods.find(f => 
    f.name.toLowerCase().includes("olive")
  );
  
  return preferred || topPreferred;
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
 * PASSO 23: Records variety usage and enforces constraints
 * PASSO 24: Filters foods by cost tier availability
 * 
 * @param input - Meal builder configuration
 * @returns Built meal with ingredients and macros
 * 
 * Example:
 * Input: 40g protein, 50g carbs, 15g fats, low tier
 * Output: Chicken + Rice + Broccoli (130g chicken, 179g rice, 150g broccoli)
 */
export function buildMeal(input: MealBuilderInput): BuiltMeal {
  const { macroTargetsPerMeal, availableFoods, excludedFoods = [], costTier, varietyTracker, rotationEngine } = input;
  
  // 1. Select food sources (with variety and cost tier constraints)
  const proteinSource = selectProteinSource(availableFoods, costTier, excludedFoods, varietyTracker, rotationEngine);
  const carbSource = selectCarbSource(availableFoods, costTier, excludedFoods, varietyTracker, rotationEngine);
  const vegetable = selectVegetable(availableFoods, costTier, excludedFoods, varietyTracker);
  const fatSource = selectFatSource(availableFoods, costTier, excludedFoods);
  
  // 2. Validate we have at least protein and carbs
  if (!proteinSource || !carbSource) {
    throw new Error(
      `Cannot build meal: Missing ${!proteinSource ? "protein source" : "carb source"}`
    );
  }
  
  // 3. Record variety usage (PASSO 23) + PASSO 31 food usage tracking
  if (varietyTracker) {
    varietyTracker.recordProteinSource(proteinSource);
    varietyTracker.recordFoodUsage(proteinSource.name);
    varietyTracker.recordFoodUsage(carbSource.name);
    
    if (vegetable) {
      varietyTracker.recordVegetable(vegetable);
      varietyTracker.recordFoodUsage(vegetable.name);
    }
    
    if (fatSource) {
      varietyTracker.recordFoodUsage(fatSource.name);
    }
  }
  
  // 4. Calculate portions using PortionCalculator
  const portions = calculateMealPortions(
    macroTargetsPerMeal,
    proteinSource,
    carbSource,
    fatSource,
    vegetable
  );
  
  // 5. Convert to MealIngredient format
  const ingredients: MealIngredient[] = portions.map(portion => ({
    foodId: portion.foodId,
    foodName: portion.foodName,
    grams: portion.gramsNeeded
  }));
  
  // 6. Calculate total macros
  const totalMacros = calculateTotalMacros(portions);
  
  // 7. Generate meal name
  const name = generateMealName(proteinSource, carbSource, vegetable);
  
  // 8. Record meal name usage (PASSO 23)
  if (varietyTracker) {
    varietyTracker.recordMealName(name);
  }
  
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
 * 
 * PASSO 24: Filters breakfast foods by cost tier
 */
export function buildBreakfast(input: MealBuilderInput): BuiltMeal {
  const { availableFoods, excludedFoods = [], costTier } = input;
  
  // PASSO 24: Filter by cost tier first
  const tierFoods = filterByCostTier(availableFoods, costTier);
  
  // Breakfast strategy: Oats + Dairy + Fruit
  const oats = filterExcludedFoods(tierFoods, excludedFoods)
    .find(f => f.name.toLowerCase().includes("oat"));
  
  const dairy = filterExcludedFoods(tierFoods, excludedFoods)
    .find(f => 
      f.category === CATEGORIES.dairy && 
      f.macros && 
      f.macros.protein > 5
    );
  
  const fruit = filterExcludedFoods(tierFoods, excludedFoods)
    .find(f => f.category === CATEGORIES.fruits);
  
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
