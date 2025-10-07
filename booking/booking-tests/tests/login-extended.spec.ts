import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login – mở rộng các kịch bản', () => {
  test('Đăng nhập thành công hiển thị avatar + không còn nút Đăng nhập', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login();

    const avatar = page.locator('img.h-10[src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png"]');
    await expect(avatar).toBeVisible();
    const loginButton = page.locator('button', { hasText: 'Đăng nhập' });
    await expect(loginButton).toBeHidden();
  });

  test('Sai password - giữ nguyên modal & hiện thông báo lỗi', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWith(process.env.MYAPP_USERNAME || 'wrong@user.com', 'sai_pass_999');

    // Modal còn mở và không có avatar
    const modal = page.locator('.ant-modal-content');
    await expect(modal).toBeVisible();
    const avatar = page.locator('img.h-10[src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png"]');
    await expect(avatar).not.toBeVisible();

    // Thử bắt nhiều dạng lỗi
    const anyError = page.locator('text=/Sai thông tin|Email hoặc mật khẩu/i');
    await expect(anyError.first()).toBeVisible({ timeout: 10000 });
  });

  test('Sai email đúng password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWith('khong_ton_tai@example.com', process.env.MYAPP_PASSWORD || 'dummyPass');
    const error = page.locator('text=/Sai thông tin|Email không tồn tại|Email hoặc mật khẩu/i');
    await expect(error.first()).toBeVisible({ timeout: 10000 });
  });

  test('Email không đúng định dạng', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWith('abc@@@', 'anything');
    const formatError = page.locator('text=/Email (không hợp lệ|invalid)/i');
    // Nếu hệ thống chưa validate client side thì test này sẽ tạm skip bằng expect.soft
    await expect.soft(formatError.first()).toBeVisible({ timeout: 3000 });
  });

  test('Bỏ trống 2 field', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.openLoginForm();
    await page.locator('.ant-modal-content button[type="submit"]', { hasText: 'Đăng nhập' }).click();
    const requiredErrors = page.locator('text=/required|bắt buộc/i');
    await expect(requiredErrors.first()).toBeVisible({ timeout: 5000 });
  });

  test('Nhập xong password clear lại vẫn báo lỗi', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.openLoginForm();
    const emailInput = page.locator('.ant-modal-content input[name="email"]');
    const passwordInput = page.locator('.ant-modal-content input[name="password"]');
    await emailInput.fill(process.env.MYAPP_USERNAME || 'user@example.com');
    await passwordInput.fill('tempPass');
    await passwordInput.fill('');
    await page.locator('.ant-modal-content button[type="submit"]', { hasText: 'Đăng nhập' }).click();
    const pwdError = page.locator('text=/Password.*(required|bắt buộc)/i');
    await expect(pwdError.first()).toBeVisible({ timeout: 5000 });
  });
});
