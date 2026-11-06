# Redirect through an intermediate tab route leaves two tab outlets visible — reproduction

Reproduces `@ionic/react-router`'s `StackManager` leaving a second page visible in a
tabs outlet after a forward push to a route that immediately redirects. No error is
thrown. The URL is correct, but the outlet has two pages without `ion-page-hidden`:

```html
<ion-router-outlet class="apple-outlet ion-page can-go-back" style="z-index: 101;">…</ion-router-outlet>
<ion-router-outlet class="banana-outlet ion-page can-go-back" style="z-index: 101;"></ion-router-outlet>
```

There are two ways in, depending on how quickly the redirect follows the push:

- **Path A:** the redirect lands while the forward transition to the redirecting route
  is still running. The superseded transition finishes last and shows its page, here an
  empty `ionPage` outlet. That page covers the screen and takes every click.
- **Path B:** the redirect lands before the redirecting route's page registers. The
  page the user left is never hidden.

## Run it

```bash
npm install
npm run dev
```

Open `/apple`. Press the **Orange** tab, then one of the redirect buttons. Each button
pushes `/banana/redirect?delay=N` with `router.push(path, 'forward', 'push')`. That route
stands in for an auth guard: it renders `<Navigate replace to="/apple" />` after `N` ms.

The status bar above the tab bar reports, 1 s after each redirect, which tab outlets are
not hidden:

| Button | Expected | Observed (Chromium, md mode, fresh load each time) |
| --- | --- | --- |
| Redirect after 0 ms | `apple` | `apple + orange (empty) ← BUG path B`, sometimes path A (10/10 runs stale) |
| Redirect after 10 ms | `apple` | `apple + banana (empty) ← BUG path A` (5/5 runs) |
| Redirect after 20 ms | `apple` | path A in 4/10 runs, otherwise `apple` |
| Redirect after 50 ms | `apple` | `apple` (control: the transition finishes before the redirect) |

**Reload the page between tries.** After path A, the empty Banana outlet stays on top of
the tabs outlet. Clicks on the Apple page land on it, and if you press the Orange tab, the
Orange page appears but its buttons cannot be pressed. After path B, the empty Orange
outlet is left without `ion-page-hidden` or `aria-hidden`; it sits behind the Apple page,
so it does not block clicks, and pressing the Orange tab clears it.

The timing window depends on the machine. If 10 ms does not show path A, try 0 ms and
20 ms.

The route shape:

```tsx
<IonRouterOutlet>
  <Route path="*" element={
    <IonTabs>
      <IonRouterOutlet>
        <Route path="/apple/*" element={<IonRouterOutlet ionPage>…</IonRouterOutlet>} />
        <Route path="/orange/*" element={<IonRouterOutlet ionPage>…</IonRouterOutlet>} />
        <Route path="/banana/*" element={
          <IonRouterOutlet ionPage>
            <Route path="redirect" element={<RedirectToApple />} />
          </IonRouterOutlet>
        } />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">…</IonTabBar>
    </IonTabs>
  } />
</IonRouterOutlet>
```

The redirecting route must be an `ionPage` outlet. With a plain
`<Route path="/banana/redirect" element={<Navigate … />} />` in the tabs outlet, every
run ends with only Apple visible.

## What causes it

Both paths are in `StackManager` (`packages/react-router/src/ReactRouter/StackManager.tsx`)
for the tabs outlet. The push to `/banana/redirect` starts one transition; the redirect
to `/apple` starts a second one in the same outlet before the first is done.

### Path A: a superseded animated commit shows its entering page

1. The push to `/banana/redirect` (direction `forward`) calls `transitionPage` with the
   Banana outlet entering and the Orange outlet leaving. The transition animates, so
   `runCommit` calls `routerOutlet.commit()`, which waits for the entering element to be
   ready before it animates.
2. The redirect to `/apple` (direction `none`) calls `transitionPage` again and
   increments `transitionGeneration`. It does not animate, so it swaps visibility
   synchronously: Apple is shown, and the Banana outlet gets `ion-page-hidden`.
3. The first `commit()` now runs its animation. Core's transition un-hides its entering
   element (the Banana outlet) and hides its leaving element (Orange).
4. After the commit, `runCommit` checks for a newer transition:

   ```ts
   if (myGeneration !== this.transitionGeneration && leavingEl && leavingEl === this.transitionEnteringElement) {
     showIonPageElement(leavingEl);
   }
   ```

   That repairs a stale hide of the newer transition's page, but nothing re-hides the
   stale transition's own entering page. The Banana outlet stays visible with
   `z-index: 101`, on top of Apple.

### Path B: the leaving view is looked up by the intermediate route

1. The push to `/banana/redirect` finds the Banana view, which has no page element yet,
   so `handlePageTransition` waits for its `IonPage`.
2. The redirect to `/apple` arrives before the Banana outlet registers. The Apple
   outlet is ready, so the transition runs, but the leaving view is looked up from
   `routeInfo.lastPathname`, which is `/banana/redirect`. That view has no page element,
   so `transitionPage` gets no leaving view and hides nothing.
3. The Orange outlet, which was visible before the push, is never hidden. Its views are
   unmounted later because the outlet went out of scope, which leaves it empty but still
   without `ion-page-hidden`.

The `ionPageWaitTimeout` fallback in `handlePageTransition` already handles this case for
an entering view that never gets a page ("intermediate redirects (e.g., Navigate in
nested routes) change the leaving view reference"), but the path where the entering
view is ready does not.

## Versions

Confirmed on the released `@ionic/react` and `@ionic/react-router` **9.0.10** (pinned
in this branch's `package.json`), in Chromium, md mode. The same `StackManager` code is
on `ionic-team/ionic-framework` `main` at `597b9e24d8` (2026-11-05). Not tested on the
react-router 6 nightly that `main` of this repo pins.

Run `npx @ionic/cli info` for the full environment.
