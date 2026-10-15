/**
 * Module switcher (bento) — open/close + navigation between prototype screens.
 */
(function () {
  const MODULE_ROUTES = {
    Measures: 'measures/explore/rum/user-journey-mapping/',
    Management: 'webhooks/',
    Settings: 'settings/alerts/',
  };

  function prototypeRootPrefix() {
    const path = window.location.pathname;
    if (path.includes('/settings/alerts')) return '../../';
    if (path.includes('/measures/explore/rum/user-journey-mapping')) return '../../../../';
    if (path.includes('/webhooks/')) return '../';
    return '';
  }

  function moduleHref(module) {
    const route = MODULE_ROUTES[module];
    if (!route) return null;
    return prototypeRootPrefix() + route;
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
