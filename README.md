How to reproduce:

1. `npm run dev`
2. Try to go to http://localhost:5173/tab1
3. Click `ABC Page (Relative)`. You will go to the ABC page, but the URL is `http://localhost:5174/tab1/tab1/abc`, when it should be `http://localhost:5174/tab1/abc`.
4. Go back and click `ABC Page (Absolute)`. You will get a 404.
5. If you delete 404 route, the `ABC Page (Absolute)` link works.
