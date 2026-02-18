/**
 * PASSO 39: Premium Provider - Stripe Integration Abstraction Layer
 * 
 * Architecture:
 * - IPremiumProvider: Interface for premium operations
 * - LocalPremiumProvider: localStorage-based mock for development/testing
 * - RemotePremiumProvider: Real Stripe integration (stub for now)
 * - Singleton pattern with global provider
 */

import {
  PremiumSubscription,
  CheckoutSession,
  SubscriptionPlan,
  BillingHistory,
  PaymentMethod,
  isPremiumActive,
  getPremiumFeatures,
  getSubscriptionPrice,
} from "../../models/Premium";

// ============================================================================
// INTERFACE
// ============================================================================

export interface IPremiumProvider {
  // Subscription management
  getSubscription(userId: string): Promise<PremiumSubscription>;
  createCheckoutSession(userId: string, plan: SubscriptionPlan): Promise<CheckoutSession>;
  verifyCheckoutSession(sessionId: string): Promise<PremiumSubscription>;
  cancelSubscription(userId: string): Promise<PremiumSubscription>;
  reactivateSubscription(userId: string): Promise<PremiumSubscription>;
  
  // Billing
  getBillingHistory(userId: string): Promise<BillingHistory[]>;
  getPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  
  // Feature checks
  isPremium(userId: string): Promise<boolean>;
  hasFeature(userId: string, feature: keyof ReturnType<typeof getPremiumFeatures>): Promise<boolean>;
}

// ============================================================================
// LOCAL PROVIDER (Mock for Development/Testing)
// ============================================================================

export class LocalPremiumProvider implements IPremiumProvider {
  private readonly STORAGE_KEY_PREFIX = "nutripilot_premium_";
  private readonly LEGACY_STORAGE_KEY_PREFIX = "smartmarket_premium_";
  private readonly SESSION_KEY_PREFIX = "nutripilot_checkout_";
  private readonly LEGACY_SESSION_KEY_PREFIX = "smartmarket_checkout_";
  
  async getSubscription(userId: string): Promise<PremiumSubscription> {
    const key = `${this.STORAGE_KEY_PREFIX}${userId}`;
    const legacyKey = `${this.LEGACY_STORAGE_KEY_PREFIX}${userId}`;
    const stored = localStorage.getItem(key) ?? localStorage.getItem(legacyKey);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
        currentPeriodStart: parsed.currentPeriodStart ? new Date(parsed.currentPeriodStart) : undefined,
        currentPeriodEnd: parsed.currentPeriodEnd ? new Date(parsed.currentPeriodEnd) : undefined,
        trialEnd: parsed.trialEnd ? new Date(parsed.trialEnd) : undefined,
      };
    }
    
    // Return free subscription by default
    const freeSubscription: PremiumSubscription = {
      userId,
      plan: "free",
      status: "inactive",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.saveSubscription(freeSubscription);
    return freeSubscription;
  }
  
  async createCheckoutSession(userId: string, plan: SubscriptionPlan): Promise<CheckoutSession> {
    if (plan === "free") {
      throw new Error("Cannot create checkout session for free plan");
    }
    
    const price = getSubscriptionPrice(plan);
    const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const session: CheckoutSession = {
      sessionId,
      userId,
      plan,
      amount: price.amount,
      currency: price.currency,
      status: "pending",
      checkoutUrl: `http://localhost:3000/checkout/${sessionId}`,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
    
    // Store checkout session
    const sessionKey = `${this.SESSION_KEY_PREFIX}${sessionId}`;
    localStorage.setItem(sessionKey, JSON.stringify(session));
    
    console.log(`[Checkout Session] Created: ${sessionId} for user ${userId} - ${price.displayPrice}`);
    
    return session;
  }
  
  async verifyCheckoutSession(sessionId: string): Promise<PremiumSubscription> {
    const sessionKey = `${this.SESSION_KEY_PREFIX}${sessionId}`;
    const legacySessionKey = `${this.LEGACY_SESSION_KEY_PREFIX}${sessionId}`;
    const stored = localStorage.getItem(sessionKey) ?? localStorage.getItem(legacySessionKey);
    
    if (!stored) {
      throw new Error("Checkout session not found");
    }
    
    const session: CheckoutSession = JSON.parse(stored);
    
    if (session.status === "completed") {
      return this.getSubscription(session.userId);
    }
    
    if (session.status === "expired") {
      throw new Error("Checkout session expired");
    }
    
    // Simulate payment completion
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    
    const subscription: PremiumSubscription = {
      userId: session.userId,
      plan: session.plan,
      status: "active",
      stripeCustomerId: `cus_${Math.random().toString(36).substring(7)}`,
      stripeSubscriptionId: `sub_${Math.random().toString(36).substring(7)}`,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    };
    
    // Save subscription
    this.saveSubscription(subscription);
    
    // Update session status
    session.status = "completed";
    localStorage.setItem(sessionKey, JSON.stringify(session));
    
    // Add billing record
    this.addBillingRecord({
      id: `in_${Date.now()}`,
      userId: session.userId,
      amount: session.amount,
      currency: session.currency,
      status: "succeeded",
      description: `${session.plan} subscription - ${getSubscriptionPrice(session.plan).displayPrice}`,
      createdAt: now,
    });
    
    console.log(`[Checkout] Completed: ${sessionId} - User ${session.userId} is now Premium`);
    
    return subscription;
  }
  
  async cancelSubscription(userId: string): Promise<PremiumSubscription> {
    const subscription = await this.getSubscription(userId);
    
    if (subscription.plan === "free") {
      throw new Error("Cannot cancel free subscription");
    }
    
    // Set to cancel at period end (don't immediately revoke access)
    subscription.cancelAtPeriodEnd = true;
    subscription.status = "active"; // Still active until period end
    subscription.updatedAt = new Date();
    
    this.saveSubscription(subscription);
    
    console.log(`[Subscription] Canceled: User ${userId} - will end on ${subscription.currentPeriodEnd}`);
    
    return subscription;
  }
  
  async reactivateSubscription(userId: string): Promise<PremiumSubscription> {
    const subscription = await this.getSubscription(userId);
    
    if (subscription.plan === "free") {
      throw new Error("Cannot reactivate free subscription");
    }
    
    subscription.cancelAtPeriodEnd = false;
    subscription.status = "active";
    subscription.updatedAt = new Date();
    
    this.saveSubscription(subscription);
    
    console.log(`[Subscription] Reactivated: User ${userId}`);
    
    return subscription;
  }
  
  async getBillingHistory(userId: string): Promise<BillingHistory[]> {
    const key = `${this.STORAGE_KEY_PREFIX}billing_${userId}`;
    const legacyKey = `${this.LEGACY_STORAGE_KEY_PREFIX}billing_${userId}`;
    const stored = localStorage.getItem(key) ?? localStorage.getItem(legacyKey);
    
    if (!stored) return [];
    
    const records: BillingHistory[] = JSON.parse(stored);
    return records.map(r => ({
      ...r,
      createdAt: new Date(r.createdAt),
    }));
  }
  
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    // Mock payment method (in real app, would fetch from Stripe)
    const subscription = await this.getSubscription(userId);
    
    if (subscription.plan === "free") return [];
    
    return [
      {
        id: "pm_test_1234",
        type: "card",
        last4: "4242",
        brand: "visa",
        expiryMonth: 12,
        expiryYear: 2026,
        isDefault: true,
      }
    ];
  }
  
  async isPremium(userId: string): Promise<boolean> {
    const subscription = await this.getSubscription(userId);
    return isPremiumActive(subscription);
  }
  
  async hasFeature(userId: string, feature: keyof ReturnType<typeof getPremiumFeatures>): Promise<boolean> {
    const subscription = await this.getSubscription(userId);
    const features = getPremiumFeatures(subscription);
    return features[feature];
  }
  
  // Helper methods
  private saveSubscription(subscription: PremiumSubscription): void {
    const key = `${this.STORAGE_KEY_PREFIX}${subscription.userId}`;
    localStorage.setItem(key, JSON.stringify(subscription));
    localStorage.removeItem(`${this.LEGACY_STORAGE_KEY_PREFIX}${subscription.userId}`);
  }
  
  private addBillingRecord(record: BillingHistory): void {
    const key = `${this.STORAGE_KEY_PREFIX}billing_${record.userId}`;
    const legacyKey = `${this.LEGACY_STORAGE_KEY_PREFIX}billing_${record.userId}`;
    const stored = localStorage.getItem(key) ?? localStorage.getItem(legacyKey);
    const records: BillingHistory[] = stored ? JSON.parse(stored) : [];
    records.unshift(record); // Add to beginning
    localStorage.setItem(key, JSON.stringify(records));
    localStorage.removeItem(legacyKey);
  }
  
  // Test helpers
  clearUserData(userId: string): void {
    localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${userId}`);
    localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}billing_${userId}`);
  }
  
  simulatePeriodEnd(userId: string): void {
    const key = `${this.STORAGE_KEY_PREFIX}${userId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return;
    
    const subscription: PremiumSubscription = JSON.parse(stored);
    
    if (subscription.cancelAtPeriodEnd) {
      // Cancel subscription
      subscription.status = "canceled";
      subscription.plan = "free";
    } else {
      // Renew subscription
      const newPeriodStart = new Date(subscription.currentPeriodEnd!);
      const newPeriodEnd = new Date(newPeriodStart);
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      
      subscription.currentPeriodStart = newPeriodStart;
      subscription.currentPeriodEnd = newPeriodEnd;
      subscription.updatedAt = new Date();
      
      // Add billing record
      const price = getSubscriptionPrice(subscription.plan);
      this.addBillingRecord({
        id: `in_${Date.now()}`,
        userId,
        amount: price.amount,
        currency: price.currency,
        status: "succeeded",
        description: `${subscription.plan} subscription renewal - ${price.displayPrice}`,
        createdAt: new Date(),
      });
    }
    
    localStorage.setItem(key, JSON.stringify(subscription));
  }
}

// ============================================================================
// REMOTE PROVIDER (Stripe Integration)
// ============================================================================

export class RemotePremiumProvider implements IPremiumProvider {
  private localProvider = new LocalPremiumProvider();
  
  // In production, these would use real Stripe API
  // For now, fallback to local provider
  
  async getSubscription(userId: string): Promise<PremiumSubscription> {
    // TODO: Implement Stripe API call
    // const response = await fetch(`/api/subscriptions/${userId}`);
    // return response.json();
    
    console.log("[Remote Premium] Using local fallback for getSubscription");
    return this.localProvider.getSubscription(userId);
  }
  
  async createCheckoutSession(userId: string, plan: SubscriptionPlan): Promise<CheckoutSession> {
    // TODO: Implement Stripe Checkout Session creation
    // const response = await fetch('/api/create-checkout-session', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId, plan })
    // });
    // return response.json();
    
    console.log("[Remote Premium] Using local fallback for createCheckoutSession");
    return this.localProvider.createCheckoutSession(userId, plan);
  }
  
  async verifyCheckoutSession(sessionId: string): Promise<PremiumSubscription> {
    // TODO: Implement Stripe session verification
    // const response = await fetch(`/api/verify-checkout/${sessionId}`);
    // return response.json();
    
    console.log("[Remote Premium] Using local fallback for verifyCheckoutSession");
    return this.localProvider.verifyCheckoutSession(sessionId);
  }
  
  async cancelSubscription(userId: string): Promise<PremiumSubscription> {
    console.log("[Remote Premium] Using local fallback for cancelSubscription");
    return this.localProvider.cancelSubscription(userId);
  }
  
  async reactivateSubscription(userId: string): Promise<PremiumSubscription> {
    console.log("[Remote Premium] Using local fallback for reactivateSubscription");
    return this.localProvider.reactivateSubscription(userId);
  }
  
  async getBillingHistory(userId: string): Promise<BillingHistory[]> {
    console.log("[Remote Premium] Using local fallback for getBillingHistory");
    return this.localProvider.getBillingHistory(userId);
  }
  
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    console.log("[Remote Premium] Using local fallback for getPaymentMethods");
    return this.localProvider.getPaymentMethods(userId);
  }
  
  async isPremium(userId: string): Promise<boolean> {
    return this.localProvider.isPremium(userId);
  }
  
  async hasFeature(userId: string, feature: keyof ReturnType<typeof getPremiumFeatures>): Promise<boolean> {
    return this.localProvider.hasFeature(userId, feature);
  }
}

// ============================================================================
// GLOBAL PROVIDER (Singleton)
// ============================================================================

let globalPremiumProvider: IPremiumProvider = new LocalPremiumProvider();

export function getPremiumProvider(): IPremiumProvider {
  return globalPremiumProvider;
}

export function setPremiumProvider(provider: IPremiumProvider): void {
  globalPremiumProvider = provider;
}

export function resetPremiumProvider(): void {
  globalPremiumProvider = new LocalPremiumProvider();
}

// ============================================================================
// HELPER FUNCTIONS (Use Global Provider)
// ============================================================================

export async function getUserSubscription(userId: string): Promise<PremiumSubscription> {
  return getPremiumProvider().getSubscription(userId);
}

export async function startPremiumCheckout(userId: string): Promise<CheckoutSession> {
  return getPremiumProvider().createCheckoutSession(userId, "premium");
}

export async function completePremiumCheckout(sessionId: string): Promise<PremiumSubscription> {
  return getPremiumProvider().verifyCheckoutSession(sessionId);
}

export async function cancelUserSubscription(userId: string): Promise<PremiumSubscription> {
  return getPremiumProvider().cancelSubscription(userId);
}

export async function reactivateUserSubscription(userId: string): Promise<PremiumSubscription> {
  return getPremiumProvider().reactivateSubscription(userId);
}

export async function isUserPremium(userId: string): Promise<boolean> {
  return getPremiumProvider().isPremium(userId);
}

export async function userHasFeature(userId: string, feature: keyof ReturnType<typeof getPremiumFeatures>): Promise<boolean> {
  return getPremiumProvider().hasFeature(userId, feature);
}

export async function getUserBillingHistory(userId: string): Promise<BillingHistory[]> {
  return getPremiumProvider().getBillingHistory(userId);
}

export async function getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  return getPremiumProvider().getPaymentMethods(userId);
}
