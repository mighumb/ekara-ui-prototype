/**
 * Shared Management module sidebar (Webhooks, SSO, and future Integrations screens).
 * Mount: <aside class="sidebar" data-ekara-management-sidebar></aside>
 * Active screen: <body data-management-screen="webhooks|sso">
 */
(function (global) {
  const CHEVRON_EXPANDED =
    '<svg class="sidebar-chevron expanded" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';
  const CHEVRON_COLLAPSED =
    '<svg class="sidebar-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';

  const LINKS = {
    webhooks: { webhooks: './', sso: '../sso/' },
    sso: { webhooks: '../webhooks/', sso: './' },
  };

  function integrationLink(screen, activeScreen, label) {
    const href = LINKS[activeScreen]?.[screen];
    if (!href) return '';
    const isActive = screen === activeScreen;
    const cls = `sidebar-item sidebar-subitem sidebar-subitem-link${isActive ? ' active' : ''}`;
    const aria = isActive ? ' aria-current="page"' : '';
    return `<a class="${cls}" href="${href}"${aria}>${label}</a>`;
  }

  function renderSidebar(activeScreen) {
    if (!LINKS[activeScreen]) {
      console.warn('[management-sidebar] Unknown screen:', activeScreen);
      return '';
    }

    const integrationsExpanded = activeScreen === 'webhooks' || activeScreen === 'sso';

    return `
      <nav class="sidebar-nav">
        <div class="sidebar-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Accounts
        </div>
        <div class="sidebar-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          Workspaces
        </div>
        <div class="sidebar-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          Applications
        </div>
        <div class="sidebar-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          Users
        </div>
        <div class="sidebar-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          User profiles
        </div>
        <div class="sidebar-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Proxies
        </div>
        <div class="sidebar-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          Browser Agent
        </div>

        <div class="sidebar-item">
          <div class="sidebar-group-toggle" data-sidebar-toggle>
            <span class="sidebar-group-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              Integrations
            </span>
            ${integrationsExpanded ? CHEVRON_EXPANDED : CHEVRON_COLLAPSED}
          </div>
        </div>
        <div class="sidebar-subitems${integrationsExpanded ? '' : ' collapsed'}" data-sidebar-group>
          ${integrationLink('webhooks', activeScreen, 'Webhooks')}
          ${integrationLink('sso', activeScreen, 'SSO')}
          <div class="sidebar-item sidebar-subitem">Groups</div>
          <div class="sidebar-item sidebar-subitem">API keys</div>
          <div class="sidebar-item sidebar-subitem">Export OpenTelemetry</div>
        </div>

        <div class="sidebar-item">
          <div class="sidebar-group-toggle" data-sidebar-toggle>
            <span class="sidebar-group-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Usage
            </span>
            ${CHEVRON_COLLAPSED}
          </div>
        </div>
        <div class="sidebar-subitems collapsed" data-sidebar-group>
          <div class="sidebar-item sidebar-subitem">Consumption</div>
          <div class="sidebar-item sidebar-subitem">Actions log</div>
        </div>

        <div class="sidebar-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          Tags
        </div>
      </nav>
      <div class="sidebar-footer">v3.43.0 © 2026 ip-label</div>
    `;
  }

  function initSidebarGroups(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-sidebar-toggle]').forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const chevron = toggle.querySelector('.sidebar-chevron');
        const group = toggle.closest('.sidebar-item')?.nextElementSibling;
        if (!group || !group.matches('[data-sidebar-group]')) return;
        const collapsed = group.classList.toggle('collapsed');
        if (chevron) chevron.classList.toggle('expanded', !collapsed);
      });
    });
  }

  function mount() {
    const host = document.querySelector('[data-ekara-management-sidebar]');
    if (!host) return;

    const activeScreen =
      document.body.getAttribute('data-management-screen') ||
      host.getAttribute('data-management-screen') ||
      'webhooks';

    host.innerHTML = renderSidebar(activeScreen);
    initSidebarGroups(host);
  }

  global.EkaraManagementSidebar = {
    mount,
    initSidebarGroups,
    renderSidebar,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})(typeof window !== 'undefined' ? window : globalThis);
