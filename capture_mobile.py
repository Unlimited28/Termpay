import os
import time
from playwright.sync_api import sync_playwright

def capture_mobile():
    screenshot_dir = "verification_screenshots_final"
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # iPhone 13 dimensions
        context = browser.new_context(viewport={"width": 390, "height": 844}, user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1")
        page = context.new_page()
        base_url = "http://localhost:5173"

        print("Mobile: Logging in...")
        page.goto(f"{base_url}/login")
        page.fill('input[type="email"]', "bursar@yomfield.sch.ng")
        page.fill('input[type="password"]', "Demo1234!")
        page.click('button[type="submit"]')

        page.wait_for_url("**/dashboard", timeout=15000)
        time.sleep(3)
        page.screenshot(path=f"{screenshot_dir}/09_dashboard_mobile.png")

        print("Mobile: Navigating to Students...")
        page.goto(f"{base_url}/students")
        time.sleep(3) # Wait for cards to render
        page.screenshot(path=f"{screenshot_dir}/10_students_mobile.png")

        browser.close()

if __name__ == "__main__":
    capture_mobile()
