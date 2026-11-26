/* Kho Biển Số Đẹp – logic trang. Dữ liệu nằm trong data.js */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  /* ---------- Phong thủy ---------- */
  var HANH_BY_DIGIT = ["Thổ", "Thủy", "Hỏa", "Mộc", "Kim", "Thổ", "Thủy", "Hỏa", "Mộc", "Kim"]; // Hà Đồ
  var SINH = { "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc", "Mộc": "Hỏa", "Hỏa": "Thổ" };   // A sinh B
  var KHAC = { "Kim": "Mộc", "Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim" };   // A khắc B
  var CLS = { "Kim": "Kim", "Mộc": "Moc", "Thủy": "Thuy", "Hỏa": "Hoa", "Thổ": "Tho" };
  var CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  var CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  var CHI_VAL = [0, 0, 1, 1, 2, 2, 0, 0, 1, 1, 2, 2];
  var MENH_BY_SUM = [null, "Kim", "Thủy", "Hỏa", "Thổ", "Mộc"];
  var TYPES = ["Ngũ quý", "Tứ quý", "Sảnh tiến", "Tam hoa", "Thần tài", "Ông địa", "Phát lộc", "Lặp kép", "Số kép", "Gánh", "Năm sinh"];

  function mx(h) { return '<span class="mx ' + CLS[h] + '">' + h + "</span>"; }
  function digitsOf(s) { return String(s).replace(/\D/g, ""); }
  function nut(s) { var d = digitsOf(s), t = 0; for (var i = 0; i < d.length; i++) t += +d[i]; var n = t % 10; return n === 0 ? 10 : n; }

  function classify(tail) {
    var d = digitsOf(tail), L = d.length, tags = [];
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

  function yearInfo(y) {
    var ci = ((y - 4) % 10 + 10) % 10, zi = ((y - 4) % 12 + 12) % 12;
    var s = Math.floor(ci / 2) + 1 + CHI_VAL[zi]; if (s > 5) s -= 5;
    return { canchi: CAN[ci] + " " + CHI[zi], menh: MENH_BY_SUM[s] };
  }
  function relation(plateH, ownerH) {
    if (plateH === ownerH) return { k: 2, t: "Cùng mệnh – hợp" };
    if (SINH[plateH] === ownerH) return { k: 3, t: "Tương sinh (biển sinh mệnh chủ) – rất hợp" };
    if (KHAC[plateH] === ownerH) return { k: 0, t: "Tương khắc (biển khắc mệnh chủ) – nên cân nhắc" };
    return { k: 1, t: "Bình hòa" };
  }
  function nutText(n) {
    if (n === 9) return "9 nút – cao nhất, rất được ưa chuộng";
    if (n === 8) return "8 nút – đẹp, mang ý phát";
    if (n === 10) return "10 nút – tròn đầy";
    if (n === 7) return "7 nút – khá";
    return n + " nút";
  }

  /* ---------- Chuẩn bị dữ liệu ---------- */
  var TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  function daysAgo(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); if (!m) return 9999;
    return Math.round((TODAY - new Date(+m[1], +m[2] - 1, +m[3])) / 864e5);
  }
  function fmtDate(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? m[3] + "/" + m[2] + "/" + m[1] : ""; }
  function meaningOf(tail, note) {
    if (note) { var parts = String(note).split(/\s*\|\s*/); return { title: parts[0], verse: parts.slice(1).join(" / "), reading: "", custom: true }; }
    return window.PlateMeaning ? window.PlateMeaning(tail) : null;
  }
  var ITEMS = PLATES.map(function (r, i) {
    var d = digitsOf(r[1]), price = +r[3] || 0, old = +r[6] || 0;
    var sale = price > 0 && old > price;
    return {
      id: i, pre: r[0], tail: r[1], v: r[2], price: price, st: r[4] || "con",
      hot: +r[5] === 1, old: sale ? old : 0, sale: sale, pct: sale ? Math.round((1 - price / old) * 100) : 0,
      date: r[7] || "", age: daysAgo(r[7]), mean: meaningOf(r[1], r[8]),
      tags: classify(r[1]), nut: nut(r[0] + r[1]), hanh: HANH_BY_DIGIT[+d[d.length - 1]],
      key: (r[0] + r[1]).replace(/\W/g, "").toLowerCase()
    };
  });
  var fav = {};
  try { fav = JSON.parse(localStorage.getItem("bsd_fav") || "{}"); } catch (e) { fav = {}; }
  function blank() { return { p: "", v: "", t: "", m: "", n: "", g: "", dt: "", q: "", sale: 0, hot: 0, onlyFav: false, sort: "", ids: null, label: "" }; }
  var state = blank();
  var DAY_RANGES = { "1": "Đăng hôm nay", "7": "Đăng trong 7 ngày", "30": "Đăng trong 30 ngày", "90": "Đăng trong 3 tháng" };

  function plateHtml(it, big) {
    var c = "pl" + (it.v === "xemay" ? " xm" : "") + (big ? " big" : ""), h;
    if (it.v === "xemay") {
      var top = it.pre.slice(0, 2) + "-" + it.pre.slice(2);
      h = '<div class="' + c + '"><i>' + esc(top) + "</i>" + esc(it.tail) + "</div>";
    } else h = '<div class="' + c + '">' + esc(it.pre) + "-" + esc(it.tail) + "</div>";
    // Biển nổi bật: viền sáng chạy quanh biển
    return it.hot && it.st !== "ban" ? '<div class="glow' + (it.v === "xemay" ? " xm" : "") + (big ? " big" : "") + '">' + h + "</div>" : h;
  }
  function money(v) {
    if (v >= 1e9) return (Math.round(v / 1e7) / 100).toLocaleString("vi-VN") + " tỷ";
    if (v >= 1e6) return (Math.round(v / 1e5) / 10).toLocaleString("vi-VN") + " triệu";
    return v.toLocaleString("vi-VN") + " đ";
  }
  function priceTxt(it) { return it.st === "ban" ? "Đã bán" : it.price ? money(it.price) : "Giá: Liên hệ"; }
  function priceHtml(it) {
    if (it.sale && it.st !== "ban") return '<s class="old">' + money(it.old) + "</s> " + money(it.price) + ' <span class="off">-' + it.pct + "%</span>";
    return esc(priceTxt(it));
  }
  var PRICE_RANGES = { a: [0, 1e8, "Dưới 100 triệu"], b: [1e8, 3e8, "100 – 300 triệu"], c: [3e8, 1e9, "300 triệu – 1 tỷ"], d: [1e9, 1e13, "Trên 1 tỷ"] };
  var ST_TXT = { con: "Còn biển", coc: "Đã cọc", ban: "Đã bán", trung: "Trúng đấu giá" };
  function forSale(it) { return it.st === "con" || it.st === "coc" || it.st === "trung"; }

  function card(it) {
    var tg = it.tags.slice(0, 2).map(function (t) { return '<span class="tg">' + t + "</span>"; }).join("") || '<span class="tg n">Biển thường</span>';
    var badges = (it.hot && it.st !== "ban" ? '<span class="bd hotb">🔥 Nổi bật</span>' : "") +
      (it.sale && it.st !== "ban" ? '<span class="bd saleb">Giảm ' + it.pct + "%</span>" : "") +
      (it.age <= 7 && it.st !== "ban" ? '<span class="bd newb">Mới</span>' : "");
    return '<div class="pc' + (it.st === "ban" ? " sold" : "") + (it.hot && it.st !== "ban" ? " hot" : "") + '" onclick="openPlate(' + it.id + ')">' +
      (it.st !== "con" ? '<span class="st ' + it.st + '">' + ST_TXT[it.st] + "</span>" : "") +
      (badges ? '<div class="bds">' + badges + "</div>" : "") +
      plateHtml(it) +
      '<div class="tags">' + tg + "</div>" +
      (it.mean ? '<div class="mean" title="' + esc(it.mean.verse || "") + '"><b>' + esc(it.mean.title) + "</b>" + (it.mean.sense ? " – " + esc(it.mean.sense.toLowerCase()) : "") + "</div>" : "") +
      '<div class="mt"><span>' + it.nut + " nút · " + mx(it.hanh) + '</span><span>' + (it.v === "xemay" ? "Xe máy" : "Ô tô") + "</span></div>" +
      '<div class="pr">' + priceHtml(it) + "</div>" +
      '<div class="row"><button class="a" onclick="event.stopPropagation();openPlate(' + it.id + ')">Chi tiết</button>' +
      '<button class="b" onclick="event.stopPropagation();toggleFav(' + it.id + ')">' + (fav[it.id] ? "♥ Đã lưu" : "♡ Quan tâm") + "</button></div></div>";
  }

  function section(title, sub, list, withSort) {
    var head = '<div class="sh"><h2>' + title + "</h2><span>" + sub +
      (withSort ? ' &nbsp;<select class="sort" onchange="setSort(this.value)" aria-label="Sắp xếp"><option value="">Sắp xếp: mặc định</option><option value="nut"' + (state.sort === "nut" ? " selected" : "") + '>Số nút cao trước</option><option value="az"' + (state.sort === "az" ? " selected" : "") + '>Theo đầu biển</option><option value="giatang"' + (state.sort === "giatang" ? " selected" : "") + '>Giá thấp → cao</option><option value="giagiam"' + (state.sort === "giagiam" ? " selected" : "") + '>Giá cao → thấp</option><option value="moi"' + (state.sort === "moi" ? " selected" : "") + ">Mới đăng trước</option></select>" : "") +
      "</span></div>";
    if (!list.length) return head + '<div class="empty">Chưa có biển phù hợp. <a href="#lh" style="color:var(--red);font-weight:700">Gửi yêu cầu</a> để được tìm giúp theo tiêu chí.</div>';
    return head + '<div class="gr">' + list.map(card).join("") + "</div>";
  }

  var FIELDS = ["p", "v", "t", "m", "n", "g", "dt"];
  function readForm() { FIELDS.forEach(function (k) { state[k] = $(k).value; }); state.q = $("q").value.replace(/\W/g, "").toLowerCase(); }
  function writeForm() { FIELDS.forEach(function (k) { $(k).value = state[k]; }); }
  function byPrice(desc) { return function (a, b) { var x = a.price || (desc ? -1 : 1e15), y = b.price || (desc ? -1 : 1e15); return desc ? y - x : x - y; }; }

  function render() {
    var s = state, chips = [];
    if (s.p) chips.push("Mã " + s.p); if (s.v) chips.push(s.v === "oto" ? "Ô tô" : "Xe máy");
    if (s.t) chips.push(s.t); if (s.m) chips.push("Hành " + s.m); if (s.n) chips.push(s.n === "6" ? "≤ 6 nút" : s.n + " nút");
    if (s.g) chips.push(PRICE_RANGES[s.g][2]);
    if (s.dt) chips.push(DAY_RANGES[s.dt]); if (s.sale) chips.push("Đang giảm giá"); if (s.hot) chips.push("Biển nổi bật");
    if (s.q) chips.push('Tìm "' + $("q").value + '"'); if (s.onlyFav) chips.push("Đã quan tâm"); if (s.ids) chips.push(s.label);
    $("chips").innerHTML = chips.map(function (c) { return '<span class="chip on">' + esc(c) + "</span>"; }).join("") +
      (chips.length ? '<button class="chip" onclick="resetAll()">Xóa lọc ✕</button>' : "");
    $("favBtn").classList.toggle("on", s.onlyFav);

    var r = ITEMS.filter(function (it) {
      return (!s.p || it.pre.indexOf(s.p) === 0) && (!s.v || it.v === s.v) && (!s.t || it.tags.indexOf(s.t) > -1) &&
        (!s.m || it.hanh === s.m) && (!s.n || (s.n === "6" ? it.nut <= 6 : it.nut === +s.n)) &&
        (!s.q || it.key.indexOf(s.q) > -1) && (!s.onlyFav || fav[it.id]) && (!s.ids || s.ids.indexOf(it.id) > -1) &&
        (!s.g || (it.price >= PRICE_RANGES[s.g][0] && it.price < PRICE_RANGES[s.g][1] && it.st !== "ban")) &&
        (!s.dt || it.age < +s.dt) && (!s.sale || (it.sale && forSale(it))) && (!s.hot || (it.hot && forSale(it)));
    });
    if (s.sort === "moi") r.sort(function (a, b) { return a.age - b.age; });
    if (s.sort === "giatang") r.sort(byPrice(false));
    if (s.sort === "giagiam") r.sort(byPrice(true));
    if (s.sort === "nut") r.sort(function (a, b) { return (b.nut === 10 ? 0 : b.nut) - (a.nut === 10 ? 0 : a.nut); });
    if (s.sort === "az") r.sort(function (a, b) { return (a.pre + a.tail).localeCompare(b.pre + b.tail); });

    var h;
    if (!chips.length) {
      var avail = r.filter(forSale);
      // Biển nổi bật: do anh chọn trong /admin; chưa chọn biển nào thì web tự chọn ngũ quý, tứ quý giá cao
      var vip = avail.filter(function (it) { return it.hot; }).sort(byPrice(true));
      var auto = !vip.length;
      if (auto) vip = avail.filter(function (it) { return it.v === "oto" && /Ngũ quý|Tứ quý/.test(it.tags.join()); }).sort(byPrice(true)).slice(0, 8);
      var saleL = avail.filter(function (it) { return it.sale && vip.indexOf(it) < 0; }).sort(function (a, b) { return b.pct - a.pct; });
      var taken = function (it) { return vip.indexOf(it) > -1 || saleL.indexOf(it) > -1; };
      var won = avail.filter(function (it) { return it.st === "trung" && it.v === "oto" && !taken(it); });
      var oto = avail.filter(function (it) { return it.v === "oto" && it.st !== "trung" && !taken(it); });
      var xm = avail.filter(function (it) { return it.v === "xemay" && !taken(it); }).sort(byPrice(true));
      var sold = r.filter(function (it) { return it.st === "ban"; });
      h = (vip.length ? '<div id="noibat">' + section("🔥 Biển số nổi bật", auto ? "Ngũ quý · Tứ quý" : vip.length + " biển chọn lọc", vip) + "</div>" : "") +
        (saleL.length ? '<div id="giamgia">' + section("Đang giảm giá", saleL.length + " biển · giá tốt có hạn", saleL) + "</div>" : "") +
        (oto.length ? section("Biển ô tô đang bán", oto.length + " biển", oto) : "") +
        (xm.length ? '<div id="xemay">' + section("Biển số xe máy", xm.length + " biển", xm) + "</div>" : "") +
        (won.length ? '<div id="trung">' + section("Biển trúng đấu giá đang chào bán", won.length + " biển · bước giá 5.000.000", won) + "</div>" : "") +
        (sold.length ? section("Biển đã bán gần đây", sold.length + " biển · cảm ơn quý khách", sold) : "");
    } else {
      h = section("Kết quả tìm kiếm", r.length + " biển", r, true);
    }
    $("out").innerHTML = h;
  }

  /* ---------- Hành động (gắn ra window cho HTML gọi) ---------- */
  window.apply = function () { readForm(); state.ids = null; render(); };
  window.doSearch = function () { readForm(); state.ids = null; render(); go("out"); };
  window.setSort = function (v) { state.sort = v; render(); };
  window.resetAll = function () { state = blank(); writeForm(); $("q").value = ""; render(); };
  window.quick = function (o) { window.resetAll(); for (var k in o) state[k] = o[k]; writeForm(); render(); };
  window.toggleFavView = function () { state.onlyFav = !state.onlyFav; render(); go("kho"); };
  window.toggleFav = function (id) {
    if (fav[id]) delete fav[id]; else fav[id] = 1;
    try { localStorage.setItem("bsd_fav", JSON.stringify(fav)); } catch (e) {}
    updFav(); render(); if ($("md").classList.contains("on")) window.openPlate(id);
  };
  function updFav() { $("fc").textContent = Object.keys(fav).filter(function (k) { return ITEMS[k]; }).length; }
  function go(id) { var el = $(id); if (el) el.scrollIntoView({ block: "start" }); }

  function contactLinks(msg) {
    var tel = SITE.hotline ? "tel:" + SITE.hotline.replace(/\s/g, "") : "#lh";
    var zalo = SITE.zalo ? "https://zalo.me/" + SITE.zalo.replace(/\s/g, "") : "#lh";
    return { tel: tel, zalo: zalo, msg: msg };
  }

  window.openPlate = function (id) {
    var it = ITEMS[id], full = it.pre + "-" + it.tail, c = contactLinks();
    $("mdBody").innerHTML = '<button class="x" onclick="closeMd()" aria-label="Đóng">×</button>' +
      plateHtml(it, true) +
      '<dl class="kv">' +
      "<dt>Loại biển</dt><dd>" + (it.tags.join(", ") || "Biển thường") + "</dd>" +
      "<dt>Số nút</dt><dd>" + nutText(it.nut) + "</dd>" +
      "<dt>Ngũ hành</dt><dd>" + mx(it.hanh) + " (theo số cuối)</dd>" +
      "<dt>Hợp người mệnh</dt><dd>" + it.hanh + ", " + SINH[it.hanh] + "</dd>" +
      "<dt>Loại xe</dt><dd>" + (it.v === "xemay" ? "Xe máy" : "Ô tô") + "</dd>" +
      "<dt>Tình trạng</dt><dd>" + (it.st === "trung" ? "Đang chào bán · biển đã trúng đấu giá" : ST_TXT[it.st]) + "</dd>" +
      (it.date ? "<dt>Ngày đăng</dt><dd>" + fmtDate(it.date) + (it.age <= 0 ? " (hôm nay)" : it.age < 9999 ? " (" + it.age + " ngày trước)" : "") + "</dd>" : "") +
      '<dt>Giá</dt><dd style="color:var(--red)">' + priceHtml(it) + "</dd></dl>" +
      meaningHtml(it.mean) +
      (videoOfPlate(it) ? '<div class="mvid"><iframe src="' + ttPlayer(videoOfPlate(it).id) + '" title="Video biển ' + esc(full) + '" allow="fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>' : "") +
      '<div class="row"><a class="btn" href="' + c.tel + '" onclick="return needContact(\'' + c.tel + '\')">📞 Gọi tư vấn</a>' +
      '<a class="btn" style="background:#0068ff" href="' + c.zalo + '" target="_blank" rel="noopener" onclick="copyTxt(\'Tôi quan tâm biển ' + full + '\');return needContact(\'' + c.zalo + '\')">Nhắn Zalo</a></div>' +
      '<div class="row" style="margin-top:8px"><button class="btn ghost" onclick="toggleFav(' + id + ')">' + (fav[id] ? "♥ Bỏ quan tâm" : "♡ Quan tâm") + '</button>' +
      '<button class="btn ghost" onclick="copyTxt(\'' + full + '\')">Sao chép biển</button></div>';
    $("md").classList.add("on");
  };
  function meaningHtml(m) {
    if (!m) return "";
    return '<div class="ynghia"><b>Ý nghĩa biển số</b><p class="yt">' + esc(m.title) + "</p>" +
      (m.sense ? '<p class="ys">' + esc(m.sense) + "</p>" : "") +
      (m.verse ? '<p class="tho">' + esc(m.verse).split(" / ").join("<br>") + "</p>" : "") +
      (m.reading ? '<p class="doc">Đọc từng số: ' + esc(m.reading) + "</p>" : "") + "</div>";
  }
  window.closeMd = function () { $("md").classList.remove("on"); };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") window.closeMd(); });

  window.needContact = function (href) {
    if (href === "#lh") { window.closeMd(); toast("Số liên hệ đang cập nhật – vui lòng để lại thông tin bên dưới"); go("lh"); return false; }
    return true;
  };
  window.copyTxt = function (t) {
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { toast("Đã sao chép: " + t); }, function () {});
  };
  var tt;
  function toast(m) { var el = $("toast"); el.textContent = m; el.classList.add("on"); clearTimeout(tt); tt = setTimeout(function () { el.classList.remove("on"); }, 2600); }

  /* ---------- Công cụ phong thủy ---------- */
  window.checkPlate = function () {
    var raw = $("ckIn").value.trim().toUpperCase(), d = digitsOf(raw.replace(/^\d{2}[A-Z]+\d?/, ""));
    var box = $("ckRes");
    if (d.length < 4) { box.innerHTML = "<p>Vui lòng nhập biển đầy đủ, ví dụ <b>35A-568.68</b>.</p>"; box.classList.add("on"); return; }
    var n = nut(raw), h = HANH_BY_DIGIT[+d[d.length - 1]], tags = classify(d);
    var score = (n === 9 ? 4 : n === 8 || n === 10 ? 3 : n === 7 ? 2 : 1) + Math.min(tags.length, 3) * 2;
    var stars = Math.max(1, Math.min(5, Math.round(score / 2)));
    box.innerHTML = "<h3>" + esc(raw) + " &nbsp;" + "★★★★★".slice(0, stars) + '<span style="opacity:.3">' + "★★★★★".slice(stars) + "</span></h3>" +
      "<p><b>Số nút:</b> " + nutText(n) + "</p>" +
      "<p><b>Ngũ hành:</b> " + mx(h) + " – hợp người mệnh " + h + " và " + SINH[h] + "</p>" +
      "<p><b>Loại biển:</b> " + (tags.join(", ") || "Không thuộc dạng số đẹp phổ biến") + "</p>" +
      meaningHtml(window.PlateMeaning ? window.PlateMeaning(d) : null);
    box.classList.add("on");
  };
  window.checkYear = function () {
    var y = +$("yIn").value, box = $("yRes");
    if (!(y >= 1930 && y <= 2025)) { box.innerHTML = "<p>Vui lòng nhập năm sinh từ 1930 đến 2025.</p>"; box.classList.add("on"); return; }
    var info = yearInfo(y), good = [];
    ITEMS.forEach(function (it) { if (forSale(it) && relation(it.hanh, info.menh).k >= 2) good.push(it.id); });
    var helper = Object.keys(SINH).filter(function (k) { return SINH[k] === info.menh; })[0];
    box.innerHTML = "<h3>Năm " + y + " – " + info.canchi + " – mệnh " + mx(info.menh) + "</h3>" +
      "<p>Biển hợp: hành " + mx(info.menh) + " (cùng mệnh) hoặc " + mx(helper) + " (tương sinh).</p>" +
      "<p>Nên tránh: hành " + mx(Object.keys(KHAC).filter(function (k) { return KHAC[k] === info.menh; })[0]) + " (khắc mệnh).</p>" +
      '<p style="margin-top:10px"><button class="btn" onclick="showYear(' + y + ')">Xem ' + good.length + " biển hợp tuổi trong kho</button></p>";
    box.classList.add("on");
  };
  window.showYear = function (y) {
    var info = yearInfo(y);
    window.resetAll();
    state.ids = ITEMS.filter(function (it) { return forSale(it) && relation(it.hanh, info.menh).k >= 2; }).map(function (it) { return it.id; });
    state.label = "Hợp tuổi " + info.canchi + " (" + info.menh + ")";
    state.sort = "nut"; render(); go("out");
  };

  /* ---------- Bảng tin: video TikTok ---------- */
  var VIDS = (typeof VIDEOS !== "undefined" ? VIDEOS : []).filter(function (v) { return /^\d{8,25}$/.test(String(v.id)); });
  var TT_USER = "mrxuanhuy";
  var vShown = 6;
  function ttUrl(id) { return "https://www.tiktok.com/@" + TT_USER + "/video/" + id; }
  function ttPlayer(id) { return "https://www.tiktok.com/player/v1/" + id + "?music_info=0&description=1&rel=0&native_context_menu=0&closed_caption=0"; }
  function plateKey(s) { return String(s || "").toUpperCase().replace(/[^0-9A-Z]/g, ""); }
  function videoCard(v) {
    var it = v.b ? ITEMS.filter(function (x) { return plateKey(x.pre + x.tail) === plateKey(v.b); })[0] : null;
    return '<article class="vc"><div class="vf"><iframe src="' + ttPlayer(v.id) + '" loading="lazy" title="' + esc(v.t || "Video TikTok") + '" allow="fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>' +
      '<div class="vb"><b class="vt">' + esc(v.t || "Video TikTok") + "</b>" +
      '<div class="vm">' + (v.d ? fmtDate(v.d) : "") + (it ? (v.d ? " · " : "") + '<a href="javascript:void(0)" onclick="openPlate(' + it.id + ')">Xem biển ' + esc(it.pre + "-" + it.tail) + "</a>" : "") + "</div>" +
      '<div class="va"><a href="' + ttUrl(v.id) + '" target="_blank" rel="noopener">Mở trên TikTok ↗</a><button type="button" onclick="shareVideo(\'' + v.id + '\')">Chia sẻ</button></div></div></article>';
  }
  function renderVideos() {
    var g = $("vgrid"); if (!g) return;
    if (!VIDS.length) { g.innerHTML = '<p class="vload">Chưa có video. Xem kênh TikTok bên dưới.</p>'; return; }
    g.innerHTML = VIDS.slice(0, vShown).map(videoCard).join("");
    $("vmoreBtn").hidden = vShown >= VIDS.length;
  }
  window.moreVideos = function () { vShown += 6; renderVideos(); };
  window.shareVideo = function (id) {
    var u = ttUrl(id);
    if (navigator.share) { navigator.share({ title: "Video biển số đẹp – Mr Xuân Huy", url: u }).catch(function () {}); }
    else window.copyTxt(u);
  };
  // Khung kênh TikTok (tự cập nhật video mới) – chỉ tải khi khách cuộn tới
  function loadCreator() {
    var box = $("ttCreator"); if (!box || box.getAttribute("data-on")) return;
    box.setAttribute("data-on", "1");
    box.innerHTML = '<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@' + TT_USER + '" data-unique-id="' + TT_USER + '" data-embed-type="creator" style="max-width:780px;min-width:288px;margin:0 auto"><section><a target="_blank" rel="noopener" href="https://www.tiktok.com/@' + TT_USER + '">@' + TT_USER + "</a></section></blockquote>";
    var s = document.createElement("script"); s.src = "https://www.tiktok.com/embed.js"; s.async = true; document.body.appendChild(s);
  }
  function videoOfPlate(it) {
    var k = plateKey(it.pre + it.tail);
    return VIDS.filter(function (v) { return v.b && plateKey(v.b) === k; })[0];
  }

  /* ---------- Form liên hệ ---------- */
  window.sendLead = function () {
    var msg = "Tư vấn biển số: " + $("lName").value + " – " + $("lPhone").value + ($("lNeed").value ? " – " + $("lNeed").value : "");
    if (SITE.zalo) {
      window.copyTxt(msg);
      $("lhMsg").innerHTML = "Đã sao chép nội dung yêu cầu. Anh/chị bấm <a href=\"https://zalo.me/" + esc(SITE.zalo.replace(/\s/g, "")) +
        "\" target=\"_blank\" rel=\"noopener\" style=\"color:var(--red);font-weight:700;text-decoration:underline\">mở Zalo " + esc(SITE.hotline) +
        "</a> rồi dán vào tin nhắn để gửi, hoặc gọi trực tiếp số trên.";
    } else {
      $("lhMsg").textContent = "Cảm ơn anh/chị! (Bản thử nghiệm: biểu mẫu chưa được kết nối nơi nhận, thông tin chưa được gửi đi.)";
    }
  };

  /* ---------- Khởi tạo ---------- */
  function init() {
    document.querySelectorAll("[data-site]").forEach(function (el) { el.textContent = SITE[el.getAttribute("data-site")] || ""; });
    var hot = SITE.hotline ? SITE.hotline.replace(/\s/g, "").replace(/^(\d{4})(\d{3})(\d{3})$/, "$1.$2.$3") : "Đang cập nhật";
    $("hotTxt").textContent = hot; $("hotTxt2").textContent = hot;
    var c = contactLinks();
    $("fxCall").href = c.tel; $("fxZalo").href = c.zalo;
    if (SITE.zalo) $("fxZalo").target = "_blank";
    if (SITE.messenger) { $("fxMes").href = SITE.messenger; $("fxMes").target = "_blank"; }
    if (SITE.facebook) $("lnFb").href = SITE.facebook;
    if (SITE.tiktok) $("lnTt").href = SITE.tiktok;
    [["fxCall", c.tel], ["fxZalo", c.zalo], ["fxMes", SITE.messenger || "#lh"]].forEach(function (a) {
      if (a[1] === "#lh") $(a[0]).addEventListener("click", function (e) { e.preventDefault(); window.needContact("#lh"); });
    });
    $("p").innerHTML += PROVINCES.map(function (p) { return '<option value="' + p[0] + '">' + esc(p[1]) + "</option>"; }).join("");
    $("t").innerHTML += TYPES.map(function (t) { return "<option>" + t + "</option>"; }).join("");
    $("posts").innerHTML = POSTS.map(function (p) { return '<article><span class="tg">' + esc(p.tag) + "</span><h3>" + esc(p.t) + "</h3><p>" + esc(p.d) + "</p></article>"; }).join("");
    $("stTotal").textContent = ITEMS.filter(forSale).length;
    $("stNB").textContent = ITEMS.filter(function (it) { return it.st === "trung"; }).length;
    // Ẩn mục menu không có biển nào đang bán (tự hiện lại khi có)
    document.querySelectorAll("nav a[data-t], nav a[data-v], nav a[data-sale]").forEach(function (a) {
      var t = a.getAttribute("data-t"), v = a.getAttribute("data-v"), sl = a.hasAttribute("data-sale");
      var n = ITEMS.filter(function (it) { return forSale(it) && (!t || it.tags.indexOf(t) > -1) && (!v || it.v === v) && (!sl || it.sale); }).length;
      a.hidden = n === 0;
    });
    // Menu xổ xuống: bấm để mở/đóng (điện thoại), bấm ra ngoài hoặc chọn mục thì đóng
    var dds = document.querySelectorAll("nav .dd");
    function closeDD(except) { dds.forEach(function (d) { if (d !== except) { d.classList.remove("open"); d.querySelector(".ddb").setAttribute("aria-expanded", "false"); } }); }
    dds.forEach(function (d) {
      var b = d.querySelector(".ddb");
      b.addEventListener("click", function (e) { e.stopPropagation(); var o = !d.classList.contains("open"); closeDD(d); d.classList.toggle("open", o); b.setAttribute("aria-expanded", String(o)); });
      d.querySelectorAll(".ddm a").forEach(function (a) { a.addEventListener("click", function () { closeDD(); if (document.activeElement) document.activeElement.blur(); }); });
    });
    document.addEventListener("click", function () { closeDD(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDD(); });
    renderVideos();
    var bt = $("bangtin");
    if (bt && "IntersectionObserver" in window) {
      new IntersectionObserver(function (en, ob) { if (en[0].isIntersecting) { loadCreator(); ob.disconnect(); } }, { rootMargin: "400px" }).observe(bt);
    } else loadCreator();
    updFav(); render();
  }
  init();
})();
