/**
 * PASSO 35: Grocery Unit Normalization
 * 
 * Converts quantities to real-world supermarket units.
 * 
 * Examples:
 * - 1200g yogurt → "5 tubs (200g each)"
 * - 0.3kg tomatoes → "2 tomatoes"
 * - 1000ml milk → "1 bottle"
 * - 360g tuna → "3 cans"
 * 
 * Purpose: Make shopping list feel native to supermarket shopping
 */

import { FoodItem } from "../models/FoodItem";

/**
 * Unit types for display
 */
export type DisplayUnit = 
  | "kg"
  | "g"
  | "L"
  | "ml"
  | "units"
  | "tubs"
  | "bottles"
  | "cans"
  | "packs"
  | "bunches"
  | "heads"
  | "cloves";

/**
 * Normalized quantity result
 */
export interface NormalizedQuantity {
  value: number;
  unit: DisplayUnit;
  displayText: string; // e.g., "2 tomatoes", "5 tubs (200g each)"
  originalValue: number;
  originalUnit: string;
}

/**
 * Unit conversion rules per food type
 * Maps food names to their natural packaging/counting units
 */
const UNIT_CONVERSION_RULES: Record<string, {
  packageSize: number; // in grams or ml
  packageUnit: DisplayUnit;
  countable?: boolean; // if true, show as discrete units
}> = {
  // Dairy
  "Yogurt (plain)": { packageSize: 200, packageUnit: "tubs" },
  "Greek yogurt": { packageSize: 200, packageUnit: "tubs" },
  "Milk (whole)": { packageSize: 1000, packageUnit: "bottles" },
  "Milk (skim)": { packageSize: 1000, packageUnit: "bottles" },
  
  // Proteins - Canned
  "Tuna (canned)": { packageSize: 120, packageUnit: "cans" },
  "Sardines (canned)": { packageSize: 120, packageUnit: "cans" },
  
  // Oils
  "Olive oil": { packageSize: 500, packageUnit: "bottles" },
  "Coconut oil": { packageSize: 400, packageUnit: "bottles" },
  
  // Vegetables - Countable
  "Tomatoes": { packageSize: 150, packageUnit: "units", countable: true },
  "Bell peppers": { packageSize: 200, packageUnit: "units", countable: true },
  "Onions": { packageSize: 150, packageUnit: "units", countable: true },
  "Garlic": { packageSize: 50, packageUnit: "heads", countable: true },
  "Broccoli": { packageSize: 300, packageUnit: "heads", countable: true },
  "Cauliflower": { packageSize: 500, packageUnit: "heads", countable: true },
  "Lettuce": { packageSize: 300, packageUnit: "heads", countable: true },
  
  // Vegetables - Bunched
  "Spinach (fresh)": { packageSize: 200, packageUnit: "bunches" },
  "Kale": { packageSize: 200, packageUnit: "bunches" },
  "Parsley": { packageSize: 50, packageUnit: "bunches" },
  "Cilantro": { packageSize: 50, packageUnit: "bunches" },
  
  // Vegetables - Packaged
  "Mushrooms": { packageSize: 250, packageUnit: "packs" },
  
  // Fruits - Countable
  "Bananas": { packageSize: 120, packageUnit: "units", countable: true },
  "Apples": { packageSize: 180, packageUnit: "units", countable: true },
  "Oranges": { packageSize: 150, packageUnit: "units", countable: true },
  "Lemons": { packageSize: 100, packageUnit: "units", countable: true },
  "Avocados": { packageSize: 150, packageUnit: "units", countable: true },
};

/**
 * Normalize quantity to real-world units
 */
export function normalizeQuantity(
  foodName: string,
  quantity: number,
  unit: string
): NormalizedQuantity {
  // Store original values
  const originalValue = quantity;
  const originalUnit = unit;
  
  // Convert to base unit (grams or ml)
  let quantityInGrams = quantity;
  if (unit === "kg") {
    quantityInGrams = quantity * 1000;
  } else if (unit === "L") {
    quantityInGrams = quantity * 1000; // treat liters as ml for conversion
  }
  
  // Check if we have a conversion rule for this food
  const rule = UNIT_CONVERSION_RULES[foodName];
  
  if (rule) {
    const packageCount = Math.ceil(quantityInGrams / rule.packageSize);
    
    if (rule.countable) {
      // Countable items: show as discrete units
      const unitName = getUnitName(rule.packageUnit, packageCount);
      return {
        value: packageCount,
        unit: rule.packageUnit,
        displayText: `${packageCount} ${unitName}`,
        originalValue,
        originalUnit
      };
    } else {
      // Packaged items: show with package size
      const unitName = getUnitName(rule.packageUnit, packageCount);
      const packageSizeText = rule.packageSize >= 1000 
        ? `${rule.packageSize / 1000}L` 
        : `${rule.packageSize}g`;
      
      return {
        value: packageCount,
        unit: rule.packageUnit,
        displayText: `${packageCount} ${unitName} (${packageSizeText} each)`,
        originalValue,
        originalUnit
      };
    }
  }
  
  // No conversion rule - use smart defaults
  return normalizeDefaultUnit(foodName, quantityInGrams, originalValue, originalUnit);
}

/**
 * Get proper unit name (singular/plural)
 */
function getUnitName(unit: DisplayUnit, count: number): string {
  const singularForms: Record<DisplayUnit, string> = {
    "kg": "kg",
    "g": "g",
    "L": "L",
    "ml": "ml",
    "units": "unit",
    "tubs": "tub",
    "bottles": "bottle",
    "cans": "can",
    "packs": "pack",
    "bunches": "bunch",
    "heads": "head",
    "cloves": "clove"
  };
  
  const pluralForms: Record<DisplayUnit, string> = {
    "kg": "kg",
    "g": "g",
    "L": "L",
    "ml": "ml",
    "units": "units",
    "tubs": "tubs",
    "bottles": "bottles",
    "cans": "cans",
    "packs": "packs",
    "bunches": "bunches",
    "heads": "heads",
    "cloves": "cloves"
  };
  
  return count === 1 ? singularForms[unit] : pluralForms[unit];
}

/**
 * Normalize to default units when no specific rule exists
 */
function normalizeDefaultUnit(
  foodName: string,
  quantityInGrams: number,
  originalValue: number,
  originalUnit: string
): NormalizedQuantity {
  // For liquids (milk, oil, etc.) - use liters/ml
  const liquidKeywords = ["milk", "oil", "juice", "water", "broth", "stock"];
  const isLiquid = liquidKeywords.some(keyword => 
    foodName.toLowerCase().includes(keyword)
  );
  
  if (isLiquid) {
    if (quantityInGrams >= 1000) {
      const liters = quantityInGrams / 1000;
      return {
        value: parseFloat(liters.toFixed(2)),
        unit: "L",
        displayText: `${liters.toFixed(2)}L`,
        originalValue,
        originalUnit
      };
    } else {
      return {
        value: Math.round(quantityInGrams),
        unit: "ml",
        displayText: `${Math.round(quantityInGrams)}ml`,
        originalValue,
        originalUnit
      };
    }
  }
  
  // For solids - use kg/g
  if (quantityInGrams >= 1000) {
    const kg = quantityInGrams / 1000;
    return {
      value: parseFloat(kg.toFixed(2)),
      unit: "kg",
      displayText: `${kg.toFixed(2)}kg`,
      originalValue,
      originalUnit
    };
  } else {
    return {
      value: Math.round(quantityInGrams),
      unit: "g",
      displayText: `${Math.round(quantityInGrams)}g`,
      originalValue,
      originalUnit
    };
  }
}

/**
 * Normalize a FoodItem for display in shopping list
 */
export function normalizeFoodItem(item: FoodItem): FoodItem & { normalizedQuantity: NormalizedQuantity } {
  const normalized = normalizeQuantity(item.name, item.quantity, item.unit);
  
  return {
    ...item,
    normalizedQuantity: normalized
  };
}

/**
 * Normalize entire shopping list
 */
export function normalizeShoppingList(items: FoodItem[]): Array<FoodItem & { normalizedQuantity: NormalizedQuantity }> {
  return items.map(item => normalizeFoodItem(item));
}

/**
 * Get all foods that support unit conversion
 */
export function getSupportedConversions(): string[] {
  return Object.keys(UNIT_CONVERSION_RULES);
}

/**
 * Check if a food supports unit conversion
 */
export function supportsConversion(foodName: string): boolean {
  return foodName in UNIT_CONVERSION_RULES;
}
