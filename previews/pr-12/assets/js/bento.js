/**
 * Module switcher (bento) — navigation between prototype screens (see prototype-routes.js).
 */
(function () {
  function initBentoMenu() {
    const routes = window.EkaraPrototypeRoutes;
    const btn = document.getElementById('btn-bento');
    const menu = document.getElementById('bento-menu');
    if (!btn || !menu || !routes) return;

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
      const href = routes.moduleHref(module);
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
