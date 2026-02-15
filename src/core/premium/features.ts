/**
 * PREMIUM FEATURE FLAGS
 * 
 * Controls what features are available to free vs premium users.
 * 
 * Free tier:
 * - 1 Smart Savings optimization per week
 * - No PDF export
 * - Basic meal planning
 * 
 * Premium tier ($9.99/month):
 * - Unlimited Smart Savings optimizations
 * - PDF export for shopping lists
 * - Priority support
 * 
 * Monetization strategy:
 * Headline: "Save €20/week automatically while hitting your protein target"
 * 
 * Source: Willingness to pay for cost savings
 * https://www.mckinsey.com/industries/retail/our-insights
 */

export interface PremiumFeatures {
  freeSavingsOptimizationsPerWeek: number;
  premiumUnlimitedSavings: boolean;
  premiumPdfExport: boolean;
  isPremium: boolean;
}

/**
 * Feature flags configuration
 * In production, isPremium would come from user subscription status
 */
export const FEATURES: PremiumFeatures = {
  freeSavingsOptimizationsPerWeek: 1,
  premiumUnlimitedSavings: false,
  premiumPdfExport: false,
  isPremium: false,  // TODO: Connect to actual subscription status
};

/**
 * Track Smart Savings optimizations for free users
 * In production, this would be stored in backend with user ID + timestamp
 */
interface OptimizationUsage {
  count: number;
  lastResetDate: string; // ISO date string
}

const STORAGE_KEY = 'smartmarket_savings_usage';

/**
 * Get current optimization usage for the week
 */
export function getOptimizationUsage(): OptimizationUsage {
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (!stored) {
    return { count: 0, lastResetDate: new Date().toISOString() };
  }
  
  const usage: OptimizationUsage = JSON.parse(stored);
  
  // Check if a week has passed since last reset
  const lastReset = new Date(usage.lastResetDate);
  const now = new Date();
  const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceReset >= 7) {
    // Reset weekly counter
    return { count: 0, lastResetDate: now.toISOString() };
  }
  
  return usage;
}

/**
 * Increment optimization usage count
 */
export function incrementOptimizationUsage(): void {
  const usage = getOptimizationUsage();
  usage.count += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

/**
 * Check if user can use Smart Savings optimizer
 */
export function canUseSavingsOptimizer(): boolean {
  if (FEATURES.isPremium || FEATURES.premiumUnlimitedSavings) {
    return true;
  }
  
  const usage = getOptimizationUsage();
  return usage.count < FEATURES.freeSavingsOptimizationsPerWeek;
}

/**
 * Check if user can export to PDF
 */
export function canExportPdf(): boolean {
  return FEATURES.isPremium || FEATURES.premiumPdfExport;
}

/**
 * Get remaining free optimizations this week
 */
export function getRemainingOptimizations(): number {
  if (FEATURES.isPremium || FEATURES.premiumUnlimitedSavings) {
    return Infinity;
  }
  
  const usage = getOptimizationUsage();
  return Math.max(0, FEATURES.freeSavingsOptimizationsPerWeek - usage.count);
}
