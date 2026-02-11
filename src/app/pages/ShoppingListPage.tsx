import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShoppingPlan } from "../../contexts/ShoppingPlanContext";
import { FoodItem, FoodCategory } from "../../core/models/FoodItem";
import { formatQuantity } from "../../core/utils/formatQuantity";
import { exportShoppingListPdf } from "../../core/export/exportShoppingListPdf";
import { PremiumModal } from "../components/PremiumModal";
import "./ShoppingListPage.css";

// Extensão do FoodItem para incluir purchased
interface ShoppingItem extends FoodItem {
  purchased?: boolean;
}

// Feature flags
const FEATURES = {
  premiumPdfExport: false, // Set to true to enable PDF export
};

export function ShoppingListPage() {
  const navigate = useNavigate();
  const { shoppingList, toggleItemPurchased, weeklyPlan } = useShoppingPlan();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState("");

  // Handler for PDF export
  const handlePdfExport = () => {
    if (!FEATURES.premiumPdfExport) {
      setPremiumFeatureName("PDF Export");
      setShowPremiumModal(true);
      return;
    }

    if (weeklyPlan) {
      exportShoppingListPdf(shoppingList, {
        proteinTarget: weeklyPlan.proteinPerDay,
        totalCost: weeklyPlan.totalCost,
      });
    }
  };

  // Handler for Budget Mode (Premium)
  const handleBudgetMode = () => {
    setPremiumFeatureName("Budget Breakdown");
    setShowPremiumModal(true);
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
          <button className="btn-premium" onClick={handlePdfExport}>
            📄 Export PDF
          </button>
          <button className="btn-premium" onClick={handleBudgetMode}>
            💰 Budget Breakdown
          </button>
        </div>
      </main>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName={premiumFeatureName}
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
