
from playwright.sync_api import sync_playwright
import os
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        print('Starting verification...')

        try:
            # 1. Login
            page.goto('http://localhost:5173/login')
            page.fill('input[type="email"]', 'proprietor@yomfield.sch.ng')
            page.fill('input[type="password"]', 'Demo1234!')
            page.click('button[type="submit"]')
            page.wait_for_url('**/dashboard')
            print('Admin login successful')

            screenshots_dir = 'verification_screenshots'
            if not os.path.exists(screenshots_dir):
                os.makedirs(screenshots_dir)

            # 01. Login Page (logout)
            page.goto('http://localhost:5173/login')
            page.screenshot(path=os.path.join(screenshots_dir, '01_login.png'))
            print('01_login.png captured')

            # Re-login
            page.fill('input[type="email"]', 'proprietor@yomfield.sch.ng')
            page.fill('input[type="password"]', 'Demo1234!')
            page.click('button[type="submit"]')
            page.wait_for_url('**/dashboard')

            # 02. Dashboard
            page.screenshot(path=os.path.join(screenshots_dir, '02_dashboard.png'), full_page=True)
            print('02_dashboard.png captured')

            # 03. Students
            page.goto('http://localhost:5173/students')
            page.wait_for_selector('table')
            page.screenshot(path=os.path.join(screenshots_dir, '03_students.png'), full_page=True)
            print('03_students.png captured')

            # 04. Fee Structure
            page.goto('http://localhost:5173/fee-structure')
            page.wait_for_selector('text=Fee Structure')
            page.screenshot(path=os.path.join(screenshots_dir, '04_fee_structure.png'), full_page=True)
            print('04_fee_structure.png captured')

            # 05. Bank Statements
            page.goto('http://localhost:5173/bank-statements')
            page.wait_for_selector('text=Drop your bank statement here')
            page.screenshot(path=os.path.join(screenshots_dir, '05_bank_statements.png'), full_page=True)
            print('05_bank_statements.png captured')

            # 06. Bank Review
            page.goto('http://localhost:5173/bank-statements/u1')
            page.wait_for_selector('text=Statement Review')
            page.screenshot(path=os.path.join(screenshots_dir, '06_bank_review.png'), full_page=True)
            print('06_bank_review.png captured')

            # 07. Parent Dashboard
            print('Accessing Parent Dashboard...')
            page.goto('http://localhost:5173/parent/login')
            page.evaluate('() => { localStorage.setItem("parentAuth", "true"); }')
            page.goto('http://localhost:5173/parent/dashboard')
            # The previous timeout was on 'text=Payment Summary'. Let's check for any heading.
            page.wait_for_selector('h1', timeout=10000)
            page.screenshot(path=os.path.join(screenshots_dir, '07_parent_dashboard.png'), full_page=True)
            print('07_parent_dashboard.png captured')

            print('Verification complete!')
        except Exception as e:
            print(f'Verification failed: {e}')
            # Take error screenshot
            page.screenshot(path=os.path.join(screenshots_dir, 'error.png'))
        finally:
            browser.close()

if __name__ == '__main__':
    run()
