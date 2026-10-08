/**
 * Module switcher (bento) — open/close + navigation between prototype screens.
 */
(function () {
  const MODULE_ROUTES = {
    Management: 'webhooks/',
    Settings: 'settings/alerts/',
  };

  function moduleHref(module) {
    const route = MODULE_ROUTES[module];
    if (!route) return null;
    const path = window.location.pathname;
    if (path.includes('/settings/')) return '../../' + route;
    if (path.includes('/webhooks/')) return '../' + route;
    return route;
  }

  function initBentoMenu() {
    const btn = document.getElementById('btn-bento');
    const menu = document.getElementById('bento-menu');
    if (!btn || !menu) return;

    function openBento() {
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
    }

    function closeBento() {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (menu.hidden) openBento();
      else closeBento();
    });

    menu.addEventListener('click', (e) => {
      const item = e.target.closest('.bento-menu-item');
      if (!item) return;
      e.stopPropagation();
      const module = item.getAttribute('data-module');
      const href = moduleHref(module);
      if (href) {
        window.location.href = href;
        return;
      }
      closeBento();
    });

    document.addEventListener('click', () => {
      if (!menu.hidden) closeBento();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBentoMenu);
  } else {
    initBentoMenu();
  }
})();
