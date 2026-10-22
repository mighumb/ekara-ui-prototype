// @ts-check
const { test, expect } = require('@playwright/test');

const SSO_PATH = '/sso/index.html';
const SSO_STORAGE_KEY = 'ekara-prototype-sso';

async function openSso(page) {
  await page.goto(SSO_PATH);
  await expect(page.locator('#sso-table-body .data-table-row').first()).toBeVisible();
}

test.describe('Management — SSO', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      localStorage.removeItem(key);
    }, SSO_STORAGE_KEY);
  });

  test('page loads with seeded rows and Management sidebar links', async ({ page }) => {
    await openSso(page);
    await expect(page.locator('.page-title')).toHaveText('SSO');
    await expect(page.locator('#sso-table-body .data-table-row')).toHaveCount(11);
    await expect(page.getByRole('link', { name: 'SSO' })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('link', { name: 'Webhooks' })).toBeVisible();
  });

  test('default sort is Name ascending', async ({ page }) => {
    await openSso(page);
    const nameHeader = page.locator('.data-table-header-sort[data-sort-key="name"]');
    await expect(nameHeader).toHaveClass(/is-sorted-asc/);
    const names = await page.locator('#sso-table-body .data-table-row').evaluateAll((rows) =>
      rows.map((row) => row.querySelector('.data-table-cell')?.textContent?.trim() || ''),
    );
    const sorted = [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    expect(names).toEqual(sorted);
  });

  test('kebab edit opens drawer; delete removes row after confirm', async ({ page }) => {
    await openSso(page);
    const row = page.locator('#sso-table-body .data-table-row').filter({ hasText: 'Azure' });
    await row.locator('.menu-trigger').click();
    await row.locator('.dropdown-item', { hasText: 'Edit' }).click();
    await expect(page.locator('#slide-panel.open')).toBeVisible();
    await expect(page.locator('#panel-title')).toHaveText('Edit SSO');
    await page.locator('#panel-close').click();

    await row.locator('.menu-trigger').click();
    await row.locator('.dropdown-item', { hasText: 'Delete' }).click();
    await expect(page.locator('#confirm-dialog.open')).toBeVisible();
    await page.locator('#confirm-ok').click();
    await expect(page.locator('#sso-table-body .data-table-row')).toHaveCount(10);
  });

  test('Add SSO creates row from drawer', async ({ page }) => {
    await openSso(page);
    await page.locator('#btn-add-sso').click();
    await page.locator('#field-name').fill('Prototype SSO');
    await page.locator('#save-btn').click();
    await expect(page.locator('#slide-panel.open')).toHaveCount(0);
    await expect(page.locator('#sso-table-body .data-table-row').filter({ hasText: 'Prototype SSO' })).toBeVisible();
  });
});
