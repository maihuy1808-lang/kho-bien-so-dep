/* =========================================================
   BỘ TẠO TRANG CHO GOOGLE (SEO)
   Từ data.js tạo ra:
   - /bien/<biển>/          : trang riêng từng biển (vd /bien/35a-888-88/)
   - /<chủ đề>/             : trang chủ đề (biển ngũ quý, biển xe máy, đấu giá…)
   - sitemap.xml, robots.txt
   - mục "Danh mục biển số" chèn vào cuối trang chủ
   Chạy tự động trên GitHub mỗi khi data.js thay đổi (seo/build.js).
   ========================================================= */
(function (root) {
  "use strict";
  var BASE = "https://maixuanhuy.id.vn";
  var CSS_V = "seo6";

  /* ---- Nhận diện loại biển (giống app.js) ---- */
  var HANH = ["Thổ", "Thủy", "Hỏa", "Mộc", "Kim", "Thổ", "Thủy", "Hỏa", "Mộc", "Kim"];
  var SINH = { "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc", "Mộc": "Hỏa", "Hỏa": "Thổ" };
  /* ---- Bảng tra biển hợp tuổi (cùng công thức với app.js) ---- */
  var CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  var CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  var CHI_VAL = [0, 0, 1, 1, 2, 2, 0, 0, 1, 1, 2, 2];
  var MENH_BY_SUM = [null, "Kim", "Thủy", "Hỏa", "Thổ", "Mộc"];
  var SO_CUA_HANH = { "Kim": "4, 9", "Mộc": "3, 8", "Thủy": "1, 6", "Hỏa": "2, 7", "Thổ": "5, 0" };
  function yearInfo(y) {
    var ci = ((y - 4) % 10 + 10) % 10, zi = ((y - 4) % 12 + 12) % 12;
    var s = Math.floor(ci / 2) + 1 + CHI_VAL[zi]; if (s > 5) s -= 5;
    return { canchi: CAN[ci] + " " + CHI[zi], menh: MENH_BY_SUM[s] };
  }
  function hopTuoiTable(from, to) {
    var rows = "";
    for (var y = from; y <= to; y++) {
      var info = yearInfo(y), helper = Object.keys(SINH).filter(function (k) { return SINH[k] === info.menh; })[0];
      rows += "<tr><td><b>" + y + "</b></td><td>" + info.canchi + "</td><td>" + info.menh + "</td><td>" + info.menh + " (số cuối " + SO_CUA_HANH[info.menh] + "), " + helper + " (số cuối " + SO_CUA_HANH[helper] + ")</td></tr>";
    }
    return "<h2>Bảng tra biển số hợp tuổi " + from + " – " + to + '</h2><div class="tblw"><table class="htt"><thead><tr><th>Năm sinh</th><th>Can chi</th><th>Mệnh</th><th>Biển hợp (hành – số cuối)</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
  }
  function digits(s) { return String(s || "").replace(/\D/g, ""); }
  function nut(s) { var d = digits(s), t = 0; for (var i = 0; i < d.length; i++) t += +d[i]; var n = t % 10; return n === 0 ? 10 : n; }
  function classify(tail) {
    var d = digits(tail), L = d.length, tags = [];
    if (L < 4) return tags;
    var last = function (k) { return d.slice(-k); };
    var same = function (s) { return /^(\d)\1+$/.test(s); };
    var seq = function (s) { for (var i = 1; i < s.length; i++) if (+s[i] !== +s[i - 1] + 1) return false; return true; };
    var pal = function (s) { return s === s.split("").reverse().join(""); };
    if (L >= 5 && same(last(5))) tags.push("Ngũ quý");
    else if (same(last(4)) || same(d.slice(0, 4))) tags.push("Tứ quý");
    if (seq(L >= 5 ? last(5) : last(4)) || seq(last(4))) tags.push("Sảnh tiến");
    if (!tags.length && (same(last(3)) || (L >= 5 && same(d.slice(0, 3))))) tags.push("Tam hoa");
    if (/(39|79)$/.test(d)) tags.push("Thần tài");
    if (/(38|78)$/.test(d)) tags.push("Ông địa");
    if (/(68|86|88)$/.test(d) || /6868|8686/.test(d)) tags.push("Phát lộc");
    var l4 = last(4);
    if (l4[0] === l4[2] && l4[1] === l4[3] && l4[0] !== l4[1]) tags.push("Lặp kép");
    else if ((L >= 5 && pal(last(5)) && !same(last(5))) || (pal(l4) && !same(l4))) tags.push("Gánh");
    var pairs = (d.match(/(\d)\1/g) || []).length;
    if (pairs >= 2 && tags.indexOf("Ngũ quý") < 0 && tags.indexOf("Tứ quý") < 0) tags.push("Số kép");
    var y1 = +d.slice(0, 4), y2 = +l4;
    if ((y1 >= 1950 && y1 <= 2026) || (y2 >= 1950 && y2 <= 2026)) tags.push("Năm sinh");
    return tags;
  }

  /* ---- Tiện ích ---- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function money(v) {
    if (v >= 1e9) return (Math.round(v / 1e7) / 100).toLocaleString("vi-VN") + " tỷ";
    if (v >= 1e6) return (Math.round(v / 1e5) / 10).toLocaleString("vi-VN") + " triệu";
    return v.toLocaleString("vi-VN") + " đ";
  }
  function fmtDate(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? m[3] + "/" + m[2] + "/" + m[1] : ""; }
  function slugOf(pre, tail) { return (pre + "-" + tail).toLowerCase().replace(/[^0-9a-z]+/g, "-").replace(/^-|-$/g, ""); }
  function key(s) { return String(s || "").toUpperCase().replace(/[^0-9A-Z]/g, ""); }
  var ST = { con: "Còn biển", coc: "Đã cọc", ban: "Đã bán", trung: "Đang chào bán · biển đã trúng đấu giá" };
  function forSale(it) { return it.st === "con" || it.st === "coc" || it.st === "trung"; }
  function hotline(SITE) { return String(SITE.hotline || "").replace(/\s/g, ""); }
  function hotFmt(SITE) { return hotline(SITE).replace(/^(\d{4})(\d{3})(\d{3})$/, "$1.$2.$3"); }
  function jsonld(o) { return '<script type="application/ld+json">' + JSON.stringify(o).replace(/</g, "\\u003c") + "</script>"; }

  /* ---- Chủ đề ---- */
  var TOPICS = [
    { slug: "bien-so-dep-ninh-binh", h1: "Biển số đẹp Ninh Bình", kw: "biển số đẹp Ninh Bình",
      test: function (it) { return it.pre.indexOf("35") === 0; },
      intro: "Kho biển số đẹp Ninh Bình của Mr. Mai Xuân Huy: biển ô tô 35A, 35B và biển xe máy, đủ các dòng ngũ quý, tứ quý, tam hoa, thần tài, phát lộc. Giá công khai, cập nhật liên tục, hỗ trợ hồ sơ chuyển nhượng theo đúng quy định. Phục vụ khách cả tỉnh Ninh Bình, gồm Nam Định và Hà Nam cũ.",
      content: "<h2>Kho biển số đẹp Ninh Bình – phục vụ cả khách Nam Định, Hà Nam</h2>" +
        "<p>Từ ngày 01/07/2025, Nam Định và Hà Nam cũ đã sáp nhập vào tỉnh Ninh Bình. Biển số cấp mới và biển đưa ra đấu giá của tỉnh hiện dùng chung đầu <b>35</b>, nên khách ở Hoa Lư, Tam Điệp, Kim Sơn, Yên Mô, Nam Định, Phủ Lý, Duy Tiên… đều chọn biển 35 đẹp tại kho này.</p>" +
        "<h2>Vì sao chọn Kho Biển Số Đẹp Mai Xuân Huy?</h2><ul>" +
        "<li><b>Giá công khai</b> từng biển, không phải nhắn tin hỏi giá.</li>" +
        "<li><b>Dịch nghĩa và xem phong thủy</b> từng biển: số nút, ngũ hành, hợp tuổi nào.</li>" +
        "<li><b>Nhận đấu giá biển số hộ</b> trọn gói, theo sát phiên đấu giá trực tuyến.</li>" +
        "<li><b>Tư vấn xe VinFast kèm biển đẹp</b>, hỗ trợ hồ sơ chuyển nhượng xe gắn biển trúng đấu giá đúng luật.</li></ul>" +
        '<p>Xem theo loại: <a href="/bien-o-to/">biển số ô tô đẹp Ninh Bình</a> · <a href="/bien-xe-may/">biển số xe máy đẹp Ninh Bình</a> · <a href="/bien-ngu-quy/">biển ngũ quý</a> · <a href="/bien-than-tai/">biển thần tài</a> · <a href="/bien-so-hop-tuoi/">biển số hợp tuổi</a> · <a href="/dau-gia-bien-so-ninh-binh/">đấu giá biển số Ninh Bình</a> · <a href="/bien-so-ninh-binh-sau-sap-nhap/">biển số Ninh Bình sau sáp nhập</a>.</p>',
      faq: [
        ["Mua biển số đẹp Ninh Bình ở đâu uy tín?", "Kho Biển Số Đẹp Mai Xuân Huy (maixuanhuy.id.vn) công khai giá từng biển 35A, 35B và biển xe máy, kèm ý nghĩa phong thủy. Anh/chị gọi hoặc nhắn Zalo 0326.583.583 để xem biển và được tư vấn hồ sơ."],
        ["Biển số Ninh Bình sau sáp nhập là bao nhiêu?", "Nam Định và Hà Nam cũ đã sáp nhập vào tỉnh Ninh Bình từ 01/07/2025. Biển số cấp mới và biển đấu giá của tỉnh hiện dùng chung đầu 35."],
        ["Người Nam Định, Hà Nam mua biển số đẹp ở đâu?", "Nam Định, Hà Nam nay thuộc tỉnh Ninh Bình và dùng chung biển 35. Anh/chị chọn biển 35 đẹp ngay tại kho này, hoặc nhờ Mr. Mai Xuân Huy đấu giá hộ."],
        ["Biển số trúng đấu giá có bán lại được không?", 'Biển trúng đấu giá không được bán riêng tấm biển, nhưng được chuyển nhượng cùng với chiếc xe đang gắn biển. Xem chi tiết: <a href="/bien-trung-dau-gia-chuyen-nhuong/">biển số trúng đấu giá có được chuyển nhượng không</a>.'],
        ["Có biển số đẹp Ninh Bình giá rẻ không?", 'Có. Xem mục <a href="/bien-so-dep-gia-re/">biển số đẹp giá rẻ dưới 100 triệu</a>, gồm nhiều biển xe máy và biển ô tô tam hoa, phát lộc.']
      ] },
    { slug: "bien-so-ninh-binh-sau-sap-nhap", h1: "Biển số Ninh Bình sau sáp nhập: Nam Định, Hà Nam dùng chung biển 35", kw: "biển số Ninh Bình sau sáp nhập", always: true,
      test: function () { return false; },
      title: "Biển số Ninh Bình sau sáp nhập là bao nhiêu? Nam Định, Hà Nam dùng chung biển 35",
      desc: "Từ 01/07/2025 Nam Định, Hà Nam sáp nhập vào tỉnh Ninh Bình, biển cấp mới và biển đấu giá dùng chung đầu 35. Xe biển 18, 90 cũ có phải đổi không? Giải đáp và kho biển 35 đẹp.",
      intro: "Sau khi sắp xếp đơn vị hành chính, Nam Định và Hà Nam cũ đã sáp nhập vào tỉnh Ninh Bình. Dưới đây là giải đáp ngắn gọn về biển số xe của tỉnh từ ngày 01/07/2025.",
      fallbackTitle: "Biển số 35 đẹp đang chào bán",
      contentTop: "<h2>Biển số xe Ninh Bình mới là bao nhiêu?</h2>" +
        "<p>Biển số cấp mới và biển đưa ra đấu giá của tỉnh Ninh Bình hiện dùng chung đầu <b>35</b>, cho cả khách ở Ninh Bình, Nam Định và Hà Nam cũ:</p><ul>" +
        "<li><b>Ô tô:</b> 35A, 35B…</li>" +
        "<li><b>Xe máy:</b> 35AA, 35AB, 35AC, 35B1…</li></ul>" +
        "<h2>Xe đang mang biển 18 (Nam Định cũ) hoặc 90 (Hà Nam cũ) có phải đổi không?</h2>" +
        "<p>Xe đã được cấp biển 18 hoặc 90 trước đây <b>vẫn sử dụng bình thường</b>. Khi cần làm thủ tục đăng ký, sang tên, anh/chị liên hệ Phòng Cảnh sát giao thông Công an tỉnh để được hướng dẫn cụ thể.</p>" +
        "<h2>Người Nam Định, Hà Nam chọn biển 35 đẹp ở đâu?</h2>" +
        "<p>Vì cùng là tỉnh Ninh Bình, anh/chị ở Nam Định, Phủ Lý, Duy Tiên, Hải Hậu, Giao Thủy… có thể tham gia đấu giá biển 35 của tỉnh, hoặc nhận chuyển nhượng xe gắn biển 35 đẹp đã trúng đấu giá theo đúng quy định. Mr. Mai Xuân Huy hỗ trợ tư vấn trọn gói.</p>",
      content: '<p>Xem thêm: <a href="/bien-so-dep-ninh-binh/">kho biển số đẹp Ninh Bình</a> · <a href="/dau-gia-bien-so-ninh-binh/">đấu giá biển số Ninh Bình</a> · <a href="/bien-trung-dau-gia-chuyen-nhuong/">chuyển nhượng biển trúng đấu giá</a>.</p>',
      faq: [
        ["Biển số Ninh Bình mới là bao nhiêu?", "Biển số cấp mới và biển đấu giá của tỉnh Ninh Bình hiện dùng chung đầu 35 (ô tô 35A, 35B; xe máy 35AA, 35AB…)."],
        ["Biển số Nam Định sau sáp nhập là gì?", "Nam Định cũ đã sáp nhập vào tỉnh Ninh Bình, biển cấp mới dùng đầu 35. Xe đã mang biển 18 trước đây vẫn sử dụng bình thường."],
        ["Biển số Hà Nam sau sáp nhập là gì?", "Hà Nam cũ đã sáp nhập vào tỉnh Ninh Bình, biển cấp mới dùng đầu 35. Xe đã mang biển 90 trước đây vẫn sử dụng bình thường."],
        ["Biển 35AA, 35AB là ở đâu?", "35AA, 35AB, 35AC… là biển xe máy của tỉnh Ninh Bình."]
      ] },
    { slug: "bien-trung-dau-gia-chuyen-nhuong", h1: "Biển số trúng đấu giá có được chuyển nhượng, bán lại không?", kw: "chuyển nhượng biển số trúng đấu giá", always: true,
      test: function () { return false; },
      title: "Biển số trúng đấu giá có được chuyển nhượng, bán lại không? Quy định mới nhất",
      desc: "Biển số trúng đấu giá không được bán riêng, chỉ được chuyển nhượng cùng với xe theo Luật Trật tự, an toàn giao thông đường bộ 2024. Cách mua xe gắn biển đẹp trúng đấu giá đúng luật.",
      intro: "Đây là câu hỏi khách hỏi nhiều nhất khi muốn sở hữu biển số đẹp. Dưới đây là giải đáp theo Luật Trật tự, an toàn giao thông đường bộ 2024 và Nghị định 156/2024/NĐ-CP.",
      fallbackTitle: "Biển 35 đẹp đã trúng đấu giá đang chào bán cùng xe",
      contentTop: "<h2>Có được bán riêng biển số trúng đấu giá không?</h2>" +
        "<p><b>Không.</b> Theo Điều 38 Luật Trật tự, an toàn giao thông đường bộ 2024, người trúng đấu giá <b>không được chuyển nhượng, trao đổi, tặng cho, để thừa kế riêng tấm biển</b>. Biển chỉ đi kèm chiếc xe đã được đăng ký với biển đó.</p>" +
        "<h2>Vậy muốn sở hữu biển đẹp đã trúng đấu giá thì làm sao?</h2>" +
        "<p>Luật cho phép <b>chuyển nhượng chiếc xe đang gắn biển trúng đấu giá</b>. Người mua nhận chuyển nhượng xe rồi làm thủ tục đăng ký sang tên tại cơ quan Công an theo quy định. Vì vậy trên thị trường, biển đẹp trúng đấu giá được giao dịch <b>cùng với xe</b>.</p>" +
        "<h2>Các bước nhận chuyển nhượng xe gắn biển đẹp</h2><ol class=\"steps\">" +
        "<li><b>Chọn biển</b>Xem biển, giá và kiểm tra thông tin xe đang gắn biển.</li>" +
        "<li><b>Kiểm tra hồ sơ</b>Giấy đăng ký xe, thông tin chủ xe, tình trạng xe.</li>" +
        "<li><b>Lập hợp đồng chuyển nhượng xe</b>Theo đúng quy định pháp luật.</li>" +
        "<li><b>Đăng ký sang tên</b>Làm thủ tục tại cơ quan Công an có thẩm quyền.</li></ol>",
      content: "<h2>Một số quy định đấu giá biển số cần biết</h2><ul>" +
        "<li>Đấu giá biển số được tổ chức trực tuyến, trả giá lên (Nghị định 156/2024/NĐ-CP, hiệu lực từ 01/01/2025).</li>" +
        "<li>Bước giá: 5 triệu đồng với biển ô tô; 500 nghìn đồng với biển xe máy.</li>" +
        "<li>Biển số xe máy cũng được đưa ra đấu giá từ 01/01/2025.</li></ul>" +
        '<p>Mr. Mai Xuân Huy hỗ trợ kiểm tra hồ sơ và thủ tục chuyển nhượng trọn gói. Xem thêm: <a href="/dau-gia-bien-so-ninh-binh/">đấu giá biển số Ninh Bình</a> · <a href="/bien-o-to/">biển số ô tô đẹp Ninh Bình</a>.</p>',
      faq: [
        ["Biển số trúng đấu giá có được chuyển nhượng không?", "Không được chuyển nhượng riêng tấm biển, nhưng được chuyển nhượng cùng với chiếc xe đang gắn biển đó (Luật Trật tự, an toàn giao thông đường bộ 2024)."],
        ["Biển số trúng đấu giá có bán lại được không?", "Không bán riêng được. Muốn sở hữu biển đã trúng đấu giá, người mua nhận chuyển nhượng cả chiếc xe đang gắn biển rồi đăng ký sang tên theo quy định."],
        ["Có được tặng cho hoặc để thừa kế biển trúng đấu giá không?", "Không được tặng cho, để thừa kế riêng tấm biển; việc chuyển quyền phải đi cùng chiếc xe gắn biển theo quy định."],
        ["Ai hỗ trợ thủ tục chuyển nhượng xe gắn biển đẹp ở Ninh Bình?", "Mr. Mai Xuân Huy hỗ trợ kiểm tra hồ sơ và hướng dẫn thủ tục trọn gói. Gọi/Zalo 0326.583.583."]
      ] },
    { slug: "bien-so-hop-tuoi", h1: "Biển số hợp tuổi: tra theo năm sinh", kw: "biển số hợp tuổi", always: true,
      test: function () { return false; },
      title: "Biển số hợp tuổi theo năm sinh 1975 – 2005 | Tra mệnh, hành hợp – Mai Xuân Huy",
      desc: "Biển số hợp tuổi 1985, 1986, 1987, 1990, 1992, 1995…: tra mệnh theo năm sinh và hành của số cuối biển hợp với bạn. Kho biển số đẹp Ninh Bình có giá công khai.",
      intro: "Nhiều người chọn biển số theo mệnh của chủ xe. Bảng dưới đây cho biết mệnh theo năm sinh và hành của biển nên chọn (cùng mệnh hoặc tương sinh). Hành của biển tính theo chữ số cuối: 1, 6 – Thủy; 2, 7 – Hỏa; 3, 8 – Mộc; 4, 9 – Kim; 5, 0 – Thổ. Thông tin mang tính tham khảo.",
      fallbackTitle: "Biển số đẹp Ninh Bình đang chào bán",
      content: function () { return hopTuoiTable(1975, 2005) + '<p>Muốn lọc ngay các biển hợp tuổi trong kho, dùng công cụ <a href="/#phongthuy">tìm biển hợp tuổi</a> trên trang chủ: nhập năm sinh là ra danh sách biển hợp mệnh.</p>'; },
      faq: [
        ["Biển số hợp tuổi 1990 là biển nào?", "Người sinh năm 1990 (Canh Ngọ) mệnh Thổ, hợp biển có số cuối mang hành Thổ (5, 0) hoặc Hỏa (2, 7)."],
        ["Biển số hợp tuổi 1985 là biển nào?", "Người sinh năm 1985 (Ất Sửu) mệnh Kim, hợp biển có số cuối mang hành Kim (4, 9) hoặc Thổ (5, 0)."],
        ["Biển số hợp tuổi 1995 là biển nào?", "Người sinh năm 1995 (Ất Hợi) mệnh Hỏa, hợp biển có số cuối mang hành Hỏa (2, 7) hoặc Mộc (3, 8)."],
        ["Xem biển số hợp mệnh dựa vào đâu?", "Website tính hành của biển theo chữ số cuối (theo Hà Đồ) và đối chiếu với mệnh của chủ xe: cùng mệnh hoặc tương sinh là hợp. Thông tin mang tính tham khảo."]
      ] },
    { slug: "bien-ngu-quy", h1: "Biển số ngũ quý Ninh Bình", kw: "biển ngũ quý", tag: "Ngũ quý",
      intro: "Biển ngũ quý – năm số giống nhau như 666.66, 888.88 – là dòng biển hiếm và có giá trị nhất. Dưới đây là các biển ngũ quý đang có tại kho Ninh Bình." },
    { slug: "bien-tu-quy", h1: "Biển số tứ quý Ninh Bình", kw: "biển tứ quý", tag: "Tứ quý",
      intro: "Biển tứ quý có bốn số giống nhau liền nhau (vd 899.99, 988.88), dễ nhớ, sang trọng và giữ giá tốt." },
    { slug: "bien-tam-hoa", h1: "Biển số tam hoa Ninh Bình", kw: "biển tam hoa", tag: "Tam hoa",
      intro: "Biển tam hoa có ba số giống nhau (vd 999.29, 885.55), mức giá dễ tiếp cận mà vẫn đẹp và ý nghĩa." },
    { slug: "bien-than-tai", h1: "Biển số thần tài 39 – 79 Ninh Bình", kw: "biển thần tài", tag: "Thần tài",
      intro: "Biển thần tài kết thúc bằng 39 (thần tài nhỏ) hoặc 79 (thần tài lớn), được dân kinh doanh rất ưa chuộng vì mang ý nghĩa tài lộc." },
    { slug: "bien-phat-loc", h1: "Biển số phát lộc 68 – 86 Ninh Bình", kw: "biển phát lộc", tag: "Phát lộc",
      intro: "Biển phát lộc chứa các cặp 68, 86, 88 – lộc phát, phát lộc, song phát – mang ý nghĩa làm ăn thuận lợi, tài lộc dồi dào." },
    { slug: "bien-ong-dia", h1: "Biển số ông địa 38 – 78 Ninh Bình", kw: "biển ông địa", tag: "Ông địa",
      intro: "Biển ông địa kết thúc bằng 38 hoặc 78, tượng trưng cho sự che chở, giữ đất, giữ của cho gia chủ." },
    { slug: "bien-sanh-tien", h1: "Biển số sảnh tiến Ninh Bình", kw: "biển sảnh tiến", tag: "Sảnh tiến",
      intro: "Biển sảnh tiến có các số tăng dần (vd 123.45, 345.67), mang ý nghĩa từng bước thăng tiến." },
    { slug: "bien-o-to", h1: "Biển số ô tô đẹp Ninh Bình (35A, 35B)", kw: "biển số ô tô đẹp Ninh Bình", v: "oto",
      intro: "Biển số ô tô đẹp Ninh Bình 35A, 35B đang chào bán: ngũ quý, tứ quý, tam hoa, thần tài 39 – 79, phát lộc 68 – 86, xếp theo giá từ cao xuống thấp. Phục vụ khách Ninh Bình, Nam Định, Hà Nam.",
      content: "<h2>Kho biển số ô tô đẹp Ninh Bình có những loại nào?</h2><ul>" +
        '<li><a href="/bien-ngu-quy/"><b>Biển ngũ quý</b></a>: 5 số giống nhau (888.88, 666.66) – hiếm và giá trị nhất.</li>' +
        '<li><a href="/bien-tu-quy/"><b>Biển tứ quý</b></a>: 4 số giống nhau (899.99, 988.88) – sang, dễ nhớ.</li>' +
        '<li><a href="/bien-tam-hoa/"><b>Biển tam hoa</b></a>: 3 số giống nhau – đẹp, giá dễ tiếp cận.</li>' +
        '<li><a href="/bien-than-tai/"><b>Biển thần tài</b></a> (đuôi 39, 79) và <a href="/bien-phat-loc/"><b>biển phát lộc</b></a> (68, 86, 88) – được dân kinh doanh ưa chuộng.</li></ul>' +
        "<h2>Mua biển số ô tô đẹp đã trúng đấu giá có hợp pháp không?</h2>" +
        "<p>Theo Luật Trật tự, an toàn giao thông đường bộ 2024, biển số trúng đấu giá <b>không được bán riêng tấm biển</b>, nhưng <b>được chuyển nhượng cùng với chiếc xe</b> đang gắn biển. Khi mua, anh/chị nhận chuyển nhượng cả xe và làm thủ tục đăng ký theo quy định. Mr. Mai Xuân Huy hỗ trợ kiểm tra hồ sơ, giấy tờ và hướng dẫn thủ tục trọn gói.</p>" +
        "<h2>Chọn biển ô tô hợp tuổi, hợp mệnh</h2>" +
        '<p>Mỗi biển trong kho đều có số nút, ngũ hành và cách đọc ý nghĩa cả dãy số. Anh/chị có thể dùng công cụ <a href="/#phongthuy">tìm biển hợp tuổi</a> trên trang chủ: nhập năm sinh là ra danh sách biển hợp mệnh.</p>',
      faq: [
        ["Biển số ô tô đẹp Ninh Bình giá bao nhiêu?", "Giá tùy loại biển: biển tam hoa, phát lộc thường từ khoảng 80–200 triệu; tứ quý, ngũ quý từ vài trăm triệu đến vài tỷ. Giá từng biển được ghi công khai ngay trên trang."],
        ["Biển 35A là ở đâu?", "35A là biển số ô tô của tỉnh Ninh Bình. Nam Định, Hà Nam cũ đã sáp nhập vào tỉnh Ninh Bình nên biển cấp mới của cả tỉnh dùng chung đầu 35."],
        ["Mua biển ô tô trúng đấu giá cần làm gì?", "Biển trúng đấu giá được chuyển nhượng cùng với xe. Anh/chị nhận chuyển nhượng xe đang gắn biển rồi đăng ký sang tên theo quy định; kho hỗ trợ hồ sơ trọn gói."],
        ["Có biển ô tô đẹp giá rẻ không?", 'Có, xem <a href="/bien-so-dep-gia-re/">biển số đẹp giá dưới 100 triệu</a>.']
      ] },
    { slug: "bien-xe-may", h1: "Biển số xe máy đẹp Ninh Bình", kw: "biển số xe máy đẹp Ninh Bình", v: "xemay",
      intro: "Biển số xe máy đẹp Ninh Bình (35AA, 35AB, 35AC, 35B1…) đủ loại tứ quý, ngũ quý, tam hoa với giá tốt. Phục vụ khách Ninh Bình, Nam Định, Hà Nam.",
      content: "<h2>Biển số xe máy đẹp Ninh Bình – chọn thế nào?</h2>" +
        "<p>Biển xe máy Ninh Bình có dạng 35-AA, 35-AB, 35-AC… phía trên và dãy 5 số phía dưới. Dòng được ưa chuộng nhất là <b>ngũ quý</b> (555.55), <b>tứ quý</b> (388.88), <b>tam hoa</b> và đuôi <b>thần tài 39 – 79</b>. Từ 01/01/2025, biển số xe máy cũng được đưa ra đấu giá trực tuyến (Nghị định 156/2024/NĐ-CP), bước giá 500 nghìn đồng.</p>" +
        '<p>Xem thêm <a href="/bien-so-dep-ninh-binh/">kho biển số đẹp Ninh Bình</a> và <a href="/dau-gia-bien-so-ninh-binh/">dịch vụ đấu giá biển số hộ</a>.</p>',
      faq: [
        ["Biển số xe máy đẹp Ninh Bình giá bao nhiêu?", "Biển xe máy tam hoa, tứ quý thường từ khoảng 20–100 triệu; biển ngũ quý cao hơn. Giá từng biển được ghi công khai trên trang."],
        ["Biển 35AA, 35AB là ở đâu?", "35AA, 35AB, 35AC… là biển số xe máy của tỉnh Ninh Bình."],
        ["Biển số xe máy có được đấu giá không?", "Có. Từ 01/01/2025, biển số xe máy được đấu giá trực tuyến theo Nghị định 156/2024/NĐ-CP. Mr. Mai Xuân Huy nhận đấu giá hộ."]
      ] },
    { slug: "bien-35a", h1: "Biển số đẹp 35A", kw: "biển 35A", pre: "35A",
      intro: "Các biển số đẹp đầu 35A (ô tô Ninh Bình) đang có sẵn, kèm giá và ý nghĩa từng biển." },
    { slug: "bien-35b", h1: "Biển số đẹp 35B", kw: "biển 35B", pre: "35B",
      intro: "Các biển số đẹp đầu 35B đang có sẵn tại kho Ninh Bình." },
    { slug: "bien-so-dep-gia-re", h1: "Biển số đẹp giá rẻ dưới 100 triệu", kw: "biển số đẹp giá rẻ",
      test: function (it) { return it.price > 0 && it.price < 1e8; },
      intro: "Biển số đẹp giá dưới 100 triệu đồng – lựa chọn hợp lý cho người muốn có biển đẹp mà không tốn nhiều chi phí." },
    { slug: "dau-gia-bien-so-ninh-binh", h1: "Đấu giá biển số Ninh Bình – nhận đấu giá hộ", kw: "đấu giá biển số Ninh Bình", st: "trung", service: true,
      intro: "Mr. Mai Xuân Huy nhận tư vấn và đấu giá biển số hộ tại Ninh Bình, Nam Định, Hà Nam: chọn biển, đăng ký, nộp tiền đặt trước, theo sát phiên đấu giá trực tuyến và hoàn tất thủ tục. Dưới đây là những biển đã trúng đấu giá đang được chào bán cùng xe.",
      content: "<h2>Đấu giá biển số Ninh Bình: những điều cần biết</h2><ul>" +
        "<li><b>Hình thức:</b> đấu giá trực tuyến, trả giá lên (Nghị định 156/2024/NĐ-CP, hiệu lực từ 01/01/2025).</li>" +
        "<li><b>Bước giá:</b> 5 triệu đồng với biển ô tô; 500 nghìn đồng với biển xe máy.</li>" +
        "<li><b>Phạm vi:</b> biển đấu giá của tỉnh Ninh Bình (gồm Nam Định, Hà Nam cũ từ 01/07/2025) dùng chung đầu 35.</li>" +
        "<li><b>Sau khi trúng:</b> biển được đăng ký cho xe của người trúng; biển trúng đấu giá không được bán riêng, chỉ được chuyển nhượng cùng với xe.</li></ul>" +
        '<p>Xem thêm: <a href="/bien-so-ninh-binh-sau-sap-nhap/">biển số Ninh Bình sau sáp nhập</a> · <a href="/bien-o-to/">biển số ô tô đẹp Ninh Bình</a>.</p>',
      faq: [
        ["Đấu giá biển số Ninh Bình ở đâu?", "Đấu giá biển số xe được tổ chức trực tuyến trên trang của đơn vị đấu giá được Bộ Công an lựa chọn. Mr. Mai Xuân Huy hướng dẫn đăng ký và theo sát phiên đấu giá cùng anh/chị."],
        ["Bước giá đấu biển số là bao nhiêu?", "Theo Nghị định 156/2024/NĐ-CP: 5 triệu đồng đối với biển ô tô và 500 nghìn đồng đối với biển xe máy."],
        ["Biển số trúng đấu giá có được chuyển nhượng không?", "Biển trúng đấu giá không được chuyển nhượng riêng, nhưng được chuyển nhượng cùng với xe đang gắn biển theo Luật Trật tự, an toàn giao thông đường bộ 2024."],
        ["Phí dịch vụ đấu giá hộ là bao nhiêu?", "Tùy biển và mức giá dự kiến. Anh/chị gọi hoặc nhắn Zalo 0326.583.583 để được báo phí cụ thể, tư vấn miễn phí."]
      ] }
  ];
  function inTopic(t, it) {
    if (t.test && !t.test(it)) return false;
    if (t.tag && it.tags.indexOf(t.tag) < 0) return false;
    if (t.v && it.v !== t.v) return false;
    if (t.pre && it.pre !== t.pre) return false;
    if (t.st && it.st !== t.st) return false;
    return true;
  }

  /* ---- Khung trang ---- */
  function layout(o) {
    var S = o.SITE, tel = hotline(S), zalo = String(S.zalo || "").replace(/\s/g, "");
    return '<!DOCTYPE html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      "<title>" + esc(o.title) + "</title>\n" +
      '<meta name="description" content="' + esc(o.desc) + '">\n' +
      '<link rel="canonical" href="' + BASE + o.path + '">\n' +
      '<meta name="robots" content="index, follow, max-image-preview:large">\n' +
      '<meta property="og:type" content="' + (o.ogType || "website") + '">\n' +
      '<meta property="og:site_name" content="Mr. Mai Xuân Huy">\n' +
      '<meta property="og:url" content="' + BASE + o.path + '">\n' +
      '<meta property="og:title" content="' + esc(o.title) + '">\n' +
      '<meta property="og:description" content="' + esc(o.desc) + '">\n' +
      '<meta property="og:image" content="' + BASE + '/og-mr-xuan-huy-2.jpg">\n' +
      '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n' +
      '<meta property="og:locale" content="vi_VN">\n<meta name="twitter:card" content="summary_large_image">\n' +
      '<meta name="theme-color" content="#12233f">\n' +
      '<link rel="stylesheet" href="/style.css?v=' + CSS_V + '">\n' +
      (o.ld || []).map(jsonld).join("\n") + "\n</head>\n<body class=\"seo-page\">\n" +
      '<div class="top"><div class="w"><span>📍 Ninh Bình · Hỗ trợ ' + esc(S.gioHoTro || "8h – 22h30") + '</span><span>Hotline/Zalo: <b>' + esc(hotFmt(S)) + "</b></span></div></div>\n" +
      '<header><div class="w hd"><a class="logo" href="/"><span class="mk">BSĐ</span><span><b>KHO BIỂN SỐ ĐẸP</b><small>Mai Xuân Huy · Ninh Bình</small></span></a>' +
      '<a class="btn sm-hide" href="/#kho">Xem toàn bộ kho biển →</a></div>\n' +
      '<nav><div class="w nv"><a class="nvl" href="/">Trang chủ</a><a class="nvl" href="/bien-so-dep-ninh-binh/">Biển số đẹp Ninh Bình</a><a class="nvl" href="/bien-o-to/">Ô tô</a><a class="nvl" href="/bien-xe-may/">Xe máy</a><a class="nvl" href="/dau-gia-bien-so-ninh-binh/">Đấu giá hộ</a></div></nav></header>\n' +
      '<main class="w seo-main">\n' + o.body + "\n</main>\n" +
      '<footer><div class="w"><b>KHO BIỂN SỐ ĐẸP NINH BÌNH – MR. MAI XUÂN HUY</b>' +
      "<p>Chuyên nghiệp – Nhiệt tình – Trung thực · Ninh Bình · Hotline/Zalo: " + esc(hotFmt(S)) + "</p>" +
      '<p><a href="' + esc(S.facebook || "#") + '" target="_blank" rel="noopener" style="text-decoration:underline">Facebook</a> · <a href="' + esc(S.tiktok || "#") + '" target="_blank" rel="noopener" style="text-decoration:underline">TikTok @mrxuanhuy</a> · maixuanhuy.id.vn</p>' +
      '<p class="dis">Website thương mại tư nhân, cung cấp thông tin và kết nối nhu cầu liên quan đến biển số xe theo quy định pháp luật Việt Nam. Không phải cơ quan nhà nước, không đại diện Bộ Công an hay cơ quan đăng ký xe, không thực hiện cấp hoặc phát hành biển số. Thông tin phong thủy mang tính tham khảo. Tình trạng biển có thể thay đổi, vui lòng liên hệ để xác nhận.</p></div></footer>\n' +
      '<div class="fx"><a class="c1" href="tel:' + esc(tel) + '">📞 Gọi ngay</a><a class="c2" href="https://zalo.me/' + esc(zalo) + '" target="_blank" rel="noopener">Zalo</a><a class="c3" href="' + esc(S.messenger || "#") + '" target="_blank" rel="noopener">Messenger</a></div>\n' +
      (o.pagePlate ? "<script>window.__PAGE_PLATE=" + JSON.stringify(o.pagePlate).replace(/</g, "\\u003c") + ";</script>\n" : "") +
      '<script src="/analytics.js?v=' + CSS_V + '"></script>\n</body>\n</html>\n';
  }
  function plateHtml(it, big) {
    var c = "pl" + (it.v === "xemay" ? " xm" : "") + (big ? " big" : "");
    if (it.v === "xemay") return '<div class="' + c + '"><i>' + esc(it.pre.slice(0, 2) + "-" + it.pre.slice(2)) + "</i>" + esc(it.tail) + "</div>";
    return '<div class="' + c + '">' + esc(it.label) + "</div>";
  }
  function priceHtml(it) {
    if (it.st === "ban") return "Đã bán";
    if (!it.price) return "Giá: Liên hệ";
    return (it.old > it.price ? '<s class="old">' + money(it.old) + "</s> " : "") + money(it.price);
  }
  function card(it) {
    var tg = it.tags.slice(0, 2).map(function (t) { return '<span class="tg">' + t + "</span>"; }).join("") || '<span class="tg n">Biển thường</span>';
    return '<a class="pc' + (it.st === "ban" ? " sold" : "") + '" href="' + it.url + '">' + plateHtml(it) +
      '<div class="tags">' + tg + "</div>" +
      (it.mean ? '<div class="mean"><b>' + esc(it.mean.title) + "</b></div>" : "") +
      '<div class="mt"><span>' + it.nut + " nút · " + it.hanh + "</span><span>" + (it.v === "xemay" ? "Xe máy" : "Ô tô") + "</span></div>" +
      '<div class="pr">' + priceHtml(it) + "</div></a>";
  }
  function crumbs(list) {
    var html = '<div class="crumb" role="navigation" aria-label="Đường dẫn">' + list.map(function (c, i) {
      return i < list.length - 1 ? '<a href="' + c[1] + '">' + esc(c[0]) + "</a>" : "<span>" + esc(c[0]) + "</span>";
    }).join(" › ") + "</div>";
    var ld = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: list.map(function (c, i) { return { "@type": "ListItem", position: i + 1, name: c[0], item: BASE + c[1] }; }) };
    return { html: html, ld: ld };
  }
  function sortByPrice(a, b) { return (b.price || 0) - (a.price || 0); }

  /* ---- Tạo tất cả ---- */
  function build(ctx) {
    var SITE = ctx.SITE, now = ctx.now || new Date();
    var today = now.toISOString().slice(0, 10);
    var PM = ctx.PlateMeaning;
    var seen = {};
    var items = (ctx.PLATES || []).map(function (r) {
      var d = digits(r[1]);
      var it = { pre: String(r[0]), tail: String(r[1]), v: r[2] || "oto", price: +r[3] || 0, st: r[4] || "con", hot: +r[5] === 1, old: +r[6] || 0, date: r[7] || "", note: r[8] || "" };
      it.label = it.pre + "-" + it.tail;
      it.slug = slugOf(it.pre, it.tail);
      it.url = "/bien/" + it.slug + "/";
      it.tags = classify(it.tail); it.nut = nut(it.pre + it.tail); it.hanh = HANH[+d[d.length - 1]];
      if (it.note) { var p = String(it.note).split(/\s*\|\s*/); it.mean = { title: p[0], verse: p.slice(1).join(" / "), sense: "" }; }
      else it.mean = PM ? PM(it.tail) : null;
      return it;
    }).filter(function (it) { if (!/^\d{2}[A-Z]{1,2}\d?$/.test(it.pre) || seen[it.slug]) return false; seen[it.slug] = 1; return true; });

    var files = {}, urls = [{ loc: "/", lastmod: today, pri: "1.0" }];
    var topicsUsed = [];

    // Trang chủ đề
    TOPICS.forEach(function (t) {
      var list = items.filter(function (it) { return inTopic(t, it) && (t.service || forSale(it)); }).sort(sortByPrice);
      if (!list.length && !t.always) return;
      topicsUsed.push({ t: t, n: list.length });
    });
    // Biển gợi ý khi trang khu vực/bài viết chưa có biển đúng đầu số
    var featured = items.filter(function (it) { return forSale(it) && it.v === "oto"; }).sort(function (a, b) { return (b.hot - a.hot) || sortByPrice(a, b); }).slice(0, 12);
    function faqHtml(t) {
      if (!t.faq || !t.faq.length) return "";
      return '<div class="panel seo-text seo-faq"><h2>Câu hỏi thường gặp về ' + esc(t.kw) + "</h2>" +
        t.faq.map(function (f) { return "<details><summary>" + esc(f[0]) + "</summary><p>" + f[1] + "</p></details>"; }).join("") + "</div>";
    }
    function faqLd(t) {
      if (!t.faq || !t.faq.length) return null;
      return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: t.faq.map(function (f) {
        return { "@type": "Question", name: f[0], acceptedAnswer: { "@type": "Answer", text: String(f[1]).replace(/<[^>]+>/g, "") } };
      }) };
    }
    function topicLinks(exceptSlug) {
      return '<div class="tlinks">' + topicsUsed.filter(function (x) { return x.t.slug !== exceptSlug; }).map(function (x) {
        return '<a href="/' + x.t.slug + '/">' + esc(x.t.h1) + " <small>(" + x.n + ")</small></a>";
      }).join("") + "</div>";
    }
    topicsUsed.forEach(function (x) {
      var t = x.t, list = items.filter(function (it) { return inTopic(t, it) && (t.service || forSale(it)); }).sort(sortByPrice);
      var path = "/" + t.slug + "/";
      var cr = crumbs([["Trang chủ", "/"], [t.h1, path]]);
      var minP = list.filter(function (it) { return it.price > 0 && it.st !== "ban"; }).map(function (it) { return it.price; });
      var priceNote = minP.length ? " Giá từ " + money(Math.min.apply(null, minP)) + " đến " + money(Math.max.apply(null, minP)) + "." : "";
      var service = t.service ? '<div class="panel"><h2>Quy trình đấu giá biển số hộ</h2><ol class="steps">' +
        "<li><b>Tư vấn chọn biển</b>Xác định biển mong muốn, mức giá dự kiến và mệnh hợp tuổi.</li>" +
        "<li><b>Đăng ký tham gia</b>Hướng dẫn tạo tài khoản, nộp hồ sơ và tiền đặt trước theo quy định.</li>" +
        "<li><b>Theo sát phiên đấu giá</b>Cùng bạn theo dõi phiên trực tuyến, tư vấn chiến lược trả giá.</li>" +
        "<li><b>Hoàn tất thủ tục</b>Hướng dẫn nộp tiền trúng đấu giá và đăng ký biển cho xe.</li></ol>" +
        '<p>Liên hệ ngay <a href="tel:' + hotline(SITE) + '"><b>' + hotFmt(SITE) + "</b></a> (Zalo cùng số) để được tư vấn miễn phí.</p></div>" : "";
      var shown = list.length ? list : featured;
      var countTxt = list.length ? " Hiện có <b>" + list.length + " biển</b>." + esc(priceNote) : "";
      var body = cr.html + '<h1 class="seo-h1">' + esc(t.h1) + "</h1>" +
        '<p class="seo-intro">' + esc(t.intro) + countTxt + ' Gọi/Zalo <a href="tel:' + hotline(SITE) + '"><b>' + hotFmt(SITE) + "</b></a> để " + (list.length ? "giữ biển" : "được tìm biển theo yêu cầu") + ".</p>" +
        service +
        (t.contentTop ? '<div class="panel seo-text">' + t.contentTop + "</div>" : "") +
        (list.length ? "" : '<h2 class="seo-h2">' + esc(t.fallbackTitle || "Biển số đẹp Ninh Bình đang có sẵn") + "</h2>") +
        '<div class="gr">' + shown.map(card).join("") + "</div>" +
        (t.content ? '<div class="panel seo-text">' + (typeof t.content === "function" ? t.content() : t.content) + "</div>" : "") +
        faqHtml(t) +
        '<h2 class="seo-h2">Xem thêm</h2>' + topicLinks(t.slug);
      var title = t.title || (t.h1 + " – " + list.length + " biển có giá | Kho Biển Số Đẹp Mai Xuân Huy");
      var desc = t.desc || (t.h1 + ": " + list.length + " biển" + priceNote + " " + t.intro.slice(0, 90) + "… Hotline/Zalo " + hotFmt(SITE) + ".");
      var ldList = { "@context": "https://schema.org", "@type": "ItemList", name: t.h1, numberOfItems: shown.length,
        itemListElement: shown.slice(0, 50).map(function (it, i) { return { "@type": "ListItem", position: i + 1, url: BASE + it.url, name: "Biển số " + it.label }; }) };
      var ldAll = [cr.ld, ldList];
      if (faqLd(t)) ldAll.push(faqLd(t));
      files[t.slug + "/index.html"] = layout({ SITE: SITE, path: path, title: title, desc: desc, body: body, ld: ldAll });
      urls.push({ loc: path, lastmod: today, pri: "0.8" });
    });

    // Trang từng biển
    items.forEach(function (it) {
      var path = it.url;
      var topic = topicsUsed.filter(function (x) { return x.t.tag && it.tags.indexOf(x.t.tag) > -1; })[0] ||
        topicsUsed.filter(function (x) { return x.t.slug === (it.v === "xemay" ? "bien-xe-may" : "bien-o-to"); })[0];
      var cl = [["Trang chủ", "/"]];
      if (topic) cl.push([topic.t.h1, "/" + topic.t.slug + "/"]);
      cl.push(["Biển " + it.label, path]);
      var cr = crumbs(cl);
      var loai = it.tags.join(", ") || "Biển thường";
      var xe = it.v === "xemay" ? "xe máy" : "ô tô";
      var vid = (ctx.VIDEOS || []).filter(function (v) { return v.b && key(v.b) === key(it.label); })[0];
      var related = items.filter(function (x) { return x !== it && forSale(x) && (it.tags[0] ? x.tags.indexOf(it.tags[0]) > -1 : x.pre === it.pre); }).sort(sortByPrice).slice(0, 8);
      if (related.length < 4) related = related.concat(items.filter(function (x) { return x !== it && forSale(x) && x.pre === it.pre && related.indexOf(x) < 0; }).slice(0, 8 - related.length));
      var m = it.mean;
      var priceTxt = it.st === "ban" ? "đã bán" : it.price ? "giá " + money(it.price) : "giá liên hệ";
      var desc = "Biển số " + xe + " " + it.label + " (" + loai + ", " + it.nut + " nút, mệnh " + it.hanh + ") " + priceTxt + "." +
        (m ? " Ý nghĩa: " + m.title + (m.sense ? " – " + m.sense.toLowerCase() : "") + "." : "") + " Liên hệ Mr. Xuân Huy " + hotFmt(SITE) + ".";
      var body = cr.html +
        '<div class="seo-plate"><div class="seo-plate-l">' + plateHtml(it, true) + "</div><div class=\"seo-plate-r\">" +
        '<h1 class="seo-h1">Biển số <span class="nw">' + esc(it.label) + "</span>" + (it.tags[0] ? " – " + esc(it.tags[0]) : "") + "</h1>" +
        '<p class="seo-price">' + priceHtml(it) + (it.old > it.price && it.price ? ' <span class="off">-' + Math.round((1 - it.price / it.old) * 100) + "%</span>" : "") + "</p>" +
        '<dl class="kv">' +
        "<dt>Loại biển</dt><dd>" + esc(loai) + "</dd>" +
        "<dt>Loại xe</dt><dd>" + (it.v === "xemay" ? "Xe máy" : "Ô tô") + "</dd>" +
        "<dt>Số nút</dt><dd>" + it.nut + " nút</dd>" +
        "<dt>Ngũ hành</dt><dd>" + it.hanh + " – hợp người mệnh " + it.hanh + ", " + SINH[it.hanh] + "</dd>" +
        "<dt>Tình trạng</dt><dd>" + esc(ST[it.st] || it.st) + "</dd>" +
        (it.date ? "<dt>Ngày đăng</dt><dd>" + fmtDate(it.date) + "</dd>" : "") + "</dl>" +
        '<div class="row cta"><a class="btn" href="tel:' + hotline(SITE) + '">📞 Gọi ngay</a><a class="btn" style="background:#0068ff" href="https://zalo.me/' + esc(String(SITE.zalo || "").replace(/\s/g, "")) + '" target="_blank" rel="noopener">Nhắn Zalo</a></div>' +
        "</div></div>" +
        (m ? '<div class="ynghia"><b>Ý nghĩa biển số ' + esc(it.label) + '</b><p class="yt">' + esc(m.title) + "</p>" + (m.sense ? '<p class="ys">' + esc(m.sense) + "</p>" : "") +
          (m.verse ? '<p class="tho">' + esc(m.verse).split(" / ").join("<br>") + "</p>" : "") + "</div>" : "") +
        (vid ? '<div class="mvid"><iframe src="https://www.tiktok.com/player/v1/' + esc(vid.id) + '?music_info=0&description=1&rel=0" loading="lazy" title="Video biển ' + esc(it.label) + '" allow="fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>' : "") +
        '<div class="panel seo-text"><h2>Thông tin biển ' + esc(it.label) + "</h2><p>Biển " + esc(it.label) + " là biển số " + xe +
        (it.pre.indexOf("35") === 0 ? " Ninh Bình" : "") + " thuộc dạng " + esc(loai.toLowerCase()) + ", tổng " + it.nut + " nút, số cuối mang hành " + it.hanh + "." +
        (m ? " Cách đọc cả dãy: <b>" + esc(m.title) + "</b>" + (m.sense ? " – " + esc(m.sense.toLowerCase()) : "") + "." : "") +
        " Biển hiện " + esc(priceTxt) + (it.st === "trung" ? ", là biển đã trúng đấu giá đang được chào bán lại" : "") +
        ". Mr. Mai Xuân Huy hỗ trợ tư vấn, kiểm tra hồ sơ và thủ tục theo đúng quy định. Gọi hoặc nhắn Zalo <a href=\"tel:" + hotline(SITE) + "\">" + hotFmt(SITE) + "</a> để được báo giá và giữ biển.</p></div>" +
        (related.length ? '<h2 class="seo-h2">Biển tương tự</h2><div class="gr">' + related.map(card).join("") + "</div>" : "") +
        '<h2 class="seo-h2">Danh mục biển số</h2>' + topicLinks("");
      var ld = [cr.ld];
      var product = { "@context": "https://schema.org", "@type": "Product", name: "Biển số " + it.label, sku: it.label,
        category: "Biển số xe " + xe, description: desc, image: BASE + "/og-mr-xuan-huy-2.jpg",
        brand: { "@type": "Brand", name: "Kho Biển Số Đẹp Mai Xuân Huy" } };
      if (it.price > 0 && it.st !== "ban") product.offers = { "@type": "Offer", url: BASE + path, priceCurrency: "VND", price: it.price,
        availability: "https://schema.org/InStock", itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "AutoDealer", "@id": BASE + "/#kho", name: "Kho Biển Số Đẹp Ninh Bình – Mr. Mai Xuân Huy" } };
      ld.push(product);
      var title = "Biển số " + it.label + (it.tags[0] ? " " + it.tags[0].toLowerCase() : "") + " – " + (it.st === "ban" ? "Đã bán" : it.price ? money(it.price) : "Giá liên hệ") + " | Biển số đẹp " + (it.pre.indexOf("35") === 0 ? "Ninh Bình" : "") ;
      files["bien/" + it.slug + "/index.html"] = layout({ SITE: SITE, path: path, title: title.trim(), desc: desc, body: body, ld: ld, ogType: "product",
        pagePlate: { bien: it.label, loai: it.tags[0] || "Biển thường", xe: it.v === "xemay" ? "Xe máy" : "Ô tô", gia: it.st === "ban" ? 0 : it.price, st: ST[it.st] || it.st } });
      urls.push({ loc: path, lastmod: it.date && it.date <= today ? it.date : today, pri: it.st === "ban" ? "0.3" : "0.6" });
    });

    // Danh mục chèn vào trang chủ
    var sale = items.filter(forSale).sort(sortByPrice);
    var danhMuc = '<section class="panel seo-dm" id="danhmuc"><h2>Danh mục biển số đẹp Ninh Bình</h2>' + topicLinks("") +
      '<details><summary>Xem danh sách tất cả ' + sale.length + " biển đang bán</summary><p class=\"seo-all\">" +
      sale.map(function (it) { return '<a href="' + it.url + '">' + esc(it.label) + "</a>"; }).join(" · ") + "</p></details></section>";

    // sitemap + robots
    files["sitemap.xml"] = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.map(function (u) { return "  <url><loc>" + BASE + u.loc + "</loc><lastmod>" + u.lastmod + "</lastmod><priority>" + u.pri + "</priority></url>"; }).join("\n") + "\n</urlset>\n";
    files["robots.txt"] = "User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: " + BASE + "/sitemap.xml\n";

    return { files: files, danhMuc: danhMuc, topicDirs: TOPICS.map(function (t) { return t.slug; }), count: { plates: items.length, topics: topicsUsed.length, urls: urls.length } };
  }

  root.SEOCore = { build: build, TOPICS: TOPICS };
})(typeof window !== "undefined" ? window : this);
