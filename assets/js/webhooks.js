/**
 * Ekara Webhooks Prototype — interactive logic
 */

const SERVICE_HELP = {
  Generic:
    'A Generic webhook allows you to send alerting information in the form of a pre-defined payload to a target URL on your system (payload format available in the wiki).',
  Teams:
    'A Teams webhook allows you to send Ekara alert information to a Microsoft Teams channel in your organization. All you need to do is add an incoming webhook to a Teams channel (connectors) and copy the webhook URL.',
  PagerDuty:
    'A PagerDuty webhook allows you to create an incident in your PagerDuty service. All you need to do is define an "Events API v2" integration in your service and copy the Integration Key that will be added in the request header.',
  WeCom:
    'A WeCom webhook allows you to send Ekara alert notifications to a WeCom group (WeChat Work) in your organization. All you need to do is add a Bot to your WeCom group and copy the webhook URL.',
  ilert:
    'An ilert webhook allows you to easily and quickly integrate Ekara alerts directly into ilert. All you need to do is define a new Ekara alert source in ilert and copy the webhook URL.',
};

const ALERT_CONTEXT_FIELDS = [
  { value: '@StartTime', label: '@StartTime', description: 'Alert start date/time' },
  { value: '@EndTime', label: '@EndTime', description: 'Alert end date/time' },
  { value: '@AlertDesc', label: '@AlertDesc', description: 'Alert description' },
  { value: '@ScenarioName', label: '@ScenarioName', description: 'Scenario name' },
];

const EXAMPLE_VALUES = {
  '@StartTime': '2026-06-30T14:32:00.000Z',
  '@EndTime': '2026-06-30T14:45:00.000Z',
  '@AlertDesc': 'Response time exceeded threshold (3.2s > 2.0s)',
  '@ScenarioName': 'Login e-commerce',
};

const SOURCE_TYPES = ['Static value', 'Scenario tag', 'Alert context field'];

let webhooks = [
  {
    id: 1,
    name: '000tags',
    service: 'Generic',
    url: 'https://webhook.site/8a3f2b1c-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
    oauth: false,
    headers: [],
    mappings: [],
    payloadMode: 'mapping',
    customJson: '',
  },
  {
    id: 2,
    name: '00tagsTeam',
    service: 'Teams',
    url: 'https://iplabel.webhook.office.com/webhookb2/abc123-def456/IncomingWebhook/xyz789',
    oauth: false,
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    mappings: [],
    payloadMode: 'mapping',
    customJson: '',
  },
  {
    id: 3,
    name: 'clone webhook1',
    service: 'Generic',
    url: 'https://webhook.site/clone-webhook-1',
    oauth: false,
    headers: [],
    mappings: [],
    payloadMode: 'mapping',
    customJson: '',
  },
  {
    id: 4,
    name: 'CVA Pagerduty',
    service: 'PagerDuty',
    url: 'https://events.pagerduty.com/v2/enqueue',
    oauth: false,
    headers: [],
    mappings: [{ targetKey: 'routing_key', source: 'Static value', value: 'abc123integrationkey' }],
    payloadMode: 'mapping',
    customJson: '',
  },
  {
    id: 5,
    name: 'CVA-WeChat',
    service: 'WeCom',
    url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=abc-def-123',
    oauth: false,
    headers: [],
    mappings: [],
    payloadMode: 'mapping',
    customJson: '',
  },
];

let nextId = 6;
let editingId = null;
let openMenuId = null;

/* ── DOM refs (set on DOMContentLoaded) ── */
let els = {};

document.addEventListener('DOMContentLoaded', init);

function init() {
  els = {
    tableBody: document.getElementById('webhook-table-body'),
    overlay: document.getElementById('modal-overlay'),
    panel: document.getElementById('slide-panel'),
    panelTitle: document.getElementById('panel-title'),
    form: document.getElementById('webhook-form'),
    nameInput: document.getElementById('field-name'),
    serviceSelect: document.getElementById('field-service'),
    serviceHelp: document.getElementById('service-help'),
    urlInput: document.getElementById('field-url'),
    oauthToggle: document.getElementById('field-oauth'),
    headersContainer: document.getElementById('headers-container'),
    mappingsContainer: document.getElementById('mappings-container'),
    payloadPreview: document.getElementById('payload-preview-content'),
    saveBtn: document.getElementById('save-btn'),
    modeMapping: document.getElementById('mode-mapping'),
    modeJson: document.getElementById('mode-json'),
    mappingSection: document.getElementById('mapping-section'),
    jsonSection: document.getElementById('json-section'),
    customJsonInput: document.getElementById('field-custom-json'),
    jsonError: document.getElementById('json-error'),
    confirmOverlay: document.getElementById('confirm-overlay'),
    confirmDialog: document.getElementById('confirm-dialog'),
    confirmMessage: document.getElementById('confirm-message'),
    confirmCancel: document.getElementById('confirm-cancel'),
    confirmOk: document.getElementById('confirm-ok'),
  };

  renderTable();
  bindGlobalEvents();
}

function bindGlobalEvents() {
  document.getElementById('btn-add-webhook').addEventListener('click', () => openPanel('create'));
  document.getElementById('panel-close').addEventListener('click', closePanel);
  document.getElementById('btn-cancel').addEventListener('click', closePanel);
  els.overlay.addEventListener('click', closePanel);
  els.saveBtn.addEventListener('click', saveWebhook);

  els.serviceSelect.addEventListener('change', updateServiceHelp);
  document.getElementById('btn-add-header').addEventListener('click', () => addHeaderRow());
  document.getElementById('btn-add-mapping').addEventListener('click', () => addMappingRow());

  els.modeMapping.addEventListener('click', () => setPayloadMode('mapping'));
  els.modeJson.addEventListener('click', () => setPayloadMode('json'));

  els.customJsonInput.addEventListener('input', () => {
    validateJsonField();
    updatePayloadPreview();
  });

  els.confirmCancel.addEventListener('click', closeConfirm);
  els.confirmOverlay.addEventListener('click', closeConfirm);

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.data-table-actions')) {
      closeAllMenus();
    }
  });
}

/* ── Table rendering ── */
function renderTable() {
  els.tableBody.innerHTML = webhooks
    .map(
      (wh) => `
    <div class="data-table-row" data-id="${wh.id}">
      <div class="data-table-cell">${escapeHtml(wh.name)}</div>
      <div class="data-table-cell">${escapeHtml(wh.service)}</div>
      <div class="data-table-cell url" title="${escapeHtml(wh.url)}">${escapeHtml(wh.url)}</div>
      <div class="data-table-actions">
        <button class="btn-icon menu-trigger" data-id="${wh.id}" aria-label="Actions">
          <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
        </button>
        <div class="dropdown-menu" id="menu-${wh.id}">
          <div class="dropdown-item" data-action="edit" data-id="${wh.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </div>
          <div class="dropdown-item danger" data-action="delete" data-id="${wh.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
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
      const id = parseInt(btn.dataset.id, 10);
      toggleMenu(id);
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

/* ── Panel open/close ── */
function openPanel(mode, id) {
  editingId = mode === 'edit' ? id : null;
  els.panelTitle.textContent = mode === 'edit' ? 'Edit webhook' : 'New webhook';
  els.saveBtn.textContent = mode === 'edit' ? 'Save' : 'Create';

  if (mode === 'edit') {
    const wh = webhooks.find((w) => w.id === id);
    if (!wh) return;
    populateForm(wh);
  } else {
    resetForm();
  }

  els.overlay.classList.add('open');
  els.panel.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePanel() {
  els.overlay.classList.remove('open');
  els.panel.classList.remove('open');
  document.body.style.overflow = '';
  editingId = null;
  clearFormErrors();
}

function resetForm() {
  els.nameInput.value = '';
  els.serviceSelect.value = 'Generic';
  els.urlInput.value = '';
  els.oauthToggle.checked = false;
  els.headersContainer.innerHTML = '';
  addHeaderRow();
  els.mappingsContainer.innerHTML = '';
  els.customJsonInput.value = '';
  els.jsonError.textContent = '';
  els.customJsonInput.classList.remove('error');
  setPayloadMode('mapping');
  updateServiceHelp();
  updatePayloadPreview();
}

function populateForm(wh) {
  els.nameInput.value = wh.name;
  els.serviceSelect.value = wh.service;
  els.urlInput.value = wh.url;
  els.oauthToggle.checked = wh.oauth;
  els.customJsonInput.value = wh.customJson || '';

  els.headersContainer.innerHTML = '';
  (wh.headers || []).forEach((h) => addHeaderRow(h.key, h.value));

  els.mappingsContainer.innerHTML = '';
  (wh.mappings || []).forEach((m) => addMappingRow(m.targetKey, m.source, m.value));

  setPayloadMode(wh.payloadMode || 'mapping');
  updateServiceHelp();
  updatePayloadPreview();
}

/* ── Service help ── */
function updateServiceHelp() {
  const service = els.serviceSelect.value;
  els.serviceHelp.textContent = SERVICE_HELP[service] || '';
}

/* ── Dynamic header rows ── */
function addHeaderRow(key = '', value = '') {
  const row = document.createElement('div');
  row.className = 'dynamic-row header-row';
  row.innerHTML = `
    <input type="text" class="form-input header-key" placeholder="Key" value="${escapeAttr(key)}">
    <input type="text" class="form-input header-value" placeholder="Value" value="${escapeAttr(value)}">
    <button type="button" class="btn-icon remove-header" aria-label="Remove header">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>`;
  row.querySelector('.remove-header').addEventListener('click', () => {
    row.remove();
  });
  els.headersContainer.appendChild(row);
}

function collectHeaders() {
  const rows = els.headersContainer.querySelectorAll('.header-row');
  const headers = [];
  rows.forEach((row) => {
    const key = row.querySelector('.header-key').value.trim();
    const value = row.querySelector('.header-value').value.trim();
    if (key) headers.push({ key, value });
  });
  return headers;
}

/* ── Dynamic mapping rows ── */
function addMappingRow(targetKey = '', source = 'Static value', value = '') {
  const row = document.createElement('div');
  row.className = 'mapping-row';
  row.innerHTML = `
    <input type="text" class="form-input mapping-target" placeholder="Target key" value="${escapeAttr(targetKey)}">
    <select class="form-select mapping-source">${SOURCE_TYPES.map((s) => `<option value="${s}"${s === source ? ' selected' : ''}>${s}</option>`).join('')}</select>
    <div class="mapping-value-container"></div>
    <button type="button" class="btn-icon remove-mapping" aria-label="Remove mapping">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>`;

  const sourceSelect = row.querySelector('.mapping-source');
  const valueContainer = row.querySelector('.mapping-value-container');

  function renderValueField(src, val) {
    valueContainer.innerHTML = '';
    if (src === 'Alert context field') {
      const select = document.createElement('select');
      select.className = 'form-select mapping-value alert-field-select';
      ALERT_CONTEXT_FIELDS.forEach((f) => {
        const opt = document.createElement('option');
        opt.value = f.value;
        opt.textContent = `${f.label} — ${f.description}`;
        if (f.value === val) opt.selected = true;
        select.appendChild(opt);
      });
      if (!val && ALERT_CONTEXT_FIELDS.length) select.value = ALERT_CONTEXT_FIELDS[0].value;
      select.addEventListener('change', updatePayloadPreview);
      valueContainer.appendChild(select);
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-input mapping-value';
      input.placeholder = src === 'Scenario tag' ? 'Tag name' : 'Value';
      input.value = val;
      input.addEventListener('input', updatePayloadPreview);
      valueContainer.appendChild(input);
    }
  }

  renderValueField(source, value);

  sourceSelect.addEventListener('change', () => {
    renderValueField(sourceSelect.value, '');
    updatePayloadPreview();
  });

  row.querySelector('.mapping-target').addEventListener('input', updatePayloadPreview);
  row.querySelector('.remove-mapping').addEventListener('click', () => {
    row.remove();
    updatePayloadPreview();
  });

  els.mappingsContainer.appendChild(row);
  updatePayloadPreview();
}

function collectMappings() {
  const rows = els.mappingsContainer.querySelectorAll('.mapping-row');
  const mappings = [];
  rows.forEach((row) => {
    const targetKey = row.querySelector('.mapping-target').value.trim();
    const source = row.querySelector('.mapping-source').value;
    const valueEl = row.querySelector('.mapping-value');
    const value = valueEl ? valueEl.value.trim() : '';
    if (targetKey) mappings.push({ targetKey, source, value });
  });
  return mappings;
}

/* ── Payload mode toggle ── */
function setPayloadMode(mode) {
  els.modeMapping.classList.toggle('active', mode === 'mapping');
  els.modeJson.classList.toggle('active', mode === 'json');
  els.mappingSection.classList.toggle('hidden', mode === 'json');
  els.jsonSection.classList.toggle('visible', mode === 'json');
  updatePayloadPreview();
}

function getPayloadMode() {
  return els.modeJson.classList.contains('active') ? 'json' : 'mapping';
}

/* ── Payload preview ── */
function resolveMappingValue(mapping) {
  const { source, value } = mapping;
  if (source === 'Alert context field') {
    return EXAMPLE_VALUES[value] || value;
  }
  if (source === 'Scenario tag') {
    return value ? `[tag:${value}]` : '';
  }
  return value;
}

function buildPayloadFromMappings(mappings) {
  const payload = {};
  mappings.forEach((m) => {
    if (m.targetKey) {
      payload[m.targetKey] = resolveMappingValue(m);
    }
  });
  return payload;
}

function updatePayloadPreview() {
  const mode = getPayloadMode();

  if (mode === 'json') {
    const text = els.customJsonInput.value.trim();
    if (!text) {
      els.payloadPreview.innerHTML = '<span class="payload-preview-empty">No custom JSON defined. Enter a JSON payload below.</span>';
      return;
    }
    try {
      const parsed = JSON.parse(text);
      els.payloadPreview.textContent = JSON.stringify(parsed, null, 2);
    } catch {
      els.payloadPreview.innerHTML = '<span class="payload-preview-empty" style="color: var(--danger);">Invalid JSON — fix errors to see preview.</span>';
    }
    return;
  }

  const mappings = collectMappings();
  if (!mappings.length) {
    els.payloadPreview.innerHTML = '<span class="payload-preview-empty">No mappings defined. Add mapping rows to preview the outgoing payload.</span>';
    return;
  }

  const payload = buildPayloadFromMappings(mappings);
  els.payloadPreview.textContent = JSON.stringify(payload, null, 2);
}

/* ── JSON validation ── */
function validateJsonField() {
  const text = els.customJsonInput.value.trim();
  if (!text) {
    els.jsonError.textContent = '';
    els.customJsonInput.classList.remove('error');
    return true;
  }
  try {
    JSON.parse(text);
    els.jsonError.textContent = '';
    els.customJsonInput.classList.remove('error');
    return true;
  } catch (e) {
    els.jsonError.textContent = `Invalid JSON: ${e.message}`;
    els.customJsonInput.classList.add('error');
    return false;
  }
}

/* ── Save ── */
function saveWebhook() {
  clearFormErrors();

  const name = els.nameInput.value.trim();
  const service = els.serviceSelect.value;
  const url = els.urlInput.value.trim();
  const oauth = els.oauthToggle.checked;
  const headers = collectHeaders();
  const mappings = collectMappings();
  const payloadMode = getPayloadMode();
  const customJson = els.customJsonInput.value;

  let hasError = false;

  if (!name) {
    els.nameInput.classList.add('error');
    hasError = true;
  }
  if (!url) {
    els.urlInput.classList.add('error');
    hasError = true;
  }

  if (payloadMode === 'json' && customJson.trim() && !validateJsonField()) {
    hasError = true;
  }

  if (hasError) return;

  const data = { name, service, url, oauth, headers, mappings, payloadMode, customJson };

  if (editingId !== null) {
    const idx = webhooks.findIndex((w) => w.id === editingId);
    if (idx !== -1) webhooks[idx] = { ...webhooks[idx], ...data };
  } else {
    webhooks.push({ id: nextId++, ...data });
  }

  renderTable();
  closePanel();
}

function clearFormErrors() {
  els.nameInput.classList.remove('error');
  els.urlInput.classList.remove('error');
}

/* ── Delete ── */
let deleteTargetId = null;

function confirmDelete(id) {
  const wh = webhooks.find((w) => w.id === id);
  if (!wh) return;
  deleteTargetId = id;
  els.confirmMessage.textContent = `Are you sure you want to delete the webhook "${wh.name}"?`;
  els.confirmOverlay.classList.add('open');
  els.confirmDialog.classList.add('open');

  els.confirmOk.onclick = () => {
    webhooks = webhooks.filter((w) => w.id !== deleteTargetId);
    deleteTargetId = null;
    renderTable();
    closeConfirm();
  };
}

function closeConfirm() {
  els.confirmOverlay.classList.remove('open');
  els.confirmDialog.classList.remove('open');
  deleteTargetId = null;
}

/* ── Utilities ── */
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
