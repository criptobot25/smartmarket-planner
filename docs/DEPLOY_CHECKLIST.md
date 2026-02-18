# NutriPilot — Deploy Checklist (Paid Beta)

## 1) Environment
- [ ] Set `VITE_APP_VERSION` (semantic release tag)
- [ ] Set `VITE_POSTHOG_KEY`
- [ ] Set `VITE_POSTHOG_HOST` (or use default)
- [ ] Set `VITE_SENTRY_DSN`
- [ ] Set `VITE_SENTRY_TRACES_SAMPLE_RATE` (recommended `0.1` for beta)
- [ ] Set `VITE_WAITLIST_WEBHOOK_URL` (endpoint that stores emails)

## 2) Feature Flags (Final)
- [ ] `VITE_FLAG_ANALYTICS=true`
- [ ] `VITE_FLAG_ERROR_MONITORING=true`
- [ ] `VITE_FLAG_WAITLIST_CAPTURE=true`
- [ ] `VITE_FLAG_PREMIUM_MONETIZATION_V2=true`
- [ ] `VITE_FLAG_WEEKLY_COACH_PREMIUM_ONLY=true`

## 3) Production Readiness Validation
- [ ] `npm run build` succeeds
- [ ] Smoke test routes: `/`, `/app`, `/app/list`, `/app/prep-guide`, `/pricing`
- [ ] Trigger premium modal and verify CTA opens `/pricing`
- [ ] Submit waitlist email from landing and pricing pages
- [ ] Confirm PostHog receives `$pageview` and `waitlist_email_captured`
- [ ] Confirm Sentry receives a test error (canary check)

## 4) Paid Beta Ops
- [ ] Define beta access policy (cohort size, geography, support SLAs)
- [ ] Configure billing/support contact shown to beta users
- [ ] Prepare rollback plan (disable flags + redeploy)
- [ ] Create daily dashboard for conversion and error health

## 5) Go-Live Gate
- [ ] No blocking runtime errors in last 24h
- [ ] Waitlist pipeline working end-to-end
- [ ] Premium flow copy reviewed for clarity in EN/PT
- [ ] Team sign-off from Product + Engineering
