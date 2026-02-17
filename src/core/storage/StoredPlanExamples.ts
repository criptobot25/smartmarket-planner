/**
 * StoredPlan Usage Examples
 * 
 * This file demonstrates the correct patterns for storing and retrieving
 * WeeklyPlan objects with user context.
 */

import { WeeklyPlan } from "../models/WeeklyPlan";
import { StoredPlan, getStorageProvider } from "./StorageProvider";
import { getCurrentUser } from "../auth/AuthProvider";
import { generateWeeklyPlan } from "../logic/generateWeeklyPlan";
import { PlanInput } from "../models/PlanInput";

// ============================================================================
// EXAMPLE 1: Save a new plan with StoredPlan wrapper
// ============================================================================

export async function exampleSaveWithWrapper(input: PlanInput): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  // Generate pure domain plan
  const plan: WeeklyPlan = generateWeeklyPlan(input);

  // Wrap with user context for storage
  const storedPlan: StoredPlan = {
    userId: user.id,
    plan,
  };

  // Save using type-safe wrapper method
  const storage = getStorageProvider();
  await storage.saveStoredPlan(storedPlan);

  console.log("✅ Plan saved with explicit user association");
}

// ============================================================================
// EXAMPLE 2: Save using traditional method (implicit wrapper)
// ============================================================================

export async function exampleSaveTraditional(input: PlanInput): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const plan: WeeklyPlan = generateWeeklyPlan(input);

  // Storage layer wraps internally
  const storage = getStorageProvider();
  await storage.saveWeeklyPlan(plan, { userId: user.id });

  console.log("✅ Plan saved with implicit wrapper via options");
}

// ============================================================================
// EXAMPLE 3: Retrieve plan as StoredPlan (with user context)
// ============================================================================

export async function exampleGetWithContext(planId: string): Promise<StoredPlan | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const storage = getStorageProvider();
  const storedPlan = await storage.getStoredPlan(planId, user.id);

  if (storedPlan) {
    console.log(`✅ Retrieved plan for user: ${storedPlan.userId}`);
    console.log(`   Plan ID: ${storedPlan.plan.id}`);
    console.log(`   Days: ${storedPlan.plan.days.length}`);
  }

  return storedPlan;
}

// ============================================================================
// EXAMPLE 4: Retrieve all user plans as StoredPlan objects
// ============================================================================

export async function exampleGetAllWithContext(): Promise<StoredPlan[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const storage = getStorageProvider();
  const storedPlans = await storage.getAllStoredPlans(user.id);

  console.log(`✅ Retrieved ${storedPlans.length} plans`);
  storedPlans.forEach((sp, i) => {
    console.log(`   ${i + 1}. User: ${sp.userId}, Plan: ${sp.plan.id}`);
  });

  return storedPlans;
}

// ============================================================================
// EXAMPLE 5: Transfer plan between users (demonstrates data purity)
// ============================================================================

export async function exampleTransferPlan(
  planId: string,
  fromUserId: string,
  toUserId: string
): Promise<void> {
  const storage = getStorageProvider();

  // Get plan from source user
  const sourcePlan = await storage.getStoredPlan(planId, fromUserId);
  if (!sourcePlan) throw new Error("Plan not found");

  // Pure WeeklyPlan can move between users easily
  const targetStoredPlan: StoredPlan = {
    userId: toUserId,
    plan: {
      ...sourcePlan.plan,
      id: `${sourcePlan.plan.id}_copy`, // New ID for target
    },
  };

  // Save to target user
  await storage.saveStoredPlan(targetStoredPlan);

  console.log(`✅ Plan transferred from ${fromUserId} to ${toUserId}`);
}

// ============================================================================
// EXAMPLE 6: Export plan without user data (for sharing)
// ============================================================================

export async function exampleExportPlanPure(planId: string): Promise<WeeklyPlan> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const storage = getStorageProvider();
  const storedPlan = await storage.getStoredPlan(planId, user.id);
  if (!storedPlan) throw new Error("Plan not found");

  // Pure plan ready for export (NO user data)
  const purePlan: WeeklyPlan = storedPlan.plan;

  console.log("✅ Pure plan ready for export:");
  console.log(`   Plan ID: ${purePlan.id}`);
  console.log(`   Days: ${purePlan.days.length}`);
  console.log(`   Shopping items: ${purePlan.shoppingList.length}`);
  console.log(`   ❌ No userId (pure domain data)`);

  return purePlan;
}

// ============================================================================
// ANTI-PATTERNS (DON'T DO THIS)
// ============================================================================

/*
// ❌ WRONG: Never add userId to WeeklyPlan
interface BadWeeklyPlan extends WeeklyPlan {
  userId: string; // DON'T DO THIS!
}

// ❌ WRONG: Never mutate plan with storage metadata
const badPlan = {
  ...weeklyPlan,
  userId: user.id,        // Storage concern
  premiumStatus: true,    // Application concern
  syncedAt: new Date(),   // Infrastructure concern
};

// ❌ WRONG: Never access user data from plan
function badFunction(plan: WeeklyPlan) {
  const userId = (plan as any).userId; // NEVER DO THIS
}
*/

// ============================================================================
// CORRECT PATTERNS (DO THIS)
// ============================================================================

// ✅ CORRECT: Domain logic works with pure WeeklyPlan
export function analyzePlan(plan: WeeklyPlan): void {
  console.log(`Plan has ${plan.days.length} days`);
  console.log(`Total shopping items: ${plan.shoppingList.length}`);
  console.log(`Target calories: ${plan.caloriesTargetPerDay}`);
  // NO access to userId - pure business logic
}

// ✅ CORRECT: Storage layer manages user association
export async function savePlanCorrectly(plan: WeeklyPlan, userId: string): Promise<void> {
  const storedPlan: StoredPlan = { userId, plan };
  await getStorageProvider().saveStoredPlan(storedPlan);
}

// ✅ CORRECT: UI displays plan without needing userId
export function displayPlan(plan: WeeklyPlan): string {
  return `Plan #${plan.id} - ${plan.days.length} days planned`;
}
