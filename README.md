# Playwright Testing Final - Hướng dẫn Setup và Chạy Test

## Yêu cầu hệ thống
- Node.js v18+ (đã cài: v22.20.0 ✅)
- npm v8+ (đã cài: v10.9.3 ✅)
- Truy cập internet (để cài Playwright browsers)

## Vấn đề hiện tại
❌ **Mạng công ty chặn npm registry** → không thể cài dependencies.

## Giải pháp

### A. Tại mạng công ty (proxy/firewall)
1. **Cấu hình proxy** (nếu IT cung cấp):
   ```powershell
   npm config set proxy http://proxy.company.com:port
   npm config set https-proxy https://proxy.company.com:port
   ```

2. **Hoặc dùng npm offline** (nếu có cache):
   ```powershell
   npm install --prefer-offline --no-audit
   ```

### B. Tại nhà/wifi cá nhân (khuyến nghị)
```powershell
# 1. Vào thư mục root
cd D:\99_TEMP_WORKSPACE\00_Personal\Testing05\playwright-testing-final

# 2. Cài dependencies
npm install

# 3. Cài Playwright browsers
npx playwright install

# 4. Chạy tất cả test
npx playwright test

# 5. Chạy riêng login tests
npx playwright test booking/booking-tests/tests/login*.spec.ts

# 6. Mở UI runner
npx playwright test --ui

# 7. Xem báo cáo
npx playwright show-report
```

## Cấu trúc Test Hiện Có

### Root Tests (`/tests-examples/`)
- `demo-todo-app.spec.ts` - Example Playwright test

### Booking Tests (`/booking/booking-tests/tests/`)
- `login.spec.ts` - Happy path login
- `login-negative.spec.ts` - Sai password, bỏ trống form
- `login-extended.spec.ts` - Các kịch bản login mở rộng
- `booking.spec.ts` - End-to-end booking flows

### Page Objects (`/booking/booking-tests/pages/`)
- `HomePage.ts` - Trang chủ, chọn thành phố, phòng
- `LoginPage.ts` - Đăng nhập (có methods mới: loginWith, getErrorMessages)
- `RoomDetailPage.ts` - Chi tiết phòng, chọn ngày, đặt phòng

## Test Coverage

### ✅ Đã có
- Login thành công/thất bại
- Booking với validation ngày, khách, giá
- UI elements visibility
- Error handling

### 🔄 Cần bổ sung (khi có mạng)
- Visual regression tests
- Performance tests
- API integration tests
- Cross-browser compatibility
- Accessibility tests

## Lệnh hữu ích

```powershell
# Chạy test với browser hiển thị
npx playwright test --headed

# Chạy test cụ thể
npx playwright test tests/login.spec.ts

# Debug test
npx playwright test --debug

# Generate code
npx playwright codegen https://demo4.cybersoft.edu.vn/

# Update snapshots (nếu có)
npx playwright test --update-snapshots
```

## Environment Variables

Tạo file `.env` trong `/booking/booking-tests/`:
```env
MYAPP_USERNAME=your-email@example.com
MYAPP_PASSWORD=your-password
BASE_URL=https://demo4.cybersoft.edu.vn/
```

## Troubleshooting

### Network Issues
- Kiểm tra proxy: `npm config get proxy`
- Test DNS: `nslookup registry.npmjs.org`
- Alternative registry: `npm config set registry https://registry.npmmirror.com`

### Test Failures
- Clear browser data: `npx playwright test --reset-state`
- Update browsers: `npx playwright install --force`
- Check selectors: elements có thể thay đổi

---

**Ghi chú**: Repository này đang ở branch `feature/new-branch` với 5 files mới được commit gần đây.
