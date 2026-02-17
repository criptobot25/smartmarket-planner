import { CATEGORIES } from "../core/constants/categories";
/**
 * STABILIZATION: Central Enums - Single Source of Truth
 * 
 * All enums used across the SmartMarket Planner application
 */

// Fitness Goals
export type FitnessGoal = 
  | "bulking"      // Muscle gain (caloric surplus)
  | "cutting"      // Fat loss (caloric deficit)
  | "maintenance"; // Maintain current weight

// Cost Tiers
export type CostTier = 
  | "low"          // Budget-friendly options
  | "medium"       // Balanced quality/cost
  | "high";        // Premium ingredients

// Food Categories
/* eslint-disable no-restricted-syntax -- Type definition requires literal values */
export type FoodCategory = 
  | "protein"      // Chicken, fish, eggs, etc.
  | "carbs"        // Rice, pasta, oats, etc.
  | "vegetables"   // Broccoli, spinach, etc.
  | "fruits"       // Banana, apple, etc.
  | "dairy"        // Milk, yogurt, cheese
  | "fats"         // Olive oil, nuts, avocado
  | "grains"       // Oats, quinoa, bread
  | "legumes"      // Beans, lentils, chickpeas
  | "snacks"       // Protein bars, etc.
  | "supplements"  // Whey protein, creatine
  | "others";      // Miscellaneous
/* eslint-enable no-restricted-syntax */

// Meal Types
export type MealType = 
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack";

// Unit Types (standardized)
export type UnitType = 
  | "kg"
  | "L"
  | "can"
  | "pack"
  | "jar"
  | "bottle"
  | "loaf"
  | "serving";

// Dietary Restrictions
export type DietaryRestriction = 
  | "vegetarian"
  | "vegan"
  | "gluten-free"
  | "lactose-free"
  | "nut-free";

// Savings Status
export type SavingsStatus = 
  | "within_savings"        // Under budget target
  | "over_savings_minimum"  // Over budget, at minimum cost
  | "over_savings_target";  // Over budget, can optimize

// Subscription Plans
export type SubscriptionPlan = "free" | "premium";

// Subscription Status
export type SubscriptionStatus = 
  | "active" 
  | "canceled" 
  | "past_due" 
  | "trialing" 
  | "incomplete" 
  | "inactive";

// Helper functions to validate enums
export function isValidFitnessGoal(value: string): value is FitnessGoal {
  return ["bulking", "cutting", "maintenance"].includes(value);
}

export function isValidCostTier(value: string): value is CostTier {
  return ["low", "medium", "high"].includes(value);
}

export function isValidFoodCategory(value: string): value is FoodCategory {
  return [CATEGORIES.protein, CATEGORIES.carbs, CATEGORIES.vegetables, CATEGORIES.fruits, CATEGORIES.dairy, CATEGORIES.fats, CATEGORIES.grains, CATEGORIES.legumes, CATEGORIES.snacks, CATEGORIES.supplements, CATEGORIES.others].includes(value as FoodCategory);
}

export function isValidMealType(value: string): value is MealType {
  return ["breakfast", "lunch", "dinner", "snack"].includes(value);
}

export function isValidSavingsStatus(value: string): value is SavingsStatus {
  return ["within_savings", "over_savings_minimum", "over_savings_target"].includes(value);
}
