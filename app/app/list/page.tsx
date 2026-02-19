"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useShoppingPlan } from "../../../src/contexts/ShoppingPlanContext";
import type { AggregatedShoppingItem } from "../../../src/core/logic/aggregateShoppingList";
import type { FoodCategory } from "../../../src/core/models/FoodItem";
import { GroceryItemRow } from "../../../src/app/components/GroceryItemRow";
import { WeeklyCheckInModal } from "../../../src/app/components/WeeklyCheckInModal";
import { detectRepetitionRisk, type WeeklyFeedbackResponse, useWeeklyFeedback } from "../../../src/hooks/useWeeklyFeedback";
import { useShoppingListState } from "../../../src/hooks/useShoppingListState";
import { isPremiumUser } from "../../../src/core/premium/PremiumFeatures";
import { AppNav } from "../../components/AppNav";
import PDFExportButton from "../../components/PDFExportButton";
import ShareCardExportButton from "../../components/ShareCardExportButton";
import { useAppTranslation } from "../../lib/i18n";
import { useShoppingProgressStore } from "../../stores/shoppingProgressStore";

export default function ShoppingListRoute() {
  const { t } = useAppTranslation();
  const isPremium = isPremiumUser();
  const { weeklyPlan, shoppingList, toggleItemPurchased, history, saveAdherenceScore } = useShoppingPlan();
  const [statusMessage, setStatusMessage] = useState("");
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const cardRef = useRef<HTMLElement | null>(null);
  const { hasFeedbackForPlan, submitWeeklyFeedback } = useWeeklyFeedback();
  const isHydrated = useShoppingProgressStore((state) => state.isHydrated);
  const purchasedCountStore = useShoppingProgressStore((state) => state.purchasedCount);
  const totalCountStore = useShoppingProgressStore((state) => state.totalCount);
  const progressPercent = useShoppingProgressStore((state) => state.progressPercent);
  const setProgressCounts = useShoppingProgressStore((state) => state.setProgressCounts);

  const planDays = weeklyPlan?.days.length || 7;
  const {
    aggregatedShoppingList,
    purchasedCount,
    totalCount,
    shoppingProgress,
    toggleAggregatedItemPurchased,
    getAggregatedItemKey,
  } = useShoppingListState({
    shoppingList,
    planDays,
    toggleItemPurchased,
  });
  const groupedItems = aggregatedShoppingList.reduce<Record<string, AggregatedShoppingItem[]>>((accumulator, item) => {
    if (!accumulator[item.category]) {
      accumulator[item.category] = [];
    }

    accumulator[item.category].push(item);
    return accumulator;
  }, {});
  const prepUnlocked = shoppingProgress === 100;

  const CATEGORY_META: Record<FoodCategory, { emoji: string; label: string }> = {
    vegetables: { emoji: "🥬", label: t("shoppingList.categories.vegetables") },
    fruits: { emoji: "🍎", label: t("shoppingList.categories.fruits") },
    protein: { emoji: "🍗", label: t("shoppingList.categories.protein") },
    grains: { emoji: "🌾", label: t("shoppingList.categories.grains") },
    dairy: { emoji: "🥛", label: t("shoppingList.categories.dairy") },
    fats: { emoji: "🫒", label: t("shoppingList.categories.fats") },
    legumes: { emoji: "🫘", label: t("shoppingList.categories.legumes") },
    carbs: { emoji: "🍞", label: t("shoppingList.categories.carbs") },
    snacks: { emoji: "🍿", label: t("shoppingList.categories.snacks") },
    supplements: { emoji: "💊", label: t("shoppingList.categories.supplements") },
    others: { emoji: "📦", label: t("shoppingList.categories.others") },
  };

  const costTierMeta = {
    low: { label: t("shoppingList.costLevel.low"), emoji: "🟢" },
    medium: { label: t("shoppingList.costLevel.medium"), emoji: "🟡" },
    high: { label: t("shoppingList.costLevel.high"), emoji: "🔴" },
  } as const;

  const sortedCategories = Object.entries(groupedItems).map(([category, items]) => {
    const sorted = [...items].sort((a, b) => {
      if (a.purchased === b.purchased) return 0;
      return a.purchased ? 1 : -1;
    });

    return [category, sorted] as [string, AggregatedShoppingItem[]];
  });

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    setProgressCounts(purchasedCount, totalCount);
  }, [isHydrated, purchasedCount, setProgressCounts, totalCount]);

  useEffect(() => {
    if (!weeklyPlan) {
      return;
    }

    setShowCheckInModal(!hasFeedbackForPlan(weeklyPlan.id));
  }, [hasFeedbackForPlan, weeklyPlan]);

  const handleWeeklyFeedbackSubmit = async (response: WeeklyFeedbackResponse) => {
    if (!weeklyPlan) {
      return;
    }

    const repeatedTooMuch = detectRepetitionRisk(history.slice(0, 2));
    const { adherence } = await submitWeeklyFeedback(weeklyPlan.id, response, repeatedTooMuch);
    saveAdherenceScore(adherence);
    setShowCheckInModal(false);
  };

  if (!weeklyPlan || aggregatedShoppingList.length === 0) {
    return (
      <div className="np-shell">
        <AppNav />

        <main className="np-main shopping-list-page">
          <section className="empty-state">
            <h2>{t("shoppingList.emptyTitle")}</h2>
            <p>{t("shoppingList.emptySubtitle")}</p>
            <Link href="/app" className="btn-primary">{t("shoppingList.emptyButton")}</Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="np-shell">
      <AppNav />

      <main className="np-main shopping-list-page" ref={cardRef}>
        <header className="shopping-header">
          <div className="header-top">
            <h1 className="page-title">{t("shoppingList.pageTitle")}</h1>
            <div className="header-actions">
              <span className="items-count">
                {t("shoppingList.itemsCount", { purchased: purchasedCount, total: totalCount })}
              </span>
            </div>
          </div>

          <div className="metrics-bar">
            <div className="metric">
              <span className="metric-label">{t("shoppingList.metricProtein")}</span>
              <span className="metric-value">{Math.round(weeklyPlan.proteinTargetPerDay)}g/day</span>
            </div>
            <div className="metric">
              <span className="metric-label">{t("shoppingList.metricCostLevel")}</span>
              <span className={`cost-tier-badge cost-tier-${weeklyPlan.costTier}`}>
                {costTierMeta[weeklyPlan.costTier].emoji} {costTierMeta[weeklyPlan.costTier].label}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">{t("shoppingList.metricProgress")}</span>
              <span className="metric-value">{shoppingProgress}%</span>
            </div>
          </div>

          <p className="cost-disclaimer">{t("shoppingList.costDisclaimer")}</p>
        </header>

        {!isPremium && (
          <section className="premium-upgrade-strip" role="complementary">
            <p className="upgrade-strip-title">🔒 {t("shoppingList.upgradeTitle")}</p>
            <p className="upgrade-strip-subtitle">{t("shoppingList.upgradeSubtitle")}</p>
            <Link href="/pricing" className="upgrade-strip-btn">{t("shoppingList.upgradeButton")}</Link>
          </section>
        )}

        <section className="shopping-main">
          <div className="categories-grid">
            {sortedCategories.map(([category, items]) => {
              const meta = CATEGORY_META[category as FoodCategory] ?? { emoji: "🛒", label: category };

              return (
                <div key={category} className="category-card">
                  <h3 className="category-title">{meta.emoji} {meta.label}</h3>
                  <ul className="items-list">
                    {items.map((item) => (
                      <GroceryItemRow
                        key={getAggregatedItemKey(item)}
                        item={item}
                        onTogglePurchased={() => {
                          toggleAggregatedItemPurchased(item);
                        }}
                      />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="shopping-actions">
            {prepUnlocked && (
              <Link href="/app/prep" className="btn-prep-guide" title={t("shoppingList.startMondayPrep")}>
                🍳 {t("shoppingList.startMondayPrep")}
              </Link>
            )}

            <ShareCardExportButton targetRef={cardRef} onStatus={setStatusMessage} />
            <PDFExportButton onStatus={setStatusMessage} />
            <Link href="/app" className="btn-share-card">{t("nav.nutritionPlan")}</Link>
          </div>
        </section>

        {statusMessage ? (
          <p className="np-inline-note">{statusMessage}</p>
        ) : (
          <p className="np-muted">{t("shoppingList.shareTitle")} · {purchasedCountStore}/{totalCountStore} · {progressPercent}%</p>
        )}

        <WeeklyCheckInModal
          isOpen={showCheckInModal}
          onClose={() => setShowCheckInModal(false)}
          onSubmit={handleWeeklyFeedbackSubmit}
        />
      </main>
    </div>
  );
}
