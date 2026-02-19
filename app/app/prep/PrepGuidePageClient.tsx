"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useShoppingPlan } from "../../../src/contexts/ShoppingPlanContext";
import { aggregateShoppingList } from "../../../src/core/logic/aggregateShoppingList";
import { computeShoppingProgress, getPrepFlowStatus } from "../../../src/core/logic/PrepFlowController";
import { generateMealPrepGuide, type CookingTask } from "../../../src/core/logic/MealPrepGuide";
import { canExportPdf } from "../../../src/core/premium/features";
import { isPremiumUser } from "../../../src/core/premium/PremiumFeatures";
import { localizeFoodName, localizeFoodText } from "../../../src/app/utils/foodLocalization";
import { AppNav } from "../../components/AppNav";
import { useAppTranslation } from "../../lib/i18n";
import { useShoppingProgressStore } from "../../stores/shoppingProgressStore";

export default function PrepGuidePageClient() {
  const { t } = useAppTranslation();
  const { weeklyPlan, shoppingList } = useShoppingPlan();
  const isPremium = isPremiumUser();
  const [statusMessage, setStatusMessage] = useState("");
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());

  const planDays = weeklyPlan?.days.length || 7;
  const aggregatedList = useMemo(
    () => aggregateShoppingList(shoppingList as never[], planDays),
    [planDays, shoppingList],
  );

  const purchasedCount = aggregatedList.filter((item) => item.purchased).length;
  const totalCount = aggregatedList.length;
  const computedProgress = computeShoppingProgress(purchasedCount, totalCount);
  const progressPercent = useShoppingProgressStore((state) => state.progressPercent);
  const prepFlow = getPrepFlowStatus(Math.max(progressPercent, computedProgress));
  const prepUnlocked = prepFlow.unlocked;

  const prepGuide = weeklyPlan ? generateMealPrepGuide(weeklyPlan) : null;

  const localizedTips = useMemo(() => {
    if (!prepGuide) {
      return [] as string[];
    }

    const tips: string[] = [];
    const totalMeals = prepGuide.servingsProduced;

    tips.push(t("prepGuide.tips.containers", { count: totalMeals }));

    const hasOven = prepGuide.cookingTasks.some((task) => task.method === "oven");
    const hasBoil = prepGuide.cookingTasks.some((task) => task.method === "boil");

    if (hasOven && hasBoil) {
      tips.push(t("prepGuide.tips.parallel"));
    }

    tips.push(t("prepGuide.tips.labels"));

    if (totalMeals > 14) {
      tips.push(t("prepGuide.tips.freeze"));
    } else {
      tips.push(t("prepGuide.tips.fridge"));
    }

    return tips;
  }, [prepGuide, t]);

  const totalTasks = prepGuide?.cookingTasks.length ?? 0;
  const completedCount = completedTasks.size;
  const taskProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const toggleTask = (taskOrder: number) => {
    setCompletedTasks((previous) => {
      const next = new Set(previous);
      if (next.has(taskOrder)) {
        next.delete(taskOrder);
      } else {
        next.add(taskOrder);
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

  if (!weeklyPlan || !prepGuide) {
    return (
      <div className="np-shell">
        <AppNav />

        <main className="np-main prep-guide-page">
          <div className="empty-state">
            <h2>{t("prepGuide.emptyTitle")}</h2>
            <p>{t("prepGuide.emptySubtitle")}</p>
            <Link href="/app" className="btn-primary">{t("prepGuide.emptyButton")}</Link>
          </div>
        </main>
      </div>
    );
  }

  if (!prepUnlocked) {
    return (
      <div className="np-shell">
        <AppNav />

        <main className="np-main prep-guide-page">
          <div className="empty-state">
            <h2>🔒 {t("prepGuide.lockedTitle")}</h2>
            <p>{t("prepGuide.lockedSubtitle")}</p>
            <p>{t("prepGuide.lockedProgress", { progress: prepFlow.progressPercent })}</p>
            <p>{t("prepGuide.unlockTarget", { threshold: prepFlow.unlockThreshold })}</p>
            <Link href="/app/list" className="btn-primary">{t("prepGuide.lockedBackButton")}</Link>
          </div>
        </main>
      </div>
    );
  }

  const difficultyColor = {
    easy: "#4caf50",
    medium: "#ff9800",
    advanced: "#f44336",
  }[prepGuide.difficulty];

  return (
    <div className="np-shell prep-guide-page">
      <AppNav />

      <header className="prep-guide-header">
        <div className="header-top">
          <Link className="btn-back" href="/app/list">← {t("prepGuide.backButton")}</Link>
          <h1>🍳 {t("prepGuide.title")}</h1>
        </div>

        <div className="guide-summary">
          <div className="summary-card">
            <div className="summary-icon">⏱️</div>
            <div className="summary-content">
              <div className="summary-label">{t("prepGuide.summaryTimeLabel")}</div>
              <div className="summary-value">{prepGuide.totalPrepTime}</div>
              <div className="summary-detail">{t("prepGuide.summarySequentialLabel")}: {prepGuide.sequentialTime}</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">🍱</div>
            <div className="summary-content">
              <div className="summary-label">{t("prepGuide.summaryMealsLabel")}</div>
              <div className="summary-value">{prepGuide.servingsProduced}</div>
              <div className="summary-detail">{t("prepGuide.summaryMealsDetail")}</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <div className="summary-label">{t("prepGuide.summaryDifficultyLabel")}</div>
              <div className="summary-value difficulty-badge" style={{ color: difficultyColor }}>
                {t(`prepGuide.difficulty.${prepGuide.difficulty}`)}
              </div>
              <div className="summary-detail">{t("prepGuide.summaryDifficultyDetail", { count: totalTasks })}</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <div className="summary-content">
              <div className="summary-label">{t("prepGuide.summaryProgressLabel")}</div>
              <div className="summary-value">{taskProgress}%</div>
              <div className="summary-detail">{t("prepGuide.summaryProgressDetail", { count: completedCount, total: totalTasks })}</div>
            </div>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${taskProgress}%` }} />
          </div>
        </div>
      </header>

      <main className="prep-guide-content">
        <section className="cooking-tasks-section">
          <div className="section-header">
            <h2>📝 {t("prepGuide.checklistTitle")}</h2>
            <p className="section-subtitle">{t("prepGuide.checklistSubtitle")}</p>
          </div>

          <div className="tasks-list">
            {prepGuide.cookingTasks.map((task) => (
              <TaskCard
                key={task.order}
                task={task}
                completed={completedTasks.has(task.order)}
                onToggle={() => toggleTask(task.order)}
              />
            ))}
          </div>
        </section>

        <section className="tips-section">
          <h3>💡 {t("prepGuide.tipsTitle")}</h3>
          <ul className="tips-list">
            {localizedTips.map((tip, index) => (
              <li key={`${tip}-${index}`} className="tip-item">
                <span className="tip-bullet">•</span>
                <span className="tip-text">{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="ingredients-section">
          <h3>📦 {t("prepGuide.ingredientsTitle")}</h3>
          <div className="ingredients-grid">
            {prepGuide.ingredientSummary
              .sort((a, b) => b.totalGrams - a.totalGrams)
              .slice(0, 8)
              .map((ingredient, index) => (
                <div key={`${ingredient.ingredient}-${index}`} className="ingredient-card">
                  <div className="ingredient-name">{localizeFoodName(ingredient.ingredient, "pt")}</div>
                  <div className="ingredient-quantity">{(ingredient.totalGrams / 1000).toFixed(1)}kg</div>
                  <div className="ingredient-method">{t(`prepGuide.method.${ingredient.cookingMethod}`)}</div>
                </div>
              ))}
          </div>
        </section>

        <div className="action-buttons">
          <button className="btn-primary btn-print" onClick={handlePrintGuide}>
            🖨️ {canExportPdf() ? t("prepGuide.printButton") : t("prepGuide.printButtonPremium")}
          </button>

          <Link className="btn-secondary" href="/app/list">🛍️ {t("prepGuide.viewShoppingButton")}</Link>
        </div>

        {!isPremium && (
          <div className="prep-upgrade-callout">
            <h4>🔒 {t("prepGuide.upgradeTitle")}</h4>
            <p>{t("prepGuide.upgradeSubtitle")}</p>
            <Link className="btn-secondary" href="/pricing">{t("prepGuide.upgradeButton")}</Link>
          </div>
        )}

        {taskProgress === 100 && (
          <div className="completion-celebration">
            <div className="celebration-content">
              <div className="celebration-icon">🎉</div>
              <h2>{t("prepGuide.completionTitle")}</h2>
              <p>{t("prepGuide.completionSubtitle")}</p>
            </div>
          </div>
        )}

        {statusMessage ? <p className="np-inline-note">{statusMessage}</p> : null}
      </main>
    </div>
  );
}

interface TaskCardProps {
  task: CookingTask;
  completed: boolean;
  onToggle: () => void;
}

function TaskCard({ task, completed, onToggle }: TaskCardProps) {
  const { t } = useAppTranslation();

  const methodEmoji: Record<string, string> = {
    oven: "🔥",
    boil: "🫕",
    steam: "♨️",
    stovetop: "🍳",
    chop: "🔪",
    raw: "🥗",
    portion: "📦",
  };

  const methodColor: Record<string, string> = {
    oven: "#ff6b6b",
    boil: "#4ecdc4",
    steam: "#95e1d3",
    stovetop: "#f38181",
    chop: "#aa96da",
    raw: "#fcbad3",
    portion: "#a8dadc",
  };

  return (
    <div className={`task-card ${completed ? "completed" : ""}`}>
      <div className="task-checkbox-container">
        <input type="checkbox" checked={completed} onChange={onToggle} className="task-checkbox" />
      </div>

      <div className="task-content">
        <div className="task-header">
          <span className="task-order">{t("prepGuide.taskStep", { order: task.order })}</span>
          <span className="task-method-badge" style={{ backgroundColor: methodColor[task.method] }}>
            {methodEmoji[task.method]} {t(`prepGuide.method.${task.method}`)}
          </span>
          {task.parallel && (
            <span className="task-parallel-badge">⚡ {t("prepGuide.taskParallel")}</span>
          )}
        </div>

        <div className="task-main">
          <div className="task-action">
            {task.action} {localizeFoodText(task.quantity, "pt")} {localizeFoodName(task.ingredient, "pt")}
          </div>
          {task.duration > 0 && (
            <div className="task-duration">⏱️ {t("prepGuide.taskDurationMinutes", { minutes: task.duration })}</div>
          )}
        </div>

        <div className="task-instructions">{localizeFoodText(task.instructions, "pt")}</div>

        {task.temperature && (
          <div className="task-temperature">🌡️ {task.temperature}</div>
        )}
      </div>
    </div>
  );
}
