"use client";

import { useEffect } from "react";
import { usePlannerStore } from "../stores/plannerStore";
import { useShoppingProgressStore } from "../stores/shoppingProgressStore";
import { STORAGE_KEYS } from "../stores/storageKeys";

export function useStorePersistence(): void {
  const plannerIsHydrated = usePlannerStore((state) => state.isHydrated);
  const activePlanId = usePlannerStore((state) => state.activePlanId);
  const lastGeneratedAt = usePlannerStore((state) => state.lastGeneratedAt);

  const shoppingIsHydrated = useShoppingProgressStore((state) => state.isHydrated);
  const purchasedCount = useShoppingProgressStore((state) => state.purchasedCount);
  const totalCount = useShoppingProgressStore((state) => state.totalCount);

  useEffect(() => {
    if (typeof window === "undefined" || !plannerIsHydrated) {
      return;
    }

    const payload = {
      activePlanId,
      lastGeneratedAt,
    };

    window.localStorage.setItem(STORAGE_KEYS.plannerState, JSON.stringify(payload));
  }, [activePlanId, lastGeneratedAt, plannerIsHydrated]);

  useEffect(() => {
    if (typeof window === "undefined" || !shoppingIsHydrated) {
      return;
    }

    const payload = {
      purchasedCount,
      totalCount,
    };

    window.localStorage.setItem(STORAGE_KEYS.shoppingProgress, JSON.stringify(payload));
  }, [purchasedCount, shoppingIsHydrated, totalCount]);
}
