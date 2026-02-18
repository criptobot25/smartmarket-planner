import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShoppingPlan } from "../../contexts/ShoppingPlanContext";
import { PlanInput } from "../../core/models/PlanInput";
import { isPremiumUser } from "../../core/premium/PremiumFeatures";
import { OnboardingWizard } from "../components/OnboardingWizard";
import "./PlannerPage.css";

export function PlannerPage() {
  const navigate = useNavigate();
  const { generatePlan, repeatLastWeek, streak } = useShoppingPlan(); // PASSO 33.1 & 33.4
  const { t } = useTranslation();
  const isPremium = isPremiumUser();
  const [wizardErrors, setWizardErrors] = useState<string[]>([]);

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

  const handleWizardComplete = (planInput: PlanInput) => {
    setWizardErrors([]);
    try {
      generatePlan(planInput);
      navigate("/app/list");
    } catch (error) {
      console.error("Erro ao gerar plano:", error);
      setWizardErrors([t("planner.alertError", "An unexpected error occurred. Please try again.")]);
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
                  <span className="streak-label">{t("planner.streakWeeks", { count: streak })}</span>
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
            <h3>🔒 {t("planner.premiumStackTitle")}</h3>
            <ul>
              <li>{t("planner.premiumStackItem1")}</li>
              <li>{t("planner.premiumStackItem2")}</li>
              <li>{t("planner.premiumStackItem3")}</li>
            </ul>
            <button type="button" className="btn-premium-trigger" onClick={() => navigate("/pricing")}>{t("planner.premiumStackButton")}</button>
          </div>
        )}

        <div className="planner-card">
          {wizardErrors.length > 0 && (
            <div className="validation-errors">
              <div className="error-header">
                <span className="error-icon">⚠️</span>
                <strong>{t("onboarding.errors.generic")}</strong>
              </div>
              <ul className="error-list">
                {wizardErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <OnboardingWizard onComplete={handleWizardComplete} />
        </div>
      </div>
    </div>
  );
}
