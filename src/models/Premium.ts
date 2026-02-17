/**
 * PASSO 39: Premium Subscription Models
 * 
 * Types for Stripe Checkout integration and premium feature management
 */

export type SubscriptionStatus = 
  | "active" 
  | "canceled" 
  | "past_due" 
  | "trialing" 
  | "incomplete" 
  | "inactive";

export type SubscriptionPlan = "free" | "premium";

export interface PremiumSubscription {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutSession {
  sessionId: string;
  userId: string;
  plan: SubscriptionPlan;
  amount: number; // in cents
  currency: string;
  status: "pending" | "completed" | "expired";
  checkoutUrl?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface PremiumFeatures {
  pdfExport: boolean;
  smartSavingsUnlimited: boolean;
  mealPrepGuidePrint: boolean;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
}

export interface SubscriptionPrice {
  plan: SubscriptionPlan;
  amount: number; // in cents
  currency: string;
  interval: "month" | "year";
  displayPrice: string; // e.g., "€9.99/month"
}

export interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "sepa_debit";
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface BillingHistory {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: "succeeded" | "pending" | "failed";
  description: string;
  invoiceUrl?: string;
  createdAt: Date;
}

// Helper functions
export function isPremiumActive(subscription: PremiumSubscription): boolean {
  return subscription.status === "active" || subscription.status === "trialing";
}

export function getPremiumFeatures(subscription: PremiumSubscription): PremiumFeatures {
  const isActive = isPremiumActive(subscription);
  
  return {
    pdfExport: isActive,
    smartSavingsUnlimited: isActive,
    mealPrepGuidePrint: isActive,
    prioritySupport: isActive,
    advancedAnalytics: isActive,
  };
}

export function getDaysUntilRenewal(subscription: PremiumSubscription): number | null {
  if (!subscription.currentPeriodEnd) return null;
  
  const now = new Date();
  const end = new Date(subscription.currentPeriodEnd);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export const SUBSCRIPTION_PRICES: SubscriptionPrice[] = [
  {
    plan: "free",
    amount: 0,
    currency: "EUR",
    interval: "month",
    displayPrice: "Free"
  },
  {
    plan: "premium",
    amount: 999, // €9.99 in cents
    currency: "EUR",
    interval: "month",
    displayPrice: "€9.99/month"
  }
];

export function getSubscriptionPrice(plan: SubscriptionPlan): SubscriptionPrice {
  return SUBSCRIPTION_PRICES.find(p => p.plan === plan) || SUBSCRIPTION_PRICES[0];
}
