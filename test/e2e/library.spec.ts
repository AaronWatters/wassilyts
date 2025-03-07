
import { test, expect } from '@playwright/test';

test('Library function works', async ({ page }) => {
    const consoleMessages: string[] = [];
  
    // Capture console logs
    page.on('console', (msg) => {
        console.log(msg.text());
        consoleMessages.push(msg.text());
    });
    await page.goto('http://localhost:3000/test/e2e/index.html');
    await expect(page.locator('h1')).toHaveText( "wassilyjs Library Demo");
    // Wait for any async logs to appear
    await page.waitForTimeout(100); 

    // Assert that the expected console message is present
    expect(consoleMessages).toContain("The name of the library is: wassilyjs");
});
