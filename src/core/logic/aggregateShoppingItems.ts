import type { FoodItem } from "../models/FoodItem";
import { normalizeQuantity } from "./normalizeQuantity";

export interface RawShoppingItem extends FoodItem {
  purchased?: boolean;
}

export interface AggregatedShoppingCoreItem {
  base: RawShoppingItem;
  sourceIds: string[];
  quantityInBaseUnit: number;
  baseUnit: string;
  estimatedPrice: number;
  purchased: boolean;
  reasons: string[];
  mergedReason?: string;
  normalizedValue: number;
  normalizedUnit: string;
  normalizedDisplayText: string;
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

function normalizeFoodId(rawId: string): string {
  return rawId.trim().toLowerCase().replace(/-\d+$/, "");
}

function keyForItem(item: FoodItem): string {
  const converted = toBaseUnit(item.quantity, item.unit);
  const normalizedName = item.name.trim().toLowerCase();
  const normalizedId = normalizeFoodId(item.id);
  const identity = normalizedId || normalizedName;

  return `${identity}::${normalizedName}::${item.category}::${converted.baseUnit}`;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildDisplayText(
  item: RawShoppingItem,
  normalizedDisplayText: string,
  sourceCount: number,
  normalizedUnit: string
): string {
  const isProteinPackEstimate = item.category === "protein" && normalizedUnit.toLowerCase() === "kg" && sourceCount >= 3;

  if (!isProteinPackEstimate) {
    return normalizedDisplayText;
  }

  return `${normalizedDisplayText} (~${sourceCount} packs)`;
}

export function aggregateShoppingItems(items: RawShoppingItem[]): AggregatedShoppingCoreItem[] {
  const buckets = new Map<string, {
    base: RawShoppingItem;
    quantityInBaseUnit: number;
    baseUnit: string;
    sourceIds: string[];
    reasons: Set<string>;
    estimatedPrice: number;
    purchased: boolean;
  }>();

  items.forEach((item) => {
    const key = keyForItem(item);
    const converted = toBaseUnit(item.quantity, item.unit);
    const existing = buckets.get(key);

    if (!existing) {
      buckets.set(key, {
        base: item,
        quantityInBaseUnit: converted.value,
        baseUnit: converted.baseUnit,
        sourceIds: [item.id],
        reasons: new Set(item.reason ? [item.reason] : []),
        estimatedPrice: item.estimatedPrice || 0,
        purchased: Boolean(item.purchased)
      });
      return;
    }

    existing.quantityInBaseUnit += converted.value;
    existing.sourceIds = uniqueStrings([...existing.sourceIds, item.id]);
    existing.estimatedPrice += item.estimatedPrice || 0;
    existing.purchased = existing.purchased || Boolean(item.purchased);

    if (item.reason) {
      existing.reasons.add(item.reason);
    }
  });

  return Array.from(buckets.values()).map((bucket) => {
    const normalized = normalizeQuantity(bucket.quantityInBaseUnit, bucket.baseUnit);
    const sourceIds = uniqueStrings(bucket.sourceIds);
    const reasons = uniqueStrings(Array.from(bucket.reasons));

    return {
      base: bucket.base,
      sourceIds,
      quantityInBaseUnit: bucket.quantityInBaseUnit,
      baseUnit: bucket.baseUnit,
      estimatedPrice: bucket.estimatedPrice,
      purchased: bucket.purchased,
      reasons,
      mergedReason: reasons.length > 0 ? reasons.join(" · ") : undefined,
      normalizedValue: normalized.value,
      normalizedUnit: normalized.unit,
      normalizedDisplayText: buildDisplayText(bucket.base, normalized.displayText, sourceIds.length, normalized.unit)
    };
  });
}
