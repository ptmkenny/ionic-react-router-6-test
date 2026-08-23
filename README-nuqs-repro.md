# nuqs reproduction: a pushing write does not advance react-router's history index

Reproduces the bug reported against [nuqs](https://github.com/47ng/nuqs): a
`useQueryState` write with `{ history: 'push', shallow: false }` adds a browser
history entry but tells react-router it was a *replace*, so react-router's
history index stops matching the browser's history stack.

## Running it

```sh
npm install
npm run dev
```

Open **<http://localhost:5173/nuqs-repro.html>** — not `/`, which is the Ionic
app this repo normally hosts.

Click the buttons in order and read the table:

1. `record baseline`
2. `push write: m=open`
3. `history.back()`
4. `control: react-router push`

## What you should see

| step                    | url                       | history.length | history.state.idx |
| ----------------------- | ------------------------- | -------------- | ----------------- |
| 1. before any write     | `/nuqs-repro.html`        | 2              | 0                 |
| 2. after push write     | `/nuqs-repro.html?m=open` | **3**          | **0**             |
| 3. after history.back() | `/nuqs-repro.html`        | 3              | 0                 |
| 4. control: rr push     | `/nuqs-repro.html?m=open` | 3              | **1**             |

Step 2 is the bug: `history.length` grows, so an entry was really pushed, but
`idx` — which react-router writes into `history.state` and uses to work out how
far a traversal moved — does not. Step 4 makes the same URL change through
react-router's own `navigate()` and gets `idx: 1`, which is what step 2 should
have produced.

## Notes on this file's place in the repo

`src/nuqs-repro/main.tsx` is a separate Vite entry that mounts only
`BrowserRouter` + `NuqsAdapter` + one component. It deliberately shares nothing
with the Ionic app: no `IonReactRouter`, no `setupIonicReact`, no
`src/App.tsx`. What it shows is the adapter's contract with react-router.

`src/App.tsx` on this branch is the repo's stock Ionic app and still uses
react-router v5 syntax, so `npm run build` fails there. That is unrelated to
this reproduction, which needs only `npm run dev`.
