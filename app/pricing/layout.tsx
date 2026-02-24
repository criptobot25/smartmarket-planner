import type { Metadata } from "next";
import { getLanguageAlternates } from "../lib/seo";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Compare NutriPilot Free and Premium plans to unlock advanced weekly adjustments, recipe packs, and prep guidance.",
  alternates: {
    canonical: "/pricing",
    languages: getLanguageAlternates("/pricing"),
  },
  openGraph: {
    type: "website",
    url: "/pricing",
    title: "NutriPilot Pricing | Free vs Premium",
    description: "See which NutriPilot plan fits your nutrition goals and weekly execution workflow.",
    images: [
      {
        url: "/previews/preview-2.png",
        width: 1200,
        height: 700,
        alt: "NutriPilot pricing preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NutriPilot Pricing | Free vs Premium",
    description: "Compare NutriPilot plans and unlock premium nutrition planning features.",
    images: ["/previews/preview-2.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
