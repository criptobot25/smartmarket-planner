import { FoodCategory, FoodItem } from "../models/FoodItem";
import { aggregateShoppingItems, type RawShoppingItem } from "./aggregateShoppingItems";

export interface AggregatedShoppingItem extends FoodItem {
  purchased?: boolean;
  sourceIds: string[];
  normalizedDisplayText: string;
  coverageText: string;
}

function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function parseReasonCoverage(reason: string): { meals: number; mealTypeCount: number } | null {
  const mealMatch = reason.match(/for\s+(\d+)\s+meals?/i);
  if (!mealMatch) {
    return null;
  }

  const meals = Number.parseInt(mealMatch[1], 10);
  const mealTypeMatches = reason.match(/Breakfast|Lunch|Dinner|Snack/gi) || [];
  const mealTypeCount = mealTypeMatches.length > 0 ? mealTypeMatches.length : 1;

  return {
    meals,
    mealTypeCount
  };
}

function categoryCoverageLabel(category: FoodCategory): string {
  switch (category) {
    case "protein":
      return "protein";
    case "grains":
    case "carbs":
      return "carbs";
    case "vegetables":
      return "vegetables";
    case "fruits":
      return "fruit";
    case "dairy":
      return "dairy";
    case "fats":
      return "healthy fats";
    case "legumes":
      return "legumes";
    default:
      return "your meals";
  }
}

function buildCoverageText(category: FoodCategory, reasons: string[], planDays: number): string {
  let coveredDays = 0;

  reasons.forEach((reason) => {
    const parsed = parseReasonCoverage(reason);
    if (!parsed) {
      return;
    }

    const currentReasonDays = Math.round(parsed.meals / parsed.mealTypeCount);
    coveredDays = Math.max(coveredDays, currentReasonDays);
  });

  if (coveredDays <= 0) {
    coveredDays = planDays;
  }

  const boundedDays = Math.max(1, Math.min(planDays, coveredDays));
  const dayLabel = boundedDays === 1 ? "day" : "days";
  const coverageLabel = categoryCoverageLabel(category);

  return `This covers ${boundedDays} ${dayLabel} of ${coverageLabel}`;
}

export function aggregateShoppingList(
  items: RawShoppingItem[],
  planDays = 7
): AggregatedShoppingItem[] {
  return aggregateShoppingItems(items)
    .map((bucket) => {
      const reasons = bucket.reasons;

      return {
        ...bucket.base,
        id: bucket.sourceIds[0],
        quantity: bucket.normalizedValue,
        unit: bucket.normalizedUnit,
        estimatedPrice: bucket.estimatedPrice,
        purchased: bucket.purchased,
        sourceIds: bucket.sourceIds,
        normalizedDisplayText: bucket.normalizedDisplayText,
        coverageText: buildCoverageText(bucket.base.category, reasons, planDays),
        reason: reasons.length > 0 ? reasons.map(capitalize).join(" · ") : undefined
      };
    })
    .sort((a, b) => {
      if (a.category === b.category) {
        return a.name.localeCompare(b.name);
      }

      return a.category.localeCompare(b.category);
    });
}
