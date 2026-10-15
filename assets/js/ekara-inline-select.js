/**
 * Ekara inline select — custom listbox for Measures filter bar (replaces native select popup).
 * Markup: .measure-filter-inline[data-ekara-inline-select] > select + optional prefix.
 */
(function () {
  function closeAllExcept(exceptRoot) {
    document.querySelectorAll('[data-ekara-inline-select]').forEach((root) => {
      if (root === exceptRoot) return;
      const menu = root.querySelector('.ekara-inline-select-menu');
      const trigger = root.querySelector('.ekara-inline-select-trigger');
      menu?.classList.add('hidden');
      trigger?.setAttribute('aria-expanded', 'false');
    });
  }

  function initRoot(root) {
    if (!root || root.dataset.ekaraInlineSelectReady === 'true') return;
    const select = root.querySelector('select');
    if (!select) return;
    root.dataset.ekaraInlineSelectReady = 'true';

    const control = document.createElement('div');
    control.className = 'ekara-inline-select-control';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'ekara-inline-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    if (select.id) {
      trigger.setAttribute('aria-labelledby', `${select.id}-label`);
    }

    const valueEl = document.createElement('span');
    valueEl.className = 'ekara-inline-select-value';
    valueEl.id = select.id ? `${select.id}-label` : '';

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

    function syncUI() {
      const opt = select.options[select.selectedIndex];
      valueEl.textContent = opt ? opt.textContent : '';
      menu.querySelectorAll('.ekara-inline-select-option').forEach((btn) => {
        const selected = btn.dataset.value === select.value;
        btn.classList.toggle('is-selected', selected);
        btn.setAttribute('aria-selected', selected ? 'true' : 'false');
      });
    }

    function openMenu() {
      closeAllExcept(root);
      menu.classList.remove('hidden');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      menu.classList.add('hidden');
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (menu.classList.contains('hidden')) openMenu();
      else closeMenu();
    });

    select.classList.add('hidden');
    select.setAttribute('tabindex', '-1');
    select.setAttribute('aria-hidden', 'true');

    control.append(trigger);
    select.insertAdjacentElement('beforebegin', control);
    root.appendChild(menu);

    select.addEventListener('change', syncUI);
    syncUI();
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-ekara-inline-select]')) return;
    closeAllExcept(null);
  });

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-ekara-inline-select]').forEach(initRoot);
  });

  window.EkaraInlineSelect = { init: initRoot };
})();
