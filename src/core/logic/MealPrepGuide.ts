/**
 * PASSO 36 - Meal Prep Guide Generator (Sunday Ritual Core)
 * 
 * Generates actionable cooking instructions from weekly meal plans.
 * Goes beyond shopping lists to tell users exactly what to cook on Sunday.
 * 
 * Features:
 * - Aggregates weekly ingredients into batch cooking tasks
 * - Provides specific cooking instructions (time, temperature, method)
 * - Organizes tasks in optimal cooking order
 * - Estimates total prep time
 * - Sunday meal prep optimization
 * 
 * Psychology:
 * - Clear instructions reduce cooking anxiety
 * - Batch cooking saves time and decision fatigue
 * - Sunday prep ritual builds healthy habits
 * 
 * Scientific basis:
 * - Meal prep improves diet adherence (Obesity Research 2015)
 * - Clear instructions increase task completion (Implementation Science)
 */

import { WeeklyPlan } from "../models/WeeklyPlan";
import { CATEGORIES } from "../../core/constants/categories";
import { mockFoods } from "../../data/mockFoods";

export type CookingMethod = 
  | "oven" 
  | "stovetop" 
  | "boil" 
  | "steam" 
  | "raw" 
  | "chop" 
  | "portion";

export interface CookingTask {
  order: number;                    // Execution order (1, 2, 3...)
  action: string;                   // "Cook", "Boil", "Chop", "Portion"
  ingredient: string;               // "Chicken breast", "Brown rice"
  quantity: string;                 // "1.5kg", "1kg", "800g"
  method: CookingMethod;            // "oven", "boil", "chop"
  instructions: string;             // "Cook 1.5kg chicken (25min oven at 180°C)"
  duration: number;                 // Minutes
  temperature?: string;             // "180°C" for oven tasks
  parallel?: boolean;               // Can be done simultaneously with other tasks
  category?: string;                // Food category for filtering tips
}

export interface PrepIngredientSummary {
  ingredient: string;               // "Chicken breast"
  totalGrams: number;               // 1500
  category: string;                 // "proteins"
  cookingMethod: CookingMethod;     // "oven"
  mealCount: number;                // 10 (appears in 10 meals)
}

export interface MealPrepGuide {
  cookingTasks: CookingTask[];      // Ordered list of what to cook
  totalPrepTime: string;            // "2h 15min" (includes parallel tasks)
  sequentialTime: string;           // "3h 45min" (if done one by one)
  ingredientSummary: PrepIngredientSummary[];
  tips: string[];                   // Cooking tips and time-saving advice
  difficulty: "easy" | "medium" | "advanced";
  servingsProduced: number;         // Total meals prepared
}

/**
 * Cooking instructions database
 * Maps food items to cooking methods with time and temperature
 */
const COOKING_INSTRUCTIONS: Record<string, {
  method: CookingMethod;
  duration: number;
  temperature?: string;
  instructions: string;
}> = {
  // Proteins - Oven
  "Chicken breast": {
    method: "oven",
    duration: 25,
    temperature: "180°C",
    instructions: "Bake at 180°C for 25 minutes until internal temp reaches 75°C"
  },
  "Chicken thigh": {
    method: "oven",
    duration: 30,
    temperature: "190°C",
    instructions: "Roast at 190°C for 30 minutes until golden and cooked through"
  },
  "Turkey breast": {
    method: "oven",
    duration: 30,
    temperature: "180°C",
    instructions: "Bake at 180°C for 30 minutes until internal temp reaches 75°C"
  },
  "Salmon": {
    method: "oven",
    duration: 15,
    temperature: "180°C",
    instructions: "Bake at 180°C for 12-15 minutes until flaky"
  },
  "Cod": {
    method: "oven",
    duration: 15,
    temperature: "180°C",
    instructions: "Bake at 180°C for 15 minutes until opaque and flaky"
  },
  
  // Proteins - Stovetop
  "Ground beef": {
    method: "stovetop",
    duration: 15,
    instructions: "Cook in pan over medium heat for 15 minutes, stirring occasionally"
  },
  "Ground turkey": {
    method: "stovetop",
    duration: 15,
    instructions: "Cook in pan over medium heat for 15 minutes until no pink remains"
  },
  
  // Eggs
  "Eggs": {
    method: "boil",
    duration: 10,
    instructions: "Hard boil for 10 minutes, then cool in ice water"
  },
  
  // Grains - Boil
  "Brown rice": {
    method: "boil",
    duration: 40,
    instructions: "Boil in 2:1 water ratio for 40 minutes, then let rest 5 min"
  },
  "White rice": {
    method: "boil",
    duration: 18,
    instructions: "Boil in 2:1 water ratio for 18 minutes, then let rest 5 min"
  },
  "Quinoa": {
    method: "boil",
    duration: 15,
    instructions: "Rinse, then boil in 2:1 water ratio for 15 minutes"
  },
  "Pasta (whole wheat)": {
    method: "boil",
    duration: 12,
    instructions: "Boil in salted water for 10-12 minutes until al dente"
  },
  "Oats": {
    method: "raw",
    duration: 0,
    instructions: "Store dry, prepare fresh daily (5 min)"
  },
  
  // Vegetables - Steam/Chop
  "Broccoli": {
    method: "steam",
    duration: 8,
    instructions: "Steam for 6-8 minutes until bright green and tender-crisp"
  },
  "Carrots": {
    method: "steam",
    duration: 10,
    instructions: "Peel, chop, steam for 8-10 minutes until tender"
  },
  "Sweet potatoes": {
    method: "oven",
    duration: 45,
    temperature: "200°C",
    instructions: "Pierce with fork, bake at 200°C for 40-45 minutes"
  },
  "Bell peppers": {
    method: "chop",
    duration: 5,
    instructions: "Wash, deseed, chop into strips - store raw in containers"
  },
  "Tomatoes": {
    method: "chop",
    duration: 3,
    instructions: "Wash and chop - store raw for salads"
  },
  "Onions": {
    method: "chop",
    duration: 5,
    instructions: "Peel and dice - store in airtight container"
  },
  "Spinach (fresh)": {
    method: "raw",
    duration: 2,
    instructions: "Wash thoroughly and portion into containers"
  },
  "Lettuce": {
    method: "raw",
    duration: 3,
    instructions: "Wash, dry, and store in containers with paper towel"
  },
  "Cauliflower": {
    method: "steam",
    duration: 10,
    instructions: "Chop into florets, steam 8-10 minutes until tender"
  },
  
  // Fruits - Raw
  "Bananas": {
    method: "raw",
    duration: 0,
    instructions: "Store at room temperature, no prep needed"
  },
  "Apples": {
    method: "raw",
    duration: 0,
    instructions: "Wash and store, slice fresh when needed"
  },
  "Berries (blueberries)": {
    method: "raw",
    duration: 2,
    instructions: "Rinse gently, portion into containers"
  },
  "Oranges": {
    method: "raw",
    duration: 0,
    instructions: "Store at room temperature, peel fresh"
  },
  
  // Dairy - Portion
  "Yogurt (plain)": {
    method: "portion",
    duration: 5,
    instructions: "Portion from large container into meal-sized containers"
  },
  "Greek yogurt": {
    method: "portion",
    duration: 5,
    instructions: "Portion into containers with fruit if desired"
  },
  "Milk (whole)": {
    method: "raw",
    duration: 0,
    instructions: "No prep needed, store refrigerated"
  }
};

/**
 * Default cooking instruction for foods not in database
 */
function getDefaultCookingInstruction(
  ingredient: string,
  category: string,
  totalGrams: number
): CookingTask["instructions"] {
  const kg = (totalGrams / 1000).toFixed(1);
  const g = totalGrams;
  
  if (category === CATEGORIES.protein) {
    return `Cook ${kg}kg ${ingredient} (check package instructions)`;
  } else if (category === CATEGORIES.grains) {
    return `Prepare ${kg}kg ${ingredient} according to package (usually boil)`;
  } else if (category === CATEGORIES.vegetables) {
    return `Prep ${g}g ${ingredient} (wash, chop, store raw or steam)`;
  } else {
    return `Prepare ${g}g ${ingredient} according to preference`;
  }
}

/**
 * Aggregate ingredients from weekly plan
 */
function aggregateIngredients(weeklyPlan: WeeklyPlan): PrepIngredientSummary[] {
  const ingredientMap = new Map<string, PrepIngredientSummary>();
  
  weeklyPlan.days.forEach(day => {
    const meals = [day.meals.breakfast, day.meals.lunch, day.meals.dinner];
    if (day.meals.snack) meals.push(day.meals.snack);
    
    meals.forEach(meal => {
      if (!meal) return;
      
      meal.portions.forEach(portion => {
        const food = mockFoods.find(f => f.id === portion.foodId);
        if (!food) return;
        
        const cookingInfo = COOKING_INSTRUCTIONS[food.name];
        const method = cookingInfo?.method || "raw";
        
        const existing = ingredientMap.get(food.name);
        if (existing) {
          existing.totalGrams += portion.gramsNeeded;
          existing.mealCount += 1;
        } else {
          ingredientMap.set(food.name, {
            ingredient: food.name,
            totalGrams: portion.gramsNeeded,
            category: food.category,
            cookingMethod: method,
            mealCount: 1
          });
        }
      });
    });
  });
  
  return Array.from(ingredientMap.values());
}

/**
 * Convert ingredient summary to cooking task
 */
function createCookingTask(
  summary: PrepIngredientSummary,
  order: number
): CookingTask {
  const cookingInfo = COOKING_INSTRUCTIONS[summary.ingredient];
  const totalKg = summary.totalGrams / 1000;
  
  if (!cookingInfo) {
    // Default task for unknown foods
    return {
      order,
      action: "Prepare",
      ingredient: summary.ingredient,
      quantity: totalKg >= 1 ? `${totalKg.toFixed(1)}kg` : `${summary.totalGrams}g`,
      method: "raw",
      instructions: getDefaultCookingInstruction(
        summary.ingredient,
        summary.category,
        summary.totalGrams
      ),
      duration: 5,
      parallel: false
    };
  }
  
  // Build quantity string
  const quantity = totalKg >= 1 
    ? `${totalKg.toFixed(1)}kg` 
    : `${Math.round(summary.totalGrams)}g`;
  
  // Build action verb
  let action = "Prepare";
  if (cookingInfo.method === "oven") action = "Bake";
  else if (cookingInfo.method === "boil") action = "Boil";
  else if (cookingInfo.method === "steam") action = "Steam";
  else if (cookingInfo.method === "stovetop") action = "Cook";
  else if (cookingInfo.method === "chop") action = "Chop";
  else if (cookingInfo.method === "portion") action = "Portion";
  
  // Build full instruction with quantity
  const fullInstruction = cookingInfo.instructions.includes(summary.ingredient)
    ? cookingInfo.instructions.replace(summary.ingredient, `${quantity} ${summary.ingredient}`)
    : `${action} ${quantity} ${summary.ingredient}: ${cookingInfo.instructions}`;
  
  // Determine if can be done in parallel (oven and boil tasks can overlap)
  const parallel = cookingInfo.method === "oven" || cookingInfo.method === "boil";
  
  return {
    order,
    action,
    ingredient: summary.ingredient,
    quantity,
    method: cookingInfo.method,
    instructions: fullInstruction,
    duration: cookingInfo.duration,
    temperature: cookingInfo.temperature,
    parallel
  };
}

/**
 * Sort tasks by optimal cooking order
 * Strategy:
 * 1. Start long-cooking items first (oven proteins, grains)
 * 2. Quick tasks while waiting (chopping)
 * 3. Short-cook items near the end (steam vegetables)
 */
function sortTasksByOptimalOrder(tasks: CookingTask[]): CookingTask[] {
  const sorted = [...tasks].sort((a, b) => {
    // Prioritize by duration (longest first for parallel cooking)
    if (a.parallel && b.parallel) {
      return b.duration - a.duration; // Longest parallel tasks first
    }
    
    // Oven/boil tasks first (can run in background)
    if (a.parallel && !b.parallel) return -1;
    if (!a.parallel && b.parallel) return 1;
    
    // Among non-parallel, do quick chop/portion tasks while waiting
    if (a.method === "chop" || a.method === "portion") return -1;
    if (b.method === "chop" || b.method === "portion") return 1;
    
    return 0;
  });
  
  // Reassign order numbers
  return sorted.map((task, index) => ({
    ...task,
    order: index + 1
  }));
}

/**
 * Calculate total prep time considering parallel tasks
 */
function calculateTotalPrepTime(tasks: CookingTask[]): { 
  total: string; 
  sequential: string;
} {
  const sequentialMinutes = tasks.reduce((sum, task) => sum + task.duration, 0);
  
  // Parallel tasks can overlap
  // Simplified: longest parallel task + all sequential tasks
  const parallelTasks = tasks.filter(t => t.parallel);
  const sequentialTasks = tasks.filter(t => !t.parallel);
  
  const longestParallelDuration = parallelTasks.length > 0
    ? Math.max(...parallelTasks.map(t => t.duration))
    : 0;
  
  const sequentialDuration = sequentialTasks.reduce((sum, t) => sum + t.duration, 0);
  
  const totalMinutes = longestParallelDuration + sequentialDuration;
  
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };
  
  return {
    total: formatTime(totalMinutes),
    sequential: formatTime(sequentialMinutes)
  };
}

/**
 * Generate helpful meal prep tips
 */
function generatePrepTips(tasks: CookingTask[], totalMeals: number): string[] {
  const tips: string[] = [];
  
  // Container tip
  tips.push(`You'll need ${totalMeals} meal containers - glass containers work best for reheating`);
  
  // Parallel cooking tip
  const ovenTasks = tasks.filter(t => t.method === "oven");
  const boilTasks = tasks.filter(t => t.method === "boil");
  if (ovenTasks.length > 0 && boilTasks.length > 0) {
    tips.push("Start oven proteins and grains simultaneously to save time");
  }
  
  // Labeling tip
  tips.push("Label each container with day and meal type (Mon-Lunch, Tue-Dinner, etc.)");
  
  // Storage tip
  if (totalMeals > 14) {
    tips.push("Consider freezing half the meals to maintain freshness through the week");
  } else {
    tips.push("Store meals in refrigerator - most will stay fresh for 4-5 days");
  }
  
  // Vegetable tip
  const vegTasks = tasks.filter(t => t.category === CATEGORIES.vegetables);
  if (vegTasks.length > 2) {
    tips.push("Prep vegetables last to maintain maximum freshness and crunch");
  }
  
  // Rice tip
  const hasRice = tasks.some(t => t.ingredient.toLowerCase().includes("rice"));
  if (hasRice) {
    tips.push("Cook rice in large batch - it refrigerates well and reheats perfectly");
  }
  
  // Chicken tip
  const hasChicken = tasks.some(t => t.ingredient.toLowerCase().includes("chicken"));
  if (hasChicken) {
    tips.push("Season chicken before baking - simple salt, pepper, garlic powder works great");
  }
  
  return tips;
}

/**
 * Determine difficulty level based on tasks
 */
function calculateDifficulty(tasks: CookingTask[]): "easy" | "medium" | "advanced" {
  const totalTasks = tasks.length;
  const complexMethods = tasks.filter(t => 
    t.method === "oven" || t.method === "stovetop"
  ).length;
  
  if (totalTasks <= 3) return "easy";
  if (totalTasks <= 6 || complexMethods <= 2) return "medium";
  return "advanced";
}

/**
 * Generate complete meal prep guide from weekly plan
 * 
 * Main entry point for PASSO 36
 */
export function generateMealPrepGuide(weeklyPlan: WeeklyPlan): MealPrepGuide {
  // 1. Aggregate all ingredients
  const ingredientSummary = aggregateIngredients(weeklyPlan);
  
  // 2. Filter to cookable items (exclude raw items that need no prep)
  const cookableItems = ingredientSummary.filter(item => {
    const cookingInfo = COOKING_INSTRUCTIONS[item.ingredient];
    // Include if it has cooking instructions OR if it's a significant quantity
    return cookingInfo || item.totalGrams > 500;
  });
  
  // 3. Create cooking tasks
  const tasks = cookableItems.map((item, index) => 
    createCookingTask(item, index + 1)
  );
  
  // 4. Sort by optimal cooking order
  const sortedTasks = sortTasksByOptimalOrder(tasks);
  
  // 5. Calculate prep time
  const prepTime = calculateTotalPrepTime(sortedTasks);
  
  // 6. Count total servings
  const totalMeals = weeklyPlan.days.reduce((sum, day) => {
    let dailyMeals = 3; // breakfast, lunch, dinner
    if (day.meals.snack) dailyMeals += 1;
    return sum + dailyMeals;
  }, 0);
  
  // 7. Generate tips
  const tips = generatePrepTips(sortedTasks, totalMeals);
  
  // 8. Determine difficulty
  const difficulty = calculateDifficulty(sortedTasks);
  
  return {
    cookingTasks: sortedTasks,
    totalPrepTime: prepTime.total,
    sequentialTime: prepTime.sequential,
    ingredientSummary: cookableItems,
    tips,
    difficulty,
    servingsProduced: totalMeals
  };
}

/**
 * Get cooking instruction for specific ingredient
 */
export function getCookingInstruction(ingredientName: string): string | null {
  return COOKING_INSTRUCTIONS[ingredientName]?.instructions || null;
}

/**
 * Get all supported cooking methods
 */
export function getSupportedCookingMethods(): CookingMethod[] {
  return ["oven", "stovetop", "boil", "steam", "raw", "chop", "portion"];
}

/**
 * Check if ingredient has cooking instructions
 */
export function hasCookingInstructions(ingredientName: string): boolean {
  return ingredientName in COOKING_INSTRUCTIONS;
}
