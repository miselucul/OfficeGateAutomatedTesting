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
            
            // Click search box and leave empty
            await page.getByRole('searchbox', { name: 'Search guests...' }).click();
            await page.getByRole('searchbox', { name: 'Search guests...' }).fill('');
            await page.getByRole('searchbox', { name: 'Search guests...' }).press('Enter');
            console.log('✅ Performed empty search');
            
            // Verify all guests shown
            const totalGuestsText = await page.getByText('Total Guests').textContent();
            const filteredResultsText = await page.getByText('Filtered Results').textContent();
            
            console.log(`📊 Total Guests: ${totalGuestsText}`);
            console.log(`📊 Filtered Results: ${filteredResultsText}`);
            
            // Parse numbers
            const totalGuests = parseInt(totalGuestsText?.match(/\d+/)?.[0] || '0');
            const filteredResults = parseInt(filteredResultsText?.match(/\d+/)?.[0] || '0');
            
            // Assertions
            expect(filteredResults).toBe(totalGuests);
            expect(filteredResults).toBe(166); // From codegen: Total Guests166
            
            // Verify no error state
            const errorElement = page.getByText(/error|exception|crash/i);
            await expect(errorElement).toBeHidden();
            
            console.log(`✅ Empty search shows all ${filteredResults} guests, no error state`);
            
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
    
    try {
        // Create a guest first
        const guestName = DataGenerator.uniqueName('EdgeTest');
        console.log('✅ Creating guest:', guestName);
        
        await page.getByRole('button', { name: '+ Add New Guest' }).click();
        await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestName);
        await page.getByRole('textbox', { name: 'Company' }).fill(DataGenerator.uniqueCompany());
        await page.getByRole('textbox', { name: 'Country' }).fill('Test Country');
        await page.getByRole('textbox', { name: 'Email*' }).fill(DataGenerator.uniqueEmail('edge'));
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
        await page.getByRole('button', { name: 'Add Guest' }).click();
        
        // Open Check In modal
        await page.getByRole('button', { name: 'Check In' }).click();
        
        // Search and select guest
        await page.getByRole('searchbox', { name: 'Search by name or company...' }).fill(guestName);
        await page.getByText(guestName).first().click();
        
        // Generate 500-character string
        const longText = 'A'.repeat(500);
        console.log(`✅ Generated ${longText.length}-character purpose text`);
        
        // Fill Purpose field
        await page.getByRole('textbox', { name: 'e.g., Business Meeting,' }).fill(longText);
        
        // Try to submit
        await page.locator('form').getByRole('button', { name: 'Check In' }).click();
        
        // Check result
        const errorVisible = await page.getByText(/too long|character limit|max length/i).isVisible().catch(() => false);
        const modalStillOpen = await page.locator('form').filter({ hasText: 'Check In' }).isVisible().catch(() => false);
        
        if (errorVisible) {
            console.log('✅ Validation error shown for too long text');
            
            // Get error message
            const errorText = await page.getByText(/too long|character limit|max length/i).textContent();
            console.log(`   Error message: "${errorText}"`);
            
            // Cancel modal
            await page.getByRole('button', { name: 'Cancel' }).click();
            
        } else if (modalStillOpen) {
            console.log('✅ Form blocked - character limit enforced');
            await page.getByRole('button', { name: 'Cancel' }).click();
            
        } else {
            console.log('✅ Long text accepted - checking if truncated');
            
            // Check guest details to see if purpose was saved
            await page.getByRole('link', { name: '👥 Guests' }).click();
            await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
            await page.getByText(guestName).click();
            
            // Look for purpose in guest details - FIXED: Use locator instead of page.textContent()
            const pageContent = await page.locator('body').textContent();
            if (pageContent && pageContent.includes('A'.repeat(50))) { // Check if any long text exists
                console.log('⚠️ Long text was saved - checking length');
                
                // Try to find purpose field - adjust selector based on actual UI
                // Option 1: Look for Purpose label and get its sibling/parent
                const purposeLabel = page.locator('text=Purpose:');
                if (await purposeLabel.isVisible().catch(() => false)) {
                    const purposeContainer = purposeLabel.locator('..');
                    const purposeText = await purposeContainer.textContent();
                    
                    if (purposeText) {
                        const cleanPurpose = purposeText.replace('Purpose:', '').trim();
                        console.log(`   Purpose text length: ${cleanPurpose.length} characters`);
                        
                        if (cleanPurpose.length > 400) {
                            console.log(`✅ Full/almost full text saved (${cleanPurpose.length} chars)`);
                        } else if (cleanPurpose.length > 0) {
                            console.log(`⚠️ Text was truncated to ${cleanPurpose.length} characters`);
                        }
                    }
                } 
                // Option 2: Look for any element containing many As
                else {
                    const longTextElement = page.locator(`text=${'A'.repeat(50)}`).first();
                    if (await longTextElement.isVisible().catch(() => false)) {
                        const elementText = await longTextElement.textContent();
                        console.log(`✅ Found element with long text: ${elementText?.substring(0, 50)}...`);
                        console.log(`   Approximate length: ${elementText?.length} characters`);
                    }
                }
            } else {
                console.log('✅ Long text not found in guest details - may have been rejected');
            }
        }
        
        // Cleanup - delete guest
        await page.getByRole('link', { name: '👥 Guests' }).click();
        await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
        
        const guestExists = await page.getByText(guestName).isVisible().catch(() => false);
        if (guestExists) {
            await page.getByText(guestName).click();
            await page.getByRole('button', { name: '🗑️ Delete' }).click();
            
            page.once('dialog', dialog => {
                console.log('✅ Guest deleted');
                dialog.accept();
            });
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ path: `screenshots/TC-EDGE-003-${Date.now()}.png` });
        throw error;
    }
});

    // ==================== TC-EDGE-004 ====================
    test.skip('TC-EDGE-004 | Simultaneous Check-In From Two Browser Tabs', async ({ page }) => {
        console.log('📝 Skipping TC-EDGE-004 (Requires multiple tabs/browsers - manual test)');
    });

    // ==================== TC-EDGE-005 ====================
    test('TC-EDGE-005 | Check Out After Browser Refresh', async ({ page }) => {
        console.log('📝 Starting TC-EDGE-005: Check Out After Browser Refresh');
        
        try {
            // Create guest
            const guestName = DataGenerator.uniqueName('RefreshTest');
            console.log('✅ Creating guest:', guestName);
            
            await page.getByRole('button', { name: '+ Add New Guest' }).click();
            await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestName);
            await page.getByRole('textbox', { name: 'Company' }).fill(DataGenerator.uniqueCompany());
            await page.getByRole('textbox', { name: 'Country' }).fill('Test Country');
            await page.getByRole('textbox', { name: 'Email*' }).fill(DataGenerator.uniqueEmail('refresh'));
            await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
            await page.getByRole('button', { name: 'Add Guest' }).click();
            
            // Check in
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
            
            // Verify guest still shows as Active
            await page.getByRole('link', { name: '📊 Dashboard' }).click();
            
            // Wait for dashboard to load
            await page.waitForTimeout(1000);
            
            const guestActive = await page.getByText(guestName).isVisible().catch(() => false);
            expect(guestActive).toBeTruthy();
            console.log('✅ Guest still shows as Active after refresh');
            
            // Check out same guest
            await page.getByRole('button', { name: 'Out', exact: true }).first().click();
            await page.getByRole('button', { name: 'Check Out' }).click();
            
            const checkOutTime = new Date();
            await page.locator('input[type="datetime-local"]').fill(formatDateForInput(checkOutTime));
            await page.locator('form').getByRole('button', { name: 'Check Out' }).click();
            console.log('✅ Guest checked out at:', checkOutTime.toLocaleString());
            
            // Wait for checkout to complete
            await page.waitForTimeout(1000);
            
            // Verify checkout completed (guest no longer has Out button)
            const outButtonExists = await page.getByRole('button', { name: 'Out', exact: true }).isVisible().catch(() => false);
            expect(outButtonExists).toBeFalsy();
            console.log('✅ Checkout completed successfully');
            
            // Cleanup - delete guest
            await page.getByRole('link', { name: '👥 Guests' }).click();
            await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
            
            const guestExists = await page.getByText(guestName).isVisible().catch(() => false);
            if (guestExists) {
                await page.getByText(guestName).click();
                await page.getByRole('button', { name: '🗑️ Delete' }).click();
                
                page.once('dialog', dialog => {
                    console.log('✅ Guest deleted');
                    dialog.accept();
                });
            }
            
        } catch (error) {
            console.error('❌ Test failed:', error);
            await page.screenshot({ path: `screenshots/TC-EDGE-005-${Date.now()}.png` });
            throw error;
        }
    });

    // ==================== TC-EDGE-006 ====================
    test.skip('TC-EDGE-006 | Rapid Sequential Check-Ins', async ({ page }) => {
        console.log('📝 Skipping TC-EDGE-006 (Performance/race condition test - manual)');
    });

    // ==================== TC-EDGE-007 ====================
    test('TC-EDGE-007 | Guest Name With Only Numbers', async ({ page }) => {
        console.log('📝 Starting TC-EDGE-007: Guest Name With Only Numbers');
        
        try {
            // Click Add New Guest
            await page.getByRole('button', { name: '+ Add New Guest' }).click();
            
            // Enter name with only numbers
            const numericName = '12345';
            console.log(`✅ Entering guest name: "${numericName}"`);
            
            await page.getByRole('textbox', { name: 'Guest Name*' }).fill(numericName);
            await page.getByRole('textbox', { name: 'Company' }).fill('Test Company');
            await page.getByRole('textbox', { name: 'Country' }).fill('Test Country');
            await page.getByRole('textbox', { name: 'Email*' }).fill(DataGenerator.uniqueEmail('numeric'));
            await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
            
            // Submit
            await page.getByRole('button', { name: 'Add Guest' }).click();
            
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
                
                // Cleanup - delete this guest
                await page.getByRole('link', { name: '👥 Guests' }).click();
                await page.getByRole('searchbox', { name: 'Search guests...' }).fill(numericName);
                
                const guestExists = await page.getByText(numericName).isVisible().catch(() => false);
                if (guestExists) {
                    await page.getByText(numericName).click();
                    await page.getByRole('button', { name: '🗑️ Delete' }).click();
                    
                    page.once('dialog', dialog => {
                        console.log('✅ Numeric guest deleted');
                        dialog.accept();
                    });
                }
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
        }
    });

    // ==================== TC-EDGE-008 ====================
    test('TC-EDGE-008 | Report Export With Zero Records', async ({ page }) => {
        console.log('📝 Starting TC-EDGE-008: Report Export With Zero Records');
        
        try {
            // Navigate to Reports
            await page.getByRole('link', { name: '📈 Reports' }).click();
            console.log('✅ Navigated to Reports page');
            
            // Set future date range with no visits (from codegen)
            await page.getByRole('textbox').first().fill('2027-10-25');
            await page.getByRole('textbox').nth(1).fill('2027-10-26');
            await page.getByRole('button', { name: 'Update Report' }).click();
            console.log('✅ Set date range with zero records: 2027-10-25 to 2027-10-26');
            
            // Wait for update
            await page.waitForTimeout(1000);
            
            // Verify stats show 0 (from codegen)
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
            expect(pdfFileName).toContain('Report');
            
            // Export Excel
            console.log('📥 Exporting Excel...');
            const excelDownloadPromise = page.waitForEvent('download');
            await page.getByRole('button', { name: '📊 Export Excel' }).click();
            const excelDownload = await excelDownloadPromise;
            const excelFileName = excelDownload.suggestedFilename();
            console.log(`✅ Excel downloaded: ${excelFileName}`);
            
            expect(excelFileName).toContain('.xlsx');
            expect(excelFileName).toContain('Report');
            
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
    test('TC-EDGE-010 | Phone Number With Non-Numeric Characters', async ({ page }) => {
    console.log('📝 Starting TC-EDGE-010: Phone Number With Non-Numeric Characters');
    
    try {
        // Click Add New Guest
        await page.getByRole('button', { name: '+ Add New Guest' }).click();
        
        // Fill form with valid data except phone
        const guestName = DataGenerator.uniqueName('PhoneTest');
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
        
        // Check for validation error
        const errorVisible = await page.getByText(/valid phone|phone format|numeric|invalid phone|only numbers/i).isVisible().catch(() => false);
        
        if (errorVisible) {
            console.log('✅ Validation error shown for invalid phone format');
            
            // Get error message text for logging
            const errorText = await page.getByText(/valid phone|phone format|numeric|invalid phone|only numbers/i).textContent();
            console.log(`   Error message: "${errorText}"`);
            
            // Close modal
            await page.getByRole('button', { name: '×' }).click();
            
        } else {
            // If no error, check if guest was created
            const successVisible = await page.getByText('Guest added successfully').isVisible().catch(() => false);
            
            if (successVisible) {
                console.log('⚠️ Invalid phone was accepted - checking if formatting applied');
                
                // Navigate to guests and check saved phone
                await page.getByRole('link', { name: '👥 Guests' }).click();
                await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestName);
                await page.getByText(guestName).click();
                
                // Look for phone number in guest details - FIXED: Use locator to find phone info
                // Method 1: Look for Phone label and get its content
                const phoneLabel = page.locator('text=Phone:');
                if (await phoneLabel.isVisible().catch(() => false)) {
                    const phoneContainer = phoneLabel.locator('..');
                    const phoneText = await phoneContainer.textContent();
                    console.log(`   Phone field content: "${phoneText}"`);
                    
                    if (phoneText) {
                        // Extract phone number (remove label)
                        const phoneNumber = phoneText.replace('Phone:', '').trim();
                        
                        // Check if phone contains only digits and maybe +, space, dash
                        const hasOnlyValidChars = /^[\d\s\+\-\(\)]+$/.test(phoneNumber);
                        if (hasOnlyValidChars) {
                            console.log('✅ Phone number was formatted to contain only valid characters');
                        } else {
                            console.log(`⚠️ Phone still contains invalid chars: "${phoneNumber}"`);
                        }
                    }
                } 
                // Method 2: Look for any text containing phone-like pattern
                else {
                    const bodyContent = await page.locator('body').textContent();
                    const phoneMatch = bodyContent?.match(/(\+?[\d\s\-\(\)]{8,})/);
                    
                    if (phoneMatch) {
                        console.log(`   Found phone-like text: "${phoneMatch[0]}"`);
                        
                        // Check if it contains only valid characters
                        const hasOnlyValidChars = /^[\d\s\+\-\(\)]+$/.test(phoneMatch[0]);
                        if (hasOnlyValidChars) {
                            console.log('✅ Phone number appears to be properly formatted');
                        }
                    }
                }
                
                // Cleanup - delete guest
                await page.getByRole('button', { name: '🗑️ Delete' }).click();
                
                page.once('dialog', dialog => {
                    console.log('✅ Guest deleted');
                    dialog.accept();
                });
                
            } else {
                console.log('✅ Form blocked - validation prevented submission');
                
                // Check if form is still open
                const modalOpen = await page.locator('form').filter({ hasText: 'Add New Guest' }).isVisible().catch(() => false);
                if (modalOpen) {
                    console.log('✅ Form still open with validation pending');
                    
                    // Look for any inline validation message
                    const validationMsg = await page.getByText(/invalid|valid|format/i).first().isVisible().catch(() => false);
                    if (validationMsg) {
                        const msgText = await page.getByText(/invalid|valid|format/i).first().textContent();
                        console.log(`   Validation message: "${msgText}"`);
                    }
                    
                    await page.getByRole('button', { name: '×' }).click();
                }
            }
        }
        
        // Verify no crash
        const crashIndicator = await page.getByText(/error|exception|crash|500/i).isVisible().catch(() => false);
        expect(crashIndicator).toBeFalsy();
        console.log('✅ System did not crash');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ path: `screenshots/TC-EDGE-010-${Date.now()}.png` });
        throw error;
    }
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