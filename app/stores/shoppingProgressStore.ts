"use client";

import { create } from "zustand";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "./storageKeys";
import { runStorageMigration } from "./storageMigration";

interface ShoppingProgressState {
  isHydrated: boolean;
  purchasedCount: number;
  totalCount: number;
  progressPercent: number;
  setProgressCounts: (purchasedCount: number, totalCount: number) => void;
  hydrateFromStorage: () => void;
  reset: () => void;
}

interface ShoppingProgressPayload {
  purchasedCount: number;
  totalCount: number;
}

function calculateProgress(purchasedCount: number, totalCount: number): number {
  if (totalCount <= 0) {
    return 0;
  }

  return Math.round((purchasedCount / totalCount) * 100);
}

function readShoppingProgressStorage(): ShoppingProgressPayload {
  if (typeof window === "undefined") {
    return {
      purchasedCount: 0,
      totalCount: 0,
    };
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEYS.shoppingProgress)
      ?? window.localStorage.getItem(LEGACY_STORAGE_KEYS.shoppingProgress);

    if (!rawValue) {
      return {
        purchasedCount: 0,
        totalCount: 0,
      };
    }

    const parsed = JSON.parse(rawValue) as ShoppingProgressPayload;

    return {
      purchasedCount: Number.isFinite(parsed.purchasedCount) ? parsed.purchasedCount : 0,
      totalCount: Number.isFinite(parsed.totalCount) ? parsed.totalCount : 0,
    };
  } catch {
    return {
      purchasedCount: 0,
      totalCount: 0,
    };
  }
}

export const useShoppingProgressStore = create<ShoppingProgressState>((set) => ({
  isHydrated: false,
  purchasedCount: 0,
  totalCount: 0,
  progressPercent: 0,
  setProgressCounts: (purchasedCount, totalCount) => {
    set({
      purchasedCount,
      totalCount,
      progressPercent: calculateProgress(purchasedCount, totalCount),
    });
  },
  hydrateFromStorage: () => {
    if (typeof window === "undefined") {
      return;
    }

    runStorageMigration(window.localStorage);
    const persistedState = readShoppingProgressStorage();

    set({
      ...persistedState,
      progressPercent: calculateProgress(persistedState.purchasedCount, persistedState.totalCount),
      isHydrated: true,
    });
  },
  reset: () => {
    set({
      purchasedCount: 0,
      totalCount: 0,
      progressPercent: 0,
    });
  },
}));
