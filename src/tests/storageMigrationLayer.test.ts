import { describe, expect, it, beforeEach } from "vitest";
import { runStorageMigration } from "../../app/stores/storageMigration";
import { STORAGE_KEYS } from "../../app/stores/storageKeys";

describe("storage migration layer", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("migrates legacy smartmarket keys to nutripilot prefix", () => {
    localStorage.setItem("smartmarket_planner_state", JSON.stringify({ activePlanId: "abc" }));
    localStorage.setItem("smartmarket_shopping_progress", JSON.stringify({ purchasedCount: 3, totalCount: 10 }));
    localStorage.setItem("smartmarket_custom_metric", "42");

    runStorageMigration(localStorage);

    expect(localStorage.getItem("smartmarket_planner_state")).toBeNull();
    expect(localStorage.getItem("smartmarket_shopping_progress")).toBeNull();
    expect(localStorage.getItem("smartmarket_custom_metric")).toBeNull();

    expect(localStorage.getItem("nutripilot_planner_state")).toContain("abc");
    expect(localStorage.getItem("nutripilot_shopping_progress")).toContain("totalCount");
    expect(localStorage.getItem("nutripilot_custom_metric")).toBe("42");
  });

  it("does not overwrite existing nutripilot values", () => {
    localStorage.setItem("smartmarket_planner_state", JSON.stringify({ activePlanId: "legacy-plan" }));
    localStorage.setItem("nutripilot_planner_state", JSON.stringify({ activePlanId: "new-plan" }));

    runStorageMigration(localStorage);

    expect(localStorage.getItem("nutripilot_planner_state")).toContain("new-plan");
    expect(localStorage.getItem("nutripilot_planner_state")).not.toContain("legacy-plan");
  });

  it("marks migration as completed", () => {
    runStorageMigration(localStorage);

    expect(localStorage.getItem(STORAGE_KEYS.migrationFlag)).toBe("true");
  });
});
