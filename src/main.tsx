import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import { ShoppingPlanProvider } from "./contexts/ShoppingPlanContext";
import "./i18n";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ShoppingPlanProvider>
      <RouterProvider router={router} />
    </ShoppingPlanProvider>
  </React.StrictMode>
);
