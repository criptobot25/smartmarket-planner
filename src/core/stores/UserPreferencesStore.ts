/**
 * PASSO 26 - Preference Learning System (Sticky UX)
 * 
 * Learns user food preferences automatically:
 * - Tracks liked foods (selected frequently)
 * - Tracks disliked foods (excluded by user)
 * - Persists preferences in localStorage
 * - Improves meal suggestions over time
 * 
 * Scientific basis:
 * - Personalized nutrition improves adherence (Am J Clin Nutr 2019)
 * - Preference learning reduces decision fatigue
 * - Automatic adaptation increases long-term compliance
 */

export interface UserPreferences {
  likedFoods: string[];      // Food names user prefers
  dislikedFoods: string[];   // Food names user dislikes/excludes
  selectionHistory: Record<string, number>; // Food name → selection count
}

const STORAGE_KEY = "nutripilot_user_preferences";
const LEGACY_STORAGE_KEY = "smartmarket_user_preferences";
const DEFAULT_PREFERENCES: UserPreferences = {
  likedFoods: [],
  dislikedFoods: [],
  selectionHistory: {}
};

/**
 * User Preferences Store - Manages food preferences with localStorage persistence
 */
class UserPreferencesStore {
  private preferences: UserPreferences;

  constructor() {
    this.preferences = this.loadFromStorage();
  }

  /**
   * Load preferences from localStorage
   */
  private loadFromStorage(): UserPreferences {
    if (typeof window === "undefined") {
      return { ...DEFAULT_PREFERENCES };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          likedFoods: parsed.likedFoods || [],
          dislikedFoods: parsed.dislikedFoods || [],
          selectionHistory: parsed.selectionHistory || {}
        };
      }
    } catch (error) {
      console.warn("Failed to load user preferences:", error);
    }
    return { ...DEFAULT_PREFERENCES };
  }

  /**
   * Save preferences to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to save user preferences:", error);
    }
  }

  /**
   * Mark a food as disliked (user excluded it)
   */
  addDislikedFood(foodName: string): void {
    if (!this.preferences.dislikedFoods.includes(foodName)) {
      this.preferences.dislikedFoods.push(foodName);
      
      // Remove from liked if it was there
      this.preferences.likedFoods = this.preferences.likedFoods.filter(
        name => name !== foodName
      );
      
      this.saveToStorage();
    }
  }

  /**
   * Mark multiple foods as disliked
   */
  addDislikedFoods(foodNames: string[]): void {
    foodNames.forEach(name => this.addDislikedFood(name));
  }

  /**
   * Remove a food from disliked list
   */
  removeDislikedFood(foodName: string): void {
    this.preferences.dislikedFoods = this.preferences.dislikedFoods.filter(
      name => name !== foodName
    );
    this.saveToStorage();
  }

  /**
   * Track food selection (automatic preference learning)
   * After 3+ selections, food becomes "liked" (unless disliked)
   */
  trackFoodSelection(foodName: string): void {
    // Increment selection count
    const currentCount = this.preferences.selectionHistory[foodName] || 0;
    this.preferences.selectionHistory[foodName] = currentCount + 1;

    // Auto-promote to liked after 3+ selections (but NOT if disliked)
    const isDisliked = this.preferences.dislikedFoods.includes(foodName);
    if (
      currentCount + 1 >= 3 && 
      !this.preferences.likedFoods.includes(foodName) &&
      !isDisliked
    ) {
      this.preferences.likedFoods.push(foodName);
    }

    this.saveToStorage();
  }

  /**
   * Track multiple food selections
   */
  trackFoodSelections(foodNames: string[]): void {
    foodNames.forEach(name => this.trackFoodSelection(name));
  }

  /**
   * Manually mark a food as liked
   */
  addLikedFood(foodName: string): void {
    if (!this.preferences.likedFoods.includes(foodName)) {
      this.preferences.likedFoods.push(foodName);
      
      // Remove from disliked if it was there
      this.preferences.dislikedFoods = this.preferences.dislikedFoods.filter(
        name => name !== foodName
      );
      
      this.saveToStorage();
    }
  }

  /**
   * Remove a food from liked list
   */
  removeLikedFood(foodName: string): void {
    this.preferences.likedFoods = this.preferences.likedFoods.filter(
      name => name !== foodName
    );
    this.saveToStorage();
  }

  /**
   * Get all liked foods
   */
  getLikedFoods(): string[] {
    return [...this.preferences.likedFoods];
  }

  /**
   * Get all disliked foods
   */
  getDislikedFoods(): string[] {
    return [...this.preferences.dislikedFoods];
  }

  /**
   * Get selection count for a food
   */
  getSelectionCount(foodName: string): number {
    return this.preferences.selectionHistory[foodName] || 0;
  }

  /**
   * Check if food is liked
   */
  isLiked(foodName: string): boolean {
    return this.preferences.likedFoods.includes(foodName);
  }

  /**
   * Check if food is disliked
   */
  isDisliked(foodName: string): boolean {
    return this.preferences.dislikedFoods.includes(foodName);
  }

  /**
   * Calculate preference score for a food (higher = more preferred)
   * - Liked: +10
   * - Selection history: +1 per selection
   * - Disliked: -100
   */
  getPreferenceScore(foodName: string): number {
    if (this.isDisliked(foodName)) {
      return -100; // Strong negative
    }

    let score = 0;
    
    if (this.isLiked(foodName)) {
      score += 10;
    }
    
    score += this.getSelectionCount(foodName);
    
    return score;
  }

  /**
   * Clear all preferences (reset to defaults)
   */
  clearAll(): void {
    this.preferences = {
      likedFoods: [],
      dislikedFoods: [],
      selectionHistory: {}
    };
    this.saveToStorage();
  }

  /**
   * Export preferences for debugging/testing
   */
  exportPreferences(): UserPreferences {
    return JSON.parse(JSON.stringify(this.preferences));
  }

  /**
   * Import preferences (for testing/migration)
   */
  importPreferences(prefs: UserPreferences): void {
    this.preferences = {
      likedFoods: prefs.likedFoods || [],
      dislikedFoods: prefs.dislikedFoods || [],
      selectionHistory: prefs.selectionHistory || {}
    };
    this.saveToStorage();
  }
}

// Singleton instance
export const userPreferencesStore = new UserPreferencesStore();
