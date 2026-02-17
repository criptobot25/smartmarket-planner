import { DietStyle } from "../core/models/PlanInput";
import { FoodCategory } from "../core/models/FoodItem";
import { CATEGORIES } from "../core/constants/categories";

export interface DietPreferences {
  preferredCategories: FoodCategory[];
  avoidCategories: FoodCategory[];
  maxDailyCalories: number;
  description: string;
}

export const dietRules: Record<DietStyle, DietPreferences> = {
  healthy: {
    preferredCategories: [
      CATEGORIES.vegetables,
      CATEGORIES.fruits,
      CATEGORIES.protein,
      CATEGORIES.grains
    ],
    avoidCategories: [],
    maxDailyCalories: 2000,
    description: "Foco em alimentos naturais, grãos integrais, proteínas magras e muitos vegetais"
  },
  balanced: {
    preferredCategories: [
      CATEGORIES.vegetables,
      CATEGORIES.protein,
      CATEGORIES.grains,
      CATEGORIES.fruits,
      CATEGORIES.dairy
    ],
    avoidCategories: [],
    maxDailyCalories: 2200,
    description: "Equilíbrio entre todos os grupos alimentares com variedade e moderação"
  },
  comfort: {
    preferredCategories: [
      CATEGORIES.grains,
      CATEGORIES.protein,
      CATEGORIES.dairy,
      CATEGORIES.vegetables
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
