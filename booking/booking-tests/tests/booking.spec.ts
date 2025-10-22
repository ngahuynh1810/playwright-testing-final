import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { HomePage } from "../pages/HomePage";
import { RoomDetailPage } from "../pages/RoomDetailPage";

test("đặt phòng thành công với ngày tháng hợp lệ", async ({ page }) => {
  //  Vào trang chủ và chọn city Hồ Chí Minh
  const home = new HomePage(page);
  const room = new RoomDetailPage(page);
  await home.goto();
  await home.selectHCM();

  //  Chọn phòng đầu tiên → vào trang chi tiết
  await home.selectFirstRoom();
  //  Login (từ trang chi tiết)
  const login = new LoginPage(page);
  await login.login();
  
  //  Chọn ngày nhận/trả phòng 29-30/10/2025
  // const room = new RoomDetailPage(page);
  await room.openCalendar();
  await room.fillCheckInAndCheckOutFuture();
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
  await roomDetail.fillCheckInAndCheckOutFuture();
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
  await room.fillCheckInAndCheckOutFuture();
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
  await pastDay.click({ trial: true }).catch(() => { });


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
  await roomDetailPage.fillCheckInAndCheckOutFuture();
  await roomDetailPage.closeCalendar();

  //  Thêm số khách
  await roomDetailPage.addGuests(2);

  //  Click "Đặt phòng"
  await roomDetailPage.clickBookNow();

  //  Kiểm tra thông báo lỗi yêu cầu đăng nhập
  const alertMsg = page.locator("text=Vui lòng đăng nhập để tiếp tục đặt phòng.");
  await expect(alertMsg).toBeVisible({ timeout: 10000 });

});
test('Kiểm tra giá phòng x số đêm + phí dọn dẹp , tổng cộng (theo UI) Updated', async ({ page }) => {
  const homePage = new HomePage(page);
  const roomDetailPage = new RoomDetailPage(page);

  // Vào trang & chọn phòng đầu tiên
  await homePage.goto();
  await homePage.selectHCM();
  await homePage.selectFirstRoom();

  // Chọn ngày Check-in & Check-out
  await roomDetailPage.openCalendar();
  await roomDetailPage.fillCheckInAndCheckOutFuture();
  await roomDetailPage.closeCalendar();
  const rentalLine = page.locator('p:has-text("X ")', { hasText: 'nights' });
  await rentalLine.waitFor({ state: 'visible' });
  const priceRegex = /(\d+)/;
  // "$28 X 7 nights $196"
  const rentalText = await rentalLine.innerText();

  const priceMatch = rentalText.match(/\$(\d+)\s+X/);
  const countMatch = rentalText.match(/X\s+(\d+)\s+nights/);

  if (!priceMatch || !countMatch) {
    throw new Error(`Could not parse price details from text: "${rentalText}"`);
  }

  const pricePerNight = parseFloat(priceMatch[1]);
  const numberOfNights = parseFloat(countMatch[1]);


  // "Cleaning fee"
  const cleaningFeeContainer = page.locator('div.flex.justify-between', { has: page.locator('p:has-text("Cleaning fee")') });
  await cleaningFeeContainer.waitFor({ state: 'visible' });

  const cleaningFeeAmountLocator = cleaningFeeContainer.locator('p.font-mono.text-lg.font-bold').last();

  // "$ 8" or "8"
  const feeText = await cleaningFeeAmountLocator.innerText();
  const cleaningFeeMatch = feeText.match(priceRegex);

  if (!cleaningFeeMatch) {
    throw new Error(`Could not parse cleaning fee amount from text: "${feeText}"`);
  }

  const cleaningFee = parseFloat(cleaningFeeMatch[1]);

  // Calculate Expected Total ---

  const expectedTotal = pricePerNight * numberOfNights + cleaningFee;

  console.log(`P/N: ${pricePerNight}, Nights: ${numberOfNights}, Fee: ${cleaningFee}`);
  console.log(`Calculated Expected Total: ${pricePerNight} * ${numberOfNights} + ${cleaningFee} = ${expectedTotal}`);


  const totalLine = page.locator('p:has-text("Total before taxes")');
  await totalLine.waitFor({ state: 'visible' });
  const displayedTotalLocator = totalLine.locator('xpath=./following-sibling::p');

  await displayedTotalLocator.waitFor({ state: 'visible' });
  const displayedTotalText = await displayedTotalLocator.innerText();
  const displayedTotalMatch = displayedTotalText.match(priceRegex);

  if (!displayedTotalMatch) {
    throw new Error(`Could not parse displayed total from text: "${displayedTotalText}"`);
  }

  const displayedTotal = parseFloat(displayedTotalMatch[1]);

  // Final Assertion
  expect(displayedTotal).toBe(expectedTotal);

  console.log(`SUCCESS: Displayed total (${displayedTotal}) matches calculated total (${expectedTotal}).`);
});
// test('Kiểm tra giá phòng x số đêm + phí dọn dẹp , tổng cộng (theo UI)', async ({ page }) => {
//   const homePage = new HomePage(page);
//   const roomDetailPage = new RoomDetailPage(page);

//   // Vào trang & chọn phòng đầu tiên
//   await homePage.goto();
//   await homePage.selectHCM();
//   await homePage.selectFirstRoom();

//   // Chọn ngày Check-in & Check-out
//   await roomDetailPage.openCalendar();
//   await roomDetailPage.selectCheckInAndCheckOut();
//   await roomDetailPage.closeCalendar();

//   // Lấy dòng chứa giá × số đêm
//   const priceAndNightsLocator = page.locator('p.underline.text-base', { hasText: '$' });
//   await expect(priceAndNightsLocator.first()).toBeVisible({ timeout: 5000 });

//   const priceAndNightsText = await priceAndNightsLocator.first().textContent();
//   expect(priceAndNightsText).not.toBeNull();

//   const match = priceAndNightsText!.match(/\$?\s*(\d+)\s*[xX]\s*(\d+)\s*nights/);
//   expect(match).not.toBeNull();

//   const pricePerNight = Number(match![1]);
//   const numberOfNights = Number(match![2]);

//   expect(pricePerNight).toBeGreaterThan(0);
//   expect(numberOfNights).toBeGreaterThan(0);

//   //  Lấy Cleaning fee
//   const cleaningFeeLabel = page.locator('p.underline.text-base', { hasText: 'Cleaning fee' });
//   await expect(cleaningFeeLabel.first()).toBeVisible();

//   const cleaningFeeValueLocator = cleaningFeeLabel.locator(
//     'xpath=following-sibling::p[contains(@class,"font-mono")]'
//   );
//   await expect(cleaningFeeValueLocator.first()).toBeVisible();

//   const cleaningFeeText = await cleaningFeeValueLocator.first().textContent();
//   expect(cleaningFeeText).not.toBeNull();

//   const cleaningFee = Number(cleaningFeeText?.replace(/[^0-9]/g, ''));
//   expect(cleaningFee).toBeGreaterThanOrEqual(0);

//   //  Lấy Total before taxes (đã fix selector)
//   const totalBeforeTaxesLocator = page.locator(
//     'div.flex:has(p:has-text("Total before taxes")) >> p.font-mono.text-lg.font-bold'
//   );
//   await expect(totalBeforeTaxesLocator.first()).toBeVisible();

//   const totalText = await totalBeforeTaxesLocator.first().textContent();
//   console.log('💬 totalText:', totalText);
//   expect(totalText).not.toBeNull();

//   const totalUI = Number(totalText?.replace(/[^0-9]/g, ''));

//   //  Tính tổng dự kiến
//   const expectedTotal = pricePerNight * numberOfNights + cleaningFee;

//   console.log({
//     pricePerNight,
//     numberOfNights,
//     cleaningFee,
//     expectedTotal,
//     totalUI,
//   });

//   //  So sánh kết quả
//   expect(totalUI).toBe(expectedTotal);
// });
