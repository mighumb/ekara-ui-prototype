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
    await expect(page.locator('#top5-list li')).toHaveCount(5);
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
    await expect(page.locator('#focus-through li').first()).toBeVisible();
  });

  test('tracker chip shows count when more than three selected', async ({ page }) => {
    await page.goto(JOURNEY_PATH);
    await page.locator('#filter-tracker-trigger').click();
    await page.locator('#tracker-opt-1111').check();
    await page.locator('#tracker-opt-54').check();
    await page.locator('#tracker-opt-kaya').check();
    await expect(page.locator('.tracker-chip--value .tracker-chip-text').first()).toHaveText('4 selected');
  });

  test('tracker placeholder when none selected', async ({ page }) => {
    await page.goto(JOURNEY_PATH);
    await page.locator('#filter-tracker-trigger').click();
    await page.locator('#tracker-opt-agent').uncheck();
    await expect(page.locator('#filter-tracker-placeholder')).toBeVisible();
    await expect(page.locator('#filter-tracker-placeholder')).toHaveText('Trackers');
    await expect(page.locator('.tracker-chip--value')).toHaveCount(0);
  });

  test('breakdown panel when device selected', async ({ page }) => {
    await page.goto(JOURNEY_PATH);
    await page.selectOption('#filter-breakdown', 'device');
    await expect(page.locator('#breakdown-panel')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#breakdown-bars .rum-journey-breakdown-row').first()).toBeVisible();
  });
});
