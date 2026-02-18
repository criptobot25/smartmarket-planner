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
import { useTranslation } from "react-i18next";
import "./WeeklyCheckInModal.css";
import { WeeklyFeedbackResponse } from "../../hooks/useWeeklyFeedback";

interface WeeklyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (response: WeeklyFeedbackResponse) => void;
}

export function WeeklyCheckInModal({ isOpen, onClose, onSubmit }: WeeklyCheckInModalProps) {
  const { t } = useTranslation();
  const [selectedResponse, setSelectedResponse] = useState<WeeklyFeedbackResponse | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedResponse) {
      alert(t("weeklyCheckin.selectAnswer"));
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
          <h2 className="modal-title">📊 {t("weeklyCheckin.title")}</h2>
          <p className="modal-subtitle">
            {t("weeklyCheckin.subtitle")}
          </p>
        </div>

        <div className="modal-body">
          <p className="check-in-question">
            {t("weeklyCheckin.question")}
          </p>

          <div className="adherence-options">
            <button
              className={`adherence-option ${selectedResponse === "yes" ? "selected" : ""}`}
              onClick={() => setSelectedResponse("yes")}
            >
              <span className="option-icon">✅</span>
              <span className="option-label">{t("weeklyCheckin.option.yes.label")}</span>
              <span className="option-range">{t("weeklyCheckin.option.yes.desc")}</span>
            </button>

            <button
              className={`adherence-option ${selectedResponse === "partially" ? "selected" : ""}`}
              onClick={() => setSelectedResponse("partially")}
            >
              <span className="option-icon">👍</span>
              <span className="option-label">{t("weeklyCheckin.option.partially.label")}</span>
              <span className="option-range">{t("weeklyCheckin.option.partially.desc")}</span>
            </button>

            <button
              className={`adherence-option ${selectedResponse === "no" ? "selected" : ""}`}
              onClick={() => setSelectedResponse("no")}
            >
              <span className="option-icon">⚠️</span>
              <span className="option-label">{t("weeklyCheckin.option.no.label")}</span>
              <span className="option-range">{t("weeklyCheckin.option.no.desc")}</span>
            </button>
          </div>

          {selectedResponse === "no" && (
            <div className="adaptation-notice">
              <p>
                💡 <strong>{t("weeklyCheckin.adaptationTitle")}</strong>
              </p>
              <ul>
                <li>{t("weeklyCheckin.adaptation1")}</li>
                <li>{t("weeklyCheckin.adaptation2")}</li>
                <li>{t("weeklyCheckin.adaptation3")}</li>
              </ul>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleSkip}>
            {t("weeklyCheckin.skip")}
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSubmit}
            disabled={!selectedResponse}
          >
            {t("weeklyCheckin.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
