/**
 * Ekara Settings — Alert rules prototype
 */

const ALERTS_STORAGE_KEY = 'ekara-prototype-alert-rules';

const DEFAULT_ALERTS = [
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

let alerts = loadAlerts();

function loadAlerts() {
  try {
    const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (!raw) return DEFAULT_ALERTS.map((row) => ({ ...row }));
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_ALERTS.map((row) => ({ ...row }));
    }
    return parsed;
  } catch {
    return DEFAULT_ALERTS.map((row) => ({ ...row }));
  }
}

function persistAlerts() {
  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch {
    /* quota / private mode — in-memory only for this session */
  }
}

let openMenuId = null;
let editingId = null;
let deleteTargetId = null;
let savedScrollY = 0;
let selectedRecipients = [];

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
    fieldSendEnd: document.getElementById('field-send-end'),
    fieldMinimumEndGap: document.getElementById('field-minimum-end-gap'),
    applicationsGlobalWrap: document.getElementById('applications-global-wrap'),
    applicationsPicker: document.getElementById('applications-picker'),
    applicationsTrigger: document.getElementById('applications-picker-trigger'),
    applicationsMenu: document.getElementById('applications-picker-menu'),
    applicationsSelectAll: document.getElementById('applications-select-all'),
    applicationOptions: document.querySelectorAll('.applications-option'),
    recipientsField: document.getElementById('recipients-field'),
    recipientsChips: document.getElementById('recipients-chips'),
    recipientsPlaceholder: document.getElementById('recipients-placeholder'),
    recipientsMenu: document.getElementById('recipients-picker-menu'),
    recipientOptions: document.querySelectorAll('.recipients-picker-option'),
    confirmOverlay: document.getElementById('confirm-overlay'),
    confirmDialog: document.getElementById('confirm-dialog'),
    confirmMessage: document.getElementById('confirm-message'),
    confirmCancel: document.getElementById('confirm-cancel'),
    confirmOk: document.getElementById('confirm-ok'),
  };

  renderTable();
  resetRecipientsSelection();
  bindEvents();
  initSidebarGroups();
  updateCharCounter();
  syncGlobalApplicationsUI();
  syncSendEndGapUI();
}

function bindEvents() {
  document.getElementById('btn-add-alert').addEventListener('click', () => openPanel('create'));
  document.getElementById('panel-close').addEventListener('click', closePanel);
  document.getElementById('btn-cancel').addEventListener('click', closePanel);
  els.overlay.addEventListener('click', closePanel);
  document.getElementById('btn-save').addEventListener('click', saveAlert);

  els.confirmCancel.addEventListener('click', closeConfirm);
  els.confirmOverlay.addEventListener('click', closeConfirm);
  els.confirmOk.addEventListener('click', () => {
    if (deleteTargetId == null) return;
    const id = deleteTargetId;
    alerts = alerts.filter((a) => a.id !== id);
    if (editingId === id) closePanel();
    persistAlerts();
    renderTable();
    closeConfirm();
  });

  els.description.addEventListener('input', updateCharCounter);

  els.fieldGlobal.addEventListener('change', () => {
    syncGlobalApplicationsUI();
    updatePanelBodyScroll();
  });

  els.fieldSendEnd.addEventListener('change', () => {
    syncSendEndGapUI();
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
    if (!e.target.closest('.recipients-picker')) {
      closeRecipientsMenu();
    }
  });

  els.recipientsField.addEventListener('click', (e) => {
    if (e.target.closest('.recipient-chip-remove')) return;
    e.stopPropagation();
    const open = els.recipientsMenu.classList.toggle('open');
    els.recipientsMenu.classList.toggle('hidden', !open);
    els.recipientsField.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  els.recipientOptions.forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      addRecipient(opt.dataset.value, opt.dataset.label);
    });
  });

  els.recipientsChips.addEventListener('click', (e) => {
    const btn = e.target.closest('.recipient-chip-remove');
    if (!btn) return;
    e.stopPropagation();
    removeRecipient(btn.dataset.value);
  });

  window.addEventListener('resize', () => {
    if (els.panel.classList.contains('open')) updatePanelBodyScroll();
  });

  document.querySelectorAll('.day-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('active');
      updatePanelBodyScroll();
    });
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
  const body = els.panelBody;
  const measure = () => {
    body.classList.remove('can-scroll');
    const overflow = body.scrollHeight - body.clientHeight;
    body.classList.toggle('can-scroll', overflow > 2);
  };
  requestAnimationFrame(() => requestAnimationFrame(measure));
}

function closeRecipientsMenu() {
  if (!els.recipientsMenu) return;
  els.recipientsMenu.classList.remove('open');
  els.recipientsMenu.classList.add('hidden');
  els.recipientsField.setAttribute('aria-expanded', 'false');
  updatePanelBodyScroll();
}

function addRecipient(value, label) {
  if (!value || selectedRecipients.some((r) => r.value === value)) return;
  selectedRecipients.push({ value, label });
  renderRecipientsChips();
}

function removeRecipient(value) {
  selectedRecipients = selectedRecipients.filter((r) => r.value !== value);
  renderRecipientsChips();
}

function renderRecipientsChips() {
  els.recipientsChips.innerHTML = selectedRecipients
    .map(
      (r) => `
    <span class="recipient-chip">
      <span class="recipient-chip-label">${escapeHtml(r.label)}</span>
      <button type="button" class="recipient-chip-remove" data-value="${escapeHtml(r.value)}" aria-label="Remove ${escapeHtml(r.label)}">×</button>
    </span>`
    )
    .join('');
  els.recipientsPlaceholder.classList.toggle('hidden', selectedRecipients.length > 0);
  els.recipientOptions.forEach((opt) => {
    const isSelected = selectedRecipients.some((r) => r.value === opt.dataset.value);
    opt.classList.toggle('is-selected', isSelected);
    opt.setAttribute('aria-selected', isSelected ? 'true' : 'false');
  });
  updatePanelBodyScroll();
}

function resetRecipientsSelection() {
  selectedRecipients = [];
  renderRecipientsChips();
  closeRecipientsMenu();
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

function syncSendEndGapUI() {
  const enabled = els.fieldSendEnd.checked;
  els.fieldMinimumEndGap.disabled = !enabled;
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
      <div class="data-table-cell" data-tooltip-full="${escapeHtml(row.name)}">${escapeHtml(row.name)}</div>
      <div class="data-table-cell" data-tooltip-full="${escapeHtml(row.description)}">${escapeHtml(row.description)}</div>
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
          <div class="dropdown-item" data-action="duplicate" data-id="${row.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/><line x1="17" y1="11" x2="17" y2="15"/><line x1="15" y1="13" x2="19" y2="13"/></svg>
            Duplicate
          </div>
          <div class="dropdown-divider" role="separator"></div>
          <div class="dropdown-item" data-action="delete" data-id="${row.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Delete
          </div>
        </div>
      </div>
    </div>`;
    })
    .join('');

  requestAnimationFrame(() => {
    if (window.EkaraTooltip) window.EkaraTooltip.syncTruncated(els.tableBody);
  });

  els.tableBody.querySelectorAll('.menu-trigger').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu(parseInt(btn.dataset.id, 10));
    });
  });

  els.tableBody.querySelectorAll('.dropdown-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(item.dataset.id, 10);
      const action = item.dataset.action;
      closeAllMenus();
      if (action === 'edit') openPanel('edit', id);
      if (action === 'duplicate') duplicateAlert(id);
      if (action === 'delete') confirmDeleteAlert(id);
    });
  });
}

function getNextAlertId() {
  return alerts.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

function duplicateAlert(id) {
  const row = alerts.find((a) => a.id === id);
  if (!row) return;
  const copy = {
    ...row,
    id: getNextAlertId(),
    name: row.name.endsWith('...') ? `${row.name.slice(0, -3)} (copy)...` : `${row.name} (copy)`,
  };
  const index = alerts.findIndex((a) => a.id === id);
  alerts.splice(index + 1, 0, copy);
  persistAlerts();
  renderTable();
}

function confirmDeleteAlert(id) {
  const row = alerts.find((a) => a.id === id);
  if (!row) return;
  deleteTargetId = id;
  els.confirmMessage.textContent = `Are you sure you want to delete the alert "${row.name}"?`;
  els.confirmOverlay.classList.add('open');
  els.confirmDialog.classList.add('open');
}

function closeConfirm() {
  els.confirmOverlay.classList.remove('open');
  els.confirmDialog.classList.remove('open');
  deleteTargetId = null;
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
    resetRecipientsSelection();
    syncGlobalApplicationsUI();
    els.fieldSendEnd.checked = false;
    els.fieldMinimumEndGap.value = '00:00';
    syncSendEndGapUI();
    document.querySelectorAll('.day-pill').forEach((p) => p.classList.add('active'));
    updateCharCounter();
  } else {
    const row = alerts.find((a) => a.id === id);
    if (row) {
      document.getElementById('field-name').value = row.name.replace(/\.\.\.$/, '');
      document.getElementById('field-description').value = row.description;
      document.getElementById('field-trigger').value = row.trigger || 'Incident';
      document.getElementById('field-time-wait').value = row.timeWait || '00:00';
      els.fieldSendEnd.checked = Boolean(row.sendEnd);
      els.fieldMinimumEndGap.value = row.minimumEndGap || '00:00';
      syncSendEndGapUI();
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

function formatRecipientsLabel(count) {
  if (count <= 0) return '0 recipients';
  if (count === 1) return '1 recipient';
  return `${count} recipients`;
}

function getApplicationsValueFromForm() {
  if (els.fieldGlobal.checked) return '';
  const selected = [...els.applicationOptions].filter((o) => o.checked);
  if (selected.length === 0) return '';
  return selected[0].value;
}

function collectAlertFromForm() {
  return {
    name: document.getElementById('field-name').value.trim(),
    description: document.getElementById('field-description').value.trim(),
    applications: getApplicationsValueFromForm(),
    trigger: document.getElementById('field-trigger').value,
    timeWait: document.getElementById('field-time-wait').value.trim() || '00:00',
    sendEnd: els.fieldSendEnd.checked,
    minimumEndGap: els.fieldMinimumEndGap.value.trim() || '00:00',
    recipients: formatRecipientsLabel(selectedRecipients.length),
  };
}

function saveAlert() {
  const data = collectAlertFromForm();
  if (!data.name) {
    document.getElementById('field-name').focus();
    return;
  }

  if (editingId != null) {
    const row = alerts.find((a) => a.id === editingId);
    if (row) {
      Object.assign(row, data);
    }
  } else {
    alerts.push({
      id: getNextAlertId(),
      scenarios: 'None',
      ...data,
    });
  }

  persistAlerts();
  renderTable();
  closePanel();
}

function closePanel() {
  els.overlay.classList.remove('open');
  els.panel.classList.remove('open');
  if (els.panelBody) els.panelBody.classList.remove('can-scroll');
  unlockPageScroll();
  closeApplicationsMenu();
  closeRecipientsMenu();
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
