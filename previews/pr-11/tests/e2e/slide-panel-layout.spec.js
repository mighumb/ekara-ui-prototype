// @ts-check
const { test, expect } = require('@playwright/test');

async function expectUniformSlidePanelFooterPadding(page) {
  const padding = await page.locator('.slide-panel-footer').evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      top: s.paddingTop,
      right: s.paddingRight,
      bottom: s.paddingBottom,
      left: s.paddingLeft,
    };
  });
  expect(padding.top).toBe(padding.bottom);
  expect(padding.left).toBe(padding.right);
  expect(padding.top).toBe('24px');
}

test.describe('Slide panel layout (shared DS)', () => {
  test('webhooks create drawer footer padding is uniform', async ({ page }) => {
    await page.goto('/webhooks/index.html');
    await page.locator('#btn-add-webhook').click();
    await expect(page.locator('#slide-panel.open')).toBeVisible();
    await expectUniformSlidePanelFooterPadding(page);
  });

  test('alerts create drawer footer padding is uniform', async ({ page }) => {
    await page.goto('/settings/alerts/index.html');
    await page.locator('#btn-add-alert').click();
    await expect(page.locator('#slide-panel.open')).toBeVisible();
    await expectUniformSlidePanelFooterPadding(page);
  });

  test('RUM trackers threshold drawer footer padding is uniform', async ({ page }) => {
    await page.goto('/settings/rum/trackers/index.html');
    await page.locator('#tracker-table-body .menu-trigger').first().click();
    await page.locator('.dropdown-item[data-action="thresholds"]').first().click();
    await expect(page.locator('#slide-panel.open')).toBeVisible();
    await expectUniformSlidePanelFooterPadding(page);
  });
});
