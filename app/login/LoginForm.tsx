"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useAppTranslation } from "../lib/i18n";

type LoginFormProps = {
  callbackUrl: string;
};

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const { t } = useAppTranslation();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email) {
      return;
    }

    setIsSending(true);
    await signIn("email", { email, callbackUrl });
    setIsSending(false);
  }

  return (
    <>
      <div className="np-actions">
        <button
          type="button"
          className="np-btn np-btn-primary"
          onClick={() => signIn("google", { callbackUrl })}
        >
          {t("auth.continueGoogle")}
        </button>
      </div>

      <form onSubmit={handleEmailLogin} className="np-actions" style={{ marginTop: "0.75rem" }}>
        <label htmlFor="email">{t("auth.emailLabel")}</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("auth.emailPlaceholder")}
          required
          className="np-input"
        />
        <button type="submit" className="np-btn np-btn-secondary" disabled={isSending}>
          {isSending ? t("auth.sending") : t("auth.sendMagicLink")}
        </button>
      </form>
    </>
  );
}
