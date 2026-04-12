import { FoodItem } from "../core/models/FoodItem";
import { CATEGORIES } from "../core/constants/categories";

/**
 * NutriPilot Food Database
 *
 * Comprehensive food database for realistic athlete meal plans.
 * Total: 205 items across all categories.
 * 
 * Categories:
 * - Proteins: 24 options (poultry, fish, red meat, plant-based)
 * - Grains: 18 options (rice, pasta, bread, ancient grains)
 * - Vegetables: 28 options (leafy greens, cruciferous, root, etc.)
 * - Fruits: 21 options (fresh, dried, frozen)
 * - Dairy: 16 options (milk, yogurt, cheese, plant milks)
 * - Fats: 16 options (oils, nuts, seeds, nut butters)
 * - Legumes: 11 options (lentils, beans, chickpeas)
 * - Snacks: 12 options (bars, trail mix, healthy snacks)
 * - Supplements: 4 options (protein powder, creatine)
 * - Others: 10 options (condiments, spices, seasoning)
 * 
 * Each food contains:
 * - Realistic macros (protein/carbs/fat per 100g)
 * - EUR prices (European market)
 * - Cost level classification (low/medium/high)
 * - Fitness-friendly categorization
 */

export const mockFoods: FoodItem[] = [
  // ========================================
  // PROTEINS (High Protein for Fitness)
  // ========================================
  {
    id: "food-001",
    name: "Chicken breast (skinless)",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 7.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 31,  // 31g protein per 100g
      carbs: 0,
      fat: 3.6
    }
  },
  {
    id: "food-002",
    name: "Eggs (large)",
    category: CATEGORIES.protein,
    unit: "pack",  // 12 units
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 13,  // per 100g (2 eggs)
      carbs: 1.1,
      fat: 11
    }
  },
  {
    id: "food-003",
    name: "Greek yogurt (0% fat)",
    category: CATEGORIES.dairy,
    unit: "kg",
    pricePerUnit: 5.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 10,
      carbs: 4,
      fat: 0.4
    }
  },
  {
    id: "food-004",
    name: "Salmon fillet",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 18.99,
    quantity: 0,
    costLevel: "high",
    macros: {
      protein: 20,
      carbs: 0,
      fat: 13
    }
  },
  {
    id: "food-005",
    name: "Tuna (canned)",
    category: CATEGORIES.protein,
    unit: "can",  // 160g
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 25,
      carbs: 0,
      fat: 1
    }
  },
  {
    id: "food-006",
    name: "Lean ground beef (5% fat)",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 9.99,
    quantity: 0,
    costLevel: "high",
    macros: {
      protein: 21,
      carbs: 0,
      fat: 5
    }
  },
  // PASSO 31: Additional protein variety
  {
    id: "food-031",
    name: "Turkey breast",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 7.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 29,
      carbs: 0,
      fat: 1
    }
  },
  {
    id: "food-032",
    name: "Cod fillet",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 12.99,
    quantity: 0,
    costLevel: "high",
    macros: {
      protein: 18,
      carbs: 0,
      fat: 0.7
    }
  },
  {
    id: "food-033",
    name: "Pork loin",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 6.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 27,
      carbs: 0,
      fat: 6
    }
  },
  {
    id: "food-007",
    name: "Cottage cheese (low fat)",
    category: CATEGORIES.dairy,
    unit: "kg",
    pricePerUnit: 4.49,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 11,
      carbs: 3.4,
      fat: 4.3
    }
  },

  // ========================================
  // GRAINS & CARBS (Energy for Bulking/Maintenance)
  // ========================================
  {
    id: "food-008",
    name: "White rice",
    category: CATEGORIES.grains,
    unit: "kg",
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 7,
      carbs: 77,
      fat: 0.6
    }
  },
  {
    id: "food-009",
    name: "Brown rice",
    category: CATEGORIES.grains,
    unit: "kg",
    pricePerUnit: 3.29,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 8,
      carbs: 76,
      fat: 2.9
    }
  },
  {
    id: "food-010",
    name: "Oats (rolled)",
    category: CATEGORIES.grains,
    unit: "kg",
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 13.7,
      carbs: 67,
      fat: 7
    }
  },
  {
    id: "food-011",
    name: "Sweet potato",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 2.19,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 1.6,
      carbs: 20,
      fat: 0.1
    }
  },
  {
    id: "food-012",
    name: "Whole wheat bread",
    category: CATEGORIES.grains,
    unit: "loaf",  // 500g
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 9,
      carbs: 49,
      fat: 3.4
    }
  },
  {
    id: "food-013",
    name: "Quinoa",
    category: CATEGORIES.grains,
    unit: "kg",
    pricePerUnit: 6.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 14,
      carbs: 64,
      fat: 6
    }
  },
  {
    id: "food-014",
    name: "Pasta (whole wheat)",
    category: CATEGORIES.grains,
    unit: "kg",
    pricePerUnit: 2.79,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 13,
      carbs: 67,
      fat: 2.5
    }
  },
  // PASSO 31: Additional carb variety
  {
    id: "food-034",
    name: "Couscous",
    category: CATEGORIES.grains,
    unit: "kg",
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 12,
      carbs: 72,
      fat: 0.6
    }
  },
  {
    id: "food-035",
    name: "Barley",
    category: CATEGORIES.grains,
    unit: "kg",
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 10,
      carbs: 73,
      fat: 1.2
    }
  },
  {
    id: "food-036",
    name: "White bread",
    category: CATEGORIES.grains,
    unit: "pack",
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 8,
      carbs: 49,
      fat: 3.2
    }
  },

  // ========================================
  // VEGETABLES (Micronutrients & Fiber)
  // ========================================
  {
    id: "food-015",
    name: "Broccoli",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 2.8,
      carbs: 7,
      fat: 0.4
    }
  },
  {
    id: "food-016",
    name: "Spinach (fresh)",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4
    }
  },
  {
    id: "food-017",
    name: "Tomatoes",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 0.9,
      carbs: 3.9,
      fat: 0.2
    }
  },
  {
    id: "food-018",
    name: "Bell peppers",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 3.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 1,
      carbs: 6,
      fat: 0.3
    }
  },
  {
    id: "food-019",
    name: "Carrots",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 1.29,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 0.9,
      carbs: 10,
      fat: 0.2
    }
  },
  {
    id: "food-020",
    name: "Cucumber",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 1.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 0.7,
      carbs: 3.6,
      fat: 0.1
    }
  },
  {
    id: "food-021",
    name: "Lettuce (mixed greens)",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 1.4,
      carbs: 2.9,
      fat: 0.2
    }
  },

  // ========================================
  // FRUITS (Natural Sugars & Vitamins)
  // ========================================
  {
    id: "food-022",
    name: "Bananas",
    category: CATEGORIES.fruits,
    unit: "kg",
    pricePerUnit: 1.79,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 1.1,
      carbs: 23,
      fat: 0.3
    }
  },
  {
    id: "food-023",
    name: "Apples",
    category: CATEGORIES.fruits,
    unit: "kg",
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 0.3,
      carbs: 14,
      fat: 0.2
    }
  },
  {
    id: "food-024",
    name: "Blueberries",
    category: CATEGORIES.fruits,
    unit: "pack",  // 250g
    pricePerUnit: 3.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 0.7,
      carbs: 14,
      fat: 0.3
    }
  },
  {
    id: "food-025",
    name: "Strawberries",
    category: CATEGORIES.fruits,
    unit: "pack",  // 500g
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 0.7,
      carbs: 8,
      fat: 0.3
    }
  },
  {
    id: "food-026",
    name: "Oranges",
    category: CATEGORIES.fruits,
    unit: "kg",
    pricePerUnit: 2.29,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 0.9,
      carbs: 12,
      fat: 0.1
    }
  },

  // ========================================
  // FATS & OILS (Healthy Fats)
  // ========================================
  {
    id: "food-027",
    name: "Extra virgin olive oil",
    category: CATEGORIES.fats,
    unit: "L",
    pricePerUnit: 8.99,
    quantity: 0,
    costLevel: "high",
    macros: {
      protein: 0,
      carbs: 0,
      fat: 100
    }
  },
  {
    id: "food-028",
    name: "Avocado",
    category: CATEGORIES.fruits,
    unit: "kg",
    pricePerUnit: 4.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 2,
      carbs: 9,
      fat: 15
    }
  },
  {
    id: "food-029",
    name: "Peanut butter (natural)",
    category: CATEGORIES.fats,
    unit: "jar",  // 500g
    pricePerUnit: 4.49,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 25,
      carbs: 20,
      fat: 50
    }
  },
  {
    id: "food-030",
    name: "Almonds (raw)",
    category: CATEGORIES.fats,
    unit: "kg",
    pricePerUnit: 12.99,
    quantity: 0,
    costLevel: "high",
    macros: {
      protein: 21,
      carbs: 22,
      fat: 49
    }
  },

  // ========================================
  // SPICES & SEASONING (Zero Calorie Flavor)
  // ========================================
  {
    id: "food-031",
    name: "Sea salt",
    category: CATEGORIES.others,
    unit: "pack",  // 500g
    pricePerUnit: 1.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 0,
      carbs: 0,
      fat: 0
    }
  },
  {
    id: "food-032",
    name: "Black pepper",
    category: CATEGORIES.others,
    unit: "pack",  // 100g
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 10,
      carbs: 64,
      fat: 3.3
    }
  },
  {
    id: "food-033",
    name: "Garlic powder",
    category: CATEGORIES.others,
    unit: "pack",  // 100g
    pricePerUnit: 3.29,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 18,
      carbs: 73,
      fat: 0.7
    }
  },
  {
    id: "food-034",
    name: "Paprika",
    category: CATEGORIES.others,
    unit: "pack",  // 100g
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 14,
      carbs: 54,
      fat: 13
    }
  },

  // ========================================
  // BEVERAGES (Hydration & Recovery)
  // ========================================
  {
    id: "food-035",
    name: "Milk (skim)",
    category: CATEGORIES.dairy,
    unit: "L",
    pricePerUnit: 1.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 3.4,
      carbs: 5,
      fat: 0.1
    }
  },
  {
    id: "food-036",
    name: "Almond milk (unsweetened)",
    category: CATEGORIES.dairy,
    unit: "L",
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 0.4,
      carbs: 0.3,
      fat: 1.1
    }
  },

  // ========================================
  // PASSO 32: EXPANDED PROTEIN SOURCES
  // ========================================
  {
    id: "food-037",
    name: "Tilapia fillet",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 8.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 26,
      carbs: 0,
      fat: 1.7
    }
  },
  {
    id: "food-038",
    name: "Cottage cheese (low-fat)",
    category: CATEGORIES.protein,
    unit: "pack", // 500g
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 11,
      carbs: 3.4,
      fat: 4.3
    }
  },
  {
    id: "food-039",
    name: "Tofu (firm)",
    category: CATEGORIES.protein,
    unit: "pack", // 400g
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 8,
      carbs: 1.9,
      fat: 4.8
    }
  },
  {
    id: "food-040",
    name: "Shrimp (raw)",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 14.99,
    quantity: 0,
    costLevel: "high",
    macros: {
      protein: 24,
      carbs: 0,
      fat: 0.3
    }
  },
  {
    id: "food-041",
    name: "Lamb chops",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 16.99,
    quantity: 0,
    costLevel: "high",
    macros: {
      protein: 25,
      carbs: 0,
      fat: 21
    }
  },
  {
    id: "food-042",
    name: "Duck breast",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 15.99,
    quantity: 0,
    costLevel: "high",
    macros: {
      protein: 19,
      carbs: 0,
      fat: 12
    }
  },
  {
    id: "food-043",
    name: "Sardines (canned)",
    category: CATEGORIES.protein,
    unit: "can", // 120g
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 25,
      carbs: 0,
      fat: 11
    }
  },

  // ========================================
  // PASSO 32: EXPANDED CARB SOURCES
  // ========================================
  {
    id: "food-044",
    name: "Buckwheat",
    category: CATEGORIES.grains,
    unit: "pack", // 500g
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 13,
      carbs: 72,
      fat: 3.4
    }
  },
  {
    id: "food-045",
    name: "Rye bread",
    category: CATEGORIES.grains,
    unit: "pack", // 500g
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 8.5,
      carbs: 48,
      fat: 1.7
    }
  },
  {
    id: "food-046",
    name: "Whole wheat tortillas",
    category: CATEGORIES.grains,
    unit: "pack", // 8 units
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 9,
      carbs: 50,
      fat: 4
    }
  },
  {
    id: "food-047",
    name: "Corn (frozen)",
    category: CATEGORIES.grains,
    unit: "pack", // 500g
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 3.4,
      carbs: 19,
      fat: 1.5
    }
  },

  // ========================================
  // PASSO 32: EXPANDED VEGETABLES
  // ========================================
  {
    id: "food-048",
    name: "Cauliflower",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 1.9,
      carbs: 5,
      fat: 0.3
    }
  },
  {
    id: "food-049",
    name: "Zucchini",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 1.2,
      carbs: 3.1,
      fat: 0.3
    }
  },
  {
    id: "food-050",
    name: "Asparagus",
    category: CATEGORIES.vegetables,
    unit: "bunch",
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 2.2,
      carbs: 3.9,
      fat: 0.2
    }
  },
  {
    id: "food-051",
    name: "Green beans",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 1.8,
      carbs: 7,
      fat: 0.2
    }
  },
  {
    id: "food-052",
    name: "Brussels sprouts",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 3.4,
      carbs: 9,
      fat: 0.3
    }
  },
  {
    id: "food-053",
    name: "Kale",
    category: CATEGORIES.vegetables,
    unit: "bunch",
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 4.3,
      carbs: 9,
      fat: 0.9
    }
  },
  {
    id: "food-054",
    name: "Cucumber",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 1.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 0.7,
      carbs: 3.6,
      fat: 0.1
    }
  },
  {
    id: "food-055",
    name: "Carrots",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 1.29,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 0.9,
      carbs: 10,
      fat: 0.2
    }
  },
  {
    id: "food-056",
    name: "Mushrooms (button)",
    category: CATEGORIES.vegetables,
    unit: "pack", // 250g
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 3.1,
      carbs: 3.3,
      fat: 0.3
    }
  },
  {
    id: "food-057",
    name: "Eggplant",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 2.29,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 1,
      carbs: 6,
      fat: 0.2
    }
  },
  {
    id: "food-058",
    name: "Celery",
    category: CATEGORIES.vegetables,
    unit: "bunch",
    pricePerUnit: 1.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 0.7,
      carbs: 3,
      fat: 0.2
    }
  },
  {
    id: "food-059",
    name: "Lettuce (romaine)",
    category: CATEGORIES.vegetables,
    unit: "head",
    pricePerUnit: 1.29,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 1.2,
      carbs: 3.3,
      fat: 0.3
    }
  },

  // ========================================
  // PASSO 32: EXPANDED FRUITS
  // ========================================
  {
    id: "food-060",
    name: "Strawberries",
    category: CATEGORIES.fruits,
    unit: "pack", // 250g
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 0.7,
      carbs: 7.7,
      fat: 0.3
    }
  },
  {
    id: "food-061",
    name: "Grapes",
    category: CATEGORIES.fruits,
    unit: "kg",
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 0.7,
      carbs: 18,
      fat: 0.2
    }
  },
  {
    id: "food-062",
    name: "Pineapple",
    category: CATEGORIES.fruits,
    unit: "unit",
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 0.5,
      carbs: 13,
      fat: 0.1
    }
  },
  {
    id: "food-063",
    name: "Watermelon",
    category: CATEGORIES.fruits,
    unit: "kg",
    pricePerUnit: 1.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 0.6,
      carbs: 7.6,
      fat: 0.2
    }
  },
  {
    id: "food-064",
    name: "Kiwi",
    category: CATEGORIES.fruits,
    unit: "kg",
    pricePerUnit: 3.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 1.1,
      carbs: 15,
      fat: 0.5
    }
  },
  {
    id: "food-065",
    name: "Mango",
    category: CATEGORIES.fruits,
    unit: "unit",
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 0.8,
      carbs: 15,
      fat: 0.4
    }
  },
  {
    id: "food-066",
    name: "Peach",
    category: CATEGORIES.fruits,
    unit: "kg",
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 0.9,
      carbs: 10,
      fat: 0.3
    }
  },
  {
    id: "food-067",
    name: "Pear",
    category: CATEGORIES.fruits,
    unit: "kg",
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 0.4,
      carbs: 15,
      fat: 0.1
    }
  },

  // ========================================
  // PASSO 32: EXPANDED FATS
  // ========================================
  {
    id: "food-068",
    name: "Cashews",
    category: CATEGORIES.fats,
    unit: "pack", // 200g
    pricePerUnit: 4.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 18,
      carbs: 30,
      fat: 44
    }
  },
  {
    id: "food-069",
    name: "Walnuts",
    category: CATEGORIES.fats,
    unit: "pack", // 200g
    pricePerUnit: 5.49,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 15,
      carbs: 14,
      fat: 65
    }
  },
  {
    id: "food-070",
    name: "Flaxseed",
    category: CATEGORIES.fats,
    unit: "pack", // 250g
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 18,
      carbs: 29,
      fat: 42
    }
  },
  {
    id: "food-071",
    name: "Chia seeds",
    category: CATEGORIES.fats,
    unit: "pack", // 200g
    pricePerUnit: 4.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 17,
      carbs: 42,
      fat: 31
    }
  },
  {
    id: "food-072",
    name: "Coconut oil",
    category: CATEGORIES.fats,
    unit: "jar", // 500ml
    pricePerUnit: 6.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 0,
      carbs: 0,
      fat: 100
    }
  },
  {
    id: "food-073",
    name: "Butter (unsalted)",
    category: CATEGORIES.fats,
    unit: "pack", // 250g
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 0.9,
      carbs: 0.1,
      fat: 81
    }
  },

  // ========================================
  // PASSO 32: EXPANDED SNACKS
  // ========================================
  {
    id: "food-074",
    name: "Protein bar (25g protein)",
    category: CATEGORIES.snacks,
    unit: "unit",
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 42, // per 60g bar
      carbs: 25,
      fat: 8
    }
  },
  {
    id: "food-075",
    name: "Rice cakes",
    category: CATEGORIES.snacks,
    unit: "pack", // 10 units
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 7,
      carbs: 82,
      fat: 3
    }
  },
  {
    id: "food-076",
    name: "Dark chocolate (85%)",
    category: CATEGORIES.snacks,
    unit: "bar", // 100g
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 10,
      carbs: 22,
      fat: 70
    }
  },
  {
    id: "food-077",
    name: "Beef jerky",
    category: CATEGORIES.snacks,
    unit: "pack", // 50g
    pricePerUnit: 3.99,
    quantity: 0,
    costLevel: "high",
    macros: {
      protein: 33,
      carbs: 11,
      fat: 4
    }
  },
  {
    id: "food-078",
    name: "Hummus",
    category: CATEGORIES.snacks,
    unit: "pack", // 200g
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 8,
      carbs: 14,
      fat: 10
    }
  },
  {
    id: "food-079",
    name: "Edamame (frozen)",
    category: CATEGORIES.snacks,
    unit: "pack", // 300g
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 11,
      carbs: 10,
      fat: 5
    }
  },
  {
    id: "food-080",
    name: "Trail mix",
    category: CATEGORIES.snacks,
    unit: "pack", // 200g
    pricePerUnit: 3.99,
    quantity: 0,
    costLevel: "medium",
    macros: {
      protein: 13,
      carbs: 47,
      fat: 32
    }
  },
  {
    id: "food-081",
    name: "Popcorn (air-popped)",
    category: CATEGORIES.snacks,
    unit: "pack", // 100g
    pricePerUnit: 1.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 13,
      carbs: 77,
      fat: 4
    }
  },

  // ========================================
  // LEGUMES (High Protein + Fiber Plant Sources)
  // ========================================
  {
    id: "food-082",
    name: "Red lentils",
    category: CATEGORIES.legumes,
    unit: "kg",
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 24, carbs: 60, fat: 1.1 }
  },
  {
    id: "food-083",
    name: "Green lentils",
    category: CATEGORIES.legumes,
    unit: "kg",
    pricePerUnit: 3.29,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 25, carbs: 60, fat: 1 }
  },
  {
    id: "food-084",
    name: "Chickpeas (dried)",
    category: CATEGORIES.legumes,
    unit: "kg",
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 19, carbs: 61, fat: 6 }
  },
  {
    id: "food-085",
    name: "Chickpeas (canned)",
    category: CATEGORIES.legumes,
    unit: "can", // 400g
    pricePerUnit: 1.29,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 8.4, carbs: 22, fat: 2.6 }
  },
  {
    id: "food-086",
    name: "Black beans (canned)",
    category: CATEGORIES.legumes,
    unit: "can", // 400g
    pricePerUnit: 1.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 8.9, carbs: 24, fat: 0.5 }
  },
  {
    id: "food-087",
    name: "Kidney beans (canned)",
    category: CATEGORIES.legumes,
    unit: "can", // 400g
    pricePerUnit: 1.29,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 8.7, carbs: 22, fat: 0.5 }
  },
  {
    id: "food-088",
    name: "White beans (canned)",
    category: CATEGORIES.legumes,
    unit: "can", // 400g
    pricePerUnit: 1.29,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 7.4, carbs: 21, fat: 0.5 }
  },
  {
    id: "food-089",
    name: "Split peas (dried)",
    category: CATEGORIES.legumes,
    unit: "kg",
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 25, carbs: 60, fat: 1 }
  },
  {
    id: "food-090",
    name: "Soy beans (dried)",
    category: CATEGORIES.legumes,
    unit: "kg",
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 36, carbs: 30, fat: 20 }
  },
  {
    id: "food-091",
    name: "Lima beans (frozen)",
    category: CATEGORIES.legumes,
    unit: "pack", // 400g
    pricePerUnit: 2.29,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 8, carbs: 20, fat: 0.4 }
  },
  {
    id: "food-092",
    name: "Pinto beans (canned)",
    category: CATEGORIES.legumes,
    unit: "can", // 400g
    pricePerUnit: 1.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 9, carbs: 23, fat: 0.6 }
  },

  // ========================================
  // EXPANDED DAIRY (More Variety)
  // ========================================
  {
    id: "food-093",
    name: "Whole milk",
    category: CATEGORIES.dairy,
    unit: "L",
    pricePerUnit: 1.39,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 3.3, carbs: 4.7, fat: 3.6 }
  },
  {
    id: "food-094",
    name: "Semi-skimmed milk",
    category: CATEGORIES.dairy,
    unit: "L",
    pricePerUnit: 1.29,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 3.4, carbs: 4.8, fat: 1.5 }
  },
  {
    id: "food-095",
    name: "Natural yogurt",
    category: CATEGORIES.dairy,
    unit: "kg",
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 4.3, carbs: 4.7, fat: 3.3 }
  },
  {
    id: "food-096",
    name: "Skyr",
    category: CATEGORIES.dairy,
    unit: "pack", // 450g
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 11, carbs: 4, fat: 0.2 }
  },
  {
    id: "food-097",
    name: "Mozzarella",
    category: CATEGORIES.dairy,
    unit: "pack", // 250g
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 22, carbs: 2.2, fat: 22 }
  },
  {
    id: "food-098",
    name: "Parmesan cheese",
    category: CATEGORIES.dairy,
    unit: "pack", // 200g
    pricePerUnit: 4.99,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 36, carbs: 0, fat: 26 }
  },
  {
    id: "food-099",
    name: "Cheddar cheese",
    category: CATEGORIES.dairy,
    unit: "pack", // 200g
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 25, carbs: 1.3, fat: 33 }
  },
  {
    id: "food-100",
    name: "Cream cheese (light)",
    category: CATEGORIES.dairy,
    unit: "pack", // 200g
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 7, carbs: 4, fat: 15 }
  },
  {
    id: "food-101",
    name: "Quark (low-fat)",
    category: CATEGORIES.dairy,
    unit: "pack", // 500g
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 12, carbs: 4, fat: 0.3 }
  },
  {
    id: "food-102",
    name: "Kefir",
    category: CATEGORIES.dairy,
    unit: "L",
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 3.3, carbs: 4.2, fat: 1.5 }
  },
  {
    id: "food-103",
    name: "Whey protein powder",
    category: CATEGORIES.dairy,
    unit: "pack", // 1kg
    pricePerUnit: 24.99,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 80, carbs: 6, fat: 5 }
  },

  // ========================================
  // MORE PROTEIN SOURCES
  // ========================================
  {
    id: "food-104",
    name: "Pork tenderloin",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 9.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 26, carbs: 0, fat: 3.5 }
  },
  {
    id: "food-105",
    name: "Chicken thigh (boneless)",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 6.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 26, carbs: 0, fat: 10 }
  },
  {
    id: "food-106",
    name: "Cod fillet",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 12.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 18, carbs: 0, fat: 0.7 }
  },
  {
    id: "food-107",
    name: "Mackerel fillet",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 9.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 19, carbs: 0, fat: 13.9 }
  },
  {
    id: "food-108",
    name: "Tempeh",
    category: CATEGORIES.protein,
    unit: "pack", // 400g
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 19, carbs: 9.4, fat: 11 }
  },
  {
    id: "food-109",
    name: "Seitan",
    category: CATEGORIES.protein,
    unit: "pack", // 250g
    pricePerUnit: 3.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 75, carbs: 14, fat: 2 }
  },
  {
    id: "food-110",
    name: "Egg whites (liquid)",
    category: CATEGORIES.protein,
    unit: "pack", // 500ml
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 11, carbs: 0.7, fat: 0.2 }
  },
  {
    id: "food-111",
    name: "Trout fillet",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 14.99,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 20, carbs: 0, fat: 6.6 }
  },
  {
    id: "food-112",
    name: "Canned salmon",
    category: CATEGORIES.protein,
    unit: "can", // 200g
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 20, carbs: 0, fat: 8 }
  },

  // ========================================
  // MORE GRAINS & STARCHES
  // ========================================
  {
    id: "food-113",
    name: "Couscous",
    category: CATEGORIES.grains,
    unit: "pack", // 500g
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 13, carbs: 65, fat: 1 }
  },
  {
    id: "food-114",
    name: "Bulgur wheat",
    category: CATEGORIES.grains,
    unit: "pack", // 500g
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 12, carbs: 63, fat: 1.3 }
  },
  {
    id: "food-115",
    name: "Millet",
    category: CATEGORIES.grains,
    unit: "pack", // 500g
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 11, carbs: 73, fat: 4.2 }
  },
  {
    id: "food-116",
    name: "Amaranth",
    category: CATEGORIES.grains,
    unit: "pack", // 500g
    pricePerUnit: 4.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 14, carbs: 65, fat: 7 }
  },
  {
    id: "food-117",
    name: "Spelt flour",
    category: CATEGORIES.grains,
    unit: "kg",
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 15, carbs: 70, fat: 2.4 }
  },
  {
    id: "food-118",
    name: "Sourdough bread",
    category: CATEGORIES.grains,
    unit: "loaf", // 500g
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 8, carbs: 51, fat: 1.6 }
  },
  {
    id: "food-119",
    name: "Polenta (cornmeal)",
    category: CATEGORIES.grains,
    unit: "pack", // 500g
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 7, carbs: 79, fat: 1.2 }
  },
  {
    id: "food-120",
    name: "Whole wheat penne",
    category: CATEGORIES.grains,
    unit: "pack", // 500g
    pricePerUnit: 1.79,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 13, carbs: 67, fat: 2.5 }
  },
  {
    id: "food-121",
    name: "Barley",
    category: CATEGORIES.grains,
    unit: "pack", // 500g
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 12, carbs: 73, fat: 2.3 }
  },

  // ========================================
  // MORE VEGETABLES
  // ========================================
  {
    id: "food-122",
    name: "Artichoke hearts (canned)",
    category: CATEGORIES.vegetables,
    unit: "can", // 400g
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 2.9, carbs: 11, fat: 0.2 }
  },
  {
    id: "food-123",
    name: "Beetroot",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 1.6, carbs: 10, fat: 0.2 }
  },
  {
    id: "food-124",
    name: "Radishes",
    category: CATEGORIES.vegetables,
    unit: "bunch",
    pricePerUnit: 1.29,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 0.7, carbs: 3.4, fat: 0.1 }
  },
  {
    id: "food-125",
    name: "Leeks",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 1.5, carbs: 14, fat: 0.3 }
  },
  {
    id: "food-126",
    name: "Fennel",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 1.2, carbs: 7.3, fat: 0.2 }
  },
  {
    id: "food-127",
    name: "Peas (frozen)",
    category: CATEGORIES.vegetables,
    unit: "pack", // 500g
    pricePerUnit: 1.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 5.4, carbs: 14, fat: 0.4 }
  },
  {
    id: "food-128",
    name: "Cabbage",
    category: CATEGORIES.vegetables,
    unit: "head",
    pricePerUnit: 1.29,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 1.3, carbs: 6, fat: 0.1 }
  },
  {
    id: "food-129",
    name: "Swiss chard",
    category: CATEGORIES.vegetables,
    unit: "bunch",
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 1.8, carbs: 3.7, fat: 0.2 }
  },

  // ========================================
  // MORE FRUITS
  // ========================================
  {
    id: "food-130",
    name: "Pomegranate",
    category: CATEGORIES.fruits,
    unit: "unit",
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 1.7, carbs: 19, fat: 1.2 }
  },
  {
    id: "food-131",
    name: "Raspberries",
    category: CATEGORIES.fruits,
    unit: "pack", // 125g
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 1.2, carbs: 12, fat: 0.7 }
  },
  {
    id: "food-132",
    name: "Blueberries (frozen)",
    category: CATEGORIES.fruits,
    unit: "pack", // 300g
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 0.7, carbs: 14, fat: 0.3 }
  },
  {
    id: "food-133",
    name: "Dried dates",
    category: CATEGORIES.fruits,
    unit: "pack", // 250g
    pricePerUnit: 3.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 2.5, carbs: 75, fat: 0.4 }
  },
  {
    id: "food-134",
    name: "Dried apricots",
    category: CATEGORIES.fruits,
    unit: "pack", // 250g
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 3.4, carbs: 63, fat: 0.5 }
  },
  {
    id: "food-135",
    name: "Coconut (fresh)",
    category: CATEGORIES.fruits,
    unit: "unit",
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 3.3, carbs: 15, fat: 33 }
  },
  {
    id: "food-136",
    name: "Cranberries (dried)",
    category: CATEGORIES.fruits,
    unit: "pack", // 200g
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 0.1, carbs: 82, fat: 1.4 }
  },

  // ========================================
  // MORE FATS & OILS
  // ========================================
  {
    id: "food-137",
    name: "Tahini",
    category: CATEGORIES.fats,
    unit: "jar", // 300g
    pricePerUnit: 4.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 17, carbs: 12, fat: 54 }
  },
  {
    id: "food-138",
    name: "Sunflower seeds",
    category: CATEGORIES.fats,
    unit: "pack", // 250g
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 21, carbs: 20, fat: 51 }
  },
  {
    id: "food-139",
    name: "Pumpkin seeds",
    category: CATEGORIES.fats,
    unit: "pack", // 200g
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 30, carbs: 5, fat: 49 }
  },
  {
    id: "food-140",
    name: "Hemp seeds",
    category: CATEGORIES.fats,
    unit: "pack", // 200g
    pricePerUnit: 5.99,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 32, carbs: 2.8, fat: 49 }
  },
  {
    id: "food-141",
    name: "Almond butter",
    category: CATEGORIES.fats,
    unit: "jar", // 250g
    pricePerUnit: 5.99,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 21, carbs: 19, fat: 56 }
  },
  {
    id: "food-142",
    name: "Sesame oil",
    category: CATEGORIES.fats,
    unit: "bottle", // 250ml
    pricePerUnit: 3.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 0, carbs: 0, fat: 100 }
  },
  {
    id: "food-143",
    name: "Hazelnuts",
    category: CATEGORIES.fats,
    unit: "pack", // 200g
    pricePerUnit: 4.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 15, carbs: 17, fat: 61 }
  },

  // ========================================
  // MORE SNACKS (Pre/Post-Workout)
  // ========================================
  {
    id: "food-144",
    name: "Oat bar (homemade)",
    category: CATEGORIES.snacks,
    unit: "pack", // 6 bars
    pricePerUnit: 3.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 8, carbs: 60, fat: 14 }
  },
  {
    id: "food-145",
    name: "Dried mango slices",
    category: CATEGORIES.snacks,
    unit: "pack", // 100g
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 1.5, carbs: 78, fat: 0.6 }
  },
  {
    id: "food-146",
    name: "Peanuts (roasted)",
    category: CATEGORIES.snacks,
    unit: "pack", // 200g
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 26, carbs: 16, fat: 49 }
  },
  {
    id: "food-147",
    name: "Seaweed snacks",
    category: CATEGORIES.snacks,
    unit: "pack", // 20g
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 6, carbs: 40, fat: 2 }
  },

  // ========================================
  // SUPPLEMENTS & FUNCTIONAL
  // ========================================
  {
    id: "food-148",
    name: "Creatine monohydrate",
    category: CATEGORIES.supplements,
    unit: "pack", // 300g
    pricePerUnit: 14.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 0, carbs: 0, fat: 0 }
  },
  {
    id: "food-149",
    name: "Casein protein powder",
    category: CATEGORIES.supplements,
    unit: "pack", // 900g
    pricePerUnit: 29.99,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 80, carbs: 4, fat: 2 }
  },
  {
    id: "food-150",
    name: "Plant protein blend",
    category: CATEGORIES.supplements,
    unit: "pack", // 1kg
    pricePerUnit: 22.99,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 70, carbs: 8, fat: 4 }
  },
  {
    id: "food-151",
    name: "BCAA powder",
    category: CATEGORIES.supplements,
    unit: "pack", // 300g
    pricePerUnit: 19.99,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 0, carbs: 0, fat: 0 }
  },

  // ========================================
  // CONDIMENTS & FLAVORING
  // ========================================
  {
    id: "food-152",
    name: "Soy sauce (low sodium)",
    category: CATEGORIES.others,
    unit: "bottle", // 250ml
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 8, carbs: 5, fat: 0 }
  },
  {
    id: "food-153",
    name: "Apple cider vinegar",
    category: CATEGORIES.others,
    unit: "bottle", // 500ml
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 0, carbs: 0.9, fat: 0 }
  },
  {
    id: "food-154",
    name: "Mustard (Dijon)",
    category: CATEGORIES.others,
    unit: "jar", // 200g
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 4, carbs: 3.3, fat: 3.6 }
  },
  {
    id: "food-155",
    name: "Tomato paste",
    category: CATEGORIES.others,
    unit: "tube", // 200g
    pricePerUnit: 1.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 4.3, carbs: 19, fat: 0.5 }
  },
  {
    id: "food-156",
    name: "Turmeric powder",
    category: CATEGORIES.others,
    unit: "pack", // 100g
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 8, carbs: 65, fat: 3.3 }
  },
  {
    id: "food-157",
    name: "Honey",
    category: CATEGORIES.others,
    unit: "jar", // 500g
    pricePerUnit: 5.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 0.3, carbs: 82, fat: 0 }
  },
  {
    id: "food-158",
    name: "Oat milk",
    category: CATEGORIES.dairy,
    unit: "L",
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 1, carbs: 6.7, fat: 1.5 }
  },
  {
    id: "food-159",
    name: "Soy milk (unsweetened)",
    category: CATEGORIES.dairy,
    unit: "L",
    pricePerUnit: 1.79,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 3.3, carbs: 1, fat: 1.8 }
  },
  {
    id: "food-160",
    name: "Ricotta cheese",
    category: CATEGORIES.dairy,
    unit: "pack", // 250g
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 11, carbs: 3, fat: 13 }
  },

  // ========================================
  // EXPANDED PROTEINS
  // ========================================
  {
    id: "food-161",
    name: "Tempeh",
    category: CATEGORIES.protein,
    unit: "pack", // 300g
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 19, carbs: 7, fat: 11 }
  },
  {
    id: "food-162",
    name: "Edamame (frozen)",
    category: CATEGORIES.protein,
    unit: "pack", // 500g
    pricePerUnit: 2.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 11, carbs: 8, fat: 5 }
  },
  {
    id: "food-163",
    name: "Seitan",
    category: CATEGORIES.protein,
    unit: "pack", // 250g
    pricePerUnit: 3.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 25, carbs: 14, fat: 1.9 }
  },
  {
    id: "food-164",
    name: "Pork tenderloin",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 9.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 22, carbs: 0, fat: 3.5 }
  },
  {
    id: "food-165",
    name: "Lamb mince",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 12.99,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 17, carbs: 0, fat: 17 }
  },
  {
    id: "food-166",
    name: "Mackerel fillet",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 8.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 19, carbs: 0, fat: 14 }
  },
  {
    id: "food-167",
    name: "Sardines (canned)",
    category: CATEGORIES.protein,
    unit: "can", // 120g
    pricePerUnit: 1.29,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 24, carbs: 0, fat: 11 }
  },
  {
    id: "food-168",
    name: "Shrimp (frozen)",
    category: CATEGORIES.protein,
    unit: "pack", // 500g
    pricePerUnit: 8.99,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 20, carbs: 0, fat: 1.7 }
  },
  {
    id: "food-169",
    name: "Duck breast",
    category: CATEGORIES.protein,
    unit: "kg",
    pricePerUnit: 15.99,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 19, carbs: 0, fat: 10 }
  },
  {
    id: "food-170",
    name: "Tofu (firm)",
    category: CATEGORIES.protein,
    unit: "pack", // 400g
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 8, carbs: 1.5, fat: 4 }
  },

  // ========================================
  // EXPANDED VEGETABLES
  // ========================================
  {
    id: "food-171",
    name: "Fennel",
    category: CATEGORIES.vegetables,
    unit: "unit",
    pricePerUnit: 1.29,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 1.2, carbs: 7, fat: 0.2 }
  },
  {
    id: "food-172",
    name: "Beetroot (fresh)",
    category: CATEGORIES.vegetables,
    unit: "kg",
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 1.7, carbs: 10, fat: 0.2 }
  },
  {
    id: "food-173",
    name: "Celeriac",
    category: CATEGORIES.vegetables,
    unit: "unit",
    pricePerUnit: 1.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 1.5, carbs: 9, fat: 0.3 }
  },
  {
    id: "food-174",
    name: "Leek",
    category: CATEGORIES.vegetables,
    unit: "unit",
    pricePerUnit: 0.89,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 1.5, carbs: 14, fat: 0.3 }
  },
  {
    id: "food-175",
    name: "Pak choi",
    category: CATEGORIES.vegetables,
    unit: "unit",
    pricePerUnit: 1.29,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 1.5, carbs: 2, fat: 0.2 }
  },
  {
    id: "food-176",
    name: "Artichoke (canned)",
    category: CATEGORIES.vegetables,
    unit: "can", // 400g
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 2, carbs: 10, fat: 0.2 }
  },
  {
    id: "food-177",
    name: "Chard (Swiss)",
    category: CATEGORIES.vegetables,
    unit: "bunch",
    pricePerUnit: 1.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 1.8, carbs: 3.7, fat: 0.2 }
  },
  {
    id: "food-178",
    name: "Edamame beans (fresh)",
    category: CATEGORIES.vegetables,
    unit: "pack", // 200g
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 11, carbs: 10, fat: 5 }
  },
  {
    id: "food-179",
    name: "Sun-dried tomatoes",
    category: CATEGORIES.vegetables,
    unit: "jar",
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 5, carbs: 44, fat: 3 }
  },
  {
    id: "food-180",
    name: "Kale chips",
    category: CATEGORIES.vegetables,
    unit: "pack", // 50g
    pricePerUnit: 3.99,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 4, carbs: 35, fat: 15 }
  },

  // ========================================
  // EXPANDED LEGUMES
  // ========================================
  {
    id: "food-181",
    name: "Mung beans",
    category: CATEGORIES.protein,
    unit: "pack", // 500g dry
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 24, carbs: 63, fat: 1.2 }
  },
  {
    id: "food-182",
    name: "Adzuki beans (canned)",
    category: CATEGORIES.protein,
    unit: "can", // 400g
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 7.5, carbs: 22, fat: 0.5 }
  },
  {
    id: "food-183",
    name: "Fava beans (dried)",
    category: CATEGORIES.protein,
    unit: "pack", // 500g
    pricePerUnit: 2.29,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 26, carbs: 58, fat: 1.5 }
  },
  {
    id: "food-184",
    name: "Pea protein powder",
    category: CATEGORIES.protein,
    unit: "pack", // 500g
    pricePerUnit: 14.99,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 80, carbs: 5, fat: 2 }
  },
  {
    id: "food-185",
    name: "Hemp seeds",
    category: CATEGORIES.fats,
    unit: "pack", // 200g
    pricePerUnit: 6.99,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 31, carbs: 8.7, fat: 49 }
  },

  // ========================================
  // EXPANDED GRAINS
  // ========================================
  {
    id: "food-186",
    name: "Freekeh",
    category: CATEGORIES.grains,
    unit: "pack", // 500g
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 12, carbs: 65, fat: 2.5 }
  },
  {
    id: "food-187",
    name: "Teff",
    category: CATEGORIES.grains,
    unit: "pack", // 500g
    pricePerUnit: 4.49,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 13, carbs: 74, fat: 2.4 }
  },
  {
    id: "food-188",
    name: "Polenta (instant)",
    category: CATEGORIES.grains,
    unit: "pack", // 500g
    pricePerUnit: 2.29,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 7, carbs: 76, fat: 1.3 }
  },
  {
    id: "food-189",
    name: "Puffed rice cakes",
    category: CATEGORIES.grains,
    unit: "pack", // 130g
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 7, carbs: 80, fat: 0.5 }
  },
  {
    id: "food-190",
    name: "Whole grain crispbread",
    category: CATEGORIES.grains,
    unit: "pack", // 250g
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 10, carbs: 62, fat: 2 }
  },

  // ========================================
  // EXPANDED DAIRY & ALTERNATIVES
  // ========================================
  {
    id: "food-191",
    name: "Kefir (plain)",
    category: CATEGORIES.dairy,
    unit: "L",
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 3.4, carbs: 4.5, fat: 3.5 }
  },
  {
    id: "food-192",
    name: "Quark cheese",
    category: CATEGORIES.dairy,
    unit: "pack", // 250g
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 13, carbs: 4, fat: 0.3 }
  },
  {
    id: "food-193",
    name: "Oat milk (barista)",
    category: CATEGORIES.dairy,
    unit: "L",
    pricePerUnit: 2.29,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 1, carbs: 7, fat: 1.5 }
  },
  {
    id: "food-194",
    name: "Pea milk",
    category: CATEGORIES.dairy,
    unit: "L",
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 3.5, carbs: 2, fat: 2.5 }
  },

  // ========================================
  // EXPANDED FATS & OILS
  // ========================================
  {
    id: "food-195",
    name: "Walnut oil",
    category: CATEGORIES.fats,
    unit: "bottle", // 250ml
    pricePerUnit: 5.99,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 0, carbs: 0, fat: 100 }
  },
  {
    id: "food-196",
    name: "MCT oil",
    category: CATEGORIES.fats,
    unit: "bottle", // 500ml
    pricePerUnit: 14.99,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 0, carbs: 0, fat: 100 }
  },
  {
    id: "food-197",
    name: "Sunflower seed butter",
    category: CATEGORIES.fats,
    unit: "jar",
    pricePerUnit: 5.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 19, carbs: 12, fat: 56 }
  },
  {
    id: "food-198",
    name: "Pumpkin seeds",
    category: CATEGORIES.fats,
    unit: "pack", // 200g
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 19, carbs: 17, fat: 46 }
  },

  // ========================================
  // FRUITS (ADDITIONAL)
  // ========================================
  {
    id: "food-199",
    name: "Pomegranate",
    category: CATEGORIES.fruits,
    unit: "unit",
    pricePerUnit: 1.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 1.7, carbs: 19, fat: 1.2 }
  },
  {
    id: "food-200",
    name: "Papaya",
    category: CATEGORIES.fruits,
    unit: "unit",
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 0.5, carbs: 11, fat: 0.3 }
  },
  {
    id: "food-201",
    name: "Passion fruit",
    category: CATEGORIES.fruits,
    unit: "unit",
    pricePerUnit: 0.79,
    quantity: 0,
    costLevel: "low",
    macros: { protein: 2.2, carbs: 23, fat: 0.7 }
  },
  {
    id: "food-202",
    name: "Dragon fruit",
    category: CATEGORIES.fruits,
    unit: "unit",
    pricePerUnit: 3.49,
    quantity: 0,
    costLevel: "high",
    macros: { protein: 1.1, carbs: 9, fat: 0 }
  },
  {
    id: "food-203",
    name: "Lychee (canned)",
    category: CATEGORIES.fruits,
    unit: "can", // 400g
    pricePerUnit: 2.49,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 0.8, carbs: 17, fat: 0.1 }
  },

  // ========================================
  // CONDIMENTS & SAUCES
  // ========================================
  {
    id: "food-204",
    name: "Tamari soy sauce",
    category: CATEGORIES.others,
    unit: "bottle", // 250ml
    pricePerUnit: 3.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 10.5, carbs: 5, fat: 0 }
  },
  {
    id: "food-205",
    name: "Miso paste",
    category: CATEGORIES.others,
    unit: "jar",
    pricePerUnit: 4.99,
    quantity: 0,
    costLevel: "medium",
    macros: { protein: 12, carbs: 25, fat: 6 }
  }
];

