"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useShoppingPlan } from "../../../src/contexts/ShoppingPlanContext";
import type { AggregatedShoppingItem } from "../../../src/core/logic/aggregateShoppingList";
import type { FoodCategory } from "../../../src/core/models/FoodItem";
import { GroceryItemRow } from "../../../src/app/components/GroceryItemRow";
import { WeeklyCheckInModal } from "../../../src/app/components/WeeklyCheckInModal";
import { detectRepetitionRisk, type WeeklyFeedbackResponse, useWeeklyFeedback } from "../../../src/hooks/useWeeklyFeedback";
import { useShoppingListState } from "../../../src/hooks/useShoppingListState";
import { isPremiumUser } from "../../../src/core/premium/PremiumFeatures";
import { getPrepFlowStatus } from "../../../src/core/logic/PrepFlowController";
import { suggestRecipes, suggestRecipesByMealType, getFullyMatchedRecipes } from "../../../src/core/logic/suggestRecipes";
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
  const prepFlow = getPrepFlowStatus(shoppingProgress);
  const prepUnlocked = prepFlow.unlocked;

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

  const purchasedItems = aggregatedShoppingList.filter((item) => item.purchased);
  const fullyMatchedRecipes = getFullyMatchedRecipes(purchasedItems);
  const fallbackRecipes = suggestRecipes(purchasedItems);

  const currentMealType: "breakfast" | "lunch" | "dinner" | "snack" = (() => {
    const hour = new Date().getHours();
    if (hour < 10) return "breakfast";
    if (hour < 15) return "lunch";
    if (hour < 20) return "dinner";
    return "snack";
  })();

  const nextMealSuggestions = suggestRecipesByMealType(purchasedItems, currentMealType, 2);
  const rescueSuggestions = (fullyMatchedRecipes.length > 0 ? fullyMatchedRecipes : fallbackRecipes).slice(0, 3);

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

          {weeklyPlan.shoppingValidation ? (
            <section className="shopping-confidence" aria-label="Shopping list consistency score">
              <div className="shopping-confidence-head">
                <p className="shopping-confidence-title">✅ Consistência da Lista</p>
                <span className="shopping-confidence-score">{weeklyPlan.shoppingValidation.confidenceScore}/100</span>
              </div>
              <p className="shopping-confidence-summary">{weeklyPlan.shoppingValidation.summary}</p>
              <div className="shopping-confidence-metrics">
                <span>Cobertura do plano: {weeklyPlan.shoppingValidation.checks.plannedFoodsCoveredPercent}%</span>
                <span>Proteína/meta: {weeklyPlan.shoppingValidation.checks.proteinCoveragePercent}%</span>
                <span>Itens explicados: {weeklyPlan.shoppingValidation.checks.itemsWithReasonPercent}%</span>
              </div>
              {weeklyPlan.shoppingValidation.issues.length > 0 ? (
                <ul className="shopping-confidence-issues">
                  {weeklyPlan.shoppingValidation.issues.slice(0, 3).map((issue) => (
                    <li key={issue.code} className={`issue-${issue.severity}`}>
                      {issue.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}
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

          <section className="smart-meal-section" aria-label="Smart meal suggestions from purchased items">
            <div className="smart-meal-header">
              <h3>🧠 Sugestões Inteligentes com o que você já comprou</h3>
              <span className="smart-meal-chip">Comprados: {purchasedCount}/{totalCount}</span>
            </div>

            {purchasedItems.length === 0 ? (
              <p className="smart-meal-empty">Marque os itens comprados para receber sugestões reais de refeição.</p>
            ) : (
              <>
                <div className="smart-meal-grid">
                  <article className="smart-meal-card">
                    <p className="smart-meal-label">⚡ O que comer agora ({currentMealType})</p>
                    {nextMealSuggestions.length > 0 ? (
                      <ul className="smart-meal-list">
                        {nextMealSuggestions.map((recipe) => (
                          <li key={recipe.id}>
                            <strong>{recipe.name}</strong> · {recipe.prepTime} min · {recipe.ingredients.length} ingredientes
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="smart-meal-empty-small">Ainda faltam itens para uma recomendação imediata desse horário.</p>
                    )}
                  </article>

                  <article className="smart-meal-card">
                    <p className="smart-meal-label">🛟 Modo Resgate do Dia</p>
                    {rescueSuggestions.length > 0 ? (
                      <ul className="smart-meal-list">
                        {rescueSuggestions.map((recipe) => (
                          <li key={recipe.id}>
                            <strong>{recipe.name}</strong> · {recipe.mealType} · {recipe.prepTime} min
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="smart-meal-empty-small">Sem sugestões no momento.</p>
                    )}
                  </article>
                </div>

                <p className="smart-meal-note">
                  As sugestões priorizam itens já comprados e tentam reduzir desperdício sem fugir da sua meta.
                </p>
              </>
            )}
          </section>

          <div className="shopping-actions">
            {prepUnlocked ? (
              <Link href="/app/prep" className="btn-prep-guide" title={t("shoppingList.startMondayPrep")}>
                🍳 {t("shoppingList.startMondayPrep")}
              </Link>
            ) : (
              <button
                type="button"
                className="btn-prep-guide"
                disabled
                title={t("shoppingList.prepUnlockAt", { threshold: prepFlow.unlockThreshold })}
                aria-label={t("shoppingList.prepLockedAria", { threshold: prepFlow.unlockThreshold })}
              >
                🔒 {t("shoppingList.startMondayPrep")} ({prepFlow.progressPercent}%/{prepFlow.unlockThreshold}%)
              </button>
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
