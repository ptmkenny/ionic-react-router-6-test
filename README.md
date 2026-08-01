# ion-refresher unmount race — reproduction

Reproduces an uncaught `TypeError` thrown by `ion-refresher` when its host is removed
from the DOM while the refresher's gesture module is still being imported.

```
TypeError: Cannot read properties of undefined (reading '__zone_symbol__addEventListener')
    at addEventListener
    at Object.enable
    at Refresher.disabledChanged
    at Refresher.setupMDNativeRefresher
```

## Run it

```bash
npm install
npm run dev
```

Open the app (Tab 1) and press **Run race**. The page counts unhandled rejections and
prints each one; they also appear in the browser console.

The run mounts an `ion-refresher` and unmounts it again 40 times, sweeping the unmount
delay from 0 ms to 39 ms so it lands inside the race window regardless of how fast the
gesture chunk loads. On a local dev server this reports 1-3 rejections per run. If a run
reports none, throttle the network to Slow 3G and hard-reload to widen the window.

## What causes it

`ion-refresher`'s native setup does:

```ts
this.gesture = (await import('../../utils/gesture')).createGesture({
  el: this.scrollEl!,
  ...
});
```

The dynamic import yields to the event loop. If the refresher is disconnected while it
resolves, `disconnectedCallback()` has already run `this.scrollEl = undefined`, so
`createGesture` gets `el: undefined` and the following `disabledChanged()` →
`gesture.enable(true)` calls `addEventListener(undefined, ...)`.

Nothing awaits the setup method, so it surfaces as an **unhandled promise rejection** —
a framework error boundary cannot catch it, and an app that listens for
`unhandledrejection` can be taken down by it.

Both native paths are affected: `setupMDNativeRefresher()` (used in `md` mode, the
default on non-Apple platforms) and `setupiOSNativeRefresher()`. The legacy non-native
path is safe, because it passes a `contentEl` captured in a closure rather than
`this.scrollEl`.

No router is involved — the race only needs the refresher's host to be removed while
that import is in flight. In a real app the trigger is ordinary navigation away from a
page that renders a refresher.

## Versions

This app pins the `@ionic/*` nightly that supports react-router 6, but **the bug is not
nightly-specific**. The same code is present on `main` at v8.8.16 and on `major-9.0` at
v8.8.15.

Run `npx @ionic/cli info` for the full environment.
