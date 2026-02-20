# Analytics Setup (PostHog + GDPR)

## 1) Create PostHog project (EU endpoint recommended)
- Create a project in PostHog.
- Copy your Project API Key.
- Use EU host when possible: `https://eu.i.posthog.com`.

## 2) Environment variables
Add these variables to your `.env.local`:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_key
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

## 3) Consent-first GDPR behavior
This implementation is opt-in by default:
- No analytics starts before user consent.
- A consent banner asks to Accept or Reject analytics.
- If user rejects, capture is disabled.

## 4) Events implemented
- `landing_scroll_depth`
  - Properties: `page`, `depth_percent`
- `landing_cta_clicked`
  - Properties: `cta_id`, `placement`, `target_path`
- `onboarding_step_viewed`
  - Properties: `step`, `total_steps`
- `onboarding_dropoff`
  - Fired on unmount if wizard not completed
  - Properties: `step`, `total_steps`
- `onboarding_completed`
  - Properties: `total_steps`

## 5) Verify quickly
1. Start app and accept analytics in consent banner.
2. Open landing page and scroll.
3. Click CTAs.
4. Open onboarding, move between steps, then leave page.
5. Confirm events in PostHog Live Events.

## Example tracking snippet
```ts
import { trackEvent } from "../app/lib/analytics";

trackEvent("landing_cta_clicked", {
  cta_id: "hero_primary",
  placement: "hero",
  target_path: "/app",
});
```

## GDPR notes (EU)
- Keep analytics disabled until explicit consent.
- Document legal basis as consent in your privacy policy.
- Provide opt-out and data deletion procedure.
- Avoid sending personal/sensitive health data in event properties.
