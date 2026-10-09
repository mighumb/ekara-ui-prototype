/**
 * Ekara Settings — Alert rules prototype
 */

const alerts = [
  {
    id: 1,
    name: '00-DFY-24047-Alerte-C...',
    description: 'to test the local workflow of certific...',
    applications: '',
    trigger: 'Incident',
    recipients: '1 recipient',
    scenarios: 'None',
  },
  {
    id: 2,
    name: 'Alert 13 to 15h30',
    description: 'test pour planning poker',
    applications: '',
    trigger: 'Incident',
    recipients: '1 recipient',
    scenarios: 'None',
  },
  {
    id: 3,
    name: 'Alert Teams',
    description: 'test teams',
    applications: '',
    trigger: 'Incident',
    recipients: '4 recipients',
    scenarios: 'None',
  },
  {
    id: 4,
    name: 'CVA - Alert Webhook',
    description: 'test webhook',
    applications: 'Application cva',
    trigger: 'Incident',
    recipients: '7 recipients',
    scenarios: '1 scenario',
  },
  {
    id: 5,
    name: 'CVA - Alert Webhook 2',
    description: 'test webhook 2',
    applications: 'Application cva',
    trigger: 'Incident',
    recipients: '7 recipients',
    scenarios: '1 scenario',
  },
  {
    id: 6,
    name: 'CVA - Alert Webhook 3',
    description: 'test webhook 3',
    applications: 'Application cva',
    trigger: 'Incident',
    recipients: '7 recipients',
    scenarios: '1 scenario',
  },
  {
    id: 7,
    name: 'CVA - Alert Webhook 4',
    description: 'test webhook 4',
    applications: 'Application cva',
    trigger: 'Incident',
    recipients: '7 recipients',
    scenarios: '1 scenario',
  },
  {
    id: 8,
    name: 'CVA - Alert Webhook 5',
    description: 'test webhook 5',
    applications: 'Application cva',
    trigger: 'Incident',
    recipients: '7 recipients',
    scenarios: '1 scenario',
  },
  {
    id: 9,
    name: 'CVA - Alert Webhook 6',
    description: 'test webhook 6',
    applications: 'Application cva',
    trigger: 'Incident',
    recipients: '7 recipients',
    scenarios: '1 scenario',
  },
  {
    id: 10,
    name: 'CVA - Alert Webhook 7',
    description: 'test webhook 7',
    applications: 'Application cva',
    trigger: 'Incident',
    recipients: '7 recipients',
    scenarios: '1 scenario',
  },
  {
    id: 11,
    name: 'CVA - Alert Webhook 8',
    description: 'test webhook 8',
    applications: 'Application cva',
    trigger: 'Incident',
    recipients: '7 recipients',
    scenarios: '1 scenario',
  },
  {
    id: 12,
    name: 'CVA - Alert Webhook 9',
    description: 'test webhook 9',
    applications: 'Application cva',
    trigger: 'Incident',
    recipients: '7 recipients',
    scenarios: '1 scenario',
  },
  {
    id: 13,
    name: 'CVA - Alert Webhook 10',
    description: 'test webhook 10',
    applications: 'Application cva',
    trigger: 'Incident',
    recipients: '7 recipients',
    scenarios: '1 scenario',
  },
  {
    id: 14,
    name: 'CVA - Alert Webhook 11',
    description: 'test webhook 11',
    applications: 'Application cva',
    trigger: 'Incident',
    recipients: '7 recipients',
    scenarios: '1 scenario',
  },
  {
    id: 15,
    name: 'CVA - Alert Webhook 12',
    description: 'test webhook 12',
    applications: 'Application cva',
    trigger: 'Incident',
    recipients: '7 recipients',
    scenarios: '1 scenario',
  },
  {
    id: 16,
    name: 'CVA - Alert Webhook 13',
    description: 'test webhook 13',
    applications: 'Application cva',
    trigger: 'Incident',
    recipients: '7 recipients',
    scenarios: '1 scenario',
  },
  {
    id: 17,
    name: 'CVA - Alert Webhook 14',
    description: 'test webhook 14',
    applications: 'Application cva',
    trigger: 'Incident',
    recipients: '7 recipients',
    scenarios: '1 scenario',
  },
  {
    id: 18,
    name: 'CVA - Alert Webhook 15',
    description: 'test webhook 15',
    applications: 'Application cva',
    trigger: 'Incident',
    recipients: '7 recipients',
    scenarios: '1 scenario',
  },
  {
    id: 19,
    name: 'CVA - Alert Webhook 16',
    description: 'test webhook 16',
    applications: 'Application cva',
    trigger: 'Incident',
    recipients: '7 recipients',
    scenarios: '1 scenario',
  },
  {
    id: 20,
    name: 'CVA - Alert Webhook 17',
    description: 'test webhook 17',
    applications: 'Application cva',
    trigger: 'Incident',
    recipients: '7 recipients',
    scenarios: '1 scenario',
  },
  {
    id: 21,
    name: 'CVA - Alert Webhook 18',
    description: 'test webhook 18',
    applications: 'Application cva',
    trigger: 'Warning on availability',
    recipients: '2 recipients',
    scenarios: 'None',
  },
  {
    id: 22,
    name: 'CVA - Alert Webhook 19',
    description: 'test webhook 19',
    applications: 'Application cva',
    trigger: 'Performance degradation',
    recipients: '3 recipients',
    scenarios: '2 scenarios',
  },
];

let openMenuId = null;
let editingId = null;
let savedScrollY = 0;

let els = {};

document.addEventListener('DOMContentLoaded', init);

function init() {
  els = {
    tableBody: document.getElementById('alert-table-body'),
    overlay: document.getElementById('modal-overlay'),
    panel: document.getElementById('slide-panel'),
    panelBody: document.querySelector('.slide-panel-body'),
    panelTitle: document.getElementById('panel-title'),
    description: document.getElementById('field-description'),
    charCounter: document.getElementById('char-counter'),
    fieldGlobal: document.getElementById('field-global'),
    applicationsGlobalWrap: document.getElementById('applications-global-wrap'),
    applicationsPicker: document.getElementById('applications-picker'),
    applicationsTrigger: document.getElementById('applications-picker-trigger'),
    applicationsMenu: document.getElementById('applications-picker-menu'),
    applicationsSelectAll: document.getElementById('applications-select-all'),
    applicationOptions: document.querySelectorAll('.applications-option'),
  };

  renderTable();
  bindEvents();
  initSidebarGroups();
  updateCharCounter();
  syncGlobalApplicationsUI();
}

function bindEvents() {
  document.getElementById('btn-add-alert').addEventListener('click', () => openPanel('create'));
  document.getElementById('panel-close').addEventListener('click', closePanel);
  document.getElementById('btn-cancel').addEventListener('click', closePanel);
  els.overlay.addEventListener('click', closePanel);
  document.getElementById('btn-save').addEventListener('click', () => closePanel());

  els.description.addEventListener('input', updateCharCounter);

  els.fieldGlobal.addEventListener('change', () => {
    syncGlobalApplicationsUI();
    updatePanelBodyScroll();
  });

  els.applicationsTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (els.fieldGlobal.checked) return;
    const open = els.applicationsMenu.classList.toggle('open');
    els.applicationsMenu.classList.toggle('hidden', !open);
    els.applicationsTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  els.applicationsSelectAll.addEventListener('change', () => {
    const checked = els.applicationsSelectAll.checked;
    els.applicationOptions.forEach((opt) => {
      opt.checked = checked;
    });
    updateApplicationsTriggerLabel();
  });

  els.applicationOptions.forEach((opt) => {
    opt.addEventListener('change', () => {
      const allChecked = [...els.applicationOptions].every((o) => o.checked);
      const noneChecked = [...els.applicationOptions].every((o) => !o.checked);
      els.applicationsSelectAll.checked = allChecked;
      els.applicationsSelectAll.indeterminate = !allChecked && !noneChecked;
      updateApplicationsTriggerLabel();
    });
  });

  document.addEventListener('click', (e) => {
    closeAllMenus();
    if (!e.target.closest('.applications-picker')) {
      closeApplicationsMenu();
    }
  });

  document.querySelectorAll('.day-pill').forEach((pill) => {
    pill.addEventListener('click', () => pill.classList.toggle('active'));
  });
}

function closeApplicationsMenu() {
  els.applicationsMenu.classList.remove('open');
  els.applicationsMenu.classList.add('hidden');
  els.applicationsTrigger.setAttribute('aria-expanded', 'false');
  updatePanelBodyScroll();
}

function updatePanelBodyScroll() {
  if (!els.panelBody || !els.panel.classList.contains('open')) return;
  requestAnimationFrame(() => {
    const { scrollHeight, clientHeight } = els.panelBody;
    els.panelBody.classList.toggle('can-scroll', scrollHeight > clientHeight + 8);
  });
}

function syncGlobalApplicationsUI() {
  const isGlobal = els.fieldGlobal.checked;
  els.applicationsGlobalWrap.classList.toggle('hidden', !isGlobal);
  els.applicationsPicker.classList.toggle('hidden', isGlobal);
  if (isGlobal) {
    closeApplicationsMenu();
  } else {
    updateApplicationsTriggerLabel();
  }
}

function updateApplicationsTriggerLabel() {
  const selected = [...els.applicationOptions].filter((o) => o.checked);
  if (selected.length === 0) {
    els.applicationsTrigger.textContent = 'Select applications';
  } else if (selected.length === els.applicationOptions.length) {
    els.applicationsTrigger.textContent = 'All applications selected';
  } else if (selected.length === 1) {
    els.applicationsTrigger.textContent = selected[0].value;
  } else {
    els.applicationsTrigger.textContent = `${selected.length} applications selected`;
  }
}

function resetApplicationsSelection() {
  els.applicationOptions.forEach((o) => {
    o.checked = false;
  });
  els.applicationsSelectAll.checked = false;
  els.applicationsSelectAll.indeterminate = false;
  updateApplicationsTriggerLabel();
}

function initSidebarGroups() {
  document.querySelectorAll('[data-sidebar-toggle]').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const chevron = toggle.querySelector('.sidebar-chevron');
      const group = toggle.closest('.sidebar-item')?.nextElementSibling;
      if (!group || !group.matches('[data-sidebar-group]')) return;
      const collapsed = group.classList.toggle('collapsed');
      if (chevron) chevron.classList.toggle('expanded', !collapsed);
    });
  });
}

function updateCharCounter() {
  const len = els.description.value.length;
  els.charCounter.textContent = `${len} / 250`;
}

function renderTable() {
  els.tableBody.innerHTML = alerts
    .map((row) => {
      const appCell = row.applications
        ? `<span class="app-tag">${escapeHtml(row.applications)}</span>`
        : '';
      return `
    <div class="data-table-row" data-id="${row.id}">
      <div class="data-table-cell">
        <span class="alert-table-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        </span>
      </div>
      <div class="data-table-cell" title="${escapeHtml(row.name)}">${escapeHtml(row.name)}</div>
      <div class="data-table-cell data-table-cell--wrap">${escapeHtml(row.description)}</div>
      <div class="data-table-cell">${appCell}</div>
      <div class="data-table-cell">${escapeHtml(row.trigger)}</div>
      <div class="data-table-cell">${escapeHtml(row.recipients)}</div>
      <div class="data-table-cell">${escapeHtml(row.scenarios)}</div>
      <div class="data-table-actions">
        <button type="button" class="btn-icon menu-trigger" data-id="${row.id}" aria-label="Actions">
          <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
        </button>
        <div class="dropdown-menu" id="menu-${row.id}">
          <div class="dropdown-item" data-action="edit" data-id="${row.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </div>
        </div>
      </div>
    </div>`;
    })
    .join('');

  els.tableBody.querySelectorAll('.menu-trigger').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu(parseInt(btn.dataset.id, 10));
    });
  });

  els.tableBody.querySelectorAll('.dropdown-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllMenus();
      if (item.dataset.action === 'edit') {
        openPanel('edit', parseInt(item.dataset.id, 10));
      }
    });
  });
}

function toggleMenu(id) {
  if (openMenuId === id) {
    closeAllMenus();
    return;
  }
  closeAllMenus();
  const menu = document.getElementById(`menu-${id}`);
  if (menu) {
    menu.classList.add('open');
    openMenuId = id;
  }
}

function closeAllMenus() {
  document.querySelectorAll('.dropdown-menu.open').forEach((m) => m.classList.remove('open'));
  openMenuId = null;
}

function openPanel(mode, id) {
  editingId = mode === 'edit' ? id : null;
  els.panelTitle.textContent = mode === 'edit' ? 'Edit alert' : 'New alert';
  if (mode === 'create') {
    document.getElementById('alert-form').reset();
    els.fieldGlobal.checked = true;
    resetApplicationsSelection();
    syncGlobalApplicationsUI();
    document.querySelectorAll('.day-pill').forEach((p) => p.classList.add('active'));
    updateCharCounter();
  } else {
    const row = alerts.find((a) => a.id === id);
    if (row) {
      document.getElementById('field-name').value = row.name.replace(/\.\.\.$/, '');
      document.getElementById('field-description').value = row.description;
      if (row.applications) {
        els.fieldGlobal.checked = false;
        resetApplicationsSelection();
        els.applicationOptions.forEach((opt) => {
          if (opt.value === row.applications) opt.checked = true;
        });
        syncGlobalApplicationsUI();
      } else {
        els.fieldGlobal.checked = true;
        syncGlobalApplicationsUI();
      }
      updateCharCounter();
    }
  }
  els.overlay.classList.add('open');
  els.panel.classList.add('open');
  lockPageScroll();
  updatePanelBodyScroll();
}

function closePanel() {
  els.overlay.classList.remove('open');
  els.panel.classList.remove('open');
  if (els.panelBody) els.panelBody.classList.remove('can-scroll');
  unlockPageScroll();
  closeApplicationsMenu();
  editingId = null;
}

function lockPageScroll() {
  savedScrollY = window.scrollY;
  document.documentElement.classList.add('slide-panel-open');
  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
}

function unlockPageScroll() {
  document.documentElement.classList.remove('slide-panel-open');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  window.scrollTo(0, savedScrollY);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
