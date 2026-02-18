import { FoodItem } from "../models/FoodItem";
import { CATEGORIES } from "../../core/constants/categories";

export type ProteinRotationGroup = "chicken" | "beef" | "fish" | "eggs" | "vegetarian";
export type CarbRotationGroup = "rice" | "pasta" | "oats" | "potatoes";

const PROTEIN_ROTATION_ORDER: ProteinRotationGroup[] = ["chicken", "beef", "fish", "eggs", "vegetarian"];
const CARB_ROTATION_ORDER: CarbRotationGroup[] = ["rice", "pasta", "oats", "potatoes"];

export interface FoodRotationRules {
  maxPerFoodPerWeek: number;
  minUniqueVegetablesPerWeek: number;
}

export const DEFAULT_FOOD_ROTATION_RULES: FoodRotationRules = {
  maxPerFoodPerWeek: 2,
  minUniqueVegetablesPerWeek: 5,
};

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

export function getRotationNoise(foodName: string, rotationSeed: string = "default"): number {
  // deterministic tiny perturbation to break ties differently per user/week
  const hash = hashString(`${rotationSeed}:${foodName.toLowerCase()}`);
  return (hash % 1000) / 1000; // 0.000 .. 0.999
}

export function classifyProteinRotationGroup(foodName: string): ProteinRotationGroup {
  const name = foodName.toLowerCase();

  if (name.includes("chicken") || name.includes("turkey") || name.includes("duck")) {
    return "chicken";
  }
  if (name.includes("beef") || name.includes("pork") || name.includes("lamb") || name.includes("veal")) {
    return "beef";
  }
  if (
    name.includes("salmon") ||
    name.includes("tuna") ||
    name.includes("cod") ||
    name.includes("tilapia") ||
    name.includes("sardine") ||
    name.includes("shrimp") ||
    name.includes("fish")
  ) {
    return "fish";
  }
  if (name.includes("egg")) {
    return "eggs";
  }

  return "vegetarian";
}

export function classifyCarbRotationGroup(foodName: string): CarbRotationGroup {
  const name = foodName.toLowerCase();

  if (name.includes("rice")) return "rice";
  if (name.includes("pasta") || name.includes("couscous") || name.includes("barley") || name.includes("bread") || name.includes("tortilla")) return "pasta";
  if (name.includes("oat") || name.includes("buckwheat")) return "oats";
  return "potatoes";
}

export function isVegetableForRotation(food: FoodItem): boolean {
  return food.category === CATEGORIES.vegetables && !!food.macros && food.macros.carbs < 15;
}

export class FoodRotationEngine {
  private foodUsage = new Map<string, number>();
  private proteinGroupUsage = new Map<ProteinRotationGroup, number>();
  private carbGroupUsage = new Map<CarbRotationGroup, number>();
  private vegetableUsage = new Set<string>();

  constructor(private readonly rules: FoodRotationRules = DEFAULT_FOOD_ROTATION_RULES) {}

  canUseFood(foodName: string): boolean {
    return this.getFoodUsage(foodName) < this.rules.maxPerFoodPerWeek;
  }

  getFoodUsage(foodName: string): number {
    return this.foodUsage.get(foodName) || 0;
  }

  recordFood(food: FoodItem): void {
    this.foodUsage.set(food.name, this.getFoodUsage(food.name) + 1);

    if (food.category === CATEGORIES.protein) {
      const group = classifyProteinRotationGroup(food.name);
      this.proteinGroupUsage.set(group, (this.proteinGroupUsage.get(group) || 0) + 1);
    }

    if (
      food.category === CATEGORIES.grains ||
      (food.category === CATEGORIES.vegetables && !!food.macros && food.macros.carbs >= 15)
    ) {
      const group = classifyCarbRotationGroup(food.name);
      this.carbGroupUsage.set(group, (this.carbGroupUsage.get(group) || 0) + 1);
    }

    if (isVegetableForRotation(food)) {
      this.vegetableUsage.add(food.name);
    }
  }

  getPreferredProteinGroup(): ProteinRotationGroup {
    const withCounts = PROTEIN_ROTATION_ORDER.map(group => ({
      group,
      count: this.proteinGroupUsage.get(group) || 0,
    }));

    withCounts.sort((a, b) => a.count - b.count);
    return withCounts[0].group;
  }

  getPreferredCarbGroup(): CarbRotationGroup {
    const withCounts = CARB_ROTATION_ORDER.map(group => ({
      group,
      count: this.carbGroupUsage.get(group) || 0,
    }));

    withCounts.sort((a, b) => a.count - b.count);
    return withCounts[0].group;
  }

  shouldPrioritizeNewVegetables(): boolean {
    return this.vegetableUsage.size < this.rules.minUniqueVegetablesPerWeek;
  }

  getStats() {
    return {
      foodUsage: new Map(this.foodUsage),
      proteinGroupUsage: new Map(this.proteinGroupUsage),
      carbGroupUsage: new Map(this.carbGroupUsage),
      uniqueVegetables: this.vegetableUsage.size,
      minUniqueVegetables: this.rules.minUniqueVegetablesPerWeek,
      maxPerFoodPerWeek: this.rules.maxPerFoodPerWeek,
    };
  }
}
