import * as Sentry from "@sentry/react";
import { isFeatureEnabled } from "../config/featureFlags";

let sentryInitialized = false;

export function initializeErrorMonitoring(): void {
  if (!isFeatureEnabled("errorMonitoring") || sentryInitialized) {
    return;
  }

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    console.info("[Monitoring] Sentry DSN missing. Error monitoring disabled.");
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || "smartmarket-beta",
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0.1),
  });

  sentryInitialized = true;
}

export function captureAppError(error: unknown, context?: Record<string, unknown>): void {
  if (!sentryInitialized) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
