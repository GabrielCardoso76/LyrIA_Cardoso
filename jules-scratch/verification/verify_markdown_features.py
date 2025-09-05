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
    register_payload = {"nome": username, "email": unique_email, "senha": password}
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

        try:
            # 1. Login
            await page.goto("http://localhost:5173/RegistrationAndLogin")
            await page.locator('input[name="email"]').fill(unique_email)
            await page.locator('input[name="senha"]').fill(password)
            await page.locator('button[type="submit"]').click()
            await expect(page).to_have_url("http://localhost:5173/", timeout=10000)

            # 2. Navigate to chat
            await page.get_by_role("button", name="Começar").click()
            await expect(page).to_have_url("http://localhost:5173/chat")

            # 3. Verify voice is muted by default
            mute_button = page.locator("button[title='Ativar voz']")
            await expect(mute_button).to_be_visible()
            print("Verification successful: Voice is muted by default.")

            # 4. Ask a question to get markdown and a code block
            await page.locator("textarea[placeholder*='Digite sua mensagem']").fill("como printar um hello world em python?")
            await page.locator("footer.galaxy-chat-input-container button.send-btn").click()

            # 5. Wait for the bot's response and verify markdown rendering
            bot_message_container = page.locator(".message-wrapper.bot").nth(0)
            await expect(bot_message_container).to_be_visible(timeout=30000)

            # Check for bold text (e.g., <strong> tag)
            bold_element = bot_message_container.locator("strong")
            await expect(bold_element).to_be_visible()
            print("Verification successful: Markdown (bold) is rendered.")

            # Check for the custom code block
            code_block = bot_message_container.locator(".code-block-container")
            await expect(code_block).to_be_visible()
            copy_button = code_block.locator("button.copy-code-btn")
            await expect(copy_button).to_be_visible()
            print("Verification successful: Custom code block with copy button is rendered.")

            # 6. Take a screenshot
            await page.screenshot(path="jules-scratch/verification/markdown_features.png")
            print("Screenshot taken successfully.")

        except Exception as e:
            print(f"An error occurred during verification: {e}", file=sys.stderr)
            await page.screenshot(path="jules-scratch/verification/markdown_features_failure.png")
            sys.exit(1)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run_verification())
