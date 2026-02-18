import { type DefaultSession } from "next-auth";

type SessionRole = "FREE" | "PREMIUM";
type SessionSubscriptionStatus = "inactive" | "trialing" | "active" | "past_due" | "canceled";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: SessionRole;
      subscriptionStatus: SessionSubscriptionStatus;
      stripeCustomerId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: SessionRole;
    subscriptionStatus?: SessionSubscriptionStatus;
    stripeCustomerId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: SessionRole;
    subscriptionStatus?: SessionSubscriptionStatus;
    stripeCustomerId?: string | null;
  }
}
