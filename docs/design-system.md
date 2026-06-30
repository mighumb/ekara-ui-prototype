# Ekara UI Prototype — Design system

Conventions for shared UI. Token **values** live in CSS only — not duplicated here.

## Source of truth

| What | Where |
|------|-------|
| Token values | [`assets/css/tokens.css`](../assets/css/tokens.css) |
| Component styles | [`assets/css/ekara.css`](../assets/css/ekara.css) |

Change a color, size, or weight → edit `tokens.css`. Nothing else required from the product owner.

## Colors (Ekara DS)

All **values** live in `tokens.css` only. `ekara.css` references semantic tokens — no hardcoded hex/rgba.

**Palette families:** Neutrals (`--color-n*`), Greens (`--color-g*`), Teals (`--color-t*`), Blues (`--color-b*`), Reds (`--color-r*`), Oranges (`--color-o*`), Yellows (`--color-y*`).

**Semantic layers** (in `tokens.css`):
- Text: `--text-primary`, `--text-secondary`, `--text-muted`, `--text-on-primary`
- Surfaces: `--surface-default`, `--surface-muted`, `--surface-hover`, `--content-bg`, `--card-bg`
- Borders: `--border-color` → N30, `--input-border-color` → N60
- Shadows: `--shadow-dropdown`, `--shadow-panel`, `--shadow-dialog`

**Blues** — primary actions use **B500** via `--primary`. Light hover surfaces use **B50** via `--surface-hover-light`.

| Semantic token | Maps to |
|----------------|---------|
| `--primary` | `var(--color-b500)` — filled primary buttons, active toggles, links, input focus |
| `--primary-hover` | `var(--color-b600)` |
| `--primary-light` | `var(--color-b400)` — sidebar active border |
| `--surface-hover-light` | `var(--color-b50)` — hover on outline/text buttons |
| `--border-color` | `var(--color-n30)` — dividers, table borders, mode-toggle outer border |
| `--mode-toggle-divider` | `var(--color-n20)` — separator between Mapping / Custom JSON tabs |
| `--input-border-color` | `var(--color-n60)` — input/select at rest |
| `--text-placeholder` | `var(--color-n100)` — input/textarea placeholder |
| `--danger` | `var(--color-r600)` — delete button, errors |
| `--danger-hover` | `var(--color-r700)` |

Current prototype usage: `--label-color` → `var(--color-n900)` for `form-label`.

## Components (reuse classes + tokens)

| Component | Class | Key tokens |
|-----------|-------|------------|
| Primary button | `.btn-primary` | `--primary` / `--primary-hover` |
| Outline button | `.btn-outline` | `--primary` border & text; hover `--surface-hover-light` |
| Text button | `.btn-text` | `--primary` text; hover `--surface-hover-light` |
| Danger button | `.btn-danger` | `--danger` / `--danger-hover` |
| Toggle | `.toggle` | off `--toggle-track-off`, on `--toggle-track-on` (B500) |
| Text input / select | `.form-input`, `.form-select` | border `--input-border-color`; focus `--input-focus-border` |
| Mode toggle (active) | `.mode-toggle-btn.active` | `--primary` |
| Link | `a` | `--link-color` |

New pages/modals: use these classes — do not hardcode colors in HTML or per-page CSS.

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
