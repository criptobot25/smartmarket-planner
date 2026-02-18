import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShoppingPlan } from "../../contexts/ShoppingPlanContext";
import "./HistoryPage.css";

export function HistoryPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { history, loadHistory, clearHistory } = useShoppingPlan();

  // Carrega o histórico ao montar o componente
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleClearHistory = () => {
    const confirmed = window.confirm(
      t("history.confirmClear")
    );

    if (confirmed) {
      clearHistory();
    }
  };

  const handleLoadPlan = () => {
    // Navega para a lista de compras do plano selecionado
    // O plano já está salvo, então podemos navegar diretamente
    navigate("/list");
  };

  const formatDate = (date: Date) => {
    const locale = i18n.language === "pt" ? "pt-BR" : "en-US";

    return new Date(date).toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const dietStyleLabels = {
    healthy: t("history.dietStyle.healthy"),
    balanced: t("history.dietStyle.balanced"),
    comfort: t("history.dietStyle.comfort")
  };

  const costTierLabels = {
    low: t("shoppingList.costLevel.low"),
    medium: t("shoppingList.costLevel.medium"),
    high: t("shoppingList.costLevel.high")
  } as const;

  return (
    <div className="history-page">
      <header className="history-header">
        <button className="btn-back" onClick={() => navigate("/")}>
          ← {t("history.back")}
        </button>
        <h1>📚 {t("history.title")}</h1>
        <p>{t("history.subtitle")}</p>
      </header>

      <main className="history-main">
        {history.length === 0 ? (
          <div className="empty-history">
            <div className="empty-icon">📭</div>
            <h2>{t("history.emptyTitle")}</h2>
            <p>{t("history.emptySubtitle")}</p>
            <button className="btn-primary" onClick={() => navigate("/")}>
              {t("history.emptyButton")}
            </button>
          </div>
        ) : (
          <>
            <div className="history-actions">
              <button
                className="btn-clear-history"
                onClick={handleClearHistory}
              >
                🗑️ {t("history.clear")}
              </button>
            </div>

            <div className="plans-list">
              {history.map((plan, index) => (
                <div key={plan.id} className="plan-card">
                  <div className="plan-badge">
                    {index === 0 ? t("history.mostRecent") : `#${index + 1}`}
                  </div>

                  <div className="plan-info">
                    <h3 className="plan-title">
                      {t("history.weeklyPlanTitle", { dietStyle: dietStyleLabels[plan.planInput.dietStyle] })}
                    </h3>
                    <p className="plan-date">
                      📅 {formatDate(plan.createdAt)}
                    </p>
                  </div>

                  <div className="plan-details">
                    <div className="plan-detail-item">
                      <span className="detail-icon">🧍</span>
                      <span>{t("history.ageHeight", { age: plan.planInput.age, height: plan.planInput.heightCm })}</span>
                    </div>
                    <div className="plan-detail-item">
                      <span className="detail-icon">💰</span>
                      <span>{costTierLabels[plan.costTier]}</span>
                    </div>
                    <div className="plan-detail-item">
                      <span className="detail-icon">🛒</span>
                      <span>{t("history.items", { count: plan.shoppingList.length })}</span>
                    </div>
                  </div>

                  {plan.planInput.restrictions.length > 0 && (
                    <div className="plan-restrictions">
                      <span className="restriction-label">{t("history.restrictionsLabel")}</span>
                      {plan.planInput.restrictions.map((restriction, idx) => (
                        <span key={idx} className="restriction-tag">
                          {restriction}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="plan-actions">
                    <button
                      className="btn-load-plan"
                      onClick={handleLoadPlan}
                    >
                      {t("history.loadPlan")}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="history-info">
              <p>
                {t("history.info")}
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
