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
import "./PremiumModal.css";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'savings' | 'pdf';
  remainingOptimizations?: number;
}

export function PremiumModal({ 
  isOpen, 
  onClose, 
  feature,
  remainingOptimizations = 0
}: PremiumModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const content = feature === 'savings' ? {
    icon: '⚡',
    title: t("premium.savings.title"),
    headline: t("premium.savings.headline"),
    description: t("premium.savings.description"),
    benefits: [
      t("premium.savings.benefit1"),
      t("premium.savings.benefit2"),
      t("premium.savings.benefit3"),
      t("premium.savings.benefit4"),
      t("premium.savings.benefit5"),
    ],
    cta: t("premium.savings.cta", { count: remainingOptimizations }),
    price: t("premium.price")
  } : {
    icon: '📄',
    title: t("premium.pdf.title"),
    headline: t("premium.pdf.headline"),
    description: t("premium.pdf.description"),
    benefits: [
      t("premium.pdf.benefit1"),
      t("premium.pdf.benefit2"),
      t("premium.pdf.benefit3"),
      t("premium.pdf.benefit4"),
      t("premium.pdf.benefit5"),
    ],
    cta: t("premium.pdf.cta"),
    price: t("premium.price")
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
          <button className="btn-premium-upgrade" disabled>
            {t("premium.upgradeButton")}
          </button>
          <p className="premium-note">
            {t("premium.note")}
          </p>
        </div>

        {feature === 'savings' && remainingOptimizations > 0 && (
          <button className="btn-continue-free" onClick={onClose}>
            {t("premium.continueFree", { count: remainingOptimizations })}
          </button>
        )}
      </div>
    </div>
  );
}
