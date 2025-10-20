
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        page.goto("http://localhost:5173/RegistrationAndLogin")

        # Login
        page.fill('input[name="email"]', "test@example.com")
        page.fill('input[name="password"]', "password123")
        page.click('button[type="submit"]')

        # Wait for navigation to chat page and then go to profile
        page.wait_for_url("http://localhost:5173/chat")
        page.goto("http://localhost:5173/profile")

        # Wait for profile page to load
        page.wait_for_selector(".profile-screen")

        page.screenshot(path="jules-scratch/verification/verification.png")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
