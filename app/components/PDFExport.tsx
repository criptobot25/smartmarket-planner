"use client";

import { CATEGORIES } from "../../src/core/constants/categories";
import { useAppTranslation } from "../lib/i18n";
import { exportShoppingListPdfNext } from "../lib/export/exportShoppingListPdfNext";

type PDFExportProps = {
  onStatus: (message: string) => void;
};

export default function PDFExport({ onStatus }: PDFExportProps) {
  const { t } = useAppTranslation();

  const handlePdfExport = async () => {
    const sampleItems = [
      {
        id: "demo-protein",
        name: "Chicken breast (skinless)",
        category: CATEGORIES.protein,
        unit: "kg",
        quantity: 1,
        estimatedPrice: 7.99,
        pricePerUnit: 7.99,
        costLevel: "medium" as const,
        macros: { protein: 31, carbs: 0, fat: 3.6 },
      },
      {
        id: "demo-carb",
        name: "White rice",
        category: CATEGORIES.grains,
        unit: "kg",
        quantity: 1,
        estimatedPrice: 2.49,
        pricePerUnit: 2.49,
        costLevel: "low" as const,
        macros: { protein: 7, carbs: 77, fat: 0.6 },
      },
    ];

    const result = await exportShoppingListPdfNext({
      items: sampleItems,
      costTier: "medium",
      totalProtein: 136,
      fitnessGoal: "maintenance",
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
