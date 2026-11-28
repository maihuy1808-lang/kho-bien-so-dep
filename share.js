/* =========================================================
   NÚT CHIA SẺ: Facebook, chia sẻ trên điện thoại, sao chép nội dung / link
   Dùng: <div class="shr-bar" data-url="..." data-text="..."> ... </div>
   (Nút do seo/core.js và app.js vẽ sẵn; tệp này gắn hành động.)
   Facebook không cho web điền sẵn chữ → nút "Sao chép nội dung" để anh dán vào bài.
   ========================================================= */
(function () {
  "use strict";
  function toast(msg) {
    var t = document.getElementById("shr-toast");
    if (!t) { t = document.createElement("div"); t.id = "shr-toast"; t.className = "shr-toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("on");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("on"); }, 2800);
  }
  function copy(text, okMsg) {
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast(okMsg); } catch (e) { toast("Không chép được, anh giữ tay vào chữ để chép."); }
      ta.remove();
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { toast(okMsg); }, fallback);
    else fallback();
  }
  function track(method, url) {
    try { if (window.gtag) window.gtag("event", "share", { method: method, content_type: "trang_web", item_id: url }); } catch (e) {}
  }
  function init(root) {
    (root || document).querySelectorAll(".shr-bar").forEach(function (bar) {
      if (bar.getAttribute("data-on")) return; bar.setAttribute("data-on", "1");
      var url = bar.getAttribute("data-url") || location.href;
      var text = bar.getAttribute("data-text") || "";
      var nat = bar.querySelector('[data-act="native"]');
      if (nat && navigator.share) nat.hidden = false;
      bar.addEventListener("click", function (e) {
        var b = e.target.closest("[data-act]"); if (!b) return;
        var act = b.getAttribute("data-act");
        if (act === "fb") {
          track("facebook", url);
          window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url), "fbshare", "width=640,height=640,noopener");
          if (text) copy(text, "Đã mở Facebook và chép sẵn nội dung bài – anh dán (giữ tay → Dán) vào ô viết bài nhé.");
        } else if (act === "native") {
          track("dien_thoai", url);
          navigator.share({ title: document.title, text: text ? text.split("\n")[0] : "", url: url }).catch(function () {});
        } else if (act === "copy") {
          track("sao_chep_noi_dung", url);
          copy(text + (text.indexOf(url) < 0 ? "\n\n👉 " + url : ""), "Đã chép nội dung bài. Mở Facebook/Zalo rồi dán vào là xong.");
        } else if (act === "link") {
          track("sao_chep_link", url);
          copy(url, "Đã chép link: " + url);
        }
      });
    });
  }
  window.initShareBars = init;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { init(); }); else init();
})();
