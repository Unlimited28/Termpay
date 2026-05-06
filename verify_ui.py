import os
import time
from playwright.sync_api import sync_playwright, expect

def verify_ui():
    screenshot_dir = "verification_screenshots_final"
    if not os.path.exists(screenshot_dir):
        os.makedirs(screenshot_dir)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Main Desktop Context
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        base_url = "http://localhost:5173"

        try:
            print("Navigating to login page...")
            page.goto(f"{base_url}/login")
            page.wait_for_selector("text=Welcome Back", timeout=10000)
            page.screenshot(path=f"{screenshot_dir}/01_login.png")

            print("Attempting login...")
            page.fill('input[type="email"]', "bursar@yomfield.sch.ng")
            page.fill('input[type="password"]', "Demo1234!")
            page.click('button[type="submit"]')

            print("Waiting for dashboard navigation...")
            page.wait_for_selector("text=Good morning", timeout=20000)
            time.sleep(2)
            print("Dashboard loaded.")
            page.screenshot(path=f"{screenshot_dir}/02_dashboard.png", full_page=True)

            print("Navigating to Students page...")
            page.click("nav >> text=Students")
            page.wait_for_selector("text=15 Total", timeout=10000) # Stats bar text
            time.sleep(1)
            page.screenshot(path=f"{screenshot_dir}/03_students.png", full_page=True)

            print("Navigating to Fee Structure page...")
            page.click("nav >> text=Fee Structure")
            page.wait_for_selector("text=Fee Structure", timeout=10000)
            time.sleep(1)
            page.screenshot(path=f"{screenshot_dir}/04_fee_structure.png", full_page=True)

            print("Testing Generate All Bills modal...")
            page.click("text=Generate All Bills")
            page.wait_for_selector("text=Generating bills", timeout=5000)
            time.sleep(1)
            page.screenshot(path=f"{screenshot_dir}/04b_generate_modal.png")
            page.click("text=Close")

            print("Navigating to Bank Statements page...")
            page.click("nav >> text=Bank Statements")
            page.wait_for_selector("text=Drop your bank statement here", timeout=10000)
            time.sleep(1)

            print("Navigating to Bank Statement Review page via hover...")
            page.hover("tr:has-text('gtbank_march_2026.csv')")
            time.sleep(0.5)
            page.screenshot(path=f"{screenshot_dir}/05_bank_statements_hover.png", full_page=True)
            page.click("text=Review →")

            page.wait_for_selector("h1:has-text('Statement Review')", timeout=15000)
            time.sleep(1)
            page.screenshot(path=f"{screenshot_dir}/06_bank_review.png", full_page=True)

            # Parent Portal
            print("Navigating to Parent Login...")
            page.goto(f"{base_url}/login")
            page.click("text=Login here")
            page.wait_for_selector("text=Parent Payment Portal", timeout=10000)
            page.fill("input", "08012345671")
            page.click("button >> text=Send OTP")

            print("Entering OTP...")
            page.wait_for_selector('input[type="text"]', timeout=5000)
            inputs = page.query_selector_all('input[type="text"]')
            otps = ["1", "2", "3", "4", "5", "6"]
            for i, val in enumerate(otps):
                inputs[i].fill(val)

            print("Waiting for Parent Dashboard...")
            page.click("button >> text=Verify & Login")
            page.wait_for_selector("text=FULLY PAID", timeout=15000)
            time.sleep(1)
            page.screenshot(path=f"{screenshot_dir}/07_parent_dashboard.png", full_page=True)

            # Mobile view - separate context to be clean
            print("Capturing mobile view of Students page...")
            mobile_context = browser.new_context(viewport={"width": 390, "height": 844}, user_agent="iPhone")
            mobile_page = mobile_context.new_page()
            mobile_page.goto(f"{base_url}/login")
            mobile_page.fill('input[type="email"]', "bursar@yomfield.sch.ng")
            mobile_page.fill('input[type="password"]', "Demo1234!")
            mobile_page.click('button[type="submit"]')
            mobile_page.wait_for_url("**/dashboard")

            mobile_page.goto(f"{base_url}/students")
            mobile_page.wait_for_selector("text=15 Total", timeout=10000)
            time.sleep(2)
            mobile_page.screenshot(path=f"{screenshot_dir}/08_students_mobile.png")

            print("Verification successful!")

        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path=f"{screenshot_dir}/error_final.png", full_page=True)
        finally:
            browser.close()

if __name__ == "__main__":
    verify_ui()
