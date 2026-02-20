"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "../src/i18n";
import { AppPlanProvider } from "./components/AppPlanProvider";
import { AnalyticsProvider } from "./components/AnalyticsProvider";
import { AuthSessionProvider } from "./components/AuthSessionProvider";
import { ClientStoreBootstrap } from "./components/ClientStoreBootstrap";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthSessionProvider>
        <AppPlanProvider>
          <AnalyticsProvider>
            <ClientStoreBootstrap />
            {children}
          </AnalyticsProvider>
        </AppPlanProvider>
      </AuthSessionProvider>
    </I18nextProvider>
  );
}
