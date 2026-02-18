"use client";

import { create } from "zustand";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "./storageKeys";
import { runStorageMigration } from "./storageMigration";

interface PlannerState {
  isHydrated: boolean;
  activePlanId: string | null;
  lastGeneratedAt: string | null;
  setActivePlanId: (planId: string | null) => void;
  markPlanGenerated: () => void;
  hydrateFromStorage: () => void;
}

interface PlannerStoragePayload {
  activePlanId: string | null;
  lastGeneratedAt: string | null;
}

function readPlannerStorage(): PlannerStoragePayload {
  if (typeof window === "undefined") {
    return {
      activePlanId: null,
      lastGeneratedAt: null,
    };
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEYS.plannerState)
      ?? window.localStorage.getItem(LEGACY_STORAGE_KEYS.plannerState);

    if (!rawValue) {
      return {
        activePlanId: null,
        lastGeneratedAt: null,
      };
    }

    const parsed = JSON.parse(rawValue) as PlannerStoragePayload;

    return {
      activePlanId: parsed.activePlanId ?? null,
      lastGeneratedAt: parsed.lastGeneratedAt ?? null,
    };
  } catch {
    return {
      activePlanId: null,
      lastGeneratedAt: null,
    };
  }
}

export const usePlannerStore = create<PlannerState>((set) => ({
  isHydrated: false,
  activePlanId: null,
  lastGeneratedAt: null,
  setActivePlanId: (planId) => set({ activePlanId: planId }),
  markPlanGenerated: () => set({ lastGeneratedAt: new Date().toISOString() }),
  hydrateFromStorage: () => {
    if (typeof window === "undefined") {
      return;
    }

    runStorageMigration(window.localStorage);
    const persistedState = readPlannerStorage();

    set({
      ...persistedState,
      isHydrated: true,
    });
  },
}));
