import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { PlannerPage } from "./pages/PlannerPage";
import { ShoppingListPage } from "./pages/ShoppingListPage";
import { RecipesPage } from "./pages/RecipesPage";
import { HistoryPage } from "./pages/HistoryPage";
import { PremiumPage } from "./pages/PremiumPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
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
        path: "plan",
        element: <Navigate to="/" replace />
      },
      {
        path: "recipes",
        element: <RecipesPage />
      },
      {
        path: "history",
        element: <HistoryPage />
      },
      {
        path: "premium",
        element: <PremiumPage />
      }
    ]
  }
]);
