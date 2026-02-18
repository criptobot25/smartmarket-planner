/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_POSTHOG_HOST?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_TRACES_SAMPLE_RATE?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_WAITLIST_WEBHOOK_URL?: string;
  readonly VITE_FLAG_ANALYTICS?: string;
  readonly VITE_FLAG_ERROR_MONITORING?: string;
  readonly VITE_FLAG_WAITLIST_CAPTURE?: string;
  readonly VITE_FLAG_PREMIUM_MONETIZATION_V2?: string;
  readonly VITE_FLAG_WEEKLY_COACH_PREMIUM_ONLY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
