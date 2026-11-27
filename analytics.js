/* =========================================================
   THỐNG KÊ – Google Analytics 4 (G-JNXZSLM4YE)
   Ghi lại: lượt xem, biển được bấm xem, tìm kiếm, bộ lọc, quan tâm,
   bấm Gọi / Zalo / Messenger, form tư vấn, tra cứu hợp tuổi.
   KHÔNG gửi họ tên, số điện thoại hay nội dung khách nhập vào form.
   ========================================================= */
(function () {
  "use strict";
  var GA_ID = "G-JNXZSLM4YE";
  // Không đếm khi chạy thử trên máy (localhost)
  var LIVE = /(^|\.)maixuanhuy\.id\.vn$/.test(location.hostname) || /github\.io$/.test(location.hostname);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  if (LIVE) {
    gtag("js", new Date());
    gtag("config", GA_ID);
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  }
  var LOG = [];                       // để kiểm tra khi chạy thử
  window.__gaLog = LOG;
  function ev(name, p) {
    p = p || {};
    LOG.push([name, p]);
    if (LIVE) { try { window.gtag("event", name, p); } catch (e) {} }
  }
  var $ = function (id) { return document.getElementById(id); };
  function txt(id) { var el = $(id); if (!el) return ""; return el.tagName === "SELECT" ? (el.value ? el.options[el.selectedIndex].text : "") : el.value.trim(); }
  function info(id) { return window.__plateInfo ? window.__plateInfo(id) : null; }
  function item(i) {
    return { item_id: i.bien, item_name: i.bien, item_category: i.loai, item_category2: i.xe, item_variant: i.st, price: i.gia || 0, quantity: 1 };
  }
  function wrap(name, after) {
    var f = window[name]; if (typeof f !== "function") return;
    window[name] = function () {
      var r = f.apply(this, arguments);
      try { after.apply(null, arguments); } catch (e) {}
      return r;
    };
  }

  /* --- Biển được bấm xem (báo cáo "Mặt hàng" trong GA) --- */
  // Trang riêng từng biển (/bien/...): biển của trang được đặt sẵn trong window.__PAGE_PLATE
  var PAGE = window.__PAGE_PLATE || null;
  var cur = PAGE, lastId = null, lastT = 0;
  if (PAGE) ev("view_item", { currency: "VND", value: PAGE.gia || 0, items: [item(PAGE)], bien: PAGE.bien, loai_bien: PAGE.loai, loai_xe: PAGE.xe, vi_tri: "trang_bien" });
  wrap("openPlate", function (id) {
    var i = info(id); if (!i) return;
    cur = i;
    if (id === lastId && Date.now() - lastT < 3000) return;   // bỏ lần mở lại khi bấm Quan tâm
    lastId = id; lastT = Date.now();
    ev("view_item", { currency: "VND", value: i.gia || 0, items: [item(i)], bien: i.bien, loai_bien: i.loai, loai_xe: i.xe });
  });
  wrap("closeMd", function () { cur = PAGE; });

  /* --- Tìm kiếm, bộ lọc, menu --- */
  wrap("doSearch", function () { var q = txt("q"); if (q) ev("search", { search_term: q }); });
  wrap("apply", function () {
    ev("loc_bien", { ma_tinh: txt("p"), loai_xe: txt("v"), loai_bien: txt("t"), menh: txt("m"), so_nut: txt("n"), thoi_gian: txt("dt"), khoang_gia: txt("g") });
  });
  wrap("quick", function (o) {
    var k = Object.keys(o || {}), m = k.length ? k.map(function (x) { return x + "=" + o[x]; }).join(",") : "tat_ca";
    ev("chon_menu", { muc: m });
  });
  wrap("setSort", function (v) { ev("sap_xep", { kieu: v || "mac_dinh" }); });

  /* --- Quan tâm (yêu thích) --- */
  wrap("toggleFav", function (id) {
    var i = info(id); if (!i) return;
    ev("add_to_wishlist", { currency: "VND", value: i.gia || 0, items: [item(i)], bien: i.bien });
  });

  /* --- Phong thủy: dịch nghĩa biển, tìm biển hợp tuổi (cho biết độ tuổi khách) --- */
  wrap("checkPlate", function () { var b = txt("ckIn"); if (b) ev("dich_nghia_bien", { bien: b.toUpperCase() }); });
  wrap("checkYear", function () {
    var y = +txt("yIn");
    if (y >= 1930 && y <= 2025) ev("tim_bien_hop_tuoi", { nam_sinh: String(y), nhom_tuoi: nhomTuoi(new Date().getFullYear() - y) });
  });
  function nhomTuoi(a) { return a < 25 ? "18-24" : a < 35 ? "25-34" : a < 45 ? "35-44" : a < 55 ? "45-54" : a < 65 ? "55-64" : "65+"; }

  /* --- Form tư vấn (chỉ đếm, không gửi tên/số điện thoại) --- */
  wrap("sendLead", function () { ev("generate_lead", { currency: "VND", value: 0, vi_tri: "form_tu_van" }); });

  /* --- Video --- */
  wrap("shareVideo", function (id) { ev("share", { method: "video_tiktok", content_type: "video", item_id: String(id) }); });
  wrap("moreVideos", function () { ev("xem_them_video", {}); });

  /* --- Bấm Gọi / Zalo / Messenger / TikTok / Facebook (mọi nơi trên trang) --- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
    var h = a.getAttribute("href") || "", pt = "";
    if (/^tel:/.test(h)) pt = "goi";
    else if (/zalo\.me/.test(h)) pt = "zalo";
    else if (/m\.me|messenger/.test(h)) pt = "messenger";
    else if (/tiktok\.com/.test(h)) { ev("mo_tiktok", { vi_tri: a.closest("#bangtin") ? "bang_tin" : "khac" }); return; }
    else if (/facebook\.com/.test(h)) { ev("mo_facebook", {}); return; }
    if (!pt) return;
    var inPlate = a.closest("#md") || PAGE;
    var vt = a.closest("#md") ? "chi_tiet_bien" : a.closest(".fx") ? (PAGE ? "trang_bien_thanh_duoi" : "thanh_duoi") : PAGE ? "trang_bien" : a.closest("#lh") ? "form_tu_van" : "khac";
    ev("lien_he", { phuong_thuc: pt, vi_tri: vt, bien: cur && inPlate ? cur.bien : "(chung)", loai_bien: cur && inPlate ? cur.loai : "" });
  }, true);

  /* --- Thông báo dùng thống kê (theo quy định bảo vệ dữ liệu cá nhân) --- */
  function notice() {
    try { if (localStorage.getItem("bsd_ga_ok")) return; } catch (e) {}
    var d = document.createElement("div");
    d.className = "ganote"; d.setAttribute("role", "status");
    d.innerHTML = "Website dùng cookie thống kê (Google Analytics) để đếm lượt xem và cải thiện nội dung. Không thu thập họ tên hay số điện thoại. <button type=\"button\">Đã hiểu</button>";
    d.querySelector("button").onclick = function () { try { localStorage.setItem("bsd_ga_ok", "1"); } catch (e) {} d.remove(); };
    document.body.appendChild(d);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", notice); else notice();
})();
