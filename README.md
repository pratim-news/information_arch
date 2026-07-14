# Consumer 2.0 interactive data model

Public deploy of the FSS Consumer 2.0 / Information Architecture interactive explorer.

## Live pages

After GitHub Pages is enabled on this repo (Settings -> Pages -> Deploy from branch `main` / root):

- App: `fss-consumer-data-model-interactive.html`
- Portable (single file): `fss-consumer-data-model-interactive-portable.html`

Root `index.html` redirects to the interactive app.

## Required files for the editor

- `vc-data.js`
- `data/value-chain.json`
- `fss-consumer-data-model-interactive/*.png` (reference slides)

## Publish value-chain edits

1. Open the app on GitHub Pages
2. Edit value chain -> Export JSON
3. Replace `data/value-chain.json`
4. Run `node scripts/embed-value-chain.mjs`
5. Commit and push