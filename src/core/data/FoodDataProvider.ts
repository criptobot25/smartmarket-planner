/**
 * PASSO 37: Food Data Provider - Abstraction Layer
 * 
 * Provides a unified interface for accessing food data.
 * Current implementation uses local mockFoods database.
 * Future: Can integrate with OpenFoodFacts API or custom backend.
 * 
 * Features:
 * - Get all foods
 * - Search foods by name
 * - Filter by category, cost level, macros
 * - Add custom foods (user-added)
 * - Future-proof for API integration
 * 
 * Architecture:
 * - Abstract interface (IFoodDataProvider)
 * - Local implementation (LocalFoodProvider)
 * - Singleton instance for app-wide access
 * - Extensible for remote data sources
 */

import { FoodItem, FoodCategory, CostLevel } from "../models/FoodItem";
import { mockFoods } from "../../data/mockFoods";

/**
 * Food search/filter options
 */
export interface FoodSearchOptions {
  query?: string;                    // Search by name
  category?: FoodCategory;           // Filter by category
  costLevel?: CostLevel;             // Filter by cost tier
  minProtein?: number;               // Minimum protein per 100g
  maxPrice?: number;                 // Maximum price per unit
  excludedFoods?: string[];          // Food names to exclude
}

/**
 * Food provider interface - abstraction for data source
 * Allows switching between local mock data and remote APIs
 */
export interface IFoodDataProvider {
  /**
   * Get all foods from the database
   */
  getAllFoods(): Promise<FoodItem[]>;

  /**
   * Search and filter foods
   */
  searchFoods(options: FoodSearchOptions): Promise<FoodItem[]>;

  /**
   * Get food by ID
   */
  getFoodById(id: string): Promise<FoodItem | null>;

  /**
   * Get foods by category
   */
  getFoodsByCategory(category: FoodCategory): Promise<FoodItem[]>;

  /**
   * Get foods by cost level
   */
  getFoodsByCostLevel(costLevel: CostLevel): Promise<FoodItem[]>;

  /**
   * Add custom food (user-added)
   */
  addCustomFood(food: Omit<FoodItem, "id">): Promise<FoodItem>;

  /**
   * Get total count of foods
   */
  getFoodCount(): Promise<number>;

  /**
   * Get available categories
   */
  getCategories(): Promise<FoodCategory[]>;
}

/**
 * Local Food Provider - Uses mockFoods database
 * Default implementation for offline/local data
 */
export class LocalFoodProvider implements IFoodDataProvider {
  private foods: FoodItem[];
  private customFoods: FoodItem[] = [];
  private nextCustomId = 1000;

  constructor() {
    this.foods = [...mockFoods];
  }

  async getAllFoods(): Promise<FoodItem[]> {
    return [...this.foods, ...this.customFoods];
  }

  async searchFoods(options: FoodSearchOptions): Promise<FoodItem[]> {
    let results = await this.getAllFoods();

    // Filter by search query
    if (options.query) {
      const queryLower = options.query.toLowerCase();
      results = results.filter(food =>
        food.name.toLowerCase().includes(queryLower)
      );
    }

    // Filter by category
    if (options.category) {
      results = results.filter(food => food.category === options.category);
    }

    // Filter by cost level
    if (options.costLevel) {
      results = results.filter(food => food.costLevel === options.costLevel);
    }

    // Filter by minimum protein
    if (options.minProtein !== undefined) {
      results = results.filter(food =>
        food.macros && food.macros.protein >= options.minProtein!
      );
    }

    // Filter by maximum price
    if (options.maxPrice !== undefined) {
      results = results.filter(food => food.pricePerUnit <= options.maxPrice!);
    }

    // Exclude specific foods
    if (options.excludedFoods && options.excludedFoods.length > 0) {
      results = results.filter(food =>
        !options.excludedFoods!.includes(food.name)
      );
    }

    return results;
  }

  async getFoodById(id: string): Promise<FoodItem | null> {
    const allFoods = await this.getAllFoods();
    return allFoods.find(food => food.id === id) || null;
  }

  async getFoodsByCategory(category: FoodCategory): Promise<FoodItem[]> {
    return this.searchFoods({ category });
  }

  async getFoodsByCostLevel(costLevel: CostLevel): Promise<FoodItem[]> {
    return this.searchFoods({ costLevel });
  }

  async addCustomFood(_food: Omit<FoodItem, "id">): Promise<FoodItem> {
    const customFood: FoodItem = {
      ..._food,
      id: `custom-${this.nextCustomId++}`
    };

    this.customFoods.push(customFood);
    return customFood;
  }

  async getFoodCount(): Promise<number> {
    const allFoods = await this.getAllFoods();
    return allFoods.length;
  }

  async getCategories(): Promise<FoodCategory[]> {
    const allFoods = await this.getAllFoods();
    const categories = new Set<FoodCategory>();

    allFoods.forEach(food => {
      categories.add(food.category);
    });

    return Array.from(categories);
  }

  /**
   * Clear all custom foods (for testing)
   */
  clearCustomFoods(): void {
    this.customFoods = [];
    this.nextCustomId = 1000;
  }
}

/**
 * Future: Remote Food Provider - OpenFoodFacts API
 * Can be implemented to fetch foods from external API
 */
export class RemoteFoodProvider implements IFoodDataProvider {
  private _apiUrl: string; // Reserved for future API implementation
  private cache: Map<string, FoodItem> = new Map();

  constructor(apiUrl: string = "https://world.openfoodfacts.org/api/v0") {
    this._apiUrl = apiUrl;
  }

  async getAllFoods(): Promise<FoodItem[]> {
    // TODO: Implement API call to fetch foods
    // For now, fall back to local data
    console.warn("RemoteFoodProvider.getAllFoods() not implemented, using local data");
    return mockFoods;
  }

  async searchFoods(options: FoodSearchOptions): Promise<FoodItem[]> {
    // TODO: Implement API search
    console.warn("RemoteFoodProvider.searchFoods() not implemented, using local data");
    const provider = new LocalFoodProvider();
    return provider.searchFoods(options);
  }

  async getFoodById(id: string): Promise<FoodItem | null> {
    // Check cache first
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    // TODO: Implement API call to fetch single food
    console.warn("RemoteFoodProvider.getFoodById() not implemented, using local data");
    const provider = new LocalFoodProvider();
    return provider.getFoodById(id);
  }

  async getFoodsByCategory(category: FoodCategory): Promise<FoodItem[]> {
    return this.searchFoods({ category });
  }

  async getFoodsByCostLevel(costLevel: CostLevel): Promise<FoodItem[]> {
    return this.searchFoods({ costLevel });
  }

  async addCustomFood(_food: Omit<FoodItem, "id">): Promise<FoodItem> {
    // TODO: Implement API call to save custom food
    console.warn("RemoteFoodProvider.addCustomFood() not implemented");
    throw new Error("Remote custom food storage not implemented");
  }

  async getFoodCount(): Promise<number> {
    const allFoods = await this.getAllFoods();
    return allFoods.length;
  }

  async getCategories(): Promise<FoodCategory[]> {
    const allFoods = await this.getAllFoods();
    const categories = new Set<FoodCategory>();

    allFoods.forEach(food => {
      categories.add(food.category);
    });

    return Array.from(categories);
  }
}

/**
 * Singleton instance - default provider
 * Can be switched to RemoteFoodProvider in the future
 */
let foodProviderInstance: IFoodDataProvider = new LocalFoodProvider();

/**
 * Get the global food provider instance
 */
export function getFoodProvider(): IFoodDataProvider {
  return foodProviderInstance;
}

/**
 * Set a custom food provider (for testing or switching to API)
 */
export function setFoodProvider(provider: IFoodDataProvider): void {
  foodProviderInstance = provider;
}

/**
 * Reset to default local provider
 */
export function resetFoodProvider(): void {
  foodProviderInstance = new LocalFoodProvider();
}

/**
 * Helper: Quick search foods by name
 */
export async function searchFoodsByName(query: string): Promise<FoodItem[]> {
  const provider = getFoodProvider();
  return provider.searchFoods({ query });
}

/**
 * Helper: Get high-protein foods (>20g per 100g)
 */
export async function getHighProteinFoods(): Promise<FoodItem[]> {
  const provider = getFoodProvider();
  return provider.searchFoods({ minProtein: 20 });
}

/**
 * Helper: Get budget-friendly foods
 */
export async function getBudgetFoods(): Promise<FoodItem[]> {
  const provider = getFoodProvider();
  return provider.searchFoods({ costLevel: "low" });
}

/**
 * Helper: Get all available food categories
 */
export async function getAvailableCategories(): Promise<FoodCategory[]> {
  const provider = getFoodProvider();
  return provider.getCategories();
}

/**
 * Helper: Get total food database size
 */
export async function getTotalFoodCount(): Promise<number> {
  const provider = getFoodProvider();
  return provider.getFoodCount();
}
