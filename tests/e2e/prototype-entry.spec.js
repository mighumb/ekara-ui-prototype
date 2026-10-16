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

  async function expectSidebarLinkMatchesSubitem(page, linkName, referenceLabel) {
    const link = page.getByRole('link', { name: linkName });
    const reference = page.locator('.sidebar-subitem', { hasText: referenceLabel });
    const linkColor = await link.evaluate((el) => getComputedStyle(el).color);
    const referenceColor = await reference.evaluate((el) => getComputedStyle(el).color);
    expect(linkColor).toBe(referenceColor);
  }

  test('Trackers sidebar link is readable on Alert rules', async ({ page }) => {
    await page.goto('/settings/alerts/');
    await expectSidebarLinkMatchesSubitem(page, 'Trackers', 'Page groups');
  });

  test('Alerts sidebar link is readable on RUM Trackers', async ({ page }) => {
    await page.goto('/settings/rum/trackers/');
    await expectSidebarLinkMatchesSubitem(page, 'Alerts', 'Scenarios');
  });

<<<<<<< HEAD
  test('active RUM journey sidebar link is readable on Measures', async ({ page }) => {
    await page.goto('/measures/explore/rum/user-journey-mapping/');
    await expectSidebarLinkMatchesSubitem(page, 'RUM user journey mapping', 'Performance');
=======
  test('active sidebar links use the same active color across screens', async ({ page }) => {
    await page.goto('/settings/alerts/');
    const alertsActive = page.getByRole('link', { name: 'Alerts' });
    const alertsColor = await alertsActive.evaluate((el) => getComputedStyle(el).color);

    await page.goto('/measures/explore/rum/user-journey-mapping/');
    const journeyActive = page.getByRole('link', { name: 'RUM user journey mapping' });
    const journeyColor = await journeyActive.evaluate((el) => getComputedStyle(el).color);
    expect(journeyColor).toBe(alertsColor);
>>>>>>> b3fb690 (chore(sidebar): align Trackers active item pattern; document link class rule)
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
