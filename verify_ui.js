const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  const baseUrl = 'http://localhost:5173';
  const screenshotDir = path.join(__dirname, 'verification_screenshots_final');

  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  try {
    console.log('Navigating to login page...');
    await page.goto(`${baseUrl}/login`);
    await page.waitForSelector('text=Welcome Back');
    await page.screenshot({ path: path.join(screenshotDir, '01_login.png') });

    console.log('Attempting login...');
    await page.fill('input[type="email"]', 'bursar@yomfield.sch.ng');
    await page.fill('input[type="password"]', 'Demo1234!');
    await page.click('button[type="submit"]');

    console.log('Waiting for dashboard navigation...');
    // Wait for the greeting which is part of the new design
    await page.waitForSelector('text=Good morning', { timeout: 15000 });
    console.log('Dashboard loaded.');
    await page.screenshot({ path: path.join(screenshotDir, '02_dashboard.png'), fullPage: true });

    console.log('Navigating to Students page...');
    await page.click('nav >> text=Students');
    await page.waitForSelector('text=Total Students', { timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotDir, '03_students.png'), fullPage: true });

    console.log('Navigating to Fee Structure page...');
    await page.click('nav >> text=Fee Structure');
    await page.waitForSelector('text=Fee Structure', { timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotDir, '04_fee_structure.png'), fullPage: true });

    console.log('Navigating to Bank Statements page...');
    await page.click('nav >> text=Bank Statements');
    await page.waitForSelector('text=Drop your bank statement here', { timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotDir, '05_bank_statements.png'), fullPage: true });

    // Review page usually needs a specific ID, let's try to click "Review" if it exists or navigate directly
    console.log('Navigating to Bank Statement Review page...');
    await page.goto(`${baseUrl}/bank-statements/bs-1`); // Using mock ID from code
    await page.waitForSelector('text=Review Statement', { timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotDir, '06_bank_review.png'), fullPage: true });

    // Parent Portal
    console.log('Navigating to Parent Login...');
    await page.goto(`${baseUrl}/login`);
    await page.click('text=Login here');
    await page.waitForSelector('text=Parent Access');
    await page.fill('input', '08030000001');
    await page.click('button');
    // OTP inputs
    const otps = ['1', '2', '3', '4', '5', '6'];
    const inputs = await page.$$('input[type="text"]');
    for (let i = 0; i < inputs.length; i++) {
        await inputs[i].fill(otps[i]);
    }
    await page.waitForSelector('text=Student Profile', { timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotDir, '07_parent_dashboard.png'), fullPage: true });

    // Mobile view for Students
    console.log('Capturing mobile view of Students page...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${baseUrl}/students`);
    await page.waitForSelector('text=Total Students', { timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotDir, '08_students_mobile.png'), fullPage: true });

  } catch (error) {
    console.error('Error during verification:', error);
    await page.screenshot({ path: path.join(screenshotDir, 'error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();
