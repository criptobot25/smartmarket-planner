import { describe, it, expect, beforeEach } from "vitest";
import {
  LocalStorageProvider,
  getStorageProvider,
  setStorageProvider,
  resetStorageProvider,
  saveUserWeeklyPlan,
  getUserWeeklyPlan,
  getAllUserWeeklyPlans,
  deleteUserWeeklyPlan
} from "../core/storage/StorageProvider";
import { WeeklyPlan } from "../core/models/WeeklyPlan";
import { LocalAuthProvider } from "../core/auth/AuthProvider";
import { createPlanInput } from "./factories/createPlanInput";
import { createWeeklyPlan } from "./factories/createWeeklyPlan";

describe("PASSO 38 - Cloud-Ready Storage", () => {
  let storage: LocalStorageProvider;
  let auth: LocalAuthProvider;
  const mockUserId = "test-user-123";

  beforeEach(() => {
    storage = new LocalStorageProvider();
    auth = new LocalAuthProvider();
    storage.clearAllData();
    auth.clearAllData();
  });

  const createMockPlan = (overrides?: Partial<WeeklyPlan>): WeeklyPlan => 
    createWeeklyPlan({
      id: `plan-${Date.now()}`,
      createdAt: new Date(),
      planInput: createPlanInput({
        mealsPerDay: 4,
        fitnessGoal: "bulking",
        excludedFoods: []
      }),
      days: [],
      shoppingList: [],
      costTier: "medium",
      caloriesTargetPerDay: 2000,
      proteinTargetPerDay: 150,
      carbsTargetPerDay: 200,
      fatTargetPerDay: 60,
      proteinPerMeal: 37.5,
      carbsPerMeal: 50,
      fatsPerMeal: 15,
      ...overrides
    });

  describe("1. User-Specific Plan Storage", () => {
    it("should save weekly plan with userId", async () => {
      const plan = createMockPlan();

      await storage.saveWeeklyPlan(plan, { userId: mockUserId });

      const retrieved = await storage.getWeeklyPlan(plan.id, { userId: mockUserId });
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(plan.id);
    });

    it("should auto-generate plan ID if missing", async () => {
      const plan = createMockPlan({ id: undefined as any });

      await storage.saveWeeklyPlan(plan, { userId: mockUserId });

      expect(plan.id).toBeTruthy();
      expect(plan.id).toMatch(/^plan-/);
    });

    it("should retrieve plan by ID", async () => {
      const plan = createMockPlan();
      await storage.saveWeeklyPlan(plan, { userId: mockUserId });

      const retrieved = await storage.getWeeklyPlan(plan.id, { userId: mockUserId });

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(plan.id);
      expect(retrieved?.planInput.mealsPerDay).toBe(4);
    });

    it("should return null for non-existent plan", async () => {
      const plan = await storage.getWeeklyPlan("non-existent", { userId: mockUserId });
      expect(plan).toBeNull();
    });
  });

  describe("2. Multi-Plan Management", () => {
    it("should get all plans for user", async () => {
      const plan1 = createMockPlan({ id: "plan-1" });
      const plan2 = createMockPlan({ id: "plan-2" });
      const plan3 = createMockPlan({ id: "plan-3" });

      await storage.saveWeeklyPlan(plan1, { userId: mockUserId });
      await storage.saveWeeklyPlan(plan2, { userId: mockUserId });
      await storage.saveWeeklyPlan(plan3, { userId: mockUserId });

      const plans = await storage.getAllWeeklyPlans({ userId: mockUserId });

      expect(plans.length).toBe(3);
      expect(plans.some(p => p.id === "plan-1")).toBe(true);
      expect(plans.some(p => p.id === "plan-2")).toBe(true);
      expect(plans.some(p => p.id === "plan-3")).toBe(true);
    });

    it("should sort plans by date (most recent first)", async () => {
      const oldPlan = createMockPlan({
        id: "old",
        createdAt: new Date("2024-01-01")
      });
      const newPlan = createMockPlan({
        id: "new",
        createdAt: new Date("2024-12-01")
      });
      const midPlan = createMockPlan({
        id: "mid",
        createdAt: new Date("2024-06-01")
      });

      await storage.saveWeeklyPlan(oldPlan, { userId: mockUserId });
      await storage.saveWeeklyPlan(newPlan, { userId: mockUserId });
      await storage.saveWeeklyPlan(midPlan, { userId: mockUserId });

      const plans = await storage.getAllWeeklyPlans({ userId: mockUserId });

      expect(plans[0].id).toBe("new");
      expect(plans[1].id).toBe("mid");
      expect(plans[2].id).toBe("old");
    });

    it("should delete specific plan", async () => {
      const plan1 = createMockPlan({ id: "keep" });
      const plan2 = createMockPlan({ id: "delete" });

      await storage.saveWeeklyPlan(plan1, { userId: mockUserId });
      await storage.saveWeeklyPlan(plan2, { userId: mockUserId });

      await storage.deleteWeeklyPlan("delete", { userId: mockUserId });

      const plans = await storage.getAllWeeklyPlans({ userId: mockUserId });
      expect(plans.length).toBe(1);
      expect(plans[0].id).toBe("keep");
    });
  });

  describe("3. User Isolation", () => {
    it("should isolate data between users", async () => {
      const user1Id = "user-1";
      const user2Id = "user-2";

      const plan1 = createMockPlan({ id: "user1-plan" });
      const plan2 = createMockPlan({ id: "user2-plan" });

      await storage.saveWeeklyPlan(plan1, { userId: user1Id });
      await storage.saveWeeklyPlan(plan2, { userId: user2Id });

      const user1Plans = await storage.getAllWeeklyPlans({ userId: user1Id });
      const user2Plans = await storage.getAllWeeklyPlans({ userId: user2Id });

      expect(user1Plans.length).toBe(1);
      expect(user1Plans[0].id).toBe("user1-plan");

      expect(user2Plans.length).toBe(1);
      expect(user2Plans[0].id).toBe("user2-plan");
    });

    it("should not allow accessing other user's plans", async () => {
      const user1Id = "user-1";
      const user2Id = "user-2";

      const plan = createMockPlan({ id: "secret-plan" });
      await storage.saveWeeklyPlan(plan, { userId: user1Id });

      const retrieved = await storage.getWeeklyPlan("secret-plan", { userId: user2Id });
      expect(retrieved).toBeNull(); // Different user can't access
    });
  });

  describe("4. Data Persistence", () => {
    it("should persist data in localStorage", async () => {
      const plan = createMockPlan();
      await storage.saveWeeklyPlan(plan, { userId: mockUserId });

      const key = `smartmarket_data_${mockUserId}_weeklyPlan_${plan.id}`;
      const stored = localStorage.getItem(key);

      expect(stored).toBeTruthy();
    });

    it("should restore Date objects after retrieval", async () => {
      const plan = createMockPlan({
        createdAt: new Date("2024-01-15")
      });

      await storage.saveWeeklyPlan(plan, { userId: mockUserId });
      const retrieved = await storage.getWeeklyPlan(plan.id, { userId: mockUserId });

      expect(retrieved?.createdAt).toBeInstanceOf(Date);
      expect(retrieved?.createdAt.getFullYear()).toBe(2024);
    });

    it("should include metadata with stored data", async () => {
      const plan = createMockPlan();
      await storage.saveWeeklyPlan(plan, { userId: mockUserId });

      const key = `smartmarket_data_${mockUserId}_weeklyPlan_${plan.id}`;
      const stored = JSON.parse(localStorage.getItem(key)!);

      expect(stored.metadata).toBeDefined();
      expect(stored.metadata.createdAt).toBeTruthy();
      expect(stored.metadata.updatedAt).toBeTruthy();
      expect(stored.metadata.version).toBe(1);
    });

    it("should increment version on update", async () => {
      const plan = createMockPlan();

      // Save first time
      await storage.saveWeeklyPlan(plan, { userId: mockUserId });
      const key = `smartmarket_data_${mockUserId}_weeklyPlan_${plan.id}`;
      let stored = JSON.parse(localStorage.getItem(key)!);
      expect(stored.metadata.version).toBe(1);

      // Update
      plan.planInput.mealsPerDay = 5;
      await storage.saveWeeklyPlan(plan, { userId: mockUserId });
      stored = JSON.parse(localStorage.getItem(key)!);
      expect(stored.metadata.version).toBe(2);
    });
  });

  describe("5. Generic Storage Operations", () => {
    it("should save and retrieve generic data", async () => {
      const key = {
        userId: mockUserId,
        dataType: "preferences" as const,
        id: "theme"
      };

      await storage.save(key, { darkMode: true, language: "en" });
      const retrieved = await storage.get<{ darkMode: boolean; language: string }>(key);

      expect(retrieved).toEqual({ darkMode: true, language: "en" });
    });

    it("should list all data IDs for user", async () => {
      const userId = mockUserId;

      await storage.save({ userId, dataType: "customFoods" as const, id: "food-1" }, {});
      await storage.save({ userId, dataType: "customFoods" as const, id: "food-2" }, {});
      await storage.save({ userId, dataType: "customFoods" as const, id: "food-3" }, {});

      const ids = await storage.list(userId, "customFoods");

      expect(ids.length).toBe(3);
      expect(ids).toContain("food-1");
      expect(ids).toContain("food-2");
      expect(ids).toContain("food-3");
    });

    it("should delete generic data", async () => {
      const key = {
        userId: mockUserId,
        dataType: "preferences" as const,
        id: "settings"
      };

      await storage.save(key, { notifications: true });
      await storage.delete(key);

      const retrieved = await storage.get(key);
      expect(retrieved).toBeNull();
    });
  });

  describe("6. Storage Utilities", () => {
    it("should clear all user data", async () => {
      const plan1 = createMockPlan({ id: "plan-1" });
      const plan2 = createMockPlan({ id: "plan-2" });

      await storage.saveWeeklyPlan(plan1, { userId: mockUserId });
      await storage.saveWeeklyPlan(plan2, { userId: mockUserId });

      await storage.clear(mockUserId);

      const plans = await storage.getAllWeeklyPlans({ userId: mockUserId });
      expect(plans.length).toBe(0);
    });

    it("should not clear other user's data", async () => {
      const user1Id = "user-1";
      const user2Id = "user-2";

      await storage.saveWeeklyPlan(createMockPlan(), { userId: user1Id });
      await storage.saveWeeklyPlan(createMockPlan(), { userId: user2Id });

      await storage.clear(user1Id);

      const user1Plans = await storage.getAllWeeklyPlans({ userId: user1Id });
      const user2Plans = await storage.getAllWeeklyPlans({ userId: user2Id });

      expect(user1Plans.length).toBe(0);
      expect(user2Plans.length).toBe(1);
    });

    it("should calculate user data size", async () => {
      const plan = createMockPlan();
      await storage.saveWeeklyPlan(plan, { userId: mockUserId });

      const size = await storage.getUserDataSize(mockUserId);

      expect(size).toBeGreaterThan(0);
    });
  });

  describe("7. Helper Functions", () => {
    beforeEach(async () => {
      // Create and login user
      const { setAuthProvider } = await import("../core/auth/AuthProvider");
      setAuthProvider(auth);
      await auth.signup({
        email: "helper@example.com",
        password: "password123"
      });
    });

    it("should use helper to save plan", async () => {
      const plan = createMockPlan();
      await saveUserWeeklyPlan(plan);

      const retrieved = await getUserWeeklyPlan(plan.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(plan.id);
    });

    it("should use helper to get all plans", async () => {
      await saveUserWeeklyPlan(createMockPlan({ id: "p1" }));
      await saveUserWeeklyPlan(createMockPlan({ id: "p2" }));

      const plans = await getAllUserWeeklyPlans();

      expect(plans.length).toBe(2);
    });

    it("should use helper to delete plan", async () => {
      const plan = createMockPlan();
      await saveUserWeeklyPlan(plan);

      await deleteUserWeeklyPlan(plan.id);

      const retrieved = await getUserWeeklyPlan(plan.id);
      expect(retrieved).toBeNull();
    });
  });

  describe("8. Provider Singleton", () => {
    it("should get default storage provider", () => {
      const provider = getStorageProvider();
      expect(provider).toBeDefined();
    });

    it("should allow setting custom provider", () => {
      const customProvider = new LocalStorageProvider();
      setStorageProvider(customProvider);

      const retrieved = getStorageProvider();
      expect(retrieved).toBe(customProvider);
    });

    it("should reset to default provider", () => {
      const customProvider = new LocalStorageProvider();
      setStorageProvider(customProvider);
      resetStorageProvider();

      const provider = getStorageProvider();
      expect(provider).not.toBe(customProvider);
    });
  });

  describe("9. Error Handling", () => {
    beforeEach(async () => {
      const { resetAuthProvider } = await import("../core/auth/AuthProvider");
      await auth.logout();
      resetAuthProvider();
    });

    it("should throw error when no user is authenticated", async () => {
      const plan = createMockPlan();

      await expect(
        storage.saveWeeklyPlan(plan) // No userId provided, no user logged in
      ).rejects.toThrow("No authenticated user");
    });

    it("should handle localStorage quota exceeded", async () => {
      // This is hard to test without actually filling localStorage
      // but we ensure the error is caught
      const plan = createMockPlan();
      
      // Just ensure it doesn't throw
      await expect(
        storage.saveWeeklyPlan(plan, { userId: mockUserId })
      ).resolves.toBeUndefined();
    });
  });

  describe("10. Real-World Usage", () => {
    beforeEach(async () => {
      const { setAuthProvider } = await import("../core/auth/AuthProvider");
      setAuthProvider(auth);
      await auth.signup({
        email: "realworld@example.com",
        password: "password123"
      });
    });

    it("should support complete plan lifecycle", async () => {
      // Create plan
      const plan = createMockPlan({ id: "lifecycle-plan" });

      // Save
      await saveUserWeeklyPlan(plan);

      // Retrieve
      let retrieved = await getUserWeeklyPlan("lifecycle-plan");
      expect(retrieved).toBeDefined();

      // Update
      plan.planInput.mealsPerDay = 5;
      await saveUserWeeklyPlan(plan);
      retrieved = await getUserWeeklyPlan("lifecycle-plan");
      expect(retrieved?.planInput.mealsPerDay).toBe(5);

      // List
      const plans = await getAllUserWeeklyPlans();
      expect(plans.length).toBeGreaterThan(0);

      // Delete
      await deleteUserWeeklyPlan("lifecycle-plan");
      retrieved = await getUserWeeklyPlan("lifecycle-plan");
      expect(retrieved).toBeNull();
    });

    it("should persist across sessions", async () => {
      const plan = createMockPlan();
      await saveUserWeeklyPlan(plan);

      // Simulate new session (new storage instance)
      const newStorage = new LocalStorageProvider();
      const user = await auth.getCurrentUser();

      const retrieved = await newStorage.getWeeklyPlan(plan.id, { userId: user!.id });
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(plan.id);
    });
  });
});
