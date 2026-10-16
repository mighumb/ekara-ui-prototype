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

function satisfactionField(page, field) {
  return page.locator(
    `[data-visual="satisfaction"] .rum-threshold-marker[data-marker-field="${field}"] .rum-threshold-marker-input`,
  );
}

async function selectMetricInBlock(page, blockIndex, labelPart) {
  const block = page.locator('.rum-threshold-block').nth(blockIndex);
  const wrap = block.locator('[data-ekara-inline-select]');
  await wrap.locator('.ekara-inline-select-trigger').click();
  await wrap.locator('.ekara-inline-select-option').filter({ hasText: labelPart }).first().click();
}

test.describe('Settings — RUM Trackers thresholds', () => {
  test('metric preset catalog is internally consistent', async ({ page }) => {
    await page.goto(TRACKERS_PATH);
    const result = await page.evaluate(() => window.__ekaraValidateRumMetricPresets());
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

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

  test('threshold order validation shows correct message per step', async ({ page }) => {
    await openTrackersFresh(page);
    await openThresholdsForFirstTracker(page);

    const tolerating = satisfactionField(page, 'tolerating');
    await tolerating.fill('1');
    await tolerating.blur();
    await expect(page.locator('[data-threshold-error="satisfaction"]')).toHaveText(
      'The value of the second threshold must be higher than the first.',
    );

    await tolerating.fill('3');
    await tolerating.blur();
    const unacceptable = satisfactionField(page, 'unacceptable');
    await unacceptable.fill('3');
    await unacceptable.blur();
    await expect(page.locator('[data-threshold-error="satisfaction"]')).toHaveText(
      'The value of the third threshold must be higher than the second.',
    );

    await page.locator('#btn-save').click();
    await expect(page.locator('#slide-panel.open')).toBeVisible();
  });

  test('validation error highlights the field being edited', async ({ page }) => {
    await openTrackersFresh(page);
    await openThresholdsForFirstTracker(page);

    const tolerating = satisfactionField(page, 'tolerating');
    await tolerating.fill('8');
    await tolerating.blur();

    await expect(page.locator('[data-threshold-error="satisfaction"]')).toHaveText(
      'The value of the second threshold must be lower than the third.',
    );
    await expect(tolerating).toHaveClass(/error/);
    await expect(satisfactionField(page, 'unacceptable')).not.toHaveClass(/error/);
  });

  test('metric preset applies official defaults and locks standard performance', async ({ page }) => {
    await openTrackersFresh(page);
    await openThresholdsForFirstTracker(page);

    await selectMetricInBlock(page, 0, 'LCP');
    await expect(
      page.locator('[data-visual="performance"] [data-marker-field="average"] .rum-threshold-marker-input'),
    ).toBeDisabled();
    await expect(page.locator('.rum-threshold-standard-note')).toHaveText('Standard thresholds are not editable');
    await expect(satisfactionField(page, 'satisfied')).toHaveValue('1');
    await expect(
      page.locator('[data-visual="performance"] [data-marker-field="average"] .rum-threshold-marker-input'),
    ).toHaveValue('2,5');

    await selectMetricInBlock(page, 0, 'DOM Interactive');
    await expect(satisfactionField(page, 'satisfied')).toHaveValue('2');
    await expect(satisfactionField(page, 'tolerating')).toBeEnabled();
    await expect(satisfactionField(page, 'unacceptable')).toBeEnabled();

    await selectMetricInBlock(page, 0, 'ONT');
    await expect(satisfactionField(page, 'satisfied')).toBeEnabled();
    await expect(satisfactionField(page, 'tolerating')).toBeEnabled();
    await expect(
      page.locator('[data-visual="performance"] [data-marker-field="satisfied"] .rum-threshold-marker-input'),
    ).toBeDisabled();
    await expect(
      page.locator('[data-visual="performance"] [data-marker-field="tolerating"] .rum-threshold-marker-input'),
    ).toBeDisabled();
  });

  test('legacy saved performance shape does not corrupt four-segment metrics', async ({ page }) => {
    await openTrackersFresh(page);
    await page.evaluate((key) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          1: [
            {
              metricId: 'fcp',
              satisfaction: { satisfied: 1, tolerating: 3, unacceptable: 4 },
              performance: { average: 9, slow: 99 },
            },
          ],
        }),
      );
    }, STORAGE_KEY);
    await page.reload();
    await openThresholdsForFirstTracker(page);
    await selectMetricInBlock(page, 0, 'FCP');
    await expect(
      page.locator('[data-visual="performance"] [data-marker-field="satisfied"] .rum-threshold-marker-input'),
    ).toHaveValue('1');
    await expect(
      page.locator('[data-visual="performance"] [data-marker-field="tolerating"] .rum-threshold-marker-input'),
    ).toHaveValue('3');
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
