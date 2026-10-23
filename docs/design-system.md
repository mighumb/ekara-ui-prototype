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

**Palette families:** Neutrals (`--color-n*`), Greens (`--color-g*`), Teals (`--color-t*`), Blues (`--color-b*`), Reds (`--color-r*`), Oranges (`--color-o*`), Yellows (`--color-y*`), Lavenders (`--color-l*`), Violets (`--color-v*`), Pinks (`--color-p*`).

**Semantic layers** (in `tokens.css`):
- Text: `--text-neutral` (N900, default body/headings), `--text-secondary`, `--text-muted`, `--text-on-primary` (on B500 surfaces)
- Surfaces: `--surface-default`, `--surface-muted`, `--surface-hover-neutral`, `--surface-hover-action`, `--content-bg`, `--card-bg`
- Borders: `--border-color` → N30, `--input-border-color` → N60
- Shadows: `--shadow-dropdown`, `--shadow-panel`, `--shadow-dialog`

**Blues** — primary actions use **B500** via `--primary`. Action-button hovers use **B50** via `--surface-hover-action`.

| Semantic token | Maps to |
|----------------|---------|
| `--primary` | `var(--color-b500)` — brand: filled buttons, active toggles, links, input focus |
| `--text-neutral` | `var(--color-n900)` — default text (body, page titles, table cells) |
| `--primary-hover` | `var(--color-b600)` |
| `--primary-light` | `var(--color-b400)` — sidebar active border |
| `--surface-hover-action` | `var(--color-b50)` — hover on action buttons (Cancel, outline, close) |
| `--surface-hover-neutral` | `var(--color-n10)` — hover on passive surfaces (tabs, table rows, dropdown items) |
| `--border-color` | `var(--color-n30)` — dividers, table borders |
| `--input-border-color` | `var(--color-n60)` — input/select at rest |
| `--text-placeholder` | `var(--color-n100)` — input/textarea placeholder |
| `--danger` | `var(--color-r600)` — delete button, errors |
| `--danger-hover` | `var(--color-r700)` |

Current prototype usage: `--label-color` → `var(--color-n900)` for `form-label`.

## Components (reuse classes + tokens)

| Component | Class | Key tokens |
|-----------|-------|------------|
| Primary button | `.btn-primary` | `--primary` / `--primary-hover` |
| Outline button | `.btn-outline` | `--primary` border & text; hover `--surface-hover-action` |
| Text button | `.btn-text` | `--primary` text; hover `--surface-hover-action` |
| Danger button | `.btn-danger` | `--danger` / `--danger-hover` |
| Toggle | `.toggle` | off `--toggle-track-off`, on `--toggle-track-on` (B500) |
| Text input | `.form-input`, `.form-textarea` | border `--input-border-color`; focus `--input-focus-border`; disabled `--input-disabled-*` (no hover; `cursor: not-allowed`, not pointer) |
| Read-only field (no dropdown) | `.form-input.form-input--disabled-static` | Disabled input tokens (e.g. global Applications scope) |
| Date range | `.ekara-date-range-picker` + `ekara-date-range-picker.js` | Display format **`DD/MM/YYYY - DD/MM/YYYY`** (same on every page); presets + dual month grid; range `--date-range-selection-bg`, endpoints `--primary` / `--text-on-primary`; include script after `ekara.css` |
| Dropdown / select | `[data-ekara-inline-select]` + `ekara-inline-select.js` | DS listbox only — no visible native `<select>` popup. Hidden `<select>` holds value. **Measures:** `.measure-filter-inline`. **Forms:** `.form-select-wrap` + `.form-select`. Dynamic rows: `EkaraInlineSelect.wrapFormSelect(select)`. When the hidden `<select>` is `disabled`, no hover chrome and no pointer cursor on the trigger. |
| Chip picker field | `.ekara-picker-field` + `.ekara-picker-chevron` | Multi-select / menu triggers (Settings recipients & applications, Measures trackers). Same border/focus as inputs; chips use `.ekara-chip*`. |
| Day filter pills | `.day-pill` / `.day-pill-group` | Alert schedule days; active uses primary tokens |
| Channel choice | `.channel-option` in `.channel-options` | Alert drawer radios (stacked layout: `--stacked`) |
| Link | `a` | `--link-color` |
| Tooltip | `[data-tooltip]` on host; floating `.ekara-tooltip` (see `tooltip.js`) | `--tooltip-*` |
| Chip (tag) | `.ekara-chip`, `.ekara-chip-label`, `.ekara-chip-remove` | `--surface-hover-neutral`, `--border-color`, `--text-neutral`; remove hover `--surface-hover-action` |
| Sortable table header | `.data-table-header-sort` inside `.data-table-header-cell`; chevron `.data-table-header-sort-icon` only when `.is-sorted` (Option B — no icon until column clicked) | `--select-chevron-svg` |
| List table (viewport scroll) | `main.main-content--list-table` + `.data-table-viewport` + `.data-table--scroll` with `.data-table-body-scroll` wrapping `#*-table-body`; header stays fixed, body scrolls | `--data-table-cols` on `.data-table` / modifiers |
| Slide-in drawer | `.slide-panel` (+ optional `.slide-panel--narrow` for compact forms) | `--slide-panel-width` / `--slide-panel-width-narrow`; header, body, footer share `--slide-panel-padding`; footer actions `--slide-panel-actions-gap` |
| RUM threshold zone legend | `.rum-threshold-drawer-legend` (fixed strip between drawer header and scrollable body) | Reuses `.rum-threshold-bar-seg--*` swatches; separator `.section-divider` inside padded strip (no full-bleed border) |

**Tooltip** — include `tooltip.js` on every page that needs it. Do not use native `title`. Default placement: below host, centered (flip above if needed). For large or irregular hit targets (e.g. journey flow curves), set `data-tooltip-at="pointer"` to anchor above the cursor. For table cells with ellipsis, set `data-tooltip-full="…"` and call `EkaraTooltip.syncTruncated(tableBody)` after render (sets `data-tooltip` only when text overflows). Static controls can use `data-tooltip` directly.

**Module switcher (bento)** — `.bento-menu-wrap` in the topbar (far right). Toggle via `#btn-bento`; menu `.bento-menu` lists the six modules. Icons at rest: `--color-n400`; active module uses `.bento-menu-item.active` (`--surface-hover-action`, label + icon `--primary`). Hover on items: `--surface-hover-neutral`.

New pages/modals: use these classes — do not hardcode colors in HTML or per-page CSS.

**Module sidebar footer** — same line on every screen with a sidebar: `v3.43.0 © 2026 ip-label` (class `sidebar-footer`). Bump all pages when the product version changes.

**RUM user journey mapping** — Measures screen under `measures/explore/rum/user-journey-mapping/`; journey UI classes prefixed `rum-journey-*`; mock states via `?demo=empty` or tracker `Tracker_Empty_` / `Tracker_Error_`. **Path exploration** (GA Path exploration–like handoff): zone `.rum-journey-path-graph` (same white card surface as parent), columns **Step 1…N**, nodes `.rum-journey-node` with volume bar, SVG `.rum-journey-path-links` (stroke ∝ metric). **Filters (mock, realistic):** selected trackers are **summed** from per-tracker slices in `MOCK_TRACKER_JOURNEY`; date range **scales** volumes vs a 30-day baseline; **Metric** drives displayed numbers and path ranking; **Breakdown** shows aggregated device/browser for the selection (side card only). Node volumes are **derived from link totals** after merge. **Top 5** = five highest full journeys for the current filters; **Paths through** (focus) = up to five journeys that include the selected page group from the **full** merged path list (not only Top 5). Unlisted trackers use a small default share of the `agent` slice.

**Measures filter bar** — no `form-label` above fields; use `.measure-filter-inline` with `.measure-filter-prefix` inside the control (same pattern as RUM / RUM trends). Focus and open state: `--input-focus-border` on `.measure-filter-inline` (`:focus`, `:focus-within`, or child `[aria-expanded="true"]`) and on `.ekara-picker-field` / `.measure-tracker-field`. **Trackers** use `.measure-tracker-picker` with **`.measure-filter-prefix`** (`Trackers:`) plus **`.ekara-chip`** for selections; field shell **`.ekara-picker-field.measure-tracker-field`**; empty selection shows prefix only; dropdown row `Trackers (N)` with select-all (max **10**); × removes one tracker or clears all.

## Typography (Ekara DS)

- **Family:** Open Sans — `--font-family`
- **Weights:** `--font-weight-regular` (400), `--font-weight-semibold` (600), etc.
- **Scale (base 16px):** `--font-size-12` (12px) through `--font-size-48` (48px) — even px values only
- **Semantic:** `--font-size-body` (14px), `--sidebar-font-size` (14px), `--page-title-font-size` (20px), `--label-font-size` (12px)
- **Labels:** `--label-font-weight` → 400

Do not use off-scale sizes (e.g. 13px) — pick from the scale.

## Labels

- **Class:** `form-label` on every form/component label.
- **Tokens:** `--label-*` in `tokens.css`.
- Never hardcode label typography in page HTML or per-page CSS.

## Dynamic field rows (headers, mapping)

- Section label (`form-label`) then column labels (`field-column-labels`) — shown when the first row is added.
- Column label classes: `field-column-labels--header` (Key / Value), `field-column-labels--mapping` (Target key / Source / Value).
- `margin-top: 12px` on `field-column-labels` separates column labels from the section label.

## Webhook modal — service-specific sections

Visibility is driven by the **Service** dropdown (`updateServiceSections` in `webhooks.js`):

| Service | Sections shown |
|---------|----------------|
| **Custom** | Mapping (optional), Payload preview |
| **PagerDuty** | HTTP header (mandatory) — fixed `x-routing-key` + Value (`.mandatory-header-row`) |
| **Other** | Base form only (Name, Service, URL, OAuth, optional headers) |

**OAuth** — when the toggle is on, show Token Endpoint, Client ID, Client Secret, Scopes (all required on save). Values persist when toggled off. Field errors use `.form-error` under the input (`Name required`, `URL required`, `This field is required`).

- Hide service-specific blocks with `.service-section.hidden`.
- Form state (mappings, routing key) is preserved when switching services — only visibility changes.
- Mapping rows are reorderable via drag handle (`.mapping-drag-handle`) on the left; order drives payload preview key order.
- Mapping is optional as a section, but each added row must be complete on save (Target key + Value). Scenario tag with « Select a tag » is invalid.

## Pages

```html
<link rel="stylesheet" href="../assets/css/tokens.css?v=…">
<link rel="stylesheet" href="../assets/css/ekara.css?v=…">
```

After any shared CSS change, bump `assetVersion` in `assets/js/prototype-routes.js` and set the same `?v=` on `tokens.css` and `ekara.css` on **every HTML page** (`npm run check:assets`). Keep script `?v=` in sync when those files change.

**Navigation:** module URLs and the default entry live in `prototype-routes.js`; `bento.js` uses them so every screen stays on the same deployment when switching modules.

**Settings module sidebar:** one definition in `assets/js/settings-sidebar.js`. Settings HTML pages mount it with `<aside class="sidebar" data-ekara-settings-sidebar></aside>` and set `data-settings-screen` on `<body>` (`alerts` | `trackers`). Include `settings-sidebar.js` after `prototype-routes.js`.

**Management module sidebar:** `assets/js/management-sidebar.js` — `data-ekara-management-sidebar` + `data-management-screen` (`webhooks` | `sso` | `groups`).

**Settings sidebar cross-links:** any clickable sub-item in the dark sidebar must use `sidebar-item sidebar-subitem sidebar-subitem-link` (including the current page with `active` + `href="./"`). Plain `<a>` without that class inherits body/link colors and becomes unreadable on `--sidebar-bg`.

**Sidebar group rows** — wrap icon + label in `.sidebar-group-label` (no inline flex styles).

**Typography** — use `--font-size-*` / semantic sizes only in `ekara.css` (no raw `13px`). Palette steps (`--color-b100`, etc.) belong in `tokens.css` as semantic aliases (e.g. `--date-range-selection-bg`), not directly in component rules.

## Maintenance (agent)

Documentation in this repo is maintained by the agent when implementing US — not by the product owner.

When adding or changing tokens, components, or patterns:

1. Put values in `tokens.css` (or `ekara.css` for component rules).
2. Update this file with **usage** only if a new pattern needs to be reused on future pages (class names, when to use, what not to do).
3. Do not duplicate literal values (px, hex) in markdown — they go stale.

Future token groups (buttons, inputs, tables, etc.) follow the same rule: values in `tokens.css`, usage notes here when introduced.
