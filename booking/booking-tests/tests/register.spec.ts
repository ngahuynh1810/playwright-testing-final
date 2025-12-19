import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import * as dotenv from 'dotenv';
import { register } from 'module';
dotenv.config();


test('Đăng ký với các trường bắt buộc trống', async ({ page }) => {
  const registerPage = new RegisterPage(page);
  await registerPage.goto();
  await registerPage.openRegisterForm();
  await registerPage.clickRegister();

  const errorMessages = page.locator('.ant-form-item-explain-error');
  const count = await errorMessages.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    await expect(errorMessages.nth(i))
  .toContainText('Vui lòng');}

});


test('Đăng ký email sai định dạng', async ({ page }) => {
  const registerPage = new RegisterPage(page);
  await registerPage.goto();
  await registerPage.openRegisterForm();

  await page.locator('input[name="name"]').fill('user');
  await page.locator('input[name="email"]').fill('email_sai_dinh_dang');
  await page.locator('input[name="password"]').fill('123');
  await page.locator('input[name="phone"]').fill('0387309425');
  

  await registerPage.clickRegister();

  const emailError = page.locator(
    '.ant-form-item-explain-error:has-text("Vui lòng nhập đúng định dạng email")'
  );
  await expect(emailError).toBeVisible({ timeout: 5000 });
});


test('Đăng ký thất bại khi email đã tồn tại', async ({ page }) => {
  const registerPage = new RegisterPage(page);
  await registerPage.goto();
  await registerPage.openRegisterForm();

  await page.locator('input[name="name"]').fill('username');
  await page.locator('input[name="email"]').fill('test@example.com');
  await page.locator('input[name="password"]').fill('Password'!);
  await page.locator('input[name="phone"]').fill('0387309425');
  await registerPage.enterBirthday();
  await registerPage.selectGender();
  await registerPage.clickRegister();

  const duplicateError = page
    .locator('.ant-message-error, .ant-message-notice-content, .ant-form-item-explain-error')
    .filter({ hasText: 'Email đã tồn tại' });

  await expect(duplicateError.first()).toBeVisible({ timeout: 7000 });
});

test('đăng ký thất bại với số điện thoại sai định dạng',async({page}) => {
  const registerPage = new RegisterPage(page);
  await registerPage.goto();
  await registerPage.openRegisterForm();
  await page.locator('input[name="name"]').fill('username');
  await page.locator('input[name="email"]').fill('test@example.com');
  await page.locator('input[name="password"]').fill('Password'!);
  await page.locator('input[name="phone"]').fill('0234445');
  await registerPage.clickRegister()
  const duplicateError = page
    .locator('.ant-message-error, .ant-message-notice-content, .ant-form-item-explain-error')
    .filter({ hasText: 'Số điện thoại không hợp lệ' });

  await expect(duplicateError.first()).toBeVisible({ timeout: 7000 });

});
test('đăng kí thành công với các trường hợp lệ',async({page}) => {
  const registerPage = new RegisterPage(page);
  await registerPage.goto();
  await registerPage.openRegisterForm();
  await page.locator('input[name="name"]').fill('username');
  await page.locator('input[name="email"]').fill('tytest@example.com');
  await page.locator('input[name="password"]').fill('Password'!);
  await page.locator('input[name="phone"]').fill('0387309425');
  await registerPage.enterBirthday();
  await registerPage.selectGender();
  await registerPage.clickRegister();

  const duplicateError = page
    .locator('.ant-message-error, .ant-message-notice-content, .ant-form-item-explain-error')
    .filter({ hasText: 'Đăng ký thành công' });

  await expect(duplicateError.first()).toBeVisible({ timeout: 7000 });

});