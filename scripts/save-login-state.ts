
import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 50 // Biar lebih lambat, mudah diikuti
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('1. Browser akan terbuka');
  console.log('2. Silakan LOGIN MANUAL dengan email Anda');
  console.log('3. Masukkan password dan VERIFIKASI 2FA');
  console.log('4. Setelah berhasil login ke dashboard, TUNGGU 5 DETIK');
  console.log('5. State akan otomatis tersimpan\n');
  
   await page.goto('https://office-gate.balinexus.com/sign-in');

  console.log('⏳ Menunggu login manual (max 60 detik)...');

  await page.waitForURL('https://office-gate.balinexus.com/', { timeout: 60000 });

  await page.waitForTimeout(5000);
await context.storageState({ path: 'login-state.json' });

  console.log('✅ Login state saved successfully!');

  await browser.close();

})();

// import { chromium, expect } from '@playwright/test';

// (async () => {
//   const browser = await chromium.launch({ headless: false });
//   const context = await browser.newContext();
//   const page = await context.newPage();
    
//   await page.goto('https://office-gate.balinexus.com/sign-in');
//   await page.getByRole('button', { name: 'Continue with Google' }).click();
  
//   // Handle Google login
//   await page.getByRole('textbox', { name: 'Email or phone' }).fill('nusaibah.noor@balinexus.com');
//   await page.getByRole('button', { name: 'Next' }).click();
//   await page.getByRole('textbox', { name: 'Enter your password' }).fill('Flyonhoveringabove11.');
//   await page.getByRole('button', { name: 'Next' }).click();

//   await expect(page.getByRole('link', { name: 'Office Gate' })).toBeVisible();
//   await page.waitForTimeout(2000);

//   // Tunggu sampai login berhasil (URL berubah)
  
//   console.log('Saving state from dashboard...');
//   await context.storageState({ path: 'login-state.json' });
  
//   await browser.close();
//   console.log('✅ State saved successfully!');  
// })();