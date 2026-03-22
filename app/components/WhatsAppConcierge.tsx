"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useShoppingPlan } from "../../src/contexts/ShoppingPlanContext";
import { trackEvent } from "../lib/analytics";
import { useAppTranslation } from "../lib/i18n";
import { useShoppingProgressStore } from "../stores/shoppingProgressStore";
import { useToast } from "./Toast";
import type { PlanInput } from "../../src/core/models/PlanInput";

type ConciergeIntent = "daily_replan" | "smart_swap" | "quick_help";
type DailyReplanIssue = "ate_out" | "skipped_meal" | "missing_ingredients";
type ConciergeView = "menu" | "daily_replan";

type CopySet = {
  title: string;
  subtitle: string;
  buttonLabel: string;
  dailyReplan: string;
  smartSwap: string;
  quickHelp: string;
  backLabel: string;
  reasonTitle: string;
  reasonAteOut: string;
  reasonSkippedMeal: string;
  reasonMissingIngredients: string;
  notePlaceholder: string;
  sendReplan: string;
  planTitle: string;
  loadingPlan: string;
  applyInApp: string;
  applyingInApp: string;
  applySuccess: string;
  applyError: string;
  applyNoPlan: string;
};

const copyByLanguage: Record<string, CopySet> = {
  pt: {
    title: "Concierge WhatsApp",
    subtitle: "Fale com o time e ajuste seu plano em segundos",
    buttonLabel: "Abrir concierge",
    dailyReplan: "🔁 Replanejar meu dia",
    smartSwap: "💸 Troca econômica",
    quickHelp: "💬 Dúvida rápida",
    backLabel: "← Voltar",
    reasonTitle: "O que aconteceu hoje?",
    reasonAteOut: "🍽️ Comi fora do plano",
    reasonSkippedMeal: "⏱️ Pulei uma refeição",
    reasonMissingIngredients: "🛒 Faltou ingrediente",
    notePlaceholder: "Opcional: descreva rapidamente (ex.: sem tempo no almoço)",
    sendReplan: "Enviar para replanejar",
    planTitle: "Plano de contingência sugerido",
    loadingPlan: "Gerando ajuste rápido...",
    applyInApp: "⚡ Aplicar ajuste rápido no app",
    applyingInApp: "Aplicando ajuste...",
    applySuccess: "Ajuste aplicado. Seu plano foi regenerado.",
    applyError: "Não consegui aplicar o ajuste agora. Tente novamente.",
    applyNoPlan: "Gere um plano primeiro para aplicar ajuste automático.",
  },
  en: {
    title: "WhatsApp Concierge",
    subtitle: "Talk to our team and adjust your plan in seconds",
    buttonLabel: "Open concierge",
    dailyReplan: "🔁 Replan my day",
    smartSwap: "💸 Lower-cost swap",
    quickHelp: "💬 Quick question",
    backLabel: "← Back",
    reasonTitle: "What happened today?",
    reasonAteOut: "🍽️ I ate out",
    reasonSkippedMeal: "⏱️ I skipped a meal",
    reasonMissingIngredients: "🛒 Missing ingredients",
    notePlaceholder: "Optional: add quick details (e.g., no lunch time)",
    sendReplan: "Send replan request",
    planTitle: "Suggested contingency plan",
    loadingPlan: "Generating quick adjustment...",
    applyInApp: "⚡ Apply quick adjustment in app",
    applyingInApp: "Applying adjustment...",
    applySuccess: "Adjustment applied. Your plan has been regenerated.",
    applyError: "Could not apply adjustment right now. Please try again.",
    applyNoPlan: "Generate a plan first to apply automatic adjustment.",
  },
};

type ReplanResponse = {
  suggestions: string[];
  generatedAt: string;
};

function sanitizePhone(rawPhone: string): string {
  return rawPhone.replace(/[^\d]/g, "");
}

export function WhatsAppConcierge() {
  const pathname = usePathname();
  const { weeklyPlan, shoppingList, currentInput, generatePlan } = useShoppingPlan();
  const { language } = useAppTranslation();
  const { addToast } = useToast();
  const purchasedCountStore = useShoppingProgressStore((state) => state.purchasedCount);
  const totalCountStore = useShoppingProgressStore((state) => state.totalCount);
  const [isExpanded, setIsExpanded] = useState(false);
  const [view, setView] = useState<ConciergeView>("menu");
  const [dailyIssue, setDailyIssue] = useState<DailyReplanIssue>("ate_out");
  const [dailyNote, setDailyNote] = useState("");
  const [replanSuggestions, setReplanSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const phone = sanitizePhone(process.env.NEXT_PUBLIC_WHATSAPP_CONCIERGE_NUMBER ?? "");

  const copy = useMemo(() => {
    if (language === "pt") return copyByLanguage.pt;
    return copyByLanguage.en;
  }, [language]);

  const purchasedCount = purchasedCountStore;
  const totalCount = totalCountStore > 0 ? totalCountStore : shoppingList.length;

  const todayMealContext = useMemo(() => {
    if (!weeklyPlan) {
      return language === "pt" ? "Plano semanal ainda não gerado." : "Weekly plan not generated yet.";
    }

    const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
    const todayKey = dayMap[new Date().getDay()];
    const todayPlan = weeklyPlan.days.find((day) => day.day === todayKey);

    if (!todayPlan) {
      return language === "pt" ? "Não encontrei o dia de hoje no plano." : "Could not find today's plan.";
    }

    const meals = [
      todayPlan.meals.breakfast?.name,
      todayPlan.meals.lunch?.name,
      todayPlan.meals.dinner?.name,
      todayPlan.meals.snack?.name,
    ].filter(Boolean) as string[];

    if (language === "pt") {
      return `Dia: ${todayKey} | Refeições: ${meals.join(" | ")}`;
    }

    return `Day: ${todayKey} | Meals: ${meals.join(" | ")}`;
  }, [language, weeklyPlan]);

  const todayMeals = useMemo(() => {
    if (!weeklyPlan) {
      return [] as string[];
    }

    const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
    const todayKey = dayMap[new Date().getDay()];
    const todayPlan = weeklyPlan.days.find((day) => day.day === todayKey);

    if (!todayPlan) {
      return [] as string[];
    }

    return [
      todayPlan.meals.breakfast?.name,
      todayPlan.meals.lunch?.name,
      todayPlan.meals.dinner?.name,
      todayPlan.meals.snack?.name,
    ].filter(Boolean) as string[];
  }, [weeklyPlan]);

  const isInPrivateApp = pathname?.startsWith("/app") ?? false;

  if (!isInPrivateApp || !phone) {
    return null;
  }

  useEffect(() => {
    if (view !== "daily_replan") {
      return;
    }

    let isMounted = true;

    const fetchSuggestions = async () => {
      setIsLoadingSuggestions(true);

      try {
        const response = await fetch("/api/concierge/replan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            issue: dailyIssue,
            language,
            proteinTargetPerDay: weeklyPlan?.proteinTargetPerDay,
            costTier: weeklyPlan?.costTier,
            shoppingProgress: `${purchasedCount}/${totalCount}`,
            todayMeals,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch replan suggestions");
        }

        const data = (await response.json()) as ReplanResponse;

        if (isMounted) {
          setReplanSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        }
      } catch {
        if (isMounted) {
          setReplanSuggestions([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSuggestions(false);
        }
      }
    };

    void fetchSuggestions();

    return () => {
      isMounted = false;
    };
  }, [dailyIssue, language, purchasedCount, todayMeals, totalCount, view, weeklyPlan?.costTier, weeklyPlan?.proteinTargetPerDay]);

  const buildMessage = (intent: ConciergeIntent, options?: { issue?: DailyReplanIssue; note?: string }): string => {
    const issueByLanguage: Record<string, Record<DailyReplanIssue, string>> = {
      pt: {
        ate_out: "Comi fora do plano",
        skipped_meal: "Pulei uma refeição",
        missing_ingredients: "Faltou ingrediente",
      },
      en: {
        ate_out: "I ate out",
        skipped_meal: "I skipped a meal",
        missing_ingredients: "Missing ingredients",
      },
    };

    const intentPromptByLanguage: Record<string, string> = {
      pt: {
        daily_replan: `Quero replanejar meu dia agora.${options?.issue ? ` Motivo: ${issueByLanguage.pt[options.issue]}.` : ""}${options?.note ? ` Nota: ${options.note}.` : ""}`,
        smart_swap: "Quero uma troca mais barata para manter meus macros.",
        quick_help: "Preciso de ajuda rápida com meu plano.",
      }[intent] ?? "Preciso de ajuda com meu plano.",
      en: {
        daily_replan: `I want to replan my day right now.${options?.issue ? ` Reason: ${issueByLanguage.en[options.issue]}.` : ""}${options?.note ? ` Note: ${options.note}.` : ""}`,
        smart_swap: "I need a lower-cost swap while keeping my macros.",
        quick_help: "I need quick help with my current plan.",
      }[intent] ?? "I need help with my current plan.",
    };

    const planContext = weeklyPlan
      ? language === "pt"
        ? `\n\nContexto atual:\n- Meta proteína: ${Math.round(weeklyPlan.proteinTargetPerDay)}g/dia\n- Custo: ${weeklyPlan.costTier}\n- Progresso compras: ${purchasedCount}/${totalCount}\n- Hoje: ${todayMealContext}`
        : `\n\nCurrent context:\n- Protein target: ${Math.round(weeklyPlan.proteinTargetPerDay)}g/day\n- Cost tier: ${weeklyPlan.costTier}\n- Shopping progress: ${purchasedCount}/${totalCount}\n- Today: ${todayMealContext}`
      : language === "pt"
        ? "\n\nAinda não gerei meu plano semanal."
        : "\n\nI have not generated my weekly plan yet.";

    const routeContext = `${language === "pt" ? "\nTela" : "\nScreen"}: ${pathname}`;

    return `${intentPromptByLanguage[language === "pt" ? "pt" : "en"]}${planContext}${routeContext}`;
  };

  const buildAdjustedInput = (baseInput: PlanInput, issue: DailyReplanIssue): PlanInput => {
    if (issue === "ate_out") {
      return {
        ...baseInput,
        mealsPerDay: Math.max(3, baseInput.mealsPerDay - 1),
        dietStyle: "balanced",
        fitnessGoal: "maintenance",
      };
    }

    if (issue === "skipped_meal") {
      return {
        ...baseInput,
        mealsPerDay: Math.max(3, baseInput.mealsPerDay - 1),
        dietStyle: "balanced",
      };
    }

    return {
      ...baseInput,
      costTier: "low",
      dietStyle: baseInput.dietStyle === "comfort" ? "balanced" : baseInput.dietStyle,
    };
  };

  const applyContingencyInApp = async () => {
    if (!currentInput) {
      addToast(copy.applyNoPlan, "warning");
      return;
    }

    setIsApplying(true);

    try {
      const adjustedInput = buildAdjustedInput(currentInput, dailyIssue);
      generatePlan(adjustedInput);

      trackEvent("whatsapp_concierge_apply_in_app", {
        issue: dailyIssue,
        route: pathname,
      });

      addToast(copy.applySuccess, "success");
      setIsExpanded(false);
      setView("menu");
      setDailyNote("");
    } catch {
      addToast(copy.applyError, "error");
    } finally {
      setIsApplying(false);
    }
  };

  const openWhatsApp = (intent: ConciergeIntent) => {
    const message = buildMessage(intent, {
      issue: intent === "daily_replan" ? dailyIssue : undefined,
      note: intent === "daily_replan"
        ? [dailyNote.trim(), ...replanSuggestions.slice(0, 3)].filter(Boolean).join(" | ")
        : undefined,
    });
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    trackEvent("whatsapp_concierge_opened", {
      intent,
      route: pathname,
      has_weekly_plan: Boolean(weeklyPlan),
      shopping_total_items: totalCount,
    });

    window.open(waUrl, "_blank", "noopener,noreferrer");
    setIsExpanded(false);
    setView("menu");
    setDailyNote("");
  };

  return (
    <div className="np-wa-concierge" aria-live="polite">
      {isExpanded ? (
        <div className="np-wa-panel" role="dialog" aria-label={copy.title}>
          <div className="np-wa-head">
            <strong>{copy.title}</strong>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="np-wa-close"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <p className="np-wa-subtitle">{copy.subtitle}</p>
          {view === "menu" ? (
            <div className="np-wa-actions">
              <button type="button" onClick={() => setView("daily_replan")} className="np-wa-action">
                {copy.dailyReplan}
              </button>
              <button type="button" onClick={() => openWhatsApp("smart_swap")} className="np-wa-action">
                {copy.smartSwap}
              </button>
              <button type="button" onClick={() => openWhatsApp("quick_help")} className="np-wa-action">
                {copy.quickHelp}
              </button>
            </div>
          ) : (
            <div className="np-wa-flow">
              <button type="button" className="np-wa-back" onClick={() => setView("menu")}>{copy.backLabel}</button>
              <p className="np-wa-flow-title">{copy.reasonTitle}</p>
              <div className="np-wa-reasons">
                <button
                  type="button"
                  className={`np-wa-reason ${dailyIssue === "ate_out" ? "active" : ""}`}
                  onClick={() => setDailyIssue("ate_out")}
                >
                  {copy.reasonAteOut}
                </button>
                <button
                  type="button"
                  className={`np-wa-reason ${dailyIssue === "skipped_meal" ? "active" : ""}`}
                  onClick={() => setDailyIssue("skipped_meal")}
                >
                  {copy.reasonSkippedMeal}
                </button>
                <button
                  type="button"
                  className={`np-wa-reason ${dailyIssue === "missing_ingredients" ? "active" : ""}`}
                  onClick={() => setDailyIssue("missing_ingredients")}
                >
                  {copy.reasonMissingIngredients}
                </button>
              </div>
              <textarea
                className="np-wa-note"
                value={dailyNote}
                onChange={(event) => setDailyNote(event.target.value)}
                placeholder={copy.notePlaceholder}
                rows={2}
              />
              <div className="np-wa-plan-box">
                <p className="np-wa-plan-title">{copy.planTitle}</p>
                {isLoadingSuggestions ? (
                  <p className="np-wa-plan-loading">{copy.loadingPlan}</p>
                ) : (
                  <ul className="np-wa-plan-list">
                    {replanSuggestions.slice(0, 4).map((suggestion) => (
                      <li key={suggestion}>{suggestion}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button type="button" className="np-wa-send" onClick={() => openWhatsApp("daily_replan")}> 
                {copy.sendReplan}
              </button>
              <button
                type="button"
                className="np-wa-apply"
                onClick={applyContingencyInApp}
                disabled={isApplying}
              >
                {isApplying ? copy.applyingInApp : copy.applyInApp}
              </button>
            </div>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsExpanded((previous) => !previous)}
        className="np-wa-toggle"
        aria-label={copy.buttonLabel}
      >
        💬 WhatsApp
      </button>
    </div>
  );
}
