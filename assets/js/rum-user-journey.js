/**
 * Measures — RUM user journey mapping (DFY-21875 / DFY-23088 prototype)
 * Mock data only; no API.
 */

const MOCK_TRACKERS = [
  { id: '1111', label: '1111' },
  { id: '54', label: '54' },
  { id: 'agent', label: 'Tracker_Agent_', color: true },
  { id: 'kaya', label: 'tracker kaya 1' },
  { id: 'name', label: 'tracker name' },
  { id: 'ccc', label: 'ccc' },
  { id: 'ratio', label: 'TEST RATIO TRACKER' },
  { id: 'xsx', label: 'xsx' },
  { id: 'dd', label: 'dd' },
  { id: 'finale', label: 'finale' },
  { id: 'empty', label: 'Tracker_Empty_' },
  { id: 'error', label: 'Tracker_Error_' },
];

/** Same cap as RUM trends. */
const TRACKER_SELECTION_MAX = 10;

/** Show tracker names in the chip while selection count is at most this value. */
const TRACKER_CHIP_NAME_LIMIT = 3;

const METRIC_LABELS = {
  sessions: 'Sessions',
  users: 'Users',
  transitions: 'Transitions',
};

const BREAKDOWN_LABELS = {
  none: 'None',
  device: 'Device',
  browser: 'Browser',
};

/** @typedef {{ id: string, name: string, sessions: number, users: number, transitions: number }} PageGroupNode */

/** Fixed page-group columns (dimension is always Page group). */
const JOURNEY_STEP_DEFS = [
  [
    { id: 'home', name: 'Home' },
    { id: 'search-entry', name: 'Search' },
  ],
  [
    { id: 'catalog', name: 'Catalog' },
    { id: 'search', name: 'Search' },
  ],
  [{ id: 'product', name: 'Product' }],
  [
    { id: 'cart', name: 'Cart' },
    { id: 'exit', name: 'Exit' },
  ],
];

const JOURNEY_BASELINE_DAYS = 30;

/** Per-tracker contributions (mock API slices). Summed when several trackers are selected. */
const MOCK_TRACKER_JOURNEY = {
  agent: {
    links: [
      { from: 'home', to: 'catalog', sessions: 2400, users: 2000, transitions: 2400 },
      { from: 'home', to: 'search', sessions: 900, users: 750, transitions: 900 },
      { from: 'search-entry', to: 'search', sessions: 1100, users: 900, transitions: 1100 },
      { from: 'catalog', to: 'product', sessions: 2200, users: 1800, transitions: 2200 },
      { from: 'search', to: 'product', sessions: 600, users: 500, transitions: 600 },
      { from: 'product', to: 'cart', sessions: 1240, users: 1050, transitions: 1240 },
      { from: 'product', to: 'exit', sessions: 1560, users: 1260, transitions: 1560 },
    ],
    paths: [
      { steps: ['Home', 'Catalog', 'Product', 'Cart'], sessions: 1240, users: 1050, transitions: 1240 },
      { steps: ['Home', 'Search', 'Product', 'Exit'], sessions: 890, users: 720, transitions: 890 },
      { steps: ['Home', 'Catalog', 'Product', 'Exit'], sessions: 640, users: 520, transitions: 640 },
      { steps: ['Search', 'Search', 'Product', 'Cart'], sessions: 410, users: 340, transitions: 410 },
      { steps: ['Home', 'Search', 'Product', 'Cart'], sessions: 380, users: 310, transitions: 380 },
      { steps: ['Search', 'Search', 'Product', 'Exit'], sessions: 295, users: 240, transitions: 295 },
    ],
    breakdown: {
      device: [
        { label: 'Computer', sessions: 4200, users: 3400, transitions: 9800 },
        { label: 'Mobile', sessions: 2800, users: 2200, transitions: 6400 },
        { label: 'Tablet', sessions: 600, users: 480, transitions: 1400 },
      ],
      browser: [
        { label: 'Chrome', sessions: 5100, users: 4000, transitions: 11800 },
        { label: 'Safari', sessions: 1400, users: 1100, transitions: 3200 },
        { label: 'Firefox', sessions: 700, users: 560, transitions: 1600 },
        { label: 'Edge', sessions: 400, users: 320, transitions: 900 },
      ],
    },
  },
  kaya: {
    links: [
      { from: 'home', to: 'search', sessions: 420, users: 340, transitions: 420 },
      { from: 'search-entry', to: 'search', sessions: 620, users: 500, transitions: 620 },
      { from: 'search', to: 'product', sessions: 520, users: 420, transitions: 520 },
      { from: 'product', to: 'cart', sessions: 210, users: 170, transitions: 210 },
      { from: 'product', to: 'exit', sessions: 310, users: 250, transitions: 310 },
    ],
    paths: [
      { steps: ['Home', 'Search', 'Product', 'Cart'], sessions: 210, users: 170, transitions: 210 },
      { steps: ['Search', 'Search', 'Product', 'Cart'], sessions: 260, users: 210, transitions: 260 },
      { steps: ['Home', 'Search', 'Product', 'Exit'], sessions: 190, users: 155, transitions: 190 },
      { steps: ['Search', 'Search', 'Product', 'Exit'], sessions: 340, users: 275, transitions: 340 },
    ],
    breakdown: {
      device: [
        { label: 'Computer', sessions: 520, users: 420, transitions: 1200 },
        { label: 'Mobile', sessions: 980, users: 790, transitions: 2280 },
        { label: 'Tablet', sessions: 180, users: 145, transitions: 420 },
      ],
      browser: [
        { label: 'Chrome', sessions: 1100, users: 890, transitions: 2550 },
        { label: 'Safari', sessions: 420, users: 340, transitions: 980 },
        { label: 'Firefox', sessions: 120, users: 95, transitions: 280 },
        { label: 'Edge', sessions: 40, users: 30, transitions: 90 },
      ],
    },
  },
  '1111': {
    links: [
      { from: 'home', to: 'catalog', sessions: 680, users: 560, transitions: 680 },
      { from: 'catalog', to: 'product', sessions: 590, users: 480, transitions: 590 },
      { from: 'product', to: 'cart', sessions: 320, users: 260, transitions: 320 },
      { from: 'product', to: 'exit', sessions: 270, users: 220, transitions: 270 },
    ],
    paths: [
      { steps: ['Home', 'Catalog', 'Product', 'Cart'], sessions: 320, users: 260, transitions: 320 },
      { steps: ['Home', 'Catalog', 'Product', 'Exit'], sessions: 270, users: 220, transitions: 270 },
    ],
    breakdown: {
      device: [
        { label: 'Computer', sessions: 780, users: 630, transitions: 1800 },
        { label: 'Mobile', sessions: 420, users: 340, transitions: 970 },
        { label: 'Tablet', sessions: 90, users: 72, transitions: 210 },
      ],
      browser: [
        { label: 'Chrome', sessions: 920, users: 740, transitions: 2120 },
        { label: 'Safari', sessions: 210, users: 170, transitions: 480 },
        { label: 'Firefox', sessions: 110, users: 90, transitions: 250 },
        { label: 'Edge', sessions: 50, users: 42, transitions: 130 },
      ],
    },
  },
  '54': {
    links: [
      { from: 'home', to: 'catalog', sessions: 180, users: 145, transitions: 180 },
      { from: 'catalog', to: 'product', sessions: 150, users: 120, transitions: 150 },
      { from: 'product', to: 'exit', sessions: 150, users: 120, transitions: 150 },
    ],
    paths: [{ steps: ['Home', 'Catalog', 'Product', 'Exit'], sessions: 150, users: 120, transitions: 150 }],
    breakdown: {
      device: [
        { label: 'Computer', sessions: 200, users: 160, transitions: 460 },
        { label: 'Mobile', sessions: 120, users: 95, transitions: 280 },
        { label: 'Tablet', sessions: 30, users: 24, transitions: 70 },
      ],
      browser: [
        { label: 'Chrome', sessions: 240, users: 190, transitions: 550 },
        { label: 'Safari', sessions: 60, users: 48, transitions: 140 },
        { label: 'Firefox', sessions: 30, users: 24, transitions: 70 },
        { label: 'Edge', sessions: 20, users: 17, transitions: 50 },
      ],
    },
  },
};

/** @type {{ steps: PageGroupNode[][], links: object[], allPaths: object[], topPaths: object[], breakdown: object } | null} */
let activeGraph = null;

function roundMetric(n) {
  return Math.max(0, Math.round(n));
}

function scaleMetrics(record, factor) {
  return {
    ...record,
    sessions: roundMetric(record.sessions * factor),
    users: roundMetric(record.users * factor),
    transitions: roundMetric(record.transitions * factor),
  };
}

function scaleContribution(contrib, factor) {
  return {
    links: contrib.links.map((l) => scaleMetrics(l, factor)),
    paths: contrib.paths.map((p) => scaleMetrics(p, factor)),
    breakdown: {
      device: contrib.breakdown.device.map((r) => scaleMetrics(r, factor)),
      browser: contrib.breakdown.browser.map((r) => scaleMetrics(r, factor)),
    },
  };
}

function trackerContribution(trackerId) {
  const base = MOCK_TRACKER_JOURNEY[trackerId];
  if (base) return base;
  return scaleContribution(MOCK_TRACKER_JOURNEY.agent, 0.07);
}

function parseDateRangeDays(value) {
  const raw = String(value || '').trim();
  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return JOURNEY_BASELINE_DAYS;
  const start = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const end = new Date(Number(m[6]), Number(m[5]) - 1, Number(m[4]));
  const ms = end.getTime() - start.getTime();
  if (!Number.isFinite(ms) || ms < 0) return JOURNEY_BASELINE_DAYS;
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

function dateRangeScale(value) {
  return parseDateRangeDays(value) / JOURNEY_BASELINE_DAYS;
}

function mergeMetricMaps(target, rows, factor) {
  rows.forEach((row) => {
    const scaled = scaleMetrics(row, factor);
    const prev = target.get(row.label) || { label: row.label, sessions: 0, users: 0, transitions: 0 };
    target.set(row.label, {
      label: row.label,
      sessions: prev.sessions + scaled.sessions,
      users: prev.users + scaled.users,
      transitions: prev.transitions + scaled.transitions,
    });
  });
}

function mergeLinks(map, links, factor) {
  links.forEach((link) => {
    const key = `${link.from}|${link.to}`;
    const scaled = scaleMetrics(link, factor);
    const prev = map.get(key) || { from: link.from, to: link.to, sessions: 0, users: 0, transitions: 0 };
    map.set(key, {
      from: link.from,
      to: link.to,
      sessions: prev.sessions + scaled.sessions,
      users: prev.users + scaled.users,
      transitions: prev.transitions + scaled.transitions,
    });
  });
}

function mergePaths(map, paths, factor) {
  paths.forEach((path) => {
    const key = path.steps.join('\u2192');
    const scaled = scaleMetrics(path, factor);
    const prev = map.get(key) || { steps: [...path.steps], sessions: 0, users: 0, transitions: 0 };
    map.set(key, {
      steps: prev.steps,
      sessions: prev.sessions + scaled.sessions,
      users: prev.users + scaled.users,
      transitions: prev.transitions + scaled.transitions,
    });
  });
}

function deriveStepNodes(links) {
  const incoming = new Map();
  const outgoing = new Map();
  links.forEach((link) => {
    const inc = incoming.get(link.to) || { sessions: 0, users: 0, transitions: 0 };
    incoming.set(link.to, {
      sessions: inc.sessions + link.sessions,
      users: inc.users + link.users,
      transitions: inc.transitions + link.transitions,
    });
    const out = outgoing.get(link.from) || { sessions: 0, users: 0, transitions: 0 };
    outgoing.set(link.from, {
      sessions: out.sessions + link.sessions,
      users: out.users + link.users,
      transitions: out.transitions + link.transitions,
    });
  });

  return JOURNEY_STEP_DEFS.map((column, colIndex) =>
    column.map((node) => {
      const vol = colIndex === 0 ? outgoing.get(node.id) : incoming.get(node.id);
      const sessions = vol?.sessions ?? 0;
      const users = vol?.users ?? 0;
      const transitions = colIndex === 0 ? 0 : vol?.transitions ?? 0;
      return { ...node, sessions, users, transitions };
    })
  );
}

function sortPathsByMetric(paths, metric) {
  return [...paths].sort((a, b) => (b[metric] ?? 0) - (a[metric] ?? 0));
}

function hasAnyVolume(record) {
  return (record.sessions ?? 0) > 0 || (record.users ?? 0) > 0 || (record.transitions ?? 0) > 0;
}

/** Keep filter state aligned with the DOM before every rebuild (inline selects, etc.). */
function syncFilterStateFromDom() {
  if (els.metric) state.metric = els.metric.value;
  if (els.breakdown) state.breakdown = els.breakdown.value;
}

function buildActiveGraph() {
  syncFilterStateFromDom();

  const trackerIds = state.selectedTrackerIds.filter((id) => id !== 'empty' && id !== 'error');
  if (!trackerIds.length) return null;

  const metric = state.metric;
  const periodScale = dateRangeScale(els.dateRange?.value);
  const linkMap = new Map();
  const pathMap = new Map();
  const deviceMap = new Map();
  const browserMap = new Map();

  trackerIds.forEach((id) => {
    const contrib = trackerContribution(id);
    mergeLinks(linkMap, contrib.links, periodScale);
    mergePaths(pathMap, contrib.paths, periodScale);
    mergeMetricMaps(deviceMap, contrib.breakdown.device, periodScale);
    mergeMetricMaps(browserMap, contrib.breakdown.browser, periodScale);
  });

  const links = [...linkMap.values()].filter((l) => hasAnyVolume(l));
  if (!links.length) return null;

  const steps = deriveStepNodes(links);
  const allPaths = sortPathsByMetric([...pathMap.values()], metric).filter((p) => (p[metric] ?? 0) > 0);
  if (!allPaths.length) return null;

  const topPaths = allPaths.slice(0, 5);

  return {
    steps,
    links,
    allPaths,
    topPaths,
    breakdown: {
      device: [...deviceMap.values()],
      browser: [...browserMap.values()],
    },
  };
}

let state = {
  metric: 'sessions',
  breakdown: 'none',
  selectedTrackerIds: ['agent'],
  selectedNodeId: null,
  loading: false,
  error: null,
  graphEmpty: false,
};

let els = {};

document.addEventListener('DOMContentLoaded', init);

function init() {
  els = {
    trackerTrigger: document.getElementById('filter-tracker-trigger'),
    trackerChips: document.getElementById('filter-tracker-chips'),
    trackerMenu: document.getElementById('filter-tracker-menu'),
    trackerOptions: document.getElementById('filter-tracker-options'),
    trackerSelectAll: null,
    trackerTree: null,
    dateRange: document.getElementById('filter-date-range'),
    metric: document.getElementById('filter-metric'),
    breakdown: document.getElementById('filter-breakdown'),
    pageTitle: document.getElementById('page-title'),
    scopeLabel: document.getElementById('scope-label'),
    loading: document.getElementById('journey-loading'),
    empty: document.getElementById('journey-empty'),
    error: document.getElementById('journey-error'),
    errorMessage: document.getElementById('journey-error-message'),
    retry: document.getElementById('journey-retry'),
    content: document.getElementById('journey-content'),
    pathGraph: document.getElementById('path-graph'),
    focusPanel: document.getElementById('node-focus-panel'),
    focusBefore: document.getElementById('focus-before'),
    focusAfter: document.getElementById('focus-after'),
    focusThrough: document.getElementById('focus-through'),
    focusSelectedTitle: document.getElementById('focus-selected-title'),
    top5List: document.getElementById('top5-list'),
    breakdownPanel: document.getElementById('breakdown-panel'),
    breakdownTitle: document.getElementById('breakdown-title'),
    breakdownBars: document.getElementById('breakdown-bars'),
  };

  buildTrackerPickerMenu();
  renderTrackerChips();
  bindTrackerPicker();
  initDateRangePicker();
  bindFilters();
  if (els.retry) els.retry.addEventListener('click', () => loadJourneyData());
  initSidebarGroups();
  window.addEventListener('resize', () => {
    drawPathLinks();
  });
  loadJourneyData();
}

function trackerById(id) {
  return MOCK_TRACKERS.find((t) => t.id === id);
}

function trackerOptionDotHtml(tracker) {
  return tracker?.color ? '<span class="measure-tracker-option-dot" aria-hidden="true"></span>' : '';
}

function buildTrackerPickerMenu() {
  if (!els.trackerOptions) return;
  const total = MOCK_TRACKERS.length;
  const children = MOCK_TRACKERS
    .map((t) => {
      const dot = trackerOptionDotHtml(t);
      return `
    <li class="measure-tracker-option" data-tracker-id="${escapeAttr(t.id)}">
      <input type="checkbox" id="tracker-opt-${escapeAttr(t.id)}" value="${escapeAttr(t.id)}" />
      <span class="measure-tracker-option-label">${escapeHtml(t.label)}${dot}</span>
    </li>`;
    })
    .join('');

  els.trackerOptions.innerHTML = `
    <li class="measure-tracker-option measure-tracker-option--parent">
      <button type="button" class="measure-tracker-tree-toggle" id="tracker-tree-toggle" aria-expanded="true" aria-label="Toggle tracker list"></button>
      <input type="checkbox" id="tracker-opt-all" aria-label="Select all trackers" />
      <span class="measure-tracker-option-label">Trackers (${total})</span>
    </li>
    <li class="measure-tracker-tree-wrap">
      <ul class="measure-tracker-tree" id="tracker-option-tree">${children}</ul>
    </li>
    <li class="measure-tracker-limit-hint" id="tracker-limit-hint" role="status">You can select up to ${TRACKER_SELECTION_MAX} trackers.</li>`;

  els.trackerSelectAll = document.getElementById('tracker-opt-all');
  els.trackerTree = document.getElementById('tracker-option-tree');

  const parentRow = els.trackerOptions.querySelector('.measure-tracker-option--parent');
  const treeToggle = document.getElementById('tracker-tree-toggle');
  treeToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const expanded = treeToggle.getAttribute('aria-expanded') !== 'false';
    const next = !expanded;
    treeToggle.setAttribute('aria-expanded', next ? 'true' : 'false');
    els.trackerTree?.classList.toggle('collapsed', !next);
  });

  parentRow?.addEventListener('click', (e) => {
    if (e.target === els.trackerSelectAll || e.target === treeToggle) return;
    if (!els.trackerSelectAll) return;
    els.trackerSelectAll.checked = !els.trackerSelectAll.checked;
    onSelectAllChange(els.trackerSelectAll.checked);
  });

  els.trackerSelectAll?.addEventListener('change', (e) => {
    e.stopPropagation();
    onSelectAllChange(els.trackerSelectAll.checked);
  });

  els.trackerTree?.querySelectorAll('.measure-tracker-option').forEach((row) => {
    const id = row.dataset.trackerId;
    const input = row.querySelector('input[type="checkbox"]');
    if (!input) return;
    input.addEventListener('change', (e) => {
      e.stopPropagation();
      onTrackerCheckboxChange(id, input.checked);
    });
    row.addEventListener('click', (e) => {
      if (e.target === input) return;
      input.checked = !input.checked;
      onTrackerCheckboxChange(id, input.checked);
    });
  });

  syncTrackerCheckboxes();
}

function onSelectAllChange(checked) {
  state.selectedTrackerIds = checked
    ? MOCK_TRACKERS.slice(0, TRACKER_SELECTION_MAX).map((t) => t.id)
    : [];
  syncTrackerCheckboxes();
  renderTrackerChips();
  state.selectedNodeId = null;
  loadJourneyData();
}

function onTrackerCheckboxChange(id, checked) {
  const set = new Set(state.selectedTrackerIds);
  if (checked) {
    if (!set.has(id) && set.size >= TRACKER_SELECTION_MAX) {
      syncTrackerCheckboxes();
      return;
    }
    set.add(id);
  } else {
    set.delete(id);
  }
  state.selectedTrackerIds = [...set];
  syncTrackerCheckboxes();
  renderTrackerChips();
  state.selectedNodeId = null;
  loadJourneyData();
}

function syncTrackerCheckboxes() {
  if (!els.trackerOptions) return;
  const atLimit = state.selectedTrackerIds.length >= TRACKER_SELECTION_MAX;
  els.trackerTree?.querySelectorAll('.measure-tracker-option').forEach((row) => {
    const input = row.querySelector('input[type="checkbox"]');
    if (!input) return;
    const selected = state.selectedTrackerIds.includes(input.value);
    input.checked = selected;
    input.disabled = atLimit && !selected;
    row.classList.toggle('is-disabled', input.disabled);
  });
  updateSelectAllCheckbox();
}

function updateSelectAllCheckbox() {
  if (!els.trackerSelectAll) return;
  const n = state.selectedTrackerIds.length;
  const total = MOCK_TRACKERS.length;
  if (total <= TRACKER_SELECTION_MAX) {
    els.trackerSelectAll.checked = n === total && total > 0;
    els.trackerSelectAll.indeterminate = n > 0 && n < total;
  } else {
    els.trackerSelectAll.checked = n === TRACKER_SELECTION_MAX;
    els.trackerSelectAll.indeterminate = n > 0 && n < TRACKER_SELECTION_MAX;
  }
}

function removeTrackerFromSelection(id) {
  state.selectedTrackerIds = state.selectedTrackerIds.filter((x) => x !== id);
  syncTrackerCheckboxes();
  renderTrackerChips();
  state.selectedNodeId = null;
  loadJourneyData();
}

function renderTrackerChips() {
  if (!els.trackerChips) return;
  const ids = state.selectedTrackerIds;
  if (!ids.length) {
    els.trackerChips.innerHTML = '';
    return;
  }

  const parts = [];

  if (ids.length > TRACKER_CHIP_NAME_LIMIT) {
    parts.push(`
      <span class="ekara-chip">
        <span class="ekara-chip-label">${ids.length} selected</span>
        <button type="button" class="ekara-chip-remove" data-action="clear-all" aria-label="Clear all trackers">×</button>
      </span>`);
  } else {
    ids.forEach((id) => {
      const t = trackerById(id);
      parts.push(`
      <span class="ekara-chip">
        <span class="ekara-chip-label">${escapeHtml(t?.label || id)}${trackerOptionDotHtml(t)}</span>
        <button type="button" class="ekara-chip-remove" data-tracker-id="${escapeAttr(id)}" aria-label="Remove ${escapeHtml(t?.label || id)}">×</button>
      </span>`);
    });
  }

  els.trackerChips.innerHTML = parts.join('');

  els.trackerChips.querySelectorAll('.ekara-chip-remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (btn.dataset.action === 'clear-all') {
        state.selectedTrackerIds = [];
        syncTrackerCheckboxes();
        renderTrackerChips();
        state.selectedNodeId = null;
        loadJourneyData();
        return;
      }
      const trackerId = btn.dataset.trackerId;
      if (trackerId) removeTrackerFromSelection(trackerId);
    });
  });
}

function initDateRangePicker() {
  const root = document.getElementById('filter-date-range-picker');
  if (root && window.EkaraDateRangePicker) {
    window.EkaraDateRangePicker.init(root);
  }
  els.dateRange = document.getElementById('filter-date-range');
}

function bindTrackerPicker() {
  if (!els.trackerTrigger || !els.trackerMenu) return;
  els.trackerTrigger.addEventListener('click', (e) => {
    if (e.target.closest('.ekara-chip-remove')) return;
    els.trackerMenu.classList.toggle('hidden');
    const isOpen = !els.trackerMenu.classList.contains('hidden');
    els.trackerTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    els.trackerMenu.classList.toggle('open', isOpen);
  });
  document.addEventListener('click', (e) => {
    if (!els.trackerTrigger.contains(e.target) && !els.trackerMenu.contains(e.target)) {
      closeTrackerMenu();
    }
  });
}

function closeTrackerMenu() {
  if (!els.trackerMenu || !els.trackerTrigger) return;
  els.trackerMenu.classList.add('hidden');
  els.trackerMenu.classList.remove('open');
  els.trackerTrigger.setAttribute('aria-expanded', 'false');
}

function bindFilters() {
  [els.metric, els.breakdown].forEach((el) => {
    if (!el) return;
    el.addEventListener('change', () => {
      syncFilterStateFromDom();
      state.selectedNodeId = null;
      loadJourneyData();
    });
  });
  if (els.dateRange) {
    els.dateRange.addEventListener('change', () => {
      state.selectedNodeId = null;
      loadJourneyData();
    });
  }
}

function demoMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('demo');
}

function loadJourneyData() {
  syncFilterStateFromDom();
  state.error = null;
  state.loading = false;
  state.graphEmpty = false;
  const mode = demoMode();

  if (mode === 'error' || state.selectedTrackerIds.includes('error')) {
    state.error = 'Unable to load journey data. Please try again.';
    updateViewState();
    return;
  }

  if (mode === 'empty' || isEmptyTrackerSelection() || state.selectedTrackerIds.length === 0) {
    updateViewState();
    return;
  }

  state.loading = true;
  updateViewState();

  window.setTimeout(() => {
    state.loading = false;
    renderJourney();
    updateViewState();
  }, 450);
}

function metricValue(record) {
  return record[state.metric] ?? 0;
}

function formatMetricValue(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

function formatMetricWithUnit(n) {
  return `${formatMetricValue(n)} ${METRIC_LABELS[state.metric].toLowerCase()}`;
}

function isEmptyTrackerSelection() {
  const ids = state.selectedTrackerIds;
  return ids.length > 0 && ids.every((id) => id === 'empty');
}

function trackerScopeSummary() {
  const ids = state.selectedTrackerIds;
  if (!ids.length) return 'Trackers';
  if (ids.length > TRACKER_CHIP_NAME_LIMIT) {
    return `${ids.length} trackers`;
  }
  return ids.map((id) => trackerById(id)?.label || id).join(', ');
}

function updateScopeLabel() {
  const range = els.dateRange?.value || '';
  if (els.scopeLabel) {
    els.scopeLabel.textContent = `${trackerScopeSummary()} — ${range}`;
  }
}

function updateViewState() {
  const isEmpty =
    !state.loading &&
    !state.error &&
    (demoMode() === 'empty' ||
      isEmptyTrackerSelection() ||
      state.selectedTrackerIds.length === 0 ||
      state.graphEmpty);
  const showContent = !state.loading && !state.error && !isEmpty;

  els.loading?.classList.toggle('hidden', !state.loading);
  els.empty?.classList.toggle('hidden', !isEmpty);
  els.error?.classList.toggle('hidden', !state.error);
  els.content?.classList.toggle('hidden', !showContent);
  if (state.error && els.errorMessage) els.errorMessage.textContent = state.error;
  updateScopeLabel();
}

function renderJourney() {
  activeGraph = buildActiveGraph();
  state.graphEmpty = !activeGraph;
  if (state.graphEmpty) return;

  renderPathGraph();
  renderTop5();
  renderBreakdown();
  renderFocusPanel();
  requestAnimationFrame(() => {
    drawPathLinks();
  });
}

function linkMetricValue(link) {
  return link[state.metric] ?? 0;
}

function renderPathGraph() {
  if (!els.pathGraph) return;
  const selected = state.selectedNodeId;
  const columnsHtml = activeGraph.steps
    .map((column, colIndex) => {
      const columnMax = Math.max(...column.map((node) => metricValue(node)), 1);
      const nodes = column
        .map((node) => {
          const isSelected = selected === node.id;
          const isDimmed = selected && !isNodeInSelectedFlow(node.id, selected);
          const flowPct = Math.round((metricValue(node) / columnMax) * 100);
          return `
          <button type="button" class="rum-journey-node${isSelected ? ' is-selected' : ''}${isDimmed ? ' is-dimmed' : ''}"
            data-node-id="${escapeAttr(node.id)}" aria-pressed="${isSelected}">
            <span class="rum-journey-node-name">${escapeHtml(node.name)}</span>
            <span class="rum-journey-node-value">${escapeHtml(formatMetricWithUnit(metricValue(node)))}</span>
            <span class="rum-journey-node-flow" aria-hidden="true"><span class="rum-journey-node-flow-fill" style="--rum-journey-node-flow-pct: ${flowPct}"></span></span>
          </button>`;
        })
        .join('');
      const stepLabel = `Step ${colIndex + 1}`;
      return `
        <div class="rum-journey-step" aria-label="${escapeHtml(stepLabel)}">
          <div class="rum-journey-step-label">${escapeHtml(stepLabel)}</div>
          <div class="rum-journey-step-nodes">${nodes}</div>
        </div>`;
    })
    .join('');

  els.pathGraph.innerHTML = `
    <svg class="rum-journey-path-links" aria-hidden="true"></svg>
    <div class="rum-journey-path-columns">${columnsHtml}</div>`;

  els.pathGraph.querySelectorAll('.rum-journey-node').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.nodeId;
      state.selectedNodeId = state.selectedNodeId === id ? null : id;
      renderJourney();
    });
  });
}

/** GA-like curved links between page group nodes (volumes → stroke width). */
function drawPathLinks() {
  const canvas = els.pathGraph;
  const svg = canvas?.querySelector('.rum-journey-path-links');
  if (!canvas || !svg) return;

  const maxFlow = Math.max(...activeGraph.links.map((link) => linkMetricValue(link)), 1);
  const selected = state.selectedNodeId;
  const canvasRect = canvas.getBoundingClientRect();

  const paths = activeGraph.links
    .map((link) => {
      const fromEl = canvas.querySelector(`[data-node-id="${link.from}"]`);
      const toEl = canvas.querySelector(`[data-node-id="${link.to}"]`);
      if (!fromEl || !toEl) return '';

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();
      const x1 = fromRect.right - canvasRect.left + canvas.scrollLeft;
      const y1 = fromRect.top + fromRect.height / 2 - canvasRect.top + canvas.scrollTop;
      const x2 = toRect.left - canvasRect.left + canvas.scrollLeft;
      const y2 = toRect.top + toRect.height / 2 - canvasRect.top + canvas.scrollTop;
      const cx = (x1 + x2) / 2;
      const flow = linkMetricValue(link);
      const width = 1.5 + (flow / maxFlow) * 5.5;
      const inFlow =
        !selected || link.from === selected || link.to === selected;
      const fromName = findNodeById(link.from)?.name || link.from;
      const toName = findNodeById(link.to)?.name || link.to;
      const tooltip = `${fromName} → ${toName}: ${formatMetricWithUnit(flow)}`;

      const classes = [
        'rum-journey-path-link',
        inFlow && selected ? 'is-highlighted' : '',
        !inFlow ? 'is-dimmed' : '',
      ]
        .filter(Boolean)
        .join(' ');

      const d = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
      return `<g class="rum-journey-path-link-group">
        <path class="rum-journey-path-link-hit" d="${d}" data-tooltip="${escapeAttr(tooltip)}" data-tooltip-at="pointer" aria-label="${escapeAttr(tooltip)}"></path>
        <path class="${classes}" d="${d}" stroke-width="${width.toFixed(2)}" pointer-events="none"></path>
      </g>`;
    })
    .join('');

  const width = Math.max(canvas.scrollWidth, canvas.clientWidth);
  const height = Math.max(canvas.scrollHeight, canvas.clientHeight);
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.innerHTML = paths;
  if (window.EkaraTooltip) window.EkaraTooltip.refresh(svg);
}

/** Highlight only the selected node; others dim (same for every page group). */
function isNodeInSelectedFlow(nodeId, selectedId) {
  return nodeId === selectedId;
}

function findNodeIdByName(name) {
  for (const col of JOURNEY_STEP_DEFS) {
    const found = col.find((n) => n.name === name);
    if (found) return found.id;
  }
  return null;
}

function findNodeById(nodeId) {
  const steps = activeGraph?.steps || JOURNEY_STEP_DEFS;
  for (const col of steps) {
    const found = col.find((n) => n.id === nodeId);
    if (found) return found;
  }
  return null;
}

function getFocusForNode(nodeId) {
  const node = findNodeById(nodeId);
  if (!node) return null;

  const metric = state.metric;

  const before = activeGraph.links
    .filter((l) => l.to === nodeId)
    .map((l) => ({
      label: `${findNodeById(l.from)?.name || l.from} → ${node.name}`,
      sessions: l.sessions,
      users: l.users,
      transitions: l.transitions,
    }));
  const after = activeGraph.links
    .filter((l) => l.from === nodeId)
    .map((l) => ({
      label: `${node.name} → ${findNodeById(l.to)?.name || l.to}`,
      sessions: l.sessions,
      users: l.users,
      transitions: l.transitions,
    }));
  const through = activeGraph.allPaths
    .filter((p) => p.steps.includes(node.name))
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, 5)
    .map((p) => ({
      label: p.steps.join(' → '),
      sessions: p.sessions,
      users: p.users,
      transitions: p.transitions,
    }));

  return { before, after, through };
}

function renderFocusPanel() {
  if (!els.focusPanel) return;
  const focus = state.selectedNodeId ? getFocusForNode(state.selectedNodeId) : null;
  els.focusPanel.classList.toggle('hidden', !focus);

  if (!focus) return;

  const selectedNode = findNodeById(state.selectedNodeId);
  if (els.focusSelectedTitle) {
    els.focusSelectedTitle.textContent = selectedNode?.name || '';
  }

  const metric = state.metric;
  const renderRows = (rows) =>
    rows.length
      ? rows
          .map(
            (row) =>
              `<li><span class="rum-journey-focus-label">${escapeHtml(row.label)}</span><span class="rum-journey-focus-value">${escapeHtml(formatMetricWithUnit(row[metric]))}</span></li>`
          )
          .join('')
      : '<li class="rum-journey-focus-empty">No data</li>';

  if (els.focusBefore) els.focusBefore.innerHTML = renderRows(focus.before);
  if (els.focusAfter) els.focusAfter.innerHTML = renderRows(focus.after);
  if (els.focusThrough) {
    els.focusThrough.innerHTML = focus.through.length
      ? focus.through
          .map(
            (row) =>
              `<li><span class="rum-journey-focus-label">${escapeHtml(row.label)}</span><span class="rum-journey-focus-value">${escapeHtml(formatMetricWithUnit(row[metric]))}</span></li>`
          )
          .join('')
      : '<li class="rum-journey-focus-empty">No paths</li>';
  }
}

function renderTop5() {
  if (!els.top5List) return;
  const metric = state.metric;
  const paths = sortPathsByMetric(activeGraph.allPaths, metric).slice(0, 5);
  els.top5List.innerHTML = paths
    .map(
      (path, i) => `
    <li class="rum-journey-top5-item">
      <span class="rum-journey-top5-rank">${i + 1}.</span>
      <span class="rum-journey-top5-path">${escapeHtml(path.steps.join(' → '))}</span>
      <span class="rum-journey-top5-value">${escapeHtml(formatMetricWithUnit(path[metric]))}</span>
    </li>`
    )
    .join('');
}

function renderBreakdown() {
  if (!els.breakdownPanel) return;
  const key = state.breakdown;
  const show = key === 'device' || key === 'browser';
  els.breakdownPanel.classList.toggle('hidden', !show);
  if (!show) return;

  const title = key === 'device' ? 'Distribution by device' : 'Distribution by browser';
  if (els.breakdownTitle) els.breakdownTitle.textContent = title;

  const rows = activeGraph.breakdown[key];
  const total = rows.reduce((sum, r) => sum + metricValue(r), 0) || 1;
  if (els.breakdownBars) {
    els.breakdownBars.innerHTML = rows
      .map((row) => {
        const pct = Math.round((metricValue(row) / total) * 100);
        return `
        <div class="rum-journey-breakdown-row">
          <span class="rum-journey-breakdown-label">${escapeHtml(row.label)}</span>
          <div class="rum-journey-breakdown-track"><div class="rum-journey-breakdown-fill" style="--rum-breakdown-fill-pct: ${pct}%"></div></div>
          <span class="rum-journey-breakdown-pct">${pct}%</span>
        </div>`;
      })
      .join('');
  }
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
