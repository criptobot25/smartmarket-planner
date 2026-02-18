import { useMemo, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShoppingPlan } from "../../contexts/ShoppingPlanContext";
import { DietStyle, FitnessGoal, Sex, CostTier } from "../../core/models/PlanInput";
import { validatePlanInput } from "../../core/validation/PlanInputSchema"; // PASSO 34
import { calculateMacroPlan } from "../../core/logic/MacroPlanner";
import { isPremiumUser } from "../../core/premium/PremiumFeatures";
import "./PlannerPage.css";

export function PlannerPage() {
  const navigate = useNavigate();
  const { generatePlan, repeatLastWeek, streak } = useShoppingPlan(); // PASSO 33.1 & 33.4
  const { t } = useTranslation();
  const isPremium = isPremiumUser();

  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState<number>(30);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [trains, setTrains] = useState<boolean>(true);
  const [mealsPerDay, setMealsPerDay] = useState<number>(3);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>("maintenance");
  const [costTier, setCostTier] = useState<CostTier>("medium");
  const [restrictions, setRestrictions] = useState<string>("");
  
  // PASSO 34: Validation errors state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const dietStyle: DietStyle = fitnessGoal === "cutting"
    ? "healthy"
    : fitnessGoal === "bulking"
      ? "comfort"
      : "balanced";

  const macroPreview = useMemo(() => {
    return calculateMacroPlan({
      sex,
      age,
      weightKg,
      heightCm,
      trains,
      mealsPerDay,
      dietStyle,
      costTier,
      restrictions: [],
      fitnessGoal,
    });
  }, [sex, age, weightKg, heightCm, trains, mealsPerDay, dietStyle, costTier, fitnessGoal]);

  // PASSO 33.1: Handler for Repeat Last Week button
  const handleRepeatLastWeek = () => {
    const success = repeatLastWeek();
    
    if (success) {
      // Navigate to shopping list if successful
      navigate("/app/list");
    } else {
      // Show message if no previous plan exists
      alert(t("planner.noRepeatPlan", "No previous plan found. Please generate a new plan first."));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation errors
    setValidationErrors([]);

    // Converte restrições de string para array
    const restrictionsArray = restrictions
      .split(",")
      .map(r => r.trim())
      .filter(r => r.length > 0);

    // PASSO 34: Validate input with Zod schema
    const planInput = {
      sex,
      age,
      weightKg,
      heightCm,
      trains,
      mealsPerDay,
      dietStyle,
      costTier,
      restrictions: restrictionsArray,
      fitnessGoal,
    };
    
    const validation = validatePlanInput(planInput);
    
    if (!validation.success) {
      // Show validation errors inline (not alert)
      setValidationErrors(validation.errors || []);
      return;
    }

    // Gera o plano com validated data
    try {
      generatePlan(validation.data!);

      // Navega para a página da lista
      navigate("/app/list");
    } catch (error) {
      console.error("Erro ao gerar plano:", error);
      setValidationErrors([t("planner.alertError", "An unexpected error occurred. Please try again.")]);
    }
  };

  return (
    <div className="planner-page">
      <div className="planner-container">
        <header className="planner-header">
          <div className="header-top">
            <div>
              <h1 className="planner-title">{t("planner.title")}</h1>
              <p className="planner-subtitle">{t("planner.subtitle")}</p>
            </div>
            {/* PASSO 33.4: Streak indicator */}
            {streak > 0 && (
              <div className="streak-indicator">
                <span className="streak-flame">🔥</span>
                <div className="streak-content">
                  <span className="streak-number">{streak}</span>
                  <span className="streak-label">week{streak > 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* PASSO 33.1: Repeat Last Week Button */}
        <div className="repeat-week-container">
          <button 
            type="button" 
            className="btn-repeat-week"
            onClick={handleRepeatLastWeek}
            title={t("planner.repeatLastWeekTooltip", "Load your last weekly plan instantly")}
          >
            🔁 {t("planner.repeatLastWeek", "Repeat Last Week")}
          </button>
        </div>

        {!isPremium && (
          <div className="premium-trigger-panel">
            <h3>🔒 Premium performance stack</h3>
            <ul>
              <li>Unlimited Food Rotation</li>
              <li>Weekly Coach Adjustments</li>
              <li>Recipe Packs + Meal Prep Guide PDF</li>
            </ul>
            <button type="button" className="btn-premium-trigger" onClick={() => navigate("/pricing")}>See why people upgrade</button>
          </div>
        )}

        <div className="planner-card">
          {/* PASSO 34: Validation Errors Display */}
          {validationErrors.length > 0 && (
            <div className="validation-errors">
              <div className="error-header">
                <span className="error-icon">⚠️</span>
                <strong>Please fix the following errors:</strong>
              </div>
              <ul className="error-list">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
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
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                className="form-input"
                required
              >
                <option value="cutting">{t("planner.goalOption.healthy")}</option>
                <option value="maintenance">{t("planner.goalOption.balanced")}</option>
                <option value="bulking">{t("planner.goalOption.comfort")}</option>
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
            <div className="preview-grid">
              <p className="preview-value">TDEE: {macroPreview.tdee} kcal</p>
              <p className="preview-value">Target: {macroPreview.calorieTargetPerDay} kcal/day</p>
              <p className="preview-value">Protein: {macroPreview.proteinTargetPerDay}g/day</p>
              <p className="preview-value">Carbs: {macroPreview.carbsTargetPerDay}g/day</p>
              <p className="preview-value">Fats: {macroPreview.fatsTargetPerDay}g/day</p>
              <p className="preview-value">Per meal: {macroPreview.proteinPerMeal}P / {macroPreview.carbsPerMeal}C / {macroPreview.fatsPerMeal}F</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
