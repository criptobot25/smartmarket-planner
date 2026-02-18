import { FoodCategory, FoodItem } from "../models/FoodItem";
import { normalizeQuantity } from "./normalizeQuantity";

interface RawShoppingItem extends FoodItem {
  purchased?: boolean;
}

interface AggregationBucket {
  base: RawShoppingItem;
  quantityInBaseUnit: number;
  baseUnit: string;
  sourceIds: string[];
  reasons: Set<string>;
  estimatedPrice: number;
  purchased: boolean;
}

export interface AggregatedShoppingItem extends FoodItem {
  purchased?: boolean;
  sourceIds: string[];
  normalizedDisplayText: string;
  coverageText: string;
}

interface ConvertedQuantity {
  value: number;
  baseUnit: string;
}

function toBaseUnit(quantity: number, unit: string): ConvertedQuantity {
  const normalizedUnit = unit.trim().toLowerCase();

  if (normalizedUnit === "kg") {
    return { value: quantity * 1000, baseUnit: "g" };
  }

  if (normalizedUnit === "g") {
    return { value: quantity, baseUnit: "g" };
  }

  if (normalizedUnit === "l") {
    return { value: quantity * 1000, baseUnit: "ml" };
  }

  if (normalizedUnit === "ml") {
    return { value: quantity, baseUnit: "ml" };
  }

  return { value: quantity, baseUnit: unit };
}

function keyForItem(item: FoodItem): string {
  const normalizedName = item.name.trim().toLowerCase();
  const converted = toBaseUnit(item.quantity, item.unit);
  return `${normalizedName}::${item.category}::${converted.baseUnit}`;
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
  const buckets = new Map<string, AggregationBucket>();

  items.forEach((item) => {
    const key = keyForItem(item);
    const converted = toBaseUnit(item.quantity, item.unit);
    const existing = buckets.get(key);

    if (existing) {
      existing.quantityInBaseUnit += converted.value;
      existing.sourceIds.push(item.id);
      existing.estimatedPrice += item.estimatedPrice || 0;
      existing.purchased = existing.purchased || Boolean(item.purchased);
      if (item.reason) {
        existing.reasons.add(item.reason);
      }
      return;
    }

    buckets.set(key, {
      base: item,
      quantityInBaseUnit: converted.value,
      baseUnit: converted.baseUnit,
      sourceIds: [item.id],
      reasons: new Set(item.reason ? [item.reason] : []),
      estimatedPrice: item.estimatedPrice || 0,
      purchased: Boolean(item.purchased)
    });
  });

  return Array.from(buckets.values())
    .map((bucket) => {
      const normalized = normalizeQuantity(bucket.quantityInBaseUnit, bucket.baseUnit);
      const reasons = Array.from(bucket.reasons);

      return {
        ...bucket.base,
        id: bucket.sourceIds[0],
        quantity: normalized.value,
        unit: normalized.unit,
        estimatedPrice: bucket.estimatedPrice,
        purchased: bucket.purchased,
        sourceIds: bucket.sourceIds,
        normalizedDisplayText: normalized.displayText,
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
