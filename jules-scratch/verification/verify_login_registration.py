from playwright.sync_api import sync_playwright, expect
import time

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Go to the registration/login page
        page.goto("http://localhost:5174/")

        # Wait for the page to load
        expect(page.locator('h2:has-text("Bem-vindo de Volta")')).to_be_visible()

        # Click on the "Cadastre-se" link to switch to the registration form
        page.locator('span:has-text("Cadastre-se")').click()
        expect(page.locator('h2:has-text("Crie sua Conta")')).to_be_visible()

        # Fill out the registration form
        page.locator('input[placeholder="Nome"]').fill("Test User")
        page.locator('input[placeholder="Email"]').fill("test.user@example.com")
        page.locator('input[placeholder="Senha"]').fill("password123")
        page.locator('input[placeholder="Confirmar Senha"]').fill("password123")

        # Click the "CADASTRAR" button
        page.locator('button:has-text("CADASTRAR")').click()

        # Wait for the registration to complete and the form to switch to login
        expect(page.locator('h2:has-text("Bem-vindo de Volta")')).to_be_visible(timeout=10000)

        # Fill out the login form
        page.locator('input[placeholder="Email"]').fill("test.user@example.com")
        page.locator('input[placeholder="Senha"]').fill("password123")

        # Click the "ENTRAR" button
        page.locator('button:has-text("ENTRAR")').click()

        # Wait for the login to complete and navigate to the home page
        expect(page).to_have_url("http://localhost:5174/", timeout=10000)

        # Take a screenshot of the home page after login
        page.screenshot(path="jules-scratch/verification/verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)