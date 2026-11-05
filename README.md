# IonPage registered with stale routeInfo is hidden by a catch-all route — reproduction

Reproduces a blank screen after a navigation in `@ionic/react-router`. The entering page
renders, but `StackManager` attaches it to the outlet's catch-all (`*`) view instead of the
route that owns the new pathname, and then hides it:

```html
<div class="ion-page ion-page-hidden" aria-hidden="true" data-testid="join-page">…</div>
```

No error is thrown. The page stays in the DOM with `ion-page-hidden` and
`aria-hidden="true"`, so the user sees an empty screen.

## Run it

```bash
npm install
npm run dev
```

Open `/join`, then:

1. Press **Log in**. The app pushes to `/verify`.
2. Press **Log out**. The app sets the user to logged out and calls
   `navigateRoot('/join')`.

Expected: the Join page is shown.

Actual: the screen is blank. The status bar at the bottom reports
`last: hidden`. In the DOM, the Join page is in the inner `ion-router-outlet` with
`ion-page-hidden` and `aria-hidden="true"`.

It happens on every logout (10/10 runs in Chromium).

## App shape

```tsx
<IonRouterOutlet>
  <Route path="/verify" element={<VerifyPage />} />
  <Route path="*" element={
    <IonPage>
      <IonRouterOutlet>
        <Route path="/join/*" element={<GuardAnonOnly><JoinPage /></GuardAnonOnly>} />
        <Route path="*" element={<NotFoundPage />} />
      </IonRouterOutlet>
    </IonPage>
  } />
</IonRouterOutlet>
```

`GuardAnonOnly` renders `JoinPage` only while logged out. Log out does:

```ts
setLoggedIn(false);
router.navigateRoot('/join');
```

This is a common pattern: an anonymous-only route guard plus a logout handler that clears
the user and navigates to the login page.

## What causes it

1. While the user is on `/verify`, the inner outlet (still mounted under the hidden `*`
   page) has two view items: `/join/*`, whose page unmounted when the guard stopped
   rendering it, and `*`, holding `NotFoundPage` for `/verify`.
2. Log out sets state and navigates in the same tick. The guard now renders `JoinPage`,
   so a new `IonPage` mounts and calls `registerIonPage(page, routeInfo)`.
3. `routeInfo` trails the location. `IonReactRouter` passes a location change to
   `IonRouter` from a `useEffect`, and `IonRouter` then calls `setRouteInfo`, which takes
   another render. So the page registers with `routeInfo.pathname === '/verify'` while
   the URL is already `/join`.
4. `StackManager.registerIonPage` looks the page up with
   `findViewItemByRouteInfo(routeInfo, this.id)`. In the inner outlet, only the `*` route
   matches `/verify`, so the Join page becomes the `*` view's `ionPageElement`.
5. When `routeInfo` reaches `/join`, `ReactRouterViewStack.renderViewItem` deactivates the
   `*` view because the more specific `/join/*` route matches. It adds `ion-page-hidden`
   and `aria-hidden="true"` to that view's `ionPageElement`, which is now the Join page.
   The `/join/*` view has no page element, so nothing is shown.

React Router's `v7_startTransition` future flag is not involved: the result is the same
with and without it.

## Fix

A patched `StackManager` defers a registration that resolves to a pure catch-all view
already holding a different live page. It retries at the start of the next
`handlePageTransition`, once `routeInfo` has caught up, and falls back to the original
registration after 500 ms. The source change is on branch `register-stale-routeinfo` of
`ptmkenny/ionic-framework`. The same change applied to the published 9.0.10
`dist/index.js` makes this reproduction show the Join page on 10/10 logouts.

## Versions

This branch pins the released `@ionic/core`, `@ionic/react`, and `@ionic/react-router`
**9.0.10** (the latest release) with `react-router-dom` 6.30, instead of the 8.7.12
nightly that `main` uses. The bug is not nightly-specific: it reproduces on 9.0.10, and
the same `registerIonPage` lookup is unchanged on `ionic-team/ionic-framework` `main`
(`9b32358690`, 2026-11-04).

Run `npx @ionic/cli info` for the full environment.
