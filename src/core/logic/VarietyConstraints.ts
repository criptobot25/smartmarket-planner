/**
 * VarietyConstraints.ts
 * Real diet adherence constraints to prevent repetitive diets
 * 
 * Rules based on nutritional guidelines:
 * - Protein variety prevents micronutrient gaps (ISSN Position Stand)
 * - Vegetable variety ensures diverse phytonutrients (CDC Dietary Guidelines)
 * - Meal repetition limits prevent diet fatigue (Adherence studies)
 * - Fish/red meat limits balance omega-3s and saturated fat
 * 
 * References:
 * - ISSN Position Stand: Nutrient timing (protein variety)
 * - CDC: Dietary Guidelines (vegetable diversity)
 * - Diet adherence: Monotony and dropout rates (JAMA 2018)
 */

import { FoodItem } from "../models/FoodItem";

/**
 * Variety constraints for diet adherence
 */
export interface VarietyConstraints {
  // Minimum variety requirements
  minUniqueProteins: number;      // At least 3 different protein sources/week
  minUniqueVegetables: number;    // At least 5 different vegetables/week
  
  // Repetition limits
  maxSameMealPerWeek: number;     // Same meal max 4 times/week
  maxFishMealsPerWeek: number;    // Fish max 2 meals/week
  maxRedMeatMealsPerWeek: number; // Red meat max 2 meals/week
}

/**
 * Default variety constraints (evidence-based)
 */
export const DEFAULT_VARIETY_CONSTRAINTS: VarietyConstraints = {
  minUniqueProteins: 3,           // Prevent protein monotony
  minUniqueVegetables: 5,         // Ensure phytonutrient diversity
  maxSameMealPerWeek: 4,          // Prevent diet fatigue (out of 7 days)
  maxFishMealsPerWeek: 2,         // Balance omega-3 intake (AHA guidelines)
  maxRedMeatMealsPerWeek: 2       // Limit saturated fat (WHO guidelines)
};

/**
 * Tracker for variety constraints during weekly plan generation
 */
export class VarietyTracker {
  private proteinSourcesUsed: Set<string> = new Set();
  private vegetablesUsed: Set<string> = new Set();
  private mealNamesUsed: Map<string, number> = new Map();
  private fishMealsCount: number = 0;
  private redMeatMealsCount: number = 0;
  // PASSO 31: Track food usage for variety scoring
  private foodUsageCount: Map<string, number> = new Map();
  
  constructor(private constraints: VarietyConstraints = DEFAULT_VARIETY_CONSTRAINTS) {}
  
  /**
   * Check if a protein source can be used (not exceeding limits)
   */
  canUseProteinSource(food: FoodItem): boolean {
    // Check fish limit
    if (this.isFish(food) && this.fishMealsCount >= this.constraints.maxFishMealsPerWeek) {
      return false;
    }
    
    // Check red meat limit
    if (this.isRedMeat(food) && this.redMeatMealsCount >= this.constraints.maxRedMeatMealsPerWeek) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Check if a meal name can be used (not exceeding repetition limit)
   */
  canUseMealName(mealName: string): boolean {
    const currentCount = this.mealNamesUsed.get(mealName) || 0;
    return currentCount < this.constraints.maxSameMealPerWeek;
  }
  
  /**
   * Record usage of a protein source
   */
  recordProteinSource(food: FoodItem): void {
    this.proteinSourcesUsed.add(food.name);
    
    if (this.isFish(food)) {
      this.fishMealsCount++;
    }
    
    if (this.isRedMeat(food)) {
      this.redMeatMealsCount++;
    }
  }
  
  /**
   * Record usage of a vegetable
   */
  recordVegetable(food: FoodItem): void {
    this.vegetablesUsed.add(food.name);
  }
  
  /**
   * Record usage of a meal name
   */
  recordMealName(mealName: string): void {
    const currentCount = this.mealNamesUsed.get(mealName) || 0;
    this.mealNamesUsed.set(mealName, currentCount + 1);
  }
  
  /**
   * PASSO 31: Record usage of a food item for variety tracking
   */
  recordFoodUsage(foodName: string): void {
    const currentCount = this.foodUsageCount.get(foodName) || 0;
    this.foodUsageCount.set(foodName, currentCount + 1);
  }
  
  /**
   * PASSO 31: Get usage count for a food item
   */
  getFoodUsageCount(foodName: string): number {
    return this.foodUsageCount.get(foodName) || 0;
  }
  
  /**
   * Get current variety stats
   */
  getVarietyStats() {
    return {
      uniqueProteins: this.proteinSourcesUsed.size,
      uniqueVegetables: this.vegetablesUsed.size,
      fishMeals: this.fishMealsCount,
      redMeatMeals: this.redMeatMealsCount,
      mealRepetitions: Array.from(this.mealNamesUsed.entries()).map(([name, count]) => ({
        meal: name,
        count
      }))
    };
  }
  
  /**
   * Check if all minimum variety requirements are met
   */
  meetsMinimumVariety(): boolean {
    return (
      this.proteinSourcesUsed.size >= this.constraints.minUniqueProteins &&
      this.vegetablesUsed.size >= this.constraints.minUniqueVegetables
    );
  }
  
  /**
   * Get variety violations (for debugging/reporting)
   */
  getViolations(): string[] {
    const violations: string[] = [];
    
    if (this.proteinSourcesUsed.size < this.constraints.minUniqueProteins) {
      violations.push(
        `Only ${this.proteinSourcesUsed.size} protein sources (minimum: ${this.constraints.minUniqueProteins})`
      );
    }
    
    if (this.vegetablesUsed.size < this.constraints.minUniqueVegetables) {
      violations.push(
        `Only ${this.vegetablesUsed.size} vegetables (minimum: ${this.constraints.minUniqueVegetables})`
      );
    }
    
    // Check meal repetition
    this.mealNamesUsed.forEach((count, mealName) => {
      if (count > this.constraints.maxSameMealPerWeek) {
        violations.push(
          `Meal "${mealName}" repeated ${count} times (max: ${this.constraints.maxSameMealPerWeek})`
        );
      }
    });
    
    if (this.fishMealsCount > this.constraints.maxFishMealsPerWeek) {
      violations.push(
        `Fish meals: ${this.fishMealsCount} (max: ${this.constraints.maxFishMealsPerWeek})`
      );
    }
    
    if (this.redMeatMealsCount > this.constraints.maxRedMeatMealsPerWeek) {
      violations.push(
        `Red meat meals: ${this.redMeatMealsCount} (max: ${this.constraints.maxRedMeatMealsPerWeek})`
      );
    }
    
    return violations;
  }
  
  /**
   * Check if food is fish
   */
  private isFish(food: FoodItem): boolean {
    const fishKeywords = ["salmon", "tuna", "cod", "tilapia", "trout", "mackerel", "sardine"];
    const nameLower = food.name.toLowerCase();
    return fishKeywords.some(keyword => nameLower.includes(keyword));
  }
  
  /**
   * Check if food is red meat
   */
  private isRedMeat(food: FoodItem): boolean {
    const redMeatKeywords = ["beef", "pork", "lamb", "veal", "ground beef"];
    const nameLower = food.name.toLowerCase();
    return redMeatKeywords.some(keyword => nameLower.includes(keyword));
  }
  
  /**
   * Suggest alternative protein source (for variety)
   */
  suggestAlternativeProtein(availableFoods: FoodItem[], excludedNames: string[] = []): FoodItem | null {
    const candidates = availableFoods.filter(f => 
      f.category === "proteins" &&
      f.macros &&
      f.macros.protein > 15 &&
      !this.proteinSourcesUsed.has(f.name) &&
      !excludedNames.includes(f.name) &&
      this.canUseProteinSource(f)
    );
    
    return candidates.length > 0 ? candidates[0] : null;
  }
  
  /**
   * Suggest alternative vegetable (for variety)
   */
  suggestAlternativeVegetable(availableFoods: FoodItem[], excludedNames: string[] = []): FoodItem | null {
    const candidates = availableFoods.filter(f => 
      f.category === "vegetables" &&
      f.macros &&
      f.macros.carbs < 15 &&
      !this.vegetablesUsed.has(f.name) &&
      !excludedNames.includes(f.name)
    );
    
    return candidates.length > 0 ? candidates[0] : null;
  }
}

/**
 * Helper to get list of proteins used (for UI display)
 */
export function getProteinList(tracker: VarietyTracker): string[] {
  return Array.from((tracker as any).proteinSourcesUsed);
}

/**
 * Helper to get list of vegetables used (for UI display)
 */
export function getVegetableList(tracker: VarietyTracker): string[] {
  return Array.from((tracker as any).vegetablesUsed);
}
