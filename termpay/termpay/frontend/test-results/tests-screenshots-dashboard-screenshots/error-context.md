# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/screenshots.spec.ts >> dashboard screenshots
- Location: tests/screenshots.spec.ts:3:1

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.fill: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  |
  3  | test('dashboard screenshots', async ({ page }) => {
  4  |   await page.goto('http://localhost:5173/login');
> 5  |   await page.fill('input[type="email"]', 'proprietor@yomfield.sch.ng');
     |              ^ Error: page.fill: Test timeout of 60000ms exceeded.
  6  |   await page.fill('input[type="password"]', 'Admin1234!');
  7  |   await page.click('button:has-text("Login as Admin")');
  8  |   await page.waitForURL('**/dashboard', { timeout: 15000 });
  9  |   await page.waitForSelector('h1:has-text("Overview")', { timeout: 15000 });
  10 |   await page.waitForTimeout(2000);
  11 |
  12 |   await page.setViewportSize({ width: 1280, height: 800 });
  13 |   await page.screenshot({ path: 'dashboard-desktop.png', fullPage: true });
  14 |
  15 |   await page.setViewportSize({ width: 375, height: 800 });
  16 |   await page.waitForTimeout(1000);
  17 |   await page.screenshot({ path: 'dashboard-mobile.png', fullPage: true });
  18 | });
  19 |
```