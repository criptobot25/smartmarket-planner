import { Recipe } from "../core/models/Recipe";
import { CATEGORIES } from "../core/constants/categories";

export const mockRecipes: Recipe[] = [
  {
    id: "recipe-001",
    name: "Omelete saudável",
    mealType: "breakfast",
    servings: 2,
    prepTime: 15,
    dietStyle: ["healthy", "balanced"],
    ingredients: [
      {
        foodItemId: "food-007",
        name: "Ovos",
        quantity: 4,
        unit: "un",
        category: CATEGORIES.protein
      },
      {
        foodItemId: "food-011",
        name: "Tomate",
        quantity: 0.1,
        unit: "kg",
        category: CATEGORIES.vegetables
      },
      {
        foodItemId: "food-012",
        name: "Cebola",
        quantity: 0.05,
        unit: "kg",
        category: CATEGORIES.vegetables
      },
      {
        foodItemId: "food-028",
        name: "Óleo de soja",
        quantity: 0.02,
        unit: "L",
        category: CATEGORIES.fats
      },
      {
        foodItemId: "food-029",
        name: "Sal",
        quantity: 0.005,
        unit: "kg",
        category: CATEGORIES.others
      }
    ],
    instructions: [
      "Bata os ovos em uma tigela",
      "Adicione tomate e cebola picados",
      "Tempere com sal",
      "Aqueça o óleo em uma frigideira",
      "Despeje a mistura e cozinhe por 5-7 minutos"
    ],
    tags: ["rápido", "proteína", "low-carb"]
  },
  {
    id: "recipe-002",
    name: "Frango com arroz e legumes",
    mealType: "lunch",
    servings: 4,
    prepTime: 40,
    dietStyle: ["healthy", "balanced"],
    ingredients: [
      {
        foodItemId: "food-006",
        name: "Frango (peito)",
        quantity: 0.6,
        unit: "kg",
        category: CATEGORIES.protein
      },
      {
        foodItemId: "food-002",
        name: "Arroz integral",
        quantity: 0.3,
        unit: "kg",
        category: CATEGORIES.grains
      },
      {
        foodItemId: "food-014",
        name: "Cenoura",
        quantity: 0.2,
        unit: "kg",
        category: CATEGORIES.vegetables
      },
      {
        foodItemId: "food-015",
        name: "Brócolis",
        quantity: 0.3,
        unit: "kg",
        category: CATEGORIES.vegetables
      },
      {
        foodItemId: "food-012",
        name: "Cebola",
        quantity: 0.1,
        unit: "kg",
        category: CATEGORIES.vegetables
      },
      {
        foodItemId: "food-013",
        name: "Alho",
        quantity: 0.01,
        unit: "kg",
        category: CATEGORIES.vegetables
      },
      {
        foodItemId: "food-027",
        name: "Azeite de oliva",
        quantity: 0.03,
        unit: "L",
        category: CATEGORIES.fats
      },
      {
        foodItemId: "food-029",
        name: "Sal",
        quantity: 0.01,
        unit: "kg",
        category: CATEGORIES.others
      }
    ],
    instructions: [
      "Cozinhe o arroz integral conforme instruções da embalagem",
      "Corte o frango em cubos e tempere com sal e alho",
      "Refogue o frango no azeite até dourar",
      "Adicione cenoura e brócolis picados",
      "Cozinhe por mais 10 minutos",
      "Sirva com o arroz"
    ],
    tags: ["completo", "proteína", "fibras"]
  },
  {
    id: "recipe-003",
    name: "Overnight oats",
    mealType: "breakfast",
    servings: 1,
    prepTime: 5,
    dietStyle: ["healthy"],
    ingredients: [
      {
        foodItemId: "food-003",
        name: "Aveia em flocos",
        quantity: 0.06,
        unit: "kg",
        category: CATEGORIES.grains
      },
      {
        foodItemId: "food-024",
        name: "Iogurte natural",
        quantity: 0.15,
        unit: "kg",
        category: CATEGORIES.dairy
      },
      {
        foodItemId: "food-019",
        name: "Banana",
        quantity: 0.1,
        unit: "kg",
        category: CATEGORIES.fruits
      },
      {
        foodItemId: "food-032",
        name: "Mel",
        quantity: 0.015,
        unit: "kg",
        category: CATEGORIES.others
      },
      {
        foodItemId: "food-034",
        name: "Granola",
        quantity: 0.02,
        unit: "kg",
        category: CATEGORIES.others
      }
    ],
    instructions: [
      "Misture aveia e iogurte em um pote",
      "Adicione mel e mexa bem",
      "Leve à geladeira durante a noite",
      "Pela manhã, adicione banana em rodelas e granola"
    ],
    tags: ["prático", "fibras", "sem cozimento"]
  },
  {
    id: "recipe-004",
    name: "Massa comfort",
    mealType: "dinner",
    servings: 4,
    prepTime: 30,
    dietStyle: ["comfort", "balanced"],
    ingredients: [
      {
        foodItemId: "food-004",
        name: "Macarrão",
        quantity: 0.5,
        unit: "kg",
        category: CATEGORIES.grains
      },
      {
        foodItemId: "food-008",
        name: "Carne moída",
        quantity: 0.4,
        unit: "kg",
        category: CATEGORIES.protein
      },
      {
        foodItemId: "food-011",
        name: "Tomate",
        quantity: 0.3,
        unit: "kg",
        category: CATEGORIES.vegetables
      },
      {
        foodItemId: "food-012",
        name: "Cebola",
        quantity: 0.1,
        unit: "kg",
        category: CATEGORIES.vegetables
      },
      {
        foodItemId: "food-013",
        name: "Alho",
        quantity: 0.015,
        unit: "kg",
        category: CATEGORIES.vegetables
      },
      {
        foodItemId: "food-025",
        name: "Queijo mussarela",
        quantity: 0.1,
        unit: "kg",
        category: CATEGORIES.dairy
      },
      {
        foodItemId: "food-028",
        name: "Óleo de soja",
        quantity: 0.03,
        unit: "L",
        category: CATEGORIES.fats
      },
      {
        foodItemId: "food-029",
        name: "Sal",
        quantity: 0.01,
        unit: "kg",
        category: CATEGORIES.others
      },
      {
        foodItemId: "food-031",
        name: "Orégano",
        quantity: 0.005,
        unit: "g",
        category: CATEGORIES.others
      }
    ],
    instructions: [
      "Cozinhe o macarrão em água fervente com sal",
      "Refogue alho e cebola no óleo",
      "Adicione a carne moída e cozinhe até dourar",
      "Acrescente tomates picados e temperos",
      "Deixe cozinhar por 15 minutos",
      "Misture com o macarrão escorrido",
      "Finalize com queijo ralado e orégano"
    ],
    tags: ["reconfortante", "família", "tradicional"]
  },
  {
    id: "recipe-005",
    name: "Salada balanceada",
    mealType: "lunch",
    servings: 2,
    prepTime: 20,
    dietStyle: ["healthy", "balanced"],
    ingredients: [
      {
        foodItemId: "food-016",
        name: "Alface",
        quantity: 1,
        unit: "un",
        category: CATEGORIES.vegetables
      },
      {
        foodItemId: "food-011",
        name: "Tomate",
        quantity: 0.15,
        unit: "kg",
        category: CATEGORIES.vegetables
      },
      {
        foodItemId: "food-014",
        name: "Cenoura",
        quantity: 0.1,
        unit: "kg",
        category: CATEGORIES.vegetables
      },
      {
        foodItemId: "food-010",
        name: "Atum em lata",
        quantity: 2,
        unit: "un",
        category: CATEGORIES.protein
      },
      {
        foodItemId: "food-007",
        name: "Ovos",
        quantity: 2,
        unit: "un",
        category: CATEGORIES.protein
      },
      {
        foodItemId: "food-027",
        name: "Azeite de oliva",
        quantity: 0.02,
        unit: "L",
        category: CATEGORIES.fats
      },
      {
        foodItemId: "food-029",
        name: "Sal",
        quantity: 0.005,
        unit: "kg",
        category: CATEGORIES.others
      }
    ],
    instructions: [
      "Cozinhe os ovos até ficarem duros",
      "Lave e pique a alface",
      "Corte tomates e cenoura em cubos",
      "Misture todos os vegetais em uma tigela",
      "Adicione atum e ovos picados",
      "Tempere com azeite e sal"
    ],
    tags: ["leve", "proteína", "fresco"]
  },
  {
    id: "recipe-006",
    name: "Snack rápido",
    mealType: "snack",
    servings: 1,
    prepTime: 5,
    dietStyle: ["healthy", "balanced", "comfort"],
    ingredients: [
      {
        foodItemId: "food-019",
        name: "Banana",
        quantity: 0.12,
        unit: "kg",
        category: CATEGORIES.fruits
      },
      {
        foodItemId: "food-033",
        name: "Amendoim",
        quantity: 0.03,
        unit: "kg",
        category: CATEGORIES.others
      },
      {
        foodItemId: "food-032",
        name: "Mel",
        quantity: 0.01,
        unit: "kg",
        category: CATEGORIES.others
      }
    ],
    instructions: [
      "Corte a banana em rodelas",
      "Passe mel por cima",
      "Adicione amendoim picado"
    ],
    tags: ["rápido", "energia", "sem cozimento"]
  },
  {
    id: "recipe-007",
    name: "Arroz com feijão",
    mealType: "lunch",
    servings: 4,
    prepTime: 45,
    dietStyle: ["balanced", "comfort"],
    ingredients: [
      {
        foodItemId: "food-001",
        name: "Arroz branco",
        quantity: 0.3,
        unit: "kg",
        category: CATEGORIES.grains
      },
      {
        foodItemId: "food-009",
        name: "Feijão preto",
        quantity: 0.3,
        unit: "kg",
        category: CATEGORIES.protein
      },
      {
        foodItemId: "food-012",
        name: "Cebola",
        quantity: 0.1,
        unit: "kg",
        category: CATEGORIES.vegetables
      },
      {
        foodItemId: "food-013",
        name: "Alho",
        quantity: 0.02,
        unit: "kg",
        category: CATEGORIES.vegetables
      },
      {
        foodItemId: "food-028",
        name: "Óleo de soja",
        quantity: 0.03,
        unit: "L",
        category: CATEGORIES.fats
      },
      {
        foodItemId: "food-029",
        name: "Sal",
        quantity: 0.01,
        unit: "kg",
        category: CATEGORIES.others
      }
    ],
    instructions: [
      "Deixe o feijão de molho na noite anterior",
      "Cozinhe o feijão na panela de pressão por 30 minutos",
      "Refogue alho e cebola no óleo",
      "Adicione ao feijão cozido",
      "Cozinhe o arroz separadamente",
      "Sirva junto"
    ],
    tags: ["tradicional", "completo", "brasileiro"]
  },
  {
    id: "recipe-008",
    name: "Iogurte com frutas",
    mealType: "snack",
    servings: 1,
    prepTime: 5,
    dietStyle: ["healthy"],
    ingredients: [
      {
        foodItemId: "food-024",
        name: "Iogurte natural",
        quantity: 0.2,
        unit: "kg",
        category: CATEGORIES.dairy
      },
      {
        foodItemId: "food-022",
        name: "Morango",
        quantity: 0.1,
        unit: "kg",
        category: CATEGORIES.fruits
      },
      {
        foodItemId: "food-032",
        name: "Mel",
        quantity: 0.015,
        unit: "kg",
        category: CATEGORIES.others
      },
      {
        foodItemId: "food-035",
        name: "Castanhas mix",
        quantity: 0.02,
        unit: "kg",
        category: CATEGORIES.others
      }
    ],
    instructions: [
      "Coloque o iogurte em uma tigela",
      "Adicione morangos picados",
      "Regue com mel",
      "Finalize com castanhas"
    ],
    tags: ["rápido", "proteína", "antioxidante"]
  }
];

