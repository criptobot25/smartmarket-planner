"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useShoppingPlan } from "../../src/contexts/ShoppingPlanContext";
import { assessDropoffRisk } from "../../src/core/logic/predictDropoffRisk";
import { useShoppingProgressStore } from "../stores/shoppingProgressStore";
import { useToast } from "./Toast";
import { trackEvent } from "../lib/analytics";

const ALERT_STORAGE_KEY = "nutripilot_last_retention_alert";

type AlertMemo = {
  dateKey: string;
  level: "medium" | "high";
  planId?: string;
};

function loadLastAlertMemo(): AlertMemo | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ALERT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as AlertMemo;
  } catch {
    return null;
  }
}

function saveLastAlertMemo(memo: AlertMemo): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(memo));
  } catch {
    // no-op
  }
}

export function RetentionRiskAlerts() {
  const pathname = usePathname();
  const { addToast } = useToast();
  const { weeklyPlan, streak } = useShoppingPlan();
  const progressPercent = useShoppingProgressStore((state) => state.progressPercent);
  const lastNotifiedRiskRef = useRef<string>("");

  useEffect(() => {
    if (!pathname?.startsWith("/app") || !weeklyPlan) {
      return;
    }

    const risk = assessDropoffRisk({
      shoppingProgress: progressPercent,
      adherenceScore: weeklyPlan.adherenceScore?.score,
      confidenceScore: weeklyPlan.shoppingValidation?.confidenceScore,
      streakWeeks: streak,
    });

    if (risk.level === "low") {
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const riskKey = `${weeklyPlan.id}:${risk.level}:${today}`;

    if (lastNotifiedRiskRef.current === riskKey) {
      return;
    }

    const lastMemo = loadLastAlertMemo();
    if (lastMemo && lastMemo.dateKey === today && lastMemo.level === risk.level && lastMemo.planId === weeklyPlan.id) {
      return;
    }

    if (risk.level === "high") {
      addToast("🚨 Risco alto detectado. Ative o plano preventivo para manter consistência.", "warning");
    } else {
      addToast("⚠️ Atenção: sinais de queda de aderência. Ajuste seu dia para evitar abandono.", "info");
    }

    trackEvent("retention_risk_alert_shown", {
      level: risk.level,
      score: risk.score,
      route: pathname,
      plan_id: weeklyPlan.id,
    });

    saveLastAlertMemo({
      dateKey: today,
      level: risk.level,
      planId: weeklyPlan.id,
    });

    lastNotifiedRiskRef.current = riskKey;
  }, [addToast, pathname, progressPercent, streak, weeklyPlan]);

  return null;
}
