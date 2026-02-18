"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppNav } from "../../components/AppNav";
import { useAppTranslation } from "../../lib/i18n";
import { useShoppingProgressStore } from "../../stores/shoppingProgressStore";
import { exportShoppingListPdfNext } from "../../lib/export/exportShoppingListPdfNext";
import {
  copyShareCardImage,
  downloadShareCardImage,
  generateShareCardDataUrl,
} from "../../lib/export/shareCardExportNext";
import { CATEGORIES } from "../../../src/core/constants/categories";

export default function ShoppingListRoute() {
  const { t } = useAppTranslation();
  const [statusMessage, setStatusMessage] = useState("");
  const cardRef = useRef<HTMLElement | null>(null);
  const isHydrated = useShoppingProgressStore((state) => state.isHydrated);
  const purchasedCount = useShoppingProgressStore((state) => state.purchasedCount);
  const totalCount = useShoppingProgressStore((state) => state.totalCount);
  const progressPercent = useShoppingProgressStore((state) => state.progressPercent);
  const setProgressCounts = useShoppingProgressStore((state) => state.setProgressCounts);

  useEffect(() => {
    if (!isHydrated || totalCount > 0) {
      return;
    }

    setProgressCounts(0, 39);
  }, [isHydrated, setProgressCounts, totalCount]);

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
      setStatusMessage(t("shoppingList.exportPdfLockedTitle"));
      return;
    }

    if (!result.ok) {
      setStatusMessage(t("shareCard.alert.generateError"));
      return;
    }

    setStatusMessage(t("shoppingList.exportPdfTitle"));
  };

  const handleShareCardExport = async () => {
    if (!cardRef.current) {
      return;
    }

    const dataUrl = await generateShareCardDataUrl(cardRef.current);

    if (!dataUrl) {
      setStatusMessage(t("shareCard.alert.generateError"));
      return;
    }

    const copied = await copyShareCardImage(dataUrl);

    if (copied) {
      setStatusMessage(t("shareCard.alert.copySuccess"));
      return;
    }

    const downloaded = downloadShareCardImage(dataUrl, `nutripilot-share-card-${Date.now()}.png`);
    setStatusMessage(downloaded ? t("shareCard.download") : t("shareCard.alert.copyFailed"));
  };

  return (
    <div className="np-shell">
      <AppNav />

      <main className="np-main">
        <section ref={cardRef} className="np-card">
          <h2>{t("shoppingList.pageTitle")}</h2>
          <p>{t("shoppingList.subtitle")}</p>
          <p className="np-muted">{t("shoppingList.progress")}: {progressPercent}%</p>
          <p className="np-muted">{purchasedCount}/{totalCount}</p>

          <div className="np-actions">
            <button type="button" className="np-btn np-btn-secondary" onClick={handlePdfExport}>
              {t("shoppingList.exportPdf")}
            </button>
            <button type="button" className="np-btn np-btn-secondary" onClick={handleShareCardExport}>
              {t("shoppingList.shareButton")}
            </button>
            <Link href="/app/prep-guide" className="np-btn np-btn-primary">
              {t("nav.mondayPrep")}
            </Link>
            <Link href="/app" className="np-btn np-btn-secondary">
              {t("nav.nutritionPlan")}
            </Link>
          </div>

          {statusMessage ? <p className="np-muted">{statusMessage}</p> : null}
        </section>
      </main>
    </div>
  );
}
