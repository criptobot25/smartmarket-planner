import type { PlanInput } from "../models/PlanInput";
import type { FoodItem } from "../models/FoodItem";
import type { WeeklyPlan } from "../models/WeeklyPlan";

export type ValidationSeverity = "info" | "warning" | "error";

export interface ShoppingListValidationIssue {
  code: string;
  severity: ValidationSeverity;
  message: string;
}

export interface ShoppingListValidationReport {
  confidenceScore: number;
  summary: string;
  issues: ShoppingListValidationIssue[];
  checks: {
    plannedFoodsCoveredPercent: number;
    proteinCoveragePercent: number;
    estimatedTotalCost: number;
    itemsWithReasonPercent: number;
    itemsWithPricePercent: number;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pushIssue(
  issues: ShoppingListValidationIssue[],
  score: { value: number },
  issue: ShoppingListValidationIssue,
  penalty: number,
): void {
  issues.push(issue);
  score.value = clamp(score.value - penalty, 0, 100);
}

function normalizeText(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function hasRestrictionConflict(itemName: string, restrictions: string[]): boolean {
  const normalizedItem = normalizeText(itemName);

  return restrictions.some((rawRestriction) => {
    const restriction = normalizeText(rawRestriction);

    if (restriction.includes("lactose") || restriction.includes("dairy") || restriction.includes("latic")) {
      return /milk|cheese|yogurt|cream|butter|cottage/.test(normalizedItem);
    }

    if (restriction.includes("gluten") || restriction.includes("wheat") || restriction.includes("trigo")) {
      return /bread|pasta|barley|couscous|wheat/.test(normalizedItem);
    }

    if (restriction.includes("vegan")) {
      return /chicken|beef|pork|salmon|tuna|egg|turkey|cod|yogurt|milk|cheese/.test(normalizedItem);
    }

    if (restriction.includes("vegetarian")) {
      return /chicken|beef|pork|salmon|tuna|turkey|cod/.test(normalizedItem);
    }

    return false;
  });
}

export function validateShoppingList(
  input: PlanInput,
  weeklyPlan: WeeklyPlan,
  items: FoodItem[],
  totalProtein: number,
): ShoppingListValidationReport {
  const score = { value: 100 };
  const issues: ShoppingListValidationIssue[] = [];

  const plannedFoodIds = new Set<string>();
  for (const day of weeklyPlan.days) {
    [day.meals.breakfast, day.meals.lunch, day.meals.dinner, day.meals.snack]
      .filter(Boolean)
      .forEach((meal) => {
        meal!.foodIds.forEach((foodId) => plannedFoodIds.add(foodId));
      });
  }

  const listedFoodIds = new Set(items.map((item) => item.id));
  let coveredCount = 0;
  plannedFoodIds.forEach((foodId) => {
    if (listedFoodIds.has(foodId)) coveredCount += 1;
  });

  const plannedFoodsCoveredPercent = plannedFoodIds.size > 0
    ? Math.round((coveredCount / plannedFoodIds.size) * 100)
    : 100;

  if (plannedFoodsCoveredPercent < 98) {
    pushIssue(
      issues,
      score,
      {
        code: "missing_planned_foods",
        severity: "error",
        message: `A lista cobre apenas ${plannedFoodsCoveredPercent}% dos alimentos usados no plano semanal.`,
      },
      28,
    );
  }

  const targetProteinWeek = weeklyPlan.proteinTargetPerDay * 7;
  const proteinCoveragePercent = targetProteinWeek > 0
    ? Math.round((totalProtein / targetProteinWeek) * 100)
    : 100;

  if (proteinCoveragePercent < 85) {
    pushIssue(
      issues,
      score,
      {
        code: "low_protein_coverage",
        severity: "error",
        message: `Cobertura de proteína baixa (${proteinCoveragePercent}% da meta semanal).`,
      },
      24,
    );
  } else if (proteinCoveragePercent < 95) {
    pushIssue(
      issues,
      score,
      {
        code: "borderline_protein_coverage",
        severity: "warning",
        message: `Cobertura de proteína borderline (${proteinCoveragePercent}%).`,
      },
      10,
    );
  }

  const conflictCount = items.filter((item) => hasRestrictionConflict(item.name, input.restrictions || [])).length;
  if (conflictCount > 0) {
    pushIssue(
      issues,
      score,
      {
        code: "restriction_conflicts",
        severity: "error",
        message: `${conflictCount} item(ns) parecem conflitar com restrições informadas.`,
      },
      Math.min(30, 10 + conflictCount * 3),
    );
  }

  const itemsWithReasonPercent = items.length > 0
    ? Math.round((items.filter((item) => Boolean(item.reason)).length / items.length) * 100)
    : 100;

  if (itemsWithReasonPercent < 85) {
    pushIssue(
      issues,
      score,
      {
        code: "low_explainability",
        severity: "warning",
        message: `Explicabilidade baixa: apenas ${itemsWithReasonPercent}% dos itens têm justificativa.`,
      },
      8,
    );
  }

  const itemsWithPricePercent = items.length > 0
    ? Math.round((items.filter((item) => (item.estimatedPrice || 0) > 0).length / items.length) * 100)
    : 100;

  if (itemsWithPricePercent < 95) {
    pushIssue(
      issues,
      score,
      {
        code: "missing_price_estimates",
        severity: "warning",
        message: `Estimativa de preço incompleta (${itemsWithPricePercent}% dos itens).`,
      },
      6,
    );
  }

  const estimatedTotalCost = items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);

  if (estimatedTotalCost <= 0) {
    pushIssue(
      issues,
      score,
      {
        code: "invalid_total_cost",
        severity: "error",
        message: "Não foi possível estimar o custo total da lista.",
      },
      20,
    );
  }

  const confidenceScore = Math.round(clamp(score.value, 0, 100));

  const summary = confidenceScore >= 90
    ? "Lista altamente consistente com os dados informados e metas semanais."
    : confidenceScore >= 75
      ? "Lista consistente com pequenos pontos de atenção."
      : confidenceScore >= 55
        ? "Lista utilizável, mas recomenda revisão antes de comprar."
        : "Lista com inconsistências relevantes — ajuste os dados e gere novamente.";

  return {
    confidenceScore,
    summary,
    issues,
    checks: {
      plannedFoodsCoveredPercent,
      proteinCoveragePercent,
      estimatedTotalCost: Number(estimatedTotalCost.toFixed(2)),
      itemsWithReasonPercent,
      itemsWithPricePercent,
    },
  };
}
