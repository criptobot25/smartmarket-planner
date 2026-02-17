/**
 * PASSO 23 - Variety Engine v2: Real diet adherence constraints
 * 
 * Tests for variety tracking and constraint enforcement
 */

import { describe, it, expect, beforeEach } from "vitest";
import { CATEGORIES } from "../core/constants/categories";
import {
  VarietyTracker,
  DEFAULT_VARIETY_CONSTRAINTS,
  VarietyConstraints,
} from "../core/logic/VarietyConstraints";
import { mockFoods } from "../data/mockFoods";

describe("VarietyConstraints - PASSO 23", () => {
  let tracker: VarietyTracker;

  beforeEach(() => {
    tracker = new VarietyTracker(DEFAULT_VARIETY_CONSTRAINTS);
  });

  describe("Protein variety tracking", () => {
    it("should track unique protein sources", () => {
      const chicken = mockFoods.find(f => f.name === "Chicken breast (skinless)")!;
      const fish = mockFoods.find(f => f.name === "Salmon fillet")!;
      const beef = mockFoods.find(f => f.name === "Lean ground beef (5% fat)")!;

      tracker.recordProteinSource(chicken);
      tracker.recordProteinSource(fish);
      tracker.recordProteinSource(beef);

      const stats = tracker.getVarietyStats();
      expect(stats.uniqueProteins).toBe(3);
    });

    it("should not count duplicate protein sources", () => {
      const chicken = mockFoods.find(f => f.name === "Chicken breast (skinless)")!;

      tracker.recordProteinSource(chicken);
      tracker.recordProteinSource(chicken);
      tracker.recordProteinSource(chicken);

      const stats = tracker.getVarietyStats();
      expect(stats.uniqueProteins).toBe(1);
    });

    it("should detect minimum protein variety requirement", () => {
      const chicken = mockFoods.find(f => f.name === "Chicken breast (skinless)")!;
      const fish = mockFoods.find(f => f.name === "Salmon fillet")!;

      tracker.recordProteinSource(chicken);
      tracker.recordProteinSource(fish);

      expect(tracker.meetsMinimumVariety()).toBe(false); // Need 3 proteins + 5 vegetables

      const beef = mockFoods.find(f => f.name === "Lean ground beef (5% fat)")!;
      tracker.recordProteinSource(beef);

      // Still false because vegetables requirement not met
      expect(tracker.meetsMinimumVariety()).toBe(false);
    });
  });

  describe("Vegetable variety tracking", () => {
    it("should track unique vegetables", () => {
      const broccoli = mockFoods.find(f => f.name === "Broccoli")!;
      const spinach = mockFoods.find(f => f.name === "Spinach (fresh)")!;
      const carrot = mockFoods.find(f => f.name === "Carrots")!;

      tracker.recordVegetable(broccoli);
      tracker.recordVegetable(spinach);
      tracker.recordVegetable(carrot);

      const stats = tracker.getVarietyStats();
      expect(stats.uniqueVegetables).toBe(3);
    });

    it("should detect minimum vegetable variety requirement", () => {
      const vegetables = [
        "Broccoli",
        "Spinach (fresh)",
        "Carrots",
        "Bell peppers"
      ].map(name => mockFoods.find(f => f.name === name)!);

      vegetables.forEach(veg => tracker.recordVegetable(veg));

      expect(tracker.meetsMinimumVariety()).toBe(false); // Need 5 vegetables + 3 proteins

      const tomato = mockFoods.find(f => f.name === "Tomatoes")!;
      tracker.recordVegetable(tomato);

      // Still false because protein requirement not met
      expect(tracker.meetsMinimumVariety()).toBe(false);
    });
  });

  describe("Fish constraint (max 2 meals/week)", () => {
    it("should identify fish protein sources", () => {
      const salmon = mockFoods.find(f => f.name === "Salmon fillet")!;
      const tuna = mockFoods.find(f => f.name === "Tuna (canned)")!;

      expect(tracker["isFish"](salmon)).toBe(true);
      expect(tracker["isFish"](tuna)).toBe(true);
    });

    it("should not identify non-fish as fish", () => {
      const chicken = mockFoods.find(f => f.name === "Chicken breast (skinless)")!;
      const beef = mockFoods.find(f => f.name === "Lean ground beef (5% fat)")!;

      expect(tracker["isFish"](chicken)).toBe(false);
      expect(tracker["isFish"](beef)).toBe(false);
    });

    it("should allow fish up to max limit", () => {
      const salmon = mockFoods.find(f => f.name === "Salmon fillet")!;

      expect(tracker.canUseProteinSource(salmon)).toBe(true);
      tracker.recordProteinSource(salmon);

      expect(tracker.canUseProteinSource(salmon)).toBe(true);
      tracker.recordProteinSource(salmon);

      // After 2 fish meals, should block
      expect(tracker.canUseProteinSource(salmon)).toBe(false);

      const stats = tracker.getVarietyStats();
      expect(stats.fishMeals).toBe(2);
    });

    it("should count different fish types toward same limit", () => {
      const salmon = mockFoods.find(f => f.name === "Salmon fillet")!;
      const tuna = mockFoods.find(f => f.name === "Tuna (canned)")!;

      tracker.recordProteinSource(salmon);
      tracker.recordProteinSource(tuna);

      const stats = tracker.getVarietyStats();
      expect(stats.fishMeals).toBe(2);

      // Should block any fish now
      expect(tracker.canUseProteinSource(salmon)).toBe(false);
      expect(tracker.canUseProteinSource(tuna)).toBe(false);
    });
  });

  describe("Red meat constraint (max 2 meals/week)", () => {
    it("should identify red meat protein sources", () => {
      const beef = mockFoods.find(f => f.name === "Lean ground beef (5% fat)")!;

      expect(tracker["isRedMeat"](beef)).toBe(true);
    });

    it("should not identify non-red-meat as red meat", () => {
      const chicken = mockFoods.find(f => f.name === "Chicken breast (skinless)")!;
      const fish = mockFoods.find(f => f.name === "Salmon fillet")!;

      expect(tracker["isRedMeat"](chicken)).toBe(false);
      expect(tracker["isRedMeat"](fish)).toBe(false);
    });

    it("should allow red meat up to max limit", () => {
      const beef = mockFoods.find(f => f.name === "Lean ground beef (5% fat)")!;

      expect(tracker.canUseProteinSource(beef)).toBe(true);
      tracker.recordProteinSource(beef);

      expect(tracker.canUseProteinSource(beef)).toBe(true);
      tracker.recordProteinSource(beef);

      // After 2 red meat meals, should block
      expect(tracker.canUseProteinSource(beef)).toBe(false);

      const stats = tracker.getVarietyStats();
      expect(stats.redMeatMeals).toBe(2);
    });
  });

  describe("Meal repetition constraint (max 4 times/week)", () => {
    it("should track meal name usage", () => {
      tracker.recordMealName("Chicken & Rice");
      tracker.recordMealName("Chicken & Rice");
      tracker.recordMealName("Chicken & Rice");

      const stats = tracker.getVarietyStats();
      const chickenRiceCount = stats.mealRepetitions.find(m => m.meal === "Chicken & Rice")?.count;
      expect(chickenRiceCount).toBe(3);
    });

    it("should allow meal up to max repetition limit", () => {
      const mealName = "Chicken & Rice";

      for (let i = 0; i < 4; i++) {
        expect(tracker.canUseMealName(mealName)).toBe(true);
        tracker.recordMealName(mealName);
      }

      // After 4 repetitions, should block
      expect(tracker.canUseMealName(mealName)).toBe(false);

      const stats = tracker.getVarietyStats();
      const count = stats.mealRepetitions.find(m => m.meal === mealName)?.count;
      expect(count).toBe(4);
    });

    it("should track different meals independently", () => {
      tracker.recordMealName("Chicken & Rice");
      tracker.recordMealName("Chicken & Rice");
      tracker.recordMealName("Salmon & Quinoa");

      const stats = tracker.getVarietyStats();
      const chickenCount = stats.mealRepetitions.find(m => m.meal === "Chicken & Rice")?.count;
      const salmonCount = stats.mealRepetitions.find(m => m.meal === "Salmon & Quinoa")?.count;
      expect(chickenCount).toBe(2);
      expect(salmonCount).toBe(1);
    });
  });

  describe("Alternative suggestions", () => {
    it("should suggest unused protein sources", () => {
      const chicken = mockFoods.find(f => f.name === "Chicken breast (skinless)")!;
      tracker.recordProteinSource(chicken);

      const proteins = mockFoods.filter(f => f.category === CATEGORIES.protein);
      const alternative = tracker.suggestAlternativeProtein(proteins);

      expect(alternative).toBeDefined();
      expect(alternative!.name).not.toBe("Chicken breast (skinless)");
    });

    it("should suggest unused vegetables", () => {
      const broccoli = mockFoods.find(f => f.name === "Broccoli")!;
      tracker.recordVegetable(broccoli);

      const vegetables = mockFoods.filter(f => f.category === CATEGORIES.vegetables);
      const alternative = tracker.suggestAlternativeVegetable(vegetables);

      expect(alternative).toBeDefined();
      expect(alternative!.name).not.toBe("Broccoli");
    });

    it("should return null if all options used", () => {
      const vegetables = mockFoods.filter(f => f.category === CATEGORIES.vegetables);
      vegetables.forEach(veg => tracker.recordVegetable(veg));

      const alternative = tracker.suggestAlternativeVegetable(vegetables);
      expect(alternative).toBeNull();
    });
  });

  describe("Violation detection", () => {
    it("should detect protein variety violation", () => {
      const chicken = mockFoods.find(f => f.name === "Chicken breast (skinless)")!;
      tracker.recordProteinSource(chicken);
      tracker.recordProteinSource(chicken);

      const violations = tracker.getViolations();
      expect(violations).toContain(
        "Only 1 protein sources (minimum: 3)"
      );
    });

    it("should detect vegetable variety violation", () => {
      const broccoli = mockFoods.find(f => f.name === "Broccoli")!;
      tracker.recordVegetable(broccoli);

      const violations = tracker.getViolations();
      expect(violations).toContain(
        "Only 1 vegetables (minimum: 5)"
      );
    });

    it("should detect fish limit violation", () => {
      const salmon = mockFoods.find(f => f.name === "Salmon fillet")!;
      tracker.recordProteinSource(salmon);
      tracker.recordProteinSource(salmon);
      tracker.recordProteinSource(salmon);

      const violations = tracker.getViolations();
      expect(violations).toContain("Fish meals: 3 (max: 2)");
    });

    it("should detect red meat limit violation", () => {
      const beef = mockFoods.find(f => f.name === "Lean ground beef (5% fat)")!;
      tracker.recordProteinSource(beef);
      tracker.recordProteinSource(beef);
      tracker.recordProteinSource(beef);

      const violations = tracker.getViolations();
      expect(violations).toContain("Red meat meals: 3 (max: 2)");
    });

    it("should detect meal repetition violation", () => {
      for (let i = 0; i < 5; i++) {
        tracker.recordMealName("Chicken & Rice");
      }

      const violations = tracker.getViolations();
      expect(violations.some(v => v.includes("Chicken & Rice"))).toBe(true);
      expect(violations.some(v => v.includes("repeated 5 times"))).toBe(true);
    });

    it("should return empty array if no violations", () => {
      // Add minimum variety
      const proteins = ["Chicken breast (skinless)", "Salmon fillet", "Lean ground beef (5% fat)"];
      proteins.forEach(name => {
        const food = mockFoods.find(f => f.name === name)!;
        tracker.recordProteinSource(food);
      });

      const vegetables = ["Broccoli", "Spinach (fresh)", "Carrots", "Bell peppers", "Tomatoes"];
      vegetables.forEach(name => {
        const food = mockFoods.find(f => f.name === name)!;
        tracker.recordVegetable(food);
      });

      tracker.recordMealName("Chicken & Rice");
      tracker.recordMealName("Salmon & Quinoa");
      tracker.recordMealName("Beef & Sweet Potato");

      const violations = tracker.getViolations();
      expect(violations).toHaveLength(0);
    });
  });

  describe("Custom constraints", () => {
    it("should accept custom constraints", () => {
      const customConstraints: VarietyConstraints = {
        minUniqueProteins: 4,
        minUniqueVegetables: 6,
        maxSameMealPerWeek: 3,
        maxFishMealsPerWeek: 1,
        maxRedMeatMealsPerWeek: 1,
      };

      const customTracker = new VarietyTracker(customConstraints);

      const salmon = mockFoods.find(f => f.name === "Salmon fillet")!;
      customTracker.recordProteinSource(salmon);

      // Should block after 1 fish meal (custom limit)
      expect(customTracker.canUseProteinSource(salmon)).toBe(false);

      const stats = customTracker.getVarietyStats();
      expect(stats.fishMeals).toBe(1);
    });
  });
});

