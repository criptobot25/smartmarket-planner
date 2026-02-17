import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShoppingPlan } from "../../contexts/ShoppingPlanContext";
import { generateMealPrepGuide, CookingTask, MealPrepGuide } from "../../core/logic/MealPrepGuide";
import { exportPrepGuideToPdf } from "../../utils/exportPrepGuidePdf";
import { canExportPdf } from "../../core/premium/features";
import { PremiumModal } from "../components/PremiumModal";
import "./PrepGuidePage.css";

export function PrepGuidePage() {
  const navigate = useNavigate();
  const { weeklyPlan } = useShoppingPlan();
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Generate prep guide if weeklyPlan exists
  const prepGuide: MealPrepGuide | null = weeklyPlan 
    ? generateMealPrepGuide(weeklyPlan) 
    : null;

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
          <h2>📋 No Meal Plan Yet</h2>
          <p>Generate a weekly meal plan first to see your Sunday prep guide.</p>
          <button className="btn-primary" onClick={() => navigate("/app")}>
            Create Meal Plan
          </button>
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
          <button className="btn-back" onClick={() => navigate("/app/shopping-list")}>
            ← Back to Shopping List
          </button>
          <h1>🍳 Sunday Meal Prep Guide</h1>
        </div>
        
        <div className="guide-summary">
          <div className="summary-card">
            <div className="summary-icon">⏱️</div>
            <div className="summary-content">
              <div className="summary-label">Total Time</div>
              <div className="summary-value">{prepGuide.totalPrepTime}</div>
              <div className="summary-detail">Sequential: {prepGuide.sequentialTime}</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">🍱</div>
            <div className="summary-content">
              <div className="summary-label">Meals Prepared</div>
              <div className="summary-value">{prepGuide.servingsProduced}</div>
              <div className="summary-detail">Full week ready!</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <div className="summary-label">Difficulty</div>
              <div 
                className="summary-value difficulty-badge" 
                style={{ color: difficultyColor }}
              >
                {prepGuide.difficulty.toUpperCase()}
              </div>
              <div className="summary-detail">{totalTasks} cooking tasks</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <div className="summary-content">
              <div className="summary-label">Progress</div>
              <div className="summary-value">{progress}%</div>
              <div className="summary-detail">{completedCount}/{totalTasks} tasks done</div>
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
            <h2>📝 Cooking Instructions</h2>
            <p className="section-subtitle">
              Follow these steps in order for efficient meal prep
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
          <h3>💡 Pro Tips</h3>
          <ul className="tips-list">
            {prepGuide.tips.map((tip, index) => (
              <li key={index} className="tip-item">
                <span className="tip-bullet">•</span>
                <span className="tip-text">{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Ingredient Summary */}
        <section className="ingredients-section">
          <h3>📦 What You'll Cook</h3>
          <div className="ingredients-grid">
            {prepGuide.ingredientSummary
              .sort((a, b) => b.totalGrams - a.totalGrams)
              .slice(0, 8) // Top 8 ingredients
              .map((ingredient, index) => (
                <div key={index} className="ingredient-card">
                  <div className="ingredient-name">{ingredient.ingredient}</div>
                  <div className="ingredient-quantity">
                    {(ingredient.totalGrams / 1000).toFixed(1)}kg
                  </div>
                  <div className="ingredient-method">
                    {ingredient.cookingMethod}
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
            🖨️ Print Prep Guide {!canExportPdf() && "(Premium)"}
          </button>
          
          <button 
            className="btn-secondary"
            onClick={() => navigate("/app/shopping-list")}
          >
            🛒 View Shopping List
          </button>
        </div>

        {/* Completion Celebration */}
        {progress === 100 && (
          <div className="completion-celebration">
            <div className="celebration-content">
              <div className="celebration-icon">🎉</div>
              <h2>Meal Prep Complete!</h2>
              <p>You're all set for the week. Great job!</p>
            </div>
          </div>
        )}
      </div>

      {/* Premium Modal */}
      {showPremiumModal && (
        <PremiumModal
          isOpen={showPremiumModal}
          feature="pdf"
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
          <span className="task-order">Step {task.order}</span>
          <span 
            className="task-method-badge"
            style={{ backgroundColor: methodColor[task.method] }}
          >
            {methodEmoji[task.method]} {task.method.toUpperCase()}
          </span>
          {task.parallel && (
            <span className="task-parallel-badge">⚡ Can multitask</span>
          )}
        </div>

        <div className="task-main">
          <div className="task-action">
            {task.action} {task.quantity} {task.ingredient}
          </div>
          {task.duration > 0 && (
            <div className="task-duration">⏱️ {task.duration} min</div>
          )}
        </div>

        <div className="task-instructions">
          {task.instructions}
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
