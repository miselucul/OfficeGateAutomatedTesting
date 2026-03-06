import { chromium, expect } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
    
  await page.goto('https://office-gate.balinexus.com/sign-in');
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  
  // Handle Google login
  await page.getByRole('textbox', { name: 'Email or phone' }).fill('nusaibah.noor@balinexus.com');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('Flyonhoveringabove11.');
  await page.getByRole('button', { name: 'Next' }).click();

  await expect(page.getByRole('link', { name: 'Office Gate' })).toBeVisible();
  await page.waitForTimeout(2000);

  // Tunggu sampai login berhasil (URL berubah)
  
  console.log('Saving state from dashboard...');
  await context.storageState({ path: 'login-state.json' });
  
  await browser.close();
  console.log('✅ State saved successfully!');  
})();