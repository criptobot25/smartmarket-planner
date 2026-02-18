import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import { ShoppingPlanProvider } from "./contexts/ShoppingPlanContext";
import { initializeAnalytics } from "./core/monitoring/analytics";
import { initializeErrorMonitoring } from "./core/monitoring/errorMonitoring";
import { migrateLegacyStorageKeys } from "./core/storage/migrateLegacyKeys";
import "./i18n";
import "./index.css";

migrateLegacyStorageKeys();
initializeAnalytics();
initializeErrorMonitoring();
document.title = "NutriPilot — Navigate Your Nutrition";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ShoppingPlanProvider>
      <RouterProvider router={router} />
    </ShoppingPlanProvider>
  </React.StrictMode>
);
