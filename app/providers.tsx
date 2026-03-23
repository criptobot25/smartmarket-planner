"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "../src/i18n";
import { AppPlanProvider } from "./components/AppPlanProvider";
import { AnalyticsProvider } from "./components/AnalyticsProvider";
import { AuthSessionProvider } from "./components/AuthSessionProvider";
import { ClientStoreBootstrap } from "./components/ClientStoreBootstrap";
import { WebVitalsTracker } from "./components/WebVitalsTracker";
import { ToastProvider } from "./components/Toast";
import { WhatsAppConcierge } from "./components/WhatsAppConcierge";
import { RetentionRiskAlerts } from "./components/RetentionRiskAlerts";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthSessionProvider>
        <AppPlanProvider>
          <AnalyticsProvider>
            <ToastProvider>
              <ClientStoreBootstrap />
              <WebVitalsTracker />
              {children}
              <WhatsAppConcierge />
              <RetentionRiskAlerts />
            </ToastProvider>
          </AnalyticsProvider>
        </AppPlanProvider>
      </AuthSessionProvider>
    </I18nextProvider>
  );
}
