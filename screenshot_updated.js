const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');

  // Screenshot login
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot_updated_login.png' });

  // Click login to enter desktop
  await page.click('#login-btn');
  await page.waitForTimeout(1500); // Wait for transition

  // Screenshot desktop
  await page.screenshot({ path: 'screenshot_updated_desktop.png' });

  // Open projects window
  await page.click('#dock-projects');
  await page.waitForTimeout(1000);

  // Screenshot desktop with windows
  await page.screenshot({ path: 'screenshot_updated_windows.png' });

  await browser.close();
})();
