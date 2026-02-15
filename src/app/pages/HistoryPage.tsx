import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShoppingPlan } from "../../contexts/ShoppingPlanContext";
import "./HistoryPage.css";

export function HistoryPage() {
  const navigate = useNavigate();
  const { history, loadHistory, clearHistory } = useShoppingPlan();

  // Carrega o histórico ao montar o componente
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleClearHistory = () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita."
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
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const dietStyleLabels = {
    healthy: "Saudável",
    balanced: "Balanceado",
    comfort: "Conforto"
  };

  const costTierLabels = {
    low: "Low cost",
    medium: "Medium cost",
    high: "High cost"
  } as const;

  return (
    <div className="history-page">
      <header className="history-header">
        <button className="btn-back" onClick={() => navigate("/")}>
          ← Voltar
        </button>
        <h1>📚 Histórico de Planos</h1>
        <p>Seus últimos 3 planejamentos</p>
      </header>

      <main className="history-main">
        {history.length === 0 ? (
          <div className="empty-history">
            <div className="empty-icon">📭</div>
            <h2>Nenhum histórico ainda</h2>
            <p>Seus planos gerados aparecerão aqui</p>
            <button className="btn-primary" onClick={() => navigate("/")}>
              Criar Primeiro Plano
            </button>
          </div>
        ) : (
          <>
            <div className="history-actions">
              <button
                className="btn-clear-history"
                onClick={handleClearHistory}
              >
                🗑️ Limpar Histórico
              </button>
            </div>

            <div className="plans-list">
              {history.map((plan, index) => (
                <div key={plan.id} className="plan-card">
                  <div className="plan-badge">
                    {index === 0 ? "Mais recente" : `#${index + 1}`}
                  </div>

                  <div className="plan-info">
                    <h3 className="plan-title">
                      Plano Semanal - {dietStyleLabels[plan.planInput.dietStyle]}
                    </h3>
                    <p className="plan-date">
                      📅 {formatDate(plan.createdAt)}
                    </p>
                  </div>

                  <div className="plan-details">
                    <div className="plan-detail-item">
                      <span className="detail-icon">👥</span>
                      <span>{plan.planInput.numberOfPeople} pessoas</span>
                    </div>
                    <div className="plan-detail-item">
                      <span className="detail-icon">💰</span>
                      <span>{costTierLabels[plan.costTier]}</span>
                    </div>
                    <div className="plan-detail-item">
                      <span className="detail-icon">🛒</span>
                      <span>{plan.shoppingList.length} itens</span>
                    </div>
                  </div>

                  {plan.planInput.restrictions.length > 0 && (
                    <div className="plan-restrictions">
                      <span className="restriction-label">Restrições:</span>
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
                      Carregar Plano
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="history-info">
              <p>
                ℹ️ O histórico guarda automaticamente os últimos 3 planos gerados.
                Planos mais antigos são removidos automaticamente.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
