import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShoppingPlan } from "../../contexts/ShoppingPlanContext";
import { DietStyle, Sex, CostTier } from "../../core/models/PlanInput";
import "./PlannerPage.css";

export function PlannerPage() {
  const navigate = useNavigate();
  const { generatePlan } = useShoppingPlan();
  const { t } = useTranslation();

  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState<number>(30);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [trains, setTrains] = useState<boolean>(true);
  const [mealsPerDay, setMealsPerDay] = useState<number>(3);
  const [dietStyle, setDietStyle] = useState<DietStyle>("balanced");
  const [costTier, setCostTier] = useState<CostTier>("medium");
  const [restrictions, setRestrictions] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Valida inputs
    if (!sex) {
      alert(t("planner.alertSexRequired"));
      return;
    }

    if (weightKg <= 0) {
      alert(t("planner.alertWeightPositive"));
      return;
    }

    if (age <= 0) {
      alert(t("planner.alertAgePositive"));
      return;
    }

    if (heightCm <= 0) {
      alert(t("planner.alertHeightPositive"));
      return;
    }

    if (mealsPerDay < 3 || mealsPerDay > 6) {
      alert(t("planner.alertMealsRange"));
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
        sex,
        age,
        weightKg,
        heightCm,
        trains,
        mealsPerDay,
        dietStyle,
        costTier,
        restrictions: restrictionsArray
      });

      // Navega para a página da lista
      navigate("/app/list");
    } catch (error) {
      console.error("Erro ao gerar plano:", error);
      alert(t("planner.alertError"));
    }
  };

  return (
    <div className="planner-page">
      <div className="planner-container">
        <header className="planner-header">
          <h1 className="planner-title">{t("planner.title")}</h1>
          <p className="planner-subtitle">{t("planner.subtitle")}</p>
        </header>

        <div className="planner-card">
          <form className="planner-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="sex" className="form-label">
                {t("planner.sexLabel")}
              </label>
              <select
                id="sex"
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex)}
                className="form-input"
                required
              >
                <option value="male">{t("planner.sexOption.male")}</option>
                <option value="female">{t("planner.sexOption.female")}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="age" className="form-label">
                {t("planner.ageLabel")}
              </label>
              <input
                type="number"
                id="age"
                min="12"
                max="90"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight" className="form-label">
                {t("planner.weightLabel")}
              </label>
              <input
                type="number"
                id="weight"
                min="30"
                max="200"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="height" className="form-label">
                {t("planner.heightLabel")}
              </label>
              <input
                type="number"
                id="height"
                min="120"
                max="220"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="trains" className="form-label">
                {t("planner.trainsLabel")}
              </label>
              <select
                id="trains"
                value={trains ? "yes" : "no"}
                onChange={(e) => setTrains(e.target.value === "yes")}
                className="form-input"
                required
              >
                <option value="yes">{t("planner.trainsOption.yes")}</option>
                <option value="no">{t("planner.trainsOption.no")}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="meals" className="form-label">
                {t("planner.mealsLabel")}
              </label>
              <select
                id="meals"
                value={mealsPerDay}
                onChange={(e) => setMealsPerDay(Number(e.target.value))}
                className="form-input"
                required
              >
                {[3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>
                    {t("planner.mealsOption", { count })}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="diet-style" className="form-label">
                {t("planner.goalLabel")}
              </label>
              <select
                id="diet-style"
                value={dietStyle}
                onChange={(e) => setDietStyle(e.target.value as DietStyle)}
                className="form-input"
                required
              >
                <option value="healthy">{t("planner.goalOption.healthy")}</option>
                <option value="balanced">{t("planner.goalOption.balanced")}</option>
                <option value="comfort">{t("planner.goalOption.comfort")}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="cost-tier" className="form-label">
                {t("planner.costTierLabel")}
              </label>
              <select
                id="cost-tier"
                value={costTier}
                onChange={(e) => setCostTier(e.target.value as CostTier)}
                className="form-input"
                required
              >
                <option value="low">{t("planner.costTierOption.low")}</option>
                <option value="medium">{t("planner.costTierOption.medium")}</option>
                <option value="high">{t("planner.costTierOption.high")}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="restrictions" className="form-label">
                {t("planner.restrictionsLabel")}
              </label>
              <input
                type="text"
                id="restrictions"
                placeholder={t("planner.restrictionsPlaceholder")}
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                className="form-input"
              />
              <small className="form-hint">{t("planner.restrictionsHint")}</small>
            </div>

            <button type="submit" className="btn-generate">
              {t("planner.submit")}
            </button>
          </form>

          <div className="planner-preview">
            <p className="preview-label">{t("planner.previewLabel")}</p>
            <p className="preview-value">{t("planner.previewValue")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
