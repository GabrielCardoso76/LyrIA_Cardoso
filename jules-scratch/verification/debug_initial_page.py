from playwright.sync_api import sync_playwright

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Go to the root page
        page.goto("http://localhost:5174/")

        # Take a screenshot of the initial page for debugging
        page.screenshot(path="jules-scratch/verification/initial_page_debug.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)