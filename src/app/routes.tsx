import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { PlannerPage } from "./pages/PlannerPage";
import { ShoppingListPage } from "./pages/ShoppingListPage";
import { PremiumPage } from "./pages/PremiumPage";
import { ErrorBoundary } from "./components/ErrorBoundary";

/**
 * CLEAN ROUTE STRUCTURE
 * 
 * /            → LandingPage (public marketing)
 * /app         → PlannerPage (main app - generate plans)
 * /app/list    → ShoppingListPage (view shopping list + budget)
 * /app/premium → PremiumPage (upgrade to premium)
 * 
 * Removed redundant routes:
 * - /plan (was duplicate of /)
 * - /recipes (not core feature)
 * - /history (not core feature)
 * 
 * All routes wrapped in ErrorBoundary to prevent crashes
 * 
 * Source: Navigation consistency
 * https://www.nngroup.com/articles/consistency-and-standards/
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <LandingPage />
      </ErrorBoundary>
    ),
  },
  {
    path: "/app",
    element: (
      <ErrorBoundary>
        <AppLayout />
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: <PlannerPage />
      },
      {
        path: "list",
        element: <ShoppingListPage />
      },
      {
        path: "premium",
        element: <PremiumPage />
      }
    ]
  },
  {
    path: "*",
    element: (
      <ErrorBoundary>
        <Navigate to="/" replace />
      </ErrorBoundary>
    )
  }
]);
