# Agent guide — ekara-ui-prototype

## Read first

1. `docs/product-context.md`
2. `docs/prototype-principles.md`
3. `docs/design-system.md`
4. `docs/prototype-coverage.md`

## How to work

- Collaborate with the owner in French; UI copy in English
- Discuss before implementing; implement only when explicitly asked
- Use `tokens.css` / `ekara.css`; no hardcoded colors
- Push to `main`; bump asset `?v=` after CSS/JS changes
- Keep docs factual; do not invent product behaviour

## Adding a screen

- Own folder per screen (e.g. `/webhooks/`)
- Match the correct module shell (breadcrumb + sidebar)
- Register in `docs/prototype-coverage.md`
