"use client";

import { useReportWebVitals } from "next/web-vitals";
import { usePathname } from "next/navigation";
import { trackEvent } from "../lib/analytics";

type TrackedMetricName = "LCP" | "CLS" | "INP";
type MetricRating = "good" | "needs-improvement" | "poor";

type WebVitalMetric = {
  id: string;
  name: string;
  value: number;
  delta: number;
  rating?: MetricRating;
  navigationType?: string;
};

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
};

function isTrackedMetric(name: string): name is TrackedMetricName {
  return name === "LCP" || name === "CLS" || name === "INP";
}

function getRating(name: TrackedMetricName, value: number): MetricRating {
  if (name === "CLS") {
    if (value > 0.25) {
      return "poor";
    }

    if (value > 0.1) {
      return "needs-improvement";
    }

    return "good";
  }

  if (name === "LCP") {
    if (value > 4000) {
      return "poor";
    }

    if (value > 2500) {
      return "needs-improvement";
    }

    return "good";
  }

  if (value > 500) {
    return "poor";
  }

  if (value > 200) {
    return "needs-improvement";
  }

  return "good";
}

function scheduleNonBlocking(task: () => void): void {
  if (typeof window === "undefined") {
    return;
  }

  const idleWindow = window as IdleWindow;

  if (typeof idleWindow.requestIdleCallback === "function") {
    idleWindow.requestIdleCallback(task, { timeout: 1200 });
    return;
  }

  window.setTimeout(task, 0);
}

export function WebVitalsTracker() {
  const pathname = usePathname();

  useReportWebVitals((metric: WebVitalMetric) => {
    if (!isTrackedMetric(metric.name)) {
      return;
    }

    const rating = metric.rating ?? getRating(metric.name, metric.value);

    scheduleNonBlocking(() => {
      trackEvent("web_vital_recorded", {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_delta: metric.delta,
        metric_rating: rating,
        metric_id: metric.id,
        route_path: pathname,
        navigation_type: metric.navigationType ?? "unknown",
      });

      if (rating === "poor") {
        trackEvent("web_vital_poor", {
          metric_name: metric.name,
          metric_value: metric.value,
          metric_id: metric.id,
          route_path: pathname,
        });

        console.warn("[WebVitals] poor_performance_detected", {
          metric: metric.name,
          value: metric.value,
          route: pathname,
        });
      }
    });
  });

  return null;
}
