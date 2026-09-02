# SPEC — App học từ vựng Tiếng Anh 3 (Global Success)

## 1. Bối cảnh & mục tiêu

- **Người học chính:** con trai 8 tuổi, học sách *Tiếng Anh 3 – Global Success* (bộ GD&ĐT hiện hành).
- **Người dùng thứ hai:** phụ huynh — theo dõi tiến độ, biết con hay sai từ gì, gợi ý nên ôn gì.
- **Mục tiêu học tập** (cả hai như nhau, không ưu tiên cái nào hơn):
  1. Bám sát đúng nội dung đang học ở trường (đúng Unit, đúng từ/câu trong sách).
  2. Giúp nhớ lâu dài qua cơ chế ôn tập lặp lại (không học một lần rồi quên).
- **Vai trò của tài liệu này:** đây là spec **định hướng phát triển tiếp** — mô tả app *nên* trở thành gì, không chỉ ghi lại hiện trạng. Mô tả toàn bộ tầm nhìn cuối cùng, không chia giai đoạn (việc chia nhỏ để code sẽ tính sau, ngoài phạm vi SPEC này).

## 2. Phạm vi nội dung

### 2.1 Chương trình từ vựng
- Mở rộng từ 12 Unit hiện tại lên **đủ 20 Unit** (cả năm học), đúng theo sách Global Success 3.
- **Nguồn nội dung:** không có sẵn file/ảnh sách gốc — cần tự tra cứu tài liệu/giáo trình Global Success 3 để dựng bộ từ + câu chính xác, đầy đủ theo từng Unit.
  - ⚠️ Lưu ý rủi ro: vì không đối chiếu trực tiếp với bản in con đang cầm, nội dung có thể lệch nhẹ so với ấn bản cụ thể của trường (khác lần tái bản, khác thứ tự bài...). Cần phụ huynh rà soát lại sau khi có bản dựng đầu tiên.

### 2.2 Dữ liệu cho mỗi từ
Mở rộng từ 3 trường hiện tại (từ tiếng Anh, IPA, nghĩa tiếng Việt) thành:
- Từ tiếng Anh
- Phiên âm IPA
- Nghĩa tiếng Việt
- Câu ví dụ (tiếng Anh, dùng từ đó trong ngữ cảnh của Unit)
- Hình minh hoạ — **vẽ bằng SVG/CSS trực tiếp trong code** (không dùng file ảnh rời, để giữ nguyên tắc 1 file HTML)

### 2.3 Mẫu câu giao tiếp theo Unit
- Mỗi Unit có thêm một bộ **mẫu câu giao tiếp cơ bản** lấy từ sách (ví dụ "What's your name?", "How are you?"...) để hỗ trợ chế độ luyện câu (mục 3).

## 3. Chế độ học

### Giữ nguyên 4 chế độ hiện có (áp dụng cho từ vựng):
1. 👀 Nhìn và nghe
2. 🎯 Chọn nghĩa
3. 🧱 Xếp chữ cái
4. ✍️ Viết lại từ

### Thêm 3 chế độ mới:
5. **🖼️ Nhìn hình đoán từ** — xem hình minh hoạ SVG, chọn/gõ đúng từ tiếng Anh.
6. **💬 Luyện mẫu câu** — nghe/đọc mẫu câu giao tiếp của Unit, ghép câu hoặc điền từ còn thiếu vào câu.
7. **🎧 Nghe chép chính tả (dictation)** — chỉ nghe phát âm (không hiện chữ/nghĩa trước), gõ lại từ nghe được.

Tất cả chế độ dùng chung engine chọn bài/vòng học hiện có (chọn Unit → chọn chế độ → vòng 10 câu ưu tiên từ yếu).

## 4. Hệ thống ghi nhớ & ôn tập

- Giữ cơ chế hiện tại: mỗi từ có `{n: số lần làm, c: số lần đúng}`, vòng học ưu tiên từ có tỉ lệ đúng thấp.
- Bổ sung logic **ôn tập lặp lại theo thời gian** (spaced repetition đơn giản, phù hợp trẻ 8 tuổi): từ đã đúng liên tiếp nhiều lần thì giãn cách xa hơn trước khi xuất hiện lại; từ hay sai thì quay lại sớm hơn.
- Ngưỡng "đã thuộc" một từ: đúng liên tiếp ≥3 lần gần nhất (giữ tương tự ngưỡng hiện tại `c>=3`, có thể tinh chỉnh khi code).

## 5. Giao diện & phong cách hình ảnh

- **Phong cách:** lấy cảm hứng từ tông màu và hiệu ứng đồ hoạ kiểu phim siêu anh hùng (rực rỡ, hiệu ứng ánh sáng/chuyển động kiểu 3D) — **không dùng nhân vật, logo hay tên riêng của Marvel/Avengers** (vấn đề bản quyền). Không cần mascot nhân vật cụ thể, chỉ cần "cảm giác" hoành tráng qua màu sắc/hiệu ứng.
- Toàn bộ hình ảnh minh hoạ và hiệu ứng vẽ bằng SVG/CSS/Canvas trong code, không dùng ảnh ngoài.
- **Game hoá:**
  - Huy hiệu/phần thưởng khi hoàn thành Unit hoặc đạt điểm cao.
  - Hiệu ứng âm thanh vui nhộn khi trả lời đúng/sai (tạo bằng Web Audio API, không cần file âm thanh rời).

## 6. Báo cáo cho phụ huynh

- Trang riêng **`parent.html`**, tách khỏi trang học của con, cùng nằm trên 1 site Netlify.
- **Truy cập từ xa:** phụ huynh mở `parent.html` trên điện thoại (bất kỳ đâu có mạng), không cần ở cùng thiết bị với con.
- **Bảo vệ bằng mã PIN đơn giản** (vài số) trước khi vào xem báo cáo — đủ dùng cho quy mô gia đình, không cần hệ thống đăng nhập phức tạp.
- Nội dung báo cáo **chi tiết theo thời gian**:
  - Lịch sử học theo ngày/tuần.
  - Biểu đồ tiến bộ.
  - Danh sách từ hay sai để phụ huynh kèm riêng.
  - Gợi ý nên ôn/học Unit hoặc từ nào tiếp theo, dựa trên lịch sử sai.
- Dữ liệu tiến độ được **đồng bộ qua Firebase** (mục 7) để trang `parent.html` đọc được dù đang mở trên thiết bị khác với iPad của con.

## 7. Ràng buộc & kiến trúc kỹ thuật

- **Cấu trúc site:** 2 trang tĩnh trên cùng 1 site Netlify:
  - `index.html` — trang học của con, thêm được vào màn hình chính iPad (PWA: `manifest.json` + icon + service worker) để con chạm icon là vào học ngay, không cần mở trình duyệt/gõ địa chỉ.
  - `parent.html` — trang báo cáo của ba mẹ, có khoá PIN, mở từ điện thoại qua cùng địa chỉ site.
- **Đồng bộ dữ liệu:** dùng **Firebase** (Realtime Database hoặc Firestore, gói Spark miễn phí) làm nơi lưu tiến độ dùng chung — không cần server riêng, không cần thẻ tín dụng, đồng bộ gần như tức thời.
  - Trang con vẫn ghi tiến độ vào `localStorage` trước (để học mượt kể cả mất mạng), rồi đồng bộ lên Firebase khi có mạng.
  - Trang ba mẹ đọc trực tiếp từ Firebase.
  - Chỉ có 1 "gia đình" dùng chung 1 Firebase project — không cần hệ thống multi-user/OAuth.
- **Offline cho trang con:** dùng service worker cache lại toàn bộ trang + dữ liệu Unit, để con vẫn học được khi mất mạng; phần đồng bộ lên Firebase sẽ tự chạy lại khi có mạng.
- **Hosting & chi phí:** Netlify (free) cho hosting + Firebase Spark (free) cho dữ liệu — toàn bộ giải pháp 100% miễn phí ở quy mô dùng gia đình.
- Giọng đọc: tiếp tục dùng Web Speech API (`speechSynthesis`) như hiện tại, có chọn giọng.
- Hình ảnh minh hoạ: vẽ bằng SVG/CSS trực tiếp trong code, không dùng file ảnh rời.

## 8. Ngoài phạm vi (Non-goals)

- Không xây hệ thống đăng nhập/tài khoản nhiều người dùng — chỉ 1 gia đình, bảo vệ bằng PIN đơn giản, không phải bảo mật cấp doanh nghiệp.
- Không dùng hình ảnh, tên, hoặc đặc điểm nhận diện của nhân vật Marvel/Avengers thật.
- Không tự dựng backend/server riêng — chỉ dùng dịch vụ có sẵn (Firebase) ở gói miễn phí.

## 9. Việc cần làm trước khi code (mở)

- Kiểm tra lại bản demo Netlify từ phiên chat trước (nếu còn link) để tận dụng những gì đã làm, tránh làm trùng.
- Tạo Firebase project miễn phí (chỉ cần tài khoản Google) và lấy config để gắn vào code.
- Dựng bộ dữ liệu đầy đủ 20 Unit (từ + IPA + nghĩa + câu ví dụ + mẫu câu giao tiếp) dựa trên tra cứu chương trình Global Success 3 — cần phụ huynh xác nhận/đối chiếu lại với sách thật của con sau khi có bản nháp.
- Thiết kế cụ thể bảng màu/hiệu ứng "phong cách siêu anh hùng" (không nhân vật cụ thể).
- Thiết kế chi tiết 3 chế độ học mới (luật chấm điểm, giao diện) trước khi code.
