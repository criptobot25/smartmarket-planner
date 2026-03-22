"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

type SignupFormProps = {
  callbackUrl: string;
};

export function SignupForm({ callbackUrl }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleEmailSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;

    setIsSending(true);
    await signIn("email", { email, callbackUrl });
    setIsSending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
        <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📧</p>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>Check your email!</h2>
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
          We sent a sign-in link to <strong>{email}</strong>. Click the link to create your account.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="np-actions">
        <button
          type="button"
          className="np-btn np-btn-primary"
          onClick={() => signIn("google", { callbackUrl })}
        >
          Continue with Google
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          margin: "1rem 0",
          color: "#9ca3af",
          fontSize: "0.8rem",
        }}
      >
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid #e5e7eb" }} />
        or
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid #e5e7eb" }} />
      </div>

      <form onSubmit={handleEmailSignup} className="np-actions">
        <label htmlFor="signup-email" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
          Email address
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="np-input"
        />
        <button type="submit" className="np-btn np-btn-secondary" disabled={isSending}>
          {isSending ? "Sending..." : "Sign up with magic link"}
        </button>
      </form>

      <p style={{ fontSize: "0.75rem", color: "#9ca3af", textAlign: "center", marginTop: "1rem" }}>
        No password needed. We&apos;ll send you a secure link to sign in.
      </p>
    </>
  );
}
