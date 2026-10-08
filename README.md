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

Saving a file locally does not update the live URL. Only push to `main` does (legacy Pages from `main`, until Actions-based deploy is enabled).

## Preview a pull request before merge

To test a branch on the real hosted site **without merging to `main`**:

1. **One-time (repo admin):** GitHub → **Settings** → **Pages** → **Build and deployment** → **Source:** **GitHub Actions** (not “Deploy from branch `main`”).
2. Open the PR → tab **Checks** → workflow **Deploy Pages** → when green, click **View deployment** (or read the bot comment with the preview URL).
3. Useful entry points on the preview host:
   - `…/settings/alerts/` — Settings alert rules
   - `…/webhooks/` — Management webhooks

Each push to the PR branch refreshes the preview. Merging to `main` updates production.

Asset cache-bust query params (`ekara.css?v=…`, `webhooks.js?v=…`) are bumped on each deploy-worthy change so the live page loads fresh files.

## Structure

```
/assets/css/tokens.css   Design tokens (values)
/assets/css/ekara.css    Shared component styles
/assets/js/              Shared scripts
/docs/                   Context, principles, design system, coverage
/webhooks/               Webhooks page
```
