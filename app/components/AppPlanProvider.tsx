"use client";

import { ShoppingPlanProvider } from "../../src/contexts/ShoppingPlanContext";

export function AppPlanProvider({ children }: { children: React.ReactNode }) {
  return <ShoppingPlanProvider>{children}</ShoppingPlanProvider>;
}
