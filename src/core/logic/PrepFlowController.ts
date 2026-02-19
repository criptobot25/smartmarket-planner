export const PREP_UNLOCK_PROGRESS_PERCENT = 80;

export interface PrepFlowStatus {
  progressPercent: number;
  unlockThreshold: number;
  unlocked: boolean;
  remainingPercent: number;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (value < 0) {
    return 0;
  }

  if (value > 100) {
    return 100;
  }

  return Math.round(value);
}

export function computeShoppingProgress(purchasedCount: number, totalCount: number): number {
  if (totalCount <= 0) {
    return 0;
  }

  return clampPercent((purchasedCount / totalCount) * 100);
}

export function getPrepFlowStatus(
  progressPercent: number,
  unlockThreshold = PREP_UNLOCK_PROGRESS_PERCENT
): PrepFlowStatus {
  const normalizedProgress = clampPercent(progressPercent);
  const normalizedThreshold = clampPercent(unlockThreshold);
  const unlocked = normalizedProgress >= normalizedThreshold;

  return {
    progressPercent: normalizedProgress,
    unlockThreshold: normalizedThreshold,
    unlocked,
    remainingPercent: unlocked ? 0 : normalizedThreshold - normalizedProgress
  };
}
