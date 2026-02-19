"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useAppTranslation } from "../lib/i18n";

export function PlannerAuthControls() {
  const { t } = useAppTranslation();
  const { status } = useSession();

  return (
    <>
      {status === "authenticated" ? (
        <button type="button" className="np-btn np-btn-secondary" onClick={() => signOut({ callbackUrl: "/" })}>
          {t("planner.dashboard.logout")}
        </button>
      ) : (
        <button type="button" className="np-btn np-btn-secondary" onClick={() => signIn(undefined, { callbackUrl: "/app" })}>
          {t("planner.dashboard.login")}
        </button>
      )}

    </>
  );
}
