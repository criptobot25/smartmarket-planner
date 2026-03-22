"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useShoppingPlan } from "../../src/contexts/ShoppingPlanContext";
import { trackEvent } from "../lib/analytics";
import { useAppTranslation } from "../lib/i18n";
import { useShoppingProgressStore } from "../stores/shoppingProgressStore";

type ConciergeIntent = "daily_replan" | "smart_swap" | "quick_help";

type CopySet = {
  title: string;
  subtitle: string;
  buttonLabel: string;
  dailyReplan: string;
  smartSwap: string;
  quickHelp: string;
};

const copyByLanguage: Record<string, CopySet> = {
  pt: {
    title: "Concierge WhatsApp",
    subtitle: "Fale com o time e ajuste seu plano em segundos",
    buttonLabel: "Abrir concierge",
    dailyReplan: "🔁 Replanejar meu dia",
    smartSwap: "💸 Troca econômica",
    quickHelp: "💬 Dúvida rápida",
  },
  en: {
    title: "WhatsApp Concierge",
    subtitle: "Talk to our team and adjust your plan in seconds",
    buttonLabel: "Open concierge",
    dailyReplan: "🔁 Replan my day",
    smartSwap: "💸 Lower-cost swap",
    quickHelp: "💬 Quick question",
  },
};

function sanitizePhone(rawPhone: string): string {
  return rawPhone.replace(/[^\d]/g, "");
}

export function WhatsAppConcierge() {
  const pathname = usePathname();
  const { weeklyPlan, shoppingList } = useShoppingPlan();
  const { language } = useAppTranslation();
  const purchasedCountStore = useShoppingProgressStore((state) => state.purchasedCount);
  const totalCountStore = useShoppingProgressStore((state) => state.totalCount);
  const [isExpanded, setIsExpanded] = useState(false);

  const phone = sanitizePhone(process.env.NEXT_PUBLIC_WHATSAPP_CONCIERGE_NUMBER ?? "");

  const copy = useMemo(() => {
    if (language === "pt") return copyByLanguage.pt;
    return copyByLanguage.en;
  }, [language]);

  const purchasedCount = purchasedCountStore;
  const totalCount = totalCountStore > 0 ? totalCountStore : shoppingList.length;

  const isInPrivateApp = pathname?.startsWith("/app") ?? false;

  if (!isInPrivateApp || !phone) {
    return null;
  }

  const buildMessage = (intent: ConciergeIntent): string => {
    const intentPromptByLanguage: Record<string, string> = {
      pt: {
        daily_replan: "Quero replanejar meu dia agora.",
        smart_swap: "Quero uma troca mais barata para manter meus macros.",
        quick_help: "Preciso de ajuda rápida com meu plano.",
      }[intent] ?? "Preciso de ajuda com meu plano.",
      en: {
        daily_replan: "I want to replan my day right now.",
        smart_swap: "I need a lower-cost swap while keeping my macros.",
        quick_help: "I need quick help with my current plan.",
      }[intent] ?? "I need help with my current plan.",
    };

    const planContext = weeklyPlan
      ? language === "pt"
        ? `\n\nContexto atual:\n- Meta proteína: ${Math.round(weeklyPlan.proteinTargetPerDay)}g/dia\n- Custo: ${weeklyPlan.costTier}\n- Progresso compras: ${purchasedCount}/${totalCount}`
        : `\n\nCurrent context:\n- Protein target: ${Math.round(weeklyPlan.proteinTargetPerDay)}g/day\n- Cost tier: ${weeklyPlan.costTier}\n- Shopping progress: ${purchasedCount}/${totalCount}`
      : language === "pt"
        ? "\n\nAinda não gerei meu plano semanal."
        : "\n\nI have not generated my weekly plan yet.";

    const routeContext = `${language === "pt" ? "\nTela" : "\nScreen"}: ${pathname}`;

    return `${intentPromptByLanguage[language === "pt" ? "pt" : "en"]}${planContext}${routeContext}`;
  };

  const openWhatsApp = (intent: ConciergeIntent) => {
    const message = buildMessage(intent);
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    trackEvent("whatsapp_concierge_opened", {
      intent,
      route: pathname,
      has_weekly_plan: Boolean(weeklyPlan),
      shopping_total_items: totalCount,
    });

    window.open(waUrl, "_blank", "noopener,noreferrer");
    setIsExpanded(false);
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
          <div className="np-wa-actions">
            <button type="button" onClick={() => openWhatsApp("daily_replan")} className="np-wa-action">
              {copy.dailyReplan}
            </button>
            <button type="button" onClick={() => openWhatsApp("smart_swap")} className="np-wa-action">
              {copy.smartSwap}
            </button>
            <button type="button" onClick={() => openWhatsApp("quick_help")} className="np-wa-action">
              {copy.quickHelp}
            </button>
          </div>
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
