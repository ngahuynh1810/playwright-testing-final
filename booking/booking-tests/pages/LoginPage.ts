import { expect, Page } from '@playwright/test';
import { BASE_URL, USERNAME, PASSWORD } from "../utils/const";

export class LoginPage {
  readonly page: Page;
  readonly username: string;
  readonly password: string;
  readonly baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    // Lấy username và password từ biến môi trường .env
    this.username = USERNAME || '';
    this.password = PASSWORD || '';
    // URL trang chủ mặc định, có thể thay đổi nếu cần
    this.baseUrl = BASE_URL || 'https://demo4.cybersoft.edu.vn/';
  }

  // Hàm mở trang chủ (địa chỉ baseUrl)
  async goto() {
    await this.page.goto(this.baseUrl);
  }

  // Mở menu người dùng bằng cách click vào avatar ở góc phải trên (selector dựa vào src ảnh)
  async openUserMenu() {
    const avatar = this.page.locator('img.h-10[src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png"]');
    await expect(avatar).toBeVisible({ timeout: 20000 });
    await avatar.click();
    // const button = this.page.locator('#user-menu-button');
    // await expect(button).toBeVisible();
    // await button.click();
  }

  // Mở form đăng nhập bằng cách click nút "Đăng nhập" trong menu
  async openLoginForm() {
    await this.openUserMenu();

    // Tìm nút Đăng nhập và click
    const loginBtn = this.page.locator('button', { hasText: 'Đăng nhập' });
    await expect(loginBtn).toBeVisible({ timeout: 10000 });
    await loginBtn.click();

    // Đợi modal đăng nhập hiển thị
    const modal = this.page.locator('.ant-modal-content');
    await expect(modal).toBeVisible({ timeout: 10000 });
  }

  // Nhập username vào ô email trong form login
  async enterUsername() {
    const emailInput = this.page.locator('.ant-modal-content input[name="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    console.log("dien user name nè **** ", USERNAME)
    await emailInput.fill(USERNAME);
  }

  // Nhập password vào ô password trong form login
  async enterPassword() {
    const passwordInput = this.page.locator('.ant-modal-content input[name="password"]');
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await passwordInput.fill(PASSWORD);
  }

  // Click nút đăng nhập trong modal
  async clickLogin() {
    const loginBtn = this.page.locator('.ant-modal-content button[type="submit"]', { hasText: 'Đăng nhập' });
    await expect(loginBtn).toBeVisible({ timeout: 10000 });
    await this.page.locator('.ant-modal-content button[type="submit"]', { hasText: 'Đăng nhập' }).click();
  }

  // Quy trình đăng nhập đầy đủ: mở form, nhập username, password, click đăng nhập
  async login() {
    await this.openLoginForm();
    await this.enterUsername();
    await this.enterPassword();
    await this.clickLogin();
    const successMsg = this.page.getByText("Đăng nhập thành công", { exact: true });
    await expect(successMsg).toBeVisible({ timeout: 10000 });
  }
}
