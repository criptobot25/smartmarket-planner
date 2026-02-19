import { describe, expect, it } from "vitest";
import {
  PREP_UNLOCK_PROGRESS_PERCENT,
  computeShoppingProgress,
  getPrepFlowStatus,
} from "../core/logic/PrepFlowController";

describe("PrepFlowController", () => {
  it("computes shopping progress percentage safely", () => {
    expect(computeShoppingProgress(8, 10)).toBe(80);
    expect(computeShoppingProgress(0, 0)).toBe(0);
  });

  it("unlocks prep when grocery mission reaches threshold", () => {
    const locked = getPrepFlowStatus(79);
    const unlocked = getPrepFlowStatus(80);

    expect(locked.unlockThreshold).toBe(PREP_UNLOCK_PROGRESS_PERCENT);
    expect(locked.unlocked).toBe(false);
    expect(locked.remainingPercent).toBe(1);

    expect(unlocked.unlocked).toBe(true);
    expect(unlocked.remainingPercent).toBe(0);
  });
});
