"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useShoppingPlan } from "../../../src/contexts/ShoppingPlanContext";
import { aggregateShoppingList } from "../../../src/core/logic/aggregateShoppingList";
import type { AggregatedShoppingItem } from "../../../src/core/logic/aggregateShoppingList";
import type { FoodItem } from "../../../src/core/models/FoodItem";
import { GroceryItemRow } from "../../../src/app/components/GroceryItemRow";
import { AppNav } from "../../components/AppNav";
import PDFExportButton from "../../components/PDFExportButton";
import ShareCardExportButton from "../../components/ShareCardExportButton";
import { useAppTranslation } from "../../lib/i18n";
import { useShoppingProgressStore } from "../../stores/shoppingProgressStore";

export default function ShoppingListRoute() {
  const { t } = useAppTranslation();
  const { weeklyPlan, shoppingList, toggleItemPurchased } = useShoppingPlan();
  const [statusMessage, setStatusMessage] = useState("");
  const cardRef = useRef<HTMLElement | null>(null);
  const isHydrated = useShoppingProgressStore((state) => state.isHydrated);
  const purchasedCountStore = useShoppingProgressStore((state) => state.purchasedCount);
  const totalCountStore = useShoppingProgressStore((state) => state.totalCount);
  const progressPercent = useShoppingProgressStore((state) => state.progressPercent);
  const setProgressCounts = useShoppingProgressStore((state) => state.setProgressCounts);

  const planDays = weeklyPlan?.days.length || 7;
  const aggregatedShoppingList = aggregateShoppingList(shoppingList as (FoodItem & { purchased?: boolean })[], planDays);
  const groupedItems = aggregatedShoppingList.reduce<Record<string, AggregatedShoppingItem[]>>((accumulator, item) => {
    if (!accumulator[item.category]) {
      accumulator[item.category] = [];
    }

    accumulator[item.category].push(item);
    return accumulator;
  }, {});

  const purchasedCount = aggregatedShoppingList.filter((item) => item.purchased).length;
  const totalCount = aggregatedShoppingList.length;

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    setProgressCounts(purchasedCount, totalCount);
  }, [isHydrated, purchasedCount, setProgressCounts, totalCount]);

  if (!weeklyPlan || aggregatedShoppingList.length === 0) {
    return (
      <div className="np-shell">
        <AppNav />

        <main className="np-main">
          <section className="np-card">
            <h2>{t("shoppingList.emptyTitle")}</h2>
            <p>{t("shoppingList.emptySubtitle")}</p>
            <div className="np-actions">
              <Link href="/app" className="np-btn np-btn-primary">
                {t("shoppingList.emptyButton")}
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

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
              <strong className="np-kpi-value">{Math.round(weeklyPlan.proteinTargetPerDay)}g/day</strong>
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

          <div className="np-category-grid" role="list" aria-label="Grocery categories">
            {Object.entries(groupedItems).map(([category, items]) => (
              <article key={category} className="np-category-card" role="listitem">
                <h3>{t(`shoppingList.categories.${category}`)}</h3>
                <ul className="np-item-list">
                  {items.map((item) => (
                    <GroceryItemRow
                      key={item.id}
                      item={item}
                      onTogglePurchased={(sourceIds) => {
                        sourceIds.forEach((sourceId) => toggleItemPurchased(sourceId));
                      }}
                    />
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {statusMessage ? (
            <p className="np-inline-note">{statusMessage}</p>
          ) : (
            <p className="np-muted">{t("shoppingList.shareTitle")} · {purchasedCountStore}/{totalCountStore}</p>
          )}
        </section>
      </main>
    </div>
  );
}
