import { expect, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config(); 

export class RegisterPage {
  readonly page: Page;
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly phone: string;
  readonly birthday: string;
  readonly gender: string;
  readonly baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.username = process.env.REGISTER_USERNAME ;
    this.email = process.env.REGISTER_EMAIL ;
    this.password = process.env.REGISTER_PASSWORD ;
    this.phone = process.env.REGISTER_PHONE ;
    this.birthday = process.env.REGISTER_BIRTHDAY || '2000-01-01';
    this.gender = process.env.REGISTER_GENDER ;
    this.baseUrl = process.env.BASE_URL;
  }

  async goto() {
    await this.page.goto(this.baseUrl);
  }

  async openUserMenu() {
    const avatar = this.page.locator(
      'img.h-10[src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png"]'
    );
    await expect(avatar).toBeVisible({ timeout: 20000 });
    await avatar.click();
  }

  async openRegisterForm() {
    await this.openUserMenu();

    const registerBtn = this.page.getByRole('button', { name: 'Đăng ký' });
    await expect(registerBtn).toBeVisible({ timeout: 10000 });
    await registerBtn.click();

    const modal = this.page.locator('.ant-modal-content');
    await expect(modal).toBeVisible({ timeout: 10000 });
  }

  async enterUsername() {
    await this.page.locator('.ant-modal-content input[name="name"]').fill(this.username);
  }

  async enterEmail() {
    await this.page.locator('.ant-modal-content input[name="email"]').fill(this.email);
  }

  async enterPassword() {
    await this.page.locator('.ant-modal-content input[name="password"]').fill(this.password);
  }

  async enterPhone() {
    await this.page.locator('.ant-modal-content input[name="phone"]').fill(this.phone);
  }

  /**
   *  Chọn ngày sinh (Ant Design DatePicker)
   */
  async enterBirthday() {
    const birthdayInput = this.page.locator('.ant-modal-content input[name="birthday"]');
    await birthdayInput.click();

    const [year, month, day] = this.birthday.split('-').map(Number);
    console.log(` Chọn ngày sinh: ${this.birthday}`);

    // Mở panel chọn năm
    const headerBtn = this.page.locator('.ant-picker-header-view');
    await headerBtn.click();
    await headerBtn.click(); // vào panel thập kỷ

    // Chọn thập kỷ chứa năm
    const decadeStart = Math.floor(year / 10) * 10;
    const decadeCell = this.page.locator(`.ant-picker-cell-inner:has-text("${decadeStart}")`);
    if (await decadeCell.isVisible()) await decadeCell.click();

    // Chọn năm
    const yearCell = this.page.locator(`.ant-picker-cell-inner:text-is("${year}")`);
    await expect(yearCell).toBeVisible({ timeout: 5000 });
    await yearCell.click();

    // Chọn tháng
    const allMonths = this.page.locator('.ant-picker-cell');
    await allMonths.nth(month - 1).click();

    // Chọn ngày
    const dayCell = this.page.locator(`.ant-picker-cell[title="${this.birthday}"]`);
   await expect(dayCell).toBeVisible({ timeout: 5000 });
   await dayCell.click();
  }

  /**
   *  Chọn giới tính trong Ant Design Select
   */
  async selectGender() {
    console.log(` Chọn giới tính: ${this.gender}`);

    // Click để mở dropdown
    const genderSelect = this.page.locator('.ant-select-selector');
    await expect(genderSelect).toBeVisible({ timeout: 5000 });
    await genderSelect.click();

    // Đợi danh sách hiển thị (dropdown menu có class ant-select-dropdown)
    const dropdown = this.page.locator('.ant-select-dropdown');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Click chọn giới tính mong muốn
    const option = dropdown.locator(`.ant-select-item-option-content:text-is("${this.gender}")`);
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();

    console.log(` Đã chọn giới tính "${this.gender}"`);
  }

  async clickRegister() {
    const registerBtn = this.page.locator(
      '.ant-modal-content button[type="submit"]',
      { hasText: 'Đăng ký' }
    );
    await expect(registerBtn).toBeVisible({ timeout: 5000 });
    await registerBtn.click();
    console.log(' Đã nhấn nút Đăng ký');
  }
  //*  Kiểm tra có xuất hiện chữ "Đăng ký thành công" trên trang
 
 async verifySuccessMessage() {
   const successMessage = this.page.getByText('Đăng ký thành công', { exact: true });
   await expect(successMessage).toBeVisible({ timeout: 10000 });
   console.log(' Đăng ký thành công!');
 }
  async register() {
    await this.openRegisterForm();
    await this.enterUsername();
    await this.enterEmail();
    await this.enterPassword();
    await this.enterPhone();
    await this.enterBirthday();
    await this.selectGender();
    await this.clickRegister();
    console.log(' Hoàn tất quy trình đăng ký');
    await this.verifySuccessMessage();
  }
}
