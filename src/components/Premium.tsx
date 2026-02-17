/**
 * PASSO 39: Premium Checkout & Subscription UI Components
 * 
 * Components:
 * - PremiumCard: Feature comparison and CTA
 * - CheckoutButton: Stripe checkout trigger
 * - SubscriptionManager: Manage active subscription
 * - BillingHistoryTable: Invoice history
 * - FeatureGate: Restrict features to premium users
 */

import React, { useState, useEffect } from "react";
import {
  PremiumSubscription,
  BillingHistory,
  PaymentMethod,
  getDaysUntilRenewal,
  getSubscriptionPrice,
} from "../models/Premium";
import {
  getUserSubscription,
  startPremiumCheckout,
  completePremiumCheckout,
  cancelUserSubscription,
  reactivateUserSubscription,
  getUserBillingHistory,
  getUserPaymentMethods,
  isUserPremium,
} from "../core/premium/PremiumProvider";

// ============================================================================
// PREMIUM CARD (Feature Comparison & CTA)
// ============================================================================

interface PremiumCardProps {
  userId: string;
  onCheckout?: () => void;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({ userId, onCheckout }) => {
  const [subscription, setSubscription] = useState<PremiumSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, [userId]);

  const loadSubscription = async () => {
    try {
      const sub = await getUserSubscription(userId);
      setSubscription(sub);
    } catch (error) {
      console.error("Failed to load subscription:", error);
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const session = await startPremiumCheckout(userId);
      
      // In production, redirect to session.checkoutUrl
      // For now, auto-complete checkout
      console.log("Checkout session created:", session);
      
      // Simulate payment success
      await completePremiumCheckout(session.sessionId);
      await loadSubscription();
      
      if (onCheckout) onCheckout();
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isPremium = subscription?.plan === "premium";
  const price = getSubscriptionPrice("premium");

  return (
    <div className="premium-card">
      <div className="premium-header">
        <h2>🌟 SmartMarket Premium</h2>
        <p className="premium-price">{price.displayPrice}</p>
      </div>

      <div className="premium-features">
        <div className="feature-item">
          <span className="feature-icon">📄</span>
          <div>
            <strong>PDF Export</strong>
            <p>Export meal plans and shopping lists as PDF</p>
          </div>
        </div>

        <div className="feature-item">
          <span className="feature-icon">💰</span>
          <div>
            <strong>Smart Savings Unlimited</strong>
            <p>Unlimited budget optimizations</p>
          </div>
        </div>

        <div className="feature-item">
          <span className="feature-icon">📋</span>
          <div>
            <strong>Meal Prep Guide Print</strong>
            <p>Print professional meal prep instructions</p>
          </div>
        </div>

        <div className="feature-item">
          <span className="feature-icon">⚡</span>
          <div>
            <strong>Priority Support</strong>
            <p>Get help faster with priority support</p>
          </div>
        </div>

        <div className="feature-item">
          <span className="feature-icon">📊</span>
          <div>
            <strong>Advanced Analytics</strong>
            <p>Track nutrition trends over time</p>
          </div>
        </div>
      </div>

      {!isPremium && (
        <button 
          className="btn-premium-upgrade"
          onClick={handleUpgrade}
          disabled={loading}
        >
          {loading ? "Processing..." : "Upgrade to Premium"}
        </button>
      )}

      {isPremium && (
        <div className="premium-active">
          <span className="premium-badge">✓ Premium Active</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CHECKOUT BUTTON
// ============================================================================

interface CheckoutButtonProps {
  userId: string;
  onSuccess?: (subscription: PremiumSubscription) => void;
  onError?: (error: Error) => void;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({ 
  userId, 
  onSuccess, 
  onError 
}) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Create checkout session
      const session = await startPremiumCheckout(userId);
      
      console.log(`[Checkout] Redirecting to: ${session.checkoutUrl}`);
      
      // In production: window.location.href = session.checkoutUrl
      // For development: auto-complete
      const subscription = await completePremiumCheckout(session.sessionId);
      
      if (onSuccess) onSuccess(subscription);
    } catch (error) {
      console.error("Checkout error:", error);
      if (onError) onError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn-checkout"
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading ? "Starting checkout..." : "Subscribe Now"}
    </button>
  );
};

// ============================================================================
// SUBSCRIPTION MANAGER
// ============================================================================

interface SubscriptionManagerProps {
  userId: string;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ userId }) => {
  const [subscription, setSubscription] = useState<PremiumSubscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      const [sub, methods] = await Promise.all([
        getUserSubscription(userId),
        getUserPaymentMethods(userId),
      ]);
      setSubscription(sub);
      setPaymentMethods(methods);
    } catch (error) {
      console.error("Failed to load subscription data:", error);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    
    setLoading(true);
    try {
      const updated = await cancelUserSubscription(userId);
      setSubscription(updated);
      alert("Subscription canceled. Access continues until period end.");
    } catch (error) {
      console.error("Cancel failed:", error);
      alert("Failed to cancel subscription.");
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    setLoading(true);
    try {
      const updated = await reactivateUserSubscription(userId);
      setSubscription(updated);
      alert("Subscription reactivated!");
    } catch (error) {
      console.error("Reactivate failed:", error);
      alert("Failed to reactivate subscription.");
    } finally {
      setLoading(false);
    }
  };

  if (!subscription || subscription.plan === "free") {
    return <div className="no-subscription">No active subscription</div>;
  }

  const daysUntilRenewal = getDaysUntilRenewal(subscription);

  return (
    <div className="subscription-manager">
      <div className="subscription-status">
        <h3>Your Subscription</h3>
        <div className="status-badge status-active">
          {subscription.status}
        </div>
      </div>

      <div className="subscription-details">
        <div className="detail-row">
          <span>Plan:</span>
          <strong>{subscription.plan}</strong>
        </div>
        
        {subscription.currentPeriodEnd && (
          <div className="detail-row">
            <span>Renews:</span>
            <strong>
              {subscription.currentPeriodEnd.toLocaleDateString()}
              {daysUntilRenewal && ` (${daysUntilRenewal} days)`}
            </strong>
          </div>
        )}

        {subscription.cancelAtPeriodEnd && (
          <div className="cancel-notice">
            ⚠️ Subscription will cancel on {subscription.currentPeriodEnd?.toLocaleDateString()}
          </div>
        )}
      </div>

      {paymentMethods.length > 0 && (
        <div className="payment-method">
          <h4>Payment Method</h4>
          {paymentMethods.map(method => (
            <div key={method.id} className="payment-card">
              {method.brand} •••• {method.last4}
            </div>
          ))}
        </div>
      )}

      <div className="subscription-actions">
        {subscription.cancelAtPeriodEnd ? (
          <button 
            className="btn-reactivate"
            onClick={handleReactivate}
            disabled={loading}
          >
            Reactivate Subscription
          </button>
        ) : (
          <button 
            className="btn-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel Subscription
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// BILLING HISTORY TABLE
// ============================================================================

interface BillingHistoryTableProps {
  userId: string;
}

export const BillingHistoryTable: React.FC<BillingHistoryTableProps> = ({ userId }) => {
  const [history, setHistory] = useState<BillingHistory[]>([]);

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    try {
      const records = await getUserBillingHistory(userId);
      setHistory(records);
    } catch (error) {
      console.error("Failed to load billing history:", error);
    }
  };

  if (history.length === 0) {
    return <div className="no-billing">No billing history</div>;
  }

  return (
    <div className="billing-history">
      <h3>Billing History</h3>
      <table className="billing-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map(record => (
            <tr key={record.id}>
              <td>{record.createdAt.toLocaleDateString()}</td>
              <td>{record.description}</td>
              <td>
                {record.currency} {(record.amount / 100).toFixed(2)}
              </td>
              <td>
                <span className={`status-${record.status}`}>
                  {record.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// FEATURE GATE (Restrict to Premium)
// ============================================================================

interface FeatureGateProps {
  userId: string;
  feature: "pdfExport" | "smartSavingsUnlimited" | "mealPrepGuidePrint";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ 
  userId, 
  feature, 
  children, 
  fallback 
}) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [userId, feature]);

  const checkAccess = async () => {
    try {
      const isPremium = await isUserPremium(userId);
      setHasAccess(isPremium);
    } catch (error) {
      console.error("Failed to check premium status:", error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasAccess) {
    return (
      <>
        {fallback || (
          <div className="feature-locked">
            <span className="lock-icon">🔒</span>
            <p>This feature requires Premium</p>
            <button className="btn-upgrade-small">Upgrade Now</button>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
};

// ============================================================================
// PREMIUM STATUS BADGE
// ============================================================================

interface PremiumBadgeProps {
  userId: string;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ userId }) => {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    checkPremium();
  }, [userId]);

  const checkPremium = async () => {
    try {
      const premium = await isUserPremium(userId);
      setIsPremium(premium);
    } catch (error) {
      console.error("Failed to check premium status:", error);
    }
  };

  if (!isPremium) return null;

  return <span className="premium-badge">⭐ Premium</span>;
};

// ============================================================================
// MAIN PREMIUM CONTAINER
// ============================================================================

interface PremiumProps {
  userId: string;
}

export const Premium: React.FC<PremiumProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "billing">("overview");

  return (
    <div className="premium-container">
      <div className="premium-tabs">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={activeTab === "billing" ? "active" : ""}
          onClick={() => setActiveTab("billing")}
        >
          Billing
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="premium-overview">
          <PremiumCard userId={userId} />
          <SubscriptionManager userId={userId} />
        </div>
      )}

      {activeTab === "billing" && (
        <div className="premium-billing">
          <BillingHistoryTable userId={userId} />
        </div>
      )}
    </div>
  );
};
