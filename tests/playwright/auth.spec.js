const { test, expect } = require('@playwright/test');

test('register and login flow', async ({ page, baseURL }) => {
  await page.goto('/');

  // Open mobile menu if needed and click Register
  const regBtns = await page.locator('button:has-text("Register")');
  if (await regBtns.count() > 1) {
    // click visible one
    for (let i = 0; i < await regBtns.count(); i++) {
      const b = regBtns.nth(i);
      if (await b.isVisible()) { await b.click(); break; }
    }
  } else {
    await regBtns.first().click();
  }

  // Fill register form
  const now = Date.now();
  const email = `pw${now}@example.com`;
  await page.waitForSelector('section form input[name="name"]', { timeout: 5000 });
  await page.fill('section form input[name="name"]', 'Playwright Test');
  await page.fill('section form input[name="email"]', email);
  await page.fill('section form input[name="phone"]', '5550001111');
  await page.fill('section form input[name="password"]', 'password123');
  await page.click('section form button:has-text("Register")');

  // After registration, the app switches to the login form.
  await page.waitForSelector('section form input[name="password"]', { timeout: 5000 });
  await expect(page.locator('section form button:has-text("Login")')).toBeVisible({ timeout: 5000 });

  await page.fill('section form input[name="email"]', email);
  await page.fill('section form input[name="password"]', 'password123');
  await page.click('section form button:has-text("Login")');

  // Expect dashboard to appear after successful login.
  await expect(page.locator('text=Dashboard Analytics').first()).toBeVisible({ timeout: 10000 });
});
