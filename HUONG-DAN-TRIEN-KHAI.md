# Hướng dẫn triển khai app: Code ↔ GitHub ↔ Netlify ↔ Firebase

> File này viết để dùng lại cho **mọi app tương lai**, không riêng gì app học từ vựng này.
> Khi làm app mới, copy file này sang thư mục app mới rồi chỉnh lại tên/đường dẫn cho đúng.

---

## 0. Sơ đồ tổng quan — 4 mảnh ghép làm gì

| Dịch vụ | Vai trò | Có tốn phí không |
|---|---|---|
| **Claude Code** | Nơi Claude đọc/sửa code trong 1 thư mục trên máy bạn | Theo gói Claude bạn đang dùng |
| **GitHub** | Lưu trữ + lịch sử code (bản sao lưu vĩnh viễn, không phải nơi chạy app) | Miễn phí |
| **Netlify** | Lấy code từ GitHub, biến thành trang web thật chạy được (hosting) | Miễn phí (có hạn mức deploy/tháng) |
| **Firebase** | Lưu **dữ liệu** app tạo ra khi dùng (VD: tiến trình học), đồng bộ nhiều thiết bị | Miễn phí (gói Spark) |

Ghi nhớ quan trọng nhất: **GitHub/Netlify chỉ liên quan đến CODE. Firebase chỉ liên quan đến DỮ LIỆU.** Hai nhóm này độc lập hoàn toàn — đổi tên/deploy lỗi bên Netlify không bao giờ ảnh hưởng tới Firebase và ngược lại.

---

## 1. Bắt đầu 1 app mới trong Claude Code

1. Tạo sẵn 1 thư mục trống trên máy (VD trong Windows Explorer): `...\AI\09. Tên app mới`.
2. Trong Claude Code, bấm **"+ New"** (không phải dấu "+" cạnh 1 project có sẵn — cái đó chỉ thêm phiên chat vào project cũ).
3. Khi được hỏi thư mục làm việc, chọn đúng thư mục trống vừa tạo ở bước 1.
4. Nhờ Claude khởi tạo code như bình thường.

**Lưu ý:** mỗi app = 1 thư mục riêng = 1 git repo riêng = 1 site Netlify riêng = 1 project Firebase riêng. Không dùng chung Firebase project cho 2 app khác nhau (dữ liệu sẽ lẫn lộn).

---

## 2. Đưa code lên GitHub lần đầu (chỉ làm 1 lần/app)

**Cần có sẵn:** tài khoản GitHub, app **GitHub Desktop** (tải tại desktop.github.com, đăng nhập bằng Google nếu tài khoản GitHub gắn Google).

1. Nhờ Claude chạy `git init` + `git add` + `git commit` đầu tiên trong thư mục app (Claude làm được qua lệnh, an toàn, chỉ lưu ở máy).
2. Mở **GitHub Desktop → File → Add local repository** → chọn đúng thư mục app.
3. Bấm **Publish repository** → đặt tên repo → Public hay Private tuỳ ý (không ảnh hưởng bảo mật dữ liệu, vì key Firebase vốn được thiết kế để công khai) → **Publish**.

**Từ lần 2 trở đi, mỗi khi Claude sửa code xong:**
1. Mở GitHub Desktop.
2. Thấy danh sách file đổi ở tab **Changes**.
3. Gõ 1 dòng mô tả ngắn vào ô **Summary**.
4. Bấm **Commit to master**.
5. Bấm **Push origin** (nút này xuất hiện sau khi Commit xong, thay cho "Fetch origin").

Nếu gặp lỗi `could not lock config file .git/config` → chỉ là lỗi khoá tạm thời, đóng mở lại GitHub Desktop hoặc nhờ Claude commit hộ qua lệnh là hết.

---

## 3. Đưa web lên Netlify (chỉ cấu hình 1 lần/app)

1. Vào **app.netlify.com** → đăng nhập.
2. **Add new site → Import an existing project → Deploy with GitHub** → chọn đúng repo vừa tạo ở bước 2.
3. Cấu hình build: **Build command** để trống, **Publish directory** = `.` (dấu chấm) — vì đây là site tĩnh (HTML/CSS/JS thuần, không cần build).
4. Bấm **Deploy site**.
5. **Quan trọng — chống "trang trắng" khi người khác mở link:** vào **Project overview**, nếu thấy nhãn **"🔒 Private"** cạnh tên project, bấm nút **"Make public"**. Nếu không làm bước này, chỉ trình duyệt đã đăng nhập Netlify (của bạn) mới xem được, mọi thiết bị khác sẽ bị chặn trắng trang.
6. (Tuỳ chọn) Đổi tên project cho dễ nhớ: **Project configuration → Change project name**. Đổi tên **không ảnh hưởng gì đến Firebase hay dữ liệu** — chỉ đổi địa chỉ web.

**Từ lần 2 trở đi:** không cần làm gì ở Netlify nữa — mỗi lần bạn Push code (mục 2), Netlify **tự động** deploy lại sau ~30 giây–1 phút.

**Nếu thấy banner "operational credits" / "production deploys are paused":** nghĩa là hết hạn mức deploy miễn phí của tháng (không phải bị tính phí). Site cũ vẫn chạy bình thường, chỉ là chưa lên được bản mới. Cứ tiếp tục Push bình thường — Netlify sẽ tự deploy hết các commit đang chờ khi hạn mức làm mới (thường theo tháng), không cần làm lại gì.

---

## 4. Cấu hình Firebase (chỉ làm 1 lần/app, nếu app cần đồng bộ dữ liệu)

1. Vào **console.firebase.google.com** → đăng nhập → **Add project** → đặt tên → tắt Google Analytics (không cần) → **Create project**.
2. Trong project, bấm biểu tượng **`</>`** (Web) → đặt tên app → **KHÔNG** tick "Firebase Hosting" (đã dùng Netlify) → **Register app**.
3. Copy đoạn `const firebaseConfig = {...}` hiện ra → dán vào file cấu hình Firebase của app (VD `firebase-config.js`).
4. Vào **Build → Realtime Database → Create Database** → chọn vị trí **Singapore (asia-southeast1)** (gần Việt Nam nhất) → chọn **Start in test mode** → **Enable**.
5. Copy đúng đường link hiện ngay trên khung dữ liệu (dạng `https://ten-du-an-default-rtdb.asia-southeast1.firebasedatabase.app`) → dán vào trường `databaseURL` trong file cấu hình.
6. Vào tab **Rules**, sửa thành (phù hợp app gia đình dùng nội bộ, không cần khoá chặt):
   ```json
   { "rules": { ".read": true, ".write": true } }
   ```
   Bấm **Publish**.
7. Push code (mục 2) để đưa cấu hình Firebase lên bản thật.

**Backup dữ liệu định kỳ (nên làm mỗi vài tháng):** Firebase Console → Realtime Database → nút **⋮** (3 chấm) góc trên khung dữ liệu → **Export JSON** → lưu file lại.

---

## 5. Quy trình lặp lại hằng ngày (khi Claude đã sửa code xong)

```
1. GitHub Desktop → Commit → Push
2. Đợi ~1 phút
3. Mở lại site, kiểm tra
```
Chỉ vậy thôi — Netlify và Firebase tự vận hành, không cần đụng vào.

---

## 6. Xử lý sự cố thường gặp

| Hiện tượng | Nguyên nhân thường gặp | Cách kiểm tra/sửa |
|---|---|---|
| Trang trắng trên điện thoại nhưng laptop vẫn thấy | Site Netlify đang **Private** | Netlify → "Make public" |
| Push code xong mà web không đổi gì | Netlify hết credit deploy tháng đó | Kiểm tra banner "operational credits" ở trang Netlify; đợi qua tháng hoặc nâng cấp gói |
| GitHub Desktop báo lỗi `could not lock config file` | File khoá git bị kẹt tạm thời | Đóng mở lại GitHub Desktop; hoặc nhờ Claude commit qua lệnh |
| Đổi cài đặt ở 1 thiết bị, thiết bị khác không thấy | Firebase chưa kết nối được (mạng chậm/site đang Private) | Kiểm tra lại theo đúng thứ tự mục 3 → 4 |
| Nghi ngờ dữ liệu Firebase bị sai/thiếu trường | Firebase tự xoá field rỗng (mảng `[]`, object `{}`) khi lưu — hành vi mặc định của Firebase | Đã có sẵn lớp bảo vệ trong code (`emptyProgress()`/`emptyCustom()`), không cần làm gì thêm |

---

*File này do Claude tạo ngày 2026-09-03 trong lúc triển khai app "Tiếng Anh 3 · Global Success". Giữ lại làm mẫu tham khảo cho các app sau.*
