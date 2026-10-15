// @ts-check
const { test, expect } = require('@playwright/test');

const ALERTS_PATH = '/settings/alerts/index.html';
const STORAGE_KEY = 'ekara-prototype-alert-rules';

async function openAlertsFresh(page) {
  await page.goto(ALERTS_PATH);
  await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  await page.reload();
  await expect(page.locator('#alert-table-body .data-table-row').first()).toBeVisible();
}

test.describe('Settings — Alert rules', () => {
  test('page loads with table rows and sortable headers', async ({ page }) => {
    await openAlertsFresh(page);
    const rows = page.locator('#alert-table-body .data-table-row');
    await expect(rows).not.toHaveCount(0);
    await expect(page.locator('.data-table-header-sort')).toHaveCount(6);
    await expect(page.locator('.data-table-header-sort.is-sorted')).toHaveCount(0);
  });

  test('column sort toggles direction and shows chevron only on active column', async ({ page }) => {
    await openAlertsFresh(page);
    const nameHeader = page.locator('.data-table-header-sort[data-sort-key="name"]');

    await nameHeader.click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    await expect(nameHeader).toHaveClass(/is-sorted/);
    await expect(page.locator('.data-table-header-sort.is-sorted')).toHaveCount(1);

    const allNames = await page
      .locator('#alert-table-body .data-table-row')
      .evaluateAll((rows) =>
        rows.map((row) => row.querySelectorAll('.data-table-cell')[1]?.textContent?.trim() || ''),
      );
    const sorted = [...allNames].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    expect(allNames).toEqual(sorted);

    await nameHeader.click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    const allNamesDesc = await page
      .locator('#alert-table-body .data-table-row')
      .evaluateAll((rows) =>
        rows.map((row) => row.querySelectorAll('.data-table-cell')[1]?.textContent?.trim() || ''),
      );
    const sortedDesc = [...allNamesDesc].sort((a, b) => b.localeCompare(a, undefined, { sensitivity: 'base' }));
    expect(allNamesDesc).toEqual(sortedDesc);

    await nameHeader.click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  test('refresh resets to default sort (no active column)', async ({ page }) => {
    await openAlertsFresh(page);
    await page.locator('.data-table-header-sort[data-sort-key="description"]').click();
    await expect(page.locator('.data-table-header-sort.is-sorted')).toHaveCount(1);
    await page.reload();
    await expect(page.locator('.data-table-header-sort.is-sorted')).toHaveCount(0);
  });

  test('alert drawer uses DS inline select for trigger and timezone', async ({ page }) => {
    await openAlertsFresh(page);
    await page.locator('#btn-add-alert').click();
    await expect(page.locator('#slide-panel.open')).toBeVisible();

    const trigger = page.locator('[data-ekara-inline-select]:has(#field-trigger)');
    await trigger.locator('.ekara-inline-select-trigger').click();
    await trigger.locator('.ekara-inline-select-option', { hasText: 'Performance degradation' }).click();
    await expect(page.locator('#field-trigger')).toHaveValue('Performance degradation');

    const tz = page.locator('[data-ekara-inline-select]:has(#field-timezone)');
    await tz.locator('.ekara-inline-select-trigger').click();
    await tz.locator('.ekara-inline-select-option', { hasText: 'UTC' }).click();
    await expect(page.locator('#field-timezone')).toHaveValue('UTC');
  });

  test('minimum gap follows send end of alert toggle', async ({ page }) => {
    await openAlertsFresh(page);
    await page.locator('#btn-add-alert').click();
    await expect(page.locator('#slide-panel.open')).toBeVisible();

    const gap = page.locator('#field-minimum-end-gap');
    const sendEndToggle = page.locator('label.toggle').filter({ has: page.locator('#field-send-end') });
    await sendEndToggle.scrollIntoViewIfNeeded();
    await expect(gap).toBeDisabled();

    await sendEndToggle.click();
    await expect(gap).toBeEnabled();

    await sendEndToggle.click();
    await expect(gap).toBeDisabled();
  });

  test('save validation shows errors for empty required fields', async ({ page }) => {
    await openAlertsFresh(page);
    await page.locator('#btn-add-alert').click();
    await page.locator('#btn-save').click();
    await expect(page.locator('#error-name')).not.toBeEmpty();
    await expect(page.locator('#slide-panel.open')).toBeVisible();
  });

  test('display sort does not reorder persisted array', async ({ page }) => {
    await page.goto(ALERTS_PATH);
    const seedIds = [9001, 9002];
    await page.evaluate(
      ({ key, ids }) => {
        const rows = ids.map((id, i) => ({
          id,
          name: id === 9001 ? 'Zebra test' : 'Alpha test',
          description: 'seed',
          applications: '',
          trigger: 'Incident',
          recipients: '1 recipient',
          scenarios: 'None',
          updatedAt: 1000 + i,
        }));
        localStorage.setItem(key, JSON.stringify(rows));
      },
      { key: STORAGE_KEY, ids: seedIds },
    );
    await page.reload();
    await expect(page.locator('#alert-table-body .data-table-row')).toHaveCount(2);

    await page.locator('.data-table-header-sort[data-sort-key="name"]').click();

    const orderAfter = await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      return JSON.parse(raw).map((r) => r.id);
    }, STORAGE_KEY);
    expect(orderAfter).toEqual(seedIds);
  });
});
