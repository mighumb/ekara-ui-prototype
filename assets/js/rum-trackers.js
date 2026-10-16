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

const SAT_FIELDS = ['satisfied', 'tolerating', 'unacceptable'];

const ALL_SAT_EDIT = { satisfied: true, tolerating: true, unacceptable: true };
const ALL_SAT_LOCK = { satisfied: false, tolerating: false, unacceptable: false };

const PERF_LOCK_BOTH = { average: false, slow: false };

/** Official defaults; `editable: false` only where captures show grey read-only fields. */
const METRIC_THRESHOLD_PRESETS = {
  tti: {
    satisfaction: { values: { satisfied: 1, tolerating: 3, unacceptable: 4 }, editable: ALL_SAT_EDIT },
    performance: {
      layout: 'four',
      values: { satisfied: 1, tolerating: 3, unacceptable: 4 },
      editable: ALL_SAT_EDIT,
    },
  },
  'dom-interactive': {
    satisfaction: { values: { satisfied: 2, tolerating: 3, unacceptable: 4 }, editable: ALL_SAT_EDIT },
    performance: {
      layout: 'four',
      values: { satisfied: 1, tolerating: 3, unacceptable: 4 },
      editable: ALL_SAT_EDIT,
    },
  },
  ont: {
    satisfaction: { values: { satisfied: 1, tolerating: 3, unacceptable: 4 }, editable: ALL_SAT_EDIT },
    performance: {
      layout: 'four',
      values: { satisfied: 1, tolerating: 3, unacceptable: 4 },
      editable: ALL_SAT_LOCK,
      muted: true,
    },
  },
  fplt: {
    satisfaction: { values: { satisfied: 1, tolerating: 3, unacceptable: 4 }, editable: ALL_SAT_EDIT },
    performance: {
      layout: 'four',
      values: { satisfied: 1, tolerating: 3, unacceptable: 4 },
      editable: ALL_SAT_EDIT,
    },
  },
  lcp: {
    satisfaction: { values: { satisfied: 1, tolerating: 3, unacceptable: 4 }, editable: ALL_SAT_EDIT },
    performance: {
      layout: 'three',
      values: { average: 2.5, slow: 4 },
      editable: PERF_LOCK_BOTH,
      standardNote: true,
      muted: true,
    },
  },
  inp: {
    satisfaction: { values: { satisfied: 1, tolerating: 3, unacceptable: 4 }, editable: ALL_SAT_EDIT },
    performance: {
      layout: 'three',
      values: { average: 0.2, slow: 0.5 },
      editable: PERF_LOCK_BOTH,
      standardNote: true,
      muted: true,
    },
  },
  cls: {
    satisfaction: { values: { satisfied: 1, tolerating: 3, unacceptable: 4 }, editable: ALL_SAT_EDIT },
    performance: {
      layout: 'three',
      values: { average: 0.1, slow: 0.25 },
      editable: PERF_LOCK_BOTH,
      unit: 'none',
      standardNote: true,
      muted: true,
    },
  },
  fcp: {
    satisfaction: { values: { satisfied: 1, tolerating: 3, unacceptable: 4 }, editable: ALL_SAT_EDIT },
    performance: {
      layout: 'four',
      values: { satisfied: 1, tolerating: 3, unacceptable: 4 },
      editable: ALL_SAT_EDIT,
    },
  },
  ttfb: {
    satisfaction: { values: { satisfied: 1, tolerating: 3, unacceptable: 4 }, editable: ALL_SAT_EDIT },
    performance: {
      layout: 'three',
      values: { average: 0.2, slow: 0.5 },
      editable: PERF_LOCK_BOTH,
      standardNote: true,
      muted: true,
    },
  },
  'avg-dns': {
    satisfaction: { values: { satisfied: 1, tolerating: 3, unacceptable: 4 }, editable: ALL_SAT_EDIT },
    performance: {
      layout: 'three',
      values: { average: 0.1, slow: 0.14 },
      editable: PERF_LOCK_BOTH,
      standardNote: true,
      muted: true,
    },
  },
  bplt: {
    satisfaction: { values: { satisfied: 1, tolerating: 3, unacceptable: 4 }, editable: ALL_SAT_EDIT },
    performance: {
      layout: 'four',
      values: { satisfied: 1, tolerating: 3, unacceptable: 4 },
      editable: ALL_SAT_EDIT,
    },
  },
  other: {
    satisfaction: { values: { satisfied: 1, tolerating: 3, unacceptable: 4 }, editable: ALL_SAT_EDIT },
    performance: {
      layout: 'four',
      values: { satisfied: 1, tolerating: 3, unacceptable: 4 },
      editable: ALL_SAT_LOCK,
      standardNote: true,
      muted: true,
    },
  },
};

function getMetricPreset(metricId) {
  return METRIC_THRESHOLD_PRESETS[metricId] || METRIC_THRESHOLD_PRESETS.tti;
}

function isSatisfactionFieldEditable(metricId, field) {
  const preset = getMetricPreset(metricId);
  return preset.satisfaction.editable[field] !== false;
}

function isPerformanceFieldEditable(metricId, field) {
  const preset = getMetricPreset(metricId);
  const perf = preset.performance;
  if (perf.layout === 'four') {
    return perf.editable[field] !== false;
  }
  return perf.editable[field] !== false;
}

function applyMetricPresetToBlock(block) {
  const preset = getMetricPreset(block.metricId);
  block.satisfaction = { ...preset.satisfaction.values };
  const perf = preset.performance;
  if (perf.layout === 'four') {
    block.performance = {
      layout: 'four',
      satisfied: perf.values.satisfied,
      tolerating: perf.values.tolerating,
      unacceptable: perf.values.unacceptable,
    };
  } else {
    block.performance = {
      layout: 'three',
      average: perf.values.average,
      slow: perf.values.slow,
    };
  }
}

function mergeSavedMetricBlock(block, saved) {
  applyMetricPresetToBlock(block);
  if (!saved) return;
  SAT_FIELDS.forEach((field) => {
    if (isSatisfactionFieldEditable(block.metricId, field) && saved.satisfaction?.[field] != null) {
      block.satisfaction[field] = saved.satisfaction[field];
    }
  });
  const perf = getMetricPreset(block.metricId).performance;
  if (perf.layout === 'four') {
    SAT_FIELDS.forEach((field) => {
      if (isPerformanceFieldEditable(block.metricId, field) && saved.performance?.[field] != null) {
        block.performance[field] = saved.performance[field];
      }
    });
  } else {
    ['average', 'slow'].forEach((field) => {
      if (isPerformanceFieldEditable(block.metricId, field) && saved.performance?.[field] != null) {
        block.performance[field] = saved.performance[field];
      }
    });
  }
}

function enforceLockedThresholdValues(block) {
  const preset = getMetricPreset(block.metricId);
  SAT_FIELDS.forEach((field) => {
    if (!preset.satisfaction.editable[field]) {
      block.satisfaction[field] = preset.satisfaction.values[field];
    }
  });
  const perf = preset.performance;
  if (perf.layout === 'four') {
    SAT_FIELDS.forEach((field) => {
      if (!perf.editable[field]) {
        block.performance[field] = perf.values[field];
      }
    });
  } else {
    ['average', 'slow'].forEach((field) => {
      if (!perf.editable[field]) {
        block.performance[field] = perf.values[field];
      }
    });
  }
}

const THRESHOLD_ORDER_MESSAGES = [
  'The value of the second threshold must be higher than the first.',
  'The value of the third threshold must be higher than the second.',
];

const THRESHOLD_TOO_HIGH_VS_NEXT = [
  'The value of the first threshold must be lower than the second.',
  'The value of the second threshold must be lower than the third.',
];

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

  window.addEventListener('resize', () => {
    if (els.panel?.classList.contains('open')) updatePanelBodyScroll();
  });
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
  return [createMetricBlock('tti')];
}

function createMetricBlock(metricId) {
  blockIdSeq += 1;
  const block = {
    blockId: `b-${blockIdSeq}`,
    metricId,
  };
  applyMetricPresetToBlock(block);
  return block;
}

function cloneMetricBlock(block) {
  const fresh = createMetricBlock(block.metricId);
  mergeSavedMetricBlock(fresh, block);
  return fresh;
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
  draftMetrics.forEach((block) => enforceLockedThresholdValues(block));
  if (!validateAllMetricBlocks()) return;
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
  draftMetrics.push(createMetricBlock(metricId));
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
    if (blockEl) validateMetricBlock(blockEl, block);
  });
  requestAnimationFrame(() => {
    updatePanelBodyScroll();
    requestAnimationFrame(updatePanelBodyScroll);
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
    ${buildSatisfactionThresholdSection(block)}
    ${buildPerformanceThresholdSection(block)}
    ${index < draftMetrics.length - 1 ? '<hr class="section-divider rum-threshold-block-divider">' : ''}
  `;

  const select = wrap.querySelector('.rum-metric-select');
  select.addEventListener('change', () => {
    const b = draftMetrics.find((m) => m.blockId === block.blockId);
    if (!b) return;
    b.metricId = select.value;
    applyMetricPresetToBlock(b);
    renderMetricBlocks();
    refreshAllMetricSelects();
  });

  wrap.querySelectorAll('.rum-threshold-marker-input').forEach((input) => {
    input.addEventListener('focus', () => {
      const metric = draftMetrics.find((m) => m.blockId === block.blockId);
      if (metric) {
        metric._lastThresholdEdit = {
          group: input.dataset.group,
          field: input.dataset.field,
        };
      }
    });
    input.addEventListener('input', () => {
      const metric = draftMetrics.find((m) => m.blockId === block.blockId);
      if (metric) {
        metric._lastThresholdEdit = {
          group: input.dataset.group,
          field: input.dataset.field,
        };
      }
      syncThresholdFromMarkerInput(wrap, block.blockId, input);
      if (metric) validateMetricBlock(wrap, metric);
    });
    input.addEventListener('blur', () => {
      syncThresholdFromMarkerInput(wrap, block.blockId, input);
      const metric = draftMetrics.find((m) => m.blockId === block.blockId);
      if (!metric) return;
      const field = input.dataset.field;
      const group = input.dataset.group;
      const bucket = group === 'satisfaction' ? metric.satisfaction : metric.performance;
      if (field in bucket) input.value = formatThresholdDisplay(bucket[field]);
      validateMetricBlock(wrap, metric);
    });
  });

  const removeBtn = wrap.querySelector('.remove-metric-block');
  removeBtn?.addEventListener('click', () => removeMetricBlock(block.blockId));

  return wrap;
}

function ensureSatisfactionShape(sat) {
  if (sat.unacceptable == null) {
    sat.unacceptable = Math.max(Number(sat.tolerating) + 1, 4);
  }
}

function buildSatisfactionThresholdSection(block) {
  ensureSatisfactionShape(block.satisfaction);
  const sat = block.satisfaction;
  const metricId = block.metricId;
  return `
    <div class="rum-threshold-section">
      <h3 class="rum-threshold-section-title">Satisfaction thresholds</h3>
      <div class="rum-threshold-visual" data-visual="satisfaction">
        <div class="rum-threshold-markers rum-threshold-markers--satisfaction">
          ${thresholdMarker('satisfaction', 'satisfied', sat.satisfied, 'Satisfied threshold', metricId)}
          ${thresholdMarker('satisfaction', 'tolerating', sat.tolerating, 'Tolerating threshold', metricId)}
          ${thresholdMarker('satisfaction', 'unacceptable', sat.unacceptable, 'Unacceptable threshold', metricId)}
        </div>
        <div class="rum-threshold-bar rum-threshold-bar--satisfaction" aria-hidden="true">
          <span class="rum-threshold-bar-seg rum-threshold-bar-seg--teal" data-seg="sat-1"></span>
          <span class="rum-threshold-bar-seg rum-threshold-bar-seg--yellow" data-seg="sat-2"></span>
          <span class="rum-threshold-bar-seg rum-threshold-bar-seg--orange" data-seg="sat-3"></span>
          <span class="rum-threshold-bar-seg rum-threshold-bar-seg--red" data-seg="sat-4"></span>
        </div>
      </div>
      <div class="form-error rum-threshold-section-error" data-threshold-error="satisfaction"></div>
    </div>`;
}

function buildPerformanceThresholdSection(block) {
  const preset = getMetricPreset(block.metricId).performance;
  const perf = block.performance;
  const mutedClass = preset.muted ? ' rum-threshold-section--performance-muted' : '';
  const standardNote = preset.standardNote
    ? '<p class="rum-threshold-standard-note">Standard thresholds are not editable</p>'
    : '';

  if (preset.layout === 'four') {
    return `
    <div class="rum-threshold-section${mutedClass}">
      <h3 class="rum-threshold-section-title">Performance thresholds</h3>
      <div class="rum-threshold-visual" data-visual="performance">
        <div class="rum-threshold-markers rum-threshold-markers--satisfaction">
          ${thresholdMarker('performance', 'satisfied', perf.satisfied, 'Performance threshold', block.metricId)}
          ${thresholdMarker('performance', 'tolerating', perf.tolerating, 'Performance threshold', block.metricId)}
          ${thresholdMarker('performance', 'unacceptable', perf.unacceptable, 'Performance threshold', block.metricId)}
        </div>
        <div class="rum-threshold-bar rum-threshold-bar--satisfaction" aria-hidden="true">
          <span class="rum-threshold-bar-seg rum-threshold-bar-seg--teal" data-seg="perf-1"></span>
          <span class="rum-threshold-bar-seg rum-threshold-bar-seg--yellow" data-seg="perf-2"></span>
          <span class="rum-threshold-bar-seg rum-threshold-bar-seg--orange" data-seg="perf-3"></span>
          <span class="rum-threshold-bar-seg rum-threshold-bar-seg--red" data-seg="perf-4"></span>
        </div>
      </div>
      ${standardNote}
      <div class="form-error rum-threshold-section-error" data-threshold-error="performance"></div>
    </div>`;
  }

  const unit = preset.unit === 'none' ? 'none' : 's';
  return `
    <div class="rum-threshold-section${mutedClass}">
      <h3 class="rum-threshold-section-title">Performance thresholds</h3>
      <div class="rum-threshold-visual" data-visual="performance">
        <div class="rum-threshold-markers rum-threshold-markers--performance">
          ${thresholdMarker('performance', 'average', perf.average, 'Average threshold', block.metricId, unit)}
          ${thresholdMarker('performance', 'slow', perf.slow, 'Slow threshold', block.metricId, unit)}
        </div>
        <div class="rum-threshold-bar rum-threshold-bar--performance" aria-hidden="true">
          <span class="rum-threshold-bar-seg rum-threshold-bar-seg--teal" data-seg="perf-1"></span>
          <span class="rum-threshold-bar-seg rum-threshold-bar-seg--orange" data-seg="perf-2"></span>
          <span class="rum-threshold-bar-seg rum-threshold-bar-seg--red" data-seg="perf-3"></span>
        </div>
      </div>
      ${standardNote}
      <div class="form-error rum-threshold-section-error" data-threshold-error="performance"></div>
    </div>`;
}

function thresholdFieldEditable(group, field, metricId) {
  if (group === 'satisfaction') {
    return isSatisfactionFieldEditable(metricId, field);
  }
  return isPerformanceFieldEditable(metricId, field);
}

function thresholdMarker(group, field, value, ariaLabel, metricId, unitOverride) {
  const editable = thresholdFieldEditable(group, field, metricId);
  const preset = getMetricPreset(metricId).performance;
  const unit =
    unitOverride ??
    (group === 'performance' && preset.layout === 'three' && preset.unit === 'none' ? 'none' : 's');
  const unitHtml = unit === 's' ? '<span class="rum-threshold-marker-unit" aria-hidden="true"> s</span>' : '';
  const lockedClass = editable ? '' : ' rum-threshold-marker-label--locked';
  const disabledAttr = editable ? '' : ' disabled readonly tabindex="-1"';
  return `
    <div class="rum-threshold-marker" data-marker-field="${field}">
      <label class="rum-threshold-marker-label${lockedClass}">
        <input
          type="text"
          class="rum-threshold-marker-input"
          inputmode="decimal"
          data-group="${group}"
          data-field="${field}"
          value="${escapeAttr(formatThresholdDisplay(value))}"
          aria-label="${escapeAttr(ariaLabel)}"
          ${disabledAttr}
        >
        ${unitHtml}
      </label>
      <span class="rum-threshold-marker-caret" aria-hidden="true"></span>
    </div>`;
}

function syncThresholdFromMarkerInput(blockEl, blockId, input) {
  if (input.disabled) return;
  const b = draftMetrics.find((m) => m.blockId === blockId);
  if (!b) return;
  const val = parseThresholdNumber(input.value);
  const field = input.dataset.field;
  const group = input.dataset.group;
  if (!thresholdFieldEditable(group, field, b.metricId)) return;
  if (group === 'satisfaction') {
    ensureSatisfactionShape(b.satisfaction);
    if (field in b.satisfaction) b.satisfaction[field] = val;
  }
  if (group === 'performance' && field in b.performance) {
    b.performance[field] = val;
  }
  b._lastThresholdEdit = { group, field };
}

function validateThresholdChain(values) {
  for (let i = 0; i < values.length - 1; i += 1) {
    const left = Number(values[i]);
    const right = Number(values[i + 1]);
    if (!Number.isFinite(left) || !Number.isFinite(right) || right <= left) {
      return { valid: false };
    }
  }
  return { valid: true };
}

function fieldThresholdIssue(values, index) {
  const v = Number(values[index]);
  if (!Number.isFinite(v)) {
    return { invalid: true, message: THRESHOLD_ORDER_MESSAGES[0] };
  }
  if (index > 0) {
    const prev = Number(values[index - 1]);
    if (Number.isFinite(prev) && v <= prev) {
      return {
        invalid: true,
        message: THRESHOLD_ORDER_MESSAGES[index - 1],
      };
    }
  }
  if (index < values.length - 1) {
    const next = Number(values[index + 1]);
    if (Number.isFinite(next) && v >= next) {
      return {
        invalid: true,
        message:
          THRESHOLD_TOO_HIGH_VS_NEXT[index] ||
          THRESHOLD_ORDER_MESSAGES[index] ||
          THRESHOLD_ORDER_MESSAGES[THRESHOLD_ORDER_MESSAGES.length - 1],
      };
    }
  }
  return { invalid: false };
}

function resolveSectionValidation(block, visual, fields, values) {
  if (validateThresholdChain(values).valid) {
    return { valid: true };
  }

  const edit = block._lastThresholdEdit;
  if (edit?.group === visual) {
    const editedIndex = fields.indexOf(edit.field);
    if (editedIndex >= 0) {
      const editedIssue = fieldThresholdIssue(values, editedIndex);
      if (editedIssue.invalid) {
        return {
          valid: false,
          invalidIndex: editedIndex,
          message: editedIssue.message,
        };
      }
    }
  }

  for (let i = 0; i < fields.length; i += 1) {
    const issue = fieldThresholdIssue(values, i);
    if (issue.invalid) {
      return { valid: false, invalidIndex: i, message: issue.message };
    }
  }

  return { valid: true };
}

function applyThresholdSectionValidation(blockEl, visual, fields, values, result) {
  const section = blockEl.querySelector(`[data-visual="${visual}"]`)?.closest('.rum-threshold-section');
  const errorEl = section?.querySelector(`[data-threshold-error="${visual}"]`);

  fields.forEach((field, index) => {
    const marker = blockEl.querySelector(
      `[data-visual="${visual}"] .rum-threshold-marker[data-marker-field="${field}"]`,
    );
    const input = marker?.querySelector('.rum-threshold-marker-input');
    const label = marker?.querySelector('.rum-threshold-marker-label');
    const invalid = !result.valid && index === result.invalidIndex;
    input?.classList.toggle('error', invalid);
    label?.classList.toggle('error', invalid);
    if (invalid) {
      input?.setAttribute('aria-invalid', 'true');
    } else {
      input?.removeAttribute('aria-invalid');
    }
  });

  if (errorEl) {
    errorEl.textContent = result.valid ? '' : result.message;
  }
}

function performanceFieldsForBlock(block) {
  if (block.performance.layout === 'four') {
    return SAT_FIELDS;
  }
  return ['average', 'slow'];
}

function validateMetricBlock(blockEl, block) {
  if (!blockEl || !block) return true;
  enforceLockedThresholdValues(block);
  ensureSatisfactionShape(block.satisfaction);

  const satValues = SAT_FIELDS.map((f) => block.satisfaction[f]);
  const satResult = resolveSectionValidation(block, 'satisfaction', SAT_FIELDS, satValues);
  applyThresholdSectionValidation(blockEl, 'satisfaction', SAT_FIELDS, satValues, satResult);

  const perfFields = performanceFieldsForBlock(block);
  const perfValues = perfFields.map((f) => block.performance[f]);
  const perfResult = resolveSectionValidation(block, 'performance', perfFields, perfValues);
  applyThresholdSectionValidation(blockEl, 'performance', perfFields, perfValues, perfResult);

  return satResult.valid && perfResult.valid;
}

function validateAllMetricBlocks() {
  let allValid = true;
  draftMetrics.forEach((block) => {
    const blockEl = els.metricsContainer.querySelector(`[data-block-id="${block.blockId}"]`);
    const valid = validateMetricBlock(blockEl, block);
    if (!valid) allValid = false;
  });
  if (!allValid) updatePanelBodyScroll();
  return allValid;
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

function formatThresholdDisplay(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return '0';
  if (Number.isInteger(num)) return String(num);
  const rounded = Math.round(num * 100) / 100;
  const str = rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return str.replace('.', ',');
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
