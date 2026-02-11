import { FoodItem } from "../core/models/FoodItem";

/**
 * FITNESS-FIRST MOCK FOODS
 * 
 * Cada alimento contém:
 * - Macros realistas (protein/carbs/fat per 100g)
 * - Preços em EUR (mercado europeu)
 * - Categorização fitness-friendly
 * 
 * Foco em alimentos comuns em meal prep:
 * - Proteínas: frango, ovos, peixe, iogurte grego
 * - Carbs: arroz, batata-doce, aveia, pão integral
 * - Gorduras: azeite, abacate, amendoim
 * - Vegetais: brócolis, espinafre, tomate
 * - Frutas: banana, maçã, berries
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
    macros: {
      protein: 21,
      carbs: 0,
      fat: 5
    }
  },
  {
    id: "food-007",
    name: "Cottage cheese (low fat)",
    category: "dairy",
    unit: "kg",
    pricePerUnit: 4.49,
    quantity: 0,
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
    macros: {
      protein: 13,
      carbs: 67,
      fat: 2.5
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
    macros: {
      protein: 0.4,
      carbs: 0.3,
      fat: 1.1
    }
  }
];
