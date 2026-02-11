import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShoppingPlan } from "../../contexts/ShoppingPlanContext";
import { FoodItem, FoodCategory } from "../../core/models/FoodItem";
import { formatQuantity } from "../../core/utils/formatQuantity";
import "./ShoppingListPage.css";

// Extensão do FoodItem para incluir purchased
interface ShoppingItem extends FoodItem {
  purchased?: boolean;
}

export function ShoppingListPage() {
  const navigate = useNavigate();
  const { shoppingList, toggleItemPurchased, weeklyPlan } = useShoppingPlan();
  const [marketMode, setMarketMode] = useState(false);

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

  const totalCost = weeklyPlan.totalCost;
  const proteinPerDay = weeklyPlan.proteinPerDay;
  const purchasedCount = shoppingList.filter(item => (item as ShoppingItem).purchased).length;
  const totalCount = shoppingList.length;

  return (
    <div className={`shopping-list-page ${marketMode ? "market-mode" : ""}`}>
      {!marketMode && (
        <header className="shopping-header">
          <button className="btn-back" onClick={() => navigate("/")}>
            ← Voltar
          </button>
          <h1>📝 Lista de Compras</h1>
          
          {/* FITNESS TARGET + COST */}
          <div className="plan-summary">
            <div className="summary-item">
              <span className="summary-label">🎯 Proteína/dia</span>
              <span className="summary-value">{proteinPerDay}g</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-item">
              <span className="summary-label">💰 Custo Estimado</span>
              <span className="summary-value">€{totalCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="shopping-stats">
            <span>{purchasedCount} / {totalCount} itens</span>
          </div>
        </header>
      )}

      <main className="shopping-main">
        {!marketMode && (
          <div className="market-mode-toggle">
            <button
              className="btn-market-mode"
              onClick={() => setMarketMode(true)}
            >
              🛒 Entrar no Modo Mercado
            </button>
          </div>
        )}

        {marketMode && (
          <div className="market-mode-header">
            <h2>🛒 Modo Mercado</h2>
            <button
              className="btn-exit-market"
              onClick={() => setMarketMode(false)}
            >
              ✕ Sair
            </button>
          </div>
        )}

        <div className="items-container">
          {sortedCategories.map(([category, items]) => (
            <div key={category} className="category-section">
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
                    {!marketMode && item.estimatedPrice && (
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

        {!marketMode && (
          <div className="shopping-actions">
            <button className="btn-secondary" onClick={() => navigate("/plan")}>
              Ver Plano Semanal
            </button>
            <div className="premium-features">
              <button className="btn-premium" onClick={() => alert("🔒 Premium - Em breve! Cadastre-se na lista de espera.")}>
                📄 Exportar PDF (Premium)
              </button>
              <button className="btn-premium" onClick={() => alert("🔒 Premium - Em breve! Cadastre-se na lista de espera.")}>
                💰 Modo Orçamento (Premium)
              </button>
            </div>
          </div>
        )}
      </main>
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
