"use client";

import { useEffect } from "react";
import type { PostHog } from "posthog-js";

const CONSENT_KEY = "np_analytics_consent";

type AnalyticsConsent = "granted" | "denied" | "unknown";

type AnalyticsEventProperties = Record<string, unknown>;

type GoogleConsentState = "granted" | "denied";

type GtagCommand =
  | ["js", Date]
  | ["config", string, Record<string, unknown>?]
  | ["event", string, Record<string, unknown>?]
  | ["consent", "default" | "update", {
    ad_storage: GoogleConsentState;
    analytics_storage: GoogleConsentState;
    ad_user_data: GoogleConsentState;
    ad_personalization: GoogleConsentState;
    wait_for_update?: number;
  }];

type GtagFunction = (...args: GtagCommand) => void;

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: GtagFunction;
};

let initialized = false;
let posthogInstance: PostHog | null = null;
let gaInitialized = false;

const GA4_EVENT_ALLOWLIST = new Set<string>([
  "page_view",
  "onboarding_completed",
  "plan_generated",
  "affiliate_click",
]);

const POSTHOG_SUPPRESSED_EVENTS = new Set<string>(GA4_EVENT_ALLOWLIST);

function getGaMeasurementId(): string {
  return process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "";
}

function scheduleNonBlocking(task: () => void): void {
  if (typeof window === "undefined") {
    return;
  }

  window.setTimeout(task, 0);
}

function ensureGtag(): GtagFunction | null {
  if (typeof window === "undefined") {
    return null;
  }

  const analyticsWindow = window as AnalyticsWindow;

  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];

  if (!analyticsWindow.gtag) {
    analyticsWindow.gtag = (...args: GtagCommand) => {
      analyticsWindow.dataLayer?.push(args);
    };
  }

  return analyticsWindow.gtag;
}

function updateGoogleConsentMode(consent: Exclude<AnalyticsConsent, "unknown">): void {
  const gtag = ensureGtag();
  if (!gtag) {
    return;
  }

  const state: GoogleConsentState = consent === "granted" ? "granted" : "denied";

  gtag("consent", "update", {
    ad_storage: state,
    analytics_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  });
}

async function initGa4(): Promise<void> {
  if (typeof window === "undefined" || gaInitialized) {
    return;
  }

  if (getAnalyticsConsent() !== "granted") {
    return;
  }

  const measurementId = getGaMeasurementId();
  if (!measurementId) {
    return;
  }

  const gtag = ensureGtag();
  if (!gtag) {
    return;
  }

  gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });

  const existingScript = document.querySelector<HTMLScriptElement>(`script[data-ga4="${measurementId}"]`);

  if (!existingScript) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      script.dataset.ga4 = measurementId;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load GA4 gtag.js"));
      document.head.appendChild(script);
    });
  }

  gtag("js", new Date());
  gtag("config", measurementId, {
    send_page_view: false,
    anonymize_ip: true,
  });

  updateGoogleConsentMode("granted");
  gaInitialized = true;
}

function trackGa4Event(event: string, properties?: AnalyticsEventProperties): void {
  if (getAnalyticsConsent() !== "granted") {
    return;
  }

  const gtag = ensureGtag();
  const measurementId = getGaMeasurementId();

  if (!gtag || !measurementId || !gaInitialized) {
    return;
  }

  gtag("event", event, properties);
}

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
    void initGa4();
    updateGoogleConsentMode("granted");
    return;
  }

  updateGoogleConsentMode("denied");

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
    capture_pageview: false,
    autocapture: false,
    persistence: "localStorage+cookie",
    person_profiles: "identified_only",
  });

  posthogInstance = posthog;
  initialized = true;

  await initGa4();
}

export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  if (getAnalyticsConsent() !== "granted") {
    return;
  }

  scheduleNonBlocking(() => {
    if (GA4_EVENT_ALLOWLIST.has(event)) {
      trackGa4Event(event, properties);
    }

    if (initialized && posthogInstance && !POSTHOG_SUPPRESSED_EVENTS.has(event)) {
      posthogInstance.capture(event, properties);
    }
  });
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
