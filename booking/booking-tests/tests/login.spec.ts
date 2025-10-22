import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login flow demo4.cybersoft', () => {
  test('Đăng nhập thành công với thông tin từ .env', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Mở trang chủ
    await loginPage.goto();

    // Thực hiện đăng nhập
    await loginPage.login();
    // verify login thành công
    const successMsg = page.getByText("Đăng nhập thành công", { exact: true });
    await expect(successMsg).toBeVisible({ timeout: 10000 });
    console.log('✅ Test passed: Đăng nhập thành công với thông tin từ .env');

  });
  test('Đăng nhập thất bại với mật khẩu sai', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.openLoginForm();

    await loginPage.enterUsername();

    // Ghi đè password sai 
    await loginPage.enterPassword("wrong-pass");
    await loginPage.clickLogin();

    // Kiểm tra thông báo lỗi
    const errorMsg = page.getByText(/Email hoặc mật khẩu không đúng /i);
    await expect(errorMsg).toBeVisible({ timeout: 10000 });
    console.log('✅ Test passed: Đăng nhập thất bại với mật khẩu sai');
  });
  test('Không thể đăng nhập với email sai định dạng', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.openLoginForm();

    await loginPage.enterUsername("invalid-email");
    await loginPage.enterPassword();
    await loginPage.clickLogin();

    const errorMsg = page.getByText(/Vui lòng nhập đúng định dạng email/i);
    await expect(errorMsg).toBeVisible({ timeout: 10000 });
    console.log('✅ Test passed: Không thể đăng nhập với email sai định dạng');
  });
});
