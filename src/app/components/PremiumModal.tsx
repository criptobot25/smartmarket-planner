/**
 * PremiumModal.tsx
 * Modal for premium feature upsell
 * 
 * Purpose: Convert free users to premium when they discover value
 * Trigger: Clicking on premium-only features or exceeding free tier limits
 * 
 * Headline: "Save €20/week automatically while hitting your protein target"
 * 
 * Source: Willingness to pay for cost savings
 * https://www.mckinsey.com/industries/retail/our-insights
 */

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getPremiumFeatureById, PremiumFeatureId } from "../../core/premium/PremiumFeatures";
import "./PremiumModal.css";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: PremiumFeatureId;
  remainingOptimizations?: number;
}

export function PremiumModal({ 
  isOpen, 
  onClose, 
  feature,
  remainingOptimizations = 0
}: PremiumModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  if (!isOpen) return null;

  const selectedFeature = getPremiumFeatureById(feature);

  const benefitsByFeature: Record<PremiumFeatureId, string[]> = {
    unlimitedFoodRotation: [
      "Rotate proteins every week without repeating the same base foods",
      "Keep macro targets stable while swapping ingredients",
      "Reduce adherence drop from menu fatigue"
    ],
    weeklyCoachAdjustments: [
      "Adjust next week based on Yes / Partial / No adherence",
      "Automatically simplify plan when consistency drops",
      "Increase variety when repetition risk is detected"
    ],
    recipePacksPrepPdf: [
      "Unlock premium recipe packs built for meal prep",
      "Export shopping list and prep workflow as PDF",
      "Share or print complete prep instructions"
    ]
  };

  const content = {
    icon: selectedFeature.icon,
    title: "Unlock your NutriPilot Pro Experience",
    headline: selectedFeature.valueProp,
    description: selectedFeature.freeLimit,
    benefits: benefitsByFeature[feature],
    cta: remainingOptimizations > 0
      ? t("premium.savings.cta", { count: remainingOptimizations })
      : "NutriPilot Pro unlocks this instantly",
    price: t("premium.price")
  };

  const handleUpgrade = () => {
    onClose();
    navigate("/pricing");
  };

  return (
    <div className="premium-modal-overlay" onClick={onClose}>
      <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="premium-header">
          <div className="premium-icon">{content.icon}</div>
          <h2 className="premium-title">{content.title}</h2>
          <p className="premium-headline">{content.headline}</p>
        </div>

        <p className="premium-description">{content.description}</p>

        <div className="premium-benefits">
          {content.benefits.map((benefit, index) => (
            <div key={index} className="benefit-item">
              {benefit}
            </div>
          ))}
        </div>

        <div className="premium-pricing">
          <div className="price-tag">{content.price}</div>
          <div className="price-subtitle">{content.cta}</div>
        </div>

        <div className="premium-actions">
          <button className="btn-premium-upgrade" onClick={handleUpgrade}>
            {t("premium.upgradeButton")}
          </button>
          <p className="premium-note">
            {t("premium.note")}
          </p>
        </div>

        {feature === 'unlimitedFoodRotation' && remainingOptimizations > 0 && (
          <button className="btn-continue-free" onClick={onClose}>
            {t("premium.continueFree", { count: remainingOptimizations })}
          </button>
        )}
      </div>
    </div>
  );
}
