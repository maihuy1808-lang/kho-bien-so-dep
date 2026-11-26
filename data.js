/* =========================================================
   DỮ LIỆU WEBSITE – anh Huy sửa trực tiếp ở file này
   ========================================================= */

var SITE = {
  ten: "KHO BIỂN SỐ ĐẸP",
  chuSoHuu: "Mai Xuân Huy",
  khuVuc: "Ninh Bình",
  tenMien: "maixuanhuy.id.vn",
  hotline: "0326583583",  // để trống thì nút Gọi sẽ hiện "Đang cập nhật"
  zalo: "0326583583",     // Số Zalo
  messenger: "https://m.me/100066882069496",
  facebook: "https://www.facebook.com/profile.php?id=100066882069496",
  tiktok: "https://www.tiktok.com/@mrxuanhuy",
  khauHieu: "Chuyên nghiệp – Nhiệt tình – Trung thực",
  gioHoTro: "8h – 22h30"
};

/* ---------------------------------------------------------
   DANH SÁCH BIỂN SỐ
   Mỗi dòng: [đầu biển, đuôi số, loại xe, giá, trạng thái]
   - đầu biển: "35A" (ô tô) hoặc "35B1" (xe máy)
   - đuôi số: "999.99" hoặc "7777.7"
   - loại xe: "oto" hoặc "xemay"
   - giá: số tiền (đồng) hoặc 0 = "Liên hệ"
   - trạng thái: "con" (còn), "coc" (đã cọc), "ban" (đã bán),
                 "trung" (biển đã trúng đấu giá, đang chào bán – có nhãn vàng)
   Loại biển (ngũ quý, thần tài…), số nút và mệnh được web tự tính.
   Nguồn: các video biển số trên TikTok @mrxuanhuy (11/2026).
   Anh Huy kiểm tra lại tình trạng còn/đã bán và điền giá nếu muốn.
   --------------------------------------------------------- */
var PLATES = [
  ["35A", "999.29", "oto", 0, "con"],
  ["35A", "977.79", "oto", 0, "con"],
  ["35A", "968.69", "oto", 0, "con"],
  ["35A", "966.86", "oto", 0, "con"],
  ["35A", "885.55", "oto", 0, "con"],
  ["35A", "983.83", "oto", 0, "con"],
  ["35B", "268.86", "oto", 0, "con"],

  /* Biển đã trúng đấu giá, anh Huy đang chào bán – từ 34 ảnh "Trúng đấu giá"
     (thư mục OneDrive Desktop\Biển số xe, bước giá 5.000.000) */
  ["35A", "626.89", "oto", 0, "trung"],
  ["35A", "882.86", "oto", 0, "trung"],
  ["35A", "859.79", "oto", 0, "trung"],
  ["35A", "958.58", "oto", 0, "trung"],
  ["35A", "856.56", "oto", 0, "trung"],
  ["35A", "956.89", "oto", 0, "trung"],
  ["35A", "922.88", "oto", 0, "trung"],
  ["35A", "862.22", "oto", 0, "trung"],
  ["35A", "836.89", "oto", 0, "trung"],
  ["35A", "839.89", "oto", 0, "trung"],
  ["35A", "926.26", "oto", 0, "trung"],
  ["35A", "826.88", "oto", 0, "trung"],
  ["35A", "828.68", "oto", 0, "trung"],
  ["35A", "825.55", "oto", 0, "trung"],
  ["35A", "832.22", "oto", 0, "trung"],
  ["35A", "928.68", "oto", 0, "trung"],
  ["35A", "829.89", "oto", 0, "trung"],
  ["35A", "668.82", "oto", 0, "trung"],
  ["35A", "998.88", "oto", 0, "trung"],
  ["35A", "880.99", "oto", 0, "trung"],
  ["35A", "999.62", "oto", 0, "trung"],
  ["35A", "868.69", "oto", 0, "trung"],
  ["35A", "879.86", "oto", 0, "trung"],
  ["35A", "896.96", "oto", 0, "trung"],
  ["35A", "887.99", "oto", 0, "trung"],
  ["35A", "938.68", "oto", 0, "trung"],
  ["35A", "796.96", "oto", 0, "trung"],
  ["35A", "798.79", "oto", 0, "trung"],
  ["35A", "778.89", "oto", 0, "trung"],
  ["35A", "668.28", "oto", 0, "trung"],
  ["35A", "778.99", "oto", 0, "trung"],
  ["35A", "695.99", "oto", 0, "trung"],
  ["35A", "685.99", "oto", 0, "trung"],
  ["35A", "599.98", "oto", 0, "trung"]
];

/* Mã tỉnh dùng trong bộ lọc (có thể thêm) */
var PROVINCES = [
  ["35", "35 – Ninh Bình"], ["29", "29 – Hà Nội"], ["30", "30 – Hà Nội"],
  ["15", "15 – Hải Phòng"], ["99", "99 – Bắc Ninh"], ["37", "37 – Nghệ An"],
  ["51", "51 – TP.HCM"]
];

/* Bài viết */
var POSTS = [
  { t: "Hướng dẫn đấu giá biển số ô tô từng bước", d: "Đăng ký tài khoản, nộp tiền đặt trước, tham gia phiên trực tuyến và nhận kết quả.", tag: "Đấu giá" },
  { t: "Cách xem biển số hợp mệnh, hợp tuổi", d: "Cách tính số nút, ngũ hành của biển và đối chiếu với năm sinh chủ xe.", tag: "Phong thủy" },
  { t: "Biển trúng đấu giá có chuyển nhượng được không?", d: "Những điểm cần biết về quy định khi mua bán xe gắn biển trúng đấu giá.", tag: "Pháp lý" }
];
