import { isFeatureEnabled } from "../config/featureFlags";

export type PremiumFeatureId =
  | "unlimitedFoodRotation"
  | "weeklyCoachAdjustments"
  | "recipePacksPrepPdf";

export interface PremiumFeatureDefinition {
  id: PremiumFeatureId;
  icon: string;
  title: string;
  valueProp: string;
  freeLimit: string;
}

const PREMIUM_STORAGE_PREFIX = "nutripilot_premium_";
const LEGACY_PREMIUM_STORAGE_PREFIX = "smartmarket_premium_";

export const PREMIUM_FEATURE_DEFINITIONS: PremiumFeatureDefinition[] = [
  {
    id: "unlimitedFoodRotation",
    icon: "🔁",
    title: "Unlimited Food Rotation",
    valueProp: "Re-roll proteins and meals every week to prevent repetition fatigue.",
    freeLimit: "Free: one default rotation only"
  },
  {
    id: "weeklyCoachAdjustments",
    icon: "🧠",
    title: "Weekly Coach Adjustments",
    valueProp: "Auto-adjust next week based on adherence and repetition feedback.",
    freeLimit: "Free: no adaptive coaching"
  },
  {
    id: "recipePacksPrepPdf",
    icon: "📚",
    title: "Recipe Packs + Meal Prep Guide PDF",
    valueProp: "Unlock premium recipe packs and export your prep guide + shopping docs.",
    freeLimit: "Free: basic recipes and no prep PDF"
  }
];

function isPremiumSubscriptionRecord(value: unknown): value is { plan?: string; status?: string } {
  return typeof value === "object" && value !== null;
}

function hasActivePremiumSubscription(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (
      !key ||
      (!key.startsWith(PREMIUM_STORAGE_PREFIX) && !key.startsWith(LEGACY_PREMIUM_STORAGE_PREFIX))
    ) {
      continue;
    }

    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        continue;
      }

      const parsed: unknown = JSON.parse(raw);
      if (!isPremiumSubscriptionRecord(parsed)) {
        continue;
      }

      const plan = parsed.plan;
      const status = parsed.status;

      if (plan === "premium" && (status === "active" || status === "trialing")) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}

export function isPremiumUser(): boolean {
  return hasActivePremiumSubscription();
}

export function hasPremiumFeature(feature: PremiumFeatureId): boolean {
  if (!isFeatureEnabled("premiumMonetizationV2")) {
    return true;
  }

  void feature;
  return isPremiumUser();
}

export function canUseUnlimitedFoodRotation(): boolean {
  return hasPremiumFeature("unlimitedFoodRotation");
}

export function canUseWeeklyCoachAdjustments(): boolean {
  return hasPremiumFeature("weeklyCoachAdjustments");
}

export function canUseRecipePacksAndPrepPdf(): boolean {
  return hasPremiumFeature("recipePacksPrepPdf");
}

export function getPremiumFeatureById(featureId: PremiumFeatureId): PremiumFeatureDefinition {
  return PREMIUM_FEATURE_DEFINITIONS.find(feature => feature.id === featureId) || PREMIUM_FEATURE_DEFINITIONS[0];
}
