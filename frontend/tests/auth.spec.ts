import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect to login page', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    
    // Should show login form
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
  });

  test('should show SyllabusSense branding', async ({ page }) => {
    await page.goto('/login');
    
    // Should show logo and title
    await expect(page.getByText('SyllabusSense')).toBeVisible();
    await expect(page.getByText('Intelligent syllabus management for educators')).toBeVisible();
  });

  test('should have accessible form elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check for proper ARIA labels and roles
    const googleButton = page.getByRole('button', { name: 'Continue with Google' });
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();
  });
});
