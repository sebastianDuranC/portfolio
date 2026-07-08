const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });

  await page.goto('http://localhost:3000');

  // Wait a bit for images to load
  await page.waitForTimeout(1000);

  // Screenshot login screen
  await page.screenshot({ path: 'login_new.png' });

  // Login by pressing Enter
  await page.keyboard.press('Enter');

  // Wait for login transition and terminal neofetch animation
  await page.waitForTimeout(2000);

  // Screenshot desktop with terminal
  await page.screenshot({ path: 'desktop_terminal_new.png' });

  // Open projects window
  await page.evaluate(() => {
    app.openWindow('projects');
  });
  await page.waitForTimeout(500);

  // Open settings window
  await page.evaluate(() => {
    app.openWindow('skills');
  });
  await page.waitForTimeout(500);

  // Screenshot desktop with multiple windows
  await page.screenshot({ path: 'desktop_windows_new.png' });

  await browser.close();
})();
