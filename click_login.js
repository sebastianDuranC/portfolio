const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');

  // Click login button
  await page.click('#login-btn');

  // Wait for login animation
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'screenshot_desktop.png' });
  await browser.close();
})();
