export const STORAGE_KEYS = {
  migrationFlag: "nutripilot_migration_done_v2",
  plannerState: "nutripilot_planner_state",
  shoppingProgress: "nutripilot_shopping_progress",
} as const;

export const LEGACY_STORAGE_KEYS = {
  plannerState: "smartmarket_planner_state",
  shoppingProgress: "smartmarket_shopping_progress",
} as const;
