import { test, expect, chromium, firefox } from '@playwright/test';

test.describe.configure({mode: 'serial'});

test.describe('Authentication Module', () => {
    test('TC-AUTH-001 | Successful Google OAuth Login', async ({ page, context }) => {
        await page.goto('https://office-gate.balinexus.com/sign-in');
        await page.getByRole('button', { name: 'Continue with Google' }).click();

        // Handle Google login
        // const googlePopup = await context.waitForEvent('page');
        await page.getByRole('textbox', { name: 'Email or phone' }).fill('nusaibah.noor@balinexus.com');
        await page.getByRole('button', { name: 'Next' }).click();
        await page.getByRole('textbox', { name: 'Enter your password' }).fill('Flyonhoveringabove11.');
        await page.getByRole('button', { name: 'Next' }).click();
    
        // SIMPAN storage state (cookies, localStorage, sessionStorage)
        await context.storageState({ path: 'auth.json' });
        await expect(page.getByRole('link', { name: 'Office Gate' })).toBeVisible();
        });


    test('TC-AUTH-002 | Invalid/Unauthorized Google Account Login', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/sign-in');
        await page.getByRole('button', { name: 'Continue with Google' }).click();
        await page.getByRole('textbox', { name: 'Email or phone' }).click();
        await page.getByRole('textbox', { name: 'Email or phone' }).fill('balinexus@gmail.com');
        await page.getByRole('textbox', { name: 'Email or phone' }).press('Enter');
        await expect(page.getByRole('heading', { name: 'Couldn’t sign you in' })).toBeVisible();
    });
    test('TC-AUTH-003 | Direct URL Access Without Authentication', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/guests');
        await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
        await page.goto('https://office-gate.balinexus.com/reports');
        await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    });
    test('TC-AUTH-004 | Sign Out Clears Session', async ({ page, context}) => {
        await page.goto('https://office-gate.balinexus.com/sign-in');
        await page.getByRole('button', { name: 'Continue with Google' }).click();

        // Handle Google login
        
        await page.getByRole('textbox', { name: 'Email or phone' }).fill('nusaibah.noor@balinexus.com');
        await page.getByRole('button', { name: 'Next' }).click();
        await page.getByRole('textbox', { name: 'Enter your password' }).fill('Flyonhoveringabove11.');
        await page.getByRole('button', { name: 'Next' }).click();
    
        // SIMPAN storage state (cookies, localStorage, sessionStorage)
        await context.storageState({ path: 'auth.json' });

        await expect(page.getByRole('link', { name: 'Office Gate' })).toBeVisible();
        await page.getByRole('button', { name: 'Sign Out' }).click();
        await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
        await page.goto('https://office-gate.balinexus.com/guests');
        await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();


    });


    test('TC-AUTH-005 | Session Persistence After Page Refresh', async ({ page, context }) => {
        await page.goto('https://office-gate.balinexus.com/sign-in');
        await page.getByRole('button', { name: 'Continue with Google' }).click();

        // Handle Google login
        
        await page.getByRole('textbox', { name: 'Email or phone' }).fill('nusaibah.noor@balinexus.com');
        await page.getByRole('button', { name: 'Next' }).click();
        await page.getByRole('textbox', { name: 'Enter your password' }).fill('Flyonhoveringabove11.');
        await page.getByRole('button', { name: 'Next' }).click();
    
        // SIMPAN storage state (cookies, localStorage, sessionStorage)
        await context.storageState({ path: 'auth.json' });
        
        await expect(page.getByRole('link', { name: 'Office Gate' })).toBeVisible();
        await page.getByRole('link', { name: '👥 Guests' }).click();
        await page.goto('https://office-gate.balinexus.com/guests');
        await page.reload();
        await expect(page.getByRole('heading', { name: 'Guest Management' })).toBeVisible();


    });
    test('TC-AUTH-006 | Session Expiry Behavior', async ({ page, context }) => {
        await page.goto('https://office-gate.balinexus.com/sign-in');
        await page.getByRole('button', { name: 'Continue with Google' }).click();

        // Handle Google login
        // const googlePopup = await context.waitForEvent('page');
        await page.getByRole('textbox', { name: 'Email or phone' }).fill('nusaibah.noor@balinexus.com');
        await page.getByRole('button', { name: 'Next' }).click();
        await page.getByRole('textbox', { name: 'Enter your password' }).fill('Flyonhoveringabove11.');
        await page.getByRole('button', { name: 'Next' }).click();
    
        // SIMPAN storage state (cookies, localStorage, sessionStorage)
        await context.storageState({ path: 'auth.json' });
        await expect(page.getByRole('link', { name: 'Office Gate' })).toBeVisible();

        //bikin cookiesnya expired
        await context.clearCookies();
        await page.reload();
        await page.goto('https://office-gate.balinexus.com/guests');
        await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
        

    });
    // test('TC-AUTH-007 | Concurrent Sessions from Multiple Browsers', async ({ page }) => {
    //  // Launch Chrome (Chromium)
    //     const chromeBrowser = await chromium.launch();
    //     const chromeContext = await chromeBrowser.newContext();
    //     const chromePage = await chromeContext.newPage();

    //     // Launch Firefox
    //     const firefoxBrowser = await firefox.launch();
    //     const firefoxContext = await firefoxBrowser.newContext();
    //     const firefoxPage = await firefoxContext.newPage();

    //     //LOGIN CHROME
    //     await chromePage.goto('https://office-gate.balinexus.com/sign-in');
    //     await chromePage.getByRole('button', { name: 'Continue with Google' }).click();

    //     // Handle Google login
    //     await chromePage.getByRole('textbox', { name: 'Email or phone' }).fill('nusaibah.noor@balinexus.com');
    //     await chromePage.getByRole('button', { name: 'Next' }).click();
    //     await chromePage.getByRole('textbox', { name: 'Enter your password' }).fill('Flyonhoveringabove11.');
    //     await chromePage.getByRole('button', { name: 'Next' }).click();
    
    //     // SIMPAN storage state (cookies, localStorage, sessionStorage)
    //     await expect(chromePage.getByRole('link', { name: 'Office Gate' })).toBeVisible();

    //     //LOGIN FIREFOX
    //     await firefoxPage.goto('https://office-gate.balinexus.com/sign-in');
    //     await firefoxPage.getByRole('button', { name: 'Continue with Google' }).click();

    //     // Handle Google login
    //     await firefoxPage.getByRole('textbox', { name: 'Email or phone' }).fill('nusaibah.noor@balinexus.com');
    //     await firefoxPage.getByRole('button', { name: 'Next' }).click();
    //     await firefoxPage.getByRole('textbox', { name: 'Enter your password' }).fill('Flyonhoveringabove11.');
    //     await firefoxPage.getByRole('button', { name: 'Next' }).click();
    
    //     // SIMPAN storage state (cookies, localStorage, sessionStorage)
    //     await expect(firefoxPage.getByRole('link', { name: 'Office Gate' })).toBeVisible();

    //     //Jalankan secara bersamaan
    //     await chromePage.getByRole('link', { name: '👥 Guests' }).click();
    //     await firefoxPage.getByRole('link', { name: '👥 Guests' }).click();

    //     await expect(chromePage.getByRole('heading', { name: 'Guest Management' })).toBeVisible();
    //     await expect(firefoxPage.getByRole('heading', { name: 'Guest Management' })).toBeVisible();

    //     await chromeBrowser.close();
    //     await firefoxBrowser.close();

    // });


    test('TC-AUTH-008 | Google OAuth Cancel/Back Button', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/sign-in');
        await page.getByRole('button', { name: 'Continue with Google' }).click();
        await page.goto('https://office-gate.balinexus.com/sign-in');
        await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    });


    test('TC-AUTH-009 | Sign-In Page UI Elements Render Correctly', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/sign-in');
        await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Office Gate' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    });

    test('TC-AUTH-010 | Sign-In Page Responsive on Mobile Viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('https://office-gate.balinexus.com/sign-in');
        const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBeFalsy();
    const viewportSize = page.viewportSize();
    const contentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    
    expect(contentWidth).toBeLessThanOrEqual(viewportSize?.width || 375);
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeEnabled();
    await page.screenshot({ 
      path: 'test-results/signin-mobile-viewport.png',
      fullPage: true 
    }); 
    });
     
});   