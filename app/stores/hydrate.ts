import { STORAGE_KEYS } from "./storageKeys";

const LEGACY_PROGRESS_KEY = "nutripilot_progress";

export function hydrateProgress(set: (value: number) => void) {
  if (typeof window === "undefined") {
    return;
  }

  const saved =
    window.localStorage.getItem(LEGACY_PROGRESS_KEY)
    ?? window.localStorage.getItem(STORAGE_KEYS.shoppingProgress);

  if (!saved) {
    return;
  }

  const parsed = Number(saved);

  if (Number.isFinite(parsed)) {
    set(parsed);
  }
}
