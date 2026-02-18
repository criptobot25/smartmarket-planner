export type FeatureFlagKey =
  | "analytics"
  | "errorMonitoring"
  | "waitlistCapture"
  | "premiumMonetizationV2"
  | "weeklyCoachAdjustmentsPremiumOnly";

const DEFAULT_FLAGS: Record<FeatureFlagKey, boolean> = {
  analytics: true,
  errorMonitoring: true,
  waitlistCapture: true,
  premiumMonetizationV2: true,
  weeklyCoachAdjustmentsPremiumOnly: true,
};

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return undefined;
}

function readEnv(name: string): string | undefined {
  const viteEnv = (import.meta as { env?: Record<string, string | undefined> }).env;
  if (viteEnv && typeof viteEnv[name] === "string") {
    return viteEnv[name];
  }

  if (typeof process !== "undefined" && process.env) {
    return process.env[name] ?? process.env[`NEXT_PUBLIC_${name}`];
  }

  return undefined;
}

const ENV_OVERRIDES: Partial<Record<FeatureFlagKey, boolean>> = {
  analytics: parseBoolean(readEnv("VITE_FLAG_ANALYTICS")),
  errorMonitoring: parseBoolean(readEnv("VITE_FLAG_ERROR_MONITORING")),
  waitlistCapture: parseBoolean(readEnv("VITE_FLAG_WAITLIST_CAPTURE")),
  premiumMonetizationV2: parseBoolean(readEnv("VITE_FLAG_PREMIUM_MONETIZATION_V2")),
  weeklyCoachAdjustmentsPremiumOnly: parseBoolean(readEnv("VITE_FLAG_WEEKLY_COACH_PREMIUM_ONLY")),
};

export function isFeatureEnabled(feature: FeatureFlagKey): boolean {
  return ENV_OVERRIDES[feature] ?? DEFAULT_FLAGS[feature];
}

export function getAllFeatureFlags(): Record<FeatureFlagKey, boolean> {
  return {
    analytics: isFeatureEnabled("analytics"),
    errorMonitoring: isFeatureEnabled("errorMonitoring"),
    waitlistCapture: isFeatureEnabled("waitlistCapture"),
    premiumMonetizationV2: isFeatureEnabled("premiumMonetizationV2"),
    weeklyCoachAdjustmentsPremiumOnly: isFeatureEnabled("weeklyCoachAdjustmentsPremiumOnly"),
  };
}
