import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthOptions, getServerSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { Resend } from "resend";
import { prisma } from "./prisma";

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

// Resend-powered email provider (preferred) or fallback to SMTP
const emailFrom = process.env.EMAIL_FROM ?? "NutriPilot <no-reply@nutripilot.com>";

if (process.env.RESEND_API_KEY) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  providers.push(
    EmailProvider({
      from: emailFrom,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        try {
          await resend.emails.send({
            from: emailFrom,
            to: email,
            subject: "Sign in to NutriPilot",
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
                <h1 style="font-size: 1.5rem; font-weight: 700; color: #111827;">🥗 NutriPilot</h1>
                <p style="color: #374151; font-size: 1rem; margin: 1rem 0;">
                  Click the button below to sign in to your account:
                </p>
                <a href="${url}" style="display: inline-block; background: #3b82f6; color: #ffffff; padding: 0.75rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1rem; margin: 1rem 0;">
                  Sign in to NutriPilot
                </a>
                <p style="color: #9ca3af; font-size: 0.8rem; margin-top: 1.5rem;">
                  If you didn't request this email, you can safely ignore it.<br/>
                  This link will expire in 24 hours.
                </p>
              </div>
            `,
          });
        } catch (error) {
          console.error("[Resend] Failed to send verification email:", error);
          throw new Error("Failed to send verification email");
        }
      },
    }),
  );
} else if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
  providers.push(
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? "FREE";
        token.subscriptionStatus = user.subscriptionStatus ?? "inactive";
        token.stripeCustomerId = user.stripeCustomerId ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role === "PREMIUM" ? "PREMIUM" : "FREE";
        session.user.subscriptionStatus =
          token.subscriptionStatus === "active" ||
          token.subscriptionStatus === "trialing" ||
          token.subscriptionStatus === "past_due" ||
          token.subscriptionStatus === "canceled"
            ? token.subscriptionStatus
            : "inactive";
        session.user.stripeCustomerId =
          typeof token.stripeCustomerId === "string" ? token.stripeCustomerId : null;
      }

      return session;
    },
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}
