"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "../src/i18n";
import { AuthSessionProvider } from "./components/AuthSessionProvider";
import { ClientStoreBootstrap } from "./components/ClientStoreBootstrap";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthSessionProvider>
        <ClientStoreBootstrap />
        {children}
      </AuthSessionProvider>
    </I18nextProvider>
  );
}
