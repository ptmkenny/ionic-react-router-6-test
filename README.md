# aria-hidden Bug MRE

Minimum reproducible example demonstrating the `aria-hidden="true"` bug in Ionic React Router.

## Bug Summary

`aria-hidden="true"` persists on `ion-router-outlet` after navigating from a tabs route to a nested outlet route. This breaks accessibility and causes Playwright tests to fail with "no locator visible before timeout".

## Routing Structure

This structure matches the original bug report exactly:

```
IonRouterOutlet (outer - gets aria-hidden="true" stuck)
├─ Route /onboarding/* → RouterOutletOnboarding
│   └─ IonPage
│       └─ IonRouterOutlet (inner)
│           └─ Route verify-email → PageOnboardingVerifyEmail
└─ Route * → IonTabs (catch-all for tabs)
    └─ IonRouterOutlet (tab outlet)
        └─ Tab pages (/tab1, /tab2)
```

Navigation from the `*` route (tabs) to `/onboarding` triggers the bug.

## Versions

- `@ionic/react`: ^8.7.13-dev.11766090775.11e2bebb
- `@ionic/react-router`: ^8.7.13-dev.11766090775.11e2bebb
- `react-router-dom`: ^6.30.3

## Reproduction Steps

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173/tab1 in your browser (tabs are at root level via catch-all)

4. Click the "Go to /onboarding/verify-email" button

5. Observe:
   - The page displays a red indicator showing "BUG DETECTED: aria-hidden='true' on outer outlet!"
   - Open DevTools console to see the error message
   - Inspect the `#outer-outlet` element - it has `aria-hidden="true"` even though it contains visible content

**Important:** You must navigate FROM the tabs route TO /onboarding. Going directly to /onboarding will not trigger the bug because the transition logic is what sets aria-hidden.

## Expected Behavior

The outer `ion-router-outlet` should NOT have `aria-hidden="true"` when it contains the active page.

## Actual Behavior

After navigating from `/tab1` to `/onboarding/verify-email`:
1. The outer `ion-router-outlet` (id="outer-outlet") has `aria-hidden="true"` stuck on it
2. All content inside is hidden from the accessibility tree
3. `getByRole()` and similar accessibility queries cannot find elements inside

## Root Cause

See `router-aria-hidden.md` for detailed analysis. The issue is:
1. `OutletPageManager` registers outlets as "pages"
2. Transition logic sets `aria-hidden="true"` on "leaving pages"
3. The outlet is marked as leaving but remains visible (it contains the new route)
4. No cleanup occurs because the outlet isn't "entering"
