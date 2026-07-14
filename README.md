# InformationArch - Consumer 2.0 interactive model

Working copy of the interactive data model (original remains in `outcome/`).

## Quick start (view)

Open `fss-consumer-data-model-interactive.html` in a browser.

For the **in-page editor**, serve the folder over HTTP (GitHub Pages or a local static server). Opening via `file://` still shows the grid from the bundled JSON; the editor needs `vc-data.js`.

Deploy the **whole folder** for GitHub Pages:

- `fss-consumer-data-model-interactive.html`
- `vc-data.js`
- `data/value-chain.json`
- `fss-consumer-data-model-interactive/*.png`

## Edit value chain (admin)

At the **bottom** of layer 1 there is a small muted **Admin** link: **Edit value chain data**.

1. Serve this folder (or open on GitHub Pages)
2. Open layer **1 - Value chain**
3. Scroll to the bottom and open the admin editor
4. Pick a Function row; edit Journey stages or bands
5. Click **Apply to grid** to preview
6. **Export JSON** when ready to publish

## Persistence (GitHub Pages)

| Action | What it does | Who sees it |
|--------|----------------|-------------|
| **Apply and render** | Preview only (in memory) | You, this session |
| **Save draft (browser)** | Stores in localStorage on this device | You, this browser |
| **Export JSON** | Downloads `value-chain.json` | You (then commit to publish) |
| **Import JSON** | Loads a file into the editor | You |
| **Reload published** | Re-fetches `data/value-chain.json` | Resets to last committed publish |
| **Discard draft** | Clears localStorage draft | - |

The page **always loads published/bundled data by default**. A local draft is used only with `?draft=1`.

### Publish for everyone (GitHub Pages)

1. Edit in the browser
2. **Export JSON**
3. Replace `data/value-chain.json` with the exported file
4. Run `node scripts/embed-value-chain.mjs` to update the HTML bundled copy
5. Commit and push

### URL hints

- `?draft=1` - load browser draft instead of published
- `?layer=valuechain` - open layer 1

## Legacy CSV pipeline (optional)

CSV files under `data/` remain as an alternate bulk-edit path. Prefer the in-page editor or edit `data/value-chain.json` directly.

```powershell
node outcome/InformationArch/scripts/embed-value-chain.mjs
```

## Portable HTML

```powershell
.cursor/skills/ascii-html-assets/scripts/make-portable-html.ps1 -Path outcome/InformationArch/fss-consumer-data-model-interactive.html -Force
```
