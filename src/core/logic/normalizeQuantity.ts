export interface NormalizedQuantity {
  value: number;
  unit: string;
  displayText: string;
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatValue(value: number): string {
  const rounded = roundToTwo(value);
  return Number.isInteger(rounded) ? `${rounded}` : `${rounded}`;
}

export function normalizeQuantity(quantity: number, unit: string): NormalizedQuantity {
  const normalizedUnit = unit.trim().toLowerCase();

  if (normalizedUnit === "g" || normalizedUnit === "gram" || normalizedUnit === "grams") {
    const value = roundToTwo(quantity / 1000);
    return {
      value,
      unit: "kg",
      displayText: `${formatValue(value)}kg`
    };
  }

  if (normalizedUnit === "kg" || normalizedUnit === "kilogram" || normalizedUnit === "kilograms") {
    const value = roundToTwo(quantity);
    return {
      value,
      unit: "kg",
      displayText: `${formatValue(value)}kg`
    };
  }

  if (normalizedUnit === "ml" || normalizedUnit === "milliliter" || normalizedUnit === "milliliters") {
    const value = roundToTwo(quantity / 1000);
    return {
      value,
      unit: "L",
      displayText: `${formatValue(value)}L`
    };
  }

  if (normalizedUnit === "l" || normalizedUnit === "liter" || normalizedUnit === "liters") {
    const value = roundToTwo(quantity);
    return {
      value,
      unit: "L",
      displayText: `${formatValue(value)}L`
    };
  }

  const value = roundToTwo(quantity);
  return {
    value,
    unit,
    displayText: `${formatValue(value)}${unit}`
  };
}
