import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const { shoppingList, toggleItemPurchased, weeklyPlan } = useShoppingPlan();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState<'budget' | 'pdf'>('pdf');

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
        totalCost: weeklyPlan.totalCost,
        totalProtein: weeklyPlan.totalProtein,
        budgetStatus: weeklyPlan.budgetStatus,
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
          <h2>📋 Nenhuma lista encontrada</h2>
          <p>Gere um plano primeiro!</p>
          <button className="btn-primary" onClick={() => navigate("/")}>
            Voltar ao Início
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

  const categoryLabels: Record<FoodCategory, string> = {
    vegetables: "🥬 Vegetais",
    fruits: "🍎 Frutas",
    proteins: "🍗 Proteínas",
    grains: "🌾 Grãos",
    dairy: "🥛 Laticínios",
    oils: "🫒 Óleos",
    spices: "🌶️ Temperos",
    beverages: "🥤 Bebidas",
    others: "📦 Outros"
  };

  // Use budget-adjusted cost (changes based on budget/people/goal)
  const totalCost = weeklyPlan.budgetAdjustedCost ?? weeklyPlan.totalCost;
  const proteinPerDay = weeklyPlan.proteinPerDay;
  const purchasedCount = shoppingList.filter(item => (item as ShoppingItem).purchased).length;
  const totalCount = shoppingList.length;

  // Budget optimization data
  const budgetStatus = weeklyPlan.budgetStatus;
  const substitutionsApplied = weeklyPlan.substitutionsApplied || [];
  const efficiencyScore = weeklyPlan.efficiencyScore || 0;
  const originalBudget = weeklyPlan.planInput.budget;
  const totalSavings = substitutionsApplied.reduce((sum, sub) => sum + sub.savings, 0);
  const hasOptimizations = substitutionsApplied.length > 0;

  return (
    <div className="shopping-list-page">
      {/* Sticky Header */}
      <header className="shopping-header">
        <div className="header-top">
          <h1 className="page-title">Shopping List</h1>
          <div className="header-actions">
            <span className="items-count">{purchasedCount} / {totalCount} items</span>
          </div>
        </div>
        
        {/* Metrics Bar */}
        <div className="metrics-bar">
          <div className="metric">
            <span className="metric-label">Protein Target</span>
            <span className="metric-value">{proteinPerDay}g/day</span>
          </div>
          <div className="metric">
            <span className="metric-label">Total Cost</span>
            <span className="metric-value">€{totalCost.toFixed(2)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Progress</span>
            <span className="metric-value">{Math.round((purchasedCount / totalCount) * 100)}%</span>
          </div>
        </div>
      </header>

      {/* Budget Transparency Box */}
      {hasOptimizations && (
        <div className="budget-transparency">
          <div className="budget-transparency-header">
            <div className="budget-status">
              {budgetStatus === 'adjusted_to_fit' && (
                <>
                  <span className="status-icon">✅</span>
                  <span className="status-text">Adjusted to fit €{originalBudget.toFixed(2)} budget</span>
                </>
              )}
              {budgetStatus === 'over_budget_minimum' && (
                <>
                  <span className="status-icon">⚠️</span>
                  <span className="status-text">Optimized to minimum cost (budget: €{originalBudget.toFixed(2)})</span>
                </>
              )}
              {budgetStatus === 'within_budget' && (
                <>
                  <span className="status-icon">💚</span>
                  <span className="status-text">Within budget</span>
                </>
              )}
            </div>
          </div>

          <div className="budget-metrics">
            <div className="budget-metric">
              <span className="metric-icon">💰</span>
              <div className="metric-content">
                <span className="metric-label">Saved</span>
                <span className="metric-value">€{totalSavings.toFixed(2)}/week</span>
              </div>
            </div>
            <div className="budget-metric">
              <span className="metric-icon">📊</span>
              <div className="metric-content">
                <span className="metric-label">Protein efficiency</span>
                <span className="metric-value">{efficiencyScore.toFixed(1)}g/€</span>
              </div>
            </div>
          </div>

          <div className="substitutions-list">
            <h4 className="substitutions-title">Smart substitutions:</h4>
            <ul className="substitutions-items">
              {substitutionsApplied.map((sub, index) => (
                <li key={index} className="substitution-item">
                  <span className="substitution-foods">
                    {sub.from} → {sub.to}
                  </span>
                  <span className="substitution-impact">
                    {sub.savings > 0 && `€${sub.savings.toFixed(2)}`}
                    {sub.proteinImpact !== 0 && (
                      <span className={sub.proteinImpact > 0 ? "protein-gain" : "protein-loss"}>
                        {sub.proteinImpact > 0 ? '+' : ''}{sub.proteinImpact.toFixed(0)}g
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <main className="shopping-main">
        <div className="categories-grid">
          {sortedCategories.map(([category, items]) => (
            <div key={category} className="category-card">
              <h3 className="category-title">
                {categoryLabels[category as FoodCategory]}
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
                        €{item.estimatedPrice.toFixed(2)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="shopping-actions">
          <button 
            className={`btn-premium ${!canExportPdf() ? 'btn-locked' : ''}`}
            onClick={handlePdfExport}
            title={!canExportPdf() ? 'Premium feature - Upgrade to export PDF' : 'Export shopping list to PDF'}
          >
            {!canExportPdf() && '🔒 '}
            📄 Export PDF
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
