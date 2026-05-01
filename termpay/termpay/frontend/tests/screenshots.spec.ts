import { test, expect } from '@playwright/test';

test('dashboard screenshots', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="email"]', 'proprietor@yomfield.sch.ng');
  await page.fill('input[type="password"]', 'Admin1234!');
  await page.click('button:has-text("Login as Admin")');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForSelector('h1:has-text("Overview")', { timeout: 15000 });
  await page.waitForTimeout(2000);

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.screenshot({ path: 'dashboard-desktop.png', fullPage: true });

  await page.setViewportSize({ width: 375, height: 800 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'dashboard-mobile.png', fullPage: true });
});
