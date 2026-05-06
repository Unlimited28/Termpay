
import { chromium } from 'playwright';
import path from 'path';

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  console.log('Starting verification...');

  // 1. Login
  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="email"]', 'proprietor@yomfield.sch.ng');
  await page.fill('input[type="password"]', 'Demo1234!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  console.log('Admin login successful');

  const screenshotsDir = 'verification_screenshots';
  const fs = require('fs');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

  // 01. Login Page (logout first)
  await page.goto('http://localhost:5173/login');
  await page.screenshot({ path: path.join(screenshotsDir, '01_login.png') });
  console.log('01_login.png captured');

  // Re-login for others
  await page.fill('input[type="email"]', 'proprietor@yomfield.sch.ng');
  await page.fill('input[type="password"]', 'Demo1234!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');

  // 02. Dashboard
  await page.screenshot({ path: path.join(screenshotsDir, '02_dashboard.png'), fullPage: true });
  console.log('02_dashboard.png captured');

  // 03. Students
  await page.goto('http://localhost:5173/students');
  await page.waitForSelector('table');
  await page.screenshot({ path: path.join(screenshotsDir, '03_students.png'), fullPage: true });
  console.log('03_students.png captured');

  // 04. Fee Structure
  await page.goto('http://localhost:5173/fee-structure');
  await page.waitForSelector('text=Fee Structure');
  await page.screenshot({ path: path.join(screenshotsDir, '04_fee_structure.png'), fullPage: true });
  console.log('04_fee_structure.png captured');

  // 05. Bank Statements
  await page.goto('http://localhost:5173/bank-statements');
  await page.waitForSelector('text=Drop your bank statement here');
  await page.screenshot({ path: path.join(screenshotsDir, '05_bank_statements.png'), fullPage: true });
  console.log('05_bank_statements.png captured');

  // 06. Bank Review
  await page.goto('http://localhost:5173/bank-statements/u1');
  await page.waitForSelector('text=Statement Review');
  await page.screenshot({ path: path.join(screenshotsDir, '06_bank_review.png'), fullPage: true });
  console.log('06_bank_review.png captured');

  // 07. Parent Dashboard
  console.log('Accessing Parent Dashboard...');
  await page.goto('http://localhost:5173/parent/login');
  await page.evaluate(() => {
    localStorage.setItem('parentAuth', 'true');
  });
  await page.goto('http://localhost:5173/parent/dashboard');
  await page.waitForSelector('text=Payment Summary');
  await page.screenshot({ path: path.join(screenshotsDir, '07_parent_dashboard.png'), fullPage: true });
  console.log('07_parent_dashboard.png captured');

  await browser.close();
  console.log('Verification complete!');
}

run().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
