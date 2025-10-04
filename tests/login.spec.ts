import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login flow demo4.cybersoft', () => {
  test('Đăng nhập thành công với thông tin từ .env', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Mở trang chủ
    await loginPage.goto();

    // Thực hiện đăng nhập
    await loginPage.login();

    // Kiểm tra avatar người dùng hiển thị sau khi login thành công 
    const avatar = page.locator('img.h-10[src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png"]');
    await expect(avatar).toBeVisible();

  });
});
