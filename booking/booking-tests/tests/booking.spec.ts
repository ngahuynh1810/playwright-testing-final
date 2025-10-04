import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { HomePage } from "../pages/HomePage";
import { RoomDetailPage } from "../pages/RoomDetailPage";

test("đặt phòng thành công với ngày tháng hợp lệ", async ({ page }) => {
  //  Vào trang chủ và chọn city Hồ Chí Minh
  const home = new HomePage(page);
  await home.goto();
  await home.selectHCM();

  //  Chọn phòng đầu tiên → vào trang chi tiết
  await home.selectFirstRoom();

  //  Login (tại trang chi tiết)
  const login = new LoginPage(page);
  await login.login();

  //  Chọn ngày nhận/trả phòng 29-30/10/2025
  const room = new RoomDetailPage(page);
  await room.openCalendar();
  await room.selectCheckInAndCheckOut();
  await room.closeCalendar();

  //  Thêm 1 khách (mặc định 1 khách đã có sẵn)
  await room.addGuests(1); // click 1 lần = tổng 2 khách

  //  Click Đặt phòng
  await room.clickBookNow();

  //  Xác nhận đặt phòng
  await room.confirmBooking();

  //  Kiểm tra thông báo thành công (nếu có)
  const successMessage = page.locator("text=Thêm mới thành công");
  await expect(successMessage).toBeVisible({ timeout: 10000 });
});




test("Kiểm tra số khách tối đa cho phép", async ({ page }) => {
  const homePage = new HomePage(page);
  const roomDetail = new RoomDetailPage(page);

  //  Vào trang chủ
  await homePage.goto();

  //  Chọn city HCM
  await homePage.selectHCM();

  //  Chọn phòng đầu tiên
  await homePage.selectFirstRoom();

  //  Mở calendar 
  await roomDetail.openCalendar();
  await roomDetail.selectCheckInAndCheckOut();
  await roomDetail.closeCalendar();

  /// Lấy số khách tối đa từ mô tả phòng
const roomInfoLocator = page.locator("div.space-y-3 h3 + p"); 
await expect(roomInfoLocator).toBeVisible({ timeout: 5000 });

const roomInfoText = await roomInfoLocator.innerText();
const maxGuests = parseInt(roomInfoText.match(/(\d+)\s*Khách/)?.[1] || "0");


  //  Thử thêm khách vượt quá giới hạn
  await roomDetail.addGuests(maxGuests + 2);

  //  Lấy số khách hiện tại hiển thị
  const guestCountText = await page.locator("div:has-text('khách')").first().innerText();
  const currentGuests = parseInt(guestCountText.match(/\d+/)?.[0] || "0");
  

  
//  Kiểm tra không vượt quá giới hạn
expect(currentGuests).toBeLessThanOrEqual(maxGuests);

  //  Kiểm tra thông báo hiển thị
  const successMessage = page.getByText("Đã đạt tới số khách tối đa!").first();
await expect(successMessage).toBeVisible({ timeout: 5000 });

});

test(" đặt phòng thành công với số lượng khách hợp lệ", async ({ page }) => {
  //  Vào trang chủ và chọn city (ví dụ HCM)
  const home = new HomePage(page);
  await home.goto();
  await home.selectHCM();

  //  Chọn phòng đầu tiên → vào trang chi tiết
  await home.selectFirstRoom();

  //  Login (từ trang chi tiết)
  const login = new LoginPage(page);
  await login.login();

  //  Chọn ngày nhận/trả phòng 29-30/10/2025
  const room = new RoomDetailPage(page);
  await room.openCalendar();
  await room.selectCheckInAndCheckOut();
  await room.closeCalendar();

  //  Thêm khách: 
  await room.addGuests(2); // click + 2 lần = tổng 3 khách

  //  Click Đặt phòng
  await room.clickBookNow();

  //  Xác nhận đặt phòng
  await room.confirmBooking();

  //  Kiểm tra thông báo thành công
  const successMessage = page.locator("text=Thêm mới thành công");
  await expect(successMessage).toBeVisible({ timeout: 10000 });
});
test("Booking flow: không cho chọn ngày nhận phòng trong quá khứ", async ({ page }) => {
  const homePage = new HomePage(page);
  const roomDetailPage = new RoomDetailPage(page);

  //  Vào trang chủ → chọn thành phố → chọn phòng đầu tiên
  await homePage.goto();
  await homePage.selectHCM();
  await homePage.selectFirstRoom();

  //  Mở calendar
  await roomDetailPage.openCalendar();

 // Lấy ngày quá khứ (ví dụ ngày 2)
const pastDay = page.getByRole('button', { name: '2', exact: true });

// Kiểm tra UI hiển thị bị disable qua class
await expect(pastDay).toHaveClass(/rdrDayDisabled/);

// Thử click và verify là không chọn được
await pastDay.click({ trial: true }).catch(() => {});


  //  Đóng calendar
  await roomDetailPage.closeCalendar();
}); 

test("Không cho đặt phòng khi chưa đăng nhập", async ({ page }) => {
  const homePage = new HomePage(page);
  const roomDetailPage = new RoomDetailPage(page);

  //  Vào trang chủ
  await homePage.goto();

  //  Chọn city HCM
  await homePage.selectHCM();

  //  Chọn phòng đầu tiên
  await homePage.selectFirstRoom();

  //  Mở calendar -> chọn ngày
  await roomDetailPage.openCalendar();
  await roomDetailPage.selectCheckInAndCheckOut();
  await roomDetailPage.closeCalendar();

  //  Thêm số khách
  await roomDetailPage.addGuests(2);

  //  Click "Đặt phòng"
  await roomDetailPage.clickBookNow();

   //  Kiểm tra thông báo lỗi yêu cầu đăng nhập
   const alertMsg = page.locator("text=Vui lòng đăng nhập để tiếp tục đặt phòng.");
   await expect(alertMsg).toBeVisible({ timeout: 10000 });

  });
  test("Kiểm tra hiển thị giá phòng + phí", async ({ page }) => {
    const homePage = new HomePage(page);
    const roomDetailPage = new RoomDetailPage(page);

    //  Vào trang chủ
    await homePage.goto();

    //  Chọn city HCM
    await homePage.selectHCM();

    //  Chọn phòng đầu tiên
    await homePage.selectFirstRoom();

    //  Kiểm tra giá phòng
    const roomPriceText = page.locator('p.underline.text-base', { hasText: "nights" });
    const roomPriceValue = page.locator('p.font-mono.text-lg.font-bold').first();

    await expect(roomPriceText).toBeVisible();
    await expect(roomPriceValue).toBeVisible();
    await expect(roomPriceValue).toHaveText("$ 196");

    //  Kiểm tra phí dọn dẹp
    const cleaningFeeText = page.locator('p.underline.text-base', { hasText: "Cleaning fee" });
    const cleaningFeeValue = cleaningFeeText.locator('xpath=following-sibling::p');

    await expect(cleaningFeeText).toBeVisible();
    await expect(cleaningFeeValue).toBeVisible();
    await expect(cleaningFeeValue).toHaveText("$ 8");

    //  Kiểm tra tổng cộng trước thuế
    const totalText = page.locator('text=Total before taxes');
    const totalValue = totalText.locator('xpath=following-sibling::p');

    await expect(totalText).toBeVisible();
    await expect(totalValue).toBeVisible();
    await expect(totalValue).toHaveText("204");
  });

test("Kiểm tra xác nhận và ghi chú chi tiết sau khi đặt phòng", async ({ page }) => {
  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);
  const roomDetailPage = new RoomDetailPage(page);

  await homePage.goto();
 
  await homePage.selectHCM();
  await homePage.selectFirstRoom();
  await loginPage.login();
  await roomDetailPage.openCalendar();
  await roomDetailPage.selectCheckInAndCheckOut();
  await roomDetailPage.closeCalendar();
  await roomDetailPage.addGuests(2);
  await roomDetailPage.clickBookNow();
  await roomDetailPage.confirmBooking();

  // Kiểm tra thông báo thành công
  const confirmationMessage = page.locator('text=Thêm mới thành công');
  await expect(confirmationMessage).toBeVisible({ timeout: 10000 });

  // Ghi chú: chi tiết đặt phòng chưa được hiển thị
  console.log('Chi tiết booking chưa được hiển thị trong hệ thống hiện tại');
});
