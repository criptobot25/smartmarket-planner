import { PlanInput } from "../models/PlanInput";

/**
 * PASSO 31: Plan Fingerprint
 * 
 * Generates a hash from PlanInput to detect when inputs change.
 * Used to invalidate cached plans and force regeneration.
 * 
 * Critical for personalization guarantee:
 * - Different inputs → different plans
 * - No generic "same list for everyone"
 */

export function generatePlanFingerprint(input: PlanInput): string {
  // Create a deterministic string from all relevant input fields
  const parts = [
    input.fitnessGoal || "maintenance",
    input.sex || "male",
    input.age?.toString() || "30",
    input.weightKg?.toString() || "70",
    input.heightCm?.toString() || "170",
    input.trains?.toString() || "false",
    input.mealsPerDay?.toString() || "4",
    input.dietStyle || "balanced",
    input.costTier || "medium",
    input.restrictions?.join(",") || "",
    input.excludedFoods?.join(",") || "",
    input.proteinTargetPerDay?.toString() || ""
  ];

  // Simple hash function (djb2 algorithm)
  const str = parts.join("|");
  let hash = 5381;
  
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
  }
  
  // Convert to positive hex string
  return Math.abs(hash).toString(16);
}

/**
 * Compares two PlanInputs to check if they're essentially the same
 */
export function arePlanInputsEqual(input1: PlanInput, input2: PlanInput): boolean {
  return generatePlanFingerprint(input1) === generatePlanFingerprint(input2);
}

/**
 * Validates if a stored plan matches the current input
 */
export function isPlanValidForInput(planHash: string | undefined, currentInput: PlanInput): boolean {
  if (!planHash) return false;
  return planHash === generatePlanFingerprint(currentInput);
}
