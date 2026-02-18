"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useShoppingPlan } from "../../../src/contexts/ShoppingPlanContext";
import { aggregateShoppingList } from "../../../src/core/logic/aggregateShoppingList";
import { generateMealPrepGuide } from "../../../src/core/logic/MealPrepGuide";
import { canExportPdf } from "../../../src/core/premium/features";
import { AppNav } from "../../components/AppNav";
import { useAppTranslation } from "../../lib/i18n";
import { useShoppingProgressStore } from "../../stores/shoppingProgressStore";

export default function PrepGuideRoute() {
  const { t } = useAppTranslation();
  const { weeklyPlan, shoppingList } = useShoppingPlan();
  const [statusMessage, setStatusMessage] = useState("");
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<number>>(new Set());

  const planDays = weeklyPlan?.days.length || 7;
  const aggregatedList = useMemo(
    () => aggregateShoppingList(shoppingList as never[], planDays),
    [planDays, shoppingList],
  );

  const purchasedCount = aggregatedList.filter((item) => item.purchased).length;
  const totalCount = aggregatedList.length;
  const computedProgress = totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;
  const progressPercent = useShoppingProgressStore((state) => state.progressPercent);
  const effectiveProgress = Math.max(progressPercent, computedProgress);
  const prepUnlocked = effectiveProgress >= 100;

  const prepGuide = weeklyPlan ? generateMealPrepGuide(weeklyPlan) : null;

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

  const generatedTasks = prepGuide?.cookingTasks.map((task) => ({
    id: task.order,
    title: t("prepGuide.taskStep", { order: task.order }),
    description: `${task.action} ${task.quantity} ${task.ingredient} · ${t("prepGuide.taskDurationMinutes", { minutes: task.duration })}`,
  })) ?? quickTasks.map((task, index) => ({ id: index + 1, ...task }));

  const completedCount = completedTaskIds.size;
  const taskProgress = generatedTasks.length > 0 ? Math.round((completedCount / generatedTasks.length) * 100) : 0;

  const toggleTask = (id: number) => {
    setCompletedTaskIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const handlePrintGuide = async () => {
    if (!weeklyPlan || !prepGuide) {
      setStatusMessage(t("prepGuide.emptySubtitle"));
      return;
    }

    if (!canExportPdf()) {
      setStatusMessage(t("prepGuide.printButtonPremium"));
      return;
    }

    const { exportPrepGuideToPdf } = await import("../../../src/utils/exportPrepGuidePdf");
    exportPrepGuideToPdf(prepGuide, weeklyPlan);
    setStatusMessage(t("prepGuide.printButton"));
  };

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
              <strong className="np-kpi-value">{effectiveProgress}%</strong>
              <div className="np-progress" aria-hidden="true">
                <div className="np-progress-fill" style={{ width: `${effectiveProgress}%` }} />
              </div>
            </article>

            <article className="np-kpi-card" role="listitem">
              <span className="np-kpi-label">{t("prepGuide.summaryTimeLabel")}</span>
              <strong className="np-kpi-value">90 min</strong>
              <span className="np-muted">{t("prepGuide.summarySequentialLabel")}: 120 min</span>
            </article>

            <article className="np-kpi-card" role="listitem">
              <span className="np-kpi-label">{t("prepGuide.summaryMealsLabel")}</span>
              <strong className="np-kpi-value">{prepGuide?.servingsProduced ?? 14}</strong>
              <span className="np-muted">{t("prepGuide.summaryMealsDetail")}</span>
            </article>

            <article className="np-kpi-card" role="listitem">
              <span className="np-kpi-label">{t("prepGuide.summaryProgressLabel")}</span>
              <strong className="np-kpi-value">{taskProgress}%</strong>
              <span className="np-muted">{t("prepGuide.summaryProgressDetail", { count: completedCount, total: generatedTasks.length })}</span>
            </article>
          </div>

          {prepUnlocked ? (
            <div className="np-step-list" role="list">
              {generatedTasks.map((task) => (
                <article key={task.id} className="np-step-item" role="listitem">
                  <div className="np-step-header">
                    <h3>{task.title}</h3>
                    <button type="button" className="np-btn np-btn-secondary" onClick={() => toggleTask(task.id)}>
                      {completedTaskIds.has(task.id) ? "✓" : "○"}
                    </button>
                  </div>
                  <p>{task.description}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="np-inline-note">{t("prepGuide.lockedProgress", { progress: effectiveProgress })}</p>
          )}

          <div className="np-actions">
            <Link href="/app/list" className="np-btn np-btn-primary">
              {t("shoppingList.pageTitle")}
            </Link>
            <Link href="/app" className="np-btn np-btn-secondary">
              {t("nav.nutritionPlan")}
            </Link>
            <button type="button" className="np-btn np-btn-secondary" onClick={handlePrintGuide}>
              {canExportPdf() ? t("prepGuide.printButton") : t("prepGuide.printButtonPremium")}
            </button>
            <Link href="/pricing" className="np-btn np-btn-secondary">
              {t("prepGuide.upgradeButton")}
            </Link>
          </div>

          {statusMessage ? <p className="np-inline-note">{statusMessage}</p> : null}
        </section>
      </main>
    </div>
  );
}
