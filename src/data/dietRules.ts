import { DietStyle } from "../core/models/PlanInput";
import { FoodCategory } from "../core/models/FoodItem";

export interface DietPreferences {
  preferredCategories: FoodCategory[];
  avoidCategories: FoodCategory[];
  maxDailyCalories: number;
  description: string;
}

export const dietRules: Record<DietStyle, DietPreferences> = {
  healthy: {
    preferredCategories: [
      "vegetables",
      "fruits",
      "proteins",
      "grains"
    ],
    avoidCategories: [],
    maxDailyCalories: 2000,
    description: "Foco em alimentos naturais, grãos integrais, proteínas magras e muitos vegetais"
  },
  balanced: {
    preferredCategories: [
      "vegetables",
      "proteins",
      "grains",
      "fruits",
      "dairy"
    ],
    avoidCategories: [],
    maxDailyCalories: 2200,
    description: "Equilíbrio entre todos os grupos alimentares com variedade e moderação"
  },
  comfort: {
    preferredCategories: [
      "grains",
      "proteins",
      "dairy",
      "vegetables"
    ],
    avoidCategories: [],
    maxDailyCalories: 2500,
    description: "Refeições reconfortantes e tradicionais com foco no sabor e satisfação"
  }
};

export interface SnackPreferences {
  healthy: string[];
  balanced: string[];
  comfort: string[];
}

export const snacksByDiet: SnackPreferences = {
  healthy: [
    "Iogurte com frutas",
    "Castanhas mix",
    "Frutas frescas",
    "Snack rápido"
  ],
  balanced: [
    "Snack rápido",
    "Iogurte com frutas",
    "Frutas com mel",
    "Mix de nuts"
  ],
  comfort: [
    "Snack rápido",
    "Pão com manteiga",
    "Chocolate",
    "Amendoim com mel"
  ]
};
