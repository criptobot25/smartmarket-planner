import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useShoppingPlan } from "../../contexts/ShoppingPlanContext";
import { DietStyle } from "../../core/models/PlanInput";
import "./PlannerPage.css";

export function PlannerPage() {
  const navigate = useNavigate();
  const { generatePlan } = useShoppingPlan();

  const [numberOfPeople, setNumberOfPeople] = useState<number>(2);
  const [dietStyle, setDietStyle] = useState<DietStyle>("balanced");
  const [budget, setBudget] = useState<number>(300);
  const [restrictions, setRestrictions] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Valida inputs
    if (numberOfPeople < 1) {
      alert("O número de pessoas deve ser pelo menos 1");
      return;
    }

    if (budget < 0) {
      alert("O orçamento deve ser positivo");
      return;
    }

    // Converte restrições de string para array
    const restrictionsArray = restrictions
      .split(",")
      .map(r => r.trim())
      .filter(r => r.length > 0);

    // Gera o plano
    try {
      generatePlan({
        numberOfPeople,
        dietStyle,
        budget,
        restrictions: restrictionsArray
      });

      // Navega para a página da lista
      navigate("/list");
    } catch (error) {
      console.error("Erro ao gerar plano:", error);
      alert("Erro ao gerar o plano. Tente novamente.");
    }
  };

  return (
    <div className="planner-page">
      <header className="planner-header">
        <h1>🛒 SmartMarket Planner</h1>
        <p>Planeje suas refeições e economize!</p>
      </header>

      <main className="planner-main">
        <form className="planner-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="people">
              👥 Número de pessoas
            </label>
            <input
              type="number"
              id="people"
              min="1"
              max="10"
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(Number(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="diet-style">
              🥗 Estilo de alimentação
            </label>
            <select
              id="diet-style"
              value={dietStyle}
              onChange={(e) => setDietStyle(e.target.value as DietStyle)}
              required
            >
              <option value="healthy">Saudável</option>
              <option value="balanced">Balanceado</option>
              <option value="comfort">Conforto</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="budget">
              💰 Orçamento semanal (R$)
            </label>
            <input
              type="number"
              id="budget"
              min="0"
              step="10"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="restrictions">
              🚫 Restrições alimentares (separadas por vírgula)
            </label>
            <input
              type="text"
              id="restrictions"
              placeholder="Ex: lactose, glúten, frango"
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
            />
            <small>Opcional. Separe múltiplas restrições por vírgula.</small>
          </div>

          <button type="submit" className="btn-primary">
            Gerar Plano Semanal
          </button>
        </form>

        <div className="planner-info">
          <h3>ℹ️ Como funciona?</h3>
          <ul>
            <li>Planejamento para 7 dias (Segunda a Domingo)</li>
            <li>4 refeições por dia (café, almoço, jantar, lanche)</li>
            <li>Lista de compras automática</li>
            <li>Histórico dos últimos 3 planos</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
