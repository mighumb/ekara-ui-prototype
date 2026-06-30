# Ekara UI Prototype

Interactive HTML prototype of the Ekara product UI.
Built incrementally for UX validation and dev handoff.

**Live preview:** https://mighumb.github.io/ekara-ui-prototype/

## Pages

| Page | Path | JIRA |
|------|------|------|
| Webhooks (Management > Integrations) | [/webhooks/](https://mighumb.github.io/ekara-ui-prototype/webhooks/) | [DFY-23383](https://iplabel.atlassian.net/browse/DFY-23383) |

## Live preview — how updates work

| Step | What happens |
|------|----------------|
| 1. Commit + `git push origin main` | Changes leave the editor and land on GitHub |
| 2. GitHub Pages rebuild | ~1–3 minutes (Actions → `pages build and deployment`) |
| 3. Browser | May still serve **cached** CSS/JS — use **Ctrl+Shift+R** or open with `?v=` on assets |

Saving a file locally (**Ctrl+S**) does **not** update the live URL. Only **push to `main`** does.

Asset cache-bust query params (`ekara.css?v=…`, `webhooks.js?v=…`) are bumped on each deploy-worthy change so the live page loads fresh files.

**Check live HTML:** https://mighumb.github.io/ekara-ui-prototype/webhooks/ — View Source should match the latest commit on `main`.

## Structure

```
/assets/css/tokens.css   Design tokens (values — source of truth)
/assets/css/ekara.css    Shared component styles
/assets/js/              Shared scripts
/docs/design-system.md   Conventions & usage (not token values)
/webhooks/               Webhooks page (DFY-23383)
```

**Design system:** [docs/design-system.md](docs/design-system.md) (maintained by agent; values in `tokens.css` only).

Not production code.
