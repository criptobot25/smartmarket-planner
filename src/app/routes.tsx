import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { PlannerPage } from "./pages/PlannerPage";
import { ShoppingListPage } from "./pages/ShoppingListPage";
import { PrepGuidePage } from "./pages/PrepGuidePage"; // PASSO 36
import { PremiumPage } from "./pages/PremiumPage";
import { ErrorBoundary } from "./components/ErrorBoundary";

/**
 * CLEAN ROUTE STRUCTURE
 * 
 * /                  → LandingPage (public marketing)
 * /app               → PlannerPage (main app - generate plans)
 * /app/list          → ShoppingListPage (view shopping list + budget)
 * /app/prep-guide    → PrepGuidePage (Sunday meal prep instructions) - PASSO 36
 * /pricing           → PremiumPage (real pricing/paywall)
 * /app/premium       → PremiumPage (legacy shortcut)
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
    path: "/landing",
    element: (
      <ErrorBoundary>
        <LandingPage />
      </ErrorBoundary>
    ),
  },
  {
    path: "/pricing",
    element: (
      <ErrorBoundary>
        <PremiumPage />
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
        path: "prep-guide", // PASSO 36: Sunday Meal Prep Guide
        element: <PrepGuidePage />
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
