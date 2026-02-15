import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShoppingPlan } from "../../contexts/ShoppingPlanContext";
import { FoodItem, FoodCategory } from "../../core/models/FoodItem";
import { formatQuantity } from "../../core/utils/formatQuantity";
import { exportShoppingListToPdf } from "../../utils/exportPdf";
import { canExportPdf, getRemainingOptimizations } from "../../core/premium/features";
import { PremiumModal } from "../components/PremiumModal";
import "./ShoppingListPage.css";

// Extensão do FoodItem para incluir purchased
interface ShoppingItem extends FoodItem {
  purchased?: boolean;
}

export function ShoppingListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { shoppingList, toggleItemPurchased, weeklyPlan } = useShoppingPlan();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState<'savings' | 'pdf'>('pdf');

  // Handler for PDF export
  const handlePdfExport = () => {
    if (!canExportPdf()) {
      setPremiumFeature('pdf');
      setShowPremiumModal(true);
      return;
    }

    if (weeklyPlan) {
      exportShoppingListToPdf({
        items: shoppingList,
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
  if (!weeklyPlan || shoppingList.length === 0) {
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
  const groupedItems = groupByCategory(shoppingList as ShoppingItem[]);

  // Ordena itens: não comprados primeiro, depois comprados
  const sortedCategories = Object.entries(groupedItems).map(([category, items]) => {
    const sorted = [...items].sort((a, b) => {
      if (a.purchased === b.purchased) return 0;
      return a.purchased ? 1 : -1;
    });
    return [category, sorted] as [string, ShoppingItem[]];
  });

  const CATEGORY_META: Record<FoodCategory, { emoji: string; label: string }> = {
    vegetables: { emoji: "🥬", label: t("shoppingList.categories.vegetables") },
    fruits: { emoji: "🍎", label: t("shoppingList.categories.fruits") },
    proteins: { emoji: "🍗", label: t("shoppingList.categories.proteins") },
    grains: { emoji: "🌾", label: t("shoppingList.categories.grains") },
    dairy: { emoji: "🥛", label: t("shoppingList.categories.dairy") },
    oils: { emoji: "🫒", label: t("shoppingList.categories.oils") },
    spices: { emoji: "🌶️", label: t("shoppingList.categories.spices") },
    beverages: { emoji: "🥤", label: t("shoppingList.categories.beverages") },
    others: { emoji: "📦", label: t("shoppingList.categories.others") }
  };

  const costTierMeta = {
    low: { label: t("shoppingList.costLevel.low"), emoji: "🟢" },
    medium: { label: t("shoppingList.costLevel.medium"), emoji: "🟡" },
    high: { label: t("shoppingList.costLevel.high"), emoji: "🔴" }
  } as const;
  const costTierDisplay = costTierMeta[weeklyPlan.costTier];
  const proteinPerDay = weeklyPlan.proteinTargetPerDay;
  const purchasedCount = shoppingList.filter(item => (item as ShoppingItem).purchased).length;
  const totalCount = shoppingList.length;

  // Smart Savings optimization data
  const savingsStatus = weeklyPlan.savingsStatus;
  const substitutionsApplied = weeklyPlan.substitutionsApplied || [];
  const efficiencyScore = weeklyPlan.efficiencyScore || 0;
  const hasOptimizations = substitutionsApplied.length > 0;

  // PASSO 27: Meal prep summary
  const mealPrepSummary = weeklyPlan.mealPrepSummary;
  const [showMealPrep, setShowMealPrep] = useState(false);

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
            <span className="metric-value">{Math.round((purchasedCount / totalCount) * 100)}%</span>
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

      {/* PASSO 27: Meal Prep Summary */}
      {mealPrepSummary && (
        <div className="meal-prep-section">
          <div className="meal-prep-header" onClick={() => setShowMealPrep(!showMealPrep)}>
            <h3 className="meal-prep-title">
              🍱 Sunday Meal Prep Guide
              <span className="meal-prep-time">({mealPrepSummary.totalPrepTime})</span>
            </h3>
            <button className="toggle-btn">
              {showMealPrep ? '▼' : '▶'}
            </button>
          </div>

          {showMealPrep && (
            <div className="meal-prep-content">
              {/* Batch summaries */}
              <div className="prep-batches">
                {mealPrepSummary.proteinBatches.length > 0 && (
                  <div className="batch-group">
                    <h4>🍗 Proteins</h4>
                    <ul>
                      {mealPrepSummary.proteinBatches.map((batch, i) => (
                        <li key={i}>{batch}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {mealPrepSummary.grainBatches.length > 0 && (
                  <div className="batch-group">
                    <h4>🌾 Grains</h4>
                    <ul>
                      {mealPrepSummary.grainBatches.map((batch, i) => (
                        <li key={i}>{batch}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {mealPrepSummary.vegetableBatches.length > 0 && (
                  <div className="batch-group">
                    <h4>🥬 Vegetables</h4>
                    <ul>
                      {mealPrepSummary.vegetableBatches.map((batch, i) => (
                        <li key={i}>{batch}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Step-by-step instructions */}
              <div className="prep-steps">
                <h4>📋 Step-by-Step Instructions</h4>
                <ol className="steps-list">
                  {mealPrepSummary.sundayPrepList.map((step) => (
                    <li key={step.order} className="prep-step">
                      <div className="step-header">
                        <span className="step-number">{step.order}</span>
                        <span className="step-action">{step.action}</span>
                        <span className="step-time">{step.estimatedTime}</span>
                      </div>
                      <div className="step-content">
                        <strong>{step.quantity}</strong>
                        <p>{step.instructions}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Meal prep tips */}
              {mealPrepSummary.tips.length > 0 && (
                <div className="prep-tips">
                  <h4>💡 Meal Prep Tips</h4>
                  <ul className="tips-list">
                    {mealPrepSummary.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
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
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={`item ${item.purchased ? "purchased" : ""}`}
                    onClick={() => toggleItemPurchased(item.id)}
                  >
                    <div className="item-checkbox">
                      {item.purchased ? "✓" : "○"}
                    </div>
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">
                        {formatQuantity(item.name, item.quantity, item.unit as "kg" | "unit" | "pack" | "can")}
                      </span>
                      {item.reason && (
                        <span className="item-reason">{item.reason}</span>
                      )}
                    </div>
                    {item.estimatedPrice && (
                      <div className="item-price">
                        {item.estimatedPrice.toFixed(2)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="shopping-actions">
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
    </div>
  );
}

// Função auxiliar para agrupar itens por categoria
function groupByCategory(items: ShoppingItem[]): Record<string, ShoppingItem[]> {
  return items.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);
}
