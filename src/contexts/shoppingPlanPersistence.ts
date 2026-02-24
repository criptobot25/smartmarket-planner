import { z } from "zod";
import { PlanInput } from "../core/models/PlanInput";
import { WeeklyPlan } from "../core/models/WeeklyPlan";

export const PERSISTENCE_STATE_VERSION = 2;

export const PERSISTENCE_KEYS = {
  purchasedItems: "nutripilot_purchased_items",
  lastWeeklyPlan: "lastWeeklyPlan",
  adherenceScore: "lastAdherenceScore",
  adherenceSmoothing: "adherenceSmoothingState",
  streakData: "nutripilot_streak",
} as const;

export const LEGACY_PERSISTENCE_KEYS = {
  purchasedItems: ["smartmarket_purchased_items"],
  streakData: ["smartmarket_streak"],
} as const;

type PersistenceKey = (typeof PERSISTENCE_KEYS)[keyof typeof PERSISTENCE_KEYS];

type PersistedEnvelope<T> = {
  version: number;
  updatedAt: string;
  data: T;
};

const envelopeSchema = z.object({
  version: z.number().int().nonnegative(),
  updatedAt: z.string(),
  data: z.unknown(),
});

const purchasedItemsSchema = z.array(z.string());

const lastWeeklyPlanSchema = z.object({
  plan: z.object({ id: z.string() }).passthrough(),
  input: z.object({}).passthrough(),
});

const adherenceScoreSchema = z.object({
  score: z.number().min(0).max(100),
  timestamp: z.string(),
  level: z.enum(["high", "good", "low"]),
});

const adherenceSmoothingSchema = z.object({
  smoothedScore: z.number(),
  lowStreak: z.number().int().min(0),
  highStreak: z.number().int().min(0),
  timestamp: z.string(),
});

const streakDataSchema = z.object({
  currentStreak: z.number().int().min(0),
  lastGenerationDate: z.string(),
  longestStreak: z.number().int().min(0),
  totalGenerations: z.number().int().min(0),
});

type MigrationStep = (value: unknown) => unknown;
type MigrationRegistry = Partial<Record<PersistenceKey, Partial<Record<number, MigrationStep>>>>;

const migrations: MigrationRegistry = {
  [PERSISTENCE_KEYS.purchasedItems]: {
    1: (value) => {
      if (!Array.isArray(value)) return [];
      return value.filter((entry): entry is string => typeof entry === "string");
    },
  },
};

function isBrowserStorageAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function nowIsoString(): string {
  return new Date().toISOString();
}

export function logStateRecoveryEvent(event: string, details: Record<string, unknown> = {}): void {
  console.warn("[ShoppingPlanPersistence]", event, details);
}

function writeEnvelope<T>(key: PersistenceKey, data: T): void {
  if (!isBrowserStorageAvailable()) return;

  const envelope: PersistedEnvelope<T> = {
    version: PERSISTENCE_STATE_VERSION,
    updatedAt: nowIsoString(),
    data,
  };

  window.localStorage.setItem(key, JSON.stringify(envelope));
}

function clearStorageKeys(primaryKey: PersistenceKey, legacyKeys: readonly string[] = []): void {
  if (!isBrowserStorageAvailable()) return;

  window.localStorage.removeItem(primaryKey);
  legacyKeys.forEach((legacyKey) => window.localStorage.removeItem(legacyKey));
}

function migrateEnvelopeValue(key: PersistenceKey, version: number, data: unknown): unknown {
  if (version >= PERSISTENCE_STATE_VERSION) {
    return data;
  }

  let migrated = data;
  let currentVersion = version;

  while (currentVersion < PERSISTENCE_STATE_VERSION) {
    const migration = migrations[key]?.[currentVersion];
    if (migration) {
      migrated = migration(migrated);
      logStateRecoveryEvent("migrated_persisted_state", {
        key,
        fromVersion: currentVersion,
        toVersion: currentVersion + 1,
      });
    }
    currentVersion += 1;
  }

  return migrated;
}

type ReadOptions<T> = {
  key: PersistenceKey;
  schema: z.ZodTypeAny;
  fallback: T;
  legacyKeys?: readonly string[];
  parseLegacyRaw?: (raw: unknown) => T | null;
};

function readState<T>({ key, schema, fallback, legacyKeys = [], parseLegacyRaw }: ReadOptions<T>): T {
  if (!isBrowserStorageAvailable()) {
    return fallback;
  }

  const candidateKeys = [key, ...legacyKeys];

  for (const candidateKey of candidateKeys) {
    const raw = window.localStorage.getItem(candidateKey);
    if (!raw) {
      continue;
    }

    try {
      const parsedJson = JSON.parse(raw);
      const parsedEnvelope = envelopeSchema.safeParse(parsedJson);

      if (parsedEnvelope.success) {
        const { version, data } = parsedEnvelope.data;
        const migratedData = migrateEnvelopeValue(key, version, data);
        const validated = schema.safeParse(migratedData);

        if (!validated.success) {
          logStateRecoveryEvent("reset_invalid_envelope_data", {
            key,
            candidateKey,
            issues: validated.error.issues.map((issue) => issue.message),
          });
          clearStorageKeys(key, legacyKeys);
          return fallback;
        }

        if (candidateKey !== key || version !== PERSISTENCE_STATE_VERSION) {
          writeEnvelope(key, validated.data);
          if (candidateKey !== key) {
            window.localStorage.removeItem(candidateKey);
          }
        }

        return validated.data as T;
      }

      if (parseLegacyRaw) {
        const migratedLegacy = parseLegacyRaw(parsedJson);
        if (migratedLegacy !== null) {
          writeEnvelope(key, migratedLegacy);
          if (candidateKey !== key) {
            window.localStorage.removeItem(candidateKey);
          }
          logStateRecoveryEvent("migrated_legacy_state", { key, candidateKey });
          return migratedLegacy;
        }
      }

      logStateRecoveryEvent("reset_unrecognized_persisted_shape", { key, candidateKey });
      clearStorageKeys(key, legacyKeys);
      return fallback;
    } catch (error) {
      logStateRecoveryEvent("reset_corrupted_json", {
        key,
        candidateKey,
        error: error instanceof Error ? error.message : String(error),
      });
      clearStorageKeys(key, legacyKeys);
      return fallback;
    }
  }

  return fallback;
}

export function savePurchasedItemsState(itemIds: string[]): void {
  const normalized = Array.from(new Set(itemIds));
  if (isBrowserStorageAvailable()) {
    LEGACY_PERSISTENCE_KEYS.purchasedItems.forEach((legacyKey) => window.localStorage.removeItem(legacyKey));
  }
  writeEnvelope(PERSISTENCE_KEYS.purchasedItems, normalized);
}

export function loadPurchasedItemsState(): Set<string> {
  const items = readState<string[]>({
    key: PERSISTENCE_KEYS.purchasedItems,
    legacyKeys: LEGACY_PERSISTENCE_KEYS.purchasedItems,
    schema: purchasedItemsSchema,
    fallback: [],
    parseLegacyRaw: (raw) => (Array.isArray(raw) ? raw.filter((item): item is string => typeof item === "string") : null),
  });

  return new Set(items);
}

export function clearPurchasedItemsState(): void {
  clearStorageKeys(PERSISTENCE_KEYS.purchasedItems, LEGACY_PERSISTENCE_KEYS.purchasedItems);
}

export function saveLastWeeklyPlanState(plan: WeeklyPlan, input: PlanInput): void {
  writeEnvelope(PERSISTENCE_KEYS.lastWeeklyPlan, { plan, input });
}

export function loadLastWeeklyPlanState(): { plan: WeeklyPlan; input: PlanInput } | null {
  return readState<{ plan: WeeklyPlan; input: PlanInput } | null>({
    key: PERSISTENCE_KEYS.lastWeeklyPlan,
    schema: lastWeeklyPlanSchema.nullable(),
    fallback: null,
    parseLegacyRaw: (raw) => {
      const parsed = lastWeeklyPlanSchema.safeParse(raw);
      return parsed.success ? (parsed.data as unknown as { plan: WeeklyPlan; input: PlanInput }) : null;
    },
  });
}

export function saveAdherenceScoreState(score: { score: number; timestamp: string; level: "high" | "good" | "low" }): void {
  writeEnvelope(PERSISTENCE_KEYS.adherenceScore, score);
}

export function loadAdherenceScoreState(): { score: number; timestamp: string; level: "high" | "good" | "low" } | null {
  return readState<{ score: number; timestamp: string; level: "high" | "good" | "low" } | null>({
    key: PERSISTENCE_KEYS.adherenceScore,
    schema: adherenceScoreSchema.nullable(),
    fallback: null,
    parseLegacyRaw: (raw) => {
      const parsed = adherenceScoreSchema.safeParse(raw);
      return parsed.success ? parsed.data : null;
    },
  });
}

export function saveAdherenceSmoothingState(data: { smoothedScore: number; lowStreak: number; highStreak: number; timestamp: string }): void {
  writeEnvelope(PERSISTENCE_KEYS.adherenceSmoothing, data);
}

export function loadAdherenceSmoothingState(): { smoothedScore: number; lowStreak: number; highStreak: number; timestamp: string } | null {
  return readState<{ smoothedScore: number; lowStreak: number; highStreak: number; timestamp: string } | null>({
    key: PERSISTENCE_KEYS.adherenceSmoothing,
    schema: adherenceSmoothingSchema.nullable(),
    fallback: null,
    parseLegacyRaw: (raw) => {
      const parsed = adherenceSmoothingSchema.safeParse(raw);
      return parsed.success ? parsed.data : null;
    },
  });
}

export function saveStreakDataState(data: { currentStreak: number; lastGenerationDate: string; longestStreak: number; totalGenerations: number }): void {
  writeEnvelope(PERSISTENCE_KEYS.streakData, data);
  if (isBrowserStorageAvailable()) {
    LEGACY_PERSISTENCE_KEYS.streakData.forEach((legacyKey) => window.localStorage.removeItem(legacyKey));
  }
}

export function loadStreakDataState(): { currentStreak: number; lastGenerationDate: string; longestStreak: number; totalGenerations: number } {
  return readState({
    key: PERSISTENCE_KEYS.streakData,
    legacyKeys: LEGACY_PERSISTENCE_KEYS.streakData,
    schema: streakDataSchema,
    fallback: {
      currentStreak: 0,
      lastGenerationDate: "",
      longestStreak: 0,
      totalGenerations: 0,
    },
    parseLegacyRaw: (raw) => {
      const parsed = streakDataSchema.safeParse(raw);
      return parsed.success ? parsed.data : null;
    },
  });
}
