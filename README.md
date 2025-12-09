How to reproduce:

1. `npm run dev`
2. Try to go to http://localhost:5173/no-tab. Nothing will be displayed.
3. Edit App.tsx to put a slash in front of the path for no-tab: `/no-tab`
4. Refresh http://localhost:5173/no-tab, and you will see the text "no tabs"
