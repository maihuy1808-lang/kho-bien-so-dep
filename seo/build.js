// Chạy bằng Node (GitHub Actions): node seo/build.js
// Đọc data.js, videos.js, meaning.js → tạo trang SEO, sitemap.xml, robots.txt, cập nhật danh mục ở index.html
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const ctx = { console, Date, Math, JSON, String, Number };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ["data.js", "videos.js", "meaning.js", "seo/core.js"]) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, "utf8"), ctx, { filename: f });
}
if (!ctx.SEOCore || !ctx.PLATES || !ctx.SITE) { console.error("Thiếu dữ liệu (SEOCore/PLATES/SITE)"); process.exit(1); }

const out = ctx.SEOCore.build({ SITE: ctx.SITE, PLATES: ctx.PLATES, VIDEOS: ctx.VIDEOS || [], PlateMeaning: ctx.PlateMeaning, now: new Date() });

// Ảnh chia sẻ riêng từng biển: SVG → PNG bằng rsvg-convert (cài trong GitHub Actions).
// Tên ảnh có mã băm nội dung → giá đổi thì tên đổi, Facebook không dùng ảnh cũ.
const { spawnSync } = require("child_process");
const OG = path.join(ROOT, "og");
const want = new Set((out.images || []).map((i) => path.basename(i.path)));
fs.mkdirSync(OG, { recursive: true });
for (const f of fs.readdirSync(OG)) if (!want.has(f)) fs.rmSync(path.join(OG, f), { force: true });
const failed = new Set();
const tmp = fs.mkdtempSync(path.join(require("os").tmpdir(), "og-"));
let made = 0;
for (const img of out.images || []) {
  const dest = path.join(ROOT, img.path);
  if (fs.existsSync(dest)) continue; // cùng nội dung đã có sẵn
  const svgFile = path.join(tmp, path.basename(img.path) + ".svg");
  fs.writeFileSync(svgFile, img.svg, "utf8");
  const r = spawnSync("rsvg-convert", ["-w", "1200", "-h", "630", "-o", dest, svgFile]);
  if (r.status === 0 && fs.existsSync(dest)) made++;
  else { failed.add("/" + img.path); fs.rmSync(dest, { force: true }); }
}
if (failed.size) {
  console.warn(`Không tạo được ${failed.size} ảnh chia sẻ (thiếu rsvg-convert?) → dùng ảnh chung.`);
  for (const [rel, html] of Object.entries(out.files)) {
    let h = html;
    for (const p of failed) if (h.includes(p)) h = h.split(p).join("/og-mr-xuan-huy-2.jpg");
    out.files[rel] = h;
  }
}
console.log(`Ảnh chia sẻ: tạo mới ${made}, giữ ${want.size - made - failed.size}, lỗi ${failed.size}.`);

// Xóa trang cũ do bộ tạo sinh ra (biển đã xóa khỏi kho thì trang cũng mất)
for (const d of ["bien"].concat(out.topicDirs)) fs.rmSync(path.join(ROOT, d), { recursive: true, force: true });

let n = 0;
for (const [rel, html] of Object.entries(out.files)) {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html, "utf8");
  n++;
}

// Chèn danh mục vào trang chủ
const idx = path.join(ROOT, "index.html");
let home = fs.readFileSync(idx, "utf8");
const re = /(<!--SEO-DANH-MUC[^>]*-->)[\s\S]*?(<!--\/SEO-DANH-MUC-->)/;
if (re.test(home)) {
  home = home.replace(re, (m, a, b) => a + "\n" + out.danhMuc + "\n" + b);
  fs.writeFileSync(idx, home, "utf8");
}
console.log(`Đã tạo ${n} tệp: ${out.count.plates} trang biển, ${out.count.topics} trang chủ đề, sitemap ${out.count.urls} địa chỉ.`);
