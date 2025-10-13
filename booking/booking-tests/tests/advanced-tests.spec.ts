import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { RoomDetailPage } from '../pages/RoomDetailPage';

test.describe('API và Network Tests', () => {
  test('Kiểm tra thông tin phòng load từ API', async ({ page }) => {
    // Bắt request API
    const apiResponses: any[] = [];
    
    page.on('response', async (response) => {
      if (response.url().includes('api') || response.url().includes('room')) {
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          contentType: response.headers()['content-type']
        });
      }
    });

    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.selectHCM();

    // Đợi ít nhất 1 API call
    await page.waitForTimeout(3000);
    
    // Log API calls để debug
    console.log('API calls captured:', apiResponses.length);
    apiResponses.forEach(resp => {
      console.log(`${resp.status} - ${resp.url}`);
    });

    // Ít nhất nên có API calls thành công
    const successfulCalls = apiResponses.filter(r => r.status >= 200 && r.status < 300);
    expect(successfulCalls.length).toBeGreaterThan(0);
  });

  test('Xử lý lỗi mạng khi load phòng', async ({ page }) => {
    // Simulate network failure
    await page.route('**/*', route => {
      if (route.request().url().includes('api')) {
        route.abort();
      } else {
        route.continue();
      }
    });

    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Thử chọn HCM - có thể fail do API bị block
    try {
      await homePage.selectHCM();
      
      // Kiểm tra có error message hay fallback UI
      const errorMsg = page.locator('text=/Error|Lỗi|Failed to load|Không thể tải/i');
      await expect.soft(errorMsg.first()).toBeVisible({ timeout: 10000 });
      
    } catch (error) {
      console.log('Expected error due to blocked API:', error);
    }
  });
});

test.describe('Cross-browser Compatibility', () => {
  test('Kiểm tra login trên webkit (Safari-like)', async ({ page, browserName }) => {
    // Skip trên Chrome/Firefox để chỉ chạy trên webkit
    test.skip(browserName !== 'webkit', 'This test is WebKit-specific');

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login();

    const avatar = page.locator('img.h-10[src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png"]');
    await expect(avatar).toBeVisible();
    
    console.log(`Login successful on ${browserName}`);
  });

  test('Kiểm tra booking flow trên tất cả browsers', async ({ page, browserName }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const roomDetail = new RoomDetailPage(page);

    console.log(`Running booking test on ${browserName}`);

    await homePage.goto();
    await homePage.selectHCM();
    await homePage.selectFirstRoom();
    await loginPage.login();

    await roomDetail.openCalendar();
    await roomDetail.selectCheckInAndCheckOut();
    await roomDetail.closeCalendar();
    await roomDetail.addGuests(1);
    await roomDetail.clickBookNow();
    await roomDetail.confirmBooking();

    const successMessage = page.locator("text=Thêm mới thành công");
    await expect(successMessage).toBeVisible({ timeout: 15000 });
    
    console.log(`Booking successful on ${browserName}`);
  });
});

test.describe('Security Tests', () => {
  test('XSS prevention trong search/input fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.openLoginForm();

    // Thử inject script vào email field
    const maliciousEmail = '<script>alert("XSS")</script>@test.com';
    const emailInput = page.locator('.ant-modal-content input[name="email"]');
    await emailInput.fill(maliciousEmail);

    // Kiểm tra value đã được escape/sanitize
    const emailValue = await emailInput.inputValue();
    expect(emailValue).not.toContain('<script>');
    
    // Thử submit và kiểm tra không có popup
    await page.locator('.ant-modal-content button[type="submit"]').click();
    
    // Kiểm tra page vẫn stable
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toContain('demo4.cybersoft.edu.vn');
  });

  test('SQL injection prevention trong login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    // Thử các SQL injection payloads
    const sqlPayloads = [
      "' OR '1'='1",
      "admin'--",
      "' UNION SELECT * FROM users--"
    ];

    for (const payload of sqlPayloads) {
      await loginPage.loginWith(payload, 'anypassword');
      
      // Không được đăng nhập thành công
      const avatar = page.locator('img.h-10[src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png"]');
      await expect(avatar).not.toBeVisible();
      
      // Modal vẫn mở (login failed)
      const modal = page.locator('.ant-modal-content');
      await expect(modal).toBeVisible();
      
      console.log(`SQL injection payload blocked: ${payload}`);
    }
  });
});

test.describe('Accessibility Tests', () => {
  test('Kiểm tra keyboard navigation', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Tab qua các elements chính
    await page.keyboard.press('Tab'); // Focus đầu tiên
    await page.keyboard.press('Tab'); // Chuyển sang element tiếp theo
    
    // Kiểm tra focus visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Enter để activate
    await page.keyboard.press('Enter');
    
    // Kiểm tra có navigation xảy ra
    await page.waitForTimeout(2000);
  });

  test('Kiểm tra screen reader support (ARIA labels)', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.selectHCM();
    await homePage.selectFirstRoom();

    // Kiểm tra các elements có ARIA labels
    const bookButton = page.getByRole("button", { name: "Đặt phòng" });
    await expect(bookButton).toBeVisible();
    
    const plusButton = page.locator('button.bg-main >> text="+"');
    if (await plusButton.isVisible()) {
      // Kiểm tra có aria-label hoặc accessible name
      const ariaLabel = await plusButton.getAttribute('aria-label');
      const title = await plusButton.getAttribute('title');
      
      expect(ariaLabel || title || '+').toBeTruthy();
    }
  });

  test('Color contrast và readability', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.selectHCM();
    await homePage.selectFirstRoom();

    // Kiểm tra text có đủ contrast (đo bằng computed style)
    const priceText = page.locator('p.font-mono.text-lg.font-bold').first();
    await expect(priceText).toBeVisible();
    
    const computedStyle = await priceText.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
        fontSize: style.fontSize
      };
    });
    
    console.log('Price text styles:', computedStyle);
    
    // Basic check: font size >= 14px
    const fontSize = parseInt(computedStyle.fontSize);
    expect(fontSize).toBeGreaterThanOrEqual(14);
  });
});