import { expect, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly username: string;
  readonly password: string;
  readonly baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    // Lấy username và password từ biến môi trường .env
    this.username = process.env.MYAPP_USERNAME || '';
    this.password = process.env.MYAPP_PASSWORD || '';
    // URL trang chủ mặc định, có thể thay đổi nếu cần
    this.baseUrl = process.env.BASE_URL || 'https://demo4.cybersoft.edu.vn/';
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
    await emailInput.fill(this.username);
  }

  // Nhập password vào ô password trong form login
  async enterPassword() {
    const passwordInput = this.page.locator('.ant-modal-content input[name="password"]');
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await passwordInput.fill(this.password);
  }

  // Click nút đăng nhập trong modal
  async clickLogin() {
    const loginBtn = this.page.locator('.ant-modal-content button[type="submit"]', { hasText: 'Đăng nhập' });
    await expect(loginBtn).toBeVisible({ timeout: 10000 });
    await loginBtn.click();
  }

  // Quy trình đăng nhập đầy đủ: mở form, nhập username, password, click đăng nhập
  async login() {
    await this.openLoginForm();
    await this.enterUsername();
    await this.enterPassword();
    await this.clickLogin();

   
  }

  // Đăng nhập với credential tùy ý (dùng cho negative tests)
  async loginWith(email: string, password: string) {
    await this.openLoginForm();
    const emailInput = this.page.locator('.ant-modal-content input[name="email"]');
    const passwordInput = this.page.locator('.ant-modal-content input[name="password"]');
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await this.clickLogin();
  }

  // Lấy danh sách thông báo lỗi hiển thị (validation hoặc toast)
  async getErrorMessages() {
    const potentialErrors = [
      this.page.locator('text=Sai thông tin đăng nhập'),
      this.page.locator('text=Email is required'),
      this.page.locator('text=Password is required'),
      this.page.locator('.ant-message-error'),
      this.page.locator('.ant-form-item-explain-error')
    ];
    const visible: string[] = [];
    for (const loc of potentialErrors) {
      if (await loc.first().isVisible()) {
        const texts = await loc.allInnerTexts();
        visible.push(...texts);
      }
    }
    return visible;
  }
}
