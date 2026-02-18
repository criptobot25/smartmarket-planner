"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useShoppingPlan } from "../../src/contexts/ShoppingPlanContext";
import { isPremiumUser } from "../../src/core/premium/PremiumFeatures";
import { OnboardingWizard } from "../../src/app/components/OnboardingWizard";
import type { PlanInput } from "../../src/core/models/PlanInput";
import { AppNav } from "./AppNav";
import { useAppTranslation } from "../lib/i18n";

export default function PlannerDashboard() {
  const router = useRouter();
  const { t } = useAppTranslation();
  const { data: session, status } = useSession();
  const { generatePlan, repeatLastWeek, weeklyPlan, streak } = useShoppingPlan();
  const isPremium = isPremiumUser();
  const [wizardErrors, setWizardErrors] = useState<string[]>([]);

  const handleWizardComplete = (planInput: PlanInput) => {
    setWizardErrors([]);

    try {
      generatePlan(planInput);
      router.push("/app/list");
    } catch {
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

            <OnboardingWizard onComplete={handleWizardComplete} />
          </div>

          <div className="np-actions">
            <Link href="/app/list" className="np-btn np-btn-primary">
              {t("shoppingList.pageTitle")}
            </Link>
            <Link href="/app/prep-guide" className="np-btn np-btn-secondary">
              {t("nav.mondayPrep")}
            </Link>
            <Link href="/pricing" className="np-btn np-btn-secondary">
              {t("nav.premium")}
            </Link>

            {status === "authenticated" ? (
              <button type="button" className="np-btn np-btn-secondary" onClick={() => signOut({ callbackUrl: "/" })}>
                {t("planner.dashboard.logout")}
              </button>
            ) : (
              <button type="button" className="np-btn np-btn-secondary" onClick={() => signIn(undefined, { callbackUrl: "/app" })}>
                {t("planner.dashboard.login")}
              </button>
            )}
          </div>

          {status === "authenticated" && session?.user?.email && (
            <p className="np-muted">{t("planner.dashboard.signedInAs", { email: session.user.email })}</p>
          )}

          {weeklyPlan ? <p className="np-inline-note">{t("planner.previewValue")}</p> : null}
        </div>
      </main>
    </div>
  );
}
