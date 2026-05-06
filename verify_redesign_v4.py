
from playwright.sync_api import sync_playwright
import os

def run():
    screenshots_dir = 'verification_screenshots'
    if not os.path.exists(screenshots_dir):
        os.makedirs(screenshots_dir)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        print('Starting verification...')

        try:
            # 1. Check Login Page
            print('Navigating to login page...')
            page.goto('http://localhost:5173/login')
            page.wait_for_selector('h1', timeout=5000)
            page.screenshot(path=os.path.join(screenshots_dir, '01_login.png'))
            print('01_login.png captured')

            # 2. Login
            print('Attempting login...')
            page.fill('input[type="email"]', 'proprietor@yomfield.sch.ng')
            page.fill('input[type="password"]', 'Demo1234!')
            page.click('button[type="submit"]')

            # Wait for dashboard content instead of URL
            print('Waiting for dashboard...')
            page.wait_for_selector('text=Good morning', timeout=10000)
            print('Admin login successful')

            # 02. Dashboard
            page.screenshot(path=os.path.join(screenshots_dir, '02_dashboard.png'), full_page=True)
            print('02_dashboard.png captured')

            # 03. Students
            print('Navigating to students...')
            page.goto('http://localhost:5173/students')
            page.wait_for_selector('table', timeout=10000)
            page.screenshot(path=os.path.join(screenshots_dir, '03_students.png'), full_page=True)
            print('03_students.png captured')

            # 04. Fee Structure
            print('Navigating to fee structure...')
            page.goto('http://localhost:5173/fee-structure')
            page.wait_for_selector('text=Fee Structure', timeout=10000)
            page.screenshot(path=os.path.join(screenshots_dir, '04_fee_structure.png'), full_page=True)
            print('04_fee_structure.png captured')

            # 05. Bank Statements
            print('Navigating to bank statements...')
            page.goto('http://localhost:5173/bank-statements')
            page.wait_for_selector('text=Drop your bank statement here', timeout=10000)
            page.screenshot(path=os.path.join(screenshots_dir, '05_bank_statements.png'), full_page=True)
            print('05_bank_statements.png captured')

            # 06. Bank Review
            print('Navigating to bank review...')
            page.goto('http://localhost:5173/bank-statements/u1')
            page.wait_for_selector('text=Statement Review', timeout=10000)
            page.screenshot(path=os.path.join(screenshots_dir, '06_bank_review.png'), full_page=True)
            print('06_bank_review.png captured')

            # 07. Parent Dashboard
            print('Accessing Parent Dashboard...')
            page.goto('http://localhost:5173/parent/login')
            page.evaluate('() => { localStorage.setItem("parentAuth", "true"); }')
            page.goto('http://localhost:5173/parent/dashboard')
            page.wait_for_selector('h1', timeout=10000)
            page.screenshot(path=os.path.join(screenshots_dir, '07_parent_dashboard.png'), full_page=True)
            print('07_parent_dashboard.png captured')

            print('Verification complete!')
        except Exception as e:
            print(f'Verification failed: {e}')
            page.screenshot(path=os.path.join(screenshots_dir, 'error.png'))
            # Print page content on failure
            # print(page.content())
        finally:
            browser.close()

if __name__ == '__main__':
    run()
