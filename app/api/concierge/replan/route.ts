import { NextResponse } from "next/server";

type DailyReplanIssue = "ate_out" | "skipped_meal" | "missing_ingredients";
type SupportedLanguage = "pt" | "en";
type CostTier = "low" | "medium" | "high";

interface ReplanRequestPayload {
  issue?: DailyReplanIssue;
  language?: SupportedLanguage;
  proteinTargetPerDay?: number;
  costTier?: CostTier;
  shoppingProgress?: string;
  todayMeals?: string[];
}

function normalizeLanguage(language: string | undefined): SupportedLanguage {
  if (!language) return "en";
  return language.toLowerCase().startsWith("pt") ? "pt" : "en";
}

function buildSuggestions(payload: ReplanRequestPayload, language: SupportedLanguage): string[] {
  const proteinTarget = Number.isFinite(payload.proteinTargetPerDay) ? Math.round(payload.proteinTargetPerDay ?? 0) : null;
  const costTier = payload.costTier ?? "medium";
  const shoppingProgress = payload.shoppingProgress ?? "0/0";
  const todayMeals = Array.isArray(payload.todayMeals) ? payload.todayMeals.filter(Boolean) : [];

  const contextLine = language === "pt"
    ? `Contexto: custo ${costTier}, compras ${shoppingProgress}${proteinTarget ? `, meta ${proteinTarget}g proteína` : ""}.`
    : `Context: ${costTier} cost tier, shopping ${shoppingProgress}${proteinTarget ? `, ${proteinTarget}g protein target` : ""}.`;

  if (payload.issue === "ate_out") {
    return language === "pt"
      ? [
          "No restante do dia, priorize 2 refeições com proteína magra + vegetais para compensar calorias extras.",
          proteinTarget
            ? `Distribua ~${Math.max(25, Math.round(proteinTarget / 3))}g de proteína por refeição restante.`
            : "Garanta pelo menos 25–35g de proteína nas próximas refeições.",
          "Evite lanches líquidos calóricos hoje e aumente água + 15 min de caminhada após o jantar.",
          contextLine,
        ]
      : [
          "For the rest of the day, prioritize 2 meals with lean protein + vegetables to offset extra calories.",
          proteinTarget
            ? `Aim for ~${Math.max(25, Math.round(proteinTarget / 3))}g protein in each remaining meal.`
            : "Target at least 25–35g protein in your next meals.",
          "Avoid calorie-dense liquid snacks today; increase water and take a 15-minute walk after dinner.",
          contextLine,
        ];
  }

  if (payload.issue === "skipped_meal") {
    return language === "pt"
      ? [
          "Realoque a refeição perdida nas próximas 2 refeições sem dobrar calorias de uma vez.",
          "Use uma opção rápida: iogurte grego + aveia + fruta, ou ovos + pão integral.",
          "Mantenha o próximo jantar simples para evitar novo atraso.",
          contextLine,
        ]
      : [
          "Reallocate the skipped meal into the next 2 meals without doubling calories at once.",
          "Use a quick fallback: greek yogurt + oats + fruit, or eggs + whole-grain bread.",
          "Keep dinner simple to avoid another delay.",
          contextLine,
        ];
  }

  const budgetSwapPt = costTier === "low"
    ? "Trocas rápidas: salmão → atum; carne magra → frango; castanhas → amendoim natural."
    : "Trocas rápidas: ingrediente faltante por alternativa da mesma categoria e proteína similar.";

  const budgetSwapEn = costTier === "low"
    ? "Quick swaps: salmon -> tuna; lean beef -> chicken; mixed nuts -> natural peanuts."
    : "Quick swaps: replace missing ingredient with same category + similar protein option.";

  return language === "pt"
    ? [
        budgetSwapPt,
        todayMeals.length > 0
          ? `Mantenha as refeições de hoje (${todayMeals.slice(0, 3).join(", ")}) e troque apenas 1 ingrediente por refeição.`
          : "Mantenha a estrutura de refeições de hoje e troque apenas 1 ingrediente por refeição.",
        "Se faltar proteína, complete com ovos, atum ou iogurte grego para bater meta.",
        contextLine,
      ]
    : [
        budgetSwapEn,
        todayMeals.length > 0
          ? `Keep today's meals (${todayMeals.slice(0, 3).join(", ")}) and replace only 1 ingredient per meal.`
          : "Keep today's meal structure and replace only 1 ingredient per meal.",
        "If protein is low, patch with eggs, tuna, or greek yogurt to hit target.",
        contextLine,
      ];
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as ReplanRequestPayload;
    const language = normalizeLanguage(payload.language);
    const suggestions = buildSuggestions(payload, language);

    return NextResponse.json({
      suggestions,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
