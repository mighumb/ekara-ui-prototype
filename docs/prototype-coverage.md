# Prototype coverage

Screens built in this repository, grouped by module.
Only implemented screens are listed.

## Management

| Page | Path | JIRA |
|------|------|------|
| Webhooks (Integrations) | [/webhooks/](https://mighumb.github.io/ekara-ui-prototype/webhooks/) | [DFY-23383](https://iplabel.atlassian.net/browse/DFY-23383) — list CRUD, service sections, `localStorage` mock (`ekara-prototype-webhooks`) |

## Measures

| Page | Path | JIRA |
|------|------|------|
| RUM user journey mapping | [/measures/explore/rum/user-journey-mapping/](https://mighumb.github.io/ekara-ui-prototype/measures/explore/rum/user-journey-mapping/) | [DFY-21875](https://iplabel.atlassian.net/browse/DFY-21875) / [DFY-23088](https://iplabel.atlassian.net/browse/DFY-23088) — path exploration mock (`?demo=empty`, `?demo=error` for states) |

## Infrastructure

*(none yet)*

## Settings

| Page | Path | JIRA |
|------|------|------|
| Alert rules | [/settings/alerts/](https://mighumb.github.io/ekara-ui-prototype/settings/alerts/) | [DFY-23972](https://iplabel.atlassian.net/browse/DFY-23972) — minimum gap (drawer), sortable table columns (session), `localStorage` mock (`ekara-prototype-alert-rules`) |
| RUM Trackers | [/settings/rum/trackers/](https://mighumb.github.io/ekara-ui-prototype/settings/rum/trackers/) | [DFY-23522](https://iplabel.atlassian.net/browse/DFY-23522) — multi-metric RUM threshold drawer (`+ Add a metric`, no duplicate metrics), per-metric official defaults and read-only fields in `METRIC_THRESHOLD_PRESETS` (`assets/js/rum-trackers.js`, validated at load + E2E), `localStorage` mock (`ekara-prototype-rum-tracker-thresholds`) |

## Ekara Green

*(none yet)*

## Incident Guard

*(none yet)*
