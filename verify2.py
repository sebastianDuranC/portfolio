from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000")
    page.wait_for_timeout(1000)

    # Click enter to bypass login screen
    page.keyboard.press("Enter")
    page.wait_for_timeout(1500)

    # By default the terminal window is open. Type whoami
    page.evaluate("document.getElementById('terminal-input').value = 'whoami'")
    page.evaluate("document.getElementById('terminal-input').dispatchEvent(new KeyboardEvent('keydown', {'key': 'Enter'}))")
    page.wait_for_timeout(1000)

    # Open skills window from dock
    page.evaluate("app.openWindow('skills')")
    page.wait_for_timeout(1000)

    # Take screenshot at the key moment
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)  # Hold final state for the video

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()  # MUST close context to save the video
            browser.close()