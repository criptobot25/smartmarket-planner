import { beforeEach, describe, expect, it } from "vitest";
import { __migrationInternals, migrateLegacyStorageKeys } from "../core/storage/migrateLegacyKeys";

describe("Legacy key migration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("migrates old plan key", () => {
    const payload = { id: "plan-1", calories: 2200 };
    localStorage.setItem("smartmarket_plan", JSON.stringify(payload));

    migrateLegacyStorageKeys();

    expect(localStorage.getItem("smartmarket_plan")).toBeNull();
    expect(localStorage.getItem("nutripilot_plan")).toBe(JSON.stringify(payload));
    expect(Object.keys(localStorage).some((key) => key.startsWith("smartmarket_"))).toBe(false);
  });

  it("does not overwrite new key", () => {
    localStorage.setItem("smartmarket_user", JSON.stringify({ id: "legacy-user" }));
    localStorage.setItem("nutripilot_user", JSON.stringify({ id: "new-user" }));

    migrateLegacyStorageKeys();

    expect(localStorage.getItem("nutripilot_user")).toBe(JSON.stringify({ id: "new-user" }));
    expect(localStorage.getItem("smartmarket_user")).toBeNull();
  });

  it("runs only once", () => {
    localStorage.setItem("smartmarket_plan", JSON.stringify({ id: "first" }));
    migrateLegacyStorageKeys();

    expect(localStorage.getItem(__migrationInternals.MIGRATION_FLAG)).toBe("true");

    localStorage.setItem("smartmarket_history", JSON.stringify([{ id: "second" }]));
    migrateLegacyStorageKeys();

    expect(localStorage.getItem("smartmarket_history")).toBe(JSON.stringify([{ id: "second" }]));
    expect(localStorage.getItem("nutripilot_history")).toBeNull();
  });

  it("preserves user data", () => {
    const user = {
      id: "user-99",
      email: "user@example.com",
      preferences: { mealsPerDay: 4, goal: "bulking" },
      nested: { array: [1, 2, 3], flags: { premium: true } },
    };

    localStorage.setItem("smartmarket_user", JSON.stringify(user));

    migrateLegacyStorageKeys();

    const migrated = JSON.parse(localStorage.getItem("nutripilot_user") || "null");
    expect(migrated).toEqual(user);
  });
});
