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

export interface AdherenceScore {
  score: number; // 0-100
  timestamp: string;
  level: "high" | "good" | "low";
}

interface WeeklyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (adherence: AdherenceScore) => void;
}

export function WeeklyCheckInModal({ isOpen, onClose, onSubmit }: WeeklyCheckInModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<"high" | "good" | "low" | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedLevel) {
      alert("Please select how well you followed the plan");
      return;
    }

    let score: number;
    switch (selectedLevel) {
      case "high":
        score = 95; // 90-100% average
        break;
      case "good":
        score = 80; // 70-89% average
        break;
      case "low":
        score = 50; // Below 70% average
        break;
    }

    const adherence: AdherenceScore = {
      score,
      timestamp: new Date().toISOString(),
      level: selectedLevel
    };

    onSubmit(adherence);
    onClose();
    setSelectedLevel(null);
  };

  const handleSkip = () => {
    onClose();
    setSelectedLevel(null);
  };

  return (
    <div className="modal-overlay" onClick={handleSkip}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📊 Weekly Check-In</h2>
          <p className="modal-subtitle">
            Help us improve your next plan
          </p>
        </div>

        <div className="modal-body">
          <p className="check-in-question">
            How well did you follow last week's plan?
          </p>

          <div className="adherence-options">
            <button
              className={`adherence-option ${selectedLevel === "high" ? "selected" : ""}`}
              onClick={() => setSelectedLevel("high")}
            >
              <span className="option-icon">✅</span>
              <span className="option-label">Excellent</span>
              <span className="option-range">90-100%</span>
            </button>

            <button
              className={`adherence-option ${selectedLevel === "good" ? "selected" : ""}`}
              onClick={() => setSelectedLevel("good")}
            >
              <span className="option-icon">👍</span>
              <span className="option-label">Good</span>
              <span className="option-range">70-89%</span>
            </button>

            <button
              className={`adherence-option ${selectedLevel === "low" ? "selected" : ""}`}
              onClick={() => setSelectedLevel("low")}
            >
              <span className="option-icon">⚠️</span>
              <span className="option-label">Struggled</span>
              <span className="option-range">Below 70%</span>
            </button>
          </div>

          {selectedLevel === "low" && (
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
            disabled={!selectedLevel}
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
