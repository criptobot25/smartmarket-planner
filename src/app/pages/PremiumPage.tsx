import { useNavigate } from "react-router-dom";
import "./PremiumPage.css";

export function PremiumPage() {
  const navigate = useNavigate();

  return (
    <div className="premium-page">
      <header className="premium-header">
        <button className="btn-back" onClick={() => navigate("/")}>
          ← Voltar
        </button>
        <h1>✨ SmartMarket Premium</h1>
        <p className="subtitle">Planeje melhor. Economize mais.</p>
      </header>

      <main className="premium-main">
        <section className="comparison-section">
          <div className="plan-card free-plan">
            <div className="plan-header">
              <h2>Gratuito</h2>
              <div className="price">
                <span className="amount">€0</span>
                <span className="period">/mês</span>
              </div>
            </div>
            <ul className="features-list">
              <li className="included">✓ Planejamento semanal</li>
              <li className="included">✓ Lista de compras básica</li>
              <li className="included">✓ Sugestões de receitas</li>
              <li className="included">✓ Histórico de 3 planos</li>
              <li className="excluded">✗ Exportar PDF</li>
              <li className="excluded">✗ Modo Orçamento</li>
              <li className="excluded">✗ Dietas personalizadas</li>
              <li className="excluded">✗ Comparação de preços</li>
            </ul>
            <button className="btn-current" disabled>
              Plano Atual
            </button>
          </div>

          <div className="plan-card premium-plan">
            <div className="badge">🔥 Em breve</div>
            <div className="plan-header">
              <h2>Premium</h2>
              <div className="price">
                <span className="amount">€4.99</span>
                <span className="period">/mês</span>
              </div>
            </div>
            <ul className="features-list">
              <li className="included">✓ Tudo do plano gratuito</li>
              <li className="included">✓ Exportar PDF da lista</li>
              <li className="included">✓ Modo Orçamento inteligente</li>
              <li className="included">✓ Dietas personalizadas (vegana, keto, etc)</li>
              <li className="included">✓ Comparação de preços por mercado</li>
              <li className="included">✓ Histórico ilimitado</li>
              <li className="included">✓ Análise nutricional</li>
              <li className="included">✓ Suporte prioritário</li>
            </ul>
            <button className="btn-waitlist" onClick={() => alert("✅ Você será notificado quando o Premium estiver disponível!")}>
              📩 Entrar na Lista de Espera
            </button>
          </div>
        </section>

        <section className="faq-section">
          <h2>Perguntas Frequentes</h2>
          <div className="faq-item">
            <h3>Quando o Premium estará disponível?</h3>
            <p>Estamos finalizando os testes beta. Cadastre-se na lista de espera para ser notificado no lançamento.</p>
          </div>
          <div className="faq-item">
            <h3>Posso cancelar a qualquer momento?</h3>
            <p>Sim! Sem fidelidade. Cancele quando quiser e continue usando o plano gratuito.</p>
          </div>
          <div className="faq-item">
            <h3>Há desconto para pagamento anual?</h3>
            <p>Sim! Planos anuais terão 20% de desconto (€47.90/ano ao invés de €59.88).</p>
          </div>
        </section>

        <section className="cta-section">
          <h2>Comece agora gratuitamente</h2>
          <p>Experimente todas as funcionalidades básicas sem custo. Upgrade quando precisar.</p>
          <button className="btn-start" onClick={() => navigate("/")}>
            🚀 Criar Meu Primeiro Plano
          </button>
        </section>
      </main>
    </div>
  );
}
