"use client";

import { useEffect } from "react";
import { usePlannerStore } from "../stores/plannerStore";
import { useShoppingProgressStore } from "../stores/shoppingProgressStore";

export function useStoreHydration(): void {
  const hydratePlannerStore = usePlannerStore((state) => state.hydrateFromStorage);
  const hydrateShoppingProgressStore = useShoppingProgressStore((state) => state.hydrateFromStorage);

  useEffect(() => {
    hydratePlannerStore();
    hydrateShoppingProgressStore();
  }, [hydratePlannerStore, hydrateShoppingProgressStore]);
}
