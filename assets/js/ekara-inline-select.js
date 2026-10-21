/**
 * Ekara inline select — DS listbox (replaces native select popup).
 * Markup: [data-ekara-inline-select] > select — e.g. `.measure-filter-inline`, `.form-select-wrap`.
 * Optional: `data-ekara-inline-select-searchable` — type-to-filter combobox (tracker Application / Default metric).
 */
(function () {
  function closeAllExcept(exceptRoot) {
    document.querySelectorAll('[data-ekara-inline-select]').forEach((root) => {
      if (root === exceptRoot) return;
      const menu = root.querySelector('.ekara-inline-select-menu');
      menu?.classList.add('hidden');
      setExpanded(root, false);
      const instance = root._ekaraInlineSelect;
      if (instance?.searchable) instance.syncDisplayFromSelect();
    });
  }

  function setExpanded(root, open) {
    const trigger = root.querySelector('.ekara-inline-select-trigger');
    const searchInput = root.querySelector('.ekara-inline-select-input');
    const el = searchInput || trigger;
    el?.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function destroyRoot(root) {
    if (!root || root.dataset.ekaraInlineSelectReady !== 'true') return;
    const select = root.querySelector('select');
    root.querySelector('.ekara-inline-select-control')?.remove();
    root.querySelector('.ekara-inline-select-menu')?.remove();
    if (select) {
      select.classList.remove('hidden');
      select.removeAttribute('tabindex');
      select.removeAttribute('aria-hidden');
    }
    delete root._ekaraInlineSelect;
    delete root.dataset.ekaraInlineSelectReady;
  }

  function initRoot(root) {
    if (!root || root.dataset.ekaraInlineSelectReady === 'true') return;
    const select = root.querySelector('select');
    if (!select) return;
    root.dataset.ekaraInlineSelectReady = 'true';

    const searchable = root.hasAttribute('data-ekara-inline-select-searchable');
    const control = document.createElement('div');
    control.className = 'ekara-inline-select-control';

    let trigger;
    let valueEl;
    let searchInput = null;

    if (searchable) {
      trigger = document.createElement('div');
      trigger.className = 'ekara-inline-select-trigger ekara-inline-select-trigger--searchable';
      searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.className = 'ekara-inline-select-input';
      searchInput.setAttribute('autocomplete', 'off');
      searchInput.setAttribute('role', 'combobox');
      searchInput.setAttribute('aria-haspopup', 'listbox');
      searchInput.setAttribute('aria-expanded', 'false');
      const labelledBy = select.getAttribute('aria-labelledby');
      if (labelledBy) searchInput.setAttribute('aria-labelledby', labelledBy);
      valueEl = searchInput;
    } else {
      trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'ekara-inline-select-trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      if (select.id) {
        trigger.setAttribute('aria-labelledby', `${select.id}-label`);
      }
      valueEl = document.createElement('span');
      valueEl.className = 'ekara-inline-select-value';
      valueEl.id = select.id ? `${select.id}-label` : '';
    }

    const chevron = document.createElement('span');
    chevron.className = 'ekara-inline-select-chevron';
    chevron.setAttribute('aria-hidden', 'true');

    trigger.append(valueEl, chevron);

    const menu = document.createElement('ul');
    menu.className = 'ekara-inline-select-menu hidden';
    menu.setAttribute('role', 'listbox');

    [...select.options].forEach((opt) => {
      const item = document.createElement('li');
      item.setAttribute('role', 'none');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ekara-inline-select-option';
      btn.setAttribute('role', 'option');
      btn.dataset.value = opt.value;
      btn.textContent = opt.textContent || opt.value;
      if (searchable) {
        btn.addEventListener('mousedown', (e) => e.preventDefault());
      }
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        syncUI();
        closeMenu();
      });
      item.appendChild(btn);
      menu.appendChild(item);
    });

    let menuOpen = false;

    function placeholderText() {
      const empty = [...select.options].find((o) => o.value === '');
      return empty ? empty.textContent : '';
    }

    function syncDisplayFromSelect() {
      if (!searchable || !searchInput) return;
      const opt = select.options[select.selectedIndex];
      if (select.value && opt) {
        searchInput.value = opt.textContent;
      } else {
        searchInput.value = '';
      }
      searchInput.placeholder = placeholderText();
    }

    function filterOptions(query) {
      const q = String(query || '').trim().toLowerCase();
      menu.querySelectorAll('.ekara-inline-select-option').forEach((btn) => {
        const item = btn.closest('li');
        if (!item) return;
        if (!q) {
          item.hidden = false;
          return;
        }
        const text = (btn.textContent || '').toLowerCase();
        item.hidden = !text.includes(q);
      });
    }

    function syncUI() {
      const opt = select.options[select.selectedIndex];
      if (searchable) {
        syncDisplayFromSelect();
        if (searchInput) searchInput.disabled = select.disabled;
      } else {
        valueEl.textContent = opt ? opt.textContent : '';
        trigger.disabled = select.disabled;
      }
      menu.querySelectorAll('.ekara-inline-select-option').forEach((btn) => {
        const selected = btn.dataset.value === select.value;
        btn.classList.toggle('is-selected', selected);
        btn.setAttribute('aria-selected', selected ? 'true' : 'false');
      });
      filterOptions(searchable && menuOpen ? searchInput?.value : '');
    }

    function openMenu() {
      closeAllExcept(root);
      menuOpen = true;
      menu.classList.remove('hidden');
      setExpanded(root, true);
      if (searchable && searchInput) {
        filterOptions(searchInput.value);
        searchInput.focus();
      }
    }

    function closeMenu() {
      menuOpen = false;
      menu.classList.add('hidden');
      setExpanded(root, false);
      if (searchable) syncDisplayFromSelect();
      filterOptions('');
    }

    if (searchable && searchInput) {
      searchInput.addEventListener('focus', () => {
        if (select.disabled) return;
        openMenu();
      });
      searchInput.addEventListener('input', () => {
        if (select.disabled) return;
        if (menu.classList.contains('hidden')) openMenu();
        filterOptions(searchInput.value);
      });
      searchInput.addEventListener('blur', (e) => {
        const next = e.relatedTarget;
        if (next && root.contains(next)) return;
        window.setTimeout(() => {
          if (!root.contains(document.activeElement)) closeMenu();
        }, 120);
      });
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (select.disabled) return;
        if (e.target.closest('.ekara-inline-select-chevron')) return;
        if (menu.classList.contains('hidden')) {
          openMenu();
          searchInput.focus();
        } else if (e.target !== searchInput) {
          closeMenu();
        }
      });
      chevron.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (select.disabled) return;
        if (menu.classList.contains('hidden')) {
          openMenu();
          searchInput.focus();
        } else closeMenu();
      });
    } else {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (select.disabled) return;
        if (menu.classList.contains('hidden')) openMenu();
        else closeMenu();
      });
    }

    select.classList.add('hidden');
    select.setAttribute('tabindex', '-1');
    select.setAttribute('aria-hidden', 'true');

    control.append(trigger);
    select.insertAdjacentElement('beforebegin', control);
    root.appendChild(menu);

    select.addEventListener('change', syncUI);
    root._ekaraInlineSelect = { searchable, syncDisplayFromSelect };
    syncUI();
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-ekara-inline-select]')) return;
    closeAllExcept(null);
  });

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-ekara-inline-select]').forEach(initRoot);
  });

  function wrapFormSelect(selectEl, extraClass = '') {
    if (!selectEl) return null;
    const existing = selectEl.closest('[data-ekara-inline-select]');
    if (existing) {
      initRoot(existing);
      return existing;
    }
    const wrap = document.createElement('div');
    wrap.className = ['form-select-wrap', extraClass].filter(Boolean).join(' ');
    wrap.setAttribute('data-ekara-inline-select', '');
    const parent = selectEl.parentNode;
    if (!parent) return null;
    parent.insertBefore(wrap, selectEl);
    wrap.appendChild(selectEl);
    initRoot(wrap);
    return wrap;
  }

  function scan(root = document) {
    root.querySelectorAll('[data-ekara-inline-select]').forEach(initRoot);
  }

  window.EkaraInlineSelect = { init: initRoot, wrapFormSelect, scan, destroy: destroyRoot };
})();
