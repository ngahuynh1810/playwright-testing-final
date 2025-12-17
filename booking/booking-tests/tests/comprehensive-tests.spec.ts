import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RoomDetailPage } from '../pages/RoomDetailPage';

test.describe('Data-driven Tests', () => {
  // Test data cho multiple scenarios
  const testGuestCounts = [1, 2, 4, 6];
  const testCities = ['Hồ Chí Minh']; // Có thể mở rộng thêm cities khác

  testGuestCounts.forEach(guestCount => {
    test(`Đặt phòng với ${guestCount} khách`, async ({ page }) => {
      const homePage = new HomePage(page);
      const loginPage = new LoginPage(page);
      const roomDetail = new RoomDetailPage(page);

      await homePage.goto();
      await homePage.selectHCM();
      await homePage.selectFirstRoom();
      await loginPage.login();

      await roomDetail.openCalendar();
      await roomDetail.selectCheckInAndCheckOut();
      await roomDetail.closeCalendar();

      // Thêm khách theo test data
      if (guestCount > 1) {
        await roomDetail.addGuests(guestCount - 1); // -1 vì mặc định đã có 1
      }

      await roomDetail.clickBookNow();
      await roomDetail.confirmBooking();

      const successMessage = page.locator("text=Thêm mới thành công");
      await expect(successMessage).toBeVisible({ timeout: 15000 });

      console.log(`✅ Booking successful with ${guestCount} guests`);
    });
  });
});

test.describe('Edge Cases và Boundary Tests', () => {
  test('Kiểm tra booking với 0 khách (edge case)', async ({ page }) => {
    const homePage = new HomePage(page);
    const roomDetail = new RoomDetailPage(page);

    await homePage.goto();
    await homePage.selectHCM();
    await homePage.selectFirstRoom();

    // Thử manipulate để có 0 khách
    await page.evaluate(() => {
      const guestInputs = document.querySelectorAll('input[type="number"]');
      guestInputs.forEach(input => {
        (input as HTMLInputElement).value = '0';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });

    // Thử book với 0 khách - UI nên prevent
    const bookBtn = page.getByRole("button", { name: "Đặt phòng" });
    await bookBtn.click();

    // Nên có validation error
    const errorMsg = page.locator('text=/Vui lòng chọn số khách|Please select guests|Minimum.*guest/i');
    await expect.soft(errorMsg.first()).toBeVisible({ timeout: 5000 });
  });

  test('Kiểm tra với ngày quá xa trong tương lai', async ({ page }) => {
    const homePage = new HomePage(page);
    const roomDetail = new RoomDetailPage(page);

    await homePage.goto();
    await homePage.selectHCM();
    await homePage.selectFirstRoom();

    await roomDetail.openCalendar();

    // Chuyển sang tháng sau nhiều lần để vào tương lai xa
    const nextMonthBtn = page.locator('button[aria-label="Next Month"]');
    
    for (let i = 0; i < 6; i++) { // 6 tháng sau
      if (await nextMonthBtn.isVisible()) {
        await nextMonthBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // Thử chọn ngày xa
    const futureDate = page.locator('.rdrDay:not(.rdrDayDisabled)').first();
    if (await futureDate.isVisible()) {
      await futureDate.click();
      
      // Có thể có giới hạn booking window
      const warningMsg = page.locator('text=/Booking window|Maximum advance|Giới hạn đặt phòng/i');
      await expect.soft(warningMsg.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('Stress test - thao tác nhanh liên tục', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto();
    await homePage.selectHCM();
    await homePage.selectFirstRoom();

    // Click nhanh + guest nhiều lần
    const plusBtn = page.locator('button.bg-main >> text="+"');
    
    for (let i = 0; i < 10; i++) {
      if (await plusBtn.isVisible()) {
        await plusBtn.click();
        await page.waitForTimeout(100); // Click nhanh
      }
    }

    // Kiểm tra UI vẫn responsive
    const guestDisplay = page.locator('div:has-text("khách")').first();
    await expect(guestDisplay).toBeVisible();
    
    // Check số khách có hợp lý (không âm, không quá lớn)
    const guestText = await guestDisplay.innerText();
    const guestCount = parseInt(guestText.match(/\\d+/)?.[0] || '0');
    
    expect(guestCount).toBeGreaterThan(0);
    expect(guestCount).toBeLessThan(50); // Giả sử max reasonable là 50
  });
});

test.describe('Visual và Screenshot Tests', () => {
  test('Screenshot trang chủ baseline', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Đợi trang load hoàn toàn
    await page.locator('text=Hồ Chí Minh').waitFor();
    
    // Ẩn elements dynamic (time, ads) để screenshot stable
    await page.addStyleTag({
      content: `
        .dynamic-time, .ads, .popup { display: none !important; }
        * { animation-duration: 0s !important; }
      `
    });
    
    await expect(page).toHaveScreenshot('homepage-baseline.png');
  });

  test('Screenshot modal đăng nhập', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.openLoginForm();
    
    // Screenshot modal
    const modal = page.locator('.ant-modal-content');
    await expect(modal).toHaveScreenshot('login-modal.png');
  });

  test('Screenshot responsive mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.selectHCM();
    
    await expect(page).toHaveScreenshot('mobile-rooms-list.png');
    
    await homePage.selectFirstRoom();
    await expect(page).toHaveScreenshot('mobile-room-detail.png');
  });
});

test.describe('Cleanup và State Management', () => {
  test('Clear browser data giữa tests', async ({ page }) => {
    // Clear storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Clear cookies
    await page.context().clearCookies();
    
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Verify clean state
    const loginBtn = page.locator('button', { hasText: 'Đăng nhập' });
    await expect(loginBtn).toBeVisible(); // Chưa login
    
    console.log('✅ Browser state cleaned successfully');
  });

  test('Test với persistent context', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login();
    
    // Verify login state persists
    const avatar = page.locator('img.h-10[src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png"]');
    await expect(avatar).toBeVisible();
    
    // Reload page
    await page.reload();
    
    // Check if still logged in (depends on session management)
    await page.waitForTimeout(3000);
    const avatarAfterReload = page.locator('img.h-10[src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png"]');
    
    // Log result for debugging
    const isStillLoggedIn = await avatarAfterReload.isVisible();
    console.log(`Login persists after reload: ${isStillLoggedIn}`);
  });
});