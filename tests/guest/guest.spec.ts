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

test.describe('Guests Module', () => {
    const guestData = {
    name: DataGenerator.uniqueName('QA'),
    email: DataGenerator.uniqueEmail('QA'),
    phone: DataGenerator.uniquePhone(),
    company: 'QA Company',
    country: 'Indonesia'
    };

    test('TC-GUEST-001 | Add New Guest With All Required Fields', async ({ page, context }) => {
        await page.goto('https://office-gate.balinexus.com/');
        // Navigate to Guests module
        await page.getByRole('link', { name: '👥 Guests' }).click();
        await page.getByRole('button', { name: '+ Add New Guest' }).click();
        await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestData.name);
        await page.getByRole('textbox', { name: 'Company' }).fill(guestData.company);
        await page.getByRole('textbox', { name: 'Country' }).fill(guestData.country);
        await page.getByRole('textbox', { name: 'Email*' }).fill(guestData.email);
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill(guestData.phone);

        await page.getByRole('button', { name: 'Add Guest' }).click();

        //VERIFY ADDED GUEST 
        await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestData.name);
        await page.waitForTimeout(500);
        const guestRow = page.getByRole('row').filter({ hasText: guestData.name });
        await expect(guestRow).toBeVisible();

        const cells = guestRow.getByRole('cell');
        await expect(cells.nth(0)).toContainText(guestData.name);
        await expect(cells.nth(1)).toContainText(guestData.company);
        
        console.log(`✅ Guest created successfully: ${guestData.name}`);
        // Cleanup - Delete the created guest
        await page.getByRole('table').getByText(guestData.name).click();

         console.log(`📍 Verified guest details on detail page`);
        
        // Handle the delete confirmation dialog
        page.once('dialog', async (dialog) => {
            console.log(`🗑️ Delete dialog message: ${dialog.message()}`);
            // Accept the dialog to confirm deletion
            await dialog.accept();
        });

        await page.getByRole('button', { name: '🗑️ Delete' }).click();
         await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestData.name);
        await page.waitForTimeout(500);
        
        const deletedGuest = page.getByRole('row').filter({ hasText: guestData.name });
        await expect(deletedGuest).not.toBeVisible();
            console.log(`✅ Guest deleted successfully: ${guestData.name}`);
    });

    test('TC-GUEST-002 | Add New Guest With Only Required Fields', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/');
        // Navigate to Guests module
        await page.getByRole('link', { name: '👥 Guests' }).click();
          await page.getByRole('button', { name: '+ Add New Guest' }).click();
        await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestData.name);
        await page.getByRole('textbox', { name: 'Email*' }).fill(guestData.email);
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill(guestData.phone);

        await page.getByRole('button', { name: 'Add Guest' }).click();
        
        await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestData.name);
        await page.waitForTimeout(500);
        const guestRow = page.getByRole('row').filter({ hasText: guestData.name });
        await expect(guestRow).toBeVisible();
        
        // Get all cells in the row
        const cells = guestRow.getByRole('cell');
        
        await expect(cells.nth(1)).toContainText('-');
        // Verify Country shows '-' (kosong)
        await expect(cells.nth(2)).toContainText('-');

        await page.getByRole('table').getByText(guestData.name).click();

         console.log(`📍 Verified guest details on detail page`);
        
        // Handle the delete confirmation dialog
        page.once('dialog', async (dialog) => {
            console.log(`🗑️ Delete dialog message: ${dialog.message()}`);
            // Accept the dialog to confirm deletion
            await dialog.accept();
        });

        await page.getByRole('button', { name: '🗑️ Delete' }).click();
         await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestData.name);
        await page.waitForTimeout(500);
        
        const deletedGuest = page.getByRole('row').filter({ hasText: guestData.name });
        await expect(deletedGuest).not.toBeVisible();
            console.log(`✅ Guest deleted successfully: ${guestData.name}`);


    });


    test('TC-GUEST-003 | Add Guest With Missing Required Field (Name)', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/');
        // Navigate to Guests module
        await page.getByRole('link', { name: '👥 Guests' }).click();
        await page.getByRole('button', { name: '+ Add New Guest' }).click();
        await page.getByRole('textbox', { name: 'Email*' }).fill(guestData.email);
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill(guestData.phone);

        await page.getByRole('button', { name: 'Add Guest' }).click();
        //VALIDASI APAKAH KITA MASIH DI HALAMAN YG SAMA
        await expect(page.getByRole('textbox', { name: 'Guest Name*' })).toBeVisible();
        const isNameFieldInvalid = await page.getByRole('textbox', { name: 'Guest Name*' }).evaluate((el: HTMLInputElement) => {
        return !el.validity.valid; // true jika field tidak valid 
    });
    expect(isNameFieldInvalid).toBeTruthy();
    });

   test('TC-GUEST-004 | Add Guest With Invalid Email Format', async ({ page }) => {
    await page.goto('https://office-gate.balinexus.com/');
    // Navigate to Guests module
    await page.getByRole('link', { name: '👥 Guests' }).click();
    await page.getByRole('button', { name: '+ Add New Guest' }).click();
    
    await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestData.name);
    await page.getByRole('textbox', { name: 'Email*' }).fill('notanemail');
    await page.getByRole('textbox', { name: 'Phone Number*' }).fill(guestData.phone);

    await page.getByRole('button', { name: 'Add Guest' }).click();
    
    // FIX: Verify we're still on the form page
    await expect(page.getByRole('textbox', { name: 'Guest Name*' })).toBeVisible();
    
    // FIX: Check Email field validity instead of Name field
    const isEmailFieldInvalid = await page.getByRole('textbox', { name: 'Email*' }).evaluate((el: HTMLInputElement) => {
        return !el.validity.valid; // true jika field tidak valid 
    });
    expect(isEmailFieldInvalid).toBeTruthy();
    
    // Optional: Also check if there's a validation error message
    const emailError = page.locator('text=invalid email').or(
        page.locator('text=valid email')
    ).first();
    
    if (await emailError.isVisible().catch(() => false)) {
        const errorText = await emailError.textContent();
        console.log(`📧 Email validation error: "${errorText}"`);
    }
});

    test('TC-GUEST-005 | Duplicate Guest Name Prevention', async ({ page }) => {
        //GUEST 1
        await page.goto('https://office-gate.balinexus.com/');
        // Navigate to Guests module
        await page.getByRole('link', { name: '👥 Guests' }).click();
          await page.getByRole('button', { name: '+ Add New Guest' }).click();
        await page.getByRole('textbox', { name: 'Guest Name*' }).fill('QA');
        await page.getByRole('textbox', { name: 'Email*' }).fill('guestData@invalid.email');
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill('08123456789');

        await page.getByRole('button', { name: 'Add Guest' }).click();

        //GUEST 2
        await page.goto('https://office-gate.balinexus.com/');
        // Navigate to Guests module
        await page.getByRole('link', { name: '👥 Guests' }).click();
          await page.getByRole('button', { name: '+ Add New Guest' }).click();
        await page.getByRole('textbox', { name: 'Guest Name*' }).fill('QA');
        await page.getByRole('textbox', { name: 'Email*' }).fill('guestData@invalid.email');
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill('08123456789');

        await page.getByRole('button', { name: 'Add Guest' }).click();
        const currentUrl = page.url();
    
    if (currentUrl.includes('/guests') && !currentUrl.includes('/guests/')) {
        // Case 1: Redirected to guests list - check if duplicate was actually created
        await page.getByRole('searchbox', { name: 'Search guests...' }).fill('QA');
        await page.waitForTimeout(500);
        
        const rows = page.getByRole('row').filter({ hasText: 'QA' });
        const count = await rows.count();
        
        // Should only have 1 guest (the first one)
        expect(count).toBe(1);
        console.log(`✅ Duplicate prevented: Only ${count} guest found`);
    } else {
        // Case 2: Still on form page - check for error message
        await expect(page.getByRole('textbox', { name: 'Guest Name*' })).toBeVisible();
        
        // Look for error message
        const errorMessage = page.locator('text=already exists').or(
            page.locator('text=duplicate')
        ).or(
            page.locator('.error-message')
        ).first();
        
        await expect(errorMessage).toBeVisible();
        console.log('✅ Duplicate prevented with error message');
    }
            
    });

    test('TC-GUEST-006 | Search Guest by Full Name', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/');
        // Navigate to Guests module
        await page.getByRole('link', { name: '👥 Guests' }).click();
        await page.getByRole('searchbox', { name: 'Search guests...' }).fill('Farsight');
        await page.waitForTimeout(500);
        const guestRow = page.getByRole('row').filter({ hasText: 'Farsight' });
        await expect(guestRow).toBeVisible();
        
        // Get all cells in the row
        const cells = guestRow.getByRole('cell');
        
        await expect(cells.nth(0)).toContainText('Farsight');
    });

    test('TC-GUEST-007 | Search Guest by Partial Name', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/');
        // Navigate to Guests module
        await page.getByRole('link', { name: '👥 Guests' }).click();
        await page.getByRole('searchbox', { name: 'Search guests...' }).fill('Far');
        await page.waitForTimeout(500);
        const guestRow = page.getByRole('row').filter({ hasText: 'Farsight' });
        await expect(guestRow).toBeVisible();
        // Get all cells in the row
        const cells = guestRow.getByRole('cell');
        await expect(cells.nth(0)).toContainText('Farsight');
    });

    test('TC-GUEST-008 | Search Functionality - Global Search', async ({ page }) => {
    await page.goto('https://office-gate.balinexus.com/');
    await page.getByRole('link', { name: '👥 Guests' }).click();
    
    // Search for term
    await page.getByRole('searchbox', { name: 'Search guests...' }).fill('Ubud');
    await page.waitForTimeout(500);
    
    // Get all result rows (exclude header)
    const rows = page.getByRole('row').filter({ hasNotText: 'Guest Info' });
    const resultCount = await rows.count();
    
    // Verify we got results
    expect(resultCount).toBeGreaterThan(0);
    
    // Verify Filtered Results count matches
    const filteredCount = page.getByText('Filtered Results').locator('..').getByRole('heading');
    await expect(filteredCount).toHaveText(resultCount.toString());
    
    // Simple verification: Check first 3 rows contain "Ubud" somewhere
    for (let i = 0; i < Math.min(resultCount, 3); i++) {
        const rowText = await rows.nth(i).textContent();
        expect(rowText?.toLowerCase()).toContain('ubud');
    }
    
    console.log(`✅ Global search works: Found ${resultCount} results containing "Ubud"`);
});
    test('TC-GUEST-009 | Guest List Pagination - 20 Per Page', async ({ page }) => {
    await page.goto('https://office-gate.balinexus.com/');
    await page.getByRole('link', { name: '👥 Guests' }).click();
    
    // Wait for table to be visible
    await page.waitForSelector('table');
    
    // FIX: Use the exact header text from the DOM - "Guest Info" not "GUEST INFO"
    const rows = page.getByRole('row').filter({ hasNotText: 'Guest Info' });
    const rowCount = await rows.count();
    
    // Verify page 1 shows 20 entries (or less if total < 20)
    expect(rowCount).toBeLessThanOrEqual(20);
    console.log(`📊 Page 1 has ${rowCount} entries`);
    
    const paginationText = await page.getByText(/Showing \d+ to \d+ of \d+ entries/).textContent();
    console.log(`📄 ${paginationText}`);
    
    // Extract numbers from pagination text
    const match = paginationText?.match(/Showing (\d+) to (\d+) of (\d+) entries/);
    if (match) {
        const start = parseInt(match[1]);
        const end = parseInt(match[2]);
        const total = parseInt(match[3]);
        
        expect(start).toBe(1);
        // This will now pass because rowCount will be 20, matching (20 - 1 + 1)
        expect(end - start + 1).toBe(rowCount);
        
        // Rest of the test...
        if (end < total) {
            await page.getByRole('button', { name: 'Next' }).click();
            await page.waitForTimeout(500);
            
            const page2Text = await page.getByText(/Showing \d+ to \d+ of \d+ entries/).textContent();
            const page2Match = page2Text?.match(/Showing (\d+) to (\d+) of (\d+) entries/);
            
            if (page2Match) {
                const page2Start = parseInt(page2Match[1]);
                const page2End = parseInt(page2Match[2]);
                
                expect(page2Start).toBe(end + 1);
                expect(page2End - page2Start + 1).toBeLessThanOrEqual(20);
                console.log(`✅ Pagination working: Page 2 shows ${page2Start}-${page2End}`);
            }
        }
    }
});
    // test('TC-GUEST-010 | Sort Guest List A-Z', async ({ page }) => {
    //     await page.goto('https://office-gate.balinexus.com/');
    // await page.getByRole('link', { name: '👥 Guests' }).click();
    
    // // Check if sort button exists and get current sort state
    // const sortButton = page.getByRole('button', { name: /Sort: Name/ });
    // await expect(sortButton).toBeVisible();
    // // Get current sort direction from button text
    // const sortText = await sortButton.textContent();
    // console.log(`📌 Current sort: ${sortText}`);
    
    // // If not sorted A-Z, click to sort A-Z
    // if (!sortText?.includes('(A-Z)')) {
    //     await sortButton.click();
    //     await page.waitForTimeout(500);
    // }
    
    // // Get all guest names from first column
    // const nameCells = page.getByRole('row')
    //     .filter({ hasNotText: 'GUEST INFO' })
    //     .getByRole('cell').first();
    
    // const nameCount = await nameCells.count();
    // const names: string[] = [];
    
    // for (let i = 0; i < Math.min(nameCount, 20); i++) {
    //     const name = await nameCells.nth(i).textContent();
    //     if (name) names.push(name.trim());
    // }
    
    // console.log(`📋 First ${names.length} names:`, names);
    
    // // Verify names are sorted alphabetically
    // const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
    // expect(names).toEqual(sortedNames);
    
    // // Verify first entry starts with A (or earliest letter)
    // const firstChar = names[0].charAt(0).toUpperCase();
    // console.log(`🔤 First name starts with: ${firstChar}`);
    
    // // Verify sort button shows A-Z
    // await expect(page.getByRole('button', { name: '↑ Sort: Name (A-Z)' })).toBeVisible();
    
    // // Test Z-A sort
    // await sortButton.click();
    // await page.waitForTimeout(500);
    // await expect(page.getByRole('button', { name: '↓ Sort: Name (Z-A)' })).toBeVisible();
    
    // // Get names again for Z-A sort
    // const zNames: string[] = [];
    // for (let i = 0; i < Math.min(nameCount, 20); i++) {
    //     const name = await nameCells.nth(i).textContent();
    //     if (name) zNames.push(name.trim());
    // }
    
    // // Verify Z-A sort
    // const zSortedNames = [...zNames].sort((a, b) => b.localeCompare(a));
    // expect(zNames).toEqual(zSortedNames);
    // console.log(`✅ Sort functionality verified for both A-Z and Z-A`);

    // });
    test('TC-GUEST-011 | Guest Name with Special Characters', async ({ page }) => {
         const specialName = "O'Brien";
    const specialEmail = DataGenerator.uniqueEmail('special');
    
    await page.goto('https://office-gate.balinexus.com/');
    await page.getByRole('link', { name: '👥 Guests' }).click();
    await page.getByRole('button', { name: '+ Add New Guest' }).click();
    
    await page.getByRole('textbox', { name: 'Guest Name*' }).fill(specialName);
    await page.getByRole('textbox', { name: 'Email*' }).fill(specialEmail);
    await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
    
    await page.getByRole('button', { name: 'Add Guest' }).click();
    
    // Verify in guest list
    await page.getByRole('searchbox', { name: 'Search guests...' }).fill(specialName);
    await page.waitForTimeout(500);
    
    const guestRow = page.getByRole('row').filter({ hasText: specialName });
    await expect(guestRow).toBeVisible();
    
    const nameCell = guestRow.getByRole('cell').first();
    await expect(nameCell).toContainText(specialName);
    
    console.log(`✅ Special character name '${specialName}' saved correctly`);
    
    // Cleanup
    await nameCell.click();
    page.once('dialog', async (dialog) => await dialog.accept());
    await page.getByRole('button', { name: '🗑️ Delete' }).click();
    });
    
    test('TC-GUEST-012 | Guest Name - 200+ Character Input', async ({ page }) => {
        // Generate 250-character string
    const longName = 'A' + 'b'.repeat(249); // 250 characters total
    
    await page.goto('https://office-gate.balinexus.com/');
    await page.getByRole('link', { name: '👥 Guests' }).click();
    await page.getByRole('button', { name: '+ Add New Guest' }).click();
    
    const nameField = page.getByRole('textbox', { name: 'Guest Name*' });
    await nameField.fill(longName);
    
    // Check if field has maxlength attribute
    const maxLength = await nameField.getAttribute('maxlength');
    
    if (maxLength) {
        // Field has maxlength validation
        console.log(`📏 Field has maxlength: ${maxLength}`);
        
        // Get actual entered value
        const enteredValue = await nameField.inputValue();
        expect(enteredValue.length).toBeLessThanOrEqual(parseInt(maxLength));
        
        // Fill other fields
        await page.getByRole('textbox', { name: 'Email*' }).fill(DataGenerator.uniqueEmail('long'));
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
        
        await page.getByRole('button', { name: 'Add Guest' }).click();
        
        // Check if we were able to submit
        const currentUrl = page.url();
        if (currentUrl.includes('/guests') && !currentUrl.includes('/guests/')) {
            // Successfully added with truncated name
            console.log(`✅ Added guest with truncated name (${enteredValue.length} chars)`);
            
            // Cleanup
            await page.getByRole('searchbox', { name: 'Search guests...' }).fill(enteredValue);
            await page.waitForTimeout(500);
            const guestRow = page.getByRole('row').filter({ hasText: enteredValue });
            
            if (await guestRow.count() > 0) {
                await guestRow.getByRole('cell').first().click();
                page.once('dialog', async (dialog) => await dialog.accept());
                await page.getByRole('button', { name: '🗑️ Delete' }).click();
            }
        } else {
            // Still on form - check for validation message
            console.log(`✅ Field prevented submission with too-long name`);
        }
    } else {
        // No maxlength - try to submit and see what happens
        await page.getByRole('textbox', { name: 'Email*' }).fill(DataGenerator.uniqueEmail('long'));
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
        
        await page.getByRole('button', { name: 'Add Guest' }).click();
        
        // Check result
        const errorVisible = await page.getByText(/too long|maximum|exceeds/i).isVisible().catch(() => false);
        
        if (errorVisible) {
            console.log(`✅ Validation error shown for too-long name`);
        } else {
            // Might have been accepted - check if on guests page
            const currentUrl = page.url();
            if (currentUrl.includes('/guests') && !currentUrl.includes('/guests/')) {
                console.log(`⚠️ System accepted 250+ char name - check database constraints`);
            }
        }
    }
    });
    
    test('TC-GUEST-013 | Cancel Add New Guest Modal', async ({ page }) => {
        const testName = 'Cancel Test User';
    const testEmail = DataGenerator.uniqueEmail('cancel');
    
    await page.goto('https://office-gate.balinexus.com/');
    await page.getByRole('link', { name: '👥 Guests' }).click();
    
    // Get current guest count
    const initialCount = await page.getByRole('row').filter({ hasNotText: 'GUEST INFO' }).count();
    
    // Open Add New Guest modal
    await page.getByRole('button', { name: '+ Add New Guest' }).click();
    
    // Fill in some fields
    await page.getByRole('textbox', { name: 'Guest Name*' }).fill(testName);
    await page.getByRole('textbox', { name: 'Email*' }).fill(testEmail);
    await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
    
    // Look for Cancel button (might be "Close", "X", or "Cancel")
    const cancelButton = page.getByRole('button', { name: 'Cancel' }).or(
        page.getByRole('button', { name: 'Close' })
    ).or(
        page.locator('button:has-text("✕")')
    ).first();
    
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();
    
    // Verify modal closed (form fields not visible)
    await expect(page.getByRole('textbox', { name: 'Guest Name*' })).not.toBeVisible();
    
    // Verify no new guest was added
    await page.getByRole('searchbox', { name: 'Search guests...' }).fill(testName);
    await page.waitForTimeout(500);
    
    const guestRow = page.getByRole('row').filter({ hasText: testName });
    await expect(guestRow).not.toBeVisible();
    
    // Get final guest count to ensure no addition
    const finalCount = await page.getByRole('row').filter({ hasNotText: 'GUEST INFO' }).count();
    expect(finalCount).toBe(initialCount);
    
    console.log(`✅ Cancel button working - no guest added`);
    });
    


    test('Cleanup Test Data', async ({ page }) => {

        //NICEEEEEE SCRIPT FOR CLEANING UP TEST DATA ON GUESTS
        await page.goto('https://office-gate.balinexus.com/guests');
        let deletedCount = 0;
        let maxIterations = 50; // Safety limit to prevent infinite loop
        let hasMoreGuests = true;

        while (hasMoreGuests && deletedCount < maxIterations) {
            await page.getByRole('searchbox', { name: 'Search guests...' }).fill('qa');
            await page.waitForTimeout(1000); // Wait for search results to load
            const rows = page.getByRole('row').filter({ hasText: /qa/i });
            const rowCount = await rows.count();

             console.log(`🔍 Found ${rowCount} guest(s) with 'qa' in name`);
            
            if (rowCount === 0) {
                console.log('✅ No more QA guests found. Cleanup complete!');
                hasMoreGuests = false;
                break;
            }

            const firstQARow = rows.first();
            
            // Try to get the guest name from the first cell
            const guestName = await firstQARow.getByRole('cell').first().textContent();
            console.log(`🗑️ Attempting to delete: ${guestName?.trim()}`);
            await firstQARow.getByRole('cell').first().click();

             page.once('dialog', async (dialog) => {
                console.log(`📝 Dialog message: ${dialog.message()}`);
                await dialog.accept(); // Click OK to confirm deletion
            });
            
            // Click Delete button
            await page.getByRole('button', { name: '🗑️ Delete' }).click();
            await page.waitForURL('**/guests');
            console.log(`✅ Guest deleted successfully`);
            
            deletedCount++;
            console.log(`📊 Total deleted so far: ${deletedCount}`);
            await page.waitForTimeout(500);

        }

        await page.getByRole('searchbox', { name: 'Search guests...' }).fill('qa');
        await page.waitForTimeout(1000);
        
        const remainingRows = await page.getByRole('row').filter({ hasText: /qa/i }).count();
        
        if (remainingRows === 0) {
            console.log(`🎉 Cleanup completed! Successfully deleted ${deletedCount} QA guest(s)`);
        } else {
            console.log(`⚠️ Warning: ${remainingRows} QA guest(s) still remain`);
        }
        
        // Assert that no QA guests remain
        await expect(page.getByRole('row').filter({ hasText: /qa/i })).toHaveCount(0);

            
            
        


    });



});

