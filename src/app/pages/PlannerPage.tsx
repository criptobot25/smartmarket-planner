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
      <div className="planner-container">
        <header className="planner-header">
          <h1 className="planner-title">Generate your weekly grocery plan</h1>
          <p className="planner-subtitle">Meal-prep optimized • Protein-first • Cost transparent</p>
        </header>

        <div className="planner-card">
          <form className="planner-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="people" className="form-label">
                Number of people
              </label>
              <input
                type="number"
                id="people"
                min="1"
                max="10"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(Number(e.target.value))}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="diet-style" className="form-label">
                Fitness goal
              </label>
              <select
                id="diet-style"
                value={dietStyle}
                onChange={(e) => setDietStyle(e.target.value as DietStyle)}
                className="form-input"
                required
              >
                <option value="healthy">Cutting (Fat Loss)</option>
                <option value="balanced">Maintenance</option>
                <option value="comfort">Bulking (Muscle Gain)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="budget" className="form-label">
                Weekly budget (€)
              </label>
              <input
                type="number"
                id="budget"
                min="0"
                step="10"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="restrictions" className="form-label">
                Dietary restrictions (optional)
              </label>
              <input
                type="text"
                id="restrictions"
                placeholder="e.g., lactose, gluten"
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                className="form-input"
              />
              <small className="form-hint">Separate multiple restrictions with commas</small>
            </div>

            <button type="submit" className="btn-generate">
              Generate Weekly Plan
            </button>
          </form>

          <div className="planner-preview">
            <p className="preview-label">⚡ Example output</p>
            <p className="preview-value">~150g protein/day • €65/week</p>
          </div>
        </div>
      </div>
    </div>
  );
}
