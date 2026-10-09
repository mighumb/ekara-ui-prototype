# Prototype principles

## Purpose

This repo is an interactive HTML/CSS/JS prototype of the Ekara UI.
It is used to review layout, component behaviour, and UX flows in the browser,
then hand off to engineering.

## Stack

- HTML pages per screen
- Shared styles: `tokens.css` (values), `ekara.css` (components)
- Shared scripts under `assets/js/`
- Mock data in JS when needed

## Working agreements

- UI copy in English; collaboration with the owner in French
- Discuss behaviour and structure before implementing; implement only when explicitly asked
- Prefer existing tokens and components; extend `tokens.css` / `ekara.css` when needed
- Keep documentation positive and factual; avoid inventing product behaviour

## Preview

- Push to `main` publishes the GitHub Pages live preview
- After CSS/JS changes, bump `?v=` on linked assets so the preview loads fresh files

## Coverage

Screens already built are listed in `docs/prototype-coverage.md`, grouped by module.
