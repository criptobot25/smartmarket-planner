import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShoppingPlan } from "../../contexts/ShoppingPlanContext";
import { aggregateShoppingList, AggregatedShoppingItem } from "../../core/logic/aggregateShoppingList";
import { FoodItem } from "../../core/models/FoodItem";
import { generateMealPrepGuide, CookingTask, MealPrepGuide } from "../../core/logic/MealPrepGuide";
import { exportPrepGuideToPdf } from "../../utils/exportPrepGuidePdf";
import { canExportPdf } from "../../core/premium/features";
import { isPremiumUser } from "../../core/premium/PremiumFeatures";
import { PremiumModal } from "../components/PremiumModal";
import { localizeFoodName, localizeFoodText } from "../utils/foodLocalization";
import "./PrepGuidePage.css";

interface ShoppingItem extends FoodItem {
  purchased?: boolean;
}

export function PrepGuidePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { weeklyPlan, shoppingList } = useShoppingPlan();
  const isPremium = isPremiumUser();
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const planDays = weeklyPlan?.days.length || 7;

  const aggregatedShoppingList = useMemo(
    () => aggregateShoppingList(shoppingList as ShoppingItem[], planDays),
    [shoppingList, planDays]
  );
  const purchasedCount = aggregatedShoppingList.filter((item: AggregatedShoppingItem) => item.purchased).length;
  const totalCount = aggregatedShoppingList.length;
  const shoppingProgress = totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;
  const shoppingCompleted = shoppingProgress === 100;
  const prepUnlocked = shoppingCompleted;

  // Generate prep guide if weeklyPlan exists
  const prepGuide: MealPrepGuide | null = weeklyPlan 
    ? generateMealPrepGuide(weeklyPlan) 
    : null;

  const localizedTips = useMemo(() => {
    if (!prepGuide) return [] as string[];

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

    const vegetableTasksCount = prepGuide.cookingTasks.filter((task) => task.category === "vegetables").length;
    if (vegetableTasksCount > 2) {
      tips.push(t("prepGuide.tips.vegetables"));
    }

    const hasRice = prepGuide.cookingTasks.some((task) => task.ingredient.toLowerCase().includes("rice"));
    if (hasRice) {
      tips.push(t("prepGuide.tips.rice"));
    }

    const hasChicken = prepGuide.cookingTasks.some((task) => task.ingredient.toLowerCase().includes("chicken"));
    if (hasChicken) {
      tips.push(t("prepGuide.tips.chicken"));
    }

    return tips;
  }, [prepGuide, t]);

  // Handle PDF export
  const handlePrintGuide = () => {
    if (!canExportPdf()) {
      setShowPremiumModal(true);
      return;
    }

    if (prepGuide && weeklyPlan) {
      exportPrepGuideToPdf(prepGuide, weeklyPlan);
    }
  };

  // Toggle task completion
  const toggleTask = (taskOrder: number) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskOrder)) {
        newSet.delete(taskOrder);
      } else {
        newSet.add(taskOrder);
      }
      return newSet;
    });
  };

  // Empty state
  if (!weeklyPlan || !prepGuide) {
    return (
      <div className="prep-guide-page">
        <div className="empty-state">
          <h2>{t("prepGuide.emptyTitle")}</h2>
          <p>{t("prepGuide.emptySubtitle")}</p>
          <button className="btn-primary" onClick={() => navigate("/app")}>
            {t("prepGuide.emptyButton")}
          </button>
        </div>
      </div>
    );
  }

  if (!prepUnlocked) {
    return (
      <div className="prep-guide-page">
        <div className="empty-state">
          <h2>🔒 {t("prepGuide.lockedTitle")}</h2>
          <p>{t("prepGuide.lockedSubtitle")}</p>
          <p>{t("prepGuide.lockedProgress", { progress: shoppingProgress })}</p>
          <button className="btn-primary" onClick={() => navigate("/app/list")}>{t("prepGuide.lockedBackButton")}</button>
        </div>
      </div>
    );
  }

  // Progress calculation
  const completedCount = completedTasks.size;
  const totalTasks = prepGuide.cookingTasks.length;
  const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Difficulty badge color
  const difficultyColor = {
    easy: "#4caf50",
    medium: "#ff9800",
    advanced: "#f44336"
  }[prepGuide.difficulty];

  return (
    <div className="prep-guide-page">
      {/* Header */}
      <header className="prep-guide-header">
        <div className="header-top">
          <button className="btn-back" onClick={() => navigate("/app/list")}>
            ← {t("prepGuide.backButton")}
          </button>
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
              <div 
                className="summary-value difficulty-badge" 
                style={{ color: difficultyColor }}
              >
                {t(`prepGuide.difficulty.${prepGuide.difficulty}`)}
              </div>
              <div className="summary-detail">{t("prepGuide.summaryDifficultyDetail", { count: totalTasks })}</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <div className="summary-content">
              <div className="summary-label">{t("prepGuide.summaryProgressLabel")}</div>
              <div className="summary-value">{progress}%</div>
              <div className="summary-detail">{t("prepGuide.summaryProgressDetail", { count: completedCount, total: totalTasks })}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <div className="prep-guide-content">
        {/* Cooking Tasks Checklist */}
        <section className="cooking-tasks-section">
          <div className="section-header">
            <h2>📝 {t("prepGuide.checklistTitle")}</h2>
            <p className="section-subtitle">
              {t("prepGuide.checklistSubtitle")}
            </p>
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

        {/* Tips Section */}
        <section className="tips-section">
          <h3>💡 {t("prepGuide.tipsTitle")}</h3>
          <ul className="tips-list">
            {localizedTips.map((tip, index) => (
              <li key={index} className="tip-item">
                <span className="tip-bullet">•</span>
                <span className="tip-text">{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Ingredient Summary */}
        <section className="ingredients-section">
          <h3>📦 {t("prepGuide.ingredientsTitle")}</h3>
          <div className="ingredients-grid">
            {prepGuide.ingredientSummary
              .sort((a, b) => b.totalGrams - a.totalGrams)
              .slice(0, 8) // Top 8 ingredients
              .map((ingredient, index) => (
                <div key={index} className="ingredient-card">
                  <div className="ingredient-name">{localizeFoodName(ingredient.ingredient, i18n.language)}</div>
                  <div className="ingredient-quantity">
                    {(ingredient.totalGrams / 1000).toFixed(1)}kg
                  </div>
                  <div className="ingredient-method">
                    {t(`prepGuide.method.${ingredient.cookingMethod}`)}
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="btn-primary btn-print"
            onClick={handlePrintGuide}
          >
            🖨️ {canExportPdf() ? t("prepGuide.printButton") : t("prepGuide.printButtonPremium")}
          </button>
          
          <button 
            className="btn-secondary"
            onClick={() => navigate("/app/list")}
          >
            🛍️ {t("prepGuide.viewShoppingButton")}
          </button>
        </div>

        {!isPremium && (
          <div className="prep-upgrade-callout">
            <h4>🔒 {t("prepGuide.upgradeTitle")}</h4>
            <p>{t("prepGuide.upgradeSubtitle")}</p>
            <button className="btn-secondary" onClick={() => navigate("/pricing")}>{t("prepGuide.upgradeButton")}</button>
          </div>
        )}

        {/* Completion Celebration */}
        {progress === 100 && (
          <div className="completion-celebration">
            <div className="celebration-content">
              <div className="celebration-icon">🎉</div>
              <h2>{t("prepGuide.completionTitle")}</h2>
              <p>{t("prepGuide.completionSubtitle")}</p>
            </div>
          </div>
        )}
      </div>

      {/* Premium Modal */}
      {showPremiumModal && (
        <PremiumModal
          isOpen={showPremiumModal}
          feature="recipePacksPrepPdf"
          onClose={() => setShowPremiumModal(false)}
        />
      )}
    </div>
  );
}

/**
 * Individual task card component
 */
interface TaskCardProps {
  task: CookingTask;
  completed: boolean;
  onToggle: () => void;
}

function TaskCard({ task, completed, onToggle }: TaskCardProps) {
  const { t, i18n } = useTranslation();

  const methodEmoji: Record<string, string> = {
    oven: "🔥",
    boil: "🫕",
    steam: "♨️",
    stovetop: "🍳",
    chop: "🔪",
    raw: "🥗",
    portion: "📦"
  };

  const methodColor: Record<string, string> = {
    oven: "#ff6b6b",
    boil: "#4ecdc4",
    steam: "#95e1d3",
    stovetop: "#f38181",
    chop: "#aa96da",
    raw: "#fcbad3",
    portion: "#a8dadc"
  };

  const actionLabelByValue: Record<string, string> = {
    Bake: t("prepGuide.action.bake"),
    Boil: t("prepGuide.action.boil"),
    Steam: t("prepGuide.action.steam"),
    Chop: t("prepGuide.action.chop"),
    Cook: t("prepGuide.action.cook"),
    Prepare: t("prepGuide.action.prepare"),
    Portion: t("prepGuide.action.portion"),
    Buy: t("prepGuide.action.buy")
  };

  const methodLabelByValue: Record<string, string> = {
    oven: t("prepGuide.method.oven"),
    boil: t("prepGuide.method.boil"),
    steam: t("prepGuide.method.steam"),
    stovetop: t("prepGuide.method.stovetop"),
    chop: t("prepGuide.method.chop"),
    raw: t("prepGuide.method.raw"),
    portion: t("prepGuide.method.portion")
  };

  const localizedAction = actionLabelByValue[task.action] || task.action;
  const localizedIngredient = localizeFoodName(task.ingredient, i18n.language);
  const localizedQuantity = localizeFoodText(task.quantity, i18n.language);
  const localizedMethod = methodLabelByValue[task.method] || task.method.toUpperCase();
  const localizedInstructionsByMethod: Record<string, string> = {
    oven: t("prepGuide.instructions.oven", {
      quantity: localizedQuantity,
      ingredient: localizedIngredient,
      temperature: task.temperature || "180°C",
      duration: task.duration
    }),
    boil: t("prepGuide.instructions.boil", {
      quantity: localizedQuantity,
      ingredient: localizedIngredient,
      duration: task.duration
    }),
    steam: t("prepGuide.instructions.steam", {
      quantity: localizedQuantity,
      ingredient: localizedIngredient,
      duration: task.duration
    }),
    stovetop: t("prepGuide.instructions.stovetop", {
      quantity: localizedQuantity,
      ingredient: localizedIngredient,
      duration: task.duration
    }),
    chop: t("prepGuide.instructions.chop", {
      quantity: localizedQuantity,
      ingredient: localizedIngredient
    }),
    raw: t("prepGuide.instructions.raw", {
      quantity: localizedQuantity,
      ingredient: localizedIngredient
    }),
    portion: t("prepGuide.instructions.portion", {
      quantity: localizedQuantity,
      ingredient: localizedIngredient
    })
  };
  const localizedInstructions = localizedInstructionsByMethod[task.method] || localizeFoodText(task.instructions, i18n.language);

  return (
    <div className={`task-card ${completed ? "completed" : ""}`}>
      <div className="task-checkbox-container">
        <input
          type="checkbox"
          checked={completed}
          onChange={onToggle}
          className="task-checkbox"
        />
      </div>

      <div className="task-content">
        <div className="task-header">
          <span className="task-order">{t("prepGuide.taskStep", { order: task.order })}</span>
          <span 
            className="task-method-badge"
            style={{ backgroundColor: methodColor[task.method] }}
          >
            {methodEmoji[task.method]} {localizedMethod}
          </span>
          {task.parallel && (
            <span className="task-parallel-badge">⚡ {t("prepGuide.taskParallel")}</span>
          )}
        </div>

        <div className="task-main">
          <div className="task-action">
            {localizedAction} {localizedQuantity} {localizedIngredient}
          </div>
          {task.duration > 0 && (
            <div className="task-duration">⏱️ {t("prepGuide.taskDurationMinutes", { minutes: task.duration })}</div>
          )}
        </div>

        <div className="task-instructions">
          {localizedInstructions}
        </div>

        {task.temperature && (
          <div className="task-temperature">
            🌡️ {task.temperature}
          </div>
        )}
      </div>
    </div>
  );
}
