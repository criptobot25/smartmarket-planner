import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShoppingPlanProvider, useShoppingPlan } from "../contexts/ShoppingPlanContext";
import { PERSISTENCE_KEYS, PERSISTENCE_STATE_VERSION } from "../contexts/shoppingPlanPersistence";

function StreakProbe({ onStreakChange }: { onStreakChange: (value: number) => void }) {
  const { streak } = useShoppingPlan();

  useEffect(() => {
    onStreakChange(streak);
  }, [onStreakChange, streak]);

  return null;
}

describe("ShoppingPlanContext cross-tab synchronization", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.clear();
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("syncs streak updates from storage events", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    let root: Root | null = null;
    const observedStreaks: number[] = [];

    await act(async () => {
      root = createRoot(container);
      root.render(
        <ShoppingPlanProvider>
          <StreakProbe onStreakChange={(value) => observedStreaks.push(value)} />
        </ShoppingPlanProvider>,
      );
    });

    const incomingStreakEnvelope = {
      version: PERSISTENCE_STATE_VERSION,
      updatedAt: new Date().toISOString(),
      data: {
        currentStreak: 7,
        lastGenerationDate: "2026-02-24",
        longestStreak: 7,
        totalGenerations: 10,
      },
    };

    localStorage.setItem(PERSISTENCE_KEYS.streakData, JSON.stringify(incomingStreakEnvelope));

    await act(async () => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: PERSISTENCE_KEYS.streakData,
          newValue: JSON.stringify(incomingStreakEnvelope),
          storageArea: localStorage,
        }),
      );
    });

    expect(observedStreaks[observedStreaks.length - 1]).toBe(7);

    await act(async () => {
      root?.unmount();
    });

    document.body.removeChild(container);
  });
});
