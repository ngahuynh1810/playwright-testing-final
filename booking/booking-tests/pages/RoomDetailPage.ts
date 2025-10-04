import { Page, expect } from "@playwright/test";

export class RoomDetailPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // 1️⃣ Mở calendar chọn ngày
  async openCalendar() {
    const checkInBox = this.page.locator('div.font-bold', { hasText: 'Nhận phòng' });
    await expect(checkInBox).toBeVisible({ timeout: 5000 });
    await checkInBox.click();
  }

  // 2️⃣ Chọn ngày check-in và check-out
  async selectCheckInAndCheckOut() {
    // Chọn tháng 10/2025 nếu cần ( click next month)
     const nextMonth = this.page.locator('button[aria-label="Next Month"]');
     await nextMonth.click();

    const checkIn = this.page.locator('.rdrDay:not(.rdrDayDisabled) >> text="29"').first();
    const checkOut = this.page.locator('.rdrDay:not(.rdrDayDisabled) >> text="30"').first();

    await expect(checkIn).toBeVisible();
    await checkIn.click();

    await expect(checkOut).toBeVisible();
    await checkOut.click();
  }

  // 3️⃣ Đóng calendar
  async closeCalendar() {
    const closeBtn = this.page.locator('button.bg-gray-100', { hasText: 'Close' });
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  }

  // 4️⃣ Thêm khách
  async addGuests(count: number) {
    const plusBtn = this.page.locator('button.bg-main >> text="+"');
    for (let i = 0; i < count; i++) {
      await plusBtn.click();
    }
  }

  // 5️⃣ Click Đặt phòng
  async clickBookNow() {
    const bookBtn = this.page.locator('button.bg-main', { hasText: 'Đặt phòng' });
    await expect(bookBtn).toBeVisible();
    await bookBtn.click();
  }

  // 6️⃣ Xác nhận đặt phòng
  async confirmBooking() {
    const confirmBtn = this.page.locator('button', { hasText: 'Xác nhận' });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();
  }
}

