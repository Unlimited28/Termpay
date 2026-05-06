import asyncio
from playwright.asyncio import jit_events, Playwright, async_playwright
import os

BASE_URL = "http://localhost:5173"
SCREENSHOT_DIR = "verification_screenshots_final"

async def run(playwright: Playwright):
    browser = await playwright.chromium.launch()
    # iPhone 13 Pro dimensions
    context = await browser.new_context(
        viewport={'width': 390, 'height': 844},
        user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
    )
    page = await context.new_page()

    print("Mobile: Logging in...")
    await page.goto(f"{BASE_URL}/login")
    await page.fill('input[type="email"]', "proprietor@yomfield.sch.ng")
    await page.fill('input[type="password"]', "Demo1234!")
    await page.click('button:has-text("Sign In")')

    await page.wait_for_url(f"{BASE_URL}/dashboard")
    await page.wait_for_selector("text=Total Students")
    await asyncio.sleep(2)
    await page.screenshot(path=f"{SCREENSHOT_DIR}/09_mobile_dashboard.png")
    print("Mobile Dashboard screenshot taken.")

    print("Mobile: Checking Students page...")
    await page.click('nav a:has-text("Students")')
    await page.wait_for_selector("text=15 Total") # Stats bar
    await asyncio.sleep(1)
    await page.screenshot(path=f"{SCREENSHOT_DIR}/10_mobile_students.png")
    print("Mobile Students screenshot taken.")

    await browser.close()

async def main():
    async with async_playwright() as playwright:
        await run(playwright)

if __name__ == "__main__":
    asyncio.run(main())
