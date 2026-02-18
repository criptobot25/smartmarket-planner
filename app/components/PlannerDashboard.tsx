"use client";

import Link from "next/link";
import { useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { AppNav } from "./AppNav";
import { useAppTranslation } from "../lib/i18n";
import { usePlannerStore } from "../stores/plannerStore";
import { useShoppingProgressStore } from "../stores/shoppingProgressStore";

export default function PlannerDashboard() {
  const { t } = useAppTranslation();
  const { data: session, status } = useSession();
  const plannerIsHydrated = usePlannerStore((state) => state.isHydrated);
  const activePlanId = usePlannerStore((state) => state.activePlanId);
  const lastGeneratedAt = usePlannerStore((state) => state.lastGeneratedAt);
  const setActivePlanId = usePlannerStore((state) => state.setActivePlanId);
  const markPlanGenerated = usePlannerStore((state) => state.markPlanGenerated);
  const progressPercent = useShoppingProgressStore((state) => state.progressPercent);

  const hasPlan = Boolean(activePlanId);
  const profileLabel = status === "authenticated"
    ? session?.user?.email ?? "Premium account"
    : "Guest mode";

  const generatedLabel = hasPlan && lastGeneratedAt
    ? new Date(lastGeneratedAt).toLocaleDateString()
    : "Not generated yet";

  useEffect(() => {
    if (!plannerIsHydrated || activePlanId) {
      return;
    }

    setActivePlanId("next-bootstrap-plan");
    markPlanGenerated();
  }, [activePlanId, markPlanGenerated, plannerIsHydrated, setActivePlanId]);

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
          </div>

          {status === "authenticated" && session?.user?.email && (
            <p className="np-muted">Signed in as {session.user.email}</p>
          )}

          {plannerIsHydrated && (
            <p className="np-muted">{t("shoppingList.progress")}: {progressPercent}%</p>
          )}

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
