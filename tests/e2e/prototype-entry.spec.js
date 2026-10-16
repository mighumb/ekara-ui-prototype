// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Prototype entry (single main URL)', () => {
  test('site root opens the default Measures screen', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/measures\/explore\/rum\/user-journey-mapping\//);
    await expect(page.locator('#page-title')).toContainText('RUM user journey mapping');
  });

  test('hub listing is available with ?hub=1', async ({ page }) => {
    await page.goto('/?hub=1');
    await expect(page.getByRole('heading', { name: 'Ekara UI Prototype' })).toBeVisible();
    await expect(page.getByRole('link', { name: /RUM Trackers/ })).toBeVisible();
  });

  test('bento navigates between modules on the same deployment', async ({ page }) => {
    await page.goto('/settings/rum/trackers/');
    await page.locator('#btn-bento').click();
    await page.locator('.bento-menu-item[data-module="Management"]').click();
    await expect(page).toHaveURL(/\/webhooks\//);
    await page.locator('#btn-bento').click();
    await page.locator('.bento-menu-item[data-module="Measures"]').click();
    await expect(page).toHaveURL(/user-journey-mapping/);
  });
});
