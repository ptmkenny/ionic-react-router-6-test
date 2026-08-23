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

Open <http://localhost:5173/> and click the buttons in order:

1. `record baseline`
2. `push write: m=open`
3. `history.back()`
4. `control: react-router push`

Each click appends a row to the table on the page.

## What you should see

| step                    | url               | history.length | history.state.idx |
| ----------------------- | ----------------- | -------------- | ----------------- |
| 1. before any write     | `/`               | 2              | 0                 |
| 2. after push write     | `/?m=open`        | **3**          | **0**             |
| 3. after history.back() | `/`               | 3              | 0                 |
| 4. control: rr push     | `/?m=open`        | 3              | **1**             |

Step 2 is the bug: `history.length` grows, so an entry was really pushed, but
`idx` — which react-router writes into `history.state` and reads back to work
out how far a traversal moved — does not. Step 4 makes the same URL change
through react-router's own `navigate()` and gets `idx: 1`, which is what step 2
should have produced.

## What is in this branch

`src/nuqs-repro/main.tsx` is the whole reproduction, and it is the root entry on
this branch. It mounts only `BrowserRouter` + `NuqsAdapter` + one component:
no `IonReactRouter`, no `setupIonicReact`, no `src/App.tsx`. Ionic is not part
of the reproduction, and nothing here needs it.

The repo's stock Ionic app has been moved aside to `ionic-app.html` so that the
reproduction is what you get at the root URL. That app does not run on this
branch anyway: `src/App.tsx` is still react-router v5 (`Redirect`, `exact`)
while the installed `react-router-dom` is v6, so loading it fails with
`does not provide an export named 'Redirect'`. That is pre-existing on `main`
and unrelated to this reproduction.
