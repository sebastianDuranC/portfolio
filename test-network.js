const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`Failed URL: ${response.url()} with status ${response.status()}`);
    }
  });

  await page.goto('http://localhost:3000');

  // Wait a little bit for scripts to run
  await page.waitForTimeout(2000);

  await browser.close();
  process.exit(0);
})();
