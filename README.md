# OutletPageManager callback after unmount

Minimal reproduction of an uncaught exception when a nested `IonRouterOutlet`
is removed before its deferred initialization callback runs.

## Run

```sh
npm install
npm run dev
```

Open the URL printed by Vite and click **Mount and unmount outlet**.

Expected: the outlet is removed without errors, and **Uncaught errors** stays at 0.

Actual: each click increments **Uncaught errors** and displays:

```text
TypeError: Cannot read properties of null (reading 'classList')
    at .../node_modules/.vite/deps/chunk-K6ONCLJS.js:13510:19
    at .../node_modules/.vite/deps/chunk-ANOI66QA.js:35:75
```

Vite chunk names and line numbers can vary. With source maps, the first frame is
`OutletPageManager`'s `componentOnReady` callback. Errors are also left visible
in the browser console; the listeners do not suppress them.

## Minimal trigger

`src/pages/Tab1.tsx` renders a nested `IonRouterOutlet` with `ionPage`.
The parent component removes it in a layout effect. React invokes the child's
`componentDidMount` before that parent layout effect, so Ionic schedules the
initialization callback before React removes the outlet. This forces the
lifecycle ordering that can otherwise occur during rapid navigation or
conditional outlet replacement. It does not mock or delay Ionic APIs, change
framework internals, require a backend, or rely on arbitrary timer delays.

`src/App.tsx` supplies only `IonApp`, `IonReactRouter`, and essential styles.
The template's existing React Strict Mode remains enabled. The UI records both
window errors and unhandled promise rejections so the failure is visible without
developer tools. Clicking again repeats the same lifecycle ordering.

## Confirmed environment

- Reproduction branch: `outletPageManager`.
- Base: `main` at `9cfc6fa9`, verified against GitHub before branching.
- Released packages: `@ionic/core`, `@ionic/react`, and `@ionic/react-router`
  pinned to **9.0.6**, installed from npm (not the local patched checkout).
- React / React DOM: **19.0.0**.
- Verified in headless system Chromium on Linux: five clicks produced five
  uncaught errors, with the counter advancing once per click.
- `npm run build` passes. Other browsers and React versions were not tested.

This is confirmed on a released Ionic version, not only the template's old
8.7.12 development packages. The same unsafe callback is present in framework
`upstream/main` at `643584b3ac` (2026-10-01).

## Cause and proposed fix

`packages/react/src/routing/OutletPageManager.tsx` checks that
`this.ionRouterOutlet` exists when scheduling `componentOnReady`. Inside the
later callback, it reads the ref again and accesses `el.classList`. React can
clear the ref between these two points. The TypeScript non-null assertion does
not protect the runtime access.

The proposed fix on the framework's matching `outletPageManager` branch captures
the element and mount generation when scheduling. The callback exits if that
mount has ended or the ref now points to a different element. Only then does it
mark the outlet ready and register it. Existing duplicate-callback protection
is retained. Framework regression tests cover unmount, ref clearing, ref
replacement, and Strict Mode remounts.

The reproduction intentionally retains unpatched npm packages so it demonstrates
the failure. A browser comparison against the patched framework package has not
yet been performed.
