/**
 * PASSO 39: Premium React Hook
 * 
 * Convenient hook for accessing premium status in components
 */

import { useState, useEffect } from "react";
import {
  PremiumSubscription,
  getPremiumFeatures,
} from "../models/Premium";
import {
  getUserSubscription,
  isUserPremium,
  userHasFeature,
} from "../core/premium/PremiumProvider";

export function usePremium(userId: string) {
  const [subscription, setSubscription] = useState<PremiumSubscription | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadSubscription();
  }, [userId]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const [sub, premium] = await Promise.all([
        getUserSubscription(userId),
        isUserPremium(userId),
      ]);
      setSubscription(sub);
      setIsPremium(premium);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to load premium status:", err);
    } finally {
      setLoading(false);
    }
  };

  const features = subscription ? getPremiumFeatures(subscription) : {
    pdfExport: false,
    smartSavingsUnlimited: false,
    mealPrepGuidePrint: false,
    prioritySupport: false,
    advancedAnalytics: false,
  };

  const hasFeature = async (feature: keyof typeof features): Promise<boolean> => {
    return userHasFeature(userId, feature);
  };

  return {
    subscription,
    isPremium,
    features,
    hasFeature,
    loading,
    error,
    refresh: loadSubscription,
  };
}
