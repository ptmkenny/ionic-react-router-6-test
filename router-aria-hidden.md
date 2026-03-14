# Ionic React Router aria-hidden Bug Analysis

Analysis by Claude Code (Sonnet 4.5)

## Summary

A bug in `@ionic/react` and `@ionic/react-router` causes `aria-hidden="true"` to persist on `ion-router-outlet` elements after page transitions, breaking accessibility and causing Playwright tests to fail.

## Symptoms

- Playwright tests fail with "no locator visible before timeout"
- `getByRole()` cannot find buttons inside the outlet
- The outer `ion-router-outlet` has `aria-hidden="true"` even though content is visible

```html
<ion-router-outlet id="routerOutlet-1" aria-hidden="true">  <!-- BUG: should not have aria-hidden -->
  <div class="ion-page can-go-back">
    <ion-router-outlet id="routerOutlet-6">
      <div class="ion-page can-go-back">
        <!-- Visible content with buttons that can't be found -->
      </div>
    </ion-router-outlet>
  </div>
</ion-router-outlet>
```

## Root Cause

### Location 1: OutletPageManager registers outlets as "pages"

**File:** `node_modules/@ionic/react/dist/index.js`
**Class:** `OutletPageManager` (lines 1316-1374)
**Line:** 1340

```javascript
componentDidMount() {
    if (this.ionRouterOutlet) {
        if (!this.outletIsReady) {
            componentOnReady(this.ionRouterOutlet, () => {
                this.outletIsReady = true;
                this.context.registerIonPage(this.ionRouterOutlet, this.props.routeInfo);  // <-- BUG SOURCE
            });
        }
        // ...
    }
}
```

The `OutletPageManager` registers the `ion-router-outlet` element **itself** as an IonPage. This is intended to enable lifecycle events (`ionViewWillEnter`, etc.) for nested outlets, but it has an unintended side effect.

### Location 2: Transition logic sets aria-hidden on "leaving pages"

**File:** `node_modules/@ionic/react-router/dist/index.js`
**Function:** `transitionPage()` (lines 1900-2072)
**Lines:** 2057, 2068

```javascript
// Non-animated transitions (line 2057)
requestAnimationFrame(() => {
    enteringEl.classList.remove('ion-page-invisible');
    requestAnimationFrame(() => {
        leavingEl.classList.add('ion-page-hidden');
        leavingEl.setAttribute('aria-hidden', 'true');  // <-- Sets aria-hidden
        resolve();
    });
});

// Animated transitions (line 2068)
if (leavingEl && !progressAnimation) {
    leavingEl.classList.add('ion-page-hidden');
    leavingEl.setAttribute('aria-hidden', 'true');  // <-- Sets aria-hidden
}
```

When a navigation occurs, the transition system identifies the "leaving" element. Because outlets are registered as pages, the outlet itself can become the `leavingEl`, causing `aria-hidden="true"` to be set on the outlet.

### Location 3: aria-hidden is only removed for entering pages

**File:** `node_modules/@ionic/react-router/dist/index.js`
**Lines:** 1202, 2000

```javascript
const showIonPageElement = (element) => {
    if (element) {
        element.classList.remove('ion-page-hidden');
        element.removeAttribute('aria-hidden');  // <-- Only called for entering elements
    }
};
```

The `aria-hidden` attribute is only removed when an element becomes the "entering" page. If an outlet was marked as "leaving" but then remains visible (because it contains the new route), there's no code path to clean it up.

## Bug Flow

1. App initializes with nested router outlets
2. `OutletPageManager.componentDidMount()` registers outer outlet as a "page"
3. User navigates from tabs to onboarding (e.g., email verification)
4. Transition system identifies the outer outlet as the "leaving page"
5. `transitionPage()` sets `aria-hidden="true"` on the outlet
6. The outlet remains in the DOM (it contains the new route)
7. No cleanup occurs because the outlet isn't "entering" - it's just there
8. All content inside the outlet is now hidden from accessibility tree

## Affected Versions

- `@ionic/react`: ^8.7.13-dev.11766090775.11e2bebb
- `@ionic/react-router`: ^8.7.13-dev.11766090775.11e2bebb
- `react-router`: ^6.30.3
- `react-router-dom`: ^6.30.3

## Routing Structure That Triggers Bug

```
RouterUniversalis.tsx
└─ IonRouterOutlet (outer - gets aria-hidden="true" stuck)
    ├─ Route /firstRun → RouterOutletFirstRun
    ├─ Route /onboarding → RouterOutletOnboarding
    │   └─ IonPage
    │       └─ IonRouterOutlet (inner)
    │           └─ Route verify-email → PageOnboardingVerifyEmail
    └─ Route * → WrapperIonTabs
        └─ IonRouterOutlet (tab outlet)
```

Navigation from the `*` route (tabs) to `/onboarding` triggers the bug.

## Workaround

Create a hook that removes `aria-hidden` from outlets after route changes:

```typescript
// src/hooks/useAriaHiddenFix.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useAriaHiddenFix = (): void => {
  const location = useLocation();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const outlets = document.querySelectorAll(
        'ion-router-outlet[aria-hidden="true"]'
      );
      outlets.forEach((outlet) => {
        outlet.removeAttribute('aria-hidden');
      });
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
};
```

## Proper Fix (in Ionic libraries)

The fix should be in `@ionic/react-router`'s `transitionPage()` function:

1. Before setting `aria-hidden` on `leavingEl`, check if it's an `ion-router-outlet`
2. Or: After transition completes, remove `aria-hidden` from any outlets that contain visible content
3. Or: Don't register outlets as pages in `OutletPageManager` - use a different mechanism for lifecycle events
