import { FoodItem } from "../core/models/FoodItem";

/**
 * PASSO 32: MVP FITNESS DATABASE
 * 
 * Expanded food database for realistic athlete meal plans
 * Total: 70-90 items across all categories
 * 
 * Categories:
 * - Proteins: 15+ options
 * - Carbs: 12+ options  
 * - Vegetables: 15+ options
 * - Fruits: 10+ options
 * - Fats: 8+ options
 * - Snacks: 8+ options
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
    category: "proteins",
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
    category: "proteins",
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
    category: "dairy",
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
    category: "proteins",
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
    category: "proteins",
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
    category: "proteins",
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
    category: "proteins",
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
    category: "proteins",
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
    category: "proteins",
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
    category: "dairy",
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
    category: "grains",
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
    category: "grains",
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
    category: "grains",
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
    category: "vegetables",
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
    category: "grains",
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
    category: "grains",
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
    category: "grains",
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
    category: "grains",
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
    category: "grains",
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
    category: "grains",
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
    category: "vegetables",
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
    category: "vegetables",
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
    category: "vegetables",
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
    category: "vegetables",
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
    category: "vegetables",
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
    category: "vegetables",
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
    category: "vegetables",
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
    category: "fruits",
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
    category: "fruits",
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
    category: "fruits",
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
    category: "fruits",
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
    category: "fruits",
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
    category: "oils",
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
    category: "fruits",
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
    category: "others",
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
    category: "others",
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
    category: "spices",
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
    category: "spices",
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
    category: "spices",
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
    category: "spices",
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
    category: "dairy",
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
    category: "beverages",
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
    category: "proteins",
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
    category: "proteins",
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
    category: "proteins",
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
    category: "proteins",
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
    category: "proteins",
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
    category: "proteins",
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
    category: "proteins",
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
    category: "carbs",
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
    category: "carbs",
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
    category: "carbs",
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
    category: "carbs",
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
    category: "vegetables",
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
    category: "vegetables",
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
    category: "vegetables",
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
    category: "vegetables",
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
    category: "vegetables",
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
    category: "vegetables",
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
    category: "vegetables",
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
    category: "vegetables",
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
    category: "vegetables",
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
    category: "vegetables",
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
    category: "vegetables",
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
    category: "vegetables",
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
    category: "fruits",
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
    category: "fruits",
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
    category: "fruits",
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
    category: "fruits",
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
    category: "fruits",
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
    category: "fruits",
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
    category: "fruits",
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
    category: "fruits",
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
    category: "fats",
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
    category: "fats",
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
    category: "fats",
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
    category: "fats",
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
    category: "fats",
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
    category: "fats",
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
    category: "snacks",
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
    category: "snacks",
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
    category: "snacks",
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
    category: "snacks",
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
    category: "snacks",
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
    category: "snacks",
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
    category: "snacks",
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
    category: "snacks",
    unit: "pack", // 100g
    pricePerUnit: 1.49,
    quantity: 0,
    costLevel: "low",
    macros: {
      protein: 13,
      carbs: 77,
      fat: 4
    }
  }
];
