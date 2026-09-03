/* CẤU HÌNH FIREBASE — chỉ cần sửa file này để bật đồng bộ dữ liệu qua internet.
   Nếu để trống (như mặc định), app vẫn chạy bình thường, chỉ lưu trên máy (không đồng bộ).

   Cách lấy config (miễn phí, không cần thẻ tín dụng):
   1. Vào https://console.firebase.google.com → đăng nhập bằng tài khoản Google.
   2. Tạo project mới (đặt tên tuỳ ý, ví dụ "hoc-tu-vung").
   3. Trong project → biểu tượng "</>" (Add app / Web app) → đặt tên app → Register app.
      Firebase sẽ hiện ra một đoạn "firebaseConfig = {...}" — copy các giá trị vào bên dưới.
   4. Vào mục "Build" → "Realtime Database" → "Create Database" → chọn chế độ
      "Start in test mode" (đủ dùng cho app gia đình quy mô nhỏ).
   5. Lưu file này lại, deploy lại lên Netlify — vậy là xong. */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDStfe16zJPNQryM4huemeIerkVHEf-lzw",
  authDomain: "app-hoc-tu-vung-lop-3.firebaseapp.com",
  databaseURL: "https://app-hoc-tu-vung-lop-3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "app-hoc-tu-vung-lop-3",
  storageBucket: "app-hoc-tu-vung-lop-3.firebasestorage.app",
  messagingSenderId: "729276165558",
  appId: "1:729276165558:web:b23f2eaa2787244586e517"
};

/* Mã định danh "gia đình" — chỉ 1 gia đình dùng chung, không cần đổi. */
const FAMILY_ID = "home";
