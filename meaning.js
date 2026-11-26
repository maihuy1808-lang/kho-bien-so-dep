/* =========================================================
   DỊCH NGHĨA BIỂN SỐ – theo cách đọc dân gian & phong thủy
   Dùng chung cho website và trang /admin.
   PlateMeaning("886.68") -> { title, verse, reading, theme }
   Muốn thêm câu hay: thêm vào CUM_SO (dãy dài trước).
   ========================================================= */
(function (root) {
  "use strict";

  // Nghĩa từng chữ số (theo âm Hán Việt quen dùng)
  var SO = {
    "0": "Bất (trọn vẹn)", "1": "Nhất (khởi đầu)", "2": "Mãi", "3": "Tài", "4": "Tứ (bốn mùa)",
    "5": "Phúc", "6": "Lộc", "7": "Thất (vững chắc)", "8": "Phát", "9": "Cửu (trường cửu)"
  };

  // Cụm số có nghĩa sẵn – [dãy, tên gọi, câu thơ/lời chúc]
  var CUM_SO = [
    ["12345", "Thăng tiến không ngừng", "Một bước lên một bậc thang, / Công danh sự nghiệp rộng đàng thênh thang."],
    ["23456", "Tiến bước vững vàng", "Từng bước tiến chẳng lùi lại, / Đường đời rộng mở, tương lai huy hoàng."],
    ["34567", "Sảnh tài lộc tiến", "Tài đến trước, lộc theo sau, / Năm năm phát đạt, giàu sang dài lâu."],
    ["45678", "Bốn mùa phát đạt", "Bốn mùa phúc lộc chan hòa, / Càng đi càng phát, cửa nhà thịnh hưng."],
    ["56789", "Phúc lộc dồi dào", "Phúc sinh lộc, lộc sinh tài, / Trường cửu phát đạt, tương lai vững bền."],
    ["1102", "Độc nhất vô nhị", "Độc nhất vô nhị trên đời, / Chủ nhân bản lĩnh, một thời vang danh."],
    ["6789", "San bằng tất cả", "Sáu bảy tám chín một đường, / San bằng tất cả, chặng đường thênh thang."],
    ["6886", "Lộc phát song hành", "Sáu lộc tám phát song hành, / Làm ăn thuận lợi, công danh rạng ngời."],
    ["8668", "Phát lộc vẹn toàn", "Phát rồi lộc, lộc rồi phát, / Tiền vào như nước, nhà cửa ấm êm."],
    ["6868", "Lộc phát lộc phát", "Lộc phát nối tiếp lộc phát, / Năm này nối năm, tài lộc chẳng vơi."],
    ["8686", "Phát lộc phát lộc", "Phát lộc rồi lại phát lộc, / Kinh doanh thịnh vượng, an khang trọn đời."],
    ["8386", "Phát tài phát lộc", "Phát tài rồi lại phát lộc, / Tiền tài rủng rỉnh, sự nghiệp vững vàng."],
    ["8683", "Phát lộc phát tài", "Phát lộc đi trước, tài theo sau, / Làm ăn hưng thịnh, giàu sang dài lâu."],
    ["1368", "Sinh tài lộc phát", "Nhất sinh tài, tài sinh lộc, / Lộc sinh phát đạt, cả nhà an vui."],
    ["1486", "Một năm bốn mùa phát lộc", "Một năm bốn mùa phát lộc, / Xuân hạ thu đông tiền bạc đầy kho."],
    ["4078", "Bốn mùa không thất bát", "Bốn mùa chẳng chút thất bát, / Ruộng đầy lúa chín, nhà đầy niềm vui."],
    ["0578", "Không năm nào thất bát", "Năm nào cũng được mùa to, / Không năm thất bát, chẳng lo thiếu thừa."],
    ["2626", "Mãi lộc mãi lộc", "Mãi lộc rồi lại mãi lộc, / Lộc trời ban xuống chẳng ngơi tháng ngày."],
    ["2828", "Mãi phát mãi phát", "Mãi phát rồi lại mãi phát, / Làm gì cũng thuận, đi đâu cũng thành."],
    ["3979", "Thần tài lớn nhỏ hội tụ", "Thần tài nhỏ, Thần tài lớn, / Cùng về một biển, tiền vô như mưa."],
    ["7939", "Thần tài song hội", "Thần tài lớn dắt Thần tài nhỏ, / Gõ cửa mỗi ngày, két sắt đầy vơi."],
    ["3939", "Thần tài nhỏ song hành", "Thần tài nhỏ đến hai lần, / Buôn may bán đắt, xa gần tìm mua."],
    ["7979", "Thần tài lớn song hành", "Thần tài lớn đến hai lần, / Tiền vào như nước, phúc phần dồi dào."],
    ["3838", "Ông địa song hành", "Ông địa giữ cửa giữ nhà, / Đi xa gặp quý, về nhà bình an."],
    ["7878", "Ông địa lớn song hành", "Ông địa lớn phù hộ đôi, / Đất lành chim đậu, cơ ngơi vững bền."],
    ["1111", "Nhất nhất độc tôn", "Bốn số một đứng hàng đầu, / Đi đâu cũng nhất, chẳng sau một ai."],
    ["9999", "Trường cửu vĩnh hằng", "Chín chín vĩnh cửu muôn đời, / Công danh bền vững như trời với non."],
    ["8888", "Tứ phát – phát mãi không ngừng", "Bốn số tám phát không ngừng, / Tiền vào như nước, vui mừng quanh năm."],
    ["6666", "Tứ lộc – lộc đầy nhà", "Bốn lộc đổ xuống một nhà, / Ông bà con cháu thuận hòa ấm no."],
    ["5555", "Tứ phúc lâm môn", "Bốn phúc gõ cửa một nhà, / Bình an, sức khỏe, thuận hòa, giàu sang."],
    ["3333", "Tứ tài – tài lộc vượng", "Bốn tài hội tụ một nơi, / Tiền tài sung túc trọn đời an vui."],
    ["7777", "Tứ thất – vững như bàn thạch", "Bốn số bảy vững như đồng, / Làm gì cũng chắc, thành công vẹn tròn."],
    ["1234", "Từng bước tiến lên", "Một hai ba bốn tiến lên, / Công danh sự nghiệp ngày lên ngày giàu."],
    ["5678", "Càng đi càng phát", "Năm sáu bảy tám lên đều, / Càng đi càng phát, tiền nhiều của sang."],
    ["2204", "Mãi mãi trường tồn", "Mãi mãi bền chặt bốn mùa, / Trường tồn vững chãi chẳng thua bao giờ."],
    ["39", "Thần tài nhỏ", "Thần tài gõ cửa mỗi ngày, / Làm ăn phát đạt, tiền đầy két sắt."],
    ["79", "Thần tài lớn", "Thần tài lớn ghé thăm nhà, / Tiền vô như nước, lộc ra lộc vào."],
    ["38", "Ông địa nhỏ", "Ông địa phù hộ giữ nhà, / Đi đâu cũng thuận, về nhà bình an."],
    ["78", "Ông địa lớn", "Ông địa lớn giữ đất lành, / Làm ăn thuận lợi, cơ ngơi vững vàng."],
    ["68", "Lộc phát", "Lộc đến trước, phát theo sau, / Làm ăn khấm khá, giàu sang dài lâu."],
    ["86", "Phát lộc", "Phát rồi lộc chẳng hề ngơi, / Tiền tài sung túc trọn đời an khang."],
    ["83", "Phát tài", "Phát tài phát lộc đều tay, / Năm nay hơn cũ, ngày mai hơn nay."],
    ["36", "Tài lộc", "Tài đi trước, lộc theo sau, / Buôn may bán đắt, đâu đâu cũng giàu."],
    ["88", "Song phát", "Hai số tám phát song đôi, / Làm ăn thịnh vượng, tiền thời đầy kho."],
    ["66", "Song lộc", "Hai lộc nối gót về nhà, / Gia đình sung túc, thuận hòa yên vui."],
    ["99", "Song cửu – trường tồn", "Hai số chín vững muôn năm, / Công danh sự nghiệp vững chắc lâu dài."],
    ["26", "Mãi lộc", "Mãi lộc chẳng vơi bao giờ, / Tiền tài như suối đổ về quanh năm."],
    ["28", "Mãi phát", "Mãi phát mãi lên chẳng ngừng, / Đường xa vạn dặm tưng bừng thành công."],
    ["56", "Phúc lộc", "Phúc lộc song hành một nhà, / Ông bà con cháu thuận hòa ấm no."],
    ["58", "Phúc phát", "Có phúc lại có phát tài, / Bình an sức khỏe, tương lai rạng ngời."],
    ["89", "Phát mãi trường tồn", "Phát rồi trường cửu lâu bền, / Cơ đồ sự nghiệp vững trên muôn đời."],
    ["69", "Lộc trường cửu", "Lộc trời trường cửu lâu dài, / Đời đời sung túc, tương lai an nhàn."],
    ["98", "Cửu phát", "Trường cửu mà lại phát tài, / Bền lâu thịnh vượng, nào ai sánh bằng."]
  ];

  // Câu thơ theo chủ đề – dùng khi biển không có cụm số đặc biệt
  var THO = {
    ngu: "Năm số {d} đứng một hàng, / {y} – biển hiếm, chủ nhân sang giàu.",
    tu: "Bốn số {d} nối thành hàng, / {y} vững vàng, phú quý vinh hoa.",
    tam: "Ba số {d} hội tụ cùng, / {y} rạng rỡ, thành công tràn đầy.",
    sanh: "Từng bước tiến lên vững vàng, / Công danh rộng mở, giàu sang đến gần.",
    ganh: "Hai đầu gánh một chữ vàng, / Cân bằng phúc lộc, an nhàn trọn đời.",
    lap: "Cặp số nối cặp song hành, / Làm ăn đôi lối, thành danh đôi đường.",
    phat: "Đường xa vạn dặm phát tài, / Tiền vào như nước, lộc ngoài như mưa.",
    loc: "Lộc đầy như suối chảy về, / Bốn mùa sung túc, mọi bề an vui.",
    cuu: "Trường cửu bền vững như non, / Công danh sự nghiệp vẹn tròn trước sau.",
    tai: "Tài lộc chẳng thiếu bao giờ, / Làm ăn thuận buồm, ước mơ thành hình.",
    phuc: "Phúc lành gõ cửa mỗi ngày, / Gia đình êm ấm, tháng ngày bình an.",
    chung: "Biển đẹp đồng hành mỗi chuyến, / Thượng lộ bình an, vạn sự hanh thông."
  };
  var TEN_SO = { "0": "không", "1": "một", "2": "hai", "3": "ba", "4": "bốn", "5": "năm", "6": "sáu", "7": "bảy", "8": "tám", "9": "chín" };
  var Y_NGHIA = { "0": "Viên mãn", "1": "Độc tôn", "2": "Mãi mãi", "3": "Tài lộc", "4": "Bốn mùa", "5": "Ngũ phúc", "6": "Lộc", "7": "Vững chắc", "8": "Phát đạt", "9": "Trường cửu" };

  function digits(s) { return String(s || "").replace(/\D/g, ""); }
  function same(s) { return /^(\d)\1+$/.test(s); }
  function seq(s) { for (var i = 1; i < s.length; i++) if (+s[i] !== +s[i - 1] + 1) return false; return s.length > 1; }
  function pal(s) { return s.length > 2 && s === s.split("").reverse().join(""); }
  function fill(t, d) { return t.replace(/\{d\}/g, TEN_SO[d]).replace(/\{y\}/g, Y_NGHIA[d]); }

  /* ---------- Đọc liền cả dãy số ---------- */
  var CHU = { "0": "viên", "1": "nhất", "2": "mãi", "3": "tài", "4": "tứ", "5": "phúc", "6": "lộc", "7": "thất", "8": "phát", "9": "cửu" };
  var DEM = ["", "", "song", "tam", "tứ quý", "ngũ"];
  var Y_CAU = {
    "6": "tài lộc dồi dào", "8": "làm ăn phát đạt", "9": "bền vững trường cửu", "3": "tiền tài sung túc",
    "2": "mãi mãi bền lâu", "1": "khởi đầu suôn sẻ", "5": "phúc đức đủ đầy", "4": "bốn mùa bình an",
    "7": "vững chắc an toàn", "0": "viên mãn tròn đầy"
  };
  var CAP_CUOI = { "39": "thần tài nhỏ", "79": "thần tài lớn", "38": "ông địa nhỏ", "78": "ông địa lớn" };
  function hoa(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  // Tách dãy thành từng cụm: cụm số có tên (≥4 số), thần tài/ông địa ở cuối, hoặc các số giống nhau liền nhau
  function docDay(d, atEnd) {
    if (!d) return [];
    // Cụm số có tên (≥4 số, không phải toàn một số) ở bất kỳ vị trí nào – lấy cụm dài nhất
    var best = null;
    for (var k = 0; k < CUM_SO.length; k++) {
      var c = CUM_SO[k][0];
      if (c.length < 4 || same(c)) continue;
      var at = d.indexOf(c);
      if (at > -1 && (!best || c.length > best.c.length)) best = { at: at, c: c, name: CUM_SO[k][1] };
    }
    if (best) return docDay(d.slice(0, best.at), false).concat([best.name.toLowerCase()], docDay(d.slice(best.at + best.c.length), atEnd));
    // Còn lại: thần tài / ông địa ở cuối biển, hoặc gom các số giống nhau (song, tam, tứ, ngũ)
    var parts = [], i = 0;
    while (i < d.length) {
      if (atEnd && i === d.length - 2 && CAP_CUOI[d.slice(-2)]) { parts.push(CAP_CUOI[d.slice(-2)]); i += 2; continue; }
      var j = i; while (j < d.length && d[j] === d[i]) j++;
      var n = j - i;
      parts.push(n === 1 ? CHU[d[i]] : DEM[Math.min(n, 5)] + " " + CHU[d[i]]);
      i = j;
    }
    return parts;
  }
  function giaiNghia(d) {
    var y = [], seen = {};
    if (d.length >= 5 && same(d.slice(-5))) y.push("biển ngũ quý hiếm có");
    else if (same(d.slice(-4))) y.push("biển tứ quý sang trọng");
    if (d.indexOf("1102") > -1) y.push("độc nhất vô nhị");
    if (seq(d.slice(-4))) y.push("từng bước thăng tiến");
    if (/(39|79)$/.test(d)) y.push("thần tài gõ cửa");
    if (/(38|78)$/.test(d)) y.push("ông địa phù hộ");
    // ưu tiên số xuất hiện nhiều, rồi theo thứ tự trong dãy
    var cnt = {}; d.split("").forEach(function (c) { cnt[c] = (cnt[c] || 0) + 1; });
    var order = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a] || d.indexOf(a) - d.indexOf(b); });
    order.forEach(function (c) { if (y.length < 3 && !seen[c]) { seen[c] = 1; y.push(Y_CAU[c]); } });
    return y.join(", ");
  }
  function chonTho(d) { var r = cu(d); return r ? r.verse : THO.chung; }

  function PlateMeaning(tail) {
    var d = digits(tail);
    if (d.length < 2) return null;
    var parts = docDay(d, true);
    return {
      title: hoa(parts.join(" ")),          // đọc liền cả dãy, vd "Tam lộc phát lộc"
      sense: hoa(giaiNghia(d)),             // giải nghĩa, vd "Tài lộc dồi dào, làm ăn phát đạt"
      verse: chonTho(d),
      reading: d.split("").map(function (c) { return c + " " + SO[c]; }).join(" · ")
    };
  }

  // Bộ chọn câu thơ (giữ cách nhận diện cũ)
  function cu(tail) {
    var d = digits(tail);
    if (d.length < 2) return null;
    var L = d.length, last4 = d.slice(-4), last5 = d.slice(-5);
    var reading = d.split("").map(function (c) { return c + " " + SO[c]; });
    var res = { title: "", verse: "", reading: reading.join(" · "), theme: "chung" };

    // 1) Dãy đặc biệt (ngũ quý, tứ quý, tam hoa)
    if (L >= 5 && same(last5)) { res.title = "Ngũ quý " + d[L - 1] + " – " + Y_NGHIA[d[L - 1]] + " tuyệt đỉnh"; res.verse = fill(THO.ngu, d[L - 1]); res.theme = "ngu"; return res; }
    var tq = same(last4) ? last4 : (L >= 5 && same(d.slice(0, 4)) ? d.slice(0, 4) : "");

    // 2) Cụm số có nghĩa sẵn: ưu tiên dãy dài, ưu tiên nằm cuối biển
    var found = null;
    for (var i = 0; i < CUM_SO.length && !found; i++) {
      var c = CUM_SO[i][0];
      if (c.length >= 4 && (d.slice(-c.length) === c || (c.length === 4 && d.indexOf(c) > -1))) found = CUM_SO[i];
    }
    if (!found && tq) { res.title = "Tứ quý " + tq[0] + " – " + Y_NGHIA[tq[0]]; res.verse = fill(THO.tu, tq[0]); res.theme = "tu"; return res; }
    if (!found && seq(last4)) { res.title = "Sảnh tiến – Từng bước đi lên"; res.verse = THO.sanh; res.theme = "sanh"; return res; }
    if (found) { res.title = found[0] + " – " + found[1]; res.verse = found[2]; res.theme = "cum"; return res; }

    function pairOf(p) { for (var j = 0; j < CUM_SO.length; j++) if (CUM_SO[j][0] === p) return CUM_SO[j]; return null; }
    // 3) Tam hoa cuối (vd 568.88), lặp kép (vd 983.83)
    if (same(d.slice(-3))) { var t3 = d[L - 1]; res.title = "Tam hoa " + t3 + " – " + Y_NGHIA[t3]; res.verse = fill(THO.tam, t3); res.theme = "tam"; return res; }
    if (last4[0] === last4[2] && last4[1] === last4[3] && last4[0] !== last4[1]) {
      var pr = pairOf(last4.slice(2));
      res.title = last4 + " – " + (pr ? pr[1] : Y_NGHIA[last4[0]] + " " + Y_NGHIA[last4[1]].toLowerCase()) + " song hành";
      res.verse = pr ? pr[2] : THO.lap; res.theme = "lap"; return res;
    }
    // 4) Cặp số cuối có nghĩa (vd …39, …68), kèm tam hoa đầu nếu có (vd 999.29)
    var p2 = pairOf(d.slice(-2));
    var th = L >= 5 && same(d.slice(0, 3)) ? d[0] : "";
    if (p2) { res.title = (th ? "Tam hoa " + th + " · " : "") + p2[0] + " – " + p2[1]; res.verse = p2[2]; res.theme = "cum"; return res; }
    if (th) { res.title = "Tam hoa " + th + " – " + Y_NGHIA[th]; res.verse = fill(THO.tam, th); res.theme = "tam"; return res; }
    if (pal(last5) || pal(last4)) { res.title = "Số gánh – Cân bằng phúc lộc"; res.verse = THO.ganh; res.theme = "ganh"; return res; }

    // 4) Theo chữ số nổi trội
    var cnt = {}; d.split("").forEach(function (c) { cnt[c] = (cnt[c] || 0) + 1; });
    var order = [["8", "phat", "Phát đạt"], ["6", "loc", "Lộc đầy"], ["9", "cuu", "Trường cửu"], ["3", "tai", "Tài lộc"], ["5", "phuc", "Phúc lành"]];
    for (var k = 0; k < order.length; k++) {
      if ((cnt[order[k][0]] || 0) >= 2) { res.title = order[k][2] + " – nhiều số " + order[k][0]; res.verse = THO[order[k][1]]; res.theme = order[k][1]; return res; }
    }
    var lastPair = d.slice(-2);
    res.title = Y_NGHIA[lastPair[0]] + " – " + Y_NGHIA[lastPair[1]];
    res.verse = THO.chung;
    return res;
  }

  root.PlateMeaning = PlateMeaning;
})(window);
