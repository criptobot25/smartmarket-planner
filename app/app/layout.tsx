import type { Metadata } from "next";
import { getLanguageAlternates } from "../lib/seo";

export const metadata: Metadata = {
  title: {
    default: "Planner App",
    template: "%s | NutriPilot App",
  },
  description: "Private NutriPilot workspace for generating plans, managing grocery execution, and tracking weekly prep progress.",
  alternates: {
    canonical: "/app",
    languages: getLanguageAlternates("/app"),
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-image-preview": "none",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/app",
    title: "NutriPilot App",
    description: "Private NutriPilot application area.",
  },
  twitter: {
    card: "summary",
    title: "NutriPilot App",
    description: "Private NutriPilot application area.",
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
