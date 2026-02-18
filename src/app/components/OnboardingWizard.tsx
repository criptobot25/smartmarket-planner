import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CostTier, DietStyle, FitnessGoal, PlanInput, Sex } from "../../core/models/PlanInput";
import { validatePlanInput } from "../../core/validation/PlanInputSchema";
import "./OnboardingWizard.css";

interface OnboardingWizardProps {
  onComplete: (input: PlanInput) => void;
}

const TOTAL_STEPS = 6;

function getDietStyleFromGoal(goal: FitnessGoal): DietStyle {
  if (goal === "cutting") return "healthy";
  if (goal === "bulking") return "comfort";
  return "balanced";
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);

  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState<number>(30);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [trains, setTrains] = useState<boolean>(true);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>("maintenance");
  const [mealsPerDay, setMealsPerDay] = useState<number>(3);
  const [restrictions, setRestrictions] = useState<string>("");

  const [stepError, setStepError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const progress = useMemo(() => Math.round((currentStep / TOTAL_STEPS) * 100), [currentStep]);

  const validateStep = (step: number): string | null => {
    if (step === 1) {
      if (!sex) return t("onboarding.errors.sex");
      if (!age || age < 12 || age > 90) return t("onboarding.errors.age");
    }

    if (step === 2) {
      if (!weightKg || weightKg < 30 || weightKg > 250) return t("onboarding.errors.weight");
      if (!heightCm || heightCm < 120 || heightCm > 230) return t("onboarding.errors.height");
    }

    if (step === 3) {
      if (typeof trains !== "boolean") return t("onboarding.errors.trains");
    }

    if (step === 4) {
      if (!fitnessGoal) return t("onboarding.errors.goal");
    }

    if (step === 5) {
      if (!mealsPerDay || mealsPerDay < 3 || mealsPerDay > 6) return t("onboarding.errors.meals");
    }

    return null;
  };

  const nextStep = () => {
    const error = validateStep(currentStep);
    if (error) {
      setStepError(error);
      return;
    }

    setStepError(null);
    setCurrentStep((previous) => Math.min(TOTAL_STEPS, previous + 1));
  };

  const previousStep = () => {
    setStepError(null);
    setFormErrors([]);
    setCurrentStep((previous) => Math.max(1, previous - 1));
  };

  const finishOnboarding = () => {
    const error = validateStep(currentStep);
    if (error) {
      setStepError(error);
      return;
    }

    const restrictionsArray = restrictions
      .split(",")
      .map((restriction) => restriction.trim())
      .filter((restriction) => restriction.length > 0);

    const planInput: PlanInput = {
      sex,
      age,
      weightKg,
      heightCm,
      trains,
      mealsPerDay,
      fitnessGoal,
      dietStyle: getDietStyleFromGoal(fitnessGoal),
      costTier: "medium" as CostTier,
      restrictions: restrictionsArray,
    };

    const validation = validatePlanInput(planInput);
    if (!validation.success || !validation.data) {
      setFormErrors(validation.errors || [t("onboarding.errors.generic")]);
      return;
    }

    setStepError(null);
    setFormErrors([]);
    onComplete(validation.data);
  };

  return (
    <div className="onboarding-wizard">
      <div className="wizard-progress-header">
        <p className="wizard-progress-label">
          {t("onboarding.progress", { current: currentStep, total: TOTAL_STEPS })}
        </p>
        <div className="wizard-progress-track" aria-hidden>
          <div className="wizard-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="wizard-step-card" key={currentStep}>
        {currentStep === 1 && (
          <div className="wizard-step-content">
            <h2>{t("onboarding.step1Title")}</h2>
            <p>{t("onboarding.step1Subtitle")}</p>

            <div className="wizard-grid-two">
              <div>
                <label className="wizard-label">{t("planner.sexLabel")}</label>
                <select className="wizard-input" value={sex} onChange={(event) => setSex(event.target.value as Sex)}>
                  <option value="male">{t("planner.sexOption.male")}</option>
                  <option value="female">{t("planner.sexOption.female")}</option>
                </select>
              </div>
              <div>
                <label className="wizard-label">{t("planner.ageLabel")}</label>
                <input
                  className="wizard-input"
                  type="number"
                  min={12}
                  max={90}
                  value={age}
                  onChange={(event) => setAge(Number(event.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="wizard-step-content">
            <h2>{t("onboarding.step2Title")}</h2>
            <p>{t("onboarding.step2Subtitle")}</p>

            <div className="wizard-grid-two">
              <div>
                <label className="wizard-label">{t("planner.weightLabel")}</label>
                <input
                  className="wizard-input"
                  type="number"
                  min={30}
                  max={250}
                  step={0.5}
                  value={weightKg}
                  onChange={(event) => setWeightKg(Number(event.target.value))}
                />
              </div>
              <div>
                <label className="wizard-label">{t("planner.heightLabel")}</label>
                <input
                  className="wizard-input"
                  type="number"
                  min={120}
                  max={230}
                  value={heightCm}
                  onChange={(event) => setHeightCm(Number(event.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="wizard-step-content">
            <h2>{t("onboarding.step3Title")}</h2>
            <p>{t("onboarding.step3Subtitle")}</p>

            <div className="wizard-choice-grid">
              <button
                type="button"
                className={`wizard-choice ${trains ? "active" : ""}`}
                onClick={() => setTrains(true)}
              >
                💪 {t("planner.trainsOption.yes")}
              </button>
              <button
                type="button"
                className={`wizard-choice ${!trains ? "active" : ""}`}
                onClick={() => setTrains(false)}
              >
                🧘 {t("planner.trainsOption.no")}
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="wizard-step-content">
            <h2>{t("onboarding.step4Title")}</h2>
            <p>{t("onboarding.step4Subtitle")}</p>

            <div className="wizard-choice-list">
              <button
                type="button"
                className={`wizard-choice ${fitnessGoal === "cutting" ? "active" : ""}`}
                onClick={() => setFitnessGoal("cutting")}
              >
                🔥 {t("planner.goalOption.healthy")}
              </button>
              <button
                type="button"
                className={`wizard-choice ${fitnessGoal === "maintenance" ? "active" : ""}`}
                onClick={() => setFitnessGoal("maintenance")}
              >
                ⚖️ {t("planner.goalOption.balanced")}
              </button>
              <button
                type="button"
                className={`wizard-choice ${fitnessGoal === "bulking" ? "active" : ""}`}
                onClick={() => setFitnessGoal("bulking")}
              >
                🚀 {t("planner.goalOption.comfort")}
              </button>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="wizard-step-content">
            <h2>{t("onboarding.step5Title")}</h2>
            <p>{t("onboarding.step5Subtitle")}</p>

            <label className="wizard-label">{t("planner.mealsLabel")}</label>
            <select
              className="wizard-input"
              value={mealsPerDay}
              onChange={(event) => setMealsPerDay(Number(event.target.value))}
            >
              {[3, 4, 5, 6].map((count) => (
                <option key={count} value={count}>
                  {t("planner.mealsOption", { count })}
                </option>
              ))}
            </select>
          </div>
        )}

        {currentStep === 6 && (
          <div className="wizard-step-content">
            <h2>{t("onboarding.step6Title")}</h2>
            <p>{t("onboarding.step6Subtitle")}</p>

            <label className="wizard-label">{t("planner.restrictionsLabel")}</label>
            <input
              className="wizard-input"
              type="text"
              placeholder={t("planner.restrictionsPlaceholder")}
              value={restrictions}
              onChange={(event) => setRestrictions(event.target.value)}
            />
            <small className="wizard-helper">{t("planner.restrictionsHint")}</small>

            <div className="wizard-coach-summary">
              <strong>{t("onboarding.coachReadyTitle")}</strong>
              <p>{t("onboarding.coachReadySubtitle")}</p>
            </div>
          </div>
        )}
      </div>

      {stepError && <p className="wizard-error">⚠️ {stepError}</p>}

      {formErrors.length > 0 && (
        <ul className="wizard-error-list">
          {formErrors.map((error, index) => (
            <li key={`${error}-${index}`}>{error}</li>
          ))}
        </ul>
      )}

      <div className="wizard-actions">
        <button type="button" className="wizard-btn secondary" onClick={previousStep} disabled={currentStep === 1}>
          {t("onboarding.back")}
        </button>

        {currentStep < TOTAL_STEPS ? (
          <button type="button" className="wizard-btn primary" onClick={nextStep}>
            {t("onboarding.next")}
          </button>
        ) : (
          <button type="button" className="wizard-btn primary" onClick={finishOnboarding}>
            {t("onboarding.finish")}
          </button>
        )}
      </div>
    </div>
  );
}
