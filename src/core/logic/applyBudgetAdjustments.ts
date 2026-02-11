/**
 * applyBudgetAdjustments.ts
 * Budget-aware food substitution engine
 * 
 * Purpose: Adjust shopping list to fit user's weekly budget
 * Strategy: Replace expensive items with cheaper equivalents while maintaining nutrition
 * 
 * Source: Price-based meal planning
 * https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5708033/
 */

import { FoodItem } from "../models/FoodItem";

export type BudgetStatus = "within_budget" | "adjusted_to_fit" | "over_budget_minimum";

export interface BudgetAdjustmentResult {
  items: FoodItem[];
  totalEstimatedCost: number;
  budgetStatus: BudgetStatus;
  adjustmentsMade: string[];
}

/**
 * Substitution rules: expensive → cheaper alternative
 * Maintains similar macros and functionality
 */
const SUBSTITUTION_RULES: Record<string, string> = {
  // Proteins: premium → budget
  "Salmon fillet": "Tuna in water",
  "Lean beef": "Chicken breast",
  "Turkey breast": "Chicken breast",
  
  // Carbs: premium → budget
  "Quinoa": "White rice",
  "Sweet potato": "Whole grain pasta",
  
  // Dairy: premium → budget
  "Cottage cheese": "Greek yogurt 0%",
  
  // Oils: premium → budget
  "Olive oil": "Sunflower oil",
};

/**
 * Apply budget adjustments to shopping list
 * Replaces expensive items with cheaper alternatives until budget is met
 */
export function applyBudgetAdjustments(
  items: FoodItem[],
  totalCost: number,
  weeklyBudget: number
): BudgetAdjustmentResult {
  // If already within budget, no adjustments needed
  if (totalCost <= weeklyBudget) {
    console.log(`✅ Plan within budget: €${totalCost.toFixed(2)} / €${weeklyBudget.toFixed(2)}`);
    return {
      items,
      totalEstimatedCost: totalCost,
      budgetStatus: "within_budget",
      adjustmentsMade: [],
    };
  }

  console.log(`⚠️ Plan over budget: €${totalCost.toFixed(2)} > €${weeklyBudget.toFixed(2)}`);
  console.log(`Starting budget adjustments...`);

  // Clone items to avoid mutation
  let adjustedItems = [...items];
  let currentCost = totalCost;
  const adjustmentsMade: string[] = [];

  // Try each substitution until budget is met
  for (const [expensiveItem, cheaperItem] of Object.entries(SUBSTITUTION_RULES)) {
    // Check if we're now within budget
    if (currentCost <= weeklyBudget) {
      break;
    }

    // Find the expensive item in the list
    const itemIndex = adjustedItems.findIndex(item => item.name === expensiveItem);
    
    if (itemIndex === -1) {
      continue; // Item not in current list, skip
    }

    const originalItem = adjustedItems[itemIndex];
    
    // Find the cheaper alternative in the original items list
    const replacementItem = items.find(item => item.name === cheaperItem);
    
    if (!replacementItem) {
      // If replacement not in original list, we need to create it from mockFoods
      // For now, skip this substitution
      continue;
    }

    // Calculate cost savings
    const costSavings = (originalItem.estimatedPrice || 0) - (replacementItem.estimatedPrice || 0);
    
    if (costSavings <= 0) {
      continue; // No savings, skip
    }

    // Create new item with same quantity but different food
    const newItem: FoodItem = {
      ...replacementItem,
      quantity: originalItem.quantity,
      reason: originalItem.reason,
      estimatedPrice: (replacementItem.pricePerUnit || 0) * originalItem.quantity,
    };

    // Replace in list
    adjustedItems[itemIndex] = newItem;
    currentCost -= costSavings;

    const adjustmentMessage = `Replaced ${expensiveItem} with ${cheaperItem} (saved €${costSavings.toFixed(2)})`;
    console.log(`  → ${adjustmentMessage}`);
    adjustmentsMade.push(adjustmentMessage);
  }

  // Determine final status
  let budgetStatus: BudgetStatus;
  if (currentCost <= weeklyBudget) {
    budgetStatus = "adjusted_to_fit";
    console.log(`✅ Adjusted plan to fit budget: €${currentCost.toFixed(2)} / €${weeklyBudget.toFixed(2)}`);
  } else {
    budgetStatus = "over_budget_minimum";
    console.log(`⚠️ Unable to fit budget even with all substitutions: €${currentCost.toFixed(2)} > €${weeklyBudget.toFixed(2)}`);
    console.log(`This is the minimum cost possible with current meal plan.`);
  }

  return {
    items: adjustedItems,
    totalEstimatedCost: currentCost,
    budgetStatus,
    adjustmentsMade,
  };
}

/**
 * Calculate potential savings if user upgrades budget
 * Used for Premium upsell messaging
 */
export function calculatePotentialSavings(
  currentBudget: number,
  minimumCost: number
): number {
  return Math.max(0, currentBudget - minimumCost);
}

/**
 * Get substitution suggestions for a specific item
 * Used for UI to show "Switch to [X] to save €Y"
 */
export function getSubstitutionSuggestion(itemName: string): string | null {
  return SUBSTITUTION_RULES[itemName] || null;
}
