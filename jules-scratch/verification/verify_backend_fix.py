import asyncio
from playwright.async_api import async_playwright, expect
import sys
import uuid
import requests

async def run_verification():
    # Generate unique user credentials
    unique_email = f"testuser_{uuid.uuid4()}@example.com"
    username = f"testuser_{uuid.uuid4().hex[:8]}"
    password = "password123"

    # Register the user via API request
    register_url = "http://localhost:5001/Lyria/register"
    register_payload = {
        "nome": username,
        "email": unique_email,
        "senha": password
    }
    try:
        response = requests.post(register_url, json=register_payload)
        response.raise_for_status()
        print(f"User {username} registered successfully.")
    except requests.exceptions.RequestException as e:
        print(f"Failed to register user: {e}", file=sys.stderr)
        sys.exit(1)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        console_errors = []
        page.on("console", lambda msg: "Internal Server Error" in msg.text and console_errors.append(msg.text))

        try:
            # 1. Go to the login page
            await page.goto("http://localhost:5173/RegistrationAndLogin", wait_until="load")

            # Wait for the form container to be visible
            login_form = page.locator(".form-container")
            await expect(login_form).to_be_visible(timeout=15000)

            # 2. Fill and submit the login form
            await page.locator('input[name="email"]').fill(unique_email)
            await page.locator('input[name="senha"]').fill(password)
            await page.locator('button[type="submit"]').click()

            # 3. Wait for navigation to the main page (or chat page)
            await expect(page).to_have_url("http://localhost:5173/", timeout=10000)

            # 4. Navigate to the chat page
            await page.get_by_role("button", name="Começar").click()
            await expect(page).to_have_url("http://localhost:5173/chat")

            # 5. Send a message
            chat_input = page.locator("textarea[placeholder*='Digite sua mensagem']")
            await expect(chat_input).to_be_visible()
            await chat_input.fill("Hello, world!")

            # Use a more specific locator for the send button
            send_button = page.locator("footer.galaxy-chat-input-container button.send-btn")
            await send_button.click()

            # 6. Wait for the bot's response
            await expect(page.locator(".message-wrapper.bot")).to_have_count(1, timeout=30000)

            # 7. Check for 500 errors in the console
            if any("500" in error for error in console_errors):
                raise Exception(f"500 Internal Server Error found in console: {console_errors}")

            print("Verification successful: Logged-in user can send a message without 500 errors.")
            await page.screenshot(path="jules-scratch/verification/backend_fix_success.png")

        except Exception as e:
            print(f"An error occurred during verification: {e}", file=sys.stderr)
            await page.screenshot(path="jules-scratch/verification/backend_fix_failure.png")
            sys.exit(1)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run_verification())
