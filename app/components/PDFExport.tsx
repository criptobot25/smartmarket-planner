"use client";

import { useMemo } from "react";
import { useShoppingPlan } from "../../src/contexts/ShoppingPlanContext";
import { aggregateShoppingList } from "../../src/core/logic/aggregateShoppingList";
import type { FoodItem } from "../../src/core/models/FoodItem";
import { useAppTranslation } from "../lib/i18n";
import { exportShoppingListPdfNext } from "../lib/export/exportShoppingListPdfNext";

type PDFExportProps = {
  onStatus: (message: string) => void;
};

export default function PDFExport({ onStatus }: PDFExportProps) {
  const { t } = useAppTranslation();
  const { weeklyPlan, shoppingList } = useShoppingPlan();

  const planDays = weeklyPlan?.days.length || 7;
  const aggregatedList = useMemo(
    () => aggregateShoppingList(shoppingList as (FoodItem & { purchased?: boolean })[], planDays),
    [planDays, shoppingList],
  );

  const handlePdfExport = async () => {
    if (!weeklyPlan || aggregatedList.length === 0) {
      onStatus(t("shoppingList.emptySubtitle"));
      return;
    }

    const result = await exportShoppingListPdfNext({
      items: aggregatedList,
      costTier: weeklyPlan.costTier,
      totalProtein: weeklyPlan.totalProtein,
      fitnessGoal: weeklyPlan.planInput.fitnessGoal,
      savingsStatus: weeklyPlan.savingsStatus,
      substitutionsApplied: weeklyPlan.substitutionsApplied?.map((substitution) => ({
        from: substitution.from,
        to: substitution.to,
        savings: substitution.savings,
      })),
    });

    if (!result.ok && result.reason === "premium_locked") {
      onStatus(t("shoppingList.exportPdfLockedTitle"));
      return;
    }

    if (!result.ok) {
      onStatus(t("shareCard.alert.generateError"));
      return;
    }

    onStatus(t("shoppingList.exportPdfTitle"));
  };

  return (
    <button type="button" className="np-btn np-btn-secondary" onClick={handlePdfExport}>
      {t("shoppingList.exportPdf")}
    </button>
  );
}
