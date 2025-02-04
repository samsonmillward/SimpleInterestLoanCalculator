// @ts-check
import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
    // The default quasar page
    await page.goto('http://localhost:9000/#/');
});

test('Test that page has title', async ({ page }) => {
    await expect(page).toHaveTitle(/Samson - Oneiro Task/);
});

test('Test that data can be entered and calculate button returns a table', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Start date' }).fill('2024-01-01');
    await page.getByRole('textbox', { name: 'End date' }).fill('2024-01-30');
    await page.getByRole('spinbutton', { name: 'Loan Amount' }).fill('1000');
    await page.locator('label:nth-child(5) > .q-field__inner > .q-field__control > .q-field__control-container > .q-field__native').click();
    await page.getByText('GBP').click();
    await page.getByRole('spinbutton', { name: 'Base interest rate input' }).fill('1');
    await page.getByRole('spinbutton', { name: 'Margin rate input' }).fill('1');
    await page.getByRole('button', { name: 'Calculate' }).click();
    await page.locator('.container-output').click();
    await expect(page.locator('.container-output')).toBeVisible();
});

test('Test that negative loan value returns an error', async ({ page }) => {
    await page.getByRole('spinbutton', { name: 'Loan Amount' }).fill('-0');
    await expect(page.getByText('error')).toBeVisible();
});

test('Test calculate button is disabled when inputs are empty', async ({ page }) => {
    const locator = page.getByRole('button', { name: 'Calculate' });
    await expect(locator).toBeDisabled();
});