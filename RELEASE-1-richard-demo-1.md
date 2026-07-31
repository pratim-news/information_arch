# Release 1 — Richard demo 1

- **Codename:** `release-1-richard-demo-1`
- **Baseline date:** 2026-08-01
- **Verdict:** **PASS WITH WARNINGS** — demo-ready for the public five-layer walkthrough
- **Prior reconcile:** [REVIEW-2026-07-26.md](./REVIEW-2026-07-26.md)

## Purpose

Frozen baseline of the Consumer 2.0 Information Architecture interactive app for the first Richard demo. Changes after this date are post-Release-1 unless explicitly backported.

## Live URLs

| Audience | Repo | Commit (short) | URL |
|----------|------|----------------|-----|
| Public sandbox | `pratim-news/information_arch` | `89144b5` | https://pratim-news.github.io/information_arch/ |
| NCA internal | `newscorpaus/fss-ia` | `6b2ce19` | https://ubiquitous-adventure-5wl58go.pages.github.io/ |

Git tags (both deploy repos): `release-1-richard-demo-1` (app HTML bytes unchanged from panel-fix era; docs commits added the freeze note).

## Canonical source (wiki working copy)

`outcome/InformationArch/`

| Asset | Role | SHA256 (first 12) | Bytes |
|-------|------|-------------------|-------|
| `fss-consumer-data-model-interactive.html` | Working interactive app | `D85930182D54` | 133369 |
| `fss-consumer-data-model-interactive-portable.html` | Portable handout | `6E6C2601B877` | 1151687 |
| `vc-data.js` | Value-chain editor helpers | `107F7D1D139A` | 26984 |
| `data/value-chain.json` | Published VC data | `0BE6739AE9FD` | 6253 |

Deploy clones `information_arch-deploy/` and `fss-ia-deploy/` (gitignored) match these hashes for the same files. Pages root uses `index.html` = interactive HTML.

## In scope (public demo)

1. **Value chain** — Attract..Leave; Functions x Journey; capability / business-object cells
2. **Data Model 2.0** — interactive ERD (orthogonal routing, crow-foot, spine/all, screenshot, arrange)
3. **Business Capabilities & Information Assets** — merged EIA overlay
4. **Platform overlay** — interactive ownership groups
5. **Data Master SoR/MC** — matrix with current SoR decisions

Also in public UX: collapsible left/right panels; cross-layer **"Appears across layers"** trail; Clear selection / Esc; deep-link `?layer=datamodel2`.

## Admin-only (not for open demo unless unlocked)

- Migration journey (nav marked `A`; unlock via Admin)
- Reference-slide PNG toggles
- Value-chain editor / draft / import / export

Admin gate password is client-side obscurity only (`1234` in source) — not access control.

## Key content decisions frozen in this baseline

1. Paywall / Zephr = decisioning & enforcement; **no** DM2 entity link
2. Entitlement = Zuora **ZEMS** SoR; Zephr enforces
3. **Payment Method** mastered in Zuora; Stripe = gateway only
4. **Customer Asset** = Zuora subscription representation (Subscriber VC cell maps here)
5. Swimlane **Zuora** (not "Future Subscription Platform")
6. **CRM Consumer FSS**; Marketing = Salesforce (SFMCA)
7. Migration hidden from default nav

## Review checks — OK

- Source and both deploy clones byte-identical for HTML / portable / vc-data / value-chain.json
- Embedded VC JSON matches `data/value-chain.json`
- ASCII-clean interactive HTML (`normalize-ascii-html.ps1 -CheckOnly`)
- Public nav = layers 1-5; Migration admin-only
- Panel collapse classes on `body`; toggles move to screen edges when collapsed
- Cross-layer trail covers VC, Capability, DM2.0, Platform, SoR/MC (+ Migration when unlocked)
- Naming consistent: Payment Method, Customer Asset, Entitlement (ZEMS), CRM Consumer FSS
- Reference PNGs present under `fss-consumer-data-model-interactive/`

## Warnings (accepted for Release 1)

1. Admin password visible in client JS — demo lock only
2. Portable HTML may still leave some Admin reference PNGs as relative paths for capability layer — avoid Admin reference slides in a standalone email of the portable file
3. Stripe VC display object still says "Payment" while entity is "Payment Method" (intentional leftover)
4. Some DM2 entities still absent from VC (Contact, Interaction, Rate Plan, Contract, etc.) — deferred
5. Stale `verify-fixes.mjs` assertions predate reconcile — do not treat as Release 1 failure
6. Workshop reference PNGs may show older labels; interactive overlays are authoritative

## Errors

None blocking Release 1 public demo.

## Demo script (suggested)

1. Open Value chain; explain Journey vs Function vs Capability vs Business Object
2. Select **Subscriber** — trail to Customer Asset + capability + DM2 + platform + SoR
3. Select **Payment Method** — Zuora SoR / Stripe gateway
4. Select **Entitlement** — ZEMS + Zephr enforce
5. Jump to Data Model 2.0 and SoR/MC as needed
6. Do **not** open Migration unless Richard asks and Admin is unlocked

## Out of scope / post-Release-1 backlog

- Rename Stripe VC object label away from "Payment"
- Place remaining DM2 entities on VC
- Harden Admin (server-side or remove password from client)
- Fully embed all Admin reference images in portable HTML
- Org policy for public Pages on private `fss-ia` (business users without GitHub login)

## How to restore this baseline

1. Check out tag `release-1-richard-demo-1` in either deploy clone, **or** copy the hashed files above from this folder as of 2026-08-01
2. Dual-deploy with `.cursor/skills/information-arch-dual-deploy/scripts/sync-both-repos.ps1` if republishing from working copy after drift

## Related wiki

- Analysis page: `wiki/analyses/information-arch-release-1-richard-demo-1.md`
- Index Outcomes entry updated 2026-08-01
