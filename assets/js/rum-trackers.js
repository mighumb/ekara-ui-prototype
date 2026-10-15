/**
 * Settings — RUM Trackers (threshold drawer, multi-metric)
 */

const THRESHOLDS_STORAGE_KEY = 'ekara-prototype-rum-tracker-thresholds';

const METRIC_CATALOG = [
  { id: 'tti', label: 'TTI (Time To Interact)' },
  { id: 'dom-interactive', label: 'DOM Interactive' },
  { id: 'ont', label: 'ONT (Overall Navigation Timing)' },
  { id: 'fplt', label: 'FPLT (Full Page Loading Time)' },
  { id: 'lcp', label: 'LCP (Largest Contentful Paint)' },
  { id: 'inp', label: 'INP (Interaction to Next Paint)' },
  { id: 'cls', label: 'CLS (Cumulative Layout Shift)' },
  { id: 'fcp', label: 'FCP (First Contentful Paint)' },
  { id: 'ttfb', label: 'TTFB (Time To First Byte)' },
  { id: 'avg-dns', label: 'Avg DNS (DNS Response Time)' },
  { id: 'bplt', label: 'BPLT (Base Page Loading Time)' },
  { id: 'other', label: 'Other metrics' },
];

const DEFAULT_THRESHOLD_VALUES = {
  satisfaction: { satisfied: 1, tolerating: 3 },
  performance: { fast: 1, average: 3, slow: 4 },
};

const DEFAULT_TRACKERS = [
  {
    id: 1,
    active: true,
    application: '3615-15_new',
    name: '1111',
    uid: 'TRACKER_AGENT_',
    ratio: '100%',
    scopeRum: true,
    scopeBrowserAgent: false,
  },
  {
    id: 2,
    active: true,
    application: '3615-2',
    name: 'Tracker demo',
    uid: 'TRACKER_DEMO_01',
    ratio: '100%',
    scopeRum: true,
    scopeBrowserAgent: true,
  },
  {
    id: 3,
    active: false,
    application: 'Application cva',
    name: 'CVA storefront',
    uid: 'TRACKER_CVA_02',
    ratio: '50%',
    scopeRum: true,
    scopeBrowserAgent: false,
  },
];

let trackers = [...DEFAULT_TRACKERS];
let thresholdsByTracker = {};
let draftMetrics = [];
let editingTrackerId = null;
let openMenuId = null;
let savedScrollY = 0;
let blockIdSeq = 0;

const els = {};

document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  loadThresholds();
  renderTable();
  bindEvents();
  initSidebarGroups();
});

function cacheElements() {
  els.tableBody = document.getElementById('tracker-table-body');
  els.overlay = document.getElementById('modal-overlay');
  els.panel = document.getElementById('slide-panel');
  els.panelBody = document.getElementById('panel-body');
  els.panelTitle = document.getElementById('panel-title');
  els.panelSubtitle = document.getElementById('panel-subtitle');
  els.metricsContainer = document.getElementById('metrics-container');
  els.btnAddMetric = document.getElementById('btn-add-metric');
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

function bindEvents() {
  document.getElementById('panel-close').addEventListener('click', closePanel);
  document.getElementById('btn-cancel').addEventListener('click', closePanel);
  document.getElementById('btn-save').addEventListener('click', saveThresholds);
  els.overlay.addEventListener('click', closePanel);
  els.btnAddMetric.addEventListener('click', addMetricBlock);

  document.addEventListener('click', () => closeAllMenus());
}

function loadThresholds() {
  try {
    const raw = localStorage.getItem(THRESHOLDS_STORAGE_KEY);
    if (raw) thresholdsByTracker = JSON.parse(raw);
  } catch {
    thresholdsByTracker = {};
  }
}

function persistThresholds() {
  localStorage.setItem(THRESHOLDS_STORAGE_KEY, JSON.stringify(thresholdsByTracker));
}

function defaultMetricsForTracker(trackerId) {
  const saved = thresholdsByTracker[String(trackerId)];
  if (saved && saved.length) {
    return saved.map(cloneMetricBlock);
  }
  return [createMetricBlock('tti', { ...DEFAULT_THRESHOLD_VALUES })];
}

function createMetricBlock(metricId, values) {
  blockIdSeq += 1;
  return {
    blockId: `b-${blockIdSeq}`,
    metricId,
    satisfaction: { ...values.satisfaction },
    performance: { ...values.performance },
  };
}

function cloneMetricBlock(block) {
  return createMetricBlock(block.metricId, {
    satisfaction: { ...block.satisfaction },
    performance: { ...block.performance },
  });
}

function trackerStatusIconSvg(active) {
  if (active) {
    return `<svg class="rum-tracker-status-icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="8"/>
      <path d="M6.2 4.8v6.4L11.6 8z"/>
    </svg>`;
  }
  return `<svg class="rum-tracker-status-icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="8"/>
    <rect x="5.25" y="5.25" width="5.5" height="5.5" rx="0.5"/>
  </svg>`;
}

function formatScopeCell(row) {
  const parts = [];
  if (row.scopeRum) parts.push('RUM');
  if (row.scopeBrowserAgent) parts.push('Browser Agent');
  return parts.length ? parts.join(', ') : '—';
}

function renderTable() {
  els.tableBody.innerHTML = trackers
    .map((row) => {
      const statusClass = row.active ? 'rum-tracker-status--active' : 'rum-tracker-status--inactive';
      const statusLabel = row.active ? 'Active' : 'Inactive';
      const scope = formatScopeCell(row);
      return `
    <div class="data-table-row" data-tracker-id="${row.id}">
      <div class="data-table-cell">
        <input type="checkbox" class="data-table-checkbox" aria-label="Select ${escapeHtml(row.name)}">
      </div>
      <div class="data-table-cell">
        <span class="rum-tracker-status ${statusClass}" role="img" aria-label="${statusLabel}">
          ${trackerStatusIconSvg(row.active)}
        </span>
      </div>
      <div class="data-table-cell">${escapeHtml(row.application)}</div>
      <div class="data-table-cell">${escapeHtml(row.name)}</div>
      <div class="data-table-cell">${escapeHtml(row.uid)}</div>
      <div class="data-table-cell">${escapeHtml(row.ratio)}</div>
      <div class="data-table-cell">${escapeHtml(scope)}</div>
      <div class="data-table-actions">
        <button type="button" class="btn-icon menu-trigger" data-id="${row.id}" aria-label="Actions">
          <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
        </button>
        <div class="dropdown-menu" id="menu-${row.id}">
          <div class="dropdown-item" data-action="thresholds" data-id="${row.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
            Thresholds
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
      if (action === 'thresholds') openThresholdsDrawer(id);
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

function openThresholdsDrawer(trackerId) {
  const tracker = trackers.find((t) => t.id === trackerId);
  if (!tracker) return;
  editingTrackerId = trackerId;
  draftMetrics = defaultMetricsForTracker(trackerId);
  els.panelTitle.textContent = `${tracker.name} – RUM threshold`;
  els.panelSubtitle.textContent = 'Set satisfaction and performance thresholds for your RUM metrics';
  renderMetricBlocks();
  updateAddMetricButton();
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
  editingTrackerId = null;
  draftMetrics = [];
}

function saveThresholds() {
  if (editingTrackerId == null) return;
  const payload = draftMetrics.map((block) => ({
    metricId: block.metricId,
    satisfaction: { ...block.satisfaction },
    performance: { ...block.performance },
  }));
  thresholdsByTracker[String(editingTrackerId)] = payload;
  persistThresholds();
  closePanel();
}

function getUsedMetricIds(excludeBlockId) {
  return draftMetrics.filter((b) => b.blockId !== excludeBlockId).map((b) => b.metricId);
}

function getNextAvailableMetricId() {
  const used = new Set(draftMetrics.map((b) => b.metricId));
  const next = METRIC_CATALOG.find((m) => !used.has(m.id));
  return next ? next.id : null;
}

function updateAddMetricButton() {
  const canAdd = draftMetrics.length < METRIC_CATALOG.length;
  els.btnAddMetric.disabled = !canAdd;
}

function addMetricBlock() {
  const metricId = getNextAvailableMetricId();
  if (!metricId) return;
  draftMetrics.push(createMetricBlock(metricId, { ...DEFAULT_THRESHOLD_VALUES }));
  renderMetricBlocks();
  updateAddMetricButton();
}

function removeMetricBlock(blockId) {
  if (draftMetrics.length <= 1) return;
  draftMetrics = draftMetrics.filter((b) => b.blockId !== blockId);
  renderMetricBlocks();
  updateAddMetricButton();
}

function renderMetricBlocks() {
  els.metricsContainer.innerHTML = '';
  draftMetrics.forEach((block, index) => {
    const el = buildMetricBlockElement(block, index);
    els.metricsContainer.appendChild(el);
  });
  window.EkaraInlineSelect?.scan(els.metricsContainer);
  draftMetrics.forEach((block) => {
    const blockEl = els.metricsContainer.querySelector(`[data-block-id="${block.blockId}"]`);
    if (blockEl) updateThresholdBars(blockEl, block);
  });
}

function buildMetricBlockElement(block, index) {
  const wrap = document.createElement('div');
  wrap.className = 'rum-threshold-block';
  wrap.dataset.blockId = block.blockId;
  const canRemove = draftMetrics.length > 1;
  const selectId = `metric-select-${block.blockId}`;
  const options = optionsHtmlForBlock(block.blockId, block.metricId);

  wrap.innerHTML = `
    <div class="rum-threshold-block-header">
      <span class="form-label" id="${selectId}-label">RUM metrics</span>
      <button type="button" class="btn-icon remove-metric-block${canRemove ? '' : ' hidden'}" aria-label="Remove metric" data-block-id="${escapeAttr(block.blockId)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="form-group rum-threshold-metric-select">
      <div class="form-select-wrap" data-ekara-inline-select>
        <select class="form-select rum-metric-select" id="${selectId}" aria-labelledby="${selectId}-label" data-block-id="${escapeAttr(block.blockId)}">
          ${options}
        </select>
      </div>
    </div>
    <div class="rum-threshold-section">
      <h3 class="rum-threshold-section-title">Satisfaction thresholds</h3>
      ${thresholdRow('satisfied', 'Satisfied', block.satisfaction.satisfied, 'rum-threshold-row-label--satisfied')}
      ${thresholdRow('tolerating', 'Tolerating', block.satisfaction.tolerating, 'rum-threshold-row-label--tolerating')}
      <div class="rum-threshold-bar rum-threshold-bar--satisfaction" aria-hidden="true">
        <span class="rum-threshold-bar-seg rum-threshold-bar-seg--good" data-seg="sat-good"></span>
        <span class="rum-threshold-bar-seg rum-threshold-bar-seg--mid" data-seg="sat-mid"></span>
        <span class="rum-threshold-bar-seg rum-threshold-bar-seg--poor" data-seg="sat-poor"></span>
      </div>
    </div>
    <div class="rum-threshold-section">
      <h3 class="rum-threshold-section-title">Performance thresholds</h3>
      ${thresholdRow('fast', 'Fast', block.performance.fast, 'rum-threshold-row-label--fast')}
      ${thresholdRow('average', 'Average', block.performance.average, 'rum-threshold-row-label--average')}
      ${thresholdRow('slow', 'Slow', block.performance.slow, 'rum-threshold-row-label--slow')}
      <div class="rum-threshold-bar rum-threshold-bar--performance" aria-hidden="true">
        <span class="rum-threshold-bar-seg rum-threshold-bar-seg--good" data-seg="perf-good"></span>
        <span class="rum-threshold-bar-seg rum-threshold-bar-seg--mid" data-seg="perf-mid"></span>
        <span class="rum-threshold-bar-seg rum-threshold-bar-seg--warn" data-seg="perf-warn"></span>
        <span class="rum-threshold-bar-seg rum-threshold-bar-seg--poor" data-seg="perf-poor"></span>
      </div>
    </div>
    ${index < draftMetrics.length - 1 ? '<hr class="section-divider rum-threshold-block-divider">' : ''}
  `;

  const select = wrap.querySelector('.rum-metric-select');
  select.addEventListener('change', () => {
    const b = draftMetrics.find((m) => m.blockId === block.blockId);
    if (!b) return;
    b.metricId = select.value;
    refreshAllMetricSelects();
  });

  wrap.querySelectorAll('.rum-threshold-input').forEach((input) => {
    input.addEventListener('input', () => {
      const b = draftMetrics.find((m) => m.blockId === block.blockId);
      if (!b) return;
      const val = parseThresholdNumber(input.value);
      const field = input.dataset.field;
      const group = input.dataset.group;
      if (group === 'satisfaction' && field in b.satisfaction) {
        b.satisfaction[field] = val;
      }
      if (group === 'performance' && field in b.performance) {
        b.performance[field] = val;
      }
      updateThresholdBars(wrap, b);
    });
  });

  const removeBtn = wrap.querySelector('.remove-metric-block');
  removeBtn?.addEventListener('click', () => removeMetricBlock(block.blockId));

  return wrap;
}

function thresholdRow(field, label, value, labelClass) {
  const group = ['satisfied', 'tolerating'].includes(field) ? 'satisfaction' : 'performance';
  return `
    <div class="rum-threshold-row">
      <span class="rum-threshold-row-label ${labelClass}">${label}</span>
      <span class="rum-threshold-row-op" aria-hidden="true">&le;</span>
      <input type="text" class="form-input rum-threshold-input" inputmode="decimal" data-group="${group}" data-field="${field}" value="${escapeAttr(formatThresholdValue(value))}">
      <span class="rum-threshold-unit">s</span>
    </div>`;
}

function optionsHtmlForBlock(blockId, selectedId) {
  const used = getUsedMetricIds(blockId);
  return METRIC_CATALOG
    .filter((m) => m.id === selectedId || !used.includes(m.id))
    .map(
      (m) =>
        `<option value="${escapeAttr(m.id)}"${m.id === selectedId ? ' selected' : ''}>${escapeHtml(m.label)}</option>`,
    )
    .join('');
}

function refreshAllMetricSelects() {
  draftMetrics.forEach((block) => {
    const select = els.metricsContainer.querySelector(`select[data-block-id="${block.blockId}"]`);
    if (!select) return;
    const wrap = select.closest('[data-ekara-inline-select]');
    destroyInlineSelect(wrap);
    select.innerHTML = optionsHtmlForBlock(block.blockId, block.metricId);
    if (!select.value) {
      block.metricId = select.options[0]?.value || block.metricId;
      select.value = block.metricId;
    }
    window.EkaraInlineSelect.init(wrap);
  });
  updateAddMetricButton();
}

function destroyInlineSelect(wrap) {
  if (!wrap) return;
  const select = wrap.querySelector('select');
  if (!select) return;
  wrap.querySelector('.ekara-inline-select-control')?.remove();
  wrap.querySelector('.ekara-inline-select-menu')?.remove();
  select.classList.remove('hidden');
  select.removeAttribute('tabindex');
  select.removeAttribute('aria-hidden');
  delete wrap.dataset.ekaraInlineSelectReady;
}

function parseThresholdNumber(raw) {
  const n = parseFloat(String(raw).replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function formatThresholdValue(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return '0';
  return String(num);
}

function updateThresholdBars(blockEl, block) {
  const sat = block.satisfaction;
  const perf = block.performance;
  const satTotal = Math.max(sat.satisfied + sat.tolerating, 0.001);
  setBarSegment(blockEl, 'sat-good', sat.satisfied / satTotal);
  setBarSegment(blockEl, 'sat-mid', Math.max(sat.tolerating - sat.satisfied, 0) / satTotal);
  setBarSegment(blockEl, 'sat-poor', 0.35);

  const perfMax = Math.max(perf.slow, 0.001);
  setBarSegment(blockEl, 'perf-good', perf.fast / perfMax);
  setBarSegment(blockEl, 'perf-mid', Math.max(perf.average - perf.fast, 0) / perfMax);
  setBarSegment(blockEl, 'perf-warn', Math.max(perf.slow - perf.average, 0) / perfMax);
  setBarSegment(blockEl, 'perf-poor', 0.15);
}

function setBarSegment(blockEl, segKey, ratio) {
  const seg = blockEl.querySelector(`[data-seg="${segKey}"]`);
  if (seg) seg.style.flex = `${Math.max(ratio, 0.05)} 1 0`;
}

function updatePanelBodyScroll() {
  if (!els.panelBody) return;
  requestAnimationFrame(() => {
    const overflow = els.panelBody.scrollHeight > els.panelBody.clientHeight;
    els.panelBody.classList.toggle('can-scroll', overflow);
  });
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

function escapeAttr(str) {
  return escapeHtml(str);
}
