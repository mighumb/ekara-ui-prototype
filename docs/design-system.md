# Ekara UI Prototype — Design system

Conventions and usage for shared UI. **Not** a duplicate of token values.

## Source of truth

| What | Where |
|------|-------|
| Token values (colors, sizes, spacing) | [`assets/css/tokens.css`](../assets/css/tokens.css) |
| Component styles (layout, forms, tables) | [`assets/css/ekara.css`](../assets/css/ekara.css) |

When you change a visual value, edit **`tokens.css` only**. Do not copy values into this doc or into page-specific CSS.

## Adding new tokens

1. Add the custom property in `tokens.css`, grouped by category (colors, labels, buttons, etc.).
2. Reference it from `ekara.css` or page styles via `var(--token-name)`.
3. If needed, add a short **usage** note below (class name, when to use) — not the literal value.

## Labels

- **Class:** `form-label` on every form/component label (Name, Service, HTTP Header, Mapping, etc.).
- **Tokens:** `--label-*` in `tokens.css`.
- **Do not** set `font-size`, `color`, or `font-weight` on labels in page HTML or per-page CSS.

## Pages

Each US adds a folder under the repo root (e.g. `/webhooks/`). Pages link shared assets:

```html
<link rel="stylesheet" href="../assets/css/ekara.css">
```

Bump the `?v=` query param on the stylesheet when you need to bust browser cache after a deploy.

## Future token groups

As the prototype grows, extend `tokens.css` with new sections (e.g. buttons, inputs, tables). Keep one file until it becomes unwieldy; split into `tokens-colors.css`, etc. only if necessary.
