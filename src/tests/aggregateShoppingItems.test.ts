import { describe, expect, it } from "vitest";
import { aggregateShoppingItems } from "../core/logic/aggregateShoppingItems";
import type { FoodItem } from "../core/models/FoodItem";

type TestShoppingItem = FoodItem & { purchased?: boolean };

describe("aggregateShoppingItems", () => {
  it("merges duplicate food lines by foodId/name and sums quantities", () => {
    const items: TestShoppingItem[] = [
      {
        id: "chicken-1",
        name: "Chicken breast",
        category: "protein",
        unit: "kg",
        quantity: 1.2,
        pricePerUnit: 8,
        costLevel: "medium",
        reason: "Lunch protein for 6 meals",
        estimatedPrice: 9.6
      },
      {
        id: "chicken-2",
        name: "Chicken breast",
        category: "protein",
        unit: "g",
        quantity: 1100,
        pricePerUnit: 0.008,
        costLevel: "medium",
        reason: "Dinner protein for 6 meals",
        estimatedPrice: 8.8
      }
    ];

    const aggregated = aggregateShoppingItems(items);

    expect(aggregated).toHaveLength(1);
    expect(aggregated[0].normalizedDisplayText).toBe("2.3kg");
    expect(aggregated[0].mergedReason).toBe("Lunch protein for 6 meals · Dinner protein for 6 meals");
  });

  it("renders smart pack estimate for repeated protein packs", () => {
    const items: TestShoppingItem[] = [
      {
        id: "chicken-1",
        name: "Chicken breast",
        category: "protein",
        unit: "kg",
        quantity: 0.8,
        pricePerUnit: 8,
        costLevel: "medium",
        reason: "Lunch protein for 4 meals",
        estimatedPrice: 6.4
      },
      {
        id: "chicken-2",
        name: "Chicken breast",
        category: "protein",
        unit: "kg",
        quantity: 0.8,
        pricePerUnit: 8,
        costLevel: "medium",
        reason: "Dinner protein for 4 meals",
        estimatedPrice: 6.4
      },
      {
        id: "chicken-3",
        name: "Chicken breast",
        category: "protein",
        unit: "kg",
        quantity: 0.8,
        pricePerUnit: 8,
        costLevel: "medium",
        reason: "Snack protein for 4 meals",
        estimatedPrice: 6.4
      }
    ];

    const aggregated = aggregateShoppingItems(items);

    expect(aggregated).toHaveLength(1);
    expect(aggregated[0].normalizedDisplayText).toBe("2.4kg (~3 packs)");
  });
});
