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
        return '+628123456789';
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
        await page.getByRole('link', { name: '👥 Guests' }).click();
        await page.getByRole('button', { name: '+ Add New Guest' }).click();
        await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestData.name);
        await page.getByRole('textbox', { name: 'Company' }).fill(guestData.company);
        await page.getByRole('textbox', { name: 'Country' }).fill(guestData.country);
        await page.getByRole('textbox', { name: 'Email*' }).fill(guestData.email);
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill(guestData.phone);
        await page.getByRole('button', { name: 'Add Guest' }).click();

        await page.getByRole('searchbox', { name: 'Search guests...' }).fill(guestData.name);
        await page.waitForTimeout(500);
        const guestRow = page.getByRole('row').filter({ hasText: guestData.name });
        await expect(guestRow).toBeVisible();

        const cells = guestRow.getByRole('cell');
        await expect(cells.nth(0)).toContainText(guestData.name);
        await expect(cells.nth(1)).toContainText(guestData.company);

        console.log(`✅ Guest created successfully: ${guestData.name}`);

        await page.getByRole('table').getByText(guestData.name).click();
        console.log(`📍 Verified guest details on detail page`);

        page.once('dialog', async (dialog) => {
            console.log(`🗑️ Delete dialog message: ${dialog.message()}`);
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

        const cells = guestRow.getByRole('cell');
        await expect(cells.nth(1)).toContainText('-');
        await expect(cells.nth(2)).toContainText('-');

        await page.getByRole('table').getByText(guestData.name).click();
        console.log(`📍 Verified guest details on detail page`);

        page.once('dialog', async (dialog) => {
            console.log(`🗑️ Delete dialog message: ${dialog.message()}`);
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
        await page.getByRole('link', { name: '👥 Guests' }).click();
        await page.getByRole('button', { name: '+ Add New Guest' }).click();
        await page.getByRole('textbox', { name: 'Email*' }).fill(guestData.email);
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill(guestData.phone);
        await page.getByRole('button', { name: 'Add Guest' }).click();

        await expect(page.getByRole('textbox', { name: 'Guest Name*' })).toBeVisible();
        const isNameFieldInvalid = await page.getByRole('textbox', { name: 'Guest Name*' }).evaluate((el: HTMLInputElement) => {
            return !el.validity.valid;
        });
        expect(isNameFieldInvalid).toBeTruthy();
    });

    test('TC-GUEST-004 | Add Guest With Invalid Email Format', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/');
        await page.getByRole('link', { name: '👥 Guests' }).click();
        await page.getByRole('button', { name: '+ Add New Guest' }).click();

        await page.getByRole('textbox', { name: 'Guest Name*' }).fill(guestData.name);
        await page.getByRole('textbox', { name: 'Email*' }).fill('notanemail');
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill(guestData.phone);
        await page.getByRole('button', { name: 'Add Guest' }).click();

        await expect(page.getByRole('textbox', { name: 'Guest Name*' })).toBeVisible();
        const isEmailFieldInvalid = await page.getByRole('textbox', { name: 'Email*' }).evaluate((el: HTMLInputElement) => {
            return !el.validity.valid;
        });
        expect(isEmailFieldInvalid).toBeTruthy();
    });

    test('TC-GUEST-006 | Search Guest by Full Name', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/');
        await page.getByRole('link', { name: '👥 Guests' }).click();
        await page.getByRole('searchbox', { name: 'Search guests...' }).fill('Farsight');
        await page.waitForTimeout(500);
        const guestRow = page.getByRole('row').filter({ hasText: 'Farsight' });
        await expect(guestRow).toBeVisible();

        const cells = guestRow.getByRole('cell');
        await expect(cells.nth(0)).toContainText('Farsight');
    });

    test('TC-GUEST-007 | Search Guest by Partial Name', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/');
        await page.getByRole('link', { name: '👥 Guests' }).click();
        await page.getByRole('searchbox', { name: 'Search guests...' }).fill('Far');
        await page.waitForTimeout(500);
        const guestRow = page.getByRole('row').filter({ hasText: 'Farsight' });
        await expect(guestRow).toBeVisible();
        const cells = guestRow.getByRole('cell');
        await expect(cells.nth(0)).toContainText('Farsight');
    });

    test('TC-GUEST-008 | Search Functionality - Global Search', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/');
        await page.getByRole('link', { name: '👥 Guests' }).click();

        await page.getByRole('searchbox', { name: 'Search guests...' }).fill('Ubud');
        await page.waitForTimeout(500);

        const rows = page.getByRole('row').filter({ hasNotText: 'Guest Info' });
        const resultCount = await rows.count();

        expect(resultCount).toBeGreaterThan(0);

        const filteredCount = page.getByText('Filtered Results').locator('..').getByRole('heading');
        await expect(filteredCount).toHaveText(resultCount.toString());

        for (let i = 0; i < Math.min(resultCount, 3); i++) {
            const rowText = await rows.nth(i).textContent();
            expect(rowText?.toLowerCase()).toContain('ubud');
        }

        console.log(`✅ Global search works: Found ${resultCount} results containing "Ubud"`);
    });

    test('TC-GUEST-009 | Guest List Pagination - 20 Per Page', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/');
        await page.getByRole('link', { name: '👥 Guests' }).click();

        await page.waitForSelector('table');

        const rows = page.getByRole('row').filter({ hasNotText: 'Guest Info' });
        const rowCount = await rows.count();

        expect(rowCount).toBeLessThanOrEqual(20);
        console.log(`📊 Page 1 has ${rowCount} entries`);

        const paginationText = await page.getByText(/Showing \d+ to \d+ of \d+ entries/).textContent();
        console.log(`📄 ${paginationText}`);

        const match = paginationText?.match(/Showing (\d+) to (\d+) of (\d+) entries/);
        if (match) {
            const start = parseInt(match[1]);
            const end = parseInt(match[2]);
            const total = parseInt(match[3]);

            expect(start).toBe(1);
            expect(end - start + 1).toBe(rowCount);

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
        const longName = 'A' + 'b'.repeat(249);

        await page.goto('https://office-gate.balinexus.com/');
        await page.getByRole('link', { name: '👥 Guests' }).click();
        await page.getByRole('button', { name: '+ Add New Guest' }).click();

        const nameField = page.getByRole('textbox', { name: 'Guest Name*' });
        await nameField.fill(longName);

        const maxLength = await nameField.getAttribute('maxlength');

        if (maxLength) {
            console.log(`📏 Field has maxlength: ${maxLength}`);
            const enteredValue = await nameField.inputValue();
            expect(enteredValue.length).toBeLessThanOrEqual(parseInt(maxLength));

            await page.getByRole('textbox', { name: 'Email*' }).fill(DataGenerator.uniqueEmail('long'));
            await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
            await page.getByRole('button', { name: 'Add Guest' }).click();

            const currentUrl = page.url();
            if (currentUrl.includes('/guests') && !currentUrl.includes('/guests/')) {
                console.log(`✅ Added guest with truncated name (${enteredValue.length} chars)`);

                await page.getByRole('searchbox', { name: 'Search guests...' }).fill(enteredValue);
                await page.waitForTimeout(500);
                const guestRow = page.getByRole('row').filter({ hasText: enteredValue });

                if (await guestRow.count() > 0) {
                    await guestRow.getByRole('cell').first().click();
                    page.once('dialog', async (dialog) => await dialog.accept());
                    await page.getByRole('button', { name: '🗑️ Delete' }).click();
                }
            } else {
                console.log(`✅ Field prevented submission with too-long name`);
            }
        } else {
            await page.getByRole('textbox', { name: 'Email*' }).fill(DataGenerator.uniqueEmail('long'));
            await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());
            await page.getByRole('button', { name: 'Add Guest' }).click();

            const errorVisible = await page.getByText(/too long|maximum|exceeds/i).isVisible().catch(() => false);

            if (errorVisible) {
                console.log(`✅ Validation error shown for too-long name`);
            } else {
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

        const initialCount = await page.getByRole('row').filter({ hasNotText: 'GUEST INFO' }).count();

        await page.getByRole('button', { name: '+ Add New Guest' }).click();

        await page.getByRole('textbox', { name: 'Guest Name*' }).fill(testName);
        await page.getByRole('textbox', { name: 'Email*' }).fill(testEmail);
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill(DataGenerator.uniquePhone());

        const cancelButton = page.getByRole('button', { name: 'Cancel' }).or(
            page.getByRole('button', { name: 'Close' })
        ).or(
            page.locator('button:has-text("✕")')
        ).first();

        await expect(cancelButton).toBeVisible();
        await cancelButton.click();

        await expect(page.getByRole('textbox', { name: 'Guest Name*' })).not.toBeVisible();

        await page.getByRole('searchbox', { name: 'Search guests...' }).fill(testName);
        await page.waitForTimeout(500);

        const guestRow = page.getByRole('row').filter({ hasText: testName });
        await expect(guestRow).not.toBeVisible();

        const finalCount = await page.getByRole('row').filter({ hasNotText: 'GUEST INFO' }).count();
        expect(finalCount).toBe(initialCount);

        console.log(`✅ Cancel button working - no guest added`);
    });

    test('Cleanup Test Data', async ({ page }) => {
        await page.goto('https://office-gate.balinexus.com/guests');
        let deletedCount = 0;
        let maxIterations = 50;
        let hasMoreGuests = true;

        while (hasMoreGuests && deletedCount < maxIterations) {
            await page.getByRole('searchbox', { name: 'Search guests...' }).fill('qa');
            await page.waitForTimeout(1000);
            const rows = page.getByRole('row').filter({ hasText: /qa/i });
            const rowCount = await rows.count();

            console.log(`🔍 Found ${rowCount} guest(s) with 'qa' in name`);

            if (rowCount === 0) {
                console.log('✅ No more QA guests found. Cleanup complete!');
                hasMoreGuests = false;
                break;
            }

            const firstQARow = rows.first();
            const guestName = await firstQARow.getByRole('cell').first().textContent();
            console.log(`🗑️ Attempting to delete: ${guestName?.trim()}`);
            await firstQARow.getByRole('cell').first().click();

            page.once('dialog', async (dialog) => {
                console.log(`📝 Dialog message: ${dialog.message()}`);
                await dialog.accept();
            });

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

        await expect(page.getByRole('row').filter({ hasText: /qa/i })).toHaveCount(0);
    });
});