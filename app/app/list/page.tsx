"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppNav } from "../../components/AppNav";
import PDFExportButton from "../../components/PDFExportButton";
import ShareCardExportButton from "../../components/ShareCardExportButton";
import { useAppTranslation } from "../../lib/i18n";
import { useShoppingProgressStore } from "../../stores/shoppingProgressStore";

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

  return (
    <div className="np-shell">
      <AppNav />

      <main className="np-main">
        <section ref={cardRef} className="np-card">
          <h2>{t("shoppingList.pageTitle")}</h2>
          <p>{t("shoppingList.subtitle")}</p>

          <div className="np-kpi-grid" role="list" aria-label="Shopping overview">
            <article className="np-kpi-card" role="listitem">
              <span className="np-kpi-label">{t("shoppingList.metricProgress")}</span>
              <strong className="np-kpi-value">{progressPercent}%</strong>
              <div className="np-progress" aria-hidden="true">
                <div className="np-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </article>

            <article className="np-kpi-card" role="listitem">
              <span className="np-kpi-label">{t("shoppingList.itemsCount", { purchased: purchasedCount, total: totalCount })}</span>
              <strong className="np-kpi-value">{purchasedCount}/{totalCount}</strong>
              <span className="np-muted">{t("shoppingList.metricSubstitutions")}</span>
            </article>

            <article className="np-kpi-card" role="listitem">
              <span className="np-kpi-label">{t("shoppingList.metricProtein")}</span>
              <strong className="np-kpi-value">136g/day</strong>
              <span className="np-muted">{t("shoppingList.costDisclaimer")}</span>
            </article>
          </div>

          <div className="np-actions">
            <PDFExportButton onStatus={setStatusMessage} />
            <ShareCardExportButton targetRef={cardRef} onStatus={setStatusMessage} />
            <Link href="/app/prep-guide" className="np-btn np-btn-primary">
              {t("nav.mondayPrep")}
            </Link>
            <Link href="/app" className="np-btn np-btn-secondary">
              {t("nav.nutritionPlan")}
            </Link>
          </div>

          {statusMessage ? (
            <p className="np-inline-note">{statusMessage}</p>
          ) : (
            <p className="np-muted">{t("shoppingList.shareTitle")}</p>
          )}
        </section>
      </main>
    </div>
  );
}
