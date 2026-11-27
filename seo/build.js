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
