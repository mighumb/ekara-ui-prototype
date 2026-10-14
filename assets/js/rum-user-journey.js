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

const MOCK_GRAPH = {
  steps: [
    [
      { id: 'home', name: 'Home', sessions: 5200, users: 4100, transitions: 0 },
      { id: 'search-entry', name: 'Search', sessions: 1800, users: 1500, transitions: 0 },
    ],
    [
      { id: 'catalog', name: 'Catalog', sessions: 3100, users: 2600, transitions: 3100 },
      { id: 'search', name: 'Search', sessions: 1200, users: 980, transitions: 1200 },
    ],
    [
      { id: 'product', name: 'Product', sessions: 2800, users: 2300, transitions: 2800 },
    ],
    [
      { id: 'cart', name: 'Cart', sessions: 1240, users: 1050, transitions: 1240 },
      { id: 'exit', name: 'Exit', sessions: 890, users: 720, transitions: 890 },
    ],
  ],
  links: [
    { from: 'home', to: 'catalog', sessions: 2400, users: 2000, transitions: 2400 },
    { from: 'home', to: 'search', sessions: 900, users: 750, transitions: 900 },
    { from: 'search-entry', to: 'search', sessions: 1100, users: 900, transitions: 1100 },
    { from: 'catalog', to: 'product', sessions: 2200, users: 1800, transitions: 2200 },
    { from: 'search', to: 'product', sessions: 600, users: 500, transitions: 600 },
    { from: 'product', to: 'cart', sessions: 1240, users: 1050, transitions: 1240 },
    { from: 'product', to: 'exit', sessions: 890, users: 720, transitions: 890 },
  ],
  topPaths: [
    { steps: ['Home', 'Catalog', 'Product', 'Cart'], sessions: 1240, users: 1050, transitions: 1240 },
    { steps: ['Home', 'Search', 'Product', 'Exit'], sessions: 890, users: 720, transitions: 890 },
    { steps: ['Home', 'Catalog', 'Product', 'Exit'], sessions: 640, users: 520, transitions: 640 },
    { steps: ['Search', 'Search', 'Product', 'Cart'], sessions: 410, users: 340, transitions: 410 },
    { steps: ['Home', 'Catalog', 'Product', 'Cart'], sessions: 380, users: 310, transitions: 380 },
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
  focus: {
    product: {
      before: [
        { label: 'Catalog → Product', sessions: 2200, users: 1800, transitions: 2200 },
        { label: 'Search → Product', sessions: 600, users: 500, transitions: 600 },
      ],
      after: [
        { label: 'Product → Cart', sessions: 1240, users: 1050, transitions: 1240 },
        { label: 'Product → Exit', sessions: 890, users: 720, transitions: 890 },
      ],
      through: [
        'Home → Catalog → Product → Cart',
        'Home → Search → Product → Exit',
        'Home → Catalog → Product → Exit',
      ],
    },
  },
};

let state = {
  metric: 'sessions',
  breakdown: 'none',
  selectedTrackerIds: ['agent'],
  selectedNodeId: null,
  loading: false,
  error: null,
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
    syncPathCardMinHeight();
  });
  loadJourneyData();
}

/** Path exploration card is at least as tall as Top 5; grows with more journey content only. */
function syncPathCardMinHeight() {
  const pathCard = document.querySelector('.rum-journey-card--path');
  const top5Card = document.querySelector('.rum-journey-card--top5');
  if (!pathCard || !top5Card) return;
  pathCard.style.minHeight = '';
  const top5Height = top5Card.offsetHeight;
  if (pathCard.offsetHeight < top5Height) {
    pathCard.style.minHeight = `${top5Height}px`;
  }
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
      state.metric = els.metric.value;
      state.breakdown = els.breakdown.value;
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
  state.error = null;
  state.loading = false;
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
    (demoMode() === 'empty' || isEmptyTrackerSelection() || state.selectedTrackerIds.length === 0);
  const showContent = !state.loading && !state.error && !isEmpty;

  els.loading?.classList.toggle('hidden', !state.loading);
  els.empty?.classList.toggle('hidden', !isEmpty);
  els.error?.classList.toggle('hidden', !state.error);
  els.content?.classList.toggle('hidden', !showContent);
  if (state.error && els.errorMessage) els.errorMessage.textContent = state.error;
  updateScopeLabel();
}

function renderJourney() {
  renderPathGraph();
  renderTop5();
  renderBreakdown();
  renderFocusPanel();
  requestAnimationFrame(() => {
    drawPathLinks();
    syncPathCardMinHeight();
  });
}

function linkMetricValue(link) {
  return link[state.metric] ?? 0;
}

function renderPathGraph() {
  if (!els.pathGraph) return;
  const selected = state.selectedNodeId;
  const columnsHtml = MOCK_GRAPH.steps
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
            <span class="rum-journey-node-value">${formatMetricValue(metricValue(node))} ${escapeHtml(METRIC_LABELS[state.metric].toLowerCase())}</span>
            <span class="rum-journey-node-flow" aria-hidden="true"><span class="rum-journey-node-flow-fill" style="--rum-journey-node-flow-pct: ${flowPct}"></span></span>
          </button>`;
        })
        .join('');
      const stepLabel = colIndex === 0 ? 'Start' : `+${colIndex}`;
      return `
        <div class="rum-journey-step" aria-label="Step ${colIndex + 1}">
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

  const maxFlow = Math.max(...MOCK_GRAPH.links.map((link) => linkMetricValue(link)), 1);
  const selected = state.selectedNodeId;
  const canvasRect = canvas.getBoundingClientRect();

  const paths = MOCK_GRAPH.links
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
        !selected ||
        (isNodeInSelectedFlow(link.from, selected) && isNodeInSelectedFlow(link.to, selected));
      const classes = [
        'rum-journey-path-link',
        inFlow && selected ? 'is-highlighted' : '',
        !inFlow ? 'is-dimmed' : '',
      ]
        .filter(Boolean)
        .join(' ');

      return `<path class="${classes}" d="M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}" stroke-width="${width.toFixed(2)}"></path>`;
    })
    .join('');

  const width = Math.max(canvas.scrollWidth, canvas.clientWidth);
  const height = Math.max(canvas.scrollHeight, canvas.clientHeight);
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.innerHTML = paths;
}

function isNodeInSelectedFlow(nodeId, selectedId) {
  const focus = MOCK_GRAPH.focus[selectedId];
  if (!focus) return nodeId === selectedId;
  const related = new Set([selectedId]);
  MOCK_GRAPH.links.forEach((link) => {
    if (link.to === selectedId) related.add(link.from);
    if (link.from === selectedId) related.add(link.to);
  });
  focus.through.forEach((path) => {
    path.split(' → ').forEach((name) => {
      const n = findNodeIdByName(name.trim());
      if (n) related.add(n);
    });
  });
  return related.has(nodeId);
}

function findNodeIdByName(name) {
  for (const col of MOCK_GRAPH.steps) {
    const found = col.find((n) => n.name === name);
    if (found) return found.id;
  }
  return null;
}

function findNodeById(nodeId) {
  for (const col of MOCK_GRAPH.steps) {
    const found = col.find((n) => n.id === nodeId);
    if (found) return found;
  }
  return null;
}

function getFocusForNode(nodeId) {
  if (MOCK_GRAPH.focus[nodeId]) return MOCK_GRAPH.focus[nodeId];
  const node = findNodeById(nodeId);
  if (!node) return null;

  const before = MOCK_GRAPH.links
    .filter((l) => l.to === nodeId)
    .map((l) => ({
      label: `${findNodeById(l.from)?.name || l.from} → ${node.name}`,
      sessions: l.sessions,
      users: l.users,
      transitions: l.transitions,
    }));
  const after = MOCK_GRAPH.links
    .filter((l) => l.from === nodeId)
    .map((l) => ({
      label: `${node.name} → ${findNodeById(l.to)?.name || l.to}`,
      sessions: l.sessions,
      users: l.users,
      transitions: l.transitions,
    }));
  const through = MOCK_GRAPH.topPaths
    .filter((p) => p.steps.includes(node.name))
    .map((p) => p.steps.join(' → '));

  return { before, after, through };
}

function renderFocusPanel() {
  if (!els.focusPanel) return;
  const focus = state.selectedNodeId ? getFocusForNode(state.selectedNodeId) : null;
  els.focusPanel.classList.toggle('hidden', !focus);

  if (!focus) return;

  const metric = state.metric;
  const renderRows = (rows) =>
    rows.length
      ? rows
          .map(
            (row) =>
              `<li><span class="rum-journey-focus-label">${escapeHtml(row.label)}</span><span class="rum-journey-focus-value">${formatMetricValue(row[metric])}</span></li>`
          )
          .join('')
      : '<li class="rum-journey-focus-empty">No data</li>';

  if (els.focusBefore) els.focusBefore.innerHTML = renderRows(focus.before);
  if (els.focusAfter) els.focusAfter.innerHTML = renderRows(focus.after);
  if (els.focusThrough) {
    els.focusThrough.innerHTML = focus.through.length
      ? focus.through.map((path) => `<li>${escapeHtml(path)}</li>`).join('')
      : '<li class="rum-journey-focus-empty">No paths</li>';
  }
}

function renderTop5() {
  if (!els.top5List) return;
  const metric = state.metric;
  const paths = [...MOCK_GRAPH.topPaths].sort((a, b) => b[metric] - a[metric]).slice(0, 5);
  els.top5List.innerHTML = paths
    .map(
      (path, i) => `
    <li class="rum-journey-top5-item">
      <span class="rum-journey-top5-rank">${i + 1}.</span>
      <span class="rum-journey-top5-path">${escapeHtml(path.steps.join(' → '))}</span>
      <span class="rum-journey-top5-value">${formatMetricValue(path[metric])}</span>
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

  const rows = MOCK_GRAPH.breakdown[key];
  const total = rows.reduce((sum, r) => sum + metricValue(r), 0) || 1;
  if (els.breakdownBars) {
    els.breakdownBars.innerHTML = rows
      .map((row) => {
        const pct = Math.round((metricValue(row) / total) * 100);
        return `
        <div class="rum-journey-breakdown-row">
          <span class="rum-journey-breakdown-label">${escapeHtml(row.label)}</span>
          <div class="rum-journey-breakdown-track"><div class="rum-journey-breakdown-fill" style="width:${pct}%"></div></div>
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
