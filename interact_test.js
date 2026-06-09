const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the local server
  await page.goto('http://localhost:3000');

  // 1. Bypass login screen
  await page.click('#login-btn');
  // Wait for login screen to disappear
  await page.waitForTimeout(500);

  // 2. Open Terminal window
  await page.click('div[onclick="app.openWindow(\'terminal\')"]');
  await page.waitForTimeout(500);

  // 3. Maximize Terminal window
  const terminalMaxBtn = await page.$('#window-terminal .fa-square');
  if (terminalMaxBtn) {
    await terminalMaxBtn.click();
    console.log("Clicked maximize on terminal.");
  }
  await page.waitForTimeout(500);

  // Get Terminal bounds
  const terminalBounds = await page.evaluate(() => {
    const el = document.getElementById('window-terminal');
    return { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
  });
  console.log("Maximized terminal bounds:", terminalBounds);

  // 4. Test dragging
  // First restore terminal
  if (terminalMaxBtn) {
    await terminalMaxBtn.click();
  }
  await page.waitForTimeout(500);

  // Focus terminal and drag it
  const header = await page.$('#window-terminal .window-header');
  const box = await header.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100);
    await page.mouse.up();
    console.log("Dragged terminal.");
  }
  await page.waitForTimeout(500);

  // 5. Open Projects window to check z-index
  await page.click('div[onclick="app.openWindow(\'projects\')"]');
  await page.waitForTimeout(500);

  const projectsZIndex = await page.evaluate(() => {
    return window.getComputedStyle(document.getElementById('window-projects')).zIndex;
  });
  console.log("Projects zIndex after focus:", projectsZIndex);

  await page.screenshot({ path: 'interactive_test.png' });
  console.log("Interactive test done.");

  await browser.close();
})();
