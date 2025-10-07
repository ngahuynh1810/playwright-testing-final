import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login negative cases', () => {
  test('Đăng nhập thất bại với sai mật khẩu', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.openLoginForm();

    // Điền user đúng nhưng password sai
    const emailInput = page.locator('.ant-modal-content input[name="email"]');
    const passwordInput = page.locator('.ant-modal-content input[name="password"]');
    await emailInput.fill(process.env.MYAPP_USERNAME || '');
    await passwordInput.fill('sai_mat_khau_123');
    await page.locator('.ant-modal-content button[type="submit"]', { hasText: 'Đăng nhập' }).click();

    // Thông báo lỗi (selector tùy UI thực tế)
    const errorToast = page.locator('text=Sai thông tin đăng nhập');
    await expect(errorToast).toBeVisible({ timeout: 10000 });
  });

  test('Không cho đăng nhập khi để trống form', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.openLoginForm();

    // Submit ngay không điền gì
    await page.locator('.ant-modal-content button[type="submit"]', { hasText: 'Đăng nhập' }).click();

    // Validate hiển thị lỗi required (tùy UI)
    const emailError = page.locator('text=Email is required');
    const passwordError = page.locator('text=Password is required');
    await expect(emailError).toBeVisible({ timeout: 5000 });
    await expect(passwordError).toBeVisible({ timeout: 5000 });
  });
});
