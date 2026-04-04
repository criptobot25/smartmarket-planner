"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useShoppingPlan } from "../../../src/contexts/ShoppingPlanContext";
import type { AggregatedShoppingItem } from "../../../src/core/logic/aggregateShoppingList";
import type { FoodCategory } from "../../../src/core/models/FoodItem";
import type { Recipe } from "../../../src/core/models/Recipe";
import { GroceryItemRow } from "../../../src/app/components/GroceryItemRow";
import { WeeklyCheckInModal } from "../../../src/app/components/WeeklyCheckInModal";
import { detectRepetitionRisk, type WeeklyFeedbackResponse, useWeeklyFeedback } from "../../../src/hooks/useWeeklyFeedback";
import { useShoppingListState } from "../../../src/hooks/useShoppingListState";
import { isPremiumUser } from "../../../src/core/premium/PremiumFeatures";
import { getPrepFlowStatus } from "../../../src/core/logic/PrepFlowController";
import { suggestRecipes, suggestRecipesByMealType, getFullyMatchedRecipes, trackRecipeHabit } from "../../../src/core/logic/suggestRecipes";
import { assessDropoffRisk, buildPreventiveInput } from "../../../src/core/logic/predictDropoffRisk";
import { recordPreventiveAction, recordRetentionRiskSnapshot } from "../../../src/core/stores/RetentionRiskStore";
import { AppNav } from "../../components/AppNav";
import PDFExportButton from "../../components/PDFExportButton";
import ShareCardExportButton from "../../components/ShareCardExportButton";
import { useAppTranslation } from "../../lib/i18n";
import { useShoppingProgressStore } from "../../stores/shoppingProgressStore";
import { useToast } from "../../components/Toast";

export default function ShoppingListRoute() {
  const { t } = useAppTranslation();
  const { addToast } = useToast();
  const isPremium = isPremiumUser();
  const { weeklyPlan, shoppingList, toggleItemPurchased, history, saveAdherenceScore, currentInput, generatePlan, streak } = useShoppingPlan();
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

  const dropoffRisk = useMemo(() => assessDropoffRisk({
    shoppingProgress,
    adherenceScore: weeklyPlan?.adherenceScore?.score,
    streakWeeks: streak,
    confidenceScore: weeklyPlan?.shoppingValidation?.confidenceScore,
  }), [shoppingProgress, weeklyPlan?.adherenceScore?.score, weeklyPlan?.shoppingValidation?.confidenceScore, streak]);

  const handleRecipeAction = (
    recipe: Recipe,
    action: "chosen" | "executed"
  ) => {
    trackRecipeHabit(recipe, action);
    addToast(
      action === "executed"
        ? `✅ ${recipe.name} registrado como executado` 
        : `✨ ${recipe.name} priorizado nas próximas sugestões`,
      "success",
    );
  };

  const applyPreventiveMode = () => {
    if (!currentInput) {
      addToast("Gere um plano antes de ativar o modo preventivo.", "warning");
      return;
    }

    try {
      generatePlan(buildPreventiveInput(currentInput));
      recordPreventiveAction({
        levelAtAction: dropoffRisk.level,
        scoreAtAction: dropoffRisk.score,
        planId: weeklyPlan?.id,
      });
      addToast("Modo preventivo ativado: plano simplificado para manter aderência.", "success");
    } catch {
      addToast("Falha ao ativar modo preventivo. Tente novamente.", "error");
    }
  };

  useEffect(() => {
    if (!weeklyPlan) {
      return;
    }

    recordRetentionRiskSnapshot({
      planId: weeklyPlan.id,
      level: dropoffRisk.level,
      score: dropoffRisk.score,
      reasons: dropoffRisk.reasons,
      shoppingProgress,
      streakWeeks: streak,
      confidenceScore: weeklyPlan.shoppingValidation?.confidenceScore,
      adherenceScore: weeklyPlan.adherenceScore?.score,
    });
  }, [
    dropoffRisk.level,
    dropoffRisk.reasons,
    dropoffRisk.score,
    shoppingProgress,
    streak,
    weeklyPlan,
  ]);

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
            <div className="empty-state-icon">🛒</div>
            <h2>{t("shoppingList.emptyTitle")}</h2>
            <p>{t("shoppingList.emptySubtitle")}</p>
            <Link href="/app" className="btn-primary">{t("shoppingList.emptyButton")}</Link>

            <div className="empty-state-preview">
              <p className="empty-state-preview-label">O que vais ter aqui:</p>
              <ul className="empty-state-features">
                <li>Lista de compras organizada por categoria</li>
                <li>Meta de proteína diária calculada para o teu peso</li>
                <li>Sugestões de refeições com o que já compraste</li>
                <li>Guia de preparação semanal desbloqueado ao 50%</li>
                <li>Exportar lista em PDF</li>
              </ul>
            </div>
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
          {dropoffRisk.level !== "low" ? (
            <section className={`risk-alert risk-${dropoffRisk.level}`} aria-label="Risco de abandono">
              <div className="risk-alert-head">
                <p className="risk-alert-title">
                  {dropoffRisk.level === "high" ? "🚨 Risco alto de abandono" : "⚠️ Risco moderado de abandono"}
                </p>
                <span className="risk-alert-score">{dropoffRisk.score}/100</span>
              </div>
              {dropoffRisk.reasons.length > 0 ? (
                <ul className="risk-alert-reasons">
                  {dropoffRisk.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : null}
              <button type="button" className="risk-alert-action" onClick={applyPreventiveMode}>
                ⚡ Ativar plano preventivo automático
              </button>
            </section>
          ) : null}

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
                            <div className="smart-meal-row">
                              <span><strong>{recipe.name}</strong> · {recipe.prepTime} min · {recipe.ingredients.length} ingredientes</span>
                              <button type="button" className="smart-meal-action" onClick={() => handleRecipeAction(recipe, "chosen")}>Escolher</button>
                            </div>
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
                            <div className="smart-meal-row">
                              <span><strong>{recipe.name}</strong> · {recipe.mealType} · {recipe.prepTime} min</span>
                              <button type="button" className="smart-meal-action smart-meal-action-secondary" onClick={() => handleRecipeAction(recipe, "executed")}>Concluir</button>
                            </div>
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
