/**
 * Ekara design-system tooltips — replaces native `title` with token-styled tooltips.
 * Usage: data-tooltip="Full text" on any element (or legacy title=, migrated on init).
 */
(function () {
  const ATTR = 'data-tooltip';
  const SHOW_DELAY_MS = 350;

  let tipEl = null;
  let activeTarget = null;
  let showTimer = null;

  function ensureTip() {
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.className = 'ekara-tooltip';
      tipEl.setAttribute('role', 'tooltip');
      tipEl.hidden = true;
      document.body.appendChild(tipEl);
    }
    return tipEl;
  }

  function migrateTitle(el) {
    const title = el.getAttribute('title');
    if (!title || el.hasAttribute(ATTR)) return;
    el.setAttribute(ATTR, title);
    el.removeAttribute('title');
  }

  function migrateAll(root) {
    root.querySelectorAll('[title]').forEach(migrateTitle);
  }

  function position(target) {
    const tip = ensureTip();
    if (tip.hidden) return;

    const rect = target.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tooltip-offset')) || 6;

    let top = rect.bottom + gap;
    let left = rect.left + rect.width / 2 - tipRect.width / 2;

    if (top + tipRect.height > window.innerHeight - 8) {
      top = rect.top - tipRect.height - gap;
    }
    if (top < 8) {
      top = rect.bottom + gap;
    }

    left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));

    tip.style.top = `${top}px`;
    tip.style.left = `${left}px`;
  }

  function hideImmediate() {
    clearTimeout(showTimer);
    showTimer = null;
    if (!tipEl) return;
    tipEl.classList.remove('is-visible');
    tipEl.hidden = true;
    if (activeTarget) {
      activeTarget.removeAttribute('aria-describedby');
      activeTarget = null;
    }
  }

  function show(target) {
    const text = target.getAttribute(ATTR);
    if (!text) return;

    if (activeTarget && activeTarget !== target) {
      hideImmediate();
    }

    activeTarget = target;
    clearTimeout(showTimer);

    showTimer = setTimeout(() => {
      if (activeTarget !== target) return;

      const tip = ensureTip();
      tip.textContent = text;
      const tipId = 'ekara-tooltip-active';
      tip.id = tipId;
      target.setAttribute('aria-describedby', tipId);

      tip.hidden = false;
      tip.classList.add('is-visible');
      position(target);
      requestAnimationFrame(() => position(target));
    }, SHOW_DELAY_MS);
  }

  function hide(target) {
    if (target && activeTarget && target !== activeTarget) return;
    clearTimeout(showTimer);
    showTimer = null;
    hideImmediate();
  }

  function onPointerOver(e) {
    const target = e.target.closest(`[${ATTR}]`);
    if (target) show(target);
  }

  function onPointerOut(e) {
    const target = e.target.closest(`[${ATTR}]`);
    if (!target) return;
    const related = e.relatedTarget;
    if (related && target.contains(related)) return;
    hide(target);
  }

  document.addEventListener('mouseover', onPointerOver);
  document.addEventListener('mouseout', onPointerOut);
  document.addEventListener('focusin', (e) => {
    const target = e.target.closest(`[${ATTR}]`);
    if (target) show(target);
  });
  document.addEventListener('focusout', (e) => {
    const target = e.target.closest(`[${ATTR}]`);
    if (target) hide(target);
  });
  document.addEventListener('scroll', hideImmediate, true);
  window.addEventListener('resize', hideImmediate);

  document.addEventListener('DOMContentLoaded', () => migrateAll(document));

  window.EkaraTooltip = {
    refresh(root = document) {
      migrateAll(root);
    },
  };
})();
