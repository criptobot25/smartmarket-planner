"use client";

import { useEffect } from "react";
import type { PostHog } from "posthog-js";

const CONSENT_KEY = "np_analytics_consent";

type AnalyticsConsent = "granted" | "denied" | "unknown";

let initialized = false;
let posthogInstance: PostHog | null = null;

function getPostHogKey(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
}

function getPostHogHost(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";
}

export function getAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === "undefined") {
    return "unknown";
  }

  const stored = window.localStorage.getItem(CONSENT_KEY);
  if (stored === "granted" || stored === "denied") {
    return stored;
  }

  return "unknown";
}

export function setAnalyticsConsent(consent: Exclude<AnalyticsConsent, "unknown">): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CONSENT_KEY, consent);

  if (consent === "granted") {
    void initAnalytics();
    return;
  }

  if (initialized && posthogInstance) {
    posthogInstance.opt_out_capturing();
    posthogInstance.reset();
  }
}

export async function initAnalytics(): Promise<void> {
  if (typeof window === "undefined" || initialized) {
    return;
  }

  if (getAnalyticsConsent() !== "granted") {
    return;
  }

  const key = getPostHogKey();
  if (!key) {
    return;
  }

  const posthogModule = await import("posthog-js");
  const posthog = posthogModule.default;

  posthog.init(key, {
    api_host: getPostHogHost(),
    capture_pageview: true,
    autocapture: false,
    persistence: "localStorage+cookie",
    person_profiles: "identified_only",
  });

  posthogInstance = posthog;
  initialized = true;
}

export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  if (!initialized || !posthogInstance || getAnalyticsConsent() !== "granted") {
    return;
  }

  posthogInstance.capture(event, properties);
}

export function useScrollDepthTracking(pageName: string): void {
  useEffect(() => {
    if (getAnalyticsConsent() !== "granted") {
      return;
    }

    const firedDepths = new Set<number>();
    const thresholds = [25, 50, 75, 100];

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      const maxScrollable = Math.max(1, fullHeight - viewportHeight);
      const depth = Math.min(100, Math.round(((scrollTop + viewportHeight) / fullHeight) * 100));

      thresholds.forEach((threshold) => {
        if (depth >= threshold && !firedDepths.has(threshold)) {
          firedDepths.add(threshold);
          trackEvent("landing_scroll_depth", {
            page: pageName,
            depth_percent: threshold,
            max_scrollable_pixels: maxScrollable,
          });
        }
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [pageName]);
}
