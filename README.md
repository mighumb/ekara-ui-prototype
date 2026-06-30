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
/assets/css/ekara.css   Shared styles + design tokens (:root)
/assets/js/             Shared scripts
/webhooks/              Webhooks page (DFY-23383)
```

## Design tokens — labels

All form/component labels use `class="form-label"` and the `--label-*` tokens in `assets/css/ekara.css` (`:root`). Do not hardcode label color or size per page.

| Token | Value |
|-------|-------|
| `--label-font-size` | 12px |
| `--label-font-weight` | 600 |
| `--label-color` | `var(--primary)` (#2d5a8e) |
| `--label-letter-spacing` | 0.4px |

Not production code.
