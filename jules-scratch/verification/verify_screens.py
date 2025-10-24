from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        # 1. Navigate to the initial page and take a screenshot
        page.goto("http://localhost:5173/")
        page.screenshot(path="jules-scratch/verification/01_initial_screen.png")

        # 2. Navigate to the login page and take a screenshot
        login_button = page.get_by_role("link", name="Entrar")
        login_button.click()
        expect(page).to_have_url("http://localhost:5173/RegistrationAndLogin")
        page.screenshot(path="jules-scratch/verification/02_login_screen.png")

        # 3. Log in and wait for redirection
        page.get_by_placeholder("Email").fill("test@example.com")
        page.get_by_placeholder("Senha").fill("password")
        page.get_by_role("button", name="ENTRAR").click()
        expect(page).to_have_url("http://localhost:5173/") # Verify redirection to the initial page
        page.screenshot(path="jules-scratch/verification/03_after_login_screen.png")

        # 4. Navigate to the chat page and take a screenshot
        chat_link = page.get_by_role("link", name="Chat")
        chat_link.click()
        expect(page).to_have_url("http://localhost:5173/chat")
        page.screenshot(path="jules-scratch/verification/04_chat_screen.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
