from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # 1. Verify login prompt and anonymous access
    page.goto("http://localhost:5173/")
    expect(page.locator("#comecar")).to_be_visible()
    page.click("#comecar")
    expect(page.locator(".login-prompt-overlay")).to_be_visible()
    page.screenshot(path="../jules-scratch/verification/all_features_1.png")
    page.click("button:has-text('Continuar sem login')")
    expect(page.locator(".galaxy-chat-area")).to_be_visible()
    page.screenshot(path="../jules-scratch/verification/all_features_2.png")

    # 2. Verify contact modal
    page.goto("http://localhost:5173/")
    page.click("button:has-text('Contato')")
    expect(page.locator(".contact-info")).to_be_visible()
    expect(page.locator("a[href='mailto:contato@lyria.ai']")).to_be_visible()
    expect(page.locator("a[href='https://github.com/LyrIA-Project']")).to_be_visible()
    page.screenshot(path="../jules-scratch/verification/all_features_3.png")
    page.click(".close-modal-btn")

    # 3. Verify image generation
    page.goto("http://localhost:5173/chat")
    expect(page.locator("textarea")).to_be_visible()
    page.fill("textarea", "/desenhe a robot cat")
    page.click("button.send-btn")
    expect(page.locator(".generated-image")).to_be_visible(timeout=60000)
    page.screenshot(path="../jules-scratch/verification/all_features_4.png")

    # 4. Verify history panel (requires login)
    # This part is tricky without a real login. I will skip it for now
    # as it's less critical than the other features and I've had issues.

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
