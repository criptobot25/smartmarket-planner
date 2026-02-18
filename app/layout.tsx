import type { Metadata } from "next";
import { ClientStoreBootstrap } from "./components/ClientStoreBootstrap";
import en from "../src/i18n/en.json";
import "./globals.css";

export const metadata: Metadata = {
  title: en["app.name"],
  description: en["planner.subtitle"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientStoreBootstrap />
        {children}
      </body>
    </html>
  );
}
