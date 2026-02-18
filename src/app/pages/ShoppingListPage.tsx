import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShoppingPlan } from "../../contexts/ShoppingPlanContext";
import { FoodItem, FoodCategory } from "../../core/models/FoodItem";
import { aggregateShoppingList, AggregatedShoppingItem } from "../../core/logic/aggregateShoppingList";
import { exportShoppingListToPdf } from "../../utils/exportPdf";
import { canExportPdf, getRemainingOptimizations } from "../../core/premium/features";
import { PremiumModal } from "../components/PremiumModal";
import { isPremiumUser } from "../../core/premium/PremiumFeatures";
import { ShareCard } from "../components/ShareCard";
import { GroceryItemRow } from "../components/GroceryItemRow";
import { WeeklyCheckInModal } from "../components/WeeklyCheckInModal";
import { detectRepetitionRisk, useWeeklyFeedback, type WeeklyFeedbackResponse } from "../../hooks/useWeeklyFeedback";
import "./ShoppingListPage.css";

// Extensão do FoodItem para incluir purchased
interface ShoppingItem extends FoodItem {
  purchased?: boolean;
}

export function ShoppingListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isPremium = isPremiumUser();
  const { shoppingList, toggleItemPurchased, weeklyPlan, history, saveAdherenceScore } = useShoppingPlan();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState<"unlimitedFoodRotation" | "weeklyCoachAdjustments" | "recipePacksPrepPdf">("recipePacksPrepPdf");
  const [showShareCard, setShowShareCard] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const { hasFeedbackForPlan, submitWeeklyFeedback } = useWeeklyFeedback();
  const planDays = weeklyPlan?.days.length || 7;
  const aggregatedShoppingList = useMemo(
    () => aggregateShoppingList(shoppingList as ShoppingItem[], planDays),
    [shoppingList, planDays]
  );

  useEffect(() => {
    if (!weeklyPlan) return;
    setShowCheckInModal(!hasFeedbackForPlan(weeklyPlan.id));
  }, [weeklyPlan, hasFeedbackForPlan]);

  const handleWeeklyFeedbackSubmit = async (response: WeeklyFeedbackResponse) => {
    if (!weeklyPlan) return;

    const repeatedTooMuch = detectRepetitionRisk(history.slice(0, 2));
    const { adherence } = await submitWeeklyFeedback(weeklyPlan.id, response, repeatedTooMuch);
    saveAdherenceScore(adherence);
    setShowCheckInModal(false);
  };

  // Handler for PDF export
  const handlePdfExport = () => {
    if (!canExportPdf()) {
      setPremiumFeature("recipePacksPrepPdf");
      setShowPremiumModal(true);
      return;
    }

    if (weeklyPlan) {
      exportShoppingListToPdf({
        items: aggregatedShoppingList,
        costTier: weeklyPlan.costTier,
        totalProtein: weeklyPlan.totalProtein,
        savingsStatus: weeklyPlan.savingsStatus,
        substitutionsApplied: weeklyPlan.substitutionsApplied?.map(sub => ({
          from: sub.from,
          to: sub.to,
          savings: sub.savings,
        })),
        fitnessGoal: weeklyPlan.planInput.fitnessGoal || 'maintenance',
      });
    }
  };

  // Se não houver lista, redireciona para home
  if (!weeklyPlan || aggregatedShoppingList.length === 0) {
    return (
      <div className="shopping-list-page">
        <div className="empty-state">
          <h2>{t("shoppingList.emptyTitle")}</h2>
          <p>{t("shoppingList.emptySubtitle")}</p>
          <button className="btn-primary" onClick={() => navigate("/app")}>
            {t("shoppingList.emptyButton")}
          </button>
        </div>
      </div>
    );
  }

  // Agrupa itens por categoria
  const groupedItems = groupByCategory(aggregatedShoppingList);

  // Ordena itens: não comprados primeiro, depois comprados
  const sortedCategories = Object.entries(groupedItems).map(([category, items]) => {
    const sorted = [...items].sort((a, b) => {
      if (a.purchased === b.purchased) return 0;
      return a.purchased ? 1 : -1;
    });
    return [category, sorted] as [string, AggregatedShoppingItem[]];
  });

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
    others: { emoji: "📦", label: t("shoppingList.categories.others") }
  };

  const costTierMeta = {
    low: { label: t("shoppingList.costLevel.low"), emoji: "🟢" },
    medium: { label: t("shoppingList.costLevel.medium"), emoji: "🟡" },
    high: { label: t("shoppingList.costLevel.high"), emoji: "🔴" }
  } as const;
  const costTierDisplay = costTierMeta[weeklyPlan.costTier];
  const proteinPerDay = weeklyPlan.proteinTargetPerDay;
  const purchasedCount = aggregatedShoppingList.filter(item => item.purchased).length;
  const totalCount = aggregatedShoppingList.length;

  // Smart Savings optimization data
  const savingsStatus = weeklyPlan.savingsStatus;
  const substitutionsApplied = weeklyPlan.substitutionsApplied || [];
  const efficiencyScore = weeklyPlan.efficiencyScore || 0;
  const hasOptimizations = substitutionsApplied.length > 0;

  const shoppingProgress = totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;
  const shoppingCompleted = shoppingProgress === 100;
  const prepUnlocked = shoppingCompleted;

  return (
    <div className="shopping-list-page">
      {/* Sticky Header */}
      <header className="shopping-header">
        <div className="header-top">
          <h1 className="page-title">{t("shoppingList.pageTitle")}</h1>
          <div className="header-actions">
            <span className="items-count">
              {t("shoppingList.itemsCount", { purchased: purchasedCount, total: totalCount })}
            </span>
          </div>
        </div>
        
        {/* Metrics Bar */}
        <div className="metrics-bar">
          <div className="metric">
            <span className="metric-label">{t("shoppingList.metricProtein")}</span>
            <span className="metric-value">{proteinPerDay}g/day</span>
          </div>
          <div className="metric">
            <span className="metric-label">{t("shoppingList.metricCostLevel")}</span>
            <span className={`cost-tier-badge cost-tier-${weeklyPlan.costTier}`}>
              {costTierDisplay.emoji} {costTierDisplay.label}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">{t("shoppingList.metricProgress")}</span>
            <span className="metric-value">{shoppingProgress}%</span>
          </div>
        </div>

        <p className="cost-disclaimer">
          {t("shoppingList.costDisclaimer")}
        </p>
      </header>

      {/* Smart Savings Box */}
      {hasOptimizations && (
        <div className="budget-transparency">
          <div className="budget-transparency-header">
            <h3 className="savings-title">{t("shoppingList.savingsTitle")}</h3>
            <div className="budget-status">
              {savingsStatus === 'adjusted_to_savings' && (
                <>
                  <span className="status-icon">✅</span>
                  <span className="status-text">{t("shoppingList.savingsAdjusted")}</span>
                </>
              )}
              {savingsStatus === 'over_savings_minimum' && (
                <>
                  <span className="status-icon">⚠️</span>
                  <span className="status-text">{t("shoppingList.savingsOver")}</span>
                </>
              )}
              {savingsStatus === 'within_savings' && (
                <>
                  <span className="status-icon">💚</span>
                  <span className="status-text">{t("shoppingList.savingsWithin")}</span>
                </>
              )}
            </div>
          </div>

          <div className="budget-metrics">
            <div className="budget-metric">
              <span className="metric-icon">�</span>
              <div className="metric-content">
                <span className="metric-label">{t("shoppingList.metricProteinEfficiency")}</span>
                <span className="metric-value">
                  {t("shoppingList.metricProteinEfficiencyValue", { value: efficiencyScore.toFixed(1) })}
                </span>
              </div>
            </div>
            <div className="budget-metric">
              <span className="metric-icon">✅</span>
              <div className="metric-content">
                <span className="metric-label">{t("shoppingList.metricSubstitutions")}</span>
                <span className="metric-value">{substitutionsApplied.length} swaps</span>
              </div>
            </div>
          </div>

          <div className="substitutions-list">
            <h4 className="substitutions-title">{t("shoppingList.substitutionsTitle")}</h4>
            <ul className="substitutions-items">
              {substitutionsApplied.map((sub, index) => (
                <li key={index} className="substitution-item">
                  <span className="substitution-foods">
                    {sub.from} → {sub.to}
                  </span>
                  <span className="substitution-impact">
                    {sub.proteinImpact !== 0 && (
                      <span className={sub.proteinImpact > 0 ? "protein-gain" : "protein-loss"}>
                        {sub.proteinImpact > 0 ? '+' : ''}{sub.proteinImpact.toFixed(0)}g protein
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!isPremium && (
        <section className="premium-upgrade-strip" role="complementary">
          <p className="upgrade-strip-title">🔒 Premium unlocks all monetization drivers</p>
          <p className="upgrade-strip-subtitle">Unlimited Food Rotation • Weekly Coach Adjustments • Recipe Packs + Meal Prep PDF</p>
          <button className="upgrade-strip-btn" onClick={() => navigate("/pricing")}>See pricing</button>
        </section>
      )}

      {/* Categories Grid */}
      <main className="shopping-main">
        <div className="categories-grid">
          {sortedCategories.map(([category, items]) => {
            const meta = CATEGORY_META[category as FoodCategory] ?? {
              emoji: "🛒",
              label: category
            };

            return (
            <div key={category} className="category-card">
              <h3 className="category-title">
                {meta.emoji} {meta.label}
              </h3>
              <ul className="items-list">
                {items.map((item) => {
                  return (
                  <GroceryItemRow
                    key={item.id}
                    item={item}
                    onTogglePurchased={(sourceIds) => sourceIds.forEach((sourceId: string) => toggleItemPurchased(sourceId))}
                  />
                  );
                })}
              </ul>
            </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="shopping-actions">
          {prepUnlocked && (
            <button
              className="btn-prep-guide"
              onClick={() => navigate("/app/prep-guide")}
              title="Start Monday Prep"
            >
              🍳 Start Monday Prep
            </button>
          )}
          <button 
            className="btn-share-card"
            onClick={() => setShowShareCard(true)}
            title="Share your meal plan on social media"
          >
            📤 Share My Plan
          </button>
          <button 
            className={`btn-premium ${!canExportPdf() ? 'btn-locked' : ''}`}
            onClick={handlePdfExport}
            title={!canExportPdf() ? t("shoppingList.exportPdfLockedTitle") : t("shoppingList.exportPdfTitle")}
          >
            {!canExportPdf() && '🔒 '}
            {t("shoppingList.exportPdf")}
          </button>
        </div>
      </main>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature={premiumFeature}
        remainingOptimizations={getRemainingOptimizations()}
      />

      {/* Share Card Modal */}
      {showShareCard && (
        <ShareCard
          weeklyPlan={weeklyPlan}
          planInput={weeklyPlan?.planInput || null}
          onClose={() => setShowShareCard(false)}
        />
      )}

      <WeeklyCheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onSubmit={handleWeeklyFeedbackSubmit}
      />
    </div>
  );
}

// Função auxiliar para agrupar itens por categoria
function groupByCategory(items: AggregatedShoppingItem[]): Record<string, AggregatedShoppingItem[]> {
  return items.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, AggregatedShoppingItem[]>);
}
