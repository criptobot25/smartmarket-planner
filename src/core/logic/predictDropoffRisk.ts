import type { PlanInput } from "../models/PlanInput";

export type DropoffRiskLevel = "low" | "medium" | "high";

export interface DropoffRiskAssessment {
  level: DropoffRiskLevel;
  score: number;
  reasons: string[];
}

interface DropoffRiskInputs {
  shoppingProgress: number;
  adherenceScore?: number;
  streakWeeks?: number;
  confidenceScore?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function assessDropoffRisk(input: DropoffRiskInputs): DropoffRiskAssessment {
  const reasons: string[] = [];
  let score = 0;

  if (input.shoppingProgress < 25) {
    score += 30;
    reasons.push("Baixo progresso de compras nesta semana");
  } else if (input.shoppingProgress < 50) {
    score += 18;
    reasons.push("Progresso de compras abaixo do ideal");
  }

  if (typeof input.adherenceScore === "number") {
    if (input.adherenceScore < 60) {
      score += 30;
      reasons.push("Adesão recente baixa");
    } else if (input.adherenceScore < 75) {
      score += 15;
      reasons.push("Adesão recente moderada");
    }
  }

  if ((input.streakWeeks || 0) <= 1) {
    score += 15;
    reasons.push("Consistência semanal curta");
  }

  if (typeof input.confidenceScore === "number" && input.confidenceScore < 70) {
    score += 12;
    reasons.push("Confiança da lista abaixo do ideal");
  }

  const normalizedScore = clamp(Math.round(score), 0, 100);

  const level: DropoffRiskLevel = normalizedScore >= 60
    ? "high"
    : normalizedScore >= 35
      ? "medium"
      : "low";

  return {
    level,
    score: normalizedScore,
    reasons,
  };
}

export function buildPreventiveInput(baseInput: PlanInput): PlanInput {
  return {
    ...baseInput,
    mealsPerDay: Math.max(3, baseInput.mealsPerDay - 1),
    costTier: "low",
    dietStyle: "balanced",
    fitnessGoal: "maintenance",
  };
}
