const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  let hasErrors = false;
  page.on('pageerror', err => {
    console.error('Page error:', err);
    hasErrors = true;
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text());
      hasErrors = true;
    }
  });

  await page.goto('http://localhost:3000');

  // Wait a little bit for scripts to run
  await page.waitForTimeout(2000);

  await browser.close();

  if (hasErrors) {
    process.exit(1);
  } else {
    console.log("No console errors found. Tests passed.");
    process.exit(0);
  }
})();
