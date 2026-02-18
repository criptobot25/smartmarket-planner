import { describe, expect, it } from "vitest";
import { aggregateShoppingList } from "../core/logic/aggregateShoppingList";
import { FoodItem } from "../core/models/FoodItem";

type TestShoppingItem = FoodItem & { purchased?: boolean };

describe("aggregateShoppingList", () => {
  it("consolidates duplicated foods into a single supermarket line", () => {
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

    const aggregated = aggregateShoppingList(items, 7);
    expect(aggregated).toHaveLength(1);
    expect(aggregated[0].name).toBe("Chicken breast");
    expect(aggregated[0].normalizedDisplayText).toBe("2.3kg");
    expect(aggregated[0].coverageText).toBe("This covers 6 days of protein");
  });

  it("normalizes milliliters to liters in final list", () => {
    const items: TestShoppingItem[] = [
      {
        id: "milk-1",
        name: "Milk",
        category: "dairy",
        unit: "ml",
        quantity: 750,
        pricePerUnit: 0.002,
        costLevel: "low",
        reason: "Breakfast dairy for 3 meals",
        estimatedPrice: 1.5
      },
      {
        id: "milk-2",
        name: "Milk",
        category: "dairy",
        unit: "ml",
        quantity: 1250,
        pricePerUnit: 0.002,
        costLevel: "low",
        reason: "Snack dairy for 5 meals",
        estimatedPrice: 2.5
      }
    ];

    const aggregated = aggregateShoppingList(items, 7);
    expect(aggregated).toHaveLength(1);
    expect(aggregated[0].unit).toBe("L");
    expect(aggregated[0].normalizedDisplayText).toBe("2L");
  });
});
