/**
 * PremiumModal.tsx
 * Modal for premium feature upsell
 * 
 * Purpose: Convert free users to premium when they discover value
 * Trigger: Clicking on premium-only features
 */

import "./PremiumModal.css";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export function PremiumModal({ isOpen, onClose, featureName }: PremiumModalProps) {
  if (!isOpen) return null;

  return (
    <div className="premium-modal-overlay" onClick={onClose}>
      <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        
        <div className="modal-icon">🔒</div>
        
        <h2 className="modal-title">Premium Feature</h2>
        
        <p className="modal-description">
          <strong>{featureName}</strong> is available in SmartMarket Premium.
        </p>

        <div className="premium-benefits">
          <h3>Premium includes:</h3>
          <ul>
            <li>📄 Export to PDF</li>
            <li>💰 Budget breakdown by category</li>
            <li>📊 Unlimited plan history</li>
            <li>🎯 Custom macro targets</li>
            <li>🚀 Early access to new features</li>
          </ul>
        </div>

        <div className="premium-price">
          <span className="price-amount">€4.99</span>
          <span className="price-period">/month</span>
        </div>

        <button className="btn-premium-upgrade">
          Join Waitlist
        </button>

        <p className="modal-footer">
          Premium launching soon. Be the first to know!
        </p>
      </div>
    </div>
  );
}
