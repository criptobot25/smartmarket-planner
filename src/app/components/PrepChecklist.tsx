/**
 * PASSO 33.5: Sunday Meal Prep Ritual Mode
 * 
 * PrepChecklist Component - Transform meal prep into a peaceful weekly ritual
 * 
 * Design Philosophy:
 * - Make meal prep feel indispensable, not overwhelming
 * - Gamify the process with checkboxes and progress tracking
 * - Use calming Sunday ritual language and aesthetics
 * - Show users exactly what to do, step by step
 * 
 * Scientific Basis:
 * - Checklists reduce cognitive load (Gawande, 2009)
 * - Gamification increases engagement (Deterding et al., 2011)
 * - Ritual framing enhances perceived value (Norton & Gino, 2014)
 */

import { useState, useEffect } from "react";
import { MealPrepSummary } from "../../core/logic/MealPrepSummary";
import "./PrepChecklist.css";

interface PrepChecklistProps {
  mealPrepSummary: MealPrepSummary;
  weekId?: string; // Optional: for persisting checked state
}

interface CheckedState {
  [stepOrder: number]: boolean;
}

export function PrepChecklist({ mealPrepSummary, weekId }: PrepChecklistProps) {
  const [checkedSteps, setCheckedSteps] = useState<CheckedState>({});
  const [isExpanded, setIsExpanded] = useState(true);

  // Load checked state from localStorage
  useEffect(() => {
    if (weekId) {
      const saved = localStorage.getItem(`prep-checklist-${weekId}`);
      if (saved) {
        setCheckedSteps(JSON.parse(saved));
      }
    }
  }, [weekId]);

  // Save checked state to localStorage
  useEffect(() => {
    if (weekId) {
      localStorage.setItem(`prep-checklist-${weekId}`, JSON.stringify(checkedSteps));
    }
  }, [checkedSteps, weekId]);

  const handleToggleStep = (stepOrder: number) => {
    setCheckedSteps(prev => ({
      ...prev,
      [stepOrder]: !prev[stepOrder]
    }));
  };

  const totalSteps = mealPrepSummary.sundayPrepList.length;
  const completedSteps = Object.values(checkedSteps).filter(Boolean).length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const isComplete = completedSteps === totalSteps && totalSteps > 0;

  return (
    <div className="prep-checklist-container">
      {/* Header with progress */}
      <div className="prep-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="prep-header-content">
          <div className="prep-title-section">
            <span className="prep-icon">🍳</span>
            <div className="prep-titles">
              <h3 className="prep-main-title">Your Sunday Prep Checklist</h3>
              <p className="prep-subtitle">
                {isComplete 
                  ? "✨ You're all set! Week prep complete." 
                  : `${totalSteps - completedSteps} steps remaining · ${mealPrepSummary.totalPrepTime}`
                }
              </p>
            </div>
          </div>
          <button className="expand-toggle" aria-label="Toggle checklist">
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="prep-progress-bar">
          <div 
            className="prep-progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Checklist content */}
      {isExpanded && (
        <div className="prep-content">
          {/* Quick summary batches */}
          <div className="prep-batches-quick">
            {mealPrepSummary.proteinBatches.length > 0 && (
              <div className="batch-quick">
                <span className="batch-icon">🍗</span>
                <div className="batch-text">
                  <strong>Proteins</strong>
                  <span>{mealPrepSummary.proteinBatches[0]}</span>
                  {mealPrepSummary.proteinBatches.length > 1 && (
                    <span className="batch-more">+{mealPrepSummary.proteinBatches.length - 1} more</span>
                  )}
                </div>
              </div>
            )}

            {mealPrepSummary.grainBatches.length > 0 && (
              <div className="batch-quick">
                <span className="batch-icon">🌾</span>
                <div className="batch-text">
                  <strong>Carbs</strong>
                  <span>{mealPrepSummary.grainBatches[0]}</span>
                  {mealPrepSummary.grainBatches.length > 1 && (
                    <span className="batch-more">+{mealPrepSummary.grainBatches.length - 1} more</span>
                  )}
                </div>
              </div>
            )}

            {mealPrepSummary.vegetableBatches.length > 0 && (
              <div className="batch-quick">
                <span className="batch-icon">🥬</span>
                <div className="batch-text">
                  <strong>Vegetables</strong>
                  <span>{mealPrepSummary.vegetableBatches[0]}</span>
                  {mealPrepSummary.vegetableBatches.length > 1 && (
                    <span className="batch-more">+{mealPrepSummary.vegetableBatches.length - 1} more</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Step-by-step checklist */}
          <div className="prep-steps-checklist">
            <h4 className="steps-title">📋 Prep Steps</h4>
            <div className="steps-list">
              {mealPrepSummary.sundayPrepList.map((step) => (
                <label 
                  key={step.order} 
                  className={`prep-step-item ${checkedSteps[step.order] ? 'checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checkedSteps[step.order] || false}
                    onChange={() => handleToggleStep(step.order)}
                    className="step-checkbox"
                  />
                  <div className="step-details">
                    <div className="step-header-row">
                      <span className="step-number">{step.order}</span>
                      <span className="step-action-name">{step.action}</span>
                      <span className="step-duration">{step.estimatedTime}</span>
                    </div>
                    <div className="step-body">
                      <p className="step-quantity">{step.quantity}</p>
                      <p className="step-instructions">{step.instructions}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Completion message */}
          {isComplete && (
            <div className="prep-complete-message">
              <span className="complete-icon">🎉</span>
              <div className="complete-text">
                <strong>Week prep complete!</strong>
                <p>Your meals are ready. Now relax and enjoy your week stress-free.</p>
              </div>
            </div>
          )}

          {/* Meal prep tips */}
          {mealPrepSummary.tips.length > 0 && (
            <div className="prep-tips-section">
              <h4 className="tips-title">💡 Pro Tips</h4>
              <ul className="tips-list">
                {mealPrepSummary.tips.slice(0, 3).map((tip, i) => (
                  <li key={i} className="tip-item">{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
