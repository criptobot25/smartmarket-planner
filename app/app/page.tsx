"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AppNav } from "../components/AppNav";
import { useAppTranslation } from "../lib/i18n";
import { usePlannerStore } from "../stores/plannerStore";
import { useShoppingProgressStore } from "../stores/shoppingProgressStore";

export default function PlannerRoute() {
  const { t } = useAppTranslation();
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
          </div>
        </section>
      </main>
    </div>
  );
}
