/**
 * SmartSavingsOptimizer.ts
 * Intelligent savings adjustment system using protein-per-cost optimization
 * 
 * Algorithm:
 * 1. Calculate proteinPerCost for each item (macros.protein / estimatedPrice)
 * 2. Identify low-efficiency items (below threshold)
 * 3. Replace using substitutionGraph with better alternatives
 * 4. Iterate until totalCost <= savings target or no more substitutions available
 * 5. Return optimized list + savingsStatus + substitutionsApplied
 * 
 * References:
 * - Price-based meal planning: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5708033/
 * - Nutrient density scores: https://www.fao.org/3/i3261e/i3261e.pdf
 */

import { FoodItem } from "../models/FoodItem";
import { mockFoods } from "../../data/mockFoods";

export type SavingsStatus = "within_savings" | "adjusted_to_savings" | "over_savings_minimum";

export interface SubstitutionRecord {
  from: string;
  to: string;
  reason: string;
  savings: number;
  proteinImpact: number; // grams of protein gained/lost
}

export interface OptimizationResult {
  items: FoodItem[];
  totalEstimatedCost: number;
  totalProtein: number;
  savingsStatus: SavingsStatus;
  substitutionsApplied: SubstitutionRecord[];
  efficiencyScore: number; // total protein / total cost
}

/**
 * Substitution graph: expensive → cheaper alternatives with similar macros
 * Each entry maps a food to an array of alternatives (ordered by preference)
 */
const SUBSTITUTION_GRAPH: Record<string, string[]> = {
  // Premium proteins → value proteins
  "Salmon fillet": ["Tuna (canned)", "Chicken breast (skinless)"],
  "Lean ground beef (5% fat)": ["Chicken breast (skinless)", "Turkey breast"],
  "Turkey breast": ["Chicken breast (skinless)"],
  
  // Premium carbs → value carbs
  "Quinoa": ["Brown rice", "White rice"],
  "Sweet potato": ["Pasta (whole wheat)", "White rice"],
  
  // Premium dairy → value dairy
  "Cottage cheese (low fat)": ["Greek yogurt (0% fat)"],
  
  // Premium oils → value oils
  "Olive oil": ["Sunflower oil"],
  
  // Premium vegetables → value vegetables
  "Spinach (fresh)": ["Broccoli", "Mixed vegetables (frozen)"],
  
  // Premium fruits → value fruits
  "Blueberries": ["Banana", "Apple"],
  "Avocado": ["Olive oil"], // Different category, but similar healthy fats
};

/**
 * DIVERSITY CONSTRAINTS
 * Prevent monotonous diet (e.g., "tuna only")
 * Source: Variety increases adherence
 * https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7071223/
 */
const MAX_PROTEIN_SUBSTITUTIONS = 2;
const MIN_UNIQUE_PROTEINS = 2;

/**
 * Count unique protein sources in shopping list
 * Used to prevent diet monotony
 */
function countUniqueProteins(items: FoodItem[]): number {
  const proteinNames = items
    .filter(item => item.category === "proteins")
    .map(item => item.name);
  
  return new Set(proteinNames).size;
}

/**
 * Check if a food item is a protein
 */
function isProteinItem(item: FoodItem): boolean {
  return item.category === "proteins";
}

/**
 * Calculate protein-per-cost efficiency score for a food item
 * Higher score = better value in terms of protein
 */
function calculateProteinPerCost(item: FoodItem): number {
  if (!item.estimatedPrice || item.estimatedPrice === 0) return 0;
  if (!item.macros?.protein) return 0;
  
  // Calculate total protein in the item (quantity in kg * protein per 100g * 10)
  const totalProteinGrams = item.quantity * (item.macros.protein * 10);
  
  return totalProteinGrams / item.estimatedPrice;
}

/**
 * Find the best substitute for a given food item
 * Returns the substitute with highest protein-per-cost score
 */
function findBestSubstitute(
  itemName: string,
  allFoods: FoodItem[]
): FoodItem | null {
  const alternatives = SUBSTITUTION_GRAPH[itemName];
  if (!alternatives || alternatives.length === 0) return null;
  
  // Find alternatives that exist in mockFoods
  const validSubstitutes = alternatives
    .map(altName => allFoods.find(f => f.name === altName))
    .filter((f): f is FoodItem => f !== undefined);
  
  if (validSubstitutes.length === 0) return null;
  
  // Return the first valid substitute (already ordered by preference in graph)
  return validSubstitutes[0];
}

/**
 * Smart Savings Optimizer
 * Adjusts shopping list to fit savings target while maximizing protein intake
 */
export function optimizeSavings(
  items: FoodItem[],
  totalCost: number,
  savingsTarget: number,
  excludedFoods: string[] = []
): OptimizationResult {
  // Calculate initial metrics
  const initialProtein = items.reduce((sum, item) => {
    if (!item.macros?.protein) return sum;
    return sum + (item.quantity * item.macros.protein * 10);
  }, 0);
  
  // If already within savings target, no optimization needed
  if (totalCost <= savingsTarget) {
    console.log(`✅ Savings target met: ${totalCost.toFixed(2)} / ${savingsTarget.toFixed(2)}`);
    return {
      items,
      totalEstimatedCost: totalCost,
      totalProtein: initialProtein,
      savingsStatus: "within_savings",
      substitutionsApplied: [],
      efficiencyScore: totalCost > 0 ? initialProtein / totalCost : 0,
    };
  }
  
  console.log(`⚠️ Over savings target: ${totalCost.toFixed(2)} > ${savingsTarget.toFixed(2)}`);
  console.log(`💪 Starting Smart Savings optimization (protein-per-cost strategy)...`);
  
  // Clone items for mutation
  let optimizedItems = items.map(item => ({ ...item }));
  let currentCost = totalCost;
  let currentProtein = initialProtein;
  const substitutionsApplied: SubstitutionRecord[] = [];
  
  // Diversity tracking
  let proteinSubstitutionCount = 0;
  const initialUniqueProteins = countUniqueProteins(items);
  
  console.log(`🍗 Initial protein variety: ${initialUniqueProteins} different sources`);
  
  // Calculate protein-per-cost scores for all items
  const itemScores = optimizedItems.map(item => ({
    item,
    score: calculateProteinPerCost(item),
  }));
  
  // Sort by score (lowest first = worst value for money)
  const sortedByEfficiency = [...itemScores].sort((a, b) => a.score - b.score);
  
  // Try to substitute low-efficiency items
  for (const { item } of sortedByEfficiency) {
    // Stop if we're within savings target
    if (currentCost <= savingsTarget) {
      break;
    }
    
    // Check if this is a protein substitution
    const isProteinSubstitution = isProteinItem(item);
    
    // DIVERSITY CONSTRAINT 1: Limit protein substitutions
    if (isProteinSubstitution && proteinSubstitutionCount >= MAX_PROTEIN_SUBSTITUTIONS) {
      console.log(`⚠️ Skipping ${item.name}: Max protein substitutions (${MAX_PROTEIN_SUBSTITUTIONS}) reached`);
      continue;
    }
    
    // Check if this item has substitutes
    const substitute = findBestSubstitute(item.name, mockFoods);
    
    if (!substitute) {
      continue; // No substitute available
    }
    
    // EXCLUSION CONSTRAINT: Never substitute TO an excluded food
    if (excludedFoods.includes(substitute.name)) {
      console.log(`🚫 Skipping ${substitute.name}: User excluded this food`);
      continue;
    }
    
    // Calculate substitute cost for the same quantity
    const originalItemCost = item.estimatedPrice || 0;
    const substituteCost = (substitute.pricePerUnit * item.quantity);
    const savings = originalItemCost - substituteCost;
    
    // Only substitute if it saves money
    if (savings <= 0) {
      continue;
    }
    
    // Find item index
    const itemIndex = optimizedItems.findIndex(i => i.id === item.id);
    
    if (itemIndex === -1) continue;
    
    // DIVERSITY CONSTRAINT 2: Snapshot before protein substitution
    const snapshotBeforeSubstitution = isProteinSubstitution 
      ? structuredClone(optimizedItems) 
      : null;
    
    // Calculate protein impact
    const originalProtein = item.quantity * (item.macros?.protein || 0) * 10;
    const newProtein = item.quantity * (substitute.macros?.protein || 0) * 10;
    const proteinImpact = newProtein - originalProtein;
    
    // Create substituted item
    const substitutedItem: FoodItem = {
      ...substitute,
      id: item.id, // Keep original ID for consistency
      quantity: item.quantity,
      estimatedPrice: substituteCost,
      reason: `Smart Savings swap for ${item.name}`,
    };
    
    // Apply substitution
    optimizedItems[itemIndex] = substitutedItem;
    
    // DIVERSITY CONSTRAINT 3: Validate protein variety
    if (isProteinSubstitution) {
      const uniqueProteinsAfter = countUniqueProteins(optimizedItems);
      
      if (uniqueProteinsAfter < MIN_UNIQUE_PROTEINS) {
        // ROLLBACK: This would reduce variety below minimum
        console.log(`⚠️ Rollback ${item.name} → ${substitute.name}: Would reduce variety to ${uniqueProteinsAfter} proteins`);
        optimizedItems = snapshotBeforeSubstitution!;
        break; // Stop optimization, can't meet savings target without killing variety
      }
      
      proteinSubstitutionCount++;
    }
    
    // Update cost and protein
    currentCost -= savings;
    currentProtein += proteinImpact;
    
    // Record substitution
    substitutionsApplied.push({
      from: item.name,
      to: substitute.name,
      reason: `Saved ${savings.toFixed(2)} (${proteinImpact >= 0 ? '+' : ''}${proteinImpact.toFixed(0)}g protein)`,
      savings,
      proteinImpact,
    });
    
    console.log(`🔄 Substituted: ${item.name} → ${substitute.name} (saved ${savings.toFixed(2)})`);
  }
  
  // Determine final savings status
  let savingsStatus: SavingsStatus;
  const proteinChange = currentProtein - initialProtein;
  const finalUniqueProteins = countUniqueProteins(optimizedItems);
  
  if (currentCost <= savingsTarget) {
    savingsStatus = "adjusted_to_savings";
    console.log(`✅ Smart Savings applied: ${currentCost.toFixed(2)} / ${savingsTarget.toFixed(2)}`);
  } else {
    savingsStatus = "over_savings_minimum";
    console.log(`⚠️ Still over savings target: ${currentCost.toFixed(2)} > ${savingsTarget.toFixed(2)}`);
    
    if (finalUniqueProteins >= MIN_UNIQUE_PROTEINS) {
      console.log(`This is the minimum cost with available substitutions.`);
    } else {
      console.log(`Cannot fit savings target without reducing variety below ${MIN_UNIQUE_PROTEINS} proteins.`);
    }
  }
  
  console.log(`💪 Protein: ${currentProtein.toFixed(0)}g (${proteinChange >= 0 ? '+' : ''}${proteinChange.toFixed(0)}g)`);
  console.log(`🍗 Protein variety: ${finalUniqueProteins} different sources`);
  console.log(`📊 Efficiency: ${(currentProtein / currentCost).toFixed(2)}g protein per cost`);
  
  return {
    items: optimizedItems,
    totalEstimatedCost: currentCost,
    totalProtein: currentProtein,
    savingsStatus,
    substitutionsApplied,
    efficiencyScore: currentCost > 0 ? currentProtein / currentCost : 0,
  };
}