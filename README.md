# Page kept for swipe-back stays visible when its outlet re-enters scope — reproduction

Reproduces two pages left visible at once in an `ionPage` child outlet in
`@ionic/react-router`, in iOS mode. After the user leaves the child outlet and later
returns to a different page in it, the page that was active when they left is never
hidden. It stays on screen and covers the page the user navigated to:

```html
<ion-router-outlet class="ion-page …">
  <div class="ion-page can-go-back" data-testid="step-1" style="z-index: 101;">…</div>
  <div class="ion-page can-go-back" data-testid="step-2" style="z-index: 101;">…</div>
</ion-router-outlet>
```

No error is thrown. Neither page has `ion-page-hidden` or `aria-hidden="true"`. Step 2
comes later in the DOM, so it is drawn on top: the URL is `/onboarding/step1`, but the
user sees Step 2.

## Run it

```bash
npm install
npm run dev
```

Each page has its own background color: Step 1 green, Step 2 red, Home blue, Settings
purple.

Open `/onboarding/step1`, then press:

1. **Next** — pushes `/onboarding/step2`.
2. **Finish** — pushes `/home`, leaving the onboarding outlet.
3. **Settings** — pushes `/settings`.
4. **Back to Step 1** — pushes `/onboarding/step1`, returning to the onboarding outlet.

Expected: the green Step 1 page is shown. The status bar at the bottom reports
`Visible onboarding pages: step-1`.

Actual: the red Step 2 page is shown, although the URL is `/onboarding/step1`. The status
bar reports `Visible onboarding pages: step-1, step-2 ← BUG: more than one`.

It happens on every run (5/5 in Chromium, 3/3 in WebKit).

Open `/onboarding/step1?mode=md` to compare. In md mode the same steps show the green Step 1
page only (3/3 runs).

## App shape

```tsx
setupIonicReact({ mode: 'ios' });

<IonRouterOutlet>
  <Route path="/onboarding/*" element={
    <IonRouterOutlet ionPage>
      <Route path="step1" element={<Step1 />} />
      <Route path="step2" element={<Step2 />} />
    </IonRouterOutlet>
  } />
  <Route path="/home" element={<HomePage />} />
  <Route path="/settings" element={<SettingsPage />} />
</IonRouterOutlet>
```

This is a common pattern: an onboarding or sign-up flow in its own child outlet, which
the user leaves for the main app and later returns to at a different step (for example,
to verify a changed email address).

## What causes it

1. iOS mode enables `swipeGesture` on the root outlet.
2. **Finish** pushes `/home`, which is outside the onboarding outlet's mount path.
   `StackManager.handleOutOfScopeOutlet` sees that the outlet is an `ionPage` outlet whose
   parent has `swipeGesture === true`, so it keeps every child view mounted for
   swipe-to-go-back and returns early. It does not hide the active child page (Step 2):
   only the parent outlet hides the onboarding outlet as a whole.
3. **Back to Step 1** pushes `/onboarding/step1`, back in scope. `findViewItems` resolves
   the entering view (Step 1), but finds no leaving view: it looks it up by
   `routeInfo.lastPathname` (`/settings`) and then `routeInfo.prevRouteLastPathname`
   (`/home`), and both belong to the root outlet, not this one.
4. With no leaving view, the transition shows Step 1 and hides nothing. Step 2 is still
   visible from when the user left, so both pages end up visible.

The **Settings** step matters only because of the `prevRouteLastPathname` fallback in
step 3. Going straight from Home to Step 1 leaves `prevRouteLastPathname` at
`/onboarding/step2`, which finds Step 2 as the leaving view and hides it. Any two
navigations outside the outlet before returning trigger the bug.

In md mode, step 2 takes the other branch: the outlet unmounts its views after
`VIEW_UNMOUNT_DELAY_MS`, so Step 2 is gone before the user returns.

## Fix

The patched `StackManager` records the view that was visible when the swipe-preservation
branch keeps the outlet's views. When the next entering view in that outlet is ready, it
hides the recorded page, unless the recorded page is the entering view (the user swiped
or went back to it). It only hides the page, so the parent outlet's transition does not
get a second animation, and the leave lifecycle events that branch deliberately skips
stay skipped.

The source change is on branch `swipe-preserved-page-visible` of
`ptmkenny/ionic-framework`. The same change applied to the published 9.0.10
`dist/index.js` makes this reproduction show Step 1 alone on 5/5 runs in Chromium and
3/3 in WebKit. Browser back from Home to Step 2 still shows Step 2 alone.

## Versions

This branch pins the released `@ionic/core`, `@ionic/react`, and `@ionic/react-router`
**9.0.10** (the latest release) with `react-router-dom` 6.30, instead of the 8.7.12
nightly that `main` uses. The bug is not nightly-specific: it reproduces on 9.0.10, and
`handleOutOfScopeOutlet` and `findViewItems` are unchanged on
`ionic-team/ionic-framework` `main` (`597b9e24d8`, 2026-11-05).

Run `npx @ionic/cli info` for the full environment.
