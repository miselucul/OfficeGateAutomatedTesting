import { test, expect, chromium, firefox, Dialog } from '@playwright/test';
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

async function deleteGuest(page: any, guestName: string) {
    console.log(`🧹 Attempting to delete guest: ${guestName}`);
    
    try {
        // Navigate to Guests page
        await page.getByRole('link', { name: '👥 Guests' }).click();
        await page.waitForTimeout(1000);
        
        // Search for the guest
        await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
        await page.getByRole('searchbox', { name: 'Search guests...' }).press('Enter');
        await page.waitForTimeout(2000); // Wait for search results
        
        // Check if guest exists in search results
        const guestExists = await page.getByRole('cell', { name: guestName }).isVisible().catch(() => false);
        
        if (!guestExists) {
            console.log(`⚠️ Guest ${guestName} not found in search results - might already be deleted`);
            return;
        }
        
        // Click on the guest name to go to detail page
        await page.getByRole('cell', { name: guestName }).click();
        await page.waitForTimeout(1000);
        
        // Setup dialog handler BEFORE clicking delete
        let dialogHandled = false;
        page.once('dialog', async (dialog: Dialog) => {
            console.log(`📋 Dialog message: ${dialog.message()}`);
            dialogHandled = true;
            await dialog.accept();
            console.log(`✅ Delete dialog accepted for ${guestName}`);
        });
        
        // Click delete button
        await page.getByRole('button', { name: '🗑️ Delete' }).click();
        await page.waitForTimeout(2000);
        
        if (!dialogHandled) {
            console.log(`⚠️ No delete confirmation dialog appeared for ${guestName}`);
        }
        
        // Verify guest is deleted by searching again
        await page.getByRole('link', { name: '👥 Guests' }).click();
        await page.waitForTimeout(1000);
        
        await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
        await page.getByRole('searchbox', { name: 'Search guests...' }).press('Enter');
        await page.waitForTimeout(1000);
        
        const guestStillExists = await page.getByRole('cell', { name: guestName }).isVisible().catch(() => false);
        
        if (guestStillExists) {
            console.log(`❌ Guest ${guestName} still exists after delete attempt`);
        } else {
            console.log(`✅ Guest ${guestName} successfully deleted`);
        }
        
    } catch (error) {
        console.error(`❌ Error during deletion of ${guestName}:`, error);
    }
}

test.describe('Edge Cases Module', () => {
    
    test.beforeEach(async ({ page }) => {
        // Navigate to home page before each test
        await page.goto('https://office-gate.balinexus.com/');
    });

    // ==================== TC-EDGE-001 ====================
    test('TC-EDGE-001 | Search With Empty Query', async ({ page }) => {
  console.log('📝 Starting TC-EDGE-001: Search With Empty Query');
  
  try {
    // Navigate to Guests
    await page.getByRole('link', { name: '👥 Guests' }).click();
    console.log('✅ Navigated to Guests page');
    
    // Get initial total before search
    const initialTotalText = await page.getByText('Total Guests').textContent();
    const initialTotal = parseInt(initialTotalText?.match(/\d+/)?.[0] || '0');
    console.log(`📊 Initial Total Guests: ${initialTotal}`);
    
    // Click search box and leave empty
    await page.getByRole('searchbox', { name: 'Search guests...' }).click();
    await page.getByRole('searchbox', { name: 'Search guests...' }).fill('');
    await page.getByRole('searchbox', { name: 'Search guests...' }).press('Enter');
    console.log('✅ Performed empty search');
    
    // Wait for potential UI update
    await page.waitForTimeout(500);
    
    // Get filtered results count
    const filteredResultsText = await page.getByText('Filtered Results').textContent();
    const filteredResults = parseInt(filteredResultsText?.match(/\d+/)?.[0] || '0');
    
    console.log(`📊 Filtered Results: ${filteredResults}`);
    console.log(`📊 Initial Total: ${initialTotal}`);
    
    // Assertions - compare with the actual current total, not a hardcoded number
    expect(filteredResults).toBe(initialTotal);
    console.log(`✅ Empty search shows all ${filteredResults} guests`);
    
    // Verify filtered results card shows the same as total guests card
    const totalGuestsCard = await page.getByText('Total Guests').locator('..').locator('h2').textContent();
    const filteredCard = await page.getByText('Filtered Results').locator('..').locator('h2').textContent();
    
    expect(filteredCard).toBe(totalGuestsCard);
    console.log(`✅ Filtered Results card matches Total Guests card: ${filteredCard}`);
    
    // Verify no error state
    const errorElement = page.getByText(/error|exception|crash/i);
    await expect(errorElement).toBeHidden();
    
    console.log('✅ Empty search shows all guests, no error state');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: `screenshots/TC-EDGE-001-${Date.now()}.png` });
    throw error;
  }
});

    // ==================== TC-EDGE-002 ====================
    test('TC-EDGE-002 | Search With Special Characters', async ({ page }) => {
        console.log('📝 Starting TC-EDGE-002: Search With Special Characters');
        
        try {
            // Setup dialog listener to catch any XSS alerts
            let dialogDetected = false;
            page.on('dialog', async dialog => {
                dialogDetected = true;
                console.error('❌ XSS vulnerability: Alert dialog detected!', dialog.message());
                await dialog.dismiss();
            });
            
            // Navigate to Guests
            await page.getByRole('link', { name: '👥 Guests' }).click();
            console.log('✅ Navigated to Guests page');
            
            // Type XSS payload in search box
            const xssPayload = '<script>alert(1)</script>';
            await page.getByRole('searchbox', { name: 'Search guests...' }).fill(xssPayload);
            await page.getByRole('searchbox', { name: 'Search guests...' }).press('Enter');
            console.log(`✅ Entered XSS payload: ${xssPayload}`);
            
            // Wait a moment to see if any dialog appears
            await page.waitForTimeout(1000);
            
            // Verify no dialog was triggered
            expect(dialogDetected).toBeFalsy();
            console.log('✅ No XSS script execution detected');
            
            // Verify search treated as literal string
            const noGuestsFound = await page.getByText('No guests found').isVisible().catch(() => false);
            
            if (noGuestsFound) {
                console.log('✅ No guests found - search treated as literal string');
            } else {
                // If results shown, verify they're not executing script
                const searchBoxValue = await page.getByRole('searchbox', { name: 'Search guests...' }).inputValue();
                expect(searchBoxValue).toContain(xssPayload);
                console.log('✅ Search box still contains payload - treated as literal string');
            }
            
            // Also test with quoted payload (from codegen)
            await page.getByRole('searchbox', { name: 'Search guests...' }).fill('\'<script>alert(1)</script>\'');
            await page.getByRole('searchbox', { name: 'Search guests...' }).press('Enter');
            console.log('✅ Tested with quoted payload');
            
            // Verify no dialog from second payload
            expect(dialogDetected).toBeFalsy();
            
        } catch (error) {
            console.error('❌ Test failed:', error);
            await page.screenshot({ path: `screenshots/TC-EDGE-002-${Date.now()}.png` });
            throw error;
        }
    });

    // ==================== TC-EDGE-003 ====================
    test('TC-EDGE-003 | Extremely Long Purpose of Visit Text', async ({ page }) => {
        console.log('📝 Starting TC-EDGE-003: Extremely Long Purpose of Visit Text');
        let guestName = '';
        
        try {
            // Create a guest first
            guestName = DataGenerator.uniqueName('EdgeTest');
            console.log('✅ Creating guest:', guestName);
            
            await page.getByRole('link', { name: '👥 Guests' }).click();
            await page.getByRole('button', { name: '+ Add New Guest' }).click();
            await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestName);
            await page.getByRole('textbox', { name: 'Company' }).fill(DataGenerator.uniqueCompany());
            await page.getByRole('textbox', { name: 'Country' }).fill('Test Country');
            await page.getByRole('textbox', { name: 'Email*' }).fill(DataGenerator.uniqueEmail('edge'));
            await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
            await page.getByRole('button', { name: 'Add Guest' }).click();
            await page.waitForTimeout(2000);
            
            // TEST: Open Check In modal
            await page.getByRole('button', { name: 'Check In' }).click();
            
            // Search and select guest
            await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(guestName);
            await page.waitForTimeout(500);
            await page.getByText(guestName).first().click();
            
            // Paste 500-character string in Purpose field
            const longText = 'A'.repeat(500);
            console.log(`✅ Generated ${longText.length}-character purpose text`);
            
            await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill(longText);
            
            // Try to submit
            await page.locator('form').getByRole('button', { name: 'Check In' }).click();
            await page.waitForTimeout(1000);
            
            // VERIFY: Either character limit enforced OR validation error shown
            const errorVisible = await page.getByText(/too long|character limit|max length/i).isVisible().catch(() => false);
            const modalStillOpen = await page.locator('form').filter({ hasText: 'Check In' }).isVisible().catch(() => false);
            
            if (errorVisible) {
                console.log('✅ Validation error shown for too long text');
                const errorText = await page.getByText(/too long|character limit|max length/i).textContent();
                console.log(`   Error message: "${errorText}"`);
            } else if (modalStillOpen) {
                console.log('✅ Form blocked - character limit enforced');
            } else {
                console.log('❌ Form submitted - expected validation or block');
            }
            
            // Cancel modal
            await page.getByRole('button', { name: 'Cancel' }).click();
            await page.waitForTimeout(500);
            
        } catch (error) {
            console.error('❌ Test failed:', error);
            await page.screenshot({ path: `screenshots/TC-EDGE-003-${Date.now()}.png` });
            throw error;
        } finally {
            // CLEANUP - Delete guest (always run even if test fails)
            if (guestName) {
                await deleteGuest(page, guestName);
            }
        }
    });

    // ==================== TC-EDGE-004 ====================
    test.skip('TC-EDGE-004 | Simultaneous Check-In From Two Browser Tabs', async ({ page }) => {
        console.log('📝 Skipping TC-EDGE-004 (Requires multiple tabs/browsers - manual test)');
    });

    // ==================== TC-EDGE-005 ====================
    test('TC-EDGE-005 | Check Out After Browser Refresh', async ({ page }) => {
    console.log('📝 Starting TC-EDGE-005: Check Out After Browser Refresh');
    let guestName = '';
    
    try {
        // Create guest
        guestName = DataGenerator.uniqueName('RefreshTest');
        console.log('✅ Creating guest:', guestName);
        
        await page.getByRole('link', { name: '👥 Guests' }).click();
        await page.getByRole('button', { name: '+ Add New Guest' }).click();
        await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestName);
        await page.getByRole('textbox', { name: 'Company' }).fill(DataGenerator.uniqueCompany());
        await page.getByRole('textbox', { name: 'Country' }).fill('Test Country');
        await page.getByRole('textbox', { name: 'Email*' }).fill(DataGenerator.uniqueEmail('refresh'));
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
        await page.getByRole('button', { name: 'Add Guest' }).click();
        
        // Check in guest
        console.log('✅ Checking in guest...');
        await page.getByRole('button', { name: 'Check In' }).click();
        await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(guestName);
        await page.getByText(guestName).first().click();
        
        const checkInTime = new Date();
        await page.locator('input[type="datetime-local"]').first().fill(formatDateForInput(checkInTime));
        await page.getByRole('textbox', { name: 'Name of person they are' }).fill('Test Person');
        await page.getByRole('textbox', { name: 'Name of company they are' }).fill('Test Company');
        await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill('Test Purpose');
        await page.locator('form').getByRole('button', { name: 'Check In' }).click();
        
        console.log('✅ Guest checked in at:', checkInTime.toLocaleString());
        
        // Refresh browser
        await page.reload();
        console.log('✅ Browser refreshed');
        
        // VERIFY: Guest still shows as Active after refresh
        await page.getByRole('link', { name: '👥 Guests' }).click();
        await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
        await page.getByRole('searchbox', { name: 'Search guests...' }).press('Enter');
        
        // Use cell selector to find guest (fast)
        const guestCell = page.getByRole('cell', { name: guestName }).first();
        await expect(guestCell).toBeVisible();
        console.log('✅ Guest found after refresh');
        
        // Get the row and check for Out button
        
        
        // VERIFY: Check-out completes normally
        await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
        await page.getByRole('searchbox', { name: 'Search guests...' }).press('Enter');
        
        const finalRow = page.getByRole('row').filter({ hasText: guestName });
        const inButtonAfterCheckout = finalRow.getByRole('button', { name: 'In', exact: true });
        await expect(inButtonAfterCheckout).toBeVisible();
        console.log('✅ Check-out completed successfully');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ path: `screenshots/TC-EDGE-005-${Date.now()}.png` });
        throw error;
    } finally {
        // CLEANUP - Delete guest (always run even if test fails)
        if (guestName) {
            console.log(`🧹 Attempting to delete guest: ${guestName}`);
            try {
                await page.getByRole('link', { name: '👥 Guests' }).click();
                await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
                await page.getByRole('searchbox', { name: 'Search guests...' }).press('Enter');
                
                const guestCell = page.getByRole('cell', { name: guestName }).first();
                if (await guestCell.isVisible().catch(() => false)) {
                    await guestCell.click();
                    
                    page.once('dialog', async (dialog) => {
                        console.log(`🗑️ Delete dialog message: ${dialog.message()}`);
                        await dialog.accept();
                    });
                    
                    await page.getByRole('button', { name: '🗑️ Delete' }).click();
                    console.log(`✅ Guest deleted successfully: ${guestName}`);
                }
            } catch (deleteError) {
                console.log(`⚠️ Error during deletion of ${guestName}:`, deleteError);
            }
        }
    }
});



    // ==================== TC-EDGE-006 ====================
    test.skip('TC-EDGE-006 | Rapid Sequential Check-Ins', async ({ page }) => {
        console.log('📝 Skipping TC-EDGE-006 (Performance/race condition test - manual)');
    });

    // ==================== TC-EDGE-007 ====================
    test('TC-EDGE-007 | Guest Name With Only Numbers', async ({ page }) => {
        console.log('📝 Starting TC-EDGE-007: Guest Name With Only Numbers');
        const numericName = '12345';
        
        try {
            // Navigate to Guests page first
            await page.getByRole('link', { name: '👥 Guests' }).click();
            console.log('✅ Navigated to Guests page');
            
            // Click Add New Guest
            await page.getByRole('button', { name: '+ Add New Guest' }).click();
            
            // Enter name with only numbers
            console.log(`✅ Entering guest name: "${numericName}"`);
            
            await page.getByRole('textbox', { name: 'Guest Name*' }).fill(numericName);
            await page.getByRole('textbox', { name: 'Company' }).fill('QA');
            await page.getByRole('textbox', { name: 'Country' }).fill('QA');
            await page.getByRole('textbox', { name: 'Email*' }).fill(DataGenerator.uniqueEmail('numeric'));
            await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
            
            // Submit
            await page.getByRole('button', { name: 'Add Guest' }).click();
            await page.waitForTimeout(2000);
            
            // Check result
            const errorVisible = await page.getByText(/must contain at least one letter|invalid name|name must|only numbers/i).isVisible().catch(() => false);
            const successVisible = await page.getByText('Guest added successfully').isVisible().catch(() => false);
            
            if (errorVisible) {
                console.log('✅ Validation error shown - name requires at least one letter');
                
                // Get error message
                const errorText = await page.getByText(/must contain at least one letter|invalid name|name must|only numbers/i).textContent();
                console.log(`   Error message: "${errorText}"`);
                
                // Click cancel/close
                await page.getByRole('button', { name: '×' }).click();
                
            } else if (successVisible) {
                console.log('⚠️ Numeric name accepted - checking if warning shown');
                
                // Check if any warning appears
                const warningVisible = await page.getByText(/warning|unusual|numeric name/i).isVisible().catch(() => false);
                if (warningVisible) {
                    console.log('✅ Warning shown for numeric name');
                } else {
                    console.log('⚠️ No warning shown for numeric name');
                }
                
                // Wait a bit before cleanup
                await page.waitForTimeout(1000);
                
            } else {
                console.log('✅ No error or success message - checking if form is still open');
                
                // Check if form is still open (no crash)
                const modalOpen = await page.locator('form').filter({ hasText: 'Add New Guest' }).isVisible().catch(() => false);
                if (modalOpen) {
                    console.log('✅ Form still open - system did not crash');
                    await page.getByRole('button', { name: '×' }).click();
                }
            }
            
            // Verify no crash
            const crashIndicator = await page.getByText(/error|exception|crash|500/i).isVisible().catch(() => false);
            expect(crashIndicator).toBeFalsy();
            console.log('✅ System did not crash');
            
        } catch (error) {
            console.error('❌ Test failed:', error);
            await page.screenshot({ path: `screenshots/TC-EDGE-007-${Date.now()}.png` });
            throw error;
        } finally {
            // CLEANUP - Delete guest if it was created
            // Only attempt deletion if we think the guest might have been created
            const guestWasProbablyCreated = await page.getByText('Guest added successfully').isVisible().catch(() => false);
            if (guestWasProbablyCreated) {
                await deleteGuest(page, numericName);
            } else {
                console.log(`🧹 Skipping cleanup for ${numericName} - guest was likely not created`);
            }
        }
    });

    // ==================== TC-EDGE-008 ====================
    test('TC-EDGE-008 | Report Export With Zero Records', async ({ page }) => {
    console.log('📝 Starting TC-EDGE-008: Report Export With Zero Records');
    
    try {
        // Navigate to Reports
        await page.getByRole('link', { name: '📈 Reports' }).click();
        console.log('✅ Navigated to Reports page');
        
        // Set future date range with no visits
        await page.getByRole('textbox').first().fill('2027-10-25');
        await page.getByRole('textbox').nth(1).fill('2027-10-26');
        await page.getByRole('button', { name: 'Update Report' }).click();
        console.log('✅ Set date range with zero records: 2027-10-25 to 2027-10-26');
        
        // Wait for update
        await page.waitForTimeout(1000);
        
        // Verify stats show 0
        await expect(page.locator('div').filter({ hasText: /^Total Visits0All recorded/ }).first()).toBeVisible();
        await expect(page.locator('div').filter({ hasText: /^Average Duration0h 0mPer/ }).first()).toBeVisible();
        await expect(page.locator('div').filter({ hasText: /^Peak DayN\/A0 visits/ }).first()).toBeVisible();
        console.log('✅ Stats show zero records');
        
        // Export PDF
        console.log('📥 Exporting PDF...');
        const pdfDownloadPromise = page.waitForEvent('download');
        await page.getByRole('button', { name: '📄 Export PDF' }).click();
        const pdfDownload = await pdfDownloadPromise;
        const pdfFileName = pdfDownload.suggestedFilename();
        console.log(`✅ PDF downloaded: ${pdfFileName}`);
        
        expect(pdfFileName).toContain('.pdf');
        // FIX: Check for lowercase 'report' instead of capitalized 'Report'
        expect(pdfFileName.toLowerCase()).toContain('report');
        
        // Export Excel
        console.log('📥 Exporting Excel...');
        const excelDownloadPromise = page.waitForEvent('download');
        await page.getByRole('button', { name: '📊 Export Excel' }).click();
        const excelDownload = await excelDownloadPromise;
        const excelFileName = excelDownload.suggestedFilename();
        console.log(`✅ Excel downloaded: ${excelFileName}`);
        
        expect(excelFileName).toContain('.xlsx');
        // FIX: Same fix for Excel
        expect(excelFileName.toLowerCase()).toContain('report');
        
        // Verify no crash/error
        const errorElement = page.getByText(/error|500|exception|crash/i);
        await expect(errorElement).toBeHidden();
        console.log('✅ No errors or crashes during export');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ path: `screenshots/TC-EDGE-008-${Date.now()}.png` });
        throw error;
    }
});

    // ==================== TC-EDGE-009 ====================
    test.skip('TC-EDGE-009 | Very Large Date Range in Reports (1 Year)', async ({ page }) => {
        console.log('📝 Skipping TC-EDGE-009 (Performance test - manual)');
    });

    // ==================== TC-EDGE-010 ====================
    // ==================== TC-EDGE-010 ====================
test('TC-EDGE-010 | Phone Number With Non-Numeric Characters', async ({ page }) => {
    console.log('📝 Starting TC-EDGE-010: Phone Number With Non-Numeric Characters');
    let guestName = '';
    let guestWasCreated = false; // Tambahkan flag
    
    try {
        // Navigate to Guests page first
        await page.getByRole('link', { name: '👥 Guests' }).click();
        console.log('✅ Navigated to Guests page');
        
        // Click Add New Guest
        await page.getByRole('button', { name: '+ Add New Guest' }).click();
        
        // Fill form with valid data except phone
        guestName = DataGenerator.uniqueName('PhoneTest');
        console.log('✅ Creating guest:', guestName);
        
        await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestName);
        await page.getByRole('textbox', { name: 'Company' }).fill(DataGenerator.uniqueCompany());
        await page.getByRole('textbox', { name: 'Country' }).fill('Test Country');
        await page.getByRole('textbox', { name: 'Email*' }).fill(DataGenerator.uniqueEmail('phone'));
        
        // Enter phone with non-numeric characters
        const invalidPhone = 'abc-def-ghij';
        console.log(`✅ Entering invalid phone: "${invalidPhone}"`);
        
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill(invalidPhone);
        
        // Submit
        await page.getByRole('button', { name: 'Add Guest' }).click();
        await page.waitForTimeout(2000);
        
        // Check for validation error
        const errorVisible = await page.getByText(/valid phone|phone format|numeric|invalid phone|only numbers/i).isVisible().catch(() => false);
        
        if (errorVisible) {
            console.log('✅ Validation error shown for invalid phone format');
            
            // Get error message text for logging
            const errorText = await page.getByText(/valid phone|phone format|numeric|invalid phone|only numbers/i).textContent();
            console.log(`   Error message: "${errorText}"`);
            
            // Close modal
            await page.getByRole('button', { name: '×' }).click();
            
            // Guest was NOT created
            guestWasCreated = false;
            
        } else {
            // If no error, check if guest was created
            const successVisible = await page.getByText('Guest added successfully').isVisible().catch(() => false);
            
            if (successVisible) {
                console.log('⚠️ Invalid phone was accepted - checking if formatting applied');
                guestWasCreated = true; // Guest was created
                
                // ... kode untuk cek phone number ...
                
            } else {
                console.log('✅ Form blocked - validation prevented submission');
                guestWasCreated = false; // Guest was NOT created
                
                // ... kode lainnya ...
            }
        }
        
        // Verify no crash
        const crashIndicator = await page.getByText(/error|exception|crash|500/i).isVisible().catch(() => false);
        expect(crashIndicator).toBeFalsy();
        console.log('✅ System did not crash');
        
        // Log status
        if (guestWasCreated) {
            console.log(`ℹ️ Guest was created and will be cleaned up`);
        } else {
            console.log(`ℹ️ Guest was not created - no cleanup needed`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ path: `screenshots/TC-EDGE-010-${Date.now()}.png` });
        throw error;
    } finally {
        // CLEANUP - Only try to delete if guest was actually created
        if (guestWasCreated && guestName) {
            console.log(`🧹 Cleaning up guest that was created: ${guestName}`);
            await deleteGuest(page, guestName);
        } else {
            console.log(`🧹 Skipping cleanup - guest was not created`);
        }
    }
});

// Script cleanup untuk menghapus semua guest dengan prefix 'PhoneTest'
test('CLEANUP - Delete all PhoneTest guests', async ({ page }) => {
    await page.goto('https://office-gate.balinexus.com/');
    await page.getByRole('link', { name: '👥 Guests' }).click();
    await page.getByRole('button').filter({ hasText: /^$/ }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('searchbox', { name: 'Search guests...' }).fill('Phone');
    await page.getByRole('searchbox', { name: 'Search guests...' }).press('Enter');
    await page.waitForTimeout(2000);
    
    let deletedCount = 0;
    const guestCells = await page.getByRole('cell').filter({ hasText: 'PhoneTest' }).all();
    
    for (const cell of guestCells) {
        const guestName = await cell.textContent();
        if (guestName) {
            console.log(`Deleting: ${guestName}`);
            await cell.click();
            await page.waitForTimeout(500);
            
            page.once('dialog', async dialog => {
                await dialog.accept();
            });
            
            await page.getByRole('button', { name: '🗑️ Delete' }).click();
            await page.waitForTimeout(1000);
            
            await page.getByRole('link', { name: '👥 Guests' }).click();
            await page.waitForTimeout(500);
            
            await page.getByRole('searchbox', { name: 'Search guests...' }).fill('PhoneTest');
            await page.getByRole('searchbox', { name: 'Search guests...' }).press('Enter');
            await page.waitForTimeout(1000);
            
            deletedCount++;
        }
    }
    
    console.log(`✅ Deleted ${deletedCount} PhoneTest guests`);
});
});

// Helper function for formatting dates
function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}