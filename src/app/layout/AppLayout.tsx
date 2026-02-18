import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { AppTelemetry } from "../components/AppTelemetry";
import "./AppLayout.css";

export function AppLayout() {
  return (
    <div className="app-layout">
      <AppTelemetry />
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
