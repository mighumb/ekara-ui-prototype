/**
 * Management — Groups (DFY-24465 priority field in modal + list)
 */

const GROUPS_STORAGE_KEY = 'ekara-prototype-groups';

const PROFILE_OPTIONS = ['Administrator', 'Manager', 'Operator', 'Analyst'];
const LANGUAGE_OPTIONS = ['English', 'French', 'German'];
const TIMEZONE_OPTIONS = ['GMT', 'Africa/Addis_Ababa', 'Europe/Paris', 'America/New_York'];
const WORKSPACE_OPTIONS = ['ALL Application', 'Console GIEPS', 'Application cva'];

const SORT_FIRST_CLICK_ASC = {
  name: true,
  profile: true,
  workspaces: true,
  priority: false,
};

const DEFAULT_GROUPS = [
  {
    id: 1,
    name: 'test',
    profile: 'Operator',
    language: 'English',
    timezone: 'Africa/Addis_Ababa',
    priority: 0,
    accessAllWorkspaces: false,
    workspaces: ['ALL Application'],
  },
  {
    id: 2,
    name: 'bam_fr_ekara_operator',
    profile: 'Analyst',
    language: 'French',
    timezone: 'Europe/Paris',
    priority: 3,
    accessAllWorkspaces: false,
    workspaces: ['Console GIEPS'],
  },
  {
    id: 3,
    name: 'sso-admins',
    profile: 'Administrator',
    language: 'English',
    timezone: 'GMT',
    priority: 9,
    accessAllWorkspaces: true,
    workspaces: [],
  },
];

let groups = loadGroups();
let tableSort = { key: 'priority', asc: false };
let editingId = null;
let openMenuId = null;
let deleteTargetId = null;
let els = {};

document.addEventListener('DOMContentLoaded', init);

function init() {
  els = {
    tableBody: document.getElementById('group-table-body'),
    overlay: document.getElementById('modal-overlay'),
    dialog: document.getElementById('group-form-dialog'),
    dialogTitle: document.getElementById('group-dialog-title'),
    nameInput: document.getElementById('field-name'),
    profileSelect: document.getElementById('field-profile'),
    languageSelect: document.getElementById('field-language'),
    timezoneSelect: document.getElementById('field-timezone'),
    prioritySelect: document.getElementById('field-priority'),
    workspaceSelect: document.getElementById('field-workspaces'),
    nameError: document.getElementById('error-name'),
    saveBtn: document.getElementById('group-save-btn'),
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
  document.getElementById('btn-add-group').addEventListener('click', () => openDialog('create'));
  document.getElementById('group-dialog-close').addEventListener('click', closeDialog);
  document.getElementById('group-cancel-btn').addEventListener('click', closeDialog);
  els.overlay.addEventListener('click', closeDialog);
  els.saveBtn.addEventListener('click', saveGroup);

  els.nameInput.addEventListener('input', () => {
    clearFieldError(els.nameInput, els.nameError);
    syncSaveButtonState();
  });
  els.confirmCancel.addEventListener('click', closeConfirm);
  els.confirmOverlay.addEventListener('click', closeConfirm);

  document.querySelectorAll('.data-table--groups .data-table-header-sort').forEach((btn) => {
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

function normalizeGroup(row) {
  const priority = Number.isFinite(Number(row.priority)) ? Number(row.priority) : 0;
  const clampedPriority = Math.min(9, Math.max(0, priority));
  return {
    ...row,
    priority: clampedPriority,
    workspaces: Array.isArray(row.workspaces) ? row.workspaces : [],
    accessAllWorkspaces: Boolean(row.accessAllWorkspaces),
  };
}

function loadGroups() {
  try {
    const raw = localStorage.getItem(GROUPS_STORAGE_KEY);
    if (!raw) return DEFAULT_GROUPS.map((row) => normalizeGroup({ ...row, workspaces: [...row.workspaces] }));
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_GROUPS.map((row) => normalizeGroup({ ...row, workspaces: [...row.workspaces] }));
    }
    return parsed.map(normalizeGroup);
  } catch {
    return DEFAULT_GROUPS.map((row) => normalizeGroup({ ...row, workspaces: [...row.workspaces] }));
  }
}

function persistGroups() {
  try {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
  } catch {
    /* quota */
  }
}

function getNextId() {
  return groups.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

function groupInitials(name) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  const compact = String(name).trim().replace(/[^a-zA-Z0-9]/g, '');
  return (compact.slice(0, 2) || 'GR').toUpperCase();
}

function workspacesDisplay(row) {
  if (row.accessAllWorkspaces) return 'ALL Application';
  if (row.workspaces.length === 0) return '—';
  return row.workspaces[0];
}

function compareByColumn(a, b, key) {
  if (key === 'priority') {
    return a.priority - b.priority;
  }
  if (key === 'workspaces') {
    return workspacesDisplay(a).localeCompare(workspacesDisplay(b), undefined, { sensitivity: 'base' });
  }
  const av = (a[key] ?? '').toString().toLowerCase();
  const bv = (b[key] ?? '').toString().toLowerCase();
  return av.localeCompare(bv, undefined, { sensitivity: 'base' });
}

function getSortedRows() {
  const rows = [...groups];
  if (!tableSort.key) return rows;
  const dir = tableSort.asc ? 1 : -1;
  return rows.sort((a, b) => compareByColumn(a, b, tableSort.key) * dir);
}

function syncTableSortHeaders() {
  document.querySelectorAll('.data-table--groups .data-table-header-sort').forEach((btn) => {
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

function renderWorkspaceChips(labels) {
  if (!labels.length) return '<span class="group-workspace-empty">—</span>';
  return labels
    .map(
      (label) =>
        `<span class="ekara-chip group-workspace-chip"><span class="ekara-chip-label">${escapeHtml(label)}</span></span>`,
    )
    .join('');
}

function renderTable() {
  const rows = getSortedRows();
  els.tableBody.innerHTML = rows
    .map((row) => {
      const wsLabels = row.accessAllWorkspaces ? ['ALL Application'] : row.workspaces;
      return `
    <div class="data-table-row" data-id="${row.id}">
      <div class="data-table-cell">
        <div class="group-name-cell">
          <span class="group-table-avatar" aria-hidden="true">${escapeHtml(groupInitials(row.name))}</span>
          <span class="group-name-text">${escapeHtml(row.name)}</span>
        </div>
      </div>
      <div class="data-table-cell">${escapeHtml(row.profile)}</div>
      <div class="data-table-cell group-workspaces-cell">${renderWorkspaceChips(wsLabels)}</div>
      <div class="data-table-cell">${escapeHtml(String(row.priority))}</div>
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
      const id = parseInt(item.dataset.id, 10);
      const action = item.dataset.action;
      closeAllMenus();
      if (action === 'edit') openDialog('edit', id);
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

function syncSaveButtonState() {
  const hasName = Boolean(els.nameInput.value.trim());
  els.saveBtn.disabled = !hasName;
}

function openDialog(mode, id) {
  editingId = mode === 'edit' ? id : null;
  els.dialogTitle.textContent = mode === 'edit' ? 'Edit group' : 'New group';
  els.saveBtn.textContent = mode === 'edit' ? 'Save' : 'Create';

  if (mode === 'edit') {
    const row = groups.find((r) => r.id === id);
    if (!row) return;
    els.nameInput.value = row.name;
    els.profileSelect.value = row.profile;
    els.languageSelect.value = row.language;
    els.timezoneSelect.value = row.timezone;
    els.prioritySelect.value = String(row.priority);
    els.workspaceSelect.value = row.accessAllWorkspaces ? '__all__' : row.workspaces[0] || WORKSPACE_OPTIONS[0];
    dispatchSelectChanges();
  } else {
    els.nameInput.value = '';
    els.profileSelect.value = 'Administrator';
    els.languageSelect.value = 'English';
    els.timezoneSelect.value = 'GMT';
    els.prioritySelect.value = '0';
    els.workspaceSelect.value = '__all__';
    dispatchSelectChanges();
  }

  clearFieldError(els.nameInput, els.nameError);
  syncSaveButtonState();
  els.overlay.classList.add('open');
  els.dialog.classList.add('open');
  els.dialog.setAttribute('aria-hidden', 'false');
  lockPageScroll();
}

function dispatchSelectChanges() {
  [els.profileSelect, els.languageSelect, els.timezoneSelect, els.prioritySelect, els.workspaceSelect].forEach(
    (select) => {
      select.dispatchEvent(new Event('change', { bubbles: true }));
    },
  );
}

function closeDialog() {
  els.overlay.classList.remove('open');
  els.dialog.classList.remove('open');
  els.dialog.setAttribute('aria-hidden', 'true');
  unlockPageScroll();
  editingId = null;
}

function saveGroup() {
  const name = els.nameInput.value.trim();
  if (!name) {
    setFieldError(els.nameInput, els.nameError, 'Name required');
    syncSaveButtonState();
    return;
  }

  const workspaceValue = els.workspaceSelect.value;
  const accessAll = workspaceValue === '__all__';
  const fields = {
    name,
    profile: els.profileSelect.value,
    language: els.languageSelect.value,
    timezone: els.timezoneSelect.value,
    priority: Math.min(9, Math.max(0, parseInt(els.prioritySelect.value, 10) || 0)),
    accessAllWorkspaces: accessAll,
    workspaces: accessAll ? [] : workspaceValue ? [workspaceValue] : [],
  };

  if (editingId) {
    const idx = groups.findIndex((r) => r.id === editingId);
    if (idx === -1) return;
    groups[idx] = { ...groups[idx], ...fields };
  } else {
    groups.unshift({ id: getNextId(), ...fields });
  }

  persistGroups();
  renderTable();
  closeDialog();
}

function confirmDelete(id) {
  const row = groups.find((r) => r.id === id);
  if (!row) return;
  deleteTargetId = id;
  els.confirmMessage.textContent = `Are you sure you want to delete the group "${row.name}"?`;
  els.confirmOverlay.classList.add('open');
  els.confirmDialog.classList.add('open');

  els.confirmOk.onclick = () => {
    groups = groups.filter((r) => r.id !== deleteTargetId);
    deleteTargetId = null;
    persistGroups();
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
