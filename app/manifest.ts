import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NutriPilot — Nutrition Planning Made Simple",
    short_name: "NutriPilot",
    description:
      "Build smart weekly nutrition plans, practical grocery lists, and prep guidance tailored to your fitness goals.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a7e6c",
    orientation: "portrait-primary",
    categories: ["health", "fitness", "food", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
