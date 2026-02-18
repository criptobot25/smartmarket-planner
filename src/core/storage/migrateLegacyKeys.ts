const LEGACY_KEY_MAP = {
  smartmarket_plan: "nutripilot_plan",
  smartmarket_history: "nutripilot_history",
  smartmarket_premium: "nutripilot_premium",
  smartmarket_user: "nutripilot_user",
} as const;

const MIGRATION_FLAG = "nutripilot_migration_done_v1";

function migrateSingleKey(legacyKey: string, newKey: string): void {
  const legacyValue = localStorage.getItem(legacyKey);
  if (legacyValue === null) return;

  const hasNewValue = localStorage.getItem(newKey) !== null;
  if (!hasNewValue) {
    localStorage.setItem(newKey, legacyValue);
  }

  localStorage.removeItem(legacyKey);
}

export function migrateLegacyStorageKeys(): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return;
  }

  if (localStorage.getItem(MIGRATION_FLAG)) {
    return;
  }

  const keys = Object.keys(localStorage);
  const hasLegacyKeys = keys.some((key) => key.startsWith("smartmarket_"));

  if (import.meta.env.DEV && hasLegacyKeys) {
    console.warn("Legacy SmartMarket keys detected → migrating to NutriPilot");
  }

  for (const [legacyKey, newKey] of Object.entries(LEGACY_KEY_MAP)) {
    migrateSingleKey(legacyKey, newKey);
  }

  for (const legacyKey of keys) {
    if (!legacyKey.startsWith("smartmarket_")) {
      continue;
    }

    const newKey = legacyKey.replace("smartmarket_", "nutripilot_");
    migrateSingleKey(legacyKey, newKey);
  }

  localStorage.setItem(MIGRATION_FLAG, "true");
}

export const __migrationInternals = {
  LEGACY_KEY_MAP,
  MIGRATION_FLAG,
};
