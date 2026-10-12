// @ts-check
const { test, expect } = require('@playwright/test');

const WEBHOOKS_PATH = '/webhooks/index.html';
const WEBHOOKS_STORAGE_KEY = 'ekara-prototype-webhooks';

async function openWebhooks(page) {
  await page.goto(WEBHOOKS_PATH);
  await expect(page.locator('#webhook-table-body .data-table-row').first()).toBeVisible();
}

async function openCreatePanel(page) {
  await page.locator('#btn-add-webhook').click();
  await expect(page.locator('#slide-panel.open')).toBeVisible();
  await expect(page.locator('#panel-title')).toHaveText('New webhook');
}

test.describe('Webhooks', () => {
  test('page loads with seeded table rows', async ({ page }) => {
    await openWebhooks(page);
    await expect(page.locator('#btn-add-webhook')).toBeVisible();
    await expect(page.locator('#webhook-table-body .data-table-row')).toHaveCount(5);
  });

  test('create drawer opens and cancel closes', async ({ page }) => {
    await openWebhooks(page);
    await openCreatePanel(page);
    await page.locator('#btn-cancel').click();
    await expect(page.locator('#slide-panel.open')).toHaveCount(0);
  });

  test('save shows validation errors for required name and URL', async ({ page }) => {
    await openWebhooks(page);
    await openCreatePanel(page);
    await page.locator('#save-btn').click();
    await expect(page.locator('#error-name')).toHaveText('Name required');
    await expect(page.locator('#error-url')).toHaveText('URL required');
    await expect(page.locator('#slide-panel.open')).toBeVisible();
  });

  test('service sections toggle Custom vs PagerDuty vs Generic', async ({ page }) => {
    await openWebhooks(page);
    await openCreatePanel(page);

    const mapping = page.locator('#mapping-section');
    const pagerduty = page.locator('#pagerduty-section');
    const preview = page.locator('#payload-preview-section');

    await expect(mapping).toHaveClass(/hidden/);
    await expect(pagerduty).toHaveClass(/hidden/);
    await expect(preview).toHaveClass(/hidden/);

    await page.selectOption('#field-service', 'PagerDuty');
    await expect(pagerduty).not.toHaveClass(/hidden/);
    await expect(mapping).toHaveClass(/hidden/);

    await page.selectOption('#field-service', 'Custom');
    await expect(mapping).not.toHaveClass(/hidden/);
    await expect(preview).not.toHaveClass(/hidden/);
    await expect(pagerduty).toHaveClass(/hidden/);

    await page.selectOption('#field-service', 'Generic');
    await expect(mapping).toHaveClass(/hidden/);
    await expect(pagerduty).toHaveClass(/hidden/);
  });

  test('OAuth toggle reveals required OAuth fields on save', async ({ page }) => {
    await openWebhooks(page);
    await openCreatePanel(page);
    await page.locator('#field-name').fill('OAuth test');
    await page.locator('#field-url').fill('https://example.com/hook');

    const oauthToggle = page.locator('label.toggle').filter({ has: page.locator('#field-oauth') });
    await oauthToggle.scrollIntoViewIfNeeded();
    await expect(page.locator('#oauth-fields-section')).toHaveClass(/hidden/);

    await oauthToggle.click();
    await expect(page.locator('#oauth-fields-section')).not.toHaveClass(/hidden/);

    await page.locator('#save-btn').click();
    await expect(page.locator('#error-token-endpoint')).toHaveText('This field is required');
    await expect(page.locator('#error-client-id')).toHaveText('This field is required');
    await expect(page.locator('#slide-panel.open')).toBeVisible();
  });

  test('Custom mapping updates payload preview', async ({ page }) => {
    await openWebhooks(page);
    await openCreatePanel(page);
    await page.selectOption('#field-service', 'Custom');
    await page.locator('#btn-add-mapping').click();

    await page.locator('.mapping-target').fill('alertMessage');
    await page.locator('.mapping-value').fill('Hello from E2E');

    const preview = page.locator('#payload-preview-content');
    await expect(preview).toContainText('"alertMessage"');
    await expect(preview).toContainText('Hello from E2E');
  });

  test('Custom service validates incomplete mapping rows', async ({ page }) => {
    await openWebhooks(page);
    await openCreatePanel(page);
    await page.locator('#field-name').fill('Custom incomplete');
    await page.locator('#field-url').fill('https://example.com/hook');
    await page.selectOption('#field-service', 'Custom');
    await page.locator('#btn-add-mapping').click();

    await page.locator('#save-btn').click();
    await expect(page.locator('.mapping-target-error').first()).toHaveText('This field is required');
    await expect(page.locator('#slide-panel.open')).toBeVisible();
  });

  test('created webhook persists after page reload', async ({ page }) => {
    await page.goto(WEBHOOKS_PATH);
    await page.evaluate((key) => localStorage.removeItem(key), WEBHOOKS_STORAGE_KEY);
    await page.reload();

    await openCreatePanel(page);
    await page.locator('#field-name').fill('E2E persist webhook');
    await page.locator('#field-url').fill('https://example.com/e2e-persist');
    await page.locator('#save-btn').click();
    await expect(page.locator('#webhook-table-body')).toContainText('E2E persist webhook');

    await page.reload();
    await expect(page.locator('#webhook-table-body')).toContainText('E2E persist webhook');
    await expect(page.locator('#webhook-table-body .data-table-row')).toHaveCount(6);
  });

  test('creates a Generic webhook and lists it in the table', async ({ page }) => {
    await openWebhooks(page);
    const before = await page.locator('#webhook-table-body .data-table-row').count();

    await openCreatePanel(page);
    await page.locator('#field-name').fill('E2E Generic webhook');
    await page.locator('#field-url').fill('https://example.com/e2e-webhook');
    await page.locator('#save-btn').click();

    await expect(page.locator('#slide-panel.open')).toHaveCount(0);
    await expect(page.locator('#webhook-table-body .data-table-row')).toHaveCount(before + 1);
    await expect(page.locator('#webhook-table-body')).toContainText('E2E Generic webhook');
  });

  test('edit opens panel with existing webhook data', async ({ page }) => {
    await openWebhooks(page);
    const firstRow = page.locator('#webhook-table-body .data-table-row').first();
    const name = await firstRow.locator('.data-table-cell').first().textContent();

    await firstRow.locator('.menu-trigger').click();
    await page.locator('.dropdown-item[data-action="edit"]').first().click();

    await expect(page.locator('#slide-panel.open')).toBeVisible();
    await expect(page.locator('#panel-title')).toHaveText('Edit webhook');
    await expect(page.locator('#field-name')).toHaveValue(name?.trim() || '');
  });

  test('delete removes webhook after confirmation', async ({ page }) => {
    await openWebhooks(page);
    const before = await page.locator('#webhook-table-body .data-table-row').count();
    const lastRow = page.locator('#webhook-table-body .data-table-row').last();
    const name = (await lastRow.locator('.data-table-cell').first().textContent())?.trim();

    await lastRow.locator('.menu-trigger').click();
    await page.locator('.dropdown-item[data-action="delete"]').last().click();
    await expect(page.locator('#confirm-dialog.open')).toBeVisible();
    await expect(page.locator('#confirm-message')).toContainText(name || '');

    await page.locator('#confirm-ok').click();
    await expect(page.locator('#webhook-table-body .data-table-row')).toHaveCount(before - 1);
  });
});
