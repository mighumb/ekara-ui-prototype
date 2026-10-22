/**
 * Ekara Management — SSO integrations prototype
 */

const SSO_STORAGE_KEY = 'ekara-prototype-sso';

const SSO_TYPES = ['LDAP', 'ADFS', 'AzureAD', 'Okta', 'PingIdentity'];

const DEFAULT_SSO = [
  { id: 1, name: 'ddf', description: 'Prod', type: 'LDAP', associatedUsers: '17 users' },
  { id: 2, name: 'ddd', description: '', type: 'LDAP', associatedUsers: '1 user' },
  { id: 3, name: 'LDAP', description: '', type: 'LDAP', associatedUsers: '1 user' },
  { id: 4, name: 'ADFS', description: '', type: 'ADFS', associatedUsers: '2 users' },
  { id: 5, name: 'Azure', description: 'Azure', type: 'AzureAD', associatedUsers: '1 user' },
  { id: 6, name: 'Okta', description: 'Okta', type: 'Okta', associatedUsers: 'None' },
  { id: 7, name: 'PingIdentity', description: 'PingIdentity', type: 'PingIdentity', associatedUsers: 'None' },
  { id: 8, name: 'test', description: 'test', type: 'LDAP', associatedUsers: 'None' },
  { id: 9, name: 'test2', description: 'test2', type: 'LDAP', associatedUsers: 'None' },
  { id: 10, name: 'test3', description: 'test3', type: 'LDAP', associatedUsers: 'None' },
  { id: 11, name: 'test4', description: 'test4', type: 'LDAP', associatedUsers: 'None' },
];

const SORT_FIRST_CLICK_ASC = {
  name: true,
  description: true,
  type: true,
  associatedUsers: false,
};

let ssoConfigs = loadSsoConfigs();
let tableSort = { key: 'name', asc: true };
let editingId = null;
let openMenuId = null;
let deleteTargetId = null;
let els = {};

document.addEventListener('DOMContentLoaded', init);

function init() {
  els = {
    tableBody: document.getElementById('sso-table-body'),
    overlay: document.getElementById('modal-overlay'),
    panel: document.getElementById('slide-panel'),
    panelTitle: document.getElementById('panel-title'),
    nameInput: document.getElementById('field-name'),
    descriptionInput: document.getElementById('field-description'),
    typeSelect: document.getElementById('field-type'),
    nameError: document.getElementById('error-name'),
    saveBtn: document.getElementById('save-btn'),
    confirmOverlay: document.getElementById('confirm-overlay'),
    confirmDialog: document.getElementById('confirm-dialog'),
    confirmMessage: document.getElementById('confirm-message'),
    confirmCancel: document.getElementById('confirm-cancel'),
    confirmOk: document.getElementById('confirm-ok'),
  };

  bindEvents();
  syncTableSortHeaders();
  renderTable();
}

function bindEvents() {
  document.getElementById('btn-add-sso').addEventListener('click', () => openPanel('create'));
  document.getElementById('panel-close').addEventListener('click', closePanel);
  document.getElementById('btn-cancel').addEventListener('click', closePanel);
  els.overlay.addEventListener('click', closePanel);
  els.saveBtn.addEventListener('click', saveSso);
  els.nameInput.addEventListener('input', () => clearFieldError(els.nameInput, els.nameError));

  els.confirmCancel.addEventListener('click', closeConfirm);
  els.confirmOverlay.addEventListener('click', closeConfirm);

  document.querySelectorAll('.data-table--sso .data-table-header-sort').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.sortKey;
      if (tableSort.key === key) {
        tableSort.asc = !tableSort.asc;
      } else {
        tableSort.key = key;
        tableSort.asc = SORT_FIRST_CLICK_ASC[key] ?? true;
      }
      syncTableSortHeaders();
      renderTable();
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.data-table-actions')) closeAllMenus();
  });
}

function loadSsoConfigs() {
  try {
    const raw = localStorage.getItem(SSO_STORAGE_KEY);
    if (!raw) return DEFAULT_SSO.map((row) => ({ ...row }));
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_SSO.map((row) => ({ ...row }));
    }
    return parsed;
  } catch {
    return DEFAULT_SSO.map((row) => ({ ...row }));
  }
}

function persistSsoConfigs() {
  try {
    localStorage.setItem(SSO_STORAGE_KEY, JSON.stringify(ssoConfigs));
  } catch {
    /* quota / private mode */
  }
}

function getNextId() {
  return ssoConfigs.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

function parseUserCount(label) {
  if (!label || label === 'None') return -1;
  const match = String(label).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function compareByColumn(a, b, key) {
  if (key === 'associatedUsers') {
    return parseUserCount(a.associatedUsers) - parseUserCount(b.associatedUsers);
  }
  const av = (a[key] ?? '').toString().toLowerCase();
  const bv = (b[key] ?? '').toString().toLowerCase();
  return av.localeCompare(bv, undefined, { sensitivity: 'base' });
}

function getSortedRows() {
  const rows = [...ssoConfigs];
  if (!tableSort.key) return rows;
  const dir = tableSort.asc ? 1 : -1;
  return rows.sort((a, b) => compareByColumn(a, b, tableSort.key) * dir);
}

function syncTableSortHeaders() {
  document.querySelectorAll('.data-table--sso .data-table-header-sort').forEach((btn) => {
    const key = btn.dataset.sortKey;
    btn.classList.remove('is-sorted', 'is-sorted-asc', 'is-sorted-desc');
    if (tableSort.key === key) {
      btn.classList.add('is-sorted', tableSort.asc ? 'is-sorted-asc' : 'is-sorted-desc');
      btn.setAttribute('aria-sort', tableSort.asc ? 'ascending' : 'descending');
    } else {
      btn.setAttribute('aria-sort', 'none');
    }
  });
}

function renderTable() {
  const rows = getSortedRows();
  els.tableBody.innerHTML = rows
    .map(
      (row) => `
    <div class="data-table-row" data-id="${row.id}">
      <div class="data-table-cell">${escapeHtml(row.name)}</div>
      <div class="data-table-cell">${escapeHtml(row.description)}</div>
      <div class="data-table-cell">${escapeHtml(row.type)}</div>
      <div class="data-table-cell">${escapeHtml(row.associatedUsers)}</div>
      <div class="data-table-actions">
        <button type="button" class="btn-icon menu-trigger" data-id="${row.id}" aria-label="Actions for ${escapeAttr(row.name)}">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
        </button>
        <div class="dropdown-menu" id="menu-${row.id}">
          <div class="dropdown-item" data-action="edit" data-id="${row.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </div>
          <div class="dropdown-item danger" data-action="delete" data-id="${row.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Delete
          </div>
        </div>
      </div>
    </div>`
    )
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
      const id = parseInt(item.dataset.id, 10);
      const action = item.dataset.action;
      closeAllMenus();
      if (action === 'edit') openPanel('edit', id);
      if (action === 'delete') confirmDelete(id);
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
  els.panelTitle.textContent = mode === 'edit' ? 'Edit SSO' : 'New SSO';
  els.saveBtn.textContent = mode === 'edit' ? 'Save' : 'Create';

  if (mode === 'edit') {
    const row = ssoConfigs.find((r) => r.id === id);
    if (!row) return;
    els.nameInput.value = row.name;
    els.descriptionInput.value = row.description;
    els.typeSelect.value = row.type;
    els.typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    els.nameInput.value = '';
    els.descriptionInput.value = '';
    els.typeSelect.value = 'LDAP';
    els.typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  clearFieldError(els.nameInput, els.nameError);
  els.overlay.classList.add('open');
  els.panel.classList.add('open');
  lockPageScroll();
}

function closePanel() {
  els.overlay.classList.remove('open');
  els.panel.classList.remove('open');
  unlockPageScroll();
  editingId = null;
}

function saveSso() {
  const name = els.nameInput.value.trim();
  if (!name) {
    setFieldError(els.nameInput, els.nameError, 'Name required');
    return;
  }

  const payload = {
    name,
    description: els.descriptionInput.value.trim(),
    type: els.typeSelect.value,
    associatedUsers: 'None',
  };

  if (editingId) {
    const idx = ssoConfigs.findIndex((r) => r.id === editingId);
    if (idx === -1) return;
    ssoConfigs[idx] = { ...ssoConfigs[idx], ...payload };
  } else {
    ssoConfigs.unshift({ id: getNextId(), ...payload });
  }

  persistSsoConfigs();
  renderTable();
  closePanel();
}

function confirmDelete(id) {
  const row = ssoConfigs.find((r) => r.id === id);
  if (!row) return;
  deleteTargetId = id;
  els.confirmMessage.textContent = `Are you sure you want to delete the SSO configuration "${row.name}"?`;
  els.confirmOverlay.classList.add('open');
  els.confirmDialog.classList.add('open');

  els.confirmOk.onclick = () => {
    ssoConfigs = ssoConfigs.filter((r) => r.id !== deleteTargetId);
    deleteTargetId = null;
    persistSsoConfigs();
    renderTable();
    closeConfirm();
  };
}

function closeConfirm() {
  els.confirmOverlay.classList.remove('open');
  els.confirmDialog.classList.remove('open');
  deleteTargetId = null;
}

function setFieldError(input, errorEl, message) {
  input.classList.add('error');
  errorEl.textContent = message;
}

function clearFieldError(input, errorEl) {
  input.classList.remove('error');
  errorEl.textContent = '';
}

let savedScrollY = 0;

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
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
