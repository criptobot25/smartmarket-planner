import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "./providers";
import { absoluteUrl, getLanguageAlternates, getSiteUrl } from "./lib/seo";

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "NutriPilot",
  url: absoluteUrl("/"),
  inLanguage: ["en-US", "pt-BR"],
  potentialAction: {
    "@type": "SearchAction",
    target: `${absoluteUrl("/blog")}?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "NutriPilot",
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo-nutripilot.svg"),
    },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NutriPilot",
  url: absoluteUrl("/"),
  logo: absoluteUrl("/logo-nutripilot.svg"),
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    availableLanguage: ["English", "Portuguese"],
  },
};

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "NutriPilot | Nutrition Planning Made Simple",
    template: "%s | NutriPilot",
  },
  description: "NutriPilot builds smart weekly nutrition plans, practical grocery lists, and prep guidance tailored to your goals.",
  keywords: [
    "nutrition planner",
    "meal planner",
    "grocery list app",
    "weekly meal prep",
    "macro tracking",
    "nutrition coaching",
    "meal prep for beginners",
    "smart grocery list",
    "cutting meal plan",
    "bulking meal plan",
    "maintenance diet",
    "fitness nutrition",
    "personalized meal plan",
    "budget friendly meal plan",
    "protein rich recipes",
    "healthy eating plan",
    "workout nutrition",
    "calorie counter",
    "nutritional planning app",
    "diet planner online",
    "weekly food planner",
    "high protein grocery list",
    "European meal planner",
  ],
  authors: [{ name: "NutriPilot Team" }],
  alternates: {
    canonical: "/",
    languages: getLanguageAlternates("/"),
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "NutriPilot",
    title: "NutriPilot | Nutrition Planning Made Simple",
    description: "Build weekly nutrition plans, save money with optimized shopping lists, and prep with confidence.",
    locale: "en_US",
    alternateLocale: ["pt_BR"],
    images: [
      {
        url: "/previews/preview-1.png",
        width: 1200,
        height: 700,
        alt: "NutriPilot nutrition planner preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NutriPilot | Nutrition Planning Made Simple",
    description: "Smart weekly plans, practical grocery missions, and prep guidance in one app.",
    images: ["/previews/preview-1.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          id="ld-website-global"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          id="ld-organization-global"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
