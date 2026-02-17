/**
 * PASSO 34: Safe Fallback Utilities
 * 
 * Provides safe defaults for all potentially missing or invalid data.
 * Prevents crashes from unexpected values in production.
 * 
 * Design Philosophy:
 * - Never crash - always return a valid value
 * - Log warnings for debugging
 * - Use sensible defaults that won't break UX
 */

import { FoodCategory } from "../models/FoodItem";
import { CATEGORIES } from "../constants/categories";

/**
 * Safe category fallback
 * Returns "others" for unknown categories
 */
export function getSafeCategory(category: unknown): FoodCategory {
  const validCategories: FoodCategory[] = [
    CATEGORIES.vegetables,
    CATEGORIES.fruits, 
    CATEGORIES.protein,
    CATEGORIES.grains,
    CATEGORIES.dairy,
    CATEGORIES.fats,
    CATEGORIES.others,
    CATEGORIES.others,
    CATEGORIES.others
  ];
  
  if (typeof category === "string" && validCategories.includes(category as FoodCategory)) {
    return category as FoodCategory;
  }
  
  console.warn(`Unknown category "${category}", using fallback "others"`);
  return CATEGORIES.others;
}

/**
 * Safe emoji fallback
 * Returns default 🛒 for unknown categories
 */
export function getSafeEmoji(category: FoodCategory): string {
  const categoryEmojis: Record<FoodCategory, string> = {
    vegetables: "🥬",
    fruits: "🍎",
    protein: "🍗",
    carbs: "🍞",
    grains: "🌾",
    legumes: "🫘",
    dairy: "🥛",
    fats: "🫒",
    snacks: "🍿",
    supplements: "💊",
    others: "📦"
  };
  
  const emoji = categoryEmojis[category];
  
  if (!emoji) {
    console.warn(`No emoji for category "${category}", using default 🛒`);
    return "🛒";
  }
  
  return emoji;
}

/**
 * Safe number fallback
 * Returns default value if number is invalid
 */
export function getSafeNumber(value: unknown, defaultValue: number, min?: number, max?: number): number {
  const num = typeof value === "number" ? value : Number(value);
  
  // Check if valid number
  if (isNaN(num) || !isFinite(num)) {
    console.warn(`Invalid number "${value}", using default ${defaultValue}`);
    return defaultValue;
  }
  
  // Check min/max bounds
  if (min !== undefined && num < min) {
    console.warn(`Number ${num} below minimum ${min}, clamping`);
    return min;
  }
  
  if (max !== undefined && num > max) {
    console.warn(`Number ${num} above maximum ${max}, clamping`);
    return max;
  }
  
  return num;
}

/**
 * Safe string fallback
 * Returns default if string is empty or invalid
 */
export function getSafeString(value: unknown, defaultValue: string): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  
  console.warn(`Invalid string "${value}", using default "${defaultValue}"`);
  return defaultValue;
}

/**
 * Safe array fallback
 * Returns empty array if invalid
 */
export function getSafeArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  
  console.warn(`Invalid array "${value}", using empty array`);
  return [];
}

/**
 * Safe boolean fallback
 * Returns default if boolean is invalid
 */
export function getSafeBoolean(value: unknown, defaultValue: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  
  // Handle string "true"/"false"
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower === "true") return true;
    if (lower === "false") return false;
  }
  
  console.warn(`Invalid boolean "${value}", using default ${defaultValue}`);
  return defaultValue;
}

/**
 * Safe macros fallback
 * Excludes items with missing or invalid macros
 */
export interface SafeMacros {
  protein: number;
  carbs: number;
  fats: number;
}

export function getSafeMacros(
  protein: unknown,
  carbs: unknown,
  fats: unknown
): SafeMacros | null {
  const safeProtein = getSafeNumber(protein, 0, 0, 100);
  const safeCarbs = getSafeNumber(carbs, 0, 0, 100);
  const safeFats = getSafeNumber(fats, 0, 0, 100);
  
  // If all macros are 0, it's likely invalid data - exclude item
  if (safeProtein === 0 && safeCarbs === 0 && safeFats === 0) {
    console.warn(`All macros are 0 - excluding item from plan`);
    return null;
  }
  
  return {
    protein: safeProtein,
    carbs: safeCarbs,
    fats: safeFats
  };
}

/**
 * Safe food name fallback
 * Returns placeholder if name is invalid
 */
export function getSafeFoodName(name: unknown): string {
  return getSafeString(name, "Unknown Food");
}

/**
 * Safe cost fallback
 * Returns default 0 if cost is invalid (free items)
 */
export function getSafeCost(cost: unknown): number {
  return getSafeNumber(cost, 0, 0, 1000);
}

/**
 * Safe ID fallback
 * Generates a fallback ID if invalid
 */
export function getSafeId(id: unknown, fallbackPrefix: string): string {
  if (typeof id === "string" && id.trim().length > 0) {
    return id.trim();
  }
  
  const fallbackId = `${fallbackPrefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.warn(`Invalid ID "${id}", generated fallback: ${fallbackId}`);
  return fallbackId;
}

/**
 * Safe object property access
 * Returns default if property doesn't exist or is invalid
 */
export function getSafeProperty<T>(
  obj: unknown,
  property: string,
  defaultValue: T
): T {
  if (obj && typeof obj === "object" && property in obj) {
    const value = (obj as Record<string, unknown>)[property];
    if (value !== undefined && value !== null) {
      return value as T;
    }
  }
  
  console.warn(`Property "${property}" not found or invalid, using default`);
  return defaultValue;
}
