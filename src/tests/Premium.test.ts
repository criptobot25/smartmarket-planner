/**
 * PASSO 39: Premium Subscription Tests
 * 
 * Test coverage:
 * 1. Premium models and helpers
 * 2. LocalPremiumProvider
 * 3. Checkout flow
 * 4. Subscription management
 * 5. Feature gating
 * 6. Billing history
 * 7. Real-world scenarios
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  PremiumSubscription,
  isPremiumActive,
  getPremiumFeatures,
  getDaysUntilRenewal,
  getSubscriptionPrice,
  SUBSCRIPTION_PRICES,
} from "../models/Premium";
import {
  LocalPremiumProvider,
  getUserSubscription,
  startPremiumCheckout,
  completePremiumCheckout,
  cancelUserSubscription,
  reactivateUserSubscription,
  isUserPremium,
  userHasFeature,
  getUserBillingHistory,
  resetPremiumProvider,
} from "../core/premium/PremiumProvider";

describe("PASSO 39 - Premium Subscription System", () => {
  let provider: LocalPremiumProvider;
  const testUserId = "user-test-123";

  beforeEach(() => {
    // Reset to local provider
    resetPremiumProvider();
    provider = new LocalPremiumProvider();
    
    // Clear test user data
    provider.clearUserData(testUserId);
    localStorage.clear();
  });

  // ========================================================================
  // 1. PREMIUM MODELS & HELPERS
  // ========================================================================

  describe("1. Premium Models & Helpers", () => {
    it("should have correct subscription prices", () => {
      expect(SUBSCRIPTION_PRICES).toHaveLength(2);
      
      const freePrice = getSubscriptionPrice("free");
      expect(freePrice.amount).toBe(0);
      expect(freePrice.displayPrice).toBe("Free");
      
      const premiumPrice = getSubscriptionPrice("premium");
      expect(premiumPrice.amount).toBe(999); // €9.99 in cents
      expect(premiumPrice.displayPrice).toBe("€9.99/month");
      expect(premiumPrice.currency).toBe("EUR");
    });

    it("should check if subscription is active", () => {
      const activeSubscription: PremiumSubscription = {
        userId: "user-1",
        plan: "premium",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(isPremiumActive(activeSubscription)).toBe(true);

      const trialingSubscription: PremiumSubscription = {
        userId: "user-2",
        plan: "premium",
        status: "trialing",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(isPremiumActive(trialingSubscription)).toBe(true);

      const canceledSubscription: PremiumSubscription = {
        userId: "user-3",
        plan: "free",
        status: "canceled",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(isPremiumActive(canceledSubscription)).toBe(false);
    });

    it("should get premium features correctly", () => {
      const premiumSubscription: PremiumSubscription = {
        userId: "user-1",
        plan: "premium",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const features = getPremiumFeatures(premiumSubscription);
      expect(features.pdfExport).toBe(true);
      expect(features.smartSavingsUnlimited).toBe(true);
      expect(features.mealPrepGuidePrint).toBe(true);
      expect(features.prioritySupport).toBe(true);
      expect(features.advancedAnalytics).toBe(true);

      const freeSubscription: PremiumSubscription = {
        userId: "user-2",
        plan: "free",
        status: "inactive",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const freeFeatures = getPremiumFeatures(freeSubscription);
      expect(freeFeatures.pdfExport).toBe(false);
      expect(freeFeatures.smartSavingsUnlimited).toBe(false);
      expect(freeFeatures.mealPrepGuidePrint).toBe(false);
    });

    it("should calculate days until renewal", () => {
      const subscription: PremiumSubscription = {
        userId: "user-1",
        plan: "premium",
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const days = getDaysUntilRenewal(subscription);
      expect(days).toBe(10);

      const noEndDate: PremiumSubscription = {
        userId: "user-2",
        plan: "free",
        status: "inactive",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      expect(getDaysUntilRenewal(noEndDate)).toBeNull();
    });
  });

  // ========================================================================
  // 2. LOCAL PREMIUM PROVIDER
  // ========================================================================

  describe("2. LocalPremiumProvider - Basic Operations", () => {
    it("should return free subscription by default", async () => {
      const subscription = await provider.getSubscription(testUserId);
      
      expect(subscription.userId).toBe(testUserId);
      expect(subscription.plan).toBe("free");
      expect(subscription.status).toBe("inactive");
      expect(subscription.createdAt).toBeInstanceOf(Date);
    });

    it("should persist subscription to localStorage", async () => {
      await provider.getSubscription(testUserId);
      
      const key = `nutripilot_premium_${testUserId}`;
      const stored = localStorage.getItem(key);
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.plan).toBe("free");
    });

    it("should load subscription from localStorage", async () => {
      // First call creates subscription
      await provider.getSubscription(testUserId);
      
      // Second call should load from storage
      const subscription = await provider.getSubscription(testUserId);
      expect(subscription.plan).toBe("free");
    });
  });

  // ========================================================================
  // 3. CHECKOUT FLOW
  // ========================================================================

  describe("3. Checkout Flow", () => {
    it("should create checkout session", async () => {
      const session = await provider.createCheckoutSession(testUserId, "premium");
      
      expect(session.sessionId).toMatch(/^cs_test_/);
      expect(session.userId).toBe(testUserId);
      expect(session.plan).toBe("premium");
      expect(session.amount).toBe(999);
      expect(session.currency).toBe("EUR");
      expect(session.status).toBe("pending");
      expect(session.checkoutUrl).toContain(session.sessionId);
      expect(session.expiresAt).toBeInstanceOf(Date);
    });

    it("should not allow checkout for free plan", async () => {
      await expect(
        provider.createCheckoutSession(testUserId, "free")
      ).rejects.toThrow("Cannot create checkout session for free plan");
    });

    it("should verify and complete checkout session", async () => {
      // Create session
      const session = await provider.createCheckoutSession(testUserId, "premium");
      expect(session.status).toBe("pending");
      
      // Complete checkout
      const subscription = await provider.verifyCheckoutSession(session.sessionId);
      
      expect(subscription.userId).toBe(testUserId);
      expect(subscription.plan).toBe("premium");
      expect(subscription.status).toBe("active");
      expect(subscription.stripeCustomerId).toMatch(/^cus_/);
      expect(subscription.stripeSubscriptionId).toMatch(/^sub_/);
      expect(subscription.currentPeriodStart).toBeInstanceOf(Date);
      expect(subscription.currentPeriodEnd).toBeInstanceOf(Date);
      expect(subscription.cancelAtPeriodEnd).toBe(false);
    });

    it("should create billing record on checkout completion", async () => {
      const session = await provider.createCheckoutSession(testUserId, "premium");
      await provider.verifyCheckoutSession(session.sessionId);
      
      const history = await provider.getBillingHistory(testUserId);
      
      expect(history.length).toBe(1);
      expect(history[0].userId).toBe(testUserId);
      expect(history[0].amount).toBe(999);
      expect(history[0].status).toBe("succeeded");
      expect(history[0].description).toContain("premium");
    });

    it("should throw error for non-existent checkout session", async () => {
      await expect(
        provider.verifyCheckoutSession("cs_invalid_123")
      ).rejects.toThrow("Checkout session not found");
    });
  });

  // ========================================================================
  // 4. SUBSCRIPTION MANAGEMENT
  // ========================================================================

  describe("4. Subscription Management", () => {
    it("should cancel subscription", async () => {
      // First, create premium subscription
      const session = await provider.createCheckoutSession(testUserId, "premium");
      await provider.verifyCheckoutSession(session.sessionId);
      
      // Cancel it
      const canceled = await provider.cancelSubscription(testUserId);
      
      expect(canceled.cancelAtPeriodEnd).toBe(true);
      expect(canceled.status).toBe("active"); // Still active until period end
      expect(canceled.currentPeriodEnd).toBeTruthy();
    });

    it("should not cancel free subscription", async () => {
      await expect(
        provider.cancelSubscription(testUserId)
      ).rejects.toThrow("Cannot cancel free subscription");
    });

    it("should reactivate canceled subscription", async () => {
      // Create and cancel
      const session = await provider.createCheckoutSession(testUserId, "premium");
      await provider.verifyCheckoutSession(session.sessionId);
      await provider.cancelSubscription(testUserId);
      
      // Reactivate
      const reactivated = await provider.reactivateSubscription(testUserId);
      
      expect(reactivated.cancelAtPeriodEnd).toBe(false);
      expect(reactivated.status).toBe("active");
    });

    it("should simulate period end with renewal", async () => {
      // Create premium subscription
      const session = await provider.createCheckoutSession(testUserId, "premium");
      await provider.verifyCheckoutSession(session.sessionId);
      
      const before = await provider.getSubscription(testUserId);
      const oldPeriodEnd = before.currentPeriodEnd!;
      
      // Simulate period end
      provider.simulatePeriodEnd(testUserId);
      
      const after = await provider.getSubscription(testUserId);
      
      expect(after.status).toBe("active");
      expect(after.currentPeriodStart).toEqual(oldPeriodEnd);
      expect(after.currentPeriodEnd!.getTime()).toBeGreaterThan(oldPeriodEnd.getTime());
      
      // Should create billing record
      const history = await provider.getBillingHistory(testUserId);
      expect(history.length).toBe(2); // Initial + renewal
    });

    it("should simulate period end with cancellation", async () => {
      // Create and cancel
      const session = await provider.createCheckoutSession(testUserId, "premium");
      await provider.verifyCheckoutSession(session.sessionId);
      await provider.cancelSubscription(testUserId);
      
      // Simulate period end
      provider.simulatePeriodEnd(testUserId);
      
      const after = await provider.getSubscription(testUserId);
      
      expect(after.status).toBe("canceled");
      expect(after.plan).toBe("free");
    });
  });

  // ========================================================================
  // 5. FEATURE GATING
  // ========================================================================

  describe("5. Feature Gating", () => {
    it("should check if user is premium", async () => {
      // Free user
      let isPremium = await provider.isPremium(testUserId);
      expect(isPremium).toBe(false);
      
      // Upgrade to premium
      const session = await provider.createCheckoutSession(testUserId, "premium");
      await provider.verifyCheckoutSession(session.sessionId);
      
      isPremium = await provider.isPremium(testUserId);
      expect(isPremium).toBe(true);
    });

    it("should check specific features", async () => {
      // Free user
      let hasPdf = await provider.hasFeature(testUserId, "pdfExport");
      expect(hasPdf).toBe(false);
      
      // Upgrade to premium
      const session = await provider.createCheckoutSession(testUserId, "premium");
      await provider.verifyCheckoutSession(session.sessionId);
      
      hasPdf = await provider.hasFeature(testUserId, "pdfExport");
      expect(hasPdf).toBe(true);
      
      const hasSavings = await provider.hasFeature(testUserId, "smartSavingsUnlimited");
      expect(hasSavings).toBe(true);
      
      const hasPrint = await provider.hasFeature(testUserId, "mealPrepGuidePrint");
      expect(hasPrint).toBe(true);
    });
  });

  // ========================================================================
  // 6. BILLING HISTORY
  // ========================================================================

  describe("6. Billing History", () => {
    it("should return empty history for new user", async () => {
      const history = await provider.getBillingHistory(testUserId);
      expect(history).toEqual([]);
    });

    it("should track billing records", async () => {
      const session = await provider.createCheckoutSession(testUserId, "premium");
      await provider.verifyCheckoutSession(session.sessionId);
      
      const history = await provider.getBillingHistory(testUserId);
      
      expect(history.length).toBe(1);
      expect(history[0].amount).toBe(999);
      expect(history[0].currency).toBe("EUR");
      expect(history[0].status).toBe("succeeded");
      expect(history[0].createdAt).toBeInstanceOf(Date);
    });

    it("should show payment methods for premium users", async () => {
      // Free user
      let methods = await provider.getPaymentMethods(testUserId);
      expect(methods).toEqual([]);
      
      // Premium user
      const session = await provider.createCheckoutSession(testUserId, "premium");
      await provider.verifyCheckoutSession(session.sessionId);
      
      methods = await provider.getPaymentMethods(testUserId);
      expect(methods.length).toBe(1);
      expect(methods[0].type).toBe("card");
      expect(methods[0].last4).toBe("4242");
      expect(methods[0].isDefault).toBe(true);
    });
  });

  // ========================================================================
  // 7. GLOBAL PROVIDER HELPERS
  // ========================================================================

  describe("7. Global Provider Helpers", () => {
    it("should use global provider for getUserSubscription", async () => {
      const subscription = await getUserSubscription(testUserId);
      expect(subscription.plan).toBe("free");
    });

    it("should use global provider for checkout flow", async () => {
      const session = await startPremiumCheckout(testUserId);
      expect(session.plan).toBe("premium");
      
      const subscription = await completePremiumCheckout(session.sessionId);
      expect(subscription.status).toBe("active");
    });

    it("should use global provider for subscription management", async () => {
      const session = await startPremiumCheckout(testUserId);
      await completePremiumCheckout(session.sessionId);
      
      const canceled = await cancelUserSubscription(testUserId);
      expect(canceled.cancelAtPeriodEnd).toBe(true);
      
      const reactivated = await reactivateUserSubscription(testUserId);
      expect(reactivated.cancelAtPeriodEnd).toBe(false);
    });

    it("should use global provider for feature checks", async () => {
      let isPremium = await isUserPremium(testUserId);
      expect(isPremium).toBe(false);
      
      const session = await startPremiumCheckout(testUserId);
      await completePremiumCheckout(session.sessionId);
      
      isPremium = await isUserPremium(testUserId);
      expect(isPremium).toBe(true);
      
      const hasPdf = await userHasFeature(testUserId, "pdfExport");
      expect(hasPdf).toBe(true);
    });

    it("should use global provider for billing", async () => {
      const session = await startPremiumCheckout(testUserId);
      await completePremiumCheckout(session.sessionId);
      
      const history = await getUserBillingHistory(testUserId);
      expect(history.length).toBe(1);
    });
  });

  // ========================================================================
  // 8. REAL-WORLD SCENARIOS
  // ========================================================================

  describe("8. Real-World Premium Scenarios", () => {
    it("Scenario: User upgrades to premium and uses features", async () => {
      // User starts as free
      let isPremium = await isUserPremium(testUserId);
      expect(isPremium).toBe(false);
      
      // User clicks upgrade button
      const session = await startPremiumCheckout(testUserId);
      console.log(`✅ Checkout session created: ${session.sessionId}`);
      
      // Payment completes
      const subscription = await completePremiumCheckout(session.sessionId);
      console.log(`✅ Premium activated: ${subscription.plan}`);
      
      // User now has access to premium features
      isPremium = await isUserPremium(testUserId);
      expect(isPremium).toBe(true);
      
      const canExportPdf = await userHasFeature(testUserId, "pdfExport");
      const canPrint = await userHasFeature(testUserId, "mealPrepGuidePrint");
      
      expect(canExportPdf).toBe(true);
      expect(canPrint).toBe(true);
      
      console.log(`✅ PDF Export: ${canExportPdf}`);
      console.log(`✅ Meal Prep Print: ${canPrint}`);
    });

    it("Scenario: User cancels but retains access until period end", async () => {
      // Upgrade to premium
      const session = await startPremiumCheckout(testUserId);
      await completePremiumCheckout(session.sessionId);
      
      // User cancels
      const canceled = await cancelUserSubscription(testUserId);
      console.log(`✅ Subscription canceled, access until: ${canceled.currentPeriodEnd}`);
      
      // Still has access
      expect(canceled.status).toBe("active");
      expect(canceled.cancelAtPeriodEnd).toBe(true);
      
      let stillPremium = await isUserPremium(testUserId);
      expect(stillPremium).toBe(true);
      
      // Period ends
      provider.simulatePeriodEnd(testUserId);
      
      const after = await getUserSubscription(testUserId);
      expect(after.status).toBe("canceled");
      expect(after.plan).toBe("free");
      
      stillPremium = await isUserPremium(testUserId);
      expect(stillPremium).toBe(false);
      
      console.log(`✅ Access revoked after period end`);
    });

    it("Scenario: User changes mind and reactivates subscription", async () => {
      // Upgrade and cancel
      const session = await startPremiumCheckout(testUserId);
      await completePremiumCheckout(session.sessionId);
      await cancelUserSubscription(testUserId);
      
      let subscription = await getUserSubscription(testUserId);
      expect(subscription.cancelAtPeriodEnd).toBe(true);
      
      // User changes mind
      subscription = await reactivateUserSubscription(testUserId);
      console.log(`✅ Subscription reactivated`);
      
      expect(subscription.cancelAtPeriodEnd).toBe(false);
      expect(subscription.status).toBe("active");
      
      // Period ends - should renew, not cancel
      provider.simulatePeriodEnd(testUserId);
      
      const renewed = await getUserSubscription(testUserId);
      expect(renewed.status).toBe("active");
      expect(renewed.plan).toBe("premium");
      
      const history = await getUserBillingHistory(testUserId);
      expect(history.length).toBe(2); // Initial + renewal
      
      console.log(`✅ Subscription renewed successfully`);
    });

    it("Scenario: Multiple users with different subscription states", async () => {
      const user1 = "user-free-1";
      const user2 = "user-premium-2";
      const user3 = "user-canceled-3";
      
      // User 1: Free
      const sub1 = await getUserSubscription(user1);
      expect(sub1.plan).toBe("free");
      
      // User 2: Premium
      const session2 = await startPremiumCheckout(user2);
      await completePremiumCheckout(session2.sessionId);
      const sub2 = await getUserSubscription(user2);
      expect(sub2.plan).toBe("premium");
      
      // User 3: Canceled premium
      const session3 = await startPremiumCheckout(user3);
      await completePremiumCheckout(session3.sessionId);
      await cancelUserSubscription(user3);
      const sub3 = await getUserSubscription(user3);
      expect(sub3.cancelAtPeriodEnd).toBe(true);
      
      // Verify isolation
      const isPremium1 = await isUserPremium(user1);
      const isPremium2 = await isUserPremium(user2);
      const isPremium3 = await isUserPremium(user3);
      
      expect(isPremium1).toBe(false);
      expect(isPremium2).toBe(true);
      expect(isPremium3).toBe(true); // Still active until period end
      
      console.log(`✅ User isolation verified`);
    });

    it("Scenario: Premium user has full feature access", async () => {
      const session = await startPremiumCheckout(testUserId);
      await completePremiumCheckout(session.sessionId);
      
      const subscription = await getUserSubscription(testUserId);
      const features = getPremiumFeatures(subscription);
      
      expect(features.pdfExport).toBe(true);
      expect(features.smartSavingsUnlimited).toBe(true);
      expect(features.mealPrepGuidePrint).toBe(true);
      expect(features.prioritySupport).toBe(true);
      expect(features.advancedAnalytics).toBe(true);
      
      console.log(`✅ All premium features unlocked`);
    });
  });
});
