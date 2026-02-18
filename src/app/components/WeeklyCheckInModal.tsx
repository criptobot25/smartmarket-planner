/**
 * PASSO 33.2: Weekly Check-In Modal
 * ==================================
 * 
 * Feedback loop for continuous plan improvement.
 * 
 * ADHERENCE TRACKING:
 * - ✅ 90-100%: High adherence (plan is working well)
 * - 👍 70-89%: Good adherence (minor adjustments needed)
 * - ⚠️ Below 70%: Low adherence (simplify next week)
 * 
 * ADAPTIVE ADJUSTMENTS:
 * - Low adherence → simpler foods, less variety constraints
 * - High adherence → maintain current complexity
 * 
 * WHY THIS MATTERS:
 * - Plans improve over time based on real behavior
 * - Reduces dropout from overly complex plans
 * - Increases long-term user retention
 */

import { useState } from "react";
import "./WeeklyCheckInModal.css";
import { WeeklyFeedbackResponse } from "../../hooks/useWeeklyFeedback";

interface WeeklyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (response: WeeklyFeedbackResponse) => void;
}

export function WeeklyCheckInModal({ isOpen, onClose, onSubmit }: WeeklyCheckInModalProps) {
  const [selectedResponse, setSelectedResponse] = useState<WeeklyFeedbackResponse | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedResponse) {
      alert("Please select an answer");
      return;
    }

    onSubmit(selectedResponse);
    onClose();
    setSelectedResponse(null);
  };

  const handleSkip = () => {
    onClose();
    setSelectedResponse(null);
  };

  return (
    <div className="modal-overlay" onClick={handleSkip}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📊 Weekly Check-In</h2>
          <p className="modal-subtitle">
            Help us improve your next week automatically
          </p>
        </div>

        <div className="modal-body">
          <p className="check-in-question">
            Did you follow the plan this week?
          </p>

          <div className="adherence-options">
            <button
              className={`adherence-option ${selectedResponse === "yes" ? "selected" : ""}`}
              onClick={() => setSelectedResponse("yes")}
            >
              <span className="option-icon">✅</span>
              <span className="option-label">Yes</span>
              <span className="option-range">I followed it well</span>
            </button>

            <button
              className={`adherence-option ${selectedResponse === "partially" ? "selected" : ""}`}
              onClick={() => setSelectedResponse("partially")}
            >
              <span className="option-icon">👍</span>
              <span className="option-label">Partially</span>
              <span className="option-range">Some meals worked, some didn't</span>
            </button>

            <button
              className={`adherence-option ${selectedResponse === "no" ? "selected" : ""}`}
              onClick={() => setSelectedResponse("no")}
            >
              <span className="option-icon">⚠️</span>
              <span className="option-label">No</span>
              <span className="option-range">Too hard to follow this week</span>
            </button>
          </div>

          {selectedResponse === "no" && (
            <div className="adaptation-notice">
              <p>
                💡 <strong>Next week will be optimized for easier adherence:</strong>
              </p>
              <ul>
                <li>Simpler, more familiar foods</li>
                <li>Reduced variety requirements</li>
                <li>Budget-friendly options prioritized</li>
              </ul>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleSkip}>
            Skip for now
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSubmit}
            disabled={!selectedResponse}
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
