import { Suspense } from "react";
import PlannerDashboard from "../components/PlannerDashboard";

export default function PlannerPage() {
  return (
    <Suspense fallback={null}>
      <PlannerDashboard />
    </Suspense>
  );
}
