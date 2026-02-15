/**
 * PASSO 34: PlanInput Validation Schema
 * 
 * Uses Zod for runtime validation of user inputs to prevent crashes.
 * 
 * Validation Rules:
 * - sex: Must be "male" or "female"
 * - age: 13-100 years (realistic range)
 * - weightKg: 30-300 kg (safety range)
 * - heightCm: 100-250 cm (realistic range)
 * - mealsPerDay: 3-6 meals (app design constraint)
 * - dietStyle: Must be valid enum value
 * - costTier: Must be valid enum value
 * - restrictions: Array of strings
 * - excludedFoods: Optional array of strings
 * - fitnessGoal: Optional valid enum value
 * 
 * Purpose: Prevent invalid data from crashing the app in production
 */

import { z } from "zod";

/**
 * Zod schemas for enum types
 */
export const DietStyleSchema = z.enum(["healthy", "balanced", "comfort"]);

export const FitnessGoalSchema = z.enum(["cutting", "maintenance", "bulking"]);

export const SexSchema = z.enum(["male", "female"]);

export const CostTierSchema = z.enum(["low", "medium", "high"]);

/**
 * Main PlanInput validation schema
 */
export const PlanInputSchema = z.object({
  sex: SexSchema,
  
  age: z.number()
  .int({ message: "Age must be a whole number" })
  .min(13, { message: "Age must be at least 13 years" })
  .max(100, { message: "Age must be less than 100 years" }),
  
  weightKg: z.number()
  .positive({ message: "Weight must be positive" })
  .min(30, { message: "Weight must be at least 30 kg" })
  .max(300, { message: "Weight must be less than 300 kg" }),
  
  heightCm: z.number()
  .positive({ message: "Height must be positive" })
  .min(100, { message: "Height must be at least 100 cm" })
  .max(250, { message: "Height must be less than 250 cm" }),
  
  trains: z.boolean(),
  
  mealsPerDay: z.number()
  .int({ message: "Meals per day must be a whole number" })
  .min(3, { message: "Must have at least 3 meals per day" })
  .max(6, { message: "Cannot have more than 6 meals per day" }),
  
  dietStyle: DietStyleSchema,
  
  costTier: CostTierSchema,
  
  restrictions: z.array(z.string()),
  
  fitnessGoal: FitnessGoalSchema.optional(),
  
  proteinTargetPerDay: z.number()
    .positive({ message: "Protein target must be positive" })
    .max(500, { message: "Protein target seems unrealistic (max 500g)" })
    .optional(),
  
  excludedFoods: z.array(z.string())
    .max(20, { message: "Cannot exclude more than 20 foods" })
    .optional()
});

/**
 * Type inference from schema (ensures type safety)
 */
export type ValidatedPlanInput = z.infer<typeof PlanInputSchema>;

/**
 * Validation result type
 */
export interface ValidationResult {
  success: boolean;
  data?: ValidatedPlanInput;
  errors?: string[];
}

/**
 * Validate PlanInput and return friendly error messages
 */
export function validatePlanInput(input: unknown): ValidationResult {
  const result = PlanInputSchema.safeParse(input);
  
  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  }
  
  // Extract friendly error messages from Zod issues
  const errors = result.error?.issues?.map(issue => {
    const field = issue.path.length > 0 ? issue.path.join(".") : "input";
    return `${field}: ${issue.message}`;
  }) || ["Validation failed"];
  
  return {
    success: false,
    errors
  };
}

/**
 * Validate and throw on error (for use in contexts where errors should crash)
 */
export function validatePlanInputOrThrow(input: unknown): ValidatedPlanInput {
  return PlanInputSchema.parse(input);
}
