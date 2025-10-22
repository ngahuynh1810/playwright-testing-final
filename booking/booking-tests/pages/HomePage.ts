import { expect, Page } from "@playwright/test";

export class HomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Vào trang chủ
  async goto() {
    await this.page.goto("https://demo4.cybersoft.edu.vn/");
  }

  // Chọn city HCM	
  async selectHCM() {
    const hcmCard = this.page.locator('.ant-card').filter({ hasText: 'Hồ Chí Minh' });
    await expect(hcmCard).toBeVisible({ timeout: 30000 });
    await hcmCard.click();


  }

  // Chọn phòng 
  async selectFirstRoom() {
    // const firstroom =this.page.locator('p.truncate.text-xl', { hasText: 'NewApt D1 - Cozy studio' });
    // await firstroom.waitFor({ state: 'visible', timeout: 30000 });
    // await firstroom.scrollIntoViewIfNeeded();
    // await firstroom.click();
    const roomLink = this.page.locator('a[href="/room-detail/1"]');
    await roomLink.waitFor({ state: 'visible', timeout: 30000 });
    await roomLink.scrollIntoViewIfNeeded();
    await expect(roomLink).toBeVisible();
    await roomLink.click();

    // Chờ trang chi tiết hiển thị 
    const bookBtn = this.page.getByRole("button", { name: "Đặt phòng" });
    await expect(bookBtn).toBeVisible({ timeout: 30000 });
  }
}
