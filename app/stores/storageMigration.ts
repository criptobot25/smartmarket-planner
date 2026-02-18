import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "./storageKeys";

const LEGACY_PREFIX = "smartmarket_";
const NEXT_PREFIX = "nutripilot_";

function migrateSingleKey(storage: Storage, legacyKey: string, nextKey: string): void {
  const legacyValue = storage.getItem(legacyKey);
  if (legacyValue === null) {
    return;
  }

  const hasNextValue = storage.getItem(nextKey) !== null;
  if (!hasNextValue) {
    storage.setItem(nextKey, legacyValue);
  }

  storage.removeItem(legacyKey);
}

export function runStorageMigration(storage?: Storage): void {
  if (typeof window === "undefined") {
    return;
  }

  const activeStorage = storage ?? window.localStorage;

  if (activeStorage.getItem(STORAGE_KEYS.migrationFlag)) {
    return;
  }

  migrateSingleKey(activeStorage, LEGACY_STORAGE_KEYS.plannerState, STORAGE_KEYS.plannerState);
  migrateSingleKey(activeStorage, LEGACY_STORAGE_KEYS.shoppingProgress, STORAGE_KEYS.shoppingProgress);

  const allKeys = Object.keys(activeStorage);
  allKeys.forEach((key) => {
    if (!key.startsWith(LEGACY_PREFIX)) {
      return;
    }

    const nextKey = key.replace(LEGACY_PREFIX, NEXT_PREFIX);
    migrateSingleKey(activeStorage, key, nextKey);
  });

  activeStorage.setItem(STORAGE_KEYS.migrationFlag, "true");
}

export const __storageMigrationInternals = {
  LEGACY_PREFIX,
  NEXT_PREFIX,
};
