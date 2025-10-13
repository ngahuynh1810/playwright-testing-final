import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { RoomDetailPage } from '../pages/RoomDetailPage';

test.describe('Date Validation Tests', () => {
  test('Không cho chọn check-out trước check-in', async ({ page }) => {
    const homePage = new HomePage(page);
    const roomDetail = new RoomDetailPage(page);

    await homePage.goto();
    await homePage.selectHCM();
    await homePage.selectFirstRoom();

    // Mở calendar
    await roomDetail.openCalendar();

    // Chọn ngày 30 trước (check-out)
    const laterDate = page.locator('.rdrDay:not(.rdrDayDisabled) >> text="30"').first();
    await laterDate.click();

    // Thử chọn ngày 29 sau (check-in) - UI nên ngăn chặn
    const earlierDate = page.locator('.rdrDay:not(.rdrDayDisabled) >> text="29"').first();
    await earlierDate.click();

    // Kiểm tra validation - hệ thống nên tự động sửa hoặc báo lỗi
    const errorMsg = page.locator('text=/Check-out date cannot be before check-in|Ngày trả phòng không thể trước ngày nhận/i');
    await expect.soft(errorMsg.first()).toBeVisible({ timeout: 3000 });
  });

  test('Không cho chọn cùng ngày check-in và check-out', async ({ page }) => {
    const homePage = new HomePage(page);
    const roomDetail = new RoomDetailPage(page);

    await homePage.goto();
    await homePage.selectHCM();
    await homePage.selectFirstRoom();

    await roomDetail.openCalendar();

    // Chọn cùng ngày 29 cho cả check-in và check-out
    const sameDate = page.locator('.rdrDay:not(.rdrDayDisabled) >> text="29"').first();
    await sameDate.click();
    await sameDate.click(); // Click lần 2

    const validation = page.locator('text=/Minimum stay|Tối thiểu.*đêm/i');
    await expect.soft(validation.first()).toBeVisible({ timeout: 3000 });
  });

  test('Kiểm tra tính giá theo số đêm chính xác', async ({ page }) => {
    const homePage = new HomePage(page);
    const roomDetail = new RoomDetailPage(page);

    await homePage.goto();
    await homePage.selectHCM();
    await homePage.selectFirstRoom();

    // Lấy giá 1 đêm ban đầu
    const pricePerNight = await page.locator('p.font-mono.text-lg.font-bold').first().innerText();
    const nightlyRate = parseInt(pricePerNight.replace(/[^0-9]/g, ''));

    await roomDetail.openCalendar();
    
    // Chọn 3 đêm (29, 30, 31 tháng 10)
    const checkIn = page.locator('.rdrDay:not(.rdrDayDisabled) >> text="29"').first();
    const checkOut = page.locator('.rdrDay:not(.rdrDayDisabled) >> text="31"').first(); // 2 ngày sau = 2 đêm
    
    await checkIn.click();
    await checkOut.click();
    await roomDetail.closeCalendar();

    // Kiểm tra tổng tiền có phản ánh đúng số đêm
    const totalElement = page.locator('text=Total before taxes').locator('xpath=following-sibling::p');
    const totalText = await totalElement.innerText();
    const totalAmount = parseInt(totalText.replace(/[^0-9]/g, ''));
    
    // Expected: (nightlyRate * 2 đêm) + cleaning fee (8)
    const expectedTotal = (nightlyRate * 2) + 8;
    expect(totalAmount).toBe(expectedTotal);
  });
});

test.describe('Guest Management Tests', () => {
  test('Kiểm tra số khách mặc định và tăng giảm', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto();
    await homePage.selectHCM();
    await homePage.selectFirstRoom();

    // Kiểm tra số khách mặc định là 1
    const guestDisplay = page.locator('div:has-text("khách")').first();
    let currentGuests = await guestDisplay.innerText();
    expect(currentGuests).toContain('1');

    // Tăng khách lên 3
    const plusBtn = page.locator('button.bg-main >> text="+"');
    await plusBtn.click();
    await plusBtn.click(); // Tổng = 3

    currentGuests = await guestDisplay.innerText();
    expect(currentGuests).toContain('3');

    // Thử giảm khách về 1
    const minusBtn = page.locator('button >> text="-"');
    if (await minusBtn.isVisible()) {
      await minusBtn.click();
      await minusBtn.click(); // Về 1

      currentGuests = await guestDisplay.innerText();
      expect(currentGuests).toContain('1');
    }
  });

  test('Không cho số khách nhỏ hơn 1', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto();
    await homePage.selectHCM();
    await homePage.selectFirstRoom();

    // Thử giảm từ 1 xuống 0
    const minusBtn = page.locator('button >> text="-"');
    if (await minusBtn.isVisible()) {
      await minusBtn.click();
      
      const guestDisplay = page.locator('div:has-text("khách")').first();
      const currentGuests = await guestDisplay.innerText();
      
      // Vẫn phải là 1 (không giảm được)
      expect(currentGuests).toContain('1');
    } else {
      // Nút - bị disable khi ở 1 khách
      console.log('Minus button correctly disabled at minimum guest count');
    }
  });
});

test.describe('UI State Tests', () => {
  test('Calendar đóng mở đúng cách', async ({ page }) => {
    const homePage = new HomePage(page);
    const roomDetail = new RoomDetailPage(page);

    await homePage.goto();
    await homePage.selectHCM();
    await homePage.selectFirstRoom();

    // Calendar ban đầu không hiển thị
    const calendar = page.locator('.rdrCalendarWrapper');
    await expect(calendar).toBeHidden();

    // Mở calendar
    await roomDetail.openCalendar();
    await expect(calendar).toBeVisible();

    // Đóng calendar
    await roomDetail.closeCalendar();
    await expect(calendar).toBeHidden();
  });

  test('Loading states và error handling', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    
    // Kiểm tra trang tải thành công
    await expect(page.locator('text=Hồ Chí Minh')).toBeVisible({ timeout: 30000 });
    
    // Chọn HCM và đợi phòng load
    await homePage.selectHCM();
    
    // Kiểm tra có phòng hiển thị
    const roomCards = page.locator('p.truncate.text-xl');
    await expect(roomCards.first()).toBeVisible({ timeout: 30000 });
    
    // Đếm số phòng
    const roomCount = await roomCards.count();
    expect(roomCount).toBeGreaterThan(0);
    console.log(`Found ${roomCount} rooms available`);
  });

  test('Responsive design - mobile view simulation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const homePage = new HomePage(page);
    
    await homePage.goto();
    await homePage.selectHCM();
    
    // Kiểm tra elements vẫn hiển thị được trong mobile
    const cityCard = page.locator('.ant-card').filter({ hasText: 'Hồ Chí Minh' });
    await expect(cityCard).toBeVisible();
    
    await homePage.selectFirstRoom();
    
    // Kiểm tra nút book vẫn accessible
    const bookBtn = page.getByRole("button", { name: "Đặt phòng" });
    await expect(bookBtn).toBeVisible();
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});

test.describe('Performance Tests', () => {
  test('Đo thời gian load trang chủ', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('https://demo4.cybersoft.edu.vn/');
    
    // Đợi element chính load xong
    await page.locator('text=Hồ Chí Minh').waitFor({ timeout: 30000 });
    
    const loadTime = Date.now() - startTime;
    console.log(`Homepage loaded in ${loadTime}ms`);
    
    // Trang nên load trong 10 giây
    expect(loadTime).toBeLessThan(10000);
  });

  test('Đo thời gian chuyển từ trang chủ sang chi tiết phòng', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto();
    await homePage.selectHCM();
    
    const startTime = Date.now();
    await homePage.selectFirstRoom();
    const navigationTime = Date.now() - startTime;
    
    console.log(`Room detail navigation took ${navigationTime}ms`);
    expect(navigationTime).toBeLessThan(5000);
  });
});