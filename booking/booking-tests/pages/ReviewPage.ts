import { expect, Page } from '@playwright/test';
import { LoginPage } from './LoginPage';

export class ReviewPage {
  readonly page: Page;
  readonly loginPage: LoginPage;

  constructor(page: Page) {
    this.page = page;
    this.loginPage = new LoginPage(page);
  }

  //  Mở trang chủ và đăng nhập
  async gotoAndLogin() {
    await this.loginPage.goto();
    await this.loginPage.login();

    const userName = this.page.locator('span.ml-3', { hasText: 'beba' });
    await expect(userName).toBeVisible({ timeout: 10000 });
  }

  //  Mở menu người dùng
  async openUserMenu() {
    const userMenu = this.page.locator('span', { hasText: 'beba' }).first();
    await expect(userMenu).toBeVisible({ timeout: 5000 });
    await userMenu.click();
  }

  //  Mở Dashboard
  async openDashboard() {
    await this.openUserMenu();

    const dashboardLink = this.page.locator('a[href="/info-user"]', { hasText: 'Dashboard' });
    await expect(dashboardLink).toBeVisible({ timeout: 5000 });
    await dashboardLink.click();

    await expect(this.page).toHaveURL(/.*info-user/, { timeout: 10000 });
  }

  //  Chọn phòng đầu tiên
  async selectFirstRoom() {
    const roomLink = this.page.locator('a[href^="/room-detail/"]');
    await roomLink.first().waitFor({ state: 'visible', timeout: 60000 });
    await roomLink.first().scrollIntoViewIfNeeded();
    await expect(roomLink.first()).toBeVisible();
    await roomLink.first().click();
    // await this.page.waitForSelector('p.truncate.text-xl', { timeout: 10000 });
    // const firstRoom = this.page.locator('p.truncate.text-xl').first();
    // await firstRoom.click();

    // await this.page.waitForLoadState('networkidle');
    // await expect(this.page.locator('.ant-rate-star').first()).toBeVisible({ timeout: 10000 });
  }

  //  Chọn số sao đánh giá
  async selectRating(stars: number = 4) {
    const star = this.page.locator('.ant-rate-star').nth(stars - 1);
    await expect(star).toBeVisible({ timeout: 5000 });
    await star.click();
  }

  //  Nhập nội dung đánh giá
  async enterComment(content: string) {
    const textarea = this.page.locator('textarea');
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await textarea.fill(content);
  }

  //  Gửi đánh giá
  async submitReview() {
    const submitBtn = this.page.getByRole('button', { name: 'Đánh giá' });
    await expect(submitBtn).toBeVisible({ timeout: 5000 });
    await submitBtn.click();
    await expect(this.page.getByText('Bình luận thành công')).toBeVisible();

  }
  //  Quy trình đánh giá hoàn chỉnh
  async reviewRoom(stars: number, content: string) {
    await this.gotoAndLogin();
    await this.openDashboard();
    await this.selectFirstRoom();
    await this.selectRating(stars);
    await this.enterComment(content);
    await this.submitReview();
  }
}
