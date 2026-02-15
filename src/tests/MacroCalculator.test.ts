import { describe, it, expect } from "vitest";
import { calculateBmr, calculateTdee, calculateMacroTargets } from "../core/logic/MacroCalculator";
import { PlanInput } from "../core/models/PlanInput";

describe("MacroCalculator", () => {
  describe("calculateBmr", () => {
    it("should calculate BMR for male using Mifflin-St Jeor equation", () => {
      const input: PlanInput = {
        sex: "male",
        age: 30,
        weightKg: 80,
        heightCm: 180,
        trains: true,
        mealsPerDay: 4,
        dietStyle: "balanced",
        costTier: "medium",
        restrictions: []
      };

      const bmr = calculateBmr(input);
      // BMR = 10 * 80 + 6.25 * 180 - 5 * 30 + 5 = 800 + 1125 - 150 + 5 = 1780
      expect(bmr).toBe(1780);
    });

    it("should calculate BMR for female using Mifflin-St Jeor equation", () => {
      const input: PlanInput = {
        sex: "female",
        age: 25,
        weightKg: 60,
        heightCm: 165,
        trains: false,
        mealsPerDay: 3,
        dietStyle: "healthy",
        costTier: "low",
        restrictions: []
      };

      const bmr = calculateBmr(input);
      // BMR = 10 * 60 + 6.25 * 165 - 5 * 25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
      expect(bmr).toBeCloseTo(1345.25, 0);
    });
  });

  describe("calculateTdee", () => {
    it("should apply sedentary multiplier (1.2) when trains=false", () => {
      const input: PlanInput = {
        sex: "male",
        age: 30,
        weightKg: 80,
        heightCm: 180,
        trains: false,
        mealsPerDay: 3,
        dietStyle: "balanced",
        costTier: "medium",
        restrictions: []
      };

      const tdee = calculateTdee(input);
      const bmr = calculateBmr(input);
      expect(tdee).toBe(bmr * 1.2);
    });

    it("should apply moderate multiplier (1.55) when trains=true", () => {
      const input: PlanInput = {
        sex: "female",
        age: 28,
        weightKg: 65,
        heightCm: 170,
        trains: true,
        mealsPerDay: 4,
        dietStyle: "balanced",
        costTier: "medium",
        restrictions: []
      };

      const tdee = calculateTdee(input);
      const bmr = calculateBmr(input);
      expect(tdee).toBe(bmr * 1.55);
    });
  });

  describe("calculateMacroTargets", () => {
    it("should apply -15% for cutting goal", () => {
      const input: PlanInput = {
        sex: "male",
        age: 30,
        weightKg: 80,
        heightCm: 180,
        trains: true,
        mealsPerDay: 4,
        dietStyle: "balanced",
        costTier: "medium",
        restrictions: [],
        fitnessGoal: "cutting"
      };

      const macros = calculateMacroTargets(input);
      const tdee = calculateTdee(input);
      
      expect(macros.caloriesTargetPerDay).toBe(Math.round(tdee * 0.85));
    });

    it("should apply +10% for bulking goal", () => {
      const input: PlanInput = {
        sex: "male",
        age: 25,
        weightKg: 75,
        heightCm: 175,
        trains: true,
        mealsPerDay: 5,
        dietStyle: "balanced",
        costTier: "high",
        restrictions: [],
        fitnessGoal: "bulking"
      };

      const macros = calculateMacroTargets(input);
      const tdee = calculateTdee(input);
      
      expect(macros.caloriesTargetPerDay).toBe(Math.round(tdee * 1.1));
    });

    it("should calculate protein based on goal multiplier", () => {
      const input: PlanInput = {
        sex: "male",
        age: 30,
        weightKg: 80,
        heightCm: 180,
        trains: true,
        mealsPerDay: 4,
        dietStyle: "balanced",
        costTier: "medium",
        restrictions: [],
        fitnessGoal: "cutting"
      };

      const macros = calculateMacroTargets(input);
      
      // Cutting: 2.2g/kg
      expect(macros.proteinTargetPerDay).toBe(Math.round(80 * 2.2));
    });

    it("should use 25% of calories for fats", () => {
      const input: PlanInput = {
        sex: "female",
        age: 28,
        weightKg: 65,
        heightCm: 168,
        trains: true,
        mealsPerDay: 3,
        dietStyle: "balanced",
        costTier: "medium",
        restrictions: [],
        fitnessGoal: "maintenance"
      };

      const macros = calculateMacroTargets(input);
      const expectedFatCalories = Math.round(macros.caloriesTargetPerDay * 0.25);
      const expectedFats = Math.round(expectedFatCalories / 9);
      
      expect(macros.fatTargetPerDay).toBe(expectedFats);
    });

    it("should calculate carbs from remaining calories", () => {
      const input: PlanInput = {
        sex: "male",
        age: 30,
        weightKg: 80,
        heightCm: 180,
        trains: true,
        mealsPerDay: 4,
        dietStyle: "balanced",
        costTier: "medium",
        restrictions: [],
        fitnessGoal: "maintenance"
      };

      const macros = calculateMacroTargets(input);
      
      const proteinCalories = macros.proteinTargetPerDay * 4;
      const fatCalories = macros.fatTargetPerDay * 9;
      const remainingCalories = macros.caloriesTargetPerDay - proteinCalories - fatCalories;
      const expectedCarbs = Math.round(remainingCalories / 4);
      
      expect(macros.carbsTargetPerDay).toBe(expectedCarbs);
    });

    it("should calculate per-meal macro breakdown", () => {
      const input: PlanInput = {
        sex: "male",
        age: 30,
        weightKg: 80,
        heightCm: 180,
        trains: true,
        mealsPerDay: 4,
        dietStyle: "balanced",
        costTier: "medium",
        restrictions: [],
        fitnessGoal: "maintenance"
      };

      const macros = calculateMacroTargets(input);
      
      expect(macros.proteinPerMeal).toBe(Math.round(macros.proteinTargetPerDay / 4));
      expect(macros.carbsPerMeal).toBe(Math.round(macros.carbsTargetPerDay / 4));
      expect(macros.fatsPerMeal).toBe(Math.round(macros.fatTargetPerDay / 4));
    });

    it("should handle different meals per day", () => {
      const input3Meals: PlanInput = {
        sex: "female",
        age: 25,
        weightKg: 60,
        heightCm: 165,
        trains: false,
        mealsPerDay: 3,
        dietStyle: "healthy",
        costTier: "low",
        restrictions: [],
        fitnessGoal: "cutting"
      };

      const input6Meals: PlanInput = {
        ...input3Meals,
        mealsPerDay: 6
      };

      const macros3 = calculateMacroTargets(input3Meals);
      const macros6 = calculateMacroTargets(input6Meals);
      
      // Daily totals should be same
      expect(macros3.proteinTargetPerDay).toBe(macros6.proteinTargetPerDay);
      
      // Per meal should be different
      expect(macros3.proteinPerMeal).toBe(macros6.proteinPerMeal * 2);
    });
  });
});
