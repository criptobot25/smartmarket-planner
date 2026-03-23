import type { DropoffRiskLevel } from "../logic/predictDropoffRisk";

const SNAPSHOTS_KEY = "nutripilot_retention_risk_snapshots";
const ACTIONS_KEY = "nutripilot_retention_preventive_actions";
const MAX_SNAPSHOTS = 120;
const MAX_ACTIONS = 120;

export interface RetentionRiskSnapshot {
  id: string;
  timestamp: string;
  dateKey: string;
  planId?: string;
  level: DropoffRiskLevel;
  score: number;
  reasons: string[];
  shoppingProgress: number;
  streakWeeks: number;
  confidenceScore?: number;
  adherenceScore?: number;
}

export interface PreventiveActionLog {
  id: string;
  timestamp: string;
  dateKey: string;
  planId?: string;
  levelAtAction: DropoffRiskLevel;
  scoreAtAction: number;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // no-op
  }
}

export function loadRetentionRiskSnapshots(): RetentionRiskSnapshot[] {
  const parsed = readJson<RetentionRiskSnapshot[]>(SNAPSHOTS_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function loadPreventiveActionLogs(): PreventiveActionLog[] {
  const parsed = readJson<PreventiveActionLog[]>(ACTIONS_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function recordRetentionRiskSnapshot(
  input: Omit<RetentionRiskSnapshot, "id" | "timestamp" | "dateKey">,
): void {
  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10);

  const nextSnapshot: RetentionRiskSnapshot = {
    ...input,
    id: `risk-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: now.toISOString(),
    dateKey,
  };

  const current = loadRetentionRiskSnapshots();

  const dedupeIndex = current.findIndex((entry) => {
    return entry.dateKey === dateKey && (entry.planId ?? "") === (input.planId ?? "");
  });

  if (dedupeIndex >= 0) {
    current[dedupeIndex] = nextSnapshot;
    writeJson(SNAPSHOTS_KEY, current.slice(-MAX_SNAPSHOTS));
    return;
  }

  const updated = [...current, nextSnapshot].slice(-MAX_SNAPSHOTS);
  writeJson(SNAPSHOTS_KEY, updated);
}

export function recordPreventiveAction(
  input: Omit<PreventiveActionLog, "id" | "timestamp" | "dateKey">,
): void {
  const now = new Date();
  const nextAction: PreventiveActionLog = {
    ...input,
    id: `preventive-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: now.toISOString(),
    dateKey: now.toISOString().slice(0, 10),
  };

  const current = loadPreventiveActionLogs();
  writeJson(ACTIONS_KEY, [...current, nextAction].slice(-MAX_ACTIONS));
}
