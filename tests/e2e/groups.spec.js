// @ts-check
const { test, expect } = require('@playwright/test');

const GROUPS_PATH = '/groups/index.html';
const GROUPS_STORAGE_KEY = 'ekara-prototype-groups';

async function openGroups(page) {
  await page.goto(GROUPS_PATH);
  await expect(page.locator('#group-table-body .data-table-row').first()).toBeVisible();
}

test.describe('Management — Groups (DFY-24465)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      localStorage.removeItem(key);
    }, GROUPS_STORAGE_KEY);
  });

  test('page loads with avatar, profil, workspaces and priority columns', async ({ page }) => {
    await openGroups(page);
    await expect(page.locator('.page-title')).toHaveText('Groups');
    await expect(page.getByRole('link', { name: 'Groups' })).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('#group-table-body .data-table-row')).toHaveCount(3);
    const testRow = page.locator('#group-table-body .data-table-row').filter({ hasText: 'test' });
    await expect(testRow.locator('.group-table-avatar')).toHaveText('TE');
    await expect(testRow.locator('.ekara-chip-label')).toHaveText('ALL Application');
  });

  test('default sort is priority descending', async ({ page }) => {
    await openGroups(page);
    const priorityHeader = page.locator('.data-table-header-sort[data-sort-key="priority"]');
    await expect(priorityHeader).toHaveClass(/is-sorted-desc/);
    const priorities = await page.locator('#group-table-body .data-table-row .data-table-cell').evaluateAll((cells) =>
      cells.filter((_, i) => i % 5 === 3).map((c) => Number(c.textContent?.trim() || 0)),
    );
    const sorted = [...priorities].sort((a, b) => b - a);
    expect(priorities).toEqual(sorted);
  });

  test('new group modal includes priority 0-9 and disabled create until name', async ({ page }) => {
    await openGroups(page);
    await page.locator('#btn-add-group').click();
    await expect(page.locator('#group-form-dialog.open')).toBeVisible();
    await expect(page.locator('#group-save-btn')).toBeDisabled();
    await page.locator('#field-name').fill('New operators');
    await expect(page.locator('#group-save-btn')).toBeEnabled();
    const wrap = page.locator('[data-ekara-inline-select]:has(#field-priority)');
    await wrap.locator('.ekara-inline-select-trigger').click();
    const options = await wrap.locator('.ekara-inline-select-option').allTextContents();
    expect(options.map((t) => t.trim())).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
  });

  test('priority dropdown matches language width and opens without inner scroll', async ({ page }) => {
    await openGroups(page);
    await page.locator('#btn-add-group').click();
    const languageWrap = page.locator('[data-ekara-inline-select]:has(#field-language)');
    const priorityWrap = page.locator('[data-ekara-inline-select]:has(#field-priority)');
    const languageWidth = await languageWrap.evaluate((el) => el.getBoundingClientRect().width);
    const priorityWidth = await priorityWrap.evaluate((el) => el.getBoundingClientRect().width);
    expect(priorityWidth).toBeCloseTo(languageWidth, 0);

    await priorityWrap.locator('.ekara-inline-select-trigger').click();
    const menu = priorityWrap.locator('.ekara-inline-select-menu:not(.hidden)');
    await expect(menu).toBeVisible();
    const triggerWidth = await priorityWrap
      .locator('.ekara-inline-select-trigger')
      .evaluate((el) => el.getBoundingClientRect().width);
    const menuMetrics = await menu.evaluate((el) => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      width: el.getBoundingClientRect().width,
    }));
    expect(menuMetrics.width).toBeCloseTo(triggerWidth, 0);
    expect(menuMetrics.scrollHeight).toBeLessThanOrEqual(menuMetrics.clientHeight + 1);
    const optionCount = await priorityWrap.locator('.ekara-inline-select-option').count();
    expect(optionCount).toBe(10);
  });

  test('create group persists priority in table', async ({ page }) => {
    await openGroups(page);
    await page.locator('#btn-add-group').click();
    await page.locator('#field-name').fill('High priority group');
    const priorityWrap = page.locator('[data-ekara-inline-select]:has(#field-priority)');
    await priorityWrap.locator('.ekara-inline-select-trigger').click();
    await priorityWrap.locator('.ekara-inline-select-option', { hasText: '7' }).click();
    await page.locator('#group-save-btn').click();
    const row = page.locator('#group-table-body .data-table-row').filter({ hasText: 'High priority group' });
    await expect(row.locator('.data-table-cell').nth(3)).toHaveText('7');
  });
});
