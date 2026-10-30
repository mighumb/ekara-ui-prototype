/**
 * Ekara design-system tooltips — replaces native `title` with token-styled tooltips.
 * Usage: data-tooltip="Full text" on any element (or legacy title=, migrated on init).
 */
(function () {
  const ATTR = 'data-tooltip';
  const SHOW_DELAY_MS = 350;

  const POINTER_ATTR = 'data-tooltip-at';
  const POINTER_VALUE = 'pointer';

  let tipEl = null;
  let activeTarget = null;
  let showTimer = null;
  let lastPointer = { x: 0, y: 0 };

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

  /** Table cells: data-tooltip-full → data-tooltip only when text is truncated (ellipsis). */
  function syncTruncatedTooltips(root) {
    root.querySelectorAll('[data-tooltip-full]').forEach((el) => {
      el.removeAttribute('title');
      const full = el.getAttribute('data-tooltip-full');
      if (!full) {
        el.removeAttribute('data-tooltip');
        return;
      }
      if (el.scrollWidth > el.clientWidth + 1) {
        el.setAttribute('data-tooltip', full);
      } else {
        el.removeAttribute('data-tooltip');
      }
    });
    migrateAll(root);
  }

  function usesPointerAnchor(target) {
    return target.getAttribute(POINTER_ATTR) === POINTER_VALUE;
  }

  function positionAtPointer(tip, tipRect, gap) {
    let top = lastPointer.y - tipRect.height - gap;
    let left = lastPointer.x - tipRect.width / 2;

    if (top < 8) {
      top = lastPointer.y + gap;
    }

    left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - tipRect.height - 8));

    tip.style.top = `${top}px`;
    tip.style.left = `${left}px`;
  }

  function position(target) {
    const tip = ensureTip();
    if (tip.hidden) return;

    const tipRect = tip.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tooltip-offset')) || 6;

    if (usesPointerAnchor(target)) {
      positionAtPointer(tip, tipRect, gap);
      return;
    }

    const rect = target.getBoundingClientRect();

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

  function onPointerMove(e) {
    lastPointer.x = e.clientX;
    lastPointer.y = e.clientY;
    if (activeTarget && usesPointerAnchor(activeTarget) && tipEl && !tipEl.hidden) {
      position(activeTarget);
    }
  }

  function onPointerOver(e) {
    lastPointer.x = e.clientX;
    lastPointer.y = e.clientY;
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

  document.addEventListener('mousemove', onPointerMove);
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

  function boot() {
    migrateAll(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.EkaraTooltip = {
    refresh(root = document) {
      migrateAll(root);
    },
    syncTruncated(root = document) {
      syncTruncatedTooltips(root);
    },
  };
})();
