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
  Custom:
    'Define a custom JSON payload by mapping Ekara fields and scenario tags to target keys in the request body.',
};

const ALERT_CONTEXT_FIELDS = [
  { value: '@StartTime', label: '@StartTime', description: 'Alert start date/time' },
  { value: '@EndTime', label: '@EndTime', description: 'Alert end date/time' },
  { value: '@AlertDesc', label: '@AlertDesc', description: 'Alert description' },
  { value: '@ScenarioName', label: '@ScenarioName', description: 'Scenario name' },
];

const SCENARIO_TAGS = ['abcd', 'bbb', 'Param1', 'DFY-18578-2', 'DFY-18578-3'];

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
    tokenEndpoint: '',
    clientId: '',
    clientSecret: '',
    scopes: '',
    headers: [],
    mappings: [],
    routingKey: '',
  },
  {
    id: 2,
    name: '00tagsTeam',
    service: 'Teams',
    url: 'https://iplabel.webhook.office.com/webhookb2/abc123-def456/IncomingWebhook/xyz789',
    oauth: false,
    tokenEndpoint: '',
    clientId: '',
    clientSecret: '',
    scopes: '',
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    mappings: [],
    routingKey: '',
  },
  {
    id: 3,
    name: 'clone webhook1',
    service: 'Generic',
    url: 'https://webhook.site/clone-webhook-1',
    oauth: false,
    tokenEndpoint: '',
    clientId: '',
    clientSecret: '',
    scopes: '',
    headers: [],
    mappings: [],
    routingKey: '',
  },
  {
    id: 4,
    name: 'CVA Pagerduty',
    service: 'PagerDuty',
    url: 'https://events.pagerduty.com/v2/enqueue',
    oauth: false,
    tokenEndpoint: '',
    clientId: '',
    clientSecret: '',
    scopes: '',
    headers: [],
    mappings: [],
    routingKey: 'abc123integrationkey',
  },
  {
    id: 5,
    name: 'CVA-WeChat',
    service: 'WeCom',
    url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=abc-def-123',
    oauth: false,
    tokenEndpoint: '',
    clientId: '',
    clientSecret: '',
    scopes: '',
    headers: [],
    mappings: [],
    routingKey: '',
  },
];

let nextId = 6;
let editingId = null;
let openMenuId = null;
let draggedMappingRow = null;

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
    oauthFieldsSection: document.getElementById('oauth-fields-section'),
    tokenEndpointInput: document.getElementById('field-token-endpoint'),
    clientIdInput: document.getElementById('field-client-id'),
    clientSecretInput: document.getElementById('field-client-secret'),
    scopesInput: document.getElementById('field-scopes'),
    nameError: document.getElementById('error-name'),
    urlError: document.getElementById('error-url'),
    tokenEndpointError: document.getElementById('error-token-endpoint'),
    clientIdError: document.getElementById('error-client-id'),
    clientSecretError: document.getElementById('error-client-secret'),
    scopesError: document.getElementById('error-scopes'),
    routingKeyInput: document.getElementById('field-routing-key'),
    pagerdutySection: document.getElementById('pagerduty-section'),
    customSectionDivider: document.getElementById('custom-section-divider'),
    headersContainer: document.getElementById('headers-container'),
    headerColumnLabels: document.getElementById('header-column-labels'),
    mappingsContainer: document.getElementById('mappings-container'),
    mappingColumnLabels: document.getElementById('mapping-column-labels'),
    mappingSection: document.getElementById('mapping-section'),
    payloadPreviewSection: document.getElementById('payload-preview-section'),
    payloadPreview: document.getElementById('payload-preview-content'),
    saveBtn: document.getElementById('save-btn'),
    confirmOverlay: document.getElementById('confirm-overlay'),
    confirmDialog: document.getElementById('confirm-dialog'),
    confirmMessage: document.getElementById('confirm-message'),
    confirmCancel: document.getElementById('confirm-cancel'),
    confirmOk: document.getElementById('confirm-ok'),
  };

  renderTable();
  bindGlobalEvents();
  initMappingDragDrop();
}

function bindGlobalEvents() {
  document.getElementById('btn-add-webhook').addEventListener('click', () => openPanel('create'));
  document.getElementById('panel-close').addEventListener('click', closePanel);
  document.getElementById('btn-cancel').addEventListener('click', closePanel);
  els.overlay.addEventListener('click', closePanel);
  els.saveBtn.addEventListener('click', saveWebhook);

  els.serviceSelect.addEventListener('change', onServiceChange);
  els.oauthToggle.addEventListener('change', updateOAuthFieldsVisibility);
  document.getElementById('btn-add-header').addEventListener('click', () => addHeaderRow());
  document.getElementById('btn-add-mapping').addEventListener('click', () => addMappingRow());

  bindFieldErrorClearing();

  els.confirmCancel.addEventListener('click', closeConfirm);
  els.confirmOverlay.addEventListener('click', closeConfirm);

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.data-table-actions')) {
      closeAllMenus();
    }
  });
}

function onServiceChange() {
  updateServiceHelp();
  updateServiceSections();
  updatePanelBodyScroll();
}

const VALIDATED_FIELDS = [];

function bindFieldErrorClearing() {
  VALIDATED_FIELDS.length = 0;
  const fields = [
    { input: els.nameInput, error: els.nameError },
    { input: els.urlInput, error: els.urlError },
    { input: els.tokenEndpointInput, error: els.tokenEndpointError },
    { input: els.clientIdInput, error: els.clientIdError },
    { input: els.clientSecretInput, error: els.clientSecretError },
    { input: els.scopesInput, error: els.scopesError },
  ];
  fields.forEach((field) => {
    VALIDATED_FIELDS.push(field);
    field.input.addEventListener('input', () => clearFieldError(field));
  });
}

function clearFieldError({ input, error }) {
  input.classList.remove('error');
  error.textContent = '';
}

function setFieldError({ input, error }, message) {
  input.classList.add('error');
  error.textContent = message;
}

function updateOAuthFieldsVisibility() {
  els.oauthFieldsSection.classList.toggle('hidden', !els.oauthToggle.checked);
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
  lockPageScroll();
  updatePanelBodyScroll();
}

function closePanel() {
  els.overlay.classList.remove('open');
  els.panel.classList.remove('open');
  const panelBody = document.querySelector('.slide-panel-body');
  if (panelBody) panelBody.classList.remove('is-scrollable');
  unlockPageScroll();
  editingId = null;
  clearFormErrors();
}

function resetForm() {
  els.nameInput.value = '';
  els.serviceSelect.value = 'Generic';
  els.urlInput.value = '';
  els.oauthToggle.checked = false;
  els.tokenEndpointInput.value = '';
  els.clientIdInput.value = '';
  els.clientSecretInput.value = '';
  els.scopesInput.value = '';
  els.routingKeyInput.value = '';
  els.headersContainer.innerHTML = '';
  updateHeaderLabelsVisibility();
  els.mappingsContainer.innerHTML = '';
  updateMappingLabelsVisibility();
  updateOAuthFieldsVisibility();
  onServiceChange();
  updatePayloadPreview();
  clearFormErrors();
}

function populateForm(wh) {
  els.nameInput.value = wh.name;
  els.serviceSelect.value = wh.service;
  els.urlInput.value = wh.url;
  els.oauthToggle.checked = wh.oauth;
  els.tokenEndpointInput.value = wh.tokenEndpoint || '';
  els.clientIdInput.value = wh.clientId || '';
  els.clientSecretInput.value = wh.clientSecret || '';
  els.scopesInput.value = wh.scopes || '';
  els.routingKeyInput.value = wh.routingKey || '';

  els.headersContainer.innerHTML = '';
  (wh.headers || []).forEach((h) => addHeaderRow(h.key, h.value));
  updateHeaderLabelsVisibility();

  els.mappingsContainer.innerHTML = '';
  (wh.mappings || []).forEach((m) => addMappingRow(m.targetKey, m.source, m.value));
  updateMappingLabelsVisibility();

  updateOAuthFieldsVisibility();
  onServiceChange();
  updatePayloadPreview();
  clearFormErrors();
}

/* ── Service-specific sections ── */
function updateServiceHelp() {
  const service = els.serviceSelect.value;
  els.serviceHelp.textContent = SERVICE_HELP[service] || '';
}

function updateServiceSections() {
  const service = els.serviceSelect.value;
  const isCustom = service === 'Custom';
  const isPagerDuty = service === 'PagerDuty';

  els.mappingSection.classList.toggle('hidden', !isCustom);
  els.payloadPreviewSection.classList.toggle('hidden', !isCustom);
  els.customSectionDivider.classList.toggle('hidden', !isCustom);
  els.pagerdutySection.classList.toggle('hidden', !isPagerDuty);
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
    updateHeaderLabelsVisibility();
  });
  els.headersContainer.appendChild(row);
  updateHeaderLabelsVisibility();
}

function updateHeaderLabelsVisibility() {
  const hasRows = els.headersContainer.querySelectorAll('.header-row').length > 0;
  els.headerColumnLabels.classList.toggle('hidden', !hasRows);
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
const MAPPING_DRAG_HANDLE_SVG = `<svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" aria-hidden="true"><circle cx="4" cy="3" r="1.5"/><circle cx="8" cy="3" r="1.5"/><circle cx="4" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="4" cy="13" r="1.5"/><circle cx="8" cy="13" r="1.5"/></svg>`;

function initMappingDragDrop() {
  const container = els.mappingsContainer;

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!draggedMappingRow) return;
    const afterElement = getMappingDragAfterElement(container, e.clientY);
    if (afterElement == null) {
      container.appendChild(draggedMappingRow);
    } else if (afterElement !== draggedMappingRow) {
      container.insertBefore(draggedMappingRow, afterElement);
    }
  });

  container.addEventListener('drop', (e) => {
    e.preventDefault();
  });
}

function setupMappingRowDrag(row) {
  const handle = row.querySelector('.mapping-drag-handle');

  handle.addEventListener('mousedown', () => {
    row.dataset.dragFromHandle = 'true';
  });

  handle.addEventListener('mouseup', () => {
    if (!row.classList.contains('mapping-row--dragging')) {
      delete row.dataset.dragFromHandle;
    }
  });

  row.addEventListener('dragstart', (e) => {
    if (row.dataset.dragFromHandle !== 'true') {
      e.preventDefault();
      return;
    }
    draggedMappingRow = row;
    row.classList.add('mapping-row--dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  });

  row.addEventListener('dragend', () => {
    row.classList.remove('mapping-row--dragging');
    delete row.dataset.dragFromHandle;
    draggedMappingRow = null;
    updatePayloadPreview();
  });
}

function getMappingDragAfterElement(container, y) {
  const rows = [...container.querySelectorAll('.mapping-row:not(.mapping-row--dragging)')];
  return rows.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function addMappingRow(targetKey = '', source = 'Static value', value = '') {
  const row = document.createElement('div');
  row.className = 'mapping-row';
  row.draggable = true;
  row.innerHTML = `
    <div class="mapping-drag-handle" role="button" tabindex="0" aria-label="Drag to reorder">${MAPPING_DRAG_HANDLE_SVG}</div>
    <div class="mapping-field">
      <input type="text" class="form-input mapping-target" placeholder="Target key" value="${escapeAttr(targetKey)}">
      <div class="form-error mapping-target-error"></div>
    </div>
    <select class="form-select mapping-source">${SOURCE_TYPES.map((s) => `<option value="${s}"${s === source ? ' selected' : ''}>${s}</option>`).join('')}</select>
    <div class="mapping-value-cell">
      <div class="mapping-value-container"></div>
      <div class="form-error mapping-value-error"></div>
    </div>
    <button type="button" class="btn-icon remove-mapping" aria-label="Remove mapping">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>`;

  const sourceSelect = row.querySelector('.mapping-source');
  const valueContainer = row.querySelector('.mapping-value-container');
  const targetInput = row.querySelector('.mapping-target');
  const targetError = row.querySelector('.mapping-target-error');
  const valueError = row.querySelector('.mapping-value-error');

  function clearValueError() {
    const valueEl = row.querySelector('.mapping-value');
    if (valueEl) valueEl.classList.remove('error');
    valueError.textContent = '';
  }

  function renderValueField(src, val) {
    valueContainer.innerHTML = '';
    clearValueError();
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
      select.addEventListener('change', () => {
        clearValueError();
        updatePayloadPreview();
      });
      valueContainer.appendChild(select);
    } else if (src === 'Scenario tag') {
      const select = document.createElement('select');
      select.className = 'form-select mapping-value scenario-tag-select';
      const emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.textContent = 'Select a tag';
      select.appendChild(emptyOpt);
      SCENARIO_TAGS.forEach((tag) => {
        const opt = document.createElement('option');
        opt.value = tag;
        opt.textContent = tag;
        if (tag === val) opt.selected = true;
        select.appendChild(opt);
      });
      if (val && !SCENARIO_TAGS.includes(val)) {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        opt.selected = true;
        select.appendChild(opt);
      }
      select.addEventListener('change', () => {
        clearValueError();
        updatePayloadPreview();
      });
      valueContainer.appendChild(select);
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-input mapping-value';
      input.placeholder = 'Value';
      input.value = val;
      input.addEventListener('input', () => {
        clearValueError();
        updatePayloadPreview();
      });
      valueContainer.appendChild(input);
    }
  }

  renderValueField(source, value);

  sourceSelect.addEventListener('change', () => {
    renderValueField(sourceSelect.value, '');
    updatePayloadPreview();
  });

  targetInput.addEventListener('input', () => {
    targetInput.classList.remove('error');
    targetError.textContent = '';
    updatePayloadPreview();
  });

  row.querySelector('.remove-mapping').addEventListener('click', () => {
    row.remove();
    updateMappingLabelsVisibility();
    updatePayloadPreview();
  });

  setupMappingRowDrag(row);
  els.mappingsContainer.appendChild(row);
  updateMappingLabelsVisibility();
  updatePayloadPreview();
}

function updateMappingLabelsVisibility() {
  const hasRows = els.mappingsContainer.querySelectorAll('.mapping-row').length > 0;
  els.mappingColumnLabels.classList.toggle('hidden', !hasRows);
}

function clearMappingErrors() {
  els.mappingsContainer.querySelectorAll('.mapping-row').forEach((row) => {
    const targetInput = row.querySelector('.mapping-target');
    const targetError = row.querySelector('.mapping-target-error');
    const valueEl = row.querySelector('.mapping-value');
    const valueError = row.querySelector('.mapping-value-error');
    if (targetInput) targetInput.classList.remove('error');
    if (targetError) targetError.textContent = '';
    if (valueEl) valueEl.classList.remove('error');
    if (valueError) valueError.textContent = '';
  });
}

function validateMappings() {
  const rows = els.mappingsContainer.querySelectorAll('.mapping-row');
  let isValid = true;

  rows.forEach((row) => {
    const targetInput = row.querySelector('.mapping-target');
    const targetError = row.querySelector('.mapping-target-error');
    const valueEl = row.querySelector('.mapping-value');
    const valueError = row.querySelector('.mapping-value-error');
    const targetKey = targetInput ? targetInput.value.trim() : '';
    const value = valueEl ? valueEl.value.trim() : '';

    if (!targetKey) {
      targetInput.classList.add('error');
      targetError.textContent = 'This field is required';
      isValid = false;
    }

    if (!value) {
      if (valueEl) valueEl.classList.add('error');
      valueError.textContent = 'This field is required';
      isValid = false;
    }
  });

  return isValid;
}

function collectMappings() {
  const rows = els.mappingsContainer.querySelectorAll('.mapping-row');
  const mappings = [];
  rows.forEach((row) => {
    const targetKey = row.querySelector('.mapping-target').value.trim();
    const source = row.querySelector('.mapping-source').value;
    const valueEl = row.querySelector('.mapping-value');
    const value = valueEl ? valueEl.value.trim() : '';
    if (targetKey && value) mappings.push({ targetKey, source, value });
  });
  return mappings;
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
  if (els.serviceSelect.value !== 'Custom') return;

  const mappings = collectMappings();
  if (!mappings.length) {
    els.payloadPreview.innerHTML =
      '<span class="payload-preview-empty">No mappings defined. Add mapping rows to preview the outgoing payload.</span>';
    return;
  }

  const payload = buildPayloadFromMappings(mappings);
  els.payloadPreview.textContent = JSON.stringify(payload, null, 2);
}

/* ── Save ── */
function saveWebhook() {
  clearFormErrors();

  const name = els.nameInput.value.trim();
  const service = els.serviceSelect.value;
  const url = els.urlInput.value.trim();
  const oauth = els.oauthToggle.checked;
  const tokenEndpoint = els.tokenEndpointInput.value.trim();
  const clientId = els.clientIdInput.value.trim();
  const clientSecret = els.clientSecretInput.value.trim();
  const scopes = els.scopesInput.value.trim();
  const headers = collectHeaders();
  const mappings = collectMappings();
  const routingKey = els.routingKeyInput.value.trim();

  let hasError = false;

  if (!name) {
    setFieldError({ input: els.nameInput, error: els.nameError }, 'Name required');
    hasError = true;
  }
  if (!url) {
    setFieldError({ input: els.urlInput, error: els.urlError }, 'URL required');
    hasError = true;
  }

  if (oauth) {
    if (!tokenEndpoint) {
      setFieldError({ input: els.tokenEndpointInput, error: els.tokenEndpointError }, 'This field is required');
      hasError = true;
    }
    if (!clientId) {
      setFieldError({ input: els.clientIdInput, error: els.clientIdError }, 'This field is required');
      hasError = true;
    }
    if (!clientSecret) {
      setFieldError({ input: els.clientSecretInput, error: els.clientSecretError }, 'This field is required');
      hasError = true;
    }
    if (!scopes) {
      setFieldError({ input: els.scopesInput, error: els.scopesError }, 'This field is required');
      hasError = true;
    }
  }

  if (service === 'Custom' && !validateMappings()) {
    hasError = true;
  }

  if (hasError) return;

  const data = {
    name,
    service,
    url,
    oauth,
    tokenEndpoint,
    clientId,
    clientSecret,
    scopes,
    headers,
    mappings,
    routingKey,
  };

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
  VALIDATED_FIELDS.forEach(clearFieldError);
  clearMappingErrors();
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

function updatePanelBodyScroll() {
  const panel = document.getElementById('slide-panel');
  const body = document.querySelector('.slide-panel-body');
  if (!panel || !body || !panel.classList.contains('open')) return;
  requestAnimationFrame(() => {
    const needsScroll = body.scrollHeight > body.clientHeight + 1;
    body.classList.toggle('is-scrollable', needsScroll);
  });
}

function lockPageScroll() {
  const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.classList.add('slide-panel-open');
  document.documentElement.style.paddingRight = `${scrollbarGap}px`;
  const topbar = document.querySelector('.topbar');
  if (topbar) topbar.style.paddingRight = `${scrollbarGap}px`;
}

function unlockPageScroll() {
  document.documentElement.classList.remove('slide-panel-open');
  document.documentElement.style.paddingRight = '';
  const topbar = document.querySelector('.topbar');
  if (topbar) topbar.style.paddingRight = '';
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
