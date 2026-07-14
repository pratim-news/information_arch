# Consumer 2.0 interactive data model

Static site for the FSS Consumer 2.0 / Information Architecture explorer.

## GitHub Pages

Enable: **Settings -> Pages -> Deploy from a branch -> `main` / `/ (root)`**

Site URL (once Pages is on):

- https://pratim-news.github.io/information_arch/
- https://pratim-news.github.io/information_arch/fss-consumer-data-model-interactive.html
- Portable single file: https://pratim-news.github.io/information_arch/fss-consumer-data-model-interactive-portable.html

## Files served

| Path | Role |
|------|------|
| `index.html` | Static app (same as interactive HTML) |
| `vc-data.js` | In-page value-chain editor |
| `data/value-chain.json` | Published value-chain data |
| `fss-consumer-data-model-interactive/*.png` | Reference slides |
| `fss-consumer-data-model-interactive-portable.html` | Offline single-file copy |

No build step. No server runtime. Open over HTTPS via GitHub Pages (or any static host).