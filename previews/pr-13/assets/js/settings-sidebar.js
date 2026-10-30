/**
 * Shared Settings module sidebar (Alerts, Trackers, and future Settings screens).
 * Mount: <aside class="sidebar" data-ekara-settings-sidebar></aside>
 * Active screen: <body data-settings-screen="alerts|trackers">
 */
(function (global) {
  const CHEVRON =
    '<svg class="sidebar-chevron expanded" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';

  const LINKS = {
    alerts: { alerts: './', trackers: '../rum/trackers/' },
    trackers: { alerts: '../../alerts/', trackers: './' },
  };

  function linkAttrs(screen, activeScreen, label) {
    const href = LINKS[activeScreen]?.[screen];
    if (!href) return '';
    const isActive = screen === activeScreen;
    const cls = `sidebar-item sidebar-subitem sidebar-subitem-link${isActive ? ' active' : ''}`;
    const aria = isActive ? ' aria-current="page"' : '';
    return `<a class="${cls}" href="${href}"${aria}>${label}</a>`;
  }

  function renderSidebar(activeScreen) {
    if (!LINKS[activeScreen]) {
      console.warn('[settings-sidebar] Unknown screen:', activeScreen);
      return '';
    }

    return `
      <div class="sidebar-workspace">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
        All Workspace
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-item">
          <div class="sidebar-group-toggle" data-sidebar-toggle>
            <span class="sidebar-group-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/></svg>
              Robot
            </span>
            ${CHEVRON}
          </div>
        </div>
        <div class="sidebar-subitems" data-sidebar-group>
          <div class="sidebar-item sidebar-subitem">Scenarios</div>
          <div class="sidebar-item sidebar-subitem">User journeys</div>
          <div class="sidebar-item sidebar-subitem">Schedules</div>
          <div class="sidebar-item sidebar-subitem">SLA calendars</div>
          <div class="sidebar-item sidebar-subitem">Deployment areas</div>
          ${linkAttrs('alerts', activeScreen, 'Alerts')}
          <div class="sidebar-item sidebar-subitem">Shared data</div>
          <div class="sidebar-item sidebar-subitem">Data exclusions</div>
        </div>

        <div class="sidebar-item">
          <div class="sidebar-group-toggle" data-sidebar-toggle>
            <span class="sidebar-group-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              Browser Agent
            </span>
            ${CHEVRON}
          </div>
        </div>
        <div class="sidebar-subitems" data-sidebar-group>
          <div class="sidebar-item sidebar-subitem">Target urls</div>
        </div>

        <div class="sidebar-item">
          <div class="sidebar-group-toggle" data-sidebar-toggle>
            <span class="sidebar-group-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 5 5-9"/></svg>
              RUM
            </span>
            ${CHEVRON}
          </div>
        </div>
        <div class="sidebar-subitems" data-sidebar-group>
          ${linkAttrs('trackers', activeScreen, 'Trackers')}
          <div class="sidebar-item sidebar-subitem">Page groups</div>
          <div class="sidebar-item sidebar-subitem">Dimensions</div>
        </div>

        <div class="sidebar-item">
          <div class="sidebar-group-toggle" data-sidebar-toggle>
            <span class="sidebar-group-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              My reports
            </span>
            ${CHEVRON}
          </div>
        </div>
        <div class="sidebar-subitems" data-sidebar-group>
          <div class="sidebar-item sidebar-subitem">Publish</div>
          <div class="sidebar-item sidebar-subitem">Publish (new)</div>
          <div class="sidebar-item sidebar-subitem">Share</div>
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
    const host = document.querySelector('[data-ekara-settings-sidebar]');
    if (!host) return;

    const activeScreen =
      document.body.getAttribute('data-settings-screen') ||
      host.getAttribute('data-settings-screen') ||
      'alerts';

    host.innerHTML = renderSidebar(activeScreen);
    initSidebarGroups(host);
  }

  global.EkaraSettingsSidebar = {
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
