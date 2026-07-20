const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshot_login.png' });

  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot_desktop.png' });

  // Click on the terminal window to bring it to front
  await page.click('#window-terminal .window-header');
  await page.waitForTimeout(200);

  // Type a command in the terminal
  await page.click('#terminal-input');
  await page.keyboard.type('whoami');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  await page.click('#dock-projects');
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'screenshot_final.png' });

  await browser.close();
})();
