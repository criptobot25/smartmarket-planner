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
  const setActivePlanId = usePlannerStore((state) => state.setActivePlanId);
  const markPlanGenerated = usePlannerStore((state) => state.markPlanGenerated);
  const progressPercent = useShoppingProgressStore((state) => state.progressPercent);

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

          {status === "authenticated" && session?.user?.email && (
            <p className="np-muted">Signed in as {session.user.email}</p>
          )}

          {plannerIsHydrated && (
            <p className="np-muted">{t("shoppingList.progress")}: {progressPercent}%</p>
          )}

          <div className="np-actions">
            <Link href="/app/list" className="np-btn np-btn-primary">
              {t("planner.repeatLastWeek")}
            </Link>
            <Link href="/app/prep-guide" className="np-btn np-btn-secondary">
              {t("nav.mondayPrep")}
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
