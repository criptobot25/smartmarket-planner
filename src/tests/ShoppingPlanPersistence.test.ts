import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  LEGACY_PERSISTENCE_KEYS,
  PERSISTENCE_KEYS,
  PERSISTENCE_STATE_VERSION,
  loadPurchasedItemsState,
} from "../contexts/shoppingPlanPersistence";

describe("ShoppingPlan persistence hardening", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.clear();
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("resets corrupted persisted state safely", () => {
    localStorage.setItem(PERSISTENCE_KEYS.purchasedItems, "{not-valid-json");

    const items = loadPurchasedItemsState();

    expect(Array.from(items)).toEqual([]);
    expect(localStorage.getItem(PERSISTENCE_KEYS.purchasedItems)).toBeNull();
  });

  it("migrates legacy purchased items key to versioned envelope", () => {
    localStorage.setItem(LEGACY_PERSISTENCE_KEYS.purchasedItems[0], JSON.stringify(["food-1", "food-2"]));

    const items = loadPurchasedItemsState();
    const storedEnvelopeRaw = localStorage.getItem(PERSISTENCE_KEYS.purchasedItems);

    expect(Array.from(items)).toEqual(["food-1", "food-2"]);
    expect(localStorage.getItem(LEGACY_PERSISTENCE_KEYS.purchasedItems[0])).toBeNull();
    expect(storedEnvelopeRaw).not.toBeNull();

    const storedEnvelope = JSON.parse(storedEnvelopeRaw || "{}");
    expect(storedEnvelope.version).toBe(PERSISTENCE_STATE_VERSION);
    expect(storedEnvelope.data).toEqual(["food-1", "food-2"]);
  });

  it("applies version migration pipeline and sanitizes invalid entries", () => {
    const legacyEnvelope = {
      version: 1,
      updatedAt: new Date().toISOString(),
      data: ["ok", 10, null, "also-ok"],
    };

    localStorage.setItem(PERSISTENCE_KEYS.purchasedItems, JSON.stringify(legacyEnvelope));

    const items = loadPurchasedItemsState();
    const upgradedEnvelope = JSON.parse(localStorage.getItem(PERSISTENCE_KEYS.purchasedItems) || "{}");

    expect(Array.from(items)).toEqual(["ok", "also-ok"]);
    expect(upgradedEnvelope.version).toBe(PERSISTENCE_STATE_VERSION);
    expect(upgradedEnvelope.data).toEqual(["ok", "also-ok"]);
  });

  it("auto-resets invalid envelope payloads", () => {
    const invalidEnvelope = {
      version: PERSISTENCE_STATE_VERSION,
      updatedAt: new Date().toISOString(),
      data: "invalid-shape",
    };

    localStorage.setItem(PERSISTENCE_KEYS.purchasedItems, JSON.stringify(invalidEnvelope));

    const items = loadPurchasedItemsState();

    expect(Array.from(items)).toEqual([]);
    expect(localStorage.getItem(PERSISTENCE_KEYS.purchasedItems)).toBeNull();
  });
});
