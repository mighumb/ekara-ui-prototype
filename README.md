# Ekara UI Prototype

Interactive HTML prototype of the Ekara product UI.
Built incrementally for UX validation and dev handoff.

**Live preview:** https://mighumb.github.io/ekara-ui-prototype/

## Pages

| Page | Path | JIRA |
|------|------|------|
| Webhooks (Management > Integrations) | [/webhooks/](https://mighumb.github.io/ekara-ui-prototype/webhooks/) | [DFY-23383](https://iplabel.atlassian.net/browse/DFY-23383) |

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
