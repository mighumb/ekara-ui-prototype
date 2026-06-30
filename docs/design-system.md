# Ekara UI Prototype — Design system

Conventions for shared UI. Token **values** live in CSS only — not duplicated here.

## Source of truth

| What | Where |
|------|-------|
| Token values | [`assets/css/tokens.css`](../assets/css/tokens.css) |
| Component styles | [`assets/css/ekara.css`](../assets/css/ekara.css) |

Change a color, size, or weight → edit `tokens.css`. Nothing else required from the product owner.

## Colors (Ekara DS)

**Neutrals** — token prefix `--color-n{step}` (N900 darkest → N0 Coconut). Values only in `tokens.css`.

| Sub-family | Range |
|------------|-------|
| Dark | N900–N500 |
| Mid | N400–N60 |
| Light | N50–N0 |

**Greens** — `--color-g{step}` (G900 → G100).

**Teals** — `--color-t{step}` (T900 → T100).

**Blues** — `--color-b{step}` (B900 → B100). Primary actions use **B500** (`#195190`, Turkish sea).

| Semantic token | Maps to |
|----------------|---------|
| `--primary` | `var(--color-b500)` — filled primary buttons (`.btn-primary`, active mode toggle) |
| `--primary-hover` | `var(--color-b600)` |
| `--primary-light` | `var(--color-b400)` — links, text buttons, focus rings, toggles |

Current prototype usage: `--label-color` → `var(--color-n900)` for `form-label`.

## Typography (Ekara DS)

- **Family:** Open Sans — loaded via Google Fonts in page `<head>`, token `--font-family`.
- **Weights:** `--font-weight-regular` (400), `--font-weight-semibold` (600), etc. in `tokens.css`.
- **Labels:** `--label-font-weight` → `var(--font-weight-regular)` (400).

## Labels

- **Class:** `form-label` on every form/component label.
- **Tokens:** `--label-*` in `tokens.css`.
- Never hardcode label typography in page HTML or per-page CSS.

## Dynamic field rows (headers, mapping)

- Section label (`form-label`) then column labels (`field-column-labels`) — shown when the first row is added.
- Column label classes: `field-column-labels--header` (Key / Value), `field-column-labels--mapping` (Target key / Source / Value).
- `margin-top: 12px` on `field-column-labels` separates column labels from the section label.

## Pages

```html
<link rel="stylesheet" href="../assets/css/tokens.css?v=…">
<link rel="stylesheet" href="../assets/css/ekara.css?v=…">
```

Bump `?v=` on **both** files after deploy (tokens + ekara) so the browser does not serve a stale `tokens.css` via cache.

## Maintenance (agent)

Documentation in this repo is maintained by the agent when implementing US — not by the product owner.

When adding or changing tokens, components, or patterns:

1. Put values in `tokens.css` (or `ekara.css` for component rules).
2. Update this file with **usage** only if a new pattern needs to be reused on future pages (class names, when to use, what not to do).
3. Do not duplicate literal values (px, hex) in markdown — they go stale.

Future token groups (buttons, inputs, tables, etc.) follow the same rule: values in `tokens.css`, usage notes here when introduced.
