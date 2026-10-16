# Ekara UI Prototype

Interactive HTML/CSS/JS prototype of the Ekara product UI.
Used to review layout, component behaviour, and UX flows, then hand off to engineering.

**Live preview:** https://mighumb.github.io/ekara-ui-prototype/

## Context

- [Product context](docs/product-context.md)
- [Prototype principles](docs/prototype-principles.md)
- [Design system](docs/design-system.md)
- [Prototype coverage](docs/prototype-coverage.md)
- [Agent guide](AGENTS.md)

## Live preview — how updates work

| Step | What happens |
|------|----------------|
| 1. Commit + `git push origin main` | Changes land on GitHub |
| 2. GitHub Pages rebuild | ~1–3 minutes |
| 3. Browser | May cache CSS/JS — hard refresh or bump `?v=` on assets |

Saving a file locally does not update the live URL. Production updates when changes are **merged to `main`** and the **Deploy Pages** workflow publishes to `gh-pages` (see below).

## Preview a pull request before merge

Workflow **Deploy Pages** pushes each PR to `gh-pages` under `previews/pr-<number>/`.

1. **One-time (repo admin):** **Settings** → **Pages** → **Build and deployment** → **Deploy from a branch** → branch **`gh-pages`**, folder **`/` (root)**.  
   (While Pages still points at `main`, preview URLs under `gh-pages` are not served.)
2. Open the PR → wait for green **Deploy Pages** → use the preview URL in the bot comment (only screens touched in that PR). Example for a Trackers PR:  
   `https://mighumb.github.io/ekara-ui-prototype/previews/pr-6/settings/rum/trackers/`
3. After merge to `main`, the workflow updates the site root on `gh-pages` (preview folders are kept).

Asset cache-bust query params (`ekara.css?v=…`, `webhooks.js?v=…`) are bumped on each deploy-worthy change so the live page loads fresh files.

## Automated browser tests (Playwright)

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

Starts a local static server on port 3456 and runs E2E specs in `tests/e2e/` (`alerts.spec.js`, `webhooks.spec.js`, `rum-journey.spec.js`). The same suite runs on **pull requests and pushes to `main`** via the [E2E tests](.github/workflows/e2e.yml) workflow.

### Prototype data in the browser (`localStorage`)

Only some screens **persist edits** in the browser so you can rehearse CRUD without a backend. Other screens (e.g. RUM user journey mapping) use **in-memory mock data** — a refresh resets them.

| `localStorage` key | Screen |
|--------------------|--------|
| `ekara-prototype-alert-rules` | Settings → Alert rules |
| `ekara-prototype-webhooks` | Webhooks |

Remove a key (or clear site data) to reset that screen to its seeded defaults. Keys are documented in `docs/prototype-coverage.md` per screen.

## Structure

```
/assets/css/tokens.css   Design tokens (values)
/assets/css/ekara.css    Shared component styles
/assets/js/              Shared scripts
/docs/                   Context, principles, design system, coverage
/webhooks/               Webhooks page
```
