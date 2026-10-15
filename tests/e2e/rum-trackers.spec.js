// @ts-check
const { test, expect } = require('@playwright/test');

const TRACKERS_PATH = '/settings/rum/trackers/index.html';
const STORAGE_KEY = 'ekara-prototype-rum-tracker-thresholds';

async function openTrackersFresh(page) {
  await page.goto(TRACKERS_PATH);
  await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  await page.reload();
  await expect(page.locator('#tracker-table-body .data-table-row').first()).toBeVisible();
}

async function openThresholdsForFirstTracker(page) {
  await page.locator('#tracker-table-body .menu-trigger').first().click();
  await page.locator('.dropdown-item[data-action="thresholds"]').first().click();
  await expect(page.locator('#slide-panel.open')).toBeVisible();
}

test.describe('Settings — RUM Trackers thresholds', () => {
  test('page loads tracker table', async ({ page }) => {
    await openTrackersFresh(page);
    await expect(page.locator('.page-title')).toHaveText('Trackers');
    await expect(page.locator('#tracker-table-body .data-table-row')).toHaveCount(3);
  });

  test('threshold drawer opens with one metric block and DS select', async ({ page }) => {
    await openTrackersFresh(page);
    await openThresholdsForFirstTracker(page);
    await expect(page.locator('#panel-title')).toContainText('1111 – RUM threshold');
    await expect(page.locator('.rum-threshold-block')).toHaveCount(1);
    await expect(page.locator('[data-ekara-inline-select] .ekara-inline-select-trigger')).toHaveCount(1);
  });

  test('add metric, exclude duplicates, save persists, cancel discards draft', async ({ page }) => {
    await openTrackersFresh(page);
    await openThresholdsForFirstTracker(page);

    await page.locator('#btn-add-metric').click();
    await expect(page.locator('.rum-threshold-block')).toHaveCount(2);
    await expect(page.locator('.remove-metric-block')).toHaveCount(2);

    const secondBlock = page.locator('.rum-threshold-block').nth(1);
    const secondSelect = secondBlock.locator('[data-ekara-inline-select]');
    await secondSelect.locator('.ekara-inline-select-trigger').click();
    const optionLabels = await secondSelect.locator('.ekara-inline-select-option').allTextContents();
    expect(optionLabels.some((t) => t.includes('TTI'))).toBe(false);
    await secondSelect.locator('.ekara-inline-select-option').first().click();

    await page.locator('#btn-save').click();
    await expect(page.locator('#slide-panel.open')).toHaveCount(0);

    await openThresholdsForFirstTracker(page);
    await expect(page.locator('.rum-threshold-block')).toHaveCount(2);

    await page.locator('#btn-add-metric').click();
    await expect(page.locator('.rum-threshold-block')).toHaveCount(3);
    await page.locator('#btn-cancel').click();
    await expect(page.locator('#slide-panel.open')).toHaveCount(0);

    await openThresholdsForFirstTracker(page);
    await expect(page.locator('.rum-threshold-block')).toHaveCount(2);
  });

  test('remove metric block when more than one', async ({ page }) => {
    await openTrackersFresh(page);
    await openThresholdsForFirstTracker(page);
    await page.locator('#btn-add-metric').click();
    await expect(page.locator('.rum-threshold-block')).toHaveCount(2);
    await page.locator('.remove-metric-block').nth(1).click();
    await expect(page.locator('.rum-threshold-block')).toHaveCount(1);
    await expect(page.locator('.remove-metric-block.hidden')).toHaveCount(1);
  });
});
