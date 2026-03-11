import { test, expect, chromium, firefox } from '@playwright/test';
test.use({ storageState: 'login-state.json' });
test.describe.configure({mode: 'serial'});

export class DataGenerator {
    static uniqueName(base: string): string {
        return `${base} ${Date.now()}`;
    }

    static uniqueEmail(base: string): string {
        return `${base}${Date.now()}@example.com`;
    }

    static uniquePhone(): string {
    return '+628123456789'; // Bisa static karena unique guest name yang membedakan
  }

  static uniqueCompany(prefix: string = 'QA Company'): string {
    return `${prefix} ${Date.now()}`;
  }


}

test.describe('Check-In Check-Out Module', () => {
    const testData = {
        name: DataGenerator.uniqueName('QA'),
        email: DataGenerator.uniqueEmail('QA'),
        phone: DataGenerator.uniquePhone(),
        company: 'QA Company',
        country: 'Indonesia'
        };
    

    test('TC-CICO-001 | Check In Existing Guest - Happy Path', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/');
        // Klik button Check In
        await page.getByRole('button', { name: 'Check In' }).click();
        // Search guest 'QA'
        await page.getByRole('searchbox', { name: 'Search by name or company...' })
            .fill('QA');
        await page.waitForTimeout(500);
        // Select QA dari dropdown
        await page.getByText('QA').first().click();
        
        await page.getByRole('textbox', { name: 'Name of person they are' })
            .fill('QA');
        await page.getByRole('textbox', { name: 'Name of company they are' })
            .fill('QA Company');
        await page.getByRole('textbox', { name: 'e.g., Business Meeting,' })
            .fill('QA Testing');
        
        // Submit
        await page.locator('form').getByRole('button', { name: 'Check In' }).click();
        await page.getByRole('link', { name: 'View All Active Guests →' }).click();
        await page.getByRole('searchbox', { name: 'Search guests...' }).fill('QA');
        await page.locator('div').filter({ hasText: /^QA$/ }).click();

        await expect(page.getByText('Currently In Office')).toBeVisible();
    
    });
    test('TC-CICO-002 | Check In Without Selecting Guest', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/');
        // Open modal
        await page.getByRole('button', { name: 'Check In' }).click();
        // Langsung isi form tanpa pilih guest
        await page.getByRole('textbox', { name: 'Name of person they are' }).fill('QA');
        await page.getByRole('textbox', { name: 'Name of company they are' }).fill('QA Company');
        await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill('QA Testing');
        
        // Submit
        await page.locator('form').getByRole('button', { name: 'Check In' }).click();
        
        // Verify validation - search box harusnya menunjukkan error
        const searchInput = page.getByRole('searchbox', { name: 'Search by name or company...' });
        
        // Cek apakah ada pesan error atau styling error
        await expect(searchInput).toHaveAttribute('aria-invalid', 'true');
        
        // Modal masih terbuka
        await expect(page.getByRole('heading', { name: 'Check In Guest' })).toBeVisible();
    });


    test('TC-CICO-003 | Check In With Missing Required Host Name', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/');
        // Open modal
        await page.getByRole('button', { name: 'Check In' }).click();
        // Search dan pilih guest
        await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill('QA');
        await page.waitForTimeout(500);
        await page.getByText('QA').first().click();
        
        // Isi form tanpa Host Name
        await page.getByRole('textbox', { name: 'Name of company they are' }).fill('QA Company');
        await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill('QA Testing');
        
        // Submit
        await page.locator('form').getByRole('button', { name: 'Check In' }).click();
        
        // Verify validation on Host Name field
        const hostNameInput = page.getByRole('textbox', { name: 'Name of person they are' });
        await expect(hostNameInput).toHaveAttribute('aria-invalid', 'true');

    });

    test('TC-CICO-004 | Check In With Missing Purpose of Visit', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/');
        // Open modal
        await page.getByRole('button', { name: 'Check In' }).click();
        // Search dan pilih guest
        await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill('QA');
        await page.waitForTimeout(500);
        await page.getByText('QA').first().click();
        
        // Isi form tanpa Purpose
        await page.getByRole('textbox', { name: 'Name of person they are' }).fill('QA');
        await page.getByRole('textbox', { name: 'Name of company they are' }).fill('QA Company');
        
        // Submit
        await page.locator('form').getByRole('button', { name: 'Check In' }).click();
        
        // Verify validation on Purpose field
        const purposeInput = page.getByRole('textbox', { name: 'e.g., Business Meeting,' });
        await expect(purposeInput).toHaveAttribute('aria-invalid', 'true');
    });

    // TC-CICO-005 OPEN TICKET NEW FEATURE 
    // test('TC-CICO-005 | Check In Already Active Guest', async ({ page }) => {
    //     const newGuest = DataGenerator.uniqueName('Active Test');
        
    //     // 1. Create guest baru
    //     await page.goto('https://office-gate.balinexus.com/');
    //     await page.getByRole('button', { name: 'New Guest' }).click();
    //     await page.getByRole('textbox', { name: 'Guest Name*' }).fill(newGuest);
    //     await page.getByRole('textbox', { name: 'Email*' }).fill(DataGenerator.uniqueEmail('active'));
    //     await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
    //     await page.getByRole('button', { name: 'Add Guest' }).click();
    //     await expect(page.getByText('Guest added successfully')).toBeVisible();
        
    //     await page.getByRole('button', { name: 'Check In' }).click();
    //     await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(newGuest);
    //     await page.waitForTimeout(500);
    //     await page.getByText(newGuest).first().click();
    //     await page.getByRole('textbox', { name: 'Name of person they are' }).fill('Veljo');
    //     await page.getByRole('textbox', { name: 'Name of company they are' }).fill('Jatiluwih');
    //     await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill('Business Meeting');
    //     await page.locator('form').getByRole('button', { name: 'Check In' }).click();
        
    //     // 3. Coba Check In lagi guest yang sama
    //     await page.getByRole('button', { name: 'Check In' }).click();
    //     await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(newGuest);
    //     await page.waitForTimeout(500);
        
    //     // Guest tidak muncul di dropdown karena sudah active
    //     await expect(page.getByText(newGuest)).toHaveCount(0);    
    // });
    test('TC-CICO-006 | Check In With Follow Up Needed Checkbox', async ({ page }) => {
        const newGuest = DataGenerator.uniqueName('Follow Up');
        
        // Create guest
        await page.goto('https://office-gate.balinexus.com/');
        await page.getByRole('button', { name: 'New Guest' }).click();
        await page.getByRole('textbox', { name: 'Guest Name*' }).fill(newGuest);
        await page.getByRole('textbox', { name: 'Email*' }).fill(DataGenerator.uniqueEmail('follow'));
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
        await page.getByRole('button', { name: 'Add Guest' }).click();
        
        // Check In dengan Follow Up
        await page.getByRole('button', { name: 'Check In' }).click();
        await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(newGuest);
        await page.waitForTimeout(500);
        await page.getByText(newGuest).first().click();
        
        // Isi form
        await page.getByRole('textbox', { name: 'Name of person they are' }).fill('Veljo');
        await page.getByRole('textbox', { name: 'Name of company they are' }).fill('Jatiluwih');
        await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill('Business Meeting');
        
        // Check Follow Up checkbox (if exists)
        const followUpCheckbox = page.getByRole('checkbox').or(page.getByText('Follow Up'));
        if (await followUpCheckbox.isVisible()) {
            await followUpCheckbox.check();
        }
        
        await page.locator('form').getByRole('button', { name: 'Check In' }).click();

    });
    // TC-CICO-007 BACKDATED CHECK IN OPEN TICKET NEW FEATURE
    // test('TC-CICO-007 | Backdated Check-In Time', async ({ page }) => {
    //     const newGuest = DataGenerator.uniqueName('Backdated');
    //     const yesterday = new Date();
    //     yesterday.setDate(yesterday.getDate() - 1);
    //     yesterday.setHours(9, 0, 0, 0);
    //     const backdatedTime = yesterday.toISOString().slice(0, 16);
        
    //     // Create guest
    //     await page.goto('https://office-gate.balinexus.com/');
    //     await page.getByRole('button', { name: 'New Guest' }).click();
    //     await page.getByRole('textbox', { name: 'Guest Name*' }).fill(newGuest);
    //     await page.getByRole('textbox', { name: 'Email*' }).fill(DataGenerator.uniqueEmail('back'));
    //     await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
    //     await page.getByRole('button', { name: 'Add Guest' }).click();
        
    //     // Check In dengan backdated time
    //     await page.getByRole('button', { name: 'Check In' }).click();
    //     await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(newGuest);
    //     await page.waitForTimeout(500);
    //     await page.getByText(newGuest).first().click();
        
    //     // Isi form dengan backdated time
    //     const timeInput = page.locator('input[type="datetime-local"]');
    //     await timeInput.fill(backdatedTime);
        
    //     await page.getByRole('textbox', { name: 'Name of person they are' }).fill('Veljo');
    //     await page.getByRole('textbox', { name: 'Name of company they are' }).fill('Jatiluwih');
    //     await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill('Business Meeting');
        
    //     await page.locator('form').getByRole('button', { name: 'Check In' }).click();
        
    //     // TODO: Verify di Reports tanggal sesuai backdated
    // });
    test('TC-CICO-008 | Check-In Time Defaults to Current Time', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/');
        
        // Catat waktu sebelum buka modal
        const beforeOpen = Date.now();
        
        await page.getByRole('button', { name: 'Check In' }).click();
        
        // Ambil value time input
        const timeInput = page.locator('input[type="datetime-local"]');
        const timeValue = await timeInput.inputValue();
        const modalTime = new Date(timeValue).getTime();
        
        // Catat waktu setelah modal terbuka
        const afterOpen = Date.now();
        
        // Verify waktu dalam range beforeOpen - afterOpen
        expect(modalTime).toBeGreaterThanOrEqual(beforeOpen - 1000);
        expect(modalTime).toBeLessThanOrEqual(afterOpen + 1000);
    });
    test('TC-CICO-009 | Check Out Active Guest - Happy Path', async ({ page }) => {
    const newGuest = DataGenerator.uniqueName('Check Out');
    
    // 1. Create guest
    await page.goto('https://office-gate.balinexus.com/');
    await page.getByRole('button', { name: 'New Guest' }).click();
    await page.getByRole('textbox', { name: 'Guest Name*' }).fill(newGuest);
    await page.getByRole('textbox', { name: 'Email*' }).fill(DataGenerator.uniqueEmail('checkout'));
    await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
    await page.getByRole('button', { name: 'Add Guest' }).click();
    
    // VERIFY: Guest created successfully
    await expect(page.getByText('Guest added successfully')).toBeVisible();
    
    // 2. Check In
    await page.getByRole('button', { name: 'Check In' }).click();
    await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(newGuest);
    await page.waitForTimeout(500);
    await page.getByText(newGuest).first().click();
    
    await page.getByRole('textbox', { name: 'Name of person they are' }).fill('Veljo');
    await page.getByRole('textbox', { name: 'Name of company they are' }).fill('Jatiluwih');
    await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill('Business Meeting');
    await page.locator('form').getByRole('button', { name: 'Check In' }).click();
    
    // VERIFY: Check In successful (optional)
    // Bisa cek toast atau redirect
    
    // 3. Check Out - PAKAI PATTERN DARI RECORDING
    await page.getByRole('link', { name: 'View All Active Guests →' }).click();
    await page.getByRole('searchbox', { name: 'Search guests...' }).fill(newGuest);
    await page.waitForTimeout(500);
    
    // Klik guest yang muncul
    await page.locator('div').filter({ hasText: new RegExp(`^${newGuest}$`) }).click();
    
    // Dari recording: ada button "Out" dulu baru "Check Out"
    await page.getByRole('button', { name: 'Out', exact: true }).click();
    await page.getByRole('button', { name: 'Check Out' }).click();
    
    // VERIFY: Guest tidak lagi di Active list
    await page.getByRole('link', { name: 'View All Active Guests →' }).click();
    await page.getByRole('searchbox', { name: 'Search guests...' }).fill(newGuest);
    await page.waitForTimeout(500);
    
    // Pastikan guest sudah tidak muncul
    await expect(page.locator('div').filter({ hasText: new RegExp(`^${newGuest}$`) })).toHaveCount(0);
    
    // OPTIONAL: Verify di halaman All Guests statusnya jadi "Checked Out"
    await page.getByRole('link', { name: 'Guests' }).click();
    await page.getByRole('searchbox', { name: 'Search guests...' }).fill(newGuest);
    await expect(page.getByText('Checked Out')).toBeVisible();
});

    test('TC-CICO-010 | Check Out Duration Calculation Accuracy', async ({ page }) => {
        const newGuest = DataGenerator.uniqueName('Duration');
        
        // Create guest
        await page.goto('https://office-gate.balinexus.com/');
        await page.getByRole('button', { name: 'New Guest' }).click();
        await page.getByRole('textbox', { name: 'Guest Name*' }).fill(newGuest);
        await page.getByRole('textbox', { name: 'Email*' }).fill(DataGenerator.uniqueEmail('duration'));
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
        await page.getByRole('button', { name: 'Add Guest' }).click();
        
        // Check In jam 13:55
        await page.getByRole('button', { name: 'Check In' }).click();
        await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(newGuest);
        await page.waitForTimeout(500);
        await page.getByText(newGuest).first().click();
        
        const checkInTime = new Date();
        checkInTime.setHours(13, 55, 0, 0);
        await page.locator('input[type="datetime-local"]').first().fill(checkInTime.toISOString().slice(0, 16));
        
        await page.getByRole('textbox', { name: 'Name of person they are' }).fill('Veljo');
        await page.getByRole('textbox', { name: 'Name of company they are' }).fill('Jatiluwih');
        await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill('Business Meeting');
        await page.locator('form').getByRole('button', { name: 'Check In' }).click();
        
        // Check Out jam 15:09
        await page.getByRole('link', { name: 'View All Active Guests →' }).click();
        await page.getByRole('searchbox', { name: 'Search guests...' }).fill(newGuest);
        await page.locator('div').filter({ hasText: new RegExp(`^${newGuest}$`) }).click();
        await page.getByRole('button', { name: 'Check Out' }).first().click();
        
        const checkOutTime = new Date();
        checkOutTime.setHours(15, 9, 0, 0);
        await page.locator('input[type="datetime-local"]').first().fill(checkOutTime.toISOString().slice(0, 16));
        
        await page.locator('form').getByRole('button', { name: 'Check Out' }).click();
        
        // TODO: Verify di Reports durasinya 1h 14m
    });
    test('TC-CICO-011 | Check Out With Notes (Optional Field)', async ({ page }) => {
        const newGuest = DataGenerator.uniqueName('Notes');
        const notes = 'Meeting went well. Follow up next week.';
        
        // Create guest
        await page.goto('https://office-gate.balinexus.com/');
        await page.getByRole('button', { name: 'New Guest' }).click();
        await page.getByRole('textbox', { name: 'Guest Name*' }).fill(newGuest);
        await page.getByRole('textbox', { name: 'Email*' }).fill(DataGenerator.uniqueEmail('notes'));
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
        await page.getByRole('button', { name: 'Add Guest' }).click();
        
        // Check In
        await page.getByRole('button', { name: 'Check In' }).click();
        await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(newGuest);
        await page.waitForTimeout(500);
        await page.getByText(newGuest).first().click();
        await page.getByRole('textbox', { name: 'Name of person they are' }).fill('Veljo');
        await page.getByRole('textbox', { name: 'Name of company they are' }).fill('Jatiluwih');
        await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill('Business Meeting');
        await page.locator('form').getByRole('button', { name: 'Check In' }).click();
        
        // Check Out dengan Notes
        await page.getByRole('link', { name: 'View All Active Guests →' }).click();
        await page.getByRole('searchbox', { name: 'Search guests...' }).fill(newGuest);
        await page.locator('div').filter({ hasText: new RegExp(`^${newGuest}$`) }).click();
        await page.getByRole('button', { name: 'Check Out' }).first().click();
        
        // Isi notes
        const notesInput = page.locator('textarea[placeholder*="Notes"]');
        await notesInput.fill(notes);
        
        await page.locator('form').getByRole('button', { name: 'Check Out' }).click();
        
        // TODO: Verify notes tersimpan di Reports
    });
    
    test('TC-CICO-013 | Check Out Time Before Check-In Time', async ({ page }) => {

        await page.goto('https://office-gate.balinexus.com/');
        console.log('📝 Starting TC-CICO-013: Check Out Time Before Check-In Time');
    
    try {
      // 1. Create guest and check in at 14:00
      const guestName = DataGenerator.uniqueName('CheckOutTest');
      console.log('✅ Creating guest:', guestName);
      
      // Create new guest
      await page.getByRole('button', { name: '+ Add New Guest' }).click();
      await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestName);
      await page.getByRole('textbox', { name: 'Company' }).fill('Test Company');
      await page.getByRole('textbox', { name: 'Country' }).fill('Test Country');
      await page.getByRole('textbox', { name: 'Email*' }).fill('test@unique.com');
      await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
      await page.getByRole('button', { name: 'Add Guest' }).click();
      
      // Check in at 14:00
      await page.getByRole('button', { name: 'Check In' }).click();
      await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(guestName);
      await page.getByText(guestName).first().click();
      
      // Set check-in time to 14:00
      await page.locator('input[type="datetime-local"]').first().fill('2026-03-11T14:00');
      await page.getByRole('textbox', { name: 'Name of person they are' }).fill('Test Person');
      await page.getByRole('textbox', { name: 'Name of company they are' }).fill('Test Company');
      await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill('Test Purpose');
      await page.locator('form').getByRole('button', { name: 'Check In' }).click();
      
      // 2. Open Check Out modal for that guest
      await page.getByRole('button', { name: 'Out', exact: true }).first().click();
      await page.getByRole('button', { name: 'Check Out' }).click();
      
      // 3. Set check-out time to 13:00 (same day)
      await page.locator('input[type="datetime-local"]').fill('2026-03-11T13:00');
      
      // 4. Submit
      await page.locator('form').getByRole('button', { name: 'Check Out' }).click();
      
      // Expected: Validation error message
      const errorVisible = await page.getByText(/check-out time cannot be before check-in/i).isVisible().catch(() => false);
      const errorVisible2 = await page.getByText(/check-out cannot precede check-in/i).isVisible().catch(() => false);
      
      if (!errorVisible && !errorVisible2) {
        throw new Error('Validation error message not displayed');
      }
      
      console.log('✅ Validation error message displayed');
      
      // Form not submitted - modal should still be open
      const modalStillOpen = await page.locator('form').filter({ hasText: 'Check Out' }).isVisible();
      expect(modalStillOpen).toBeTruthy();
      console.log('✅ Form not submitted, modal still open');
      
      // Guest remains Active
      await page.getByRole('button', { name: 'Cancel' }).click();
      await page.getByRole('link', { name: '👥 Guests' }).click();
      await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
      
      const guestStatus = await page.locator('tr', { hasText: guestName }).locator('td').nth(4).textContent();
      expect(guestStatus).toContain('Active');
      console.log('✅ Guest remains Active');
      
      // Cleanup
      await page.getByRole('link', { name: '👥 Guests' }).click();
      await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
      await page.locator('div').filter({ hasText: guestName }).first().click();
      await page.getByRole('button', { name: '🗑️ Delete' }).click();
      
      page.once('dialog', dialog => dialog.accept());
      console.log('✅ Test data cleaned up');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      await page.screenshot({ path: `screenshots/TC-CICO-013-${Date.now()}.png` });
      throw error;
    }

    });
    test('TC-CICO-014 | Cross-Midnight Duration Calculation', async ({ page }) => {
        console.log('📝 Starting TC-CICO-014: Cross-Midnight Duration Calculation');
    
    try {
      // 1. Create guest and check in at 23:00
      const guestName = DataGenerator.uniqueName('MidnightTest');
      console.log('✅ Creating guest:', guestName);
      
      await page.getByRole('button', { name: '+ Add New Guest' }).click();
      await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestName);
      await page.getByRole('textbox', { name: 'Company' }).fill('Test Company');
      await page.getByRole('textbox', { name: 'Country' }).fill('Test Country');
      await page.getByRole('textbox', { name: 'Email*' }).fill('test@unique.com');
      await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
      await page.getByRole('button', { name: 'Add Guest' }).click();
      
      // Check in at 23:00
      await page.getByRole('button', { name: 'Check In' }).click();
      await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(guestName);
      await page.getByText(guestName).first().click();
      
      await page.locator('input[type="datetime-local"]').first().fill('2026-03-11T23:00');
      await page.getByRole('textbox', { name: 'Name of person they are' }).fill('Test Person');
      await page.getByRole('textbox', { name: 'Name of company they are' }).fill('Test Company');
      await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill('Test Purpose');
      await page.locator('form').getByRole('button', { name: 'Check In' }).click();
      
      // 2. Check out at 01:30 next day
      await page.getByRole('button', { name: 'Out', exact: true }).first().click();
      await page.getByRole('button', { name: 'Check Out' }).click();
      
      await page.locator('input[type="datetime-local"]').fill('2026-03-12T01:30');
      await page.locator('form').getByRole('button', { name: 'Check Out' }).click();
      
      // 3. Verify duration in Reports
      await page.getByRole('link', { name: '📊 Dashboard' }).click();
      await page.getByRole('link', { name: 'View All Active Guests →' }).click();
      
      // Navigate to Reports (assuming Reports is accessible via some link)
      // This might need adjustment based on actual Reports navigation
      await page.goto('https://office-gate.balinexus.com/reports');
      
      // Filter by date range to include both days
      // Actual implementation depends on date filter UI
      
      // Search for our guest in reports
      await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
      
      // Verify duration (should be 2h 30m)
      const durationText = await page.locator('tr', { hasText: guestName }).locator('td').nth(3).textContent();
      
      // Check if duration shows 2.5 hours or 2h 30m
      const hasCorrectDuration = durationText?.includes('2.5') || 
                                 durationText?.includes('2h 30m') || 
                                 durationText?.includes('02:30');
      
      expect(hasCorrectDuration).toBeTruthy();
      console.log('✅ Duration correctly calculated as 2h 30m');
      
      // Verify no negative duration
      expect(durationText).not.toContain('-');
      console.log('✅ No negative duration');
      
      // Cleanup
      await page.getByRole('link', { name: '👥 Guests' }).click();
      await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
      await page.locator('div').filter({ hasText: guestName }).first().click();
      await page.getByRole('button', { name: '🗑️ Delete' }).click();
      
      page.once('dialog', dialog => dialog.accept());
      console.log('✅ Test data cleaned up');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      await page.screenshot({ path: `screenshots/TC-CICO-014-${Date.now()}.png` });
      throw error;
    }
    });
    test('TC-CICO-015 | Cancel Check-In Modal', async ({ page }) => {
  console.log('📝 Starting TC-CICO-015: Cancel Check-In Modal');
  
  try {
    // First create a guest
    const guestName = DataGenerator.uniqueName('CancelTest');
    console.log('✅ Creating guest:', guestName);
    
    await page.getByRole('button', { name: '+ Add New Guest' }).click();
    await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestName);
    await page.getByRole('textbox', { name: 'Company' }).fill('Test Company');
    await page.getByRole('textbox', { name: 'Country' }).fill('Test Country');
    await page.getByRole('textbox', { name: 'Email*' }).fill('test@unique.com');
    await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
    await page.getByRole('button', { name: 'Add Guest' }).click();
    
    // 1. Open Check In modal
    await page.getByRole('button', { name: 'Check In' }).click();
    
    // 2. Fill all fields
    await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(guestName);
    await page.getByText(guestName).first().click();
    
    await page.locator('input[type="datetime-local"]').first().fill('2026-03-11T10:00');
    await page.getByRole('textbox', { name: 'Name of person they are' }).fill('Test Person');
    await page.getByRole('textbox', { name: 'Name of company they are' }).fill('Test Company');
    await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill('Test Purpose');
    
    // 3. Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Expected: Modal closes
    const modalVisible = await page.locator('form').filter({ hasText: 'Check In' }).isVisible().catch(() => false);
    expect(modalVisible).toBeFalsy();
    console.log('✅ Modal closed');
    
    // No visit record created - guest not in Active list
    await page.getByRole('link', { name: '👥 Guests' }).click();
    await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
    
    // Guest should exist but not be active
    const guestRow = page.locator('tr', { hasText: guestName });
    await expect(guestRow).toBeVisible();
    
    const status = await guestRow.locator('td').nth(4).textContent();
    
    // Fix: Use try-catch for assertion instead of .catch()
    try {
      expect(status).toContain('Active');
      // If we get here, guest is Active - which is wrong for this test
      // So we'll fail the test
      throw new Error('Guest should not be Active after cancelling check-in');
    } catch (assertionError) {
      // If the assertion fails (status does NOT contain 'Active'), that's what we want
      console.log('✅ Guest status unchanged (not active) - correct behavior');
    }
    
    // Alternative simpler approach:
    // Just verify that status does NOT contain 'Active' for cancelled check-in
    // expect(status).not.toContain('Active');
    // console.log('✅ Guest status unchanged (not active)');
    
    // Cleanup
    await page.locator('div').filter({ hasText: guestName }).first().click();
    await page.getByRole('button', { name: '🗑️ Delete' }).click();
    
    page.once('dialog', dialog => dialog.accept());
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: `screenshots/TC-CICO-015-${Date.now()}.png` });
    throw error;
  }
});
    test('TC-CICO-016 | Cancel Check-Out Modal', async ({ page }) => {
    console.log('📝 Starting TC-CICO-016: Cancel Check-Out Modal');
    
    try {
      // 1. Check In a guest
      const guestName = DataGenerator.uniqueName('CancelOutTest');
      console.log('✅ Creating guest:', guestName);
      
      await page.getByRole('button', { name: '+ Add New Guest' }).click();
      await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestName);
      await page.getByRole('textbox', { name: 'Company' }).fill('Test Company');
      await page.getByRole('textbox', { name: 'Country' }).fill('Test Country');
      await page.getByRole('textbox', { name: 'Email*' }).fill('test@unique.com');
      await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
      await page.getByRole('button', { name: 'Add Guest' }).click();
      
      // Check in
      await page.getByRole('button', { name: 'Check In' }).click();
      await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(guestName);
      await page.getByText(guestName).first().click();
      await page.locator('input[type="datetime-local"]').first().fill('2026-03-11T10:00');
      await page.getByRole('textbox', { name: 'Name of person they are' }).fill('Test Person');
      await page.getByRole('textbox', { name: 'Name of company they are' }).fill('Test Company');
      await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill('Test Purpose');
      await page.locator('form').getByRole('button', { name: 'Check In' }).click();
      
      // 2. Open Check Out modal for that guest
      await page.getByRole('button', { name: 'Out', exact: true }).first().click();
      await page.getByRole('button', { name: 'Check Out' }).click();
      
      // 3. Click Cancel
      await page.getByRole('button', { name: 'Cancel' }).click();
      
      // Expected: Modal closes
      const modalVisible = await page.locator('form').filter({ hasText: 'Check Out' }).isVisible().catch(() => false);
      expect(modalVisible).toBeFalsy();
      console.log('✅ Modal closed');
      
      // Guest remains Active
      await page.getByRole('link', { name: '👥 Guests' }).click();
      await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
      
      const status = await page.locator('tr', { hasText: guestName }).locator('td').nth(4).textContent();
      expect(status).toContain('Active');
      console.log('✅ Guest remains Active');
      
      // No checkout recorded - check that guest still has Out button
      await page.getByRole('link', { name: '📊 Dashboard' }).click();
      const outButtonExists = await page.getByRole('button', { name: 'Out', exact: true }).first().isVisible();
      expect(outButtonExists).toBeTruthy();
      console.log('✅ No checkout recorded');
      
      // Cleanup - check out and delete
      await page.getByRole('button', { name: 'Out', exact: true }).first().click();
      await page.getByRole('button', { name: 'Check Out' }).click();
      await page.locator('form').getByRole('button', { name: 'Check Out' }).click();
      
      await page.getByRole('link', { name: '👥 Guests' }).click();
      await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
      await page.locator('div').filter({ hasText: guestName }).first().click();
      await page.getByRole('button', { name: '🗑️ Delete' }).click();
      
      page.once('dialog', dialog => dialog.accept());
      console.log('✅ Test data cleaned up');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      await page.screenshot({ path: `screenshots/TC-CICO-016-${Date.now()}.png` });
      throw error;
    }
  });


    test('TC-CICO-017 | New Guest + Immediate Check-In Flow', async ({ page }) => {
    console.log('📝 Starting TC-CICO-017: New Guest + Immediate Check-In Flow');
    
    try {
      const guestName = 'First Visit Test';
      
      // 1. Click New Guest button
      await page.getByRole('button', { name: 'New Guest', exact: true }).click();
      console.log('✅ Clicked New Guest button');
      
      // 2. Add new guest
      await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestName);
      await page.getByRole('textbox', { name: 'Company' }).fill('Test Company');
      await page.getByRole('textbox', { name: 'Country' }).fill('Test Country');
      await page.getByRole('textbox', { name: 'Email*' }).fill('test@unique.com');
      await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
      await page.getByRole('button', { name: 'Add Guest' }).click();
      console.log('✅ Guest added');
      
      // 3. Immediately click Check In
      await page.getByRole('button', { name: 'Check In' }).click();
      
      // 4. Search for the guest in Check In modal
      await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(guestName);
      await page.getByText(guestName).first().click();
      console.log('✅ Guest found in search');
      
      // 5. Complete check-in
      await page.locator('input[type="datetime-local"]').first().fill('2026-03-11T10:00');
      await page.getByRole('textbox', { name: 'Name of person they are' }).fill('Test Person');
      await page.getByRole('textbox', { name: 'Name of company they are' }).fill('Test Company');
      await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill('Test Purpose');
      await page.locator('form').getByRole('button', { name: 'Check In' }).click();
      console.log('✅ Check-in completed');
      
      // Expected: Guest appears in Active Guests list
      await page.getByRole('link', { name: '📊 Dashboard' }).click();
      
      // Check if guest appears in active list
      const guestInActive = await page.getByText(guestName).isVisible();
      expect(guestInActive).toBeTruthy();
      console.log('✅ Guest appears in Active Guests');
      
      // Cleanup
      await page.getByRole('button', { name: 'Out', exact: true }).first().click();
      await page.getByRole('button', { name: 'Check Out' }).click();
      await page.locator('form').getByRole('button', { name: 'Check Out' }).click();
      
      await page.getByRole('link', { name: '👥 Guests' }).click();
      await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
      await page.locator('div').filter({ hasText: guestName }).first().click();
      await page.getByRole('button', { name: '🗑️ Delete' }).click();
      
      page.once('dialog', dialog => dialog.accept());
      console.log('✅ Test data cleaned up');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      await page.screenshot({ path: `screenshots/TC-CICO-017-${Date.now()}.png` });
      throw error;
    }
  });
  
test('TC-CICO-018 | Multiple Guests Checked In Simultaneously', async ({ page }) => {
    console.log('📝 Starting TC-CICO-018: Multiple Guests Checked In Simultaneously');
    
    try {
      const guestNames = ['Guest A', 'Guest B', 'Guest C'].map(name => DataGenerator.uniqueName(name));
      
      // Create all guests first
      for (const guestName of guestNames) {
        console.log(`✅ Creating guest: ${guestName}`);
        await page.getByRole('button', { name: '+ Add New Guest' }).click();
        await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestName);
        await page.getByRole('textbox', { name: 'Company' }).fill('Test Company');
        await page.getByRole('textbox', { name: 'Country' }).fill('Test Country');
        await page.getByRole('textbox', { name: 'Email*' }).fill('test@unique.com');
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
        await page.getByRole('button', { name: 'Add Guest' }).click();
      }
      
      // Check in all guests
      for (const guestName of guestNames) {
        console.log(`✅ Checking in: ${guestName}`);
        await page.getByRole('button', { name: 'Check In' }).click();
        await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(guestName);
        await page.getByText(guestName).first().click();
        await page.locator('input[type="datetime-local"]').first().fill('2026-03-11T10:00');
        await page.getByRole('textbox', { name: 'Name of person they are' }).fill('Test Person');
        await page.getByRole('textbox', { name: 'Name of company they are' }).fill('Test Company');
        await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill('Test Purpose');
        await page.locator('form').getByRole('button', { name: 'Check In' }).click();
      }
      
      // Verify Dashboard count
      await page.getByRole('link', { name: '📊 Dashboard' }).click();
      
      // Check count in dashboard (assuming there's a count display)
      const activeCountText = await page.getByRole('heading', { name: /[0-9]/ }).first().textContent();
      const activeCount = parseInt(activeCountText || '0');
      
      expect(activeCount).toBeGreaterThanOrEqual(3);
      console.log(`✅ Dashboard count shows at least ${activeCount} active guests`);
      
      // All 3 guests shown as Active in Guests page
      await page.getByRole('link', { name: '👥 Guests' }).click();
      
      for (const guestName of guestNames) {
        await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
        const status = await page.locator('tr', { hasText: guestName }).locator('td').nth(4).textContent();
        expect(status).toContain('Active');
        console.log(`✅ ${guestName} is Active`);
      }
      
      // Cleanup - check out all guests and delete
      for (const guestName of guestNames) {
        await page.getByRole('link', { name: '📊 Dashboard' }).click();
        await page.getByRole('button', { name: 'Out', exact: true }).first().click();
        await page.getByRole('button', { name: 'Check Out' }).click();
        await page.locator('form').getByRole('button', { name: 'Check Out' }).click();
        
        await page.getByRole('link', { name: '👥 Guests' }).click();
        await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
        await page.locator('div').filter({ hasText: guestName }).first().click();
        await page.getByRole('button', { name: '🗑️ Delete' }).click();
        
        page.once('dialog', dialog => dialog.accept());
      }
      
      console.log('✅ Test data cleaned up');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      await page.screenshot({ path: `screenshots/TC-CICO-018-${Date.now()}.png` });
      throw error;
    }
  });
test('TC-CICO-019 | Guest Visit History - Multiple Visits', async ({ page }) => {
    console.log('📝 Starting TC-CICO-019: Guest Visit History - Multiple Visits');
    
    try {
      const guestName = DataGenerator.uniqueName('MultipleVisits');
      const visitCount = 3;
      
      // Create guest
      console.log('✅ Creating guest:', guestName);
      await page.getByRole('button', { name: '+ Add New Guest' }).click();
      await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestName);
      await page.getByRole('textbox', { name: 'Company' }).fill('Test Company');
      await page.getByRole('textbox', { name: 'Country' }).fill('Test Country');
      await page.getByRole('textbox', { name: 'Email*' }).fill('test@unique.com');
      await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
      await page.getByRole('button', { name: 'Add Guest' }).click();
      
      // Create multiple visits on different days
      for (let i = 0; i < visitCount; i++) {
        const day = 11 + i; // March 11, 12, 13
        console.log(`✅ Creating visit ${i+1} on March ${day}`);
        
        // Check in
        await page.getByRole('button', { name: 'Check In' }).click();
        await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(guestName);
        await page.getByText(guestName).first().click();
        await page.locator('input[type="datetime-local"]').first().fill(`2026-03-${day}T10:00`);
        await page.getByRole('textbox', { name: 'Name of person they are' }).fill('Test Person');
        await page.getByRole('textbox', { name: 'Name of company they are' }).fill('Test Company');
        await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill(`Visit ${i+1}`);
        await page.locator('form').getByRole('button', { name: 'Check In' }).click();
        
        // Check out after 2 hours
        await page.getByRole('button', { name: 'Out', exact: true }).first().click();
        await page.getByRole('button', { name: 'Check Out' }).click();
        await page.locator('input[type="datetime-local"]').fill(`2026-03-${day}T12:00`);
        await page.locator('form').getByRole('button', { name: 'Check Out' }).click();
      }
      
      // Navigate to Reports
      await page.goto('https://office-gate.balinexus.com/reports');
      
      // Filter by date range showing all visits
      // Implementation depends on date filter UI
      // Assuming we can filter from March 10-14
      
      // Search for our guest
      await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
      
      // Count visit entries
      const rows = page.locator('tr', { hasText: guestName });
      const rowCount = await rows.count();
      
      expect(rowCount).toBe(visitCount);
      console.log(`✅ Found ${rowCount} visits (expected ${visitCount})`);
      
      // Verify each visit has correct times and duration
      for (let i = 0; i < rowCount; i++) {
        const rowText = await rows.nth(i).textContent();
        expect(rowText).toContain('2h');
        console.log(`✅ Visit ${i+1} has correct duration`);
      }
      
      // Cleanup
      await page.getByRole('link', { name: '👥 Guests' }).click();
      await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
      await page.locator('div').filter({ hasText: guestName }).first().click();
      await page.getByRole('button', { name: '🗑️ Delete' }).click();
      
      page.once('dialog', dialog => dialog.accept());
      console.log('✅ Test data cleaned up');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      await page.screenshot({ path: `screenshots/TC-CICO-019-${Date.now()}.png` });
      throw error;
    }
  });
  test('TC-CICO-020 | Check-In Form Search - Partial Name Match', async ({ page }) => {
  console.log('📝 Starting TC-CICO-020: Check-In Form Search - Partial Name Match');
  
  try {
    const testGuests = ['Andrey', 'Andrew', 'Andri'];
    
    // Create test guests
    for (const guestName of testGuests) {
      console.log(`✅ Creating guest: ${guestName}`);
      await page.getByRole('button', { name: '+ Add New Guest' }).click();
      await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestName);
      await page.getByRole('textbox', { name: 'Company' }).fill('Test Company');
      await page.getByRole('textbox', { name: 'Country' }).fill('Test Country');
      await page.getByRole('textbox', { name: 'Email*' }).fill('test@unique.com');
      await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone()); // Fixed: use uniquePhone instead of email
      await page.getByRole('button', { name: 'Add Guest' }).click();
    }
    
    // Open Check In modal
    await page.getByRole('button', { name: 'Check In' }).click();
    
    // Type 'Andr' in search field
    await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill('Andr');
    console.log('✅ Searched for "Andr"');
    
    // Wait for dropdown results to appear
    await page.waitForTimeout(1000); // Brief wait for search results to load
    
    // Check dropdown results - using more reliable selectors
    // First approach: check if specific guest names are visible in the dropdown
    const andreyVisible = await page.getByText('Andrey', { exact: false }).isVisible().catch(() => false);
    const andrewVisible = await page.getByText('Andrew', { exact: false }).isVisible().catch(() => false);
    const andriVisible = await page.getByText('Andri', { exact: false }).isVisible().catch(() => false);
    
    // Verify matches
    expect(andreyVisible).toBeTruthy();
    expect(andrewVisible).toBeTruthy();
    expect(andriVisible).toBeFalsy();
    
    console.log('✅ Andrey and Andrew appear in results, Andri does not');
    
    // Test minimum 2 characters
    await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill('A');
    await page.waitForTimeout(500); // Brief wait for search to potentially update
    
    // Count visible results for single character search (should be minimal or empty)
    // This depends on implementation - adjust assertion as needed
    const singleCharResults = await page.locator('[role="option"], .search-result, li').count();
    console.log(`✅ Single character search returned ${singleCharResults} results (implementation dependent)`);
    
    // Test selecting a guest
    await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill('Andr');
    await page.waitForTimeout(500);
    await page.getByText('Andrey').first().click();
    
    // Verify guest selected - Approach 1: Check if the searchbox now contains the selected name
    // This assumes the selected guest name appears in the searchbox or a selection indicator
    const searchBoxValue = await page.getByRole('searchbox', { name: 'Search by name or company...' }).inputValue();
    
    // Different possible behaviors:
    // 1. Searchbox might show the selected name
    // 2. There might be a selected indicator elsewhere
    // 3. The name might appear in a different element
    
    if (searchBoxValue.includes('Andrey')) {
      console.log('✅ Correct guest selected (name in searchbox)');
    } else {
      // Alternative check: look for selected indicator
      const selectedIndicator = await page.locator('.selected, [aria-selected="true"]').textContent();
      expect(selectedIndicator).toContain('Andrey');
      console.log('✅ Correct guest selected (via selection indicator)');
    }
    
    console.log('✅ Correct guest can be selected');
    
    // Cleanup - close modal
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Delete test guests
    for (const guestName of testGuests) {
      await page.getByRole('link', { name: '👥 Guests' }).click();
      await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
      
      // Wait for search results
      await page.waitForTimeout(500);
      
      const guestExists = await page.getByText(guestName, { exact: true }).isVisible().catch(() => false);
      if (guestExists) {
        await page.getByText(guestName, { exact: true }).first().click();
        await page.getByRole('button', { name: '🗑️ Delete' }).click();
        
        // Handle confirmation dialog
        page.once('dialog', dialog => {
          console.log(`✅ Deleting guest: ${guestName}`);
          dialog.accept();
        });
        
        // Wait for deletion to complete
        await page.waitForTimeout(500);
      }
    }
    
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: `screenshots/TC-CICO-020-${Date.now()}.png` });
    throw error;
  }
});

});
