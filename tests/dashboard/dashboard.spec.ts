import { test, expect, chromium, firefox } from '@playwright/test';
import { log } from 'console';
test.use({ storageState: 'login-state.json' });
test.describe.configure({mode: 'serial'});

test.describe('Dashboard Module', () => {
    test('TC-DASH-001 | Dashboard Displays UI Elements', async ({ page, context }) => {
        await page.goto('https://office-gate.balinexus.com/');
        await expect(page.getByRole('link', { name: 'Office Gate' })).toBeVisible();
        
        //CEK UI ELEMENT
        //1. CARDS
        await expect( page.getByRole('paragraph').filter({ hasText: 'Active Guests' })).toBeVisible();
        await expect(page.getByText('Today\'s Visitors')).toBeVisible();
        await expect(page.getByText('Total This Week')).toBeVisible();
        await expect(page.getByText('Total Visits')).toBeVisible();

        await expect(page.getByRole('heading', { name: 'Visitor Trends' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Active Guests' })).toBeVisible();

        await page.getByText('📝Check In GuestRegister a').click();
        await expect(page.getByRole('heading', { name: 'Add New Guest' })).toBeVisible();
        await page.getByRole('button', { name: '×' }).click();

        await page.getByRole('link', { name: '📊 View Reports Access' }).click();
        await expect(page.getByRole('heading', { name: 'Reports & Analytics' })).toBeVisible();
        await page.goto('https://office-gate.balinexus.com/');


        await page.getByRole('link', { name: '👥 Manage Guests View and' }).click();
        await expect(page.getByRole('heading', { name: 'Guest Management' })).toBeVisible();

        //FOOTER
        await expect(page.getByRole('heading', { name: 'Quick Links' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'admin.it@balinexus.com' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Jl. Raya Ubud, Ubud, Bali' })).toBeVisible();

        await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
        await expect(page.getByRole('link', { name: 'Office Gate' })).toBeVisible();

        await page.getByRole('link', { name: 'Guests', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Guest Management' })).toBeVisible();
        await page.goto('https://office-gate.balinexus.com/');
        
        await page.getByRole('link', { name: 'Reports', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Reports & Analytics' })).toBeVisible();
        await page.goto('https://office-gate.balinexus.com/');

        await expect(page.getByRole('link', { name: 'Docs', exact: true })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Docs', exact: true })).toHaveAttribute(
            'href', 
            /docs\.google\.com/
        );
        await page.goto('https://office-gate.balinexus.com/');



        });
    test('TC-DASH-002 | Visitor Trends Chart Renders Last 7 Days', async ({ page, context }) => {
        await page.goto('https://office-gate.balinexus.com/');
        const trendsSection = page.locator('section:has-text("Visitor Trends")').first();
  
        // 1. VALIDASI STRUKTUR (selalu sama)
        await expect(trendsSection.locator('h2:has-text("Visitor Trends")')).toBeVisible();
        await expect(trendsSection.locator('p:has-text("Last 7 days visitor statistics")')).toBeVisible();
        
        // 2. VALIDASI CHART
        await expect(trendsSection.locator('canvas')).toBeVisible();
        
        // 3. VALIDASI STATS CARDS (hanya struktur, bukan nilai exact)
        const statsGrid = trendsSection.locator('.grid.grid-cols-3');
        await expect(statsGrid).toBeVisible();
        
        // Ambil semua nilai stat
        const statValues = await statsGrid.locator('h3').allTextContents();
        const statLabels = await statsGrid.locator('p').allTextContents();
        
        // Validasi ada 3 values dan 3 labels
        expect(statValues.length).toBe(3);
        expect(statLabels.length).toBe(3);
        
        // Validasi format nilai (harus angka)
        for (const value of statValues) {
            expect(parseInt(value)).not.toBeNaN();
        }
        
        // Validasi labels sesuai yang diharapkan
        expect(statLabels).toContain('Total Visitors');
        expect(statLabels).toContain('Daily Average');
        expect(statLabels).toContain('Peak Day');
        
        // 4. VALIDASI URUTAN (kalau perlu)
        expect(statLabels[0]).toBe('Total Visitors');
        expect(statLabels[1]).toBe('Daily Average');
        expect(statLabels[2]).toBe('Peak Day');

    });
    test('TC-DASH-003 | Active Guests Panel Shows Currently Checked-In Visitors', async ({ page }) => {
    await page.goto('https://office-gate.balinexus.com/');
    await page.getByRole('button').filter({ hasText: /^$/ }).click();


    // Capture initial count from the stat card heading (more reliable than paragraph text)


    const uniqueGuestName = `QA TEST ${Date.now()}`;

    // Create guest
    await page.getByRole('button', { name: 'New Guest' }).click();
    await page.getByRole('textbox', { name: 'Guest Name*' }).fill(uniqueGuestName);
    await page.getByRole('textbox', { name: 'Company' }).fill('Bali Nexus IT Division');
    await page.getByRole('textbox', { name: 'Email*' }).fill(`qatest${Date.now()}@balinexus.com`);
    await page.getByRole('textbox', { name: 'Phone Number*' }).fill('+628123456789');
    await page.getByRole('button', { name: 'Add Guest' }).click();

    // Check in guest
    await page.getByRole('button', { name: 'Check In' }).click();
    await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(uniqueGuestName);
    await page.locator('[role="listbox"] div:has-text("' + uniqueGuestName + '"), .cursor-pointer:has-text("' + uniqueGuestName + '")')
        .first()
        .click();
    await page.getByRole('textbox', { name: 'Name of person they are' }).fill('QA Test');
    await page.getByRole('textbox', { name: 'Name of company they are' }).fill('IT Division');
    await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill('QA Testing');
    await page.locator('form').getByRole('button', { name: 'Check In' }).click();

    await page.getByRole('link', { name: 'View All Active Guests →' }).click();
    await expect(page.getByRole('table').getByText(uniqueGuestName, { exact: false })).toBeVisible();
    await page.getByRole('table').getByText(uniqueGuestName, { exact: false }).click();

    await expect(page.getByRole('heading', { name: 'Guest Details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: uniqueGuestName })).toBeVisible();

    
});
    test('TC-DASH-004 | Dashboard Quick Action Cards Navigate Correctly', async ({ page, context }) => {
            await page.goto('https://office-gate.balinexus.com/');
        await page.getByText('📝Check In GuestRegister a').click();
        await expect(page.getByRole('heading', { name: 'Add New Guest' })).toBeVisible();
        await page.getByRole('button', { name: '×' }).click();

        await page.getByRole('link', { name: '📊 View Reports Access' }).click();
        await expect(page.getByRole('heading', { name: 'Reports & Analytics' })).toBeVisible();
        await page.goto('https://office-gate.balinexus.com/');

        await page.getByRole('link', { name: '👥 Manage Guests View and' }).click();
        await expect(page.getByRole('heading', { name: 'Guest Management' })).toBeVisible();

    });
    
});


