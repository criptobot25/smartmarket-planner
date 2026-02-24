"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getAnalyticsConsent, initAnalytics, setAnalyticsConsent, trackEvent } from "../lib/analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<"granted" | "denied" | "unknown">("unknown");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrlRef = useRef<string>("");

  useEffect(() => {
    const currentConsent = getAnalyticsConsent();
    setConsent(currentConsent);

    if (currentConsent === "granted") {
      initAnalytics();
    }
  }, []);

  useEffect(() => {
    if (consent !== "granted") {
      return;
    }

    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    if (lastTrackedUrlRef.current === pagePath) {
      return;
    }

    lastTrackedUrlRef.current = pagePath;

    trackEvent("page_view", {
      page_path: pathname,
      page_location: pagePath,
      page_title: document.title,
    });
  }, [consent, pathname, searchParams]);

  const analyticsEnabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

  return (
    <>
      {children}

      {analyticsEnabled && consent === "unknown" ? (
        <aside
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          style={{
            position: "fixed",
            left: "1rem",
            right: "1rem",
            bottom: "1rem",
            zIndex: 60,
            borderRadius: "12px",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            padding: "0.9rem",
            boxShadow: "0 12px 25px rgba(0,0,0,0.25)",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text)" }}>
            We use privacy-friendly analytics to improve onboarding and usability. You can change this later.
          </p>
          <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="np-btn np-btn-primary"
              onClick={() => {
                setAnalyticsConsent("granted");
                setConsent("granted");
              }}
            >
              Accept analytics
            </button>
            <button
              type="button"
              className="np-btn np-btn-secondary"
              onClick={() => {
                setAnalyticsConsent("denied");
                setConsent("denied");
              }}
            >
              Reject
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
