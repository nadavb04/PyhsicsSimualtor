import { expect, test, type Page } from '@playwright/test';

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test('home → topic → question renders without horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /build your physics intuition/i })).toBeVisible();
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
  const small = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('button, a, input[type=range]')]
      .filter((el) => el.offsetParent !== null)
      .map((el) => ({ text: el.textContent?.trim() || el.tagName, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.height < 44 || r.width < 44)
      .map(({ text, r }) => `${text} (${Math.round(r.width)}×${Math.round(r.height)})`),
  );
  expect(small).toEqual([]);
});
