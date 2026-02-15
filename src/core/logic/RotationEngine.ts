/**
 * PASSO 32: ROTATION ENGINE
 * ==========================
 * 
 * Prevents meal plan monotony by tracking food usage across weeks
 * and applying quadratic penalties to frequently used foods.
 * 
 * KEY FEATURES:
 * - Usage tracking per foodId
 * - Quadratic penalty: penalty = usageCount²
 * - Strong discouragement of repetition
 * - Weekly rotation reset
 * 
 * INTEGRATION:
 * - Used by MealBuilder to adjust food selection scores
 * - Lower score = higher penalty = less likely to be selected again
 */

export class RotationEngine {
  private usageMap: Map<string, number> = new Map();

  /**
   * Records that a food was used in the current rotation period
   */
  trackFoodUsage(foodId: string): void {
    const currentCount = this.usageMap.get(foodId) || 0;
    this.usageMap.set(foodId, currentCount + 1);
  }

  /**
   * Gets how many times a food has been used in current rotation period
   */
  getFoodUsageCount(foodId: string): number {
    return this.usageMap.get(foodId) || 0;
  }

  /**
   * Calculates quadratic rotation penalty
   * 
   * Formula: penalty = usageCount²
   * 
   * Examples:
   * - Never used (0): penalty = 0
   * - Used once (1): penalty = 1
   * - Used twice (2): penalty = 4
   * - Used thrice (3): penalty = 9
   * - Used 4 times (4): penalty = 16
   * 
   * This creates strong incentive to rotate foods rather than repeat
   */
  calculateRotationPenalty(usageCount: number): number {
    return usageCount * usageCount;
  }

  /**
   * Gets rotation penalty for a specific food
   */
  getPenaltyForFood(foodId: string): number {
    const usageCount = this.getFoodUsageCount(foodId);
    return this.calculateRotationPenalty(usageCount);
  }

  /**
   * Resets all usage tracking (typically called weekly)
   */
  reset(): void {
    this.usageMap.clear();
  }

  /**
   * Gets all foods currently tracked with their usage counts
   */
  getAllUsage(): Array<{ foodId: string; count: number; penalty: number }> {
    return Array.from(this.usageMap.entries()).map(([foodId, count]) => ({
      foodId,
      count,
      penalty: this.calculateRotationPenalty(count)
    }));
  }

  /**
   * Gets total number of unique foods used in rotation period
   */
  getUniqueeFoodCount(): number {
    return this.usageMap.size;
  }
}
