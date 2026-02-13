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

import "./PremiumModal.css";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'budget' | 'pdf';
  remainingOptimizations?: number;
}

export function PremiumModal({ 
  isOpen, 
  onClose, 
  feature,
  remainingOptimizations = 0
}: PremiumModalProps) {
  if (!isOpen) return null;

  const content = feature === 'budget' ? {
    icon: '💰',
    title: 'Unlock Unlimited Budget Optimizations',
    headline: 'Save €20+ per week automatically',
    description: 'Free users get 1 optimization per week. Upgrade to Premium for unlimited budget optimizations while maintaining protein targets and diet variety.',
    benefits: [
      '🔄 Unlimited budget optimizations',
      '💪 Always hit your protein target',
      '🍽️ Maintain diet variety (no "tuna only" diets)',
      '🚫 Respect your food preferences',
      '📊 Protein-per-euro efficiency tracking',
    ],
    cta: 'You have ' + remainingOptimizations + ' free optimization(s) this week',
    price: '€9.99/month'
  } : {
    icon: '📄',
    title: 'Export Your Shopping List to PDF',
    headline: 'Take your list to the supermarket',
    description: 'Premium users can export professionally formatted shopping lists to PDF. Perfect for printing or sharing on WhatsApp.',
    benefits: [
      '📄 Professional PDF export',
      '🛒 Organized by category',
      '💰 Shows total cost and savings',
      '💪 Includes protein totals',
      '📱 Easy to share (WhatsApp, email)',
    ],
    cta: 'Premium feature',
    price: '€9.99/month'
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
            🚀 Upgrade to Premium
          </button>
          <p className="premium-note">
            Payment integration coming soon. This is a demo of premium features.
          </p>
        </div>

        {feature === 'budget' && remainingOptimizations > 0 && (
          <button className="btn-continue-free" onClick={onClose}>
            Continue with free tier ({remainingOptimizations} remaining this week)
          </button>
        )}
      </div>
    </div>
  );
}
