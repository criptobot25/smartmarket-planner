import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { isFeatureEnabled } from "../../core/config/featureFlags";
import { trackEvent } from "../../core/monitoring/analytics";
import "./WaitlistEmailCapture.css";

interface WaitlistEmailCaptureProps {
  source: "landing" | "pricing";
  title?: string;
  subtitle?: string;
}

const STORAGE_KEY = "nutripilot_waitlist_emails";
const LEGACY_STORAGE_KEY = "smartmarket_waitlist_emails";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function WaitlistEmailCapture({ source, title, subtitle }: WaitlistEmailCaptureProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!isFeatureEnabled("waitlistCapture")) {
    return null;
  }

  const submitToLocalQueue = (value: string) => {
    const currentRaw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    let current: Array<{ email: string; source: string; createdAt: string }> = [];

    if (currentRaw) {
      try {
        current = JSON.parse(currentRaw) as Array<{ email: string; source: string; createdAt: string }>;
      } catch {
        current = [];
      }
    }

    const exists = current.some((entry) => entry.email.toLowerCase() === value.toLowerCase());

    if (!exists) {
      current.push({ email: value, source, createdAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  };

  const submitToWebhook = async (value: string) => {
    const webhookUrl = import.meta.env.VITE_WAITLIST_WEBHOOK_URL;
    if (!webhookUrl) return;

    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: value,
        source,
        createdAt: new Date().toISOString(),
      }),
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const sanitizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(sanitizedEmail)) {
      setStatus("error");
      setMessage(t("waitlist.validationEmail"));
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      submitToLocalQueue(sanitizedEmail);
      await submitToWebhook(sanitizedEmail);

      trackEvent("waitlist_email_captured", { source });
      setStatus("success");
      setMessage(t("waitlist.success"));
      setEmail("");
    } catch (error) {
      console.error("Waitlist capture failed:", error);
      trackEvent("waitlist_email_capture_failed", { source });
      setStatus("error");
      setMessage(t("waitlist.error"));
    }
  };

  return (
    <section className="waitlist-capture">
      <div className="waitlist-content">
        <h3>{title || t("waitlist.title")}</h3>
        <p>{subtitle || t("waitlist.subtitle")}</p>

        <form className="waitlist-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder={t("waitlist.placeholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-label={t("waitlist.ariaEmail")}
          />
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? t("waitlist.saving") : t("waitlist.join")}
          </button>
        </form>

        {message && (
          <p className={`waitlist-message ${status}`}>{message}</p>
        )}
      </div>
    </section>
  );
}
