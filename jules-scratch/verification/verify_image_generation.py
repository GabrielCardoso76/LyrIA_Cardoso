from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:5173/chat")
    expect(page.locator("textarea")).to_be_visible()

    page.fill("textarea", "/desenhe a cat sitting on a table")
    page.click("button.send-btn")

    # Wait for the bot's response, which should contain an image
    expect(page.locator(".generated-image")).to_be_visible(timeout=60000)
    page.screenshot(path="../jules-scratch/verification/image_generation.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
