import { expect, test, type Page } from '@playwright/test';

const LOCALE_KEY = 'physics-intuition-locale';

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

async function smallTapTargets(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('button, a, input[type=range]')]
      .filter((el) => el.offsetParent !== null)
      .map((el) => ({ text: el.textContent?.trim() || el.tagName, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.height < 44 || r.width < 44)
      .map(({ text, r }) => `${text} (${Math.round(r.width)}×${Math.round(r.height)})`),
  );
}

test.describe('English', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      (key) => localStorage.setItem(key, JSON.stringify({ state: { locale: 'en' }, version: 1 })),
      LOCALE_KEY,
    );
  });

  test('home → topic → question renders without horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: /build your physics intuition/i }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('link', { name: /1D Kinematics/ }).click();
    await page.getByRole('link', { name: /Stone Thrown Upward/ }).click();
    await expect(page.getByRole('img', { name: /simulation/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('prediction loop runs the real simulation and persists the score', async ({ page }) => {
    await page.goto('/#/topic/kinematics-1d/stone-thrown-upward');
    await page.getByRole('radio', { name: /twice/i }).click();
    await page.getByRole('button', { name: /lock in/i }).click();

    // Let the simulation play out on its own (≈4.5 s flight), no skipping.
    await expect(page.getByText(/\+10 pts/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('total-score')).toHaveText('10');

    await page.reload();
    await expect(page.getByTestId('total-score')).toHaveText('10');
  });

  test('touch targets are at least 44px', async ({ page }) => {
    await page.goto('/#/topic/kinematics-1d/stone-thrown-upward');
    expect(await smallTapTargets(page)).toEqual([]);
  });
});

test.describe('Hebrew (default)', () => {
  test('opens in Hebrew, right-to-left, without horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { name: 'פתחו אינטואיציה פיזיקלית' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('link', { name: /קינמטיקה חד-ממדית/ }).click();
    await page.getByRole('link', { name: /אבן שנזרקת/ }).click();
    await expect(page.getByTestId('sim-stage')).toHaveAttribute('dir', 'ltr');
    await expectNoHorizontalOverflow(page);
    expect(await smallTapTargets(page)).toEqual([]);
  });

  test('language choice persists across reloads', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /switch to english/i }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await page.reload();
    await expect(
      page.getByRole('heading', { name: /build your physics intuition/i }),
    ).toBeVisible();
  });
});
