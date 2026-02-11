import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { PlannerPage } from "./pages/PlannerPage";
import { ShoppingListPage } from "./pages/ShoppingListPage";
import { RecipesPage } from "./pages/RecipesPage";
import { HistoryPage } from "./pages/HistoryPage";

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
        path: "recipes",
        element: <RecipesPage />
      },
      {
        path: "history",
        element: <HistoryPage />
      }
    ]
  }
]);
