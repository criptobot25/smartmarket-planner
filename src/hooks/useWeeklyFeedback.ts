import { useCallback, useMemo, useState } from "react";
import { WeeklyPlan } from "../core/models/WeeklyPlan";
import { getStorageProvider } from "../core/storage/StorageProvider";

const USER_HISTORY_KEY = "nutripilot_user_history";
const LEGACY_USER_HISTORY_KEY = "smartmarket_user_history";
const MAX_HISTORY_ENTRIES = 24;
const STORAGE_USER_ID = "local-user";
const CLOUD_HISTORY_ID = "weeklyFitnessLoopHistory";

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export type WeeklyFeedbackResponse = "yes" | "partially" | "no";

export interface WeeklyFeedbackEntry {
  id: string;
  planId: string;
  response: WeeklyFeedbackResponse;
  adherenceScore: number;
  adherenceLevel: "high" | "good" | "low";
  repeatedTooMuch: boolean;
  createdAt: string;
}

export interface WeeklyFeedbackAdherence {
  score: number;
  timestamp: string;
  level: "high" | "good" | "low";
}

function mapResponseToAdherence(response: WeeklyFeedbackResponse): WeeklyFeedbackAdherence {
  if (response === "yes") {
    return { score: 95, timestamp: new Date().toISOString(), level: "high" };
  }

  if (response === "partially") {
    return { score: 75, timestamp: new Date().toISOString(), level: "good" };
  }

  return { score: 50, timestamp: new Date().toISOString(), level: "low" };
}

export function loadWeeklyFeedbackHistory(): WeeklyFeedbackEntry[] {
  if (!canUseBrowserStorage()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(USER_HISTORY_KEY) ?? localStorage.getItem(LEGACY_USER_HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((entry: WeeklyFeedbackEntry) =>
      entry &&
      typeof entry.planId === "string" &&
      (entry.response === "yes" || entry.response === "partially" || entry.response === "no")
    );
  } catch (error) {
    console.error("❌ Failed to load weekly feedback history:", error);
    return [];
  }
}

export function getLatestWeeklyFeedback(): WeeklyFeedbackEntry | null {
  const history = loadWeeklyFeedbackHistory();
  return history.length > 0 ? history[0] : null;
}

function saveWeeklyFeedbackHistory(history: WeeklyFeedbackEntry[]): void {
  if (!canUseBrowserStorage()) {
    return;
  }

  try {
    localStorage.setItem(USER_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY_ENTRIES)));
    localStorage.removeItem(LEGACY_USER_HISTORY_KEY);
  } catch (error) {
    console.error("❌ Failed to save weekly feedback history:", error);
  }
}

async function syncWeeklyFeedbackToCloud(history: WeeklyFeedbackEntry[]): Promise<void> {
  try {
    const storage = getStorageProvider();
    await storage.save(
      {
        userId: STORAGE_USER_ID,
        dataType: "preferences",
        id: CLOUD_HISTORY_ID,
      },
      history
    );
    await storage.syncToCloud(STORAGE_USER_ID);
  } catch (error) {
    // Best effort sync only - local persistence remains source of truth
    console.warn("⚠️ Weekly feedback cloud sync unavailable, using local history only", error);
  }
}

export function detectRepetitionRisk(plans: WeeklyPlan[]): boolean {
  if (plans.length < 2) return false;

  const [latest, previous] = plans;

  if (latest.planHash && previous.planHash && latest.planHash === previous.planHash) {
    return true;
  }

  const latestFoods = new Set((latest.shoppingList || []).map(item => item.name.toLowerCase()));
  const previousFoods = new Set((previous.shoppingList || []).map(item => item.name.toLowerCase()));

  if (latestFoods.size === 0 || previousFoods.size === 0) {
    return false;
  }

  let overlap = 0;
  latestFoods.forEach(food => {
    if (previousFoods.has(food)) overlap += 1;
  });

  const overlapRatio = overlap / Math.min(latestFoods.size, previousFoods.size);
  return overlapRatio >= 0.65;
}

export function getMostRepeatedFoods(plans: WeeklyPlan[], limit = 2): string[] {
  const frequency = new Map<string, number>();

  plans.slice(0, 3).forEach(plan => {
    (plan.shoppingList || []).forEach(item => {
      const name = item.name;
      if (!name) return;
      frequency.set(name, (frequency.get(name) || 0) + 1);
    });
  });

  return [...frequency.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
}

export function useWeeklyFeedback() {
  const [history, setHistory] = useState<WeeklyFeedbackEntry[]>(() => loadWeeklyFeedbackHistory());

  const latestFeedback = useMemo(() => (history.length > 0 ? history[0] : null), [history]);

  const hasFeedbackForPlan = useCallback((planId: string): boolean => {
    return history.some(entry => entry.planId === planId);
  }, [history]);

  const submitWeeklyFeedback = useCallback(async (
    planId: string,
    response: WeeklyFeedbackResponse,
    repeatedTooMuch: boolean
  ): Promise<{ entry: WeeklyFeedbackEntry; adherence: WeeklyFeedbackAdherence }> => {
    const adherence = mapResponseToAdherence(response);

    const entry: WeeklyFeedbackEntry = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      planId,
      response,
      adherenceScore: adherence.score,
      adherenceLevel: adherence.level,
      repeatedTooMuch,
      createdAt: adherence.timestamp,
    };

    const currentHistory = loadWeeklyFeedbackHistory();
    const withoutCurrentPlan = currentHistory.filter(item => item.planId !== planId);
    const updatedHistory = [entry, ...withoutCurrentPlan].slice(0, MAX_HISTORY_ENTRIES);

    saveWeeklyFeedbackHistory(updatedHistory);
    setHistory(updatedHistory);
    await syncWeeklyFeedbackToCloud(updatedHistory);

    return { entry, adherence };
  }, []);

  return {
    history,
    latestFeedback,
    hasFeedbackForPlan,
    submitWeeklyFeedback,
  };
}
