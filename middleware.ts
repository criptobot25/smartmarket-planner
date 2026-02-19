import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const STRIPE_ACTIVE_STATUSES = new Set(["active", "trialing"]);
const ENFORCE_PREP_AUTH = process.env.ENFORCE_PREP_AUTH === "true";

export async function middleware(request: NextRequest) {
  if (!ENFORCE_PREP_AUTH) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  const role = typeof token.role === "string" ? token.role : "FREE";
  const subscriptionStatus =
    typeof token.subscriptionStatus === "string" ? token.subscriptionStatus : "inactive";

  const hasPremium = role === "PREMIUM" || STRIPE_ACTIVE_STATUSES.has(subscriptionStatus);

  if (!hasPremium) {
    return NextResponse.redirect(new URL("/pricing?reason=premium", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/prep/:path*"],
};
