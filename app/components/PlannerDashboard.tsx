"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useShoppingPlan } from "../../src/contexts/ShoppingPlanContext";
import type { FitnessGoal, PlanInput, Sex } from "../../src/core/models/PlanInput";
import { AppNav } from "./AppNav";
import { useAppTranslation } from "../lib/i18n";
import { usePlannerStore } from "../stores/plannerStore";
import { useShoppingProgressStore } from "../stores/shoppingProgressStore";

export default function PlannerDashboard() {
  const router = useRouter();
  const { t } = useAppTranslation();
  const { data: session, status } = useSession();
  const { generatePlan, repeatLastWeek, weeklyPlan, streak } = useShoppingPlan();
  const plannerIsHydrated = usePlannerStore((state) => state.isHydrated);
  const activePlanId = usePlannerStore((state) => state.activePlanId);
  const lastGeneratedAt = usePlannerStore((state) => state.lastGeneratedAt);
  const setActivePlanId = usePlannerStore((state) => state.setActivePlanId);
  const markPlanGenerated = usePlannerStore((state) => state.markPlanGenerated);
  const progressPercent = useShoppingProgressStore((state) => state.progressPercent);

  const [formError, setFormError] = useState<string | null>(null);
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState(30);
  const [weightKg, setWeightKg] = useState(75);
  const [heightCm, setHeightCm] = useState(175);
  const [trains, setTrains] = useState(true);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>("maintenance");
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [restrictionsText, setRestrictionsText] = useState("");

  const hasPlan = Boolean(activePlanId);
  const profileLabel = status === "authenticated"
    ? session?.user?.email ?? "Premium account"
    : "Guest mode";

  const generatedLabel = hasPlan && lastGeneratedAt
    ? new Date(lastGeneratedAt).toLocaleDateString()
    : "Not generated yet";

  const currentGoalLabel = useMemo(() => {
    if (fitnessGoal === "cutting") {
      return t("planner.goalOption.healthy");
    }

    if (fitnessGoal === "bulking") {
      return t("planner.goalOption.comfort");
    }

    return t("planner.goalOption.balanced");
  }, [fitnessGoal, t]);

  useEffect(() => {
    if (!plannerIsHydrated || activePlanId) {
      return;
    }

    setActivePlanId("next-bootstrap-plan");
    markPlanGenerated();
  }, [activePlanId, markPlanGenerated, plannerIsHydrated, setActivePlanId]);

  const handleGeneratePlan = () => {
    setFormError(null);

    if (age < 12 || age > 90 || weightKg < 35 || weightKg > 250 || heightCm < 120 || heightCm > 230) {
      setFormError(t("planner.alertError"));
      return;
    }

    const restrictions = restrictionsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const planInput: PlanInput = {
      sex,
      age,
      weightKg,
      heightCm,
      trains,
      mealsPerDay,
      fitnessGoal,
      dietStyle: fitnessGoal === "cutting" ? "healthy" : fitnessGoal === "bulking" ? "comfort" : "balanced",
      costTier: "medium",
      restrictions,
    };

    try {
      generatePlan(planInput);
      markPlanGenerated();
      router.push("/app/list");
    } catch {
      setFormError(t("planner.alertError"));
    }
  };

  const handleRepeatLastWeek = () => {
    const success = repeatLastWeek();

    if (!success) {
      setFormError(t("planner.noRepeatPlan"));
      return;
    }

    markPlanGenerated();
    router.push("/app/list");
  };

  return (
    <div className="np-shell">
      <AppNav />

      <main className="np-main">
        <section className="np-card">
          <h2>{t("planner.title")}</h2>
          <p>{t("planner.subtitle")}</p>

          <div className="np-kpi-grid" role="list" aria-label="Planner overview">
            <article className="np-kpi-card" role="listitem">
              <span className="np-kpi-label">{t("shoppingList.metricProgress")}</span>
              <strong className="np-kpi-value">{progressPercent}%</strong>
              <div className="np-progress" aria-hidden="true">
                <div className="np-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </article>

            <article className="np-kpi-card" role="listitem">
              <span className="np-kpi-label">Plan status</span>
              <strong className="np-kpi-value">{hasPlan ? "Ready" : "Draft"}</strong>
              <span className="np-muted">{generatedLabel}</span>
            </article>

            <article className="np-kpi-card" role="listitem">
              <span className="np-kpi-label">Account</span>
              <strong className="np-kpi-value">{status === "authenticated" ? "Connected" : "Anonymous"}</strong>
              <span className="np-muted">{profileLabel}</span>
            </article>

            <article className="np-kpi-card" role="listitem">
              <span className="np-kpi-label">Consistency streak</span>
              <strong className="np-kpi-value">🔥 {streak}</strong>
              <span className="np-muted">{t("planner.streakWeeks_other", { count: streak })}</span>
            </article>
          </div>

          {status === "authenticated" && session?.user?.email && (
            <p className="np-muted">Signed in as {session.user.email}</p>
          )}

          {plannerIsHydrated && (
            <p className="np-muted">{t("shoppingList.progress")}: {progressPercent}%</p>
          )}

          <div className="np-form-grid">
            <label>
              {t("planner.sexLabel")}
              <select className="np-input" value={sex} onChange={(event) => setSex(event.target.value as Sex)}>
                <option value="male">{t("planner.sexOption.male")}</option>
                <option value="female">{t("planner.sexOption.female")}</option>
              </select>
            </label>

            <label>
              {t("planner.ageLabel")}
              <input className="np-input" type="number" min={12} max={90} value={age} onChange={(event) => setAge(Number(event.target.value))} />
            </label>

            <label>
              {t("planner.weightLabel")}
              <input className="np-input" type="number" min={35} max={250} value={weightKg} onChange={(event) => setWeightKg(Number(event.target.value))} />
            </label>

            <label>
              {t("planner.heightLabel")}
              <input className="np-input" type="number" min={120} max={230} value={heightCm} onChange={(event) => setHeightCm(Number(event.target.value))} />
            </label>

            <label>
              {t("planner.mealsLabel")}
              <select className="np-input" value={mealsPerDay} onChange={(event) => setMealsPerDay(Number(event.target.value))}>
                {[3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>
                    {t("planner.mealsOption", { count })}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t("planner.goalLabel")}
              <select className="np-input" value={fitnessGoal} onChange={(event) => setFitnessGoal(event.target.value as FitnessGoal)}>
                <option value="cutting">{t("planner.goalOption.healthy")}</option>
                <option value="maintenance">{t("planner.goalOption.balanced")}</option>
                <option value="bulking">{t("planner.goalOption.comfort")}</option>
              </select>
            </label>
          </div>

          <div className="np-form-grid np-form-grid-single">
            <label>
              {t("planner.trainsLabel")}
              <select className="np-input" value={trains ? "yes" : "no"} onChange={(event) => setTrains(event.target.value === "yes")}>
                <option value="yes">{t("planner.trainsOption.yes")}</option>
                <option value="no">{t("planner.trainsOption.no")}</option>
              </select>
            </label>

            <label>
              {t("planner.restrictionsLabel")}
              <input
                className="np-input"
                type="text"
                value={restrictionsText}
                onChange={(event) => setRestrictionsText(event.target.value)}
                placeholder={t("planner.restrictionsPlaceholder")}
              />
            </label>
          </div>

          <p className="np-muted">{currentGoalLabel}</p>
          {weeklyPlan ? <p className="np-inline-note">{t("planner.previewValue")}</p> : null}
          {formError ? <p className="np-inline-note">{formError}</p> : null}

          <div className="np-actions">
            <button type="button" className="np-btn np-btn-primary" onClick={handleGeneratePlan}>
              {t("planner.submit")}
            </button>
            <button type="button" className="np-btn np-btn-secondary" onClick={handleRepeatLastWeek}>
              {t("planner.repeatLastWeek")}
            </button>

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
                Logout
              </button>
            ) : (
              <button type="button" className="np-btn np-btn-secondary" onClick={() => signIn(undefined, { callbackUrl: "/app" })}>
                Login
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
