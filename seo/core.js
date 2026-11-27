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
  var CSS_V = "seo4";

  /* ---- Nhận diện loại biển (giống app.js) ---- */
  var HANH = ["Thổ", "Thủy", "Hỏa", "Mộc", "Kim", "Thổ", "Thủy", "Hỏa", "Mộc", "Kim"];
  var SINH = { "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc", "Mộc": "Hỏa", "Hỏa": "Thổ" };
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
      intro: "Tổng hợp biển số đẹp Ninh Bình (mã 35) đang chào bán: biển ô tô 35A, 35B và biển xe máy, đủ các dòng ngũ quý, tứ quý, tam hoa, thần tài, phát lộc. Giá công khai, cập nhật liên tục, hỗ trợ sang tên và hồ sơ theo đúng quy định." },
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
    { slug: "bien-o-to", h1: "Biển số ô tô đẹp Ninh Bình", kw: "biển số ô tô đẹp Ninh Bình", v: "oto",
      intro: "Biển số ô tô đẹp Ninh Bình 35A, 35B đang chào bán, xếp theo giá từ cao xuống thấp." },
    { slug: "bien-xe-may", h1: "Biển số xe máy đẹp Ninh Bình", kw: "biển số xe máy đẹp Ninh Bình", v: "xemay",
      intro: "Biển số xe máy đẹp Ninh Bình (35AA, 35AB, 35AC, 35B1…) đủ loại tứ quý, ngũ quý, tam hoa với giá tốt." },
    { slug: "bien-35a", h1: "Biển số đẹp 35A", kw: "biển 35A", pre: "35A",
      intro: "Các biển số đẹp đầu 35A (ô tô Ninh Bình) đang có sẵn, kèm giá và ý nghĩa từng biển." },
    { slug: "bien-35b", h1: "Biển số đẹp 35B", kw: "biển 35B", pre: "35B",
      intro: "Các biển số đẹp đầu 35B đang có sẵn tại kho Ninh Bình." },
    { slug: "bien-so-dep-gia-re", h1: "Biển số đẹp giá rẻ dưới 100 triệu", kw: "biển số đẹp giá rẻ",
      test: function (it) { return it.price > 0 && it.price < 1e8; },
      intro: "Biển số đẹp giá dưới 100 triệu đồng – lựa chọn hợp lý cho người muốn có biển đẹp mà không tốn nhiều chi phí." },
    { slug: "dau-gia-bien-so-ninh-binh", h1: "Đấu giá biển số Ninh Bình – nhận đấu giá hộ", kw: "đấu giá biển số Ninh Bình", st: "trung", service: true,
      intro: "Mr. Mai Xuân Huy nhận tư vấn và đấu giá biển số hộ tại Ninh Bình: chọn biển, đăng ký, nộp tiền đặt trước, theo sát phiên đấu giá trực tuyến và hoàn tất thủ tục. Dưới đây là những biển đã trúng đấu giá đang được chào bán lại." }
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
      '<nav><div class="w nv"><a class="nvl" href="/">Trang chủ</a><a class="nvl" href="/bien-so-dep-ninh-binh/">Biển số đẹp Ninh Bình</a><a class="nvl" href="/bien-xe-may/">Xe máy</a><a class="nvl" href="/dau-gia-bien-so-ninh-binh/">Đấu giá hộ</a></div></nav></header>\n' +
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
      if (!list.length) return;
      topicsUsed.push({ t: t, n: list.length });
    });
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
      var body = cr.html + '<h1 class="seo-h1">' + esc(t.h1) + "</h1>" +
        '<p class="seo-intro">' + esc(t.intro) + " Hiện có <b>" + list.length + " biển</b>." + esc(priceNote) + ' Gọi/Zalo <a href="tel:' + hotline(SITE) + '"><b>' + hotFmt(SITE) + "</b></a> để giữ biển.</p>" +
        service +
        '<div class="gr">' + list.map(card).join("") + "</div>" +
        '<h2 class="seo-h2">Xem thêm</h2>' + topicLinks(t.slug);
      var title = t.h1 + " – " + list.length + " biển có giá | Kho Biển Số Đẹp Mai Xuân Huy";
      var desc = t.h1 + ": " + list.length + " biển" + priceNote + " " + t.intro.slice(0, 90) + "… Hotline/Zalo " + hotFmt(SITE) + ".";
      var ldList = { "@context": "https://schema.org", "@type": "ItemList", name: t.h1, numberOfItems: list.length,
        itemListElement: list.slice(0, 50).map(function (it, i) { return { "@type": "ListItem", position: i + 1, url: BASE + it.url, name: "Biển số " + it.label }; }) };
      files[t.slug + "/index.html"] = layout({ SITE: SITE, path: path, title: title, desc: desc, body: body, ld: [cr.ld, ldList] });
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
