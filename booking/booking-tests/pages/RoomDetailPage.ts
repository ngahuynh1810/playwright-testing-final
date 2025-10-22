import { Page, expect } from "@playwright/test";
const DEFAULT_NEXT_DAYS_FILL = 3
export class RoomDetailPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // 1️⃣ Mở calendar chọn ngày
  async openCalendar() {
    // const nhanPhong = this.page.getByText('Nhận phòng', { exact: true });
    const nhanPhong = this.page.locator('div.font-bold:has-text("Nhận phòng")');
    await expect(nhanPhong).toBeVisible();
    await nhanPhong.scrollIntoViewIfNeeded();

    await nhanPhong.click();
  }

  // 2️⃣ Chọn ngày check-in và check-out
  // async selectCheckInAndCheckOut() {
  //   // Chọn tháng 10/2025 nếu cần ( click next month)
  //   const nextMonth = this.page.locator('button[aria-label="Next Month"]');
  //   await nextMonth.click();

  //   const checkIn = this.page.locator('.rdrDay:not(.rdrDayDisabled) >> text="29"').first();
  //   const checkOut = this.page.locator('.rdrDay:not(.rdrDayDisabled) >> text="30"').first();

  //   await expect(checkIn).toBeVisible();
  //   await checkIn.click();

  //   await expect(checkOut).toBeVisible();
  //   await checkOut.click();
  // }
  async fillCheckInAndCheckOutFuture(numberDays: number = DEFAULT_NEXT_DAYS_FILL) {
    await this.page.waitForSelector('.rdrDateRangePickerWrapper', {
      state: 'visible',
      timeout: 120000,
    });

    // verify
    await expect(this.page.locator('.rdrDateRangePickerWrapper')).toBeVisible();
    // await expect(this.page.locator('.rdrDateRangePickerWrapper')).toBeVisible({ timeout: 10000 });
    const targetTextSpan = this.page.locator(`text='days starting today'`);
    const inputContainer = targetTextSpan.locator('..');
    const numberInput = inputContainer.locator('input').first();

    // Fill the Input ---
    await numberInput.scrollIntoViewIfNeeded();
    await numberInput.focus();
    await numberInput.fill(`${numberDays}`);
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
    await expect(confirmBtn).toBeVisible({ timeout: 120000 });
    await confirmBtn.click();
  }
}

