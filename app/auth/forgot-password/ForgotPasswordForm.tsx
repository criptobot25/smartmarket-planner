"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;

    setIsSending(true);
    // Uses the same magic link flow — no password to reset, just re-sends sign-in link
    await signIn("email", { email, callbackUrl: "/app", redirect: false });
    setIsSending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
        <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>✅</p>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>Link sent!</h2>
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
          If an account exists for <strong>{email}</strong>, you&apos;ll receive a sign-in link shortly.
        </p>
        <p style={{ color: "#9ca3af", fontSize: "0.8rem", marginTop: "1rem" }}>
          Check your spam folder if you don&apos;t see it.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="np-actions">
      <label htmlFor="reset-email" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
        Email address
      </label>
      <input
        id="reset-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        className="np-input"
      />
      <button type="submit" className="np-btn np-btn-primary" disabled={isSending}>
        {isSending ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
