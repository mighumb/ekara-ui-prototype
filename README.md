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

Saving a file locally does not update the live URL. Only push to `main` does.

Asset cache-bust query params (`ekara.css?v=…`, `webhooks.js?v=…`) are bumped on each deploy-worthy change so the live page loads fresh files.

## Structure

```
/assets/css/tokens.css   Design tokens (values)
/assets/css/ekara.css    Shared component styles
/assets/js/              Shared scripts
/docs/                   Context, principles, design system, coverage
/webhooks/               Webhooks page
```
