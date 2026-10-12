/**
 * Measures — RUM user journey mapping (DFY-21875 / DFY-23088 prototype)
 * Mock data only; no API.
 */

const MOCK_TRACKERS = [
  { id: 'agent', label: 'Tracker_Agent_', color: 'var(--color-v500)' },
  { id: 'empty', label: 'Tracker_Empty_', color: 'var(--color-n400)' },
  { id: 'error', label: 'Tracker_Error_', color: 'var(--color-r600)' },
];

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
  trackerId: 'agent',
  selectedNodeId: null,
  loading: false,
  error: null,
};

let els = {};

document.addEventListener('DOMContentLoaded', init);

function init() {
  els = {
    tracker: document.getElementById('filter-tracker'),
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

  populateTrackerSelect();
  bindFilters();
  if (els.retry) els.retry.addEventListener('click', () => loadJourneyData());
  initSidebarGroups();
  loadJourneyData();
}

function populateTrackerSelect() {
  if (!els.tracker) return;
  els.tracker.innerHTML = MOCK_TRACKERS
    .map((t) => `<option value="${t.id}">${escapeHtml(t.label)}</option>`)
    .join('');
}

function bindFilters() {
  [els.tracker, els.metric, els.breakdown].forEach((el) => {
    if (!el) return;
    el.addEventListener('change', () => {
      state.trackerId = els.tracker.value;
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

  if (mode === 'error' || state.trackerId === 'error') {
    state.error = 'Unable to load journey data. Please try again.';
    updateViewState();
    return;
  }

  if (mode === 'empty' || state.trackerId === 'empty') {
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

function updateScopeLabel() {
  const tracker = MOCK_TRACKERS.find((t) => t.id === state.trackerId);
  const range = els.dateRange?.value || '';
  if (els.scopeLabel) {
    els.scopeLabel.textContent = `${tracker?.label || 'Tracker'} — ${range}`;
  }
}

function updateViewState() {
  const isEmpty = !state.loading && !state.error && (demoMode() === 'empty' || state.trackerId === 'empty');
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
}

function renderPathGraph() {
  if (!els.pathGraph) return;
  const selected = state.selectedNodeId;
  const html = MOCK_GRAPH.steps
    .map((column, colIndex) => {
      const nodes = column
        .map((node) => {
          const isSelected = selected === node.id;
          const isDimmed = selected && !isNodeInSelectedFlow(node.id, selected);
          return `
          <button type="button" class="rum-journey-node${isSelected ? ' is-selected' : ''}${isDimmed ? ' is-dimmed' : ''}"
            data-node-id="${escapeAttr(node.id)}" aria-pressed="${isSelected}">
            <span class="rum-journey-node-name">${escapeHtml(node.name)}</span>
            <span class="rum-journey-node-value">${formatMetricValue(metricValue(node))} ${escapeHtml(METRIC_LABELS[state.metric].toLowerCase())}</span>
          </button>`;
        })
        .join('');
      return `
        <div class="rum-journey-step" aria-label="Step ${colIndex + 1}">
          <div class="rum-journey-step-label form-label">Step ${colIndex + 1}</div>
          <div class="rum-journey-step-nodes">${nodes}</div>
        </div>`;
    })
    .join('<div class="rum-journey-step-connector" aria-hidden="true"></div>');

  els.pathGraph.innerHTML = html;

  els.pathGraph.querySelectorAll('.rum-journey-node').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.nodeId;
      state.selectedNodeId = state.selectedNodeId === id ? null : id;
      renderJourney();
    });
  });
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
