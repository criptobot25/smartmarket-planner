/**
 * PASSO 39: Premium Upgrade Prompts
 * 
 * Components to show when users try to access premium features
 */

import React from "react";
import { startPremiumCheckout, completePremiumCheckout } from "../core/premium/PremiumProvider";

interface PremiumUpgradePromptProps {
  userId: string;
  feature: "PDF Export" | "Smart Savings Unlimited" | "Meal Prep Guide Print";
  onUpgrade?: () => void;
}

export const PremiumUpgradePrompt: React.FC<PremiumUpgradePromptProps> = ({
  userId,
  feature,
  onUpgrade,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const session = await startPremiumCheckout(userId);
      console.log(`[Upgrade] Starting checkout for ${feature}`);
      
      // Auto-complete for development
      await completePremiumCheckout(session.sessionId);
      
      if (onUpgrade) onUpgrade();
      
      // Reload page to reflect new premium status
      window.location.reload();
    } catch (error) {
      console.error("Upgrade failed:", error);
      alert("Upgrade failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-upgrade-prompt">
      <div className="upgrade-icon">🌟</div>
      <h3>{feature} is a Premium Feature</h3>
      <p>Upgrade to Premium to unlock {feature} and more!</p>
      
      <div className="upgrade-benefits">
        <div className="benefit">✓ PDF Export</div>
        <div className="benefit">✓ Unlimited Smart Savings</div>
        <div className="benefit">✓ Meal Prep Guide Print</div>
        <div className="benefit">✓ Priority Support</div>
      </div>

      <div className="upgrade-price">
        <span className="price">€9.99</span>
        <span className="period">/month</span>
      </div>

      <button
        className="btn-upgrade-now"
        onClick={handleUpgrade}
        disabled={loading}
      >
        {loading ? "Processing..." : "Upgrade to Premium"}
      </button>

      <p className="upgrade-note">Cancel anytime. No long-term commitment.</p>
    </div>
  );
};

// Inline upgrade badge for buttons
export const PremiumBadgeInline: React.FC = () => {
  return <span className="premium-badge-inline">⭐ Premium</span>;
};

// Small upgrade button for feature locks
interface UpgradeButtonSmallProps {
  userId: string;
  onUpgrade?: () => void;
}

export const UpgradeButtonSmall: React.FC<UpgradeButtonSmallProps> = ({
  userId,
  onUpgrade,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const session = await startPremiumCheckout(userId);
      await completePremiumCheckout(session.sessionId);
      if (onUpgrade) onUpgrade();
      window.location.reload();
    } catch (error) {
      console.error("Upgrade failed:", error);
      alert("Upgrade failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn-upgrade-small"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "..." : "Upgrade"}
    </button>
  );
};
