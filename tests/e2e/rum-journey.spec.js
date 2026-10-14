// @ts-check
const { test, expect } = require('@playwright/test');

const JOURNEY_PATH = '/measures/explore/rum/user-journey-mapping/index.html';

test.describe('Measures — RUM user journey mapping', () => {
  test('navigation, filters, and path exploration render', async ({ page }) => {
    await page.goto(JOURNEY_PATH);
    await expect(page.locator('.topbar-breadcrumb')).toContainText('RUM user journey mapping');
    await expect(page.locator('#page-title')).toHaveText('RUM user journey mapping');
    await expect(page.locator('.sidebar-subitem-link.active')).toHaveText('RUM user journey mapping');
    await expect(page.locator('#filter-dimension')).toHaveText('Page group');
    await expect(page.locator('.rum-journey-filters .form-label')).toHaveCount(0);
    await expect(page.locator('#path-graph .rum-journey-node').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.rum-journey-path-link-hit').first()).toHaveAttribute('data-tooltip', /sessions/);
    await expect(page.locator('#top5-list li')).toHaveCount(5);
    await expect(page.locator('#top5-list .rum-journey-top5-value').first()).toContainText('sessions');
  });

  test('empty state when tracker has no paths', async ({ page }) => {
    await page.goto(JOURNEY_PATH);
    await page.locator('#filter-tracker-trigger').click();
    await page.locator('#tracker-opt-empty').check();
    await page.locator('#tracker-opt-agent').uncheck();
    await expect(page.locator('#journey-empty')).toBeVisible({ timeout: 3000 });
  });

  test('error state and retry', async ({ page }) => {
    await page.goto(JOURNEY_PATH);
    await page.locator('#filter-tracker-trigger').click();
    await page.locator('#tracker-opt-error').check();
    await page.locator('#tracker-opt-agent').uncheck();
    await expect(page.locator('#journey-error')).toBeVisible({ timeout: 3000 });
    await page.locator('#journey-retry').click();
    await expect(page.locator('#journey-error')).toBeVisible();
  });

  test('selecting a page group shows focus panel', async ({ page }) => {
    await page.goto(JOURNEY_PATH);
    await page.locator('.rum-journey-node', { hasText: 'Product' }).click();
    await expect(page.locator('#node-focus-panel')).toBeVisible();
    await expect(page.locator('#focus-selected-title')).toHaveText('Product');
    await expect(page.locator('#focus-before .rum-journey-focus-value').first()).toContainText('sessions');
    await expect(page.locator('#focus-through .rum-journey-focus-value').first()).toContainText('sessions');
  });

  test('selecting Product dims other page group cards like Home', async ({ page }) => {
    await page.goto(JOURNEY_PATH);
    await page.locator('.rum-journey-node', { hasText: 'Product' }).click();
    await expect(page.locator('.rum-journey-node.is-selected')).toHaveCount(1);
    await expect(page.locator('.rum-journey-node.is-dimmed')).toHaveCount(6);
  });

  test('tracker chip shows count when more than three selected', async ({ page }) => {
    await page.goto(JOURNEY_PATH);
    await page.locator('#filter-tracker-trigger').click();
    await page.locator('#tracker-opt-1111').check();
    await page.locator('#tracker-opt-54').check();
    await page.locator('#tracker-opt-kaya').check();
    await expect(page.locator('.measure-tracker-chips .ekara-chip-label').filter({ hasText: '4 selected' })).toBeVisible();
  });

  test('date range picker opens and applies preset', async ({ page }) => {
    await page.goto(JOURNEY_PATH);
    await page.locator('.ekara-date-range-trigger').click();
    await expect(page.locator('.ekara-date-range-panel')).toBeVisible();
    await page.locator('[data-preset="this-month"]').click();
    await page.locator('.ekara-date-range-apply').click();
    await expect(page.locator('.ekara-date-range-panel')).toBeHidden();
    await expect(page.locator('#filter-date-range')).toHaveValue(/\d{2}\/\d{2}\/\d{4} - \d{2}\/\d{2}\/\d{4}/);
  });

  test('tracker selection capped at ten like RUM trends', async ({ page }) => {
    await page.goto(JOURNEY_PATH);
    await page.locator('#filter-tracker-trigger').click();
    await page.locator('#tracker-opt-all').check();
    await expect(page.locator('.measure-tracker-chips .ekara-chip-label').filter({ hasText: '10 selected' })).toBeVisible();
    await expect(page.locator('#tracker-opt-empty')).toBeDisabled();
  });

  test('tracker placeholder when none selected', async ({ page }) => {
    await page.goto(JOURNEY_PATH);
    await page.locator('#filter-tracker-trigger').click();
    await page.locator('#tracker-opt-agent').uncheck();
    await expect(page.locator('#filter-tracker-trigger .measure-filter-prefix')).toHaveText('Trackers:');
    await expect(page.locator('.measure-tracker-chips .ekara-chip')).toHaveCount(0);
  });

  test('breakdown panel when device selected', async ({ page }) => {
    await page.goto(JOURNEY_PATH);
    const breakdown = page.locator('[data-ekara-inline-select]:has(#filter-breakdown)');
    await breakdown.locator('.ekara-inline-select-trigger').click();
    await breakdown.locator('.ekara-inline-select-option', { hasText: 'Device' }).click();
    await expect(page.locator('#breakdown-panel')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#breakdown-bars .rum-journey-breakdown-row').first()).toBeVisible();
  });
});
