"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useShoppingPlan } from "../../src/contexts/ShoppingPlanContext";
import { isPremiumUser } from "../../src/core/premium/PremiumFeatures";
import { OnboardingWizard } from "../../src/app/components/OnboardingWizard";
import type { FitnessGoal, PlanInput } from "../../src/core/models/PlanInput";
import { AppNav } from "./AppNav";
import { PlannerAuthControls } from "./PlannerAuthControls";
import { trackEvent } from "../lib/analytics";
import { useAppTranslation } from "../lib/i18n";

export default function PlannerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useAppTranslation();
  const { generatePlan, repeatLastWeek, weeklyPlan, streak } = useShoppingPlan();
  const isPremium = isPremiumUser();
  const [wizardErrors, setWizardErrors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const hasTrackedContentCtaRef = useRef(false);

  const requestedGoal = searchParams.get("goal");
  const ctaSource = searchParams.get("source");
  const ctaSlug = searchParams.get("slug");
  const initialFitnessGoal: FitnessGoal = requestedGoal === "cutting" || requestedGoal === "bulking" || requestedGoal === "maintenance"
    ? requestedGoal
    : "maintenance";

  useEffect(() => {
    if (hasTrackedContentCtaRef.current || !ctaSource) {
      return;
    }

    hasTrackedContentCtaRef.current = true;
    trackEvent("content_to_planner_cta", {
      source: ctaSource,
      slug: ctaSlug || "unknown",
      goal: initialFitnessGoal,
    });
  }, [ctaSlug, ctaSource, initialFitnessGoal]);

  const handleWizardComplete = (planInput: PlanInput) => {
    setWizardErrors([]);
    setIsGenerating(true);

    try {
      generatePlan(planInput);
      trackEvent("plan_generated", {
        fitness_goal: planInput.fitnessGoal,
        meals_per_day: planInput.mealsPerDay,
        has_restrictions: planInput.restrictions.length > 0,
      });
      setTimeout(() => router.push("/app/list"), 900);
    } catch {
      setIsGenerating(false);
      setWizardErrors([t("planner.alertError")]);
    }
  };

  const handleRepeatLastWeek = () => {
    const success = repeatLastWeek();

    if (!success) {
      setWizardErrors([t("planner.noRepeatPlan")]);
      return;
    }

    router.push("/app/list");
  };

  if (isGenerating) {
    return (
      <div className="np-shell">
        <AppNav />
        <main className="np-main planner-page">
          <div className="planner-generating">
            <div className="generating-spinner" />
            <h2 className="generating-title">{t("planner.generatingTitle") || "A gerar o teu plano..."}</h2>
            <p className="generating-subtitle">{t("planner.generatingSubtitle") || "Calculando macros, lista de compras e guia de preparação."}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="np-shell">
      <AppNav />

      <main className="np-main planner-page">
        <div className="planner-container">
          <header className="planner-header">
            <div className="header-top">
              <div>
                <h1 className="planner-title">{t("planner.title")}</h1>
                <p className="planner-subtitle">{t("planner.subtitle")}</p>
              </div>

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

          <div className="repeat-week-container">
            <button
              type="button"
              className="btn-repeat-week"
              onClick={handleRepeatLastWeek}
              title={t("planner.repeatLastWeekTooltip")}
            >
              🔁 {t("planner.repeatLastWeek")}
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
              <Link href="/pricing" className="btn-premium-trigger">
                {t("planner.premiumStackButton")}
              </Link>
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
                    <li key={`${error}-${index}`}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <OnboardingWizard onComplete={handleWizardComplete} initialFitnessGoal={initialFitnessGoal} />
          </div>

          <div className="np-actions">
            <Link href="/app/list" className="np-btn np-btn-primary">
              {t("shoppingList.pageTitle")}
            </Link>
            <Link href="/app/prep" className="np-btn np-btn-secondary">
              {t("nav.mondayPrep")}
            </Link>
            <Link href="/pricing" className="np-btn np-btn-secondary">
              {t("nav.premium")}
            </Link>

            <PlannerAuthControls />
          </div>

          {weeklyPlan ? <p className="np-inline-note">{t("planner.previewValue")}</p> : null}
        </div>
      </main>
    </div>
  );
}
