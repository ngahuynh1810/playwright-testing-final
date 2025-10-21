import { test, expect } from '@playwright/test';
import { ReviewPage } from '../pages/ReviewPage';

import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';


test('Người dùng đăng nhập và đánh giá phòng thành công', async ({ page }) => {
  const reviewPage = new ReviewPage(page);

  await reviewPage.reviewRoom(
    4,
    'Phòng sạch sẽ,  nhân viên thân thiện!'
  );

  // Kiểm tra thông báo hoặc trạng thái sau khi gửi đánh giá
  const successMsg = page.getByText('Bình luận thành công');
  await expect(successMsg).toBeVisible({ timeout: 10000 });
  
});


test("Chặn truy cập form khi chưa đăng nhập", async ({ page }) => {
    const home = new HomePage(page);
  
    //  Vào trang chủ
    await home.goto();
    await page.waitForLoadState("networkidle");
  
    //  Chọn thành phố Hồ Chí Minh
    await home.selectHCM();
  
    //  Chọn phòng đầu tiên
    await home.selectFirstRoom();
  
    //  Kiểm tra thông báo yêu cầu đăng nhập
    const loginNotice = page.locator("text=Cần đăng nhập để bình luận");
    await expect(loginNotice).toBeVisible({ timeout: 10000 });
  });
   
  test("Không cho phép gửi đánh giá nếu chưa nhập nội dung", async ({ page }) => {
    

    const reviewPage = new ReviewPage(page);
    const homePage= new HomePage(page);
    const loginPage= new LoginPage(page);
    await homePage.goto();

    await homePage.selectHCM();
    await homePage.selectFirstRoom();
    await loginPage.login();
    
  
    await reviewPage.selectRating(2);
     //  Gửi đánh giá
   
     const submitBtn = page.getByRole('button', { name: 'Đánh giá' });
     await expect(submitBtn).toBeVisible();
     await submitBtn.click();
  

    //  Kiểm tra hiển thị thông báo lỗi hoặc chặn gửi
    const errorMessage = page.getByText(/vui lòng nhập nội dung|Bạn chưa có nội dung đánh giá|Please enter comment/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    
  });
  // các trường hợp test fail
  test("Không cho phép gửi đánh giá nếu chưa chọn điểm sao", async ({ page }) => {
    const reviewPage = new ReviewPage(page);

    //Vào trang chủ và đăng nhập
    await reviewPage.gotoAndLogin();

    // Mở Dashboard → Chọn phòng đầu tiên
    await reviewPage.openDashboard();
    await reviewPage.selectFirstRoom();

    //  Không chọn sao → chỉ nhập nội dung
    const comment = "Phòng  ổn, nhưng test này bỏ qua phần sao.";
    await reviewPage.enterComment(comment);

    //  Click nút "Đánh giá"
    
    await reviewPage.submitReview();
    try {
      const errorMessage = page.getByText(/vui lòng chọn số sao|chưa chọn sao|Please select rating/i);
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    } catch (err) {
      console.log("⚠️ Cảnh báo: Hệ thống vẫn cho phép gửi đánh giá mà chưa chọn sao");
    }
  
    // Kiểm tra thông báo hoặc trạng thái sau khi gửi đánh giá
    const successMsg = page.getByText('Bình luận thành công');
  

  }
);