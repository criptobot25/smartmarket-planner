/**
 * Food Category Constants
 * 
 * Centralized constants for all food categories.
 * Use CATEGORIES.protein instead of "protein" string literals.
 * 
 * Benefits:
 * - Type safety: TypeScript catches typos at compile time
 * - Refactoring: Change category names in one place
 * - Autocomplete: IDE suggestions for valid categories
 * - No magic strings: Self-documenting code
 */

import { FoodCategory } from "../../types/enums";

/**
 * All valid food categories as constants.
 * Use these instead of string literals throughout the app.
 * 
 * @example
 * // ❌ Bad - string literal
 * if (food.category === "protein") { }
 * 
 * // ✅ Good - use constant
 * if (food.category === CATEGORIES.protein) { }
 */
/* eslint-disable no-restricted-syntax -- This is the source of truth for category constants */
export const CATEGORIES = {
  protein: "protein" as FoodCategory,
  carbs: "carbs" as FoodCategory,
  vegetables: "vegetables" as FoodCategory,
  fruits: "fruits" as FoodCategory,
  dairy: "dairy" as FoodCategory,
  fats: "fats" as FoodCategory,
  grains: "grains" as FoodCategory,
  legumes: "legumes" as FoodCategory,
  snacks: "snacks" as FoodCategory,
  supplements: "supplements" as FoodCategory,
  others: "others" as FoodCategory,
} as const;
/* eslint-enable no-restricted-syntax */

/**
 * Array of all valid categories.
 * Useful for iteration, validation, or dropdowns.
 */
export const ALL_CATEGORIES: ReadonlyArray<FoodCategory> = Object.values(CATEGORIES);

/**
 * Check if a string is a valid food category.
 * 
 * @param value - String to check
 * @returns True if value is a valid FoodCategory
 */
export function isValidCategory(value: unknown): value is FoodCategory {
  if (typeof value !== "string") return false;
  return ALL_CATEGORIES.includes(value as FoodCategory);
}

/**
 * Get category with fallback to "others" if invalid.
 * 
 * @param category - Category to validate
 * @returns Valid category or "others"
 */
export function getCategoryOrDefault(category: unknown): FoodCategory {
  return isValidCategory(category) ? category : CATEGORIES.others;
}

