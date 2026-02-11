/**
 * formatQuantity.ts
 * Humanizes shopping quantities to match real store packaging
 * 
 * Purpose: Transform algorithm outputs into user-friendly shopping list format
 * Example: "2.8kg" → "2.8kg (~3 packs)" or "0.56kg" → "1 bag (1kg)"
 * 
 * Source: NN/g Number Formatting
 * https://www.nngroup.com/articles/formatting-numbers/
 */

export type QuantityUnit = "kg" | "unit" | "pack" | "can";

interface PackageSize {
  [key: string]: number; // item name → package size in kg or units
}

// Real package sizes based on European grocery stores
const PACKAGE_SIZES: PackageSize = {
  // Proteins
  "Chicken breast": 1.0,
  "Ground beef": 0.5,
  "Salmon fillet": 0.4,
  "Turkey breast": 1.0,
  "Pork chops": 0.6,
  
  // Carbs (bags)
  "White rice": 1.0,
  "Brown rice": 1.0,
  "Oats": 1.0,
  "Whole grain pasta": 0.5,
  "Quinoa": 0.5,
  "Sweet potato": 1.0,
  
  // Dairy (tubs/containers)
  "Greek yogurt 0%": 0.5,
  "Cottage cheese": 0.25,
  "Low-fat milk": 1.0,
};

/**
 * Format quantity for display in shopping list
 * Rounds to realistic package sizes while showing actual amount needed
 */
export function formatQuantity(
  itemName: string,
  quantity: number,
  unit: QuantityUnit
): string {
  // Eggs: always show full packs (12 eggs per pack)
  if (itemName === "Eggs") {
    const packs = Math.ceil(quantity); // Round up to full pack
    return `${packs} pack${packs > 1 ? 's' : ''} (12 eggs)`;
  }

  // Canned items: round to whole cans
  if (itemName === "Tuna in water" || itemName.toLowerCase().includes("tuna")) {
    const cans = Math.ceil(quantity);
    return `${cans} can${cans > 1 ? 's' : ''}`;
  }

  // For kg items, check if we have package size info
  if (unit === "kg") {
    const packageSize = PACKAGE_SIZES[itemName];
    
    if (packageSize) {
      // Calculate number of packages needed
      const numPackages = Math.ceil(quantity / packageSize);
      
      // For small quantities (< 2 packages), show simplified format
      if (numPackages === 1) {
        return `1 bag (${packageSize}kg)`;
      }
      
      // For larger quantities, show both exact and approximate packages
      if (quantity >= 1.0) {
        // Proteins: show "2.8kg (~3 packs)"
        if (["Chicken breast", "Ground beef", "Salmon fillet", "Turkey breast", "Pork chops"].includes(itemName)) {
          return `${quantity.toFixed(2)}kg (~${numPackages} pack${numPackages > 1 ? 's' : ''})`;
        }
        
        // Carbs/Pasta: show "1 bag (1kg)" or multiple bags
        if (["White rice", "Brown rice", "Oats", "Whole grain pasta", "Quinoa"].includes(itemName)) {
          if (numPackages === 1) {
            return `1 bag (${packageSize}kg)`;
          }
          return `${numPackages} bags (~${(numPackages * packageSize).toFixed(1)}kg)`;
        }
        
        // Yogurt/Dairy: show tubs
        if (["Greek yogurt 0%", "Cottage cheese"].includes(itemName)) {
          const tubs = Math.ceil(quantity / packageSize);
          return `${tubs} tub${tubs > 1 ? 's' : ''} (~${quantity.toFixed(1)}kg)`;
        }
      }
    }
    
    // Default: show kg with 2 decimals
    return `${quantity.toFixed(2)}kg`;
  }

  // For units/packs/cans without special handling
  if (unit === "unit" || unit === "pack") {
    const rounded = Math.ceil(quantity);
    return `${rounded} ${unit}${rounded > 1 ? 's' : ''}`;
  }

  // Fallback
  return `${quantity.toFixed(2)} ${unit}`;
}

/**
 * Get actual quantity needed for calculation (strips formatting)
 * Used when you need the raw number for price calculations
 */
export function getActualQuantity(
  itemName: string,
  quantity: number,
  unit: QuantityUnit
): number {
  // Eggs: convert packs to actual pack count
  if (itemName === "Eggs") {
    return Math.ceil(quantity);
  }

  // Tuna: round to whole cans
  if (itemName === "Tuna in water" || itemName.toLowerCase().includes("tuna")) {
    return Math.ceil(quantity);
  }

  // For kg items with package sizes, round up to full packages
  if (unit === "kg") {
    const packageSize = PACKAGE_SIZES[itemName];
    if (packageSize) {
      const numPackages = Math.ceil(quantity / packageSize);
      return numPackages * packageSize;
    }
  }

  return quantity;
}
