"use client";

import { CostTier } from "../../../src/core/models/CostTier";
import { FoodItem } from "../../../src/core/models/FoodItem";

interface PdfSubstitution {
  from: string;
  to: string;
  savings: number;
}

export interface NextPdfExportOptions {
  items: FoodItem[];
  costTier: CostTier;
  totalProtein?: number;
  savingsStatus?: string;
  substitutionsApplied?: PdfSubstitution[];
  fitnessGoal?: string;
}

export type NextPdfExportResult =
  | { ok: true }
  | { ok: false; reason: "premium_locked" | "unavailable" | "error"; error?: unknown };

function hasBrowserRuntime(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export async function exportShoppingListPdfNext(options: NextPdfExportOptions): Promise<NextPdfExportResult> {
  if (!hasBrowserRuntime()) {
    return { ok: false, reason: "unavailable" };
  }

  try {
    const { canExportPdf } = await import("../../../src/core/premium/features");

    if (!canExportPdf()) {
      return { ok: false, reason: "premium_locked" };
    }

    const { exportShoppingListToPdf } = await import("../../../src/utils/exportPdf");
    exportShoppingListToPdf(options);
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: "error", error };
  }
}
