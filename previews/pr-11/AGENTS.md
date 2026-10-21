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
- **Git:** work on `cursor/<topic>-f787`, push the branch, open a **draft PR** to `main` — the owner merges; do **not** push feature work directly to `main`
- Bump asset `?v=` after CSS/JS changes (on the PR branch)
- Keep docs factual; do not invent product behaviour

## Adding a screen

- Own folder per screen (e.g. `/webhooks/`)
- Match the correct module shell (breadcrumb + sidebar)
- Register in `docs/prototype-coverage.md`
