/**
 * Ekara date range picker — shared UI (DD/MM/YYYY - DD/MM/YYYY).
 * Init: [data-ekara-date-range] or EkaraDateRangePicker.init(root, { onApply }).
 */
(function () {
  const PRESETS = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'this-week', label: 'This week' },
    { id: 'last-week', label: 'Last week' },
    { id: 'this-month', label: 'This month' },
    { id: 'last-month', label: 'Last month' },
  ];

  const WEEKDAY_LABELS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function addDays(d, n) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return startOfDay(x);
  }

  function addMonths(d, n) {
    const x = new Date(d.getFullYear(), d.getMonth() + n, 1);
    return x;
  }

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function compareDay(a, b) {
    return startOfDay(a).getTime() - startOfDay(b).getTime();
  }

  function formatDate(d) {
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
  }

  function parseDatePart(str) {
    const m = String(str).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    if (d.getFullYear() !== Number(m[3]) || d.getMonth() !== Number(m[2]) - 1 || d.getDate() !== Number(m[1])) {
      return null;
    }
    return startOfDay(d);
  }

  function formatRange(start, end) {
    return `${formatDate(start)} - ${formatDate(end)}`;
  }

  function parseRange(text) {
    const parts = String(text).split(/\s*-\s*/);
    if (parts.length !== 2) return null;
    const start = parseDatePart(parts[0]);
    const end = parseDatePart(parts[1]);
    if (!start || !end) return null;
    return compareDay(start, end) <= 0 ? { start, end } : { start: end, end: start };
  }

  function mondayOfWeek(d) {
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    return addDays(d, diff);
  }

  function endOfWeekSunday(d) {
    const mon = mondayOfWeek(d);
    return addDays(mon, 6);
  }

  function lastDayOfMonth(year, month) {
    return new Date(year, month + 1, 0);
  }

  function presetRange(id) {
    const today = startOfDay(new Date());
    switch (id) {
      case 'today':
        return { start: today, end: today };
      case 'yesterday': {
        const y = addDays(today, -1);
        return { start: y, end: y };
      }
      case 'this-week':
        return { start: mondayOfWeek(today), end: endOfWeekSunday(today) };
      case 'last-week': {
        const lastMon = addDays(mondayOfWeek(today), -7);
        return { start: lastMon, end: addDays(lastMon, 6) };
      }
      case 'this-month': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = lastDayOfMonth(today.getFullYear(), today.getMonth());
        return { start: startOfDay(start), end: startOfDay(end) };
      }
      case 'last-month': {
        const m = today.getMonth() - 1;
        const y = m < 0 ? today.getFullYear() - 1 : today.getFullYear();
        const month = (m + 12) % 12;
        const start = new Date(y, month, 1);
        const end = lastDayOfMonth(y, month);
        return { start: startOfDay(start), end: startOfDay(end) };
      }
      default:
        return null;
    }
  }

  function monthTitle(d) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function isInRange(day, start, end) {
    if (!start || !end) return false;
    const t = compareDay(day, start);
    const u = compareDay(day, end);
    return t >= 0 && u <= 0;
  }

  function init(root, options = {}) {
    if (!root || root.dataset.ekaraDateRangeReady === 'true') return root;
    root.dataset.ekaraDateRangeReady = 'true';

    let hidden = root.querySelector('input[type="hidden"][data-ekara-date-range-value]');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.dataset.ekaraDateRangeValue = 'true';
      root.appendChild(hidden);
    }
    if (root.id && !hidden.id) {
      hidden.id = root.id.replace(/-picker$/, '') || root.id;
    }

    const initial = parseRange(hidden.value || root.dataset.defaultRange || '');
    const applied = initial || presetRange('this-month') || { start: new Date(), end: new Date() };
    let draft = { ...applied };
    let viewMonth = new Date(applied.start.getFullYear(), applied.start.getMonth(), 1);

    hidden.value = formatRange(applied.start, applied.end);

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'measure-filter-inline ekara-date-range-trigger';
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = `
      <span class="measure-filter-calendar" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      </span>
      <span class="ekara-date-range-display measure-filter-input"></span>`;

    const panel = document.createElement('div');
    panel.className = 'ekara-date-range-panel hidden';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Date range');
    panel.innerHTML = `
      <div class="ekara-date-range-body">
        <div class="ekara-date-range-presets" role="listbox" aria-label="Presets"></div>
        <div class="ekara-date-range-calendars">
          <div class="ekara-date-range-calendars-nav">
            <button type="button" class="ekara-date-range-nav ekara-date-range-nav--prev" aria-label="Previous months"></button>
            <div class="ekara-date-range-months" aria-live="polite"></div>
            <button type="button" class="ekara-date-range-nav ekara-date-range-nav--next" aria-label="Next months"></button>
          </div>
          <div class="ekara-date-range-grids"></div>
        </div>
      </div>
      <div class="ekara-date-range-footer">
        <button type="button" class="btn btn-text ekara-date-range-cancel">Cancel</button>
        <button type="button" class="btn btn-primary ekara-date-range-apply">Apply</button>
      </div>`;

    root.appendChild(trigger);
    root.appendChild(panel);

    const display = trigger.querySelector('.ekara-date-range-display');
    const presetsEl = panel.querySelector('.ekara-date-range-presets');
    const monthsLabel = panel.querySelector('.ekara-date-range-months');
    const gridsEl = panel.querySelector('.ekara-date-range-grids');

    PRESETS.forEach((p) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ekara-date-range-preset';
      btn.dataset.preset = p.id;
      btn.textContent = p.label;
      presetsEl.appendChild(btn);
    });

    function updateDisplay() {
      display.textContent = formatRange(applied.start, applied.end);
    }

    function renderCalendars() {
      const left = viewMonth;
      const right = addMonths(viewMonth, 1);
      monthsLabel.textContent = `${monthTitle(left)} — ${monthTitle(right)}`;
      gridsEl.innerHTML = '';
      [left, right].forEach((monthStart) => {
        gridsEl.appendChild(buildMonthGrid(monthStart, draft.start, draft.end));
      });
    }

    function buildMonthGrid(monthStart, rangeStart, rangeEnd) {
      const wrap = document.createElement('div');
      wrap.className = 'ekara-date-range-month';
      const title = document.createElement('div');
      title.className = 'ekara-date-range-month-title';
      title.textContent = monthTitle(monthStart);
      wrap.appendChild(title);

      const head = document.createElement('div');
      head.className = 'ekara-date-range-weekdays';
      WEEKDAY_LABELS.forEach((w) => {
        const c = document.createElement('span');
        c.textContent = w;
        head.appendChild(c);
      });
      wrap.appendChild(head);

      const grid = document.createElement('div');
      grid.className = 'ekara-date-range-days';

      const first = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
      const startPad = (first.getDay() + 6) % 7;
      const cursor = addDays(first, -startPad);

      for (let i = 0; i < 42; i += 1) {
        const day = addDays(cursor, i);
        const inMonth = day.getMonth() === monthStart.getMonth();
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ekara-date-range-day';
        btn.textContent = String(day.getDate());
        btn.dataset.date = formatDate(day);
        if (!inMonth) btn.classList.add('is-outside');
        if (rangeStart && sameDay(day, rangeStart)) btn.classList.add('is-start');
        if (rangeEnd && sameDay(day, rangeEnd)) btn.classList.add('is-end');
        if (rangeStart && rangeEnd && isInRange(day, rangeStart, rangeEnd)) btn.classList.add('is-in-range');
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          onDayClick(day);
        });
        grid.appendChild(btn);
      }
      wrap.appendChild(grid);
      return wrap;
    }

    function onDayClick(day) {
      if (!draft.start || (draft.start && draft.end)) {
        draft = { start: day, end: null };
      } else if (compareDay(day, draft.start) < 0) {
        draft = { start: day, end: draft.start };
      } else {
        draft.end = day;
      }
      renderCalendars();
    }

    function openPanel() {
      draft = { start: applied.start, end: applied.end };
      viewMonth = new Date(applied.start.getFullYear(), applied.start.getMonth(), 1);
      panel.classList.remove('hidden');
      trigger.setAttribute('aria-expanded', 'true');
      renderCalendars();
    }

    function closePanel() {
      panel.classList.add('hidden');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function apply() {
      if (!draft.start) return;
      const end = draft.end || draft.start;
      applied.start = draft.start;
      applied.end = end;
      hidden.value = formatRange(applied.start, applied.end);
      updateDisplay();
      closePanel();
      hidden.dispatchEvent(new Event('change', { bubbles: true }));
      if (typeof options.onApply === 'function') {
        options.onApply(applied.start, applied.end, hidden.value);
      }
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (panel.classList.contains('hidden')) openPanel();
      else closePanel();
    });

    panel.querySelector('.ekara-date-range-cancel')?.addEventListener('click', (e) => {
      e.stopPropagation();
      closePanel();
    });

    panel.querySelector('.ekara-date-range-apply')?.addEventListener('click', (e) => {
      e.stopPropagation();
      apply();
    });

    panel.querySelector('.ekara-date-range-nav--prev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      viewMonth = addMonths(viewMonth, -1);
      renderCalendars();
    });

    panel.querySelector('.ekara-date-range-nav--next')?.addEventListener('click', (e) => {
      e.stopPropagation();
      viewMonth = addMonths(viewMonth, 1);
      renderCalendars();
    });

    presetsEl.querySelectorAll('.ekara-date-range-preset').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const range = presetRange(btn.dataset.preset);
        if (!range) return;
        draft = range;
        viewMonth = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
        renderCalendars();
      });
    });

    document.addEventListener('click', (e) => {
      if (!root.contains(e.target)) closePanel();
    });

    updateDisplay();
    return root;
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-ekara-date-range]').forEach((el) => init(el));
  });

  window.EkaraDateRangePicker = {
    init,
    formatRange,
    parseRange,
    formatDate,
  };
})();
