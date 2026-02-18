import posthog from "posthog-js";
import { isFeatureEnabled } from "../config/featureFlags";

let analyticsInitialized = false;

export function initializeAnalytics(): void {
  if (!isFeatureEnabled("analytics") || analyticsInitialized) {
    return;
  }

  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  if (!apiKey) {
    console.info("[Analytics] PostHog key missing. Analytics disabled.");
    return;
  }

  posthog.init(apiKey, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false,
    autocapture: true,
    persistence: "localStorage+cookie",
  });

  analyticsInitialized = true;
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (!analyticsInitialized) return;
  posthog.capture(eventName, properties);
}

export function trackPageView(path: string): void {
  if (!analyticsInitialized) return;
  posthog.capture("$pageview", { $current_url: window.location.origin + path, path });
}

export function identifyAnalyticsUser(userId: string, traits?: Record<string, unknown>): void {
  if (!analyticsInitialized) return;
  posthog.identify(userId, traits);
}
