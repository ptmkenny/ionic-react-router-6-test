# `id={undefined}` becomes `id="undefined"` — reproduction

Reproduces `@ionic/react` writing the literal string `"undefined"` into a reflected DOM
attribute when a React component forwards an optional prop that the caller left unset.

```html
<!-- <IonToggle id={undefined}> renders: -->
<ion-toggle id="undefined" role="switch" aria-checked="false" … class="md hydrated">
```

No error, no warning. Every element rendered this way carries the same invalid id, so a
page with several of them has duplicate ids and `document.getElementById('undefined')`
resolves to whichever came first.

## Run it

```bash
npm install
npm run dev
```

Open the app (Tab 1). The page renders one `IonToggle` through a wrapper that forwards an
optional `id`, and prints the attribute the element actually ended up with.

On load, with no `id` passed:

- Expected: `id attribute on <ion-toggle>: (none)`
- Actual: `id attribute on <ion-toggle>: "undefined"`

Then press the two buttons in order:

1. **Pass id="real-id"** — the attribute becomes `"real-id"`, which is correct.
2. **Pass id=undefined** — the attribute stays `"undefined"`. React would have removed
   it; the prop going away leaves the string behind instead.

Both are deterministic on every load — no timing window, no navigation involved.

## What causes it

`packages/react/src/components/react-component-lib/utils/attachProps.ts` assigns every
incoming prop straight onto the custom element:

```ts
(node as any)[name] = newProps[name];
const propType = typeof newProps[name];
if (propType === 'string') {
  node.setAttribute(camelToDashCase(name), newProps[name]);
}
```

`id` is a reflected non-nullable `DOMString` IDL attribute, so `node.id = undefined`
stringifies the value per WebIDL and the element ends up with `id="undefined"`. The
`typeof === 'string'` guard below never comes into play — the property assignment has
already reflected to the attribute. `title`, `slot`, `name`, `lang` and `dir` behave the
same way; `slot={undefined}` is the worst of them, since it places the element in a slot
named `undefined`.

The wrapper's own `render()` in `createComponent.tsx` deliberately omits these props:

```ts
// we should only render strings, booleans, and numbers as attrs in html.
// objects, functions, arrays etc get synced via properties on mount.
const type = typeof value;
if (type === 'string' || type === 'boolean' || type === 'number') {
  acc[camelToDashCase(name)] = value;
}
```

`undefined` fails that check, so React never emits the attribute. `attachProps` then
contradicts it from `componentDidMount` two steps later. The two prop paths disagree.

The second half of the reproduction (prop → `undefined`) is a related gap: `attachProps`
receives `oldProps` but uses it only for `className`, so it has no notion of a prop being
removed. Today a removal writes `"undefined"` over the old value; the fix has to reset the
property and drop the attribute instead.

## Versions

This app pins the `@ionic/*` nightly that supports react-router 6, but **the bug is not
nightly-specific**. The `attachProps` code above is byte-identical in the released
`@ionic/react@8.8.17` tarball on npm (`dist/index.js`), at the `v8.8.9` tag, on `main`,
and on the `major-9.0` branch.

Reproduced here on `@ionic/react@8.7.12-dev.11765219790.17cbe2e9`, Chromium, `md` mode.

Run `npx @ionic/cli info` for the full environment.
