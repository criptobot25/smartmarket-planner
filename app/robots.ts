import type { MetadataRoute } from "next";
import { absoluteUrl } from "./lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/blog", "/blog/", "/meal-plan", "/meal-plan/"],
        disallow: ["/app", "/app/", "/auth", "/auth/", "/login", "/api", "/api/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/blog", "/blog/"],
        disallow: ["/app", "/auth", "/login", "/api"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
