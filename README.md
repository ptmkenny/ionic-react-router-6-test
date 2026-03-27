# React Error #185 Ionic Router MRE

This repository is a minimal reproducible example for a React runtime crash triggered by Ionic React Router.

## Affected Ionic build

- Bad: `8.8.1-dev.11774273905.1c3b9598`
- Known good: `8.8.1-dev.11773432149.19826d0c`

## Bug summary

A nested Ionic router structure that should render a normal fallback error page instead crashes with the React production error `#185`.

Expected behavior:
- the content index suspends while loading five recent Hacker News stories
- navigating to a non-loaded item renders a normal Ionic error page
- the page body contains `Failed to load item with id story-not-loaded`

Actual behavior on the bad build:
- the app crashes before the fallback page is usable
- the browser shows the React production error `#185`

## Route structure

- outer `IonRouterOutlet`
- tabs wrapper route using `IonTabs`
- nested `IonRouterOutlet` for tab routes
- nested `IonRouterOutlet` for `/content/*`
- Suspense-backed Hacker News query shared by the content index and item page
- dynamic `/content/pages/:resourceId` route that falls back to a generic `PageError`

## Reproduction steps

1. Install dependencies.
2. Start the dev server with `npm run dev`.
3. Open `/tab1`.
4. Click `Go to Content index`.
5. Wait for the five Hacker News stories to load.
6. Click `Open non-loaded item`.
7. Observe the crash on the bad Ionic build.

## Version check

To confirm the regression boundary:

1. Run the repro on `8.8.1-dev.11774273905.1c3b9598` and observe the crash.
2. Change Ionic packages to `8.8.1-dev.11773432149.19826d0c`.
3. Reinstall dependencies and rerun.
4. The fallback error page should render normally on the older build.
