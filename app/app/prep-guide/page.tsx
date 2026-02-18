"use client";

import Link from "next/link";
import { AppNav } from "../../components/AppNav";
import { useAppTranslation } from "../../lib/i18n";
import { useShoppingProgressStore } from "../../stores/shoppingProgressStore";

export default function PrepGuideRoute() {
  const { t } = useAppTranslation();
  const progressPercent = useShoppingProgressStore((state) => state.progressPercent);
  const prepUnlocked = progressPercent >= 100;

  const quickTasks = [
    {
      title: t("prepGuide.taskStep", { order: 1 }),
      description: t("prepGuide.instructions.oven", {
        quantity: "1kg",
        ingredient: "protein",
        temperature: "180°C",
        duration: 35,
      }),
    },
    {
      title: t("prepGuide.taskStep", { order: 2 }),
      description: t("prepGuide.instructions.boil", {
        quantity: "800g",
        ingredient: "carbs",
        duration: 18,
      }),
    },
    {
      title: t("prepGuide.taskStep", { order: 3 }),
      description: t("prepGuide.instructions.portion", {
        quantity: "weekly meals",
        ingredient: "containers",
      }),
    },
  ];

  return (
    <div className="np-shell">
      <AppNav />

      <main className="np-main">
        <section className="np-card">
          <h2>{t("prepGuide.title")}</h2>
          <p>{prepUnlocked ? t("prepGuide.checklistSubtitle") : t("prepGuide.lockedSubtitle")}</p>

          <div className="np-kpi-grid" role="list" aria-label="Prep guide status">
            <article className="np-kpi-card" role="listitem">
              <span className="np-kpi-label">{t("shoppingList.metricProgress")}</span>
              <strong className="np-kpi-value">{progressPercent}%</strong>
              <div className="np-progress" aria-hidden="true">
                <div className="np-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </article>

            <article className="np-kpi-card" role="listitem">
              <span className="np-kpi-label">{t("prepGuide.summaryTimeLabel")}</span>
              <strong className="np-kpi-value">90 min</strong>
              <span className="np-muted">{t("prepGuide.summarySequentialLabel")}: 120 min</span>
            </article>

            <article className="np-kpi-card" role="listitem">
              <span className="np-kpi-label">{t("prepGuide.summaryMealsLabel")}</span>
              <strong className="np-kpi-value">14</strong>
              <span className="np-muted">{t("prepGuide.summaryMealsDetail")}</span>
            </article>
          </div>

          {prepUnlocked ? (
            <div className="np-step-list" role="list">
              {quickTasks.map((task) => (
                <article key={task.title} className="np-step-item" role="listitem">
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="np-inline-note">{t("prepGuide.lockedProgress", { progress: progressPercent })}</p>
          )}

          <div className="np-actions">
            <Link href="/app/list" className="np-btn np-btn-primary">
              {t("shoppingList.pageTitle")}
            </Link>
            <Link href="/app" className="np-btn np-btn-secondary">
              {t("nav.nutritionPlan")}
            </Link>
            <Link href="/pricing" className="np-btn np-btn-secondary">
              {t("prepGuide.upgradeButton")}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
