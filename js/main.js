/* Lean StartApp — homepage rendering + interactions ("System" design) */
(function () {
  "use strict";

  /* ---- theme: dark by default, light stored as preference ---- */
  var root = document.documentElement;
  var toggle = document.getElementById("themeToggle");
  var stored = null;
  try { stored = localStorage.getItem("ls-theme"); } catch (e) {}
  if (stored === "light") { root.removeAttribute("data-theme"); }
  else { root.setAttribute("data-theme", "dark"); }
  function syncIcon() {
    var dark = root.getAttribute("data-theme") === "dark";
    if (toggle) toggle.textContent = dark ? "☀" : "☾";
  }
  syncIcon();
  if (toggle) {
    toggle.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") === "dark";
      if (dark) { root.removeAttribute("data-theme"); }
      else { root.setAttribute("data-theme", "dark"); }
      try { localStorage.setItem("ls-theme", dark ? "light" : "dark"); } catch (e) {}
      syncIcon();
    });
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function slugify(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  /* ---- app count: 从 APPS 自动算，加新 app 时不用再改 HTML ----
     HTML 里保留了正确的静态值作兜底，JS 失效时不会显示空白 */
  if (typeof APPS !== "undefined") {
    var COUNT_WORDS = {
      10: "Ten", 11: "Eleven", 12: "Twelve", 13: "Thirteen", 14: "Fourteen",
      15: "Fifteen", 16: "Sixteen", 17: "Seventeen", 18: "Eighteen", 19: "Nineteen", 20: "Twenty"
    };
    var count = APPS.length;
    Array.prototype.forEach.call(document.querySelectorAll(".app-count"), function (el) {
      el.textContent = String(count);
    });
    Array.prototype.forEach.call(document.querySelectorAll(".app-count-word"), function (el) {
      el.textContent = COUNT_WORDS[count] || String(count);
    });
  }

  /* ---- hero app drawer (all apps + a placeholder) ---- */
  var drawer = document.getElementById("appDrawer");
  if (drawer && typeof APPS !== "undefined") {
    drawer.innerHTML = APPS.map(function (a) {
      return '<a class="drawer-item" href="' + esc(a.url) + '" target="_blank" rel="noopener" title="' + esc(a.name) + '">' +
        '<span class="ico"><img src="' + esc(a.icon) + '" alt="' + esc(a.name) + '" loading="lazy"></span>' +
        '<span class="lbl">' + esc(a.name) + '</span></a>';
    }).join("") + '<span class="drawer-plus">+</span>';
  }

  /* ---- app index, grouped as a process table ---- */
  var host = document.getElementById("appGroups");
  if (host && typeof APPS !== "undefined" && typeof APP_GROUPS !== "undefined") {
    var n = 0;
    host.innerHTML = APP_GROUPS.map(function (g) {
      var list = APPS.filter(function (a) { return a.group === g.id; });
      if (!list.length) return "";
      var rows = list.map(function (a) {
        n += 1;
        var no = String(n).padStart(2, "0");
        return '<a class="proc-row" href="' + esc(a.url) + '" target="_blank" rel="noopener">' +
          '<span class="proc-no">' + no + '</span>' +
          '<span class="proc-ico"><img src="' + esc(a.icon) + '" alt="' + esc(a.name) + '" loading="lazy"></span>' +
          '<span><span class="proc-name">' + esc(a.name) + '</span>' +
          '<span class="proc-slug">' + esc(slugify(a.fn)) + '</span></span>' +
          '<span class="proc-desc">' + esc(a.desc) + '</span>' +
          '<span class="proc-rating">' + (a.rating ? esc(a.rating) + '★' : 'new') + '</span>' +
          '<span class="proc-open">open <span class="arr">↗</span></span>' +
          '</a>';
      }).join("");
      return '<div class="app-group">' +
        '<div class="group-slug"># ' + esc(slugify(g.title)) + ' — ' + list.length + '</div>' +
        '<div>' + rows + '</div></div>';
    }).join("");
  }

  /* ---- reviews (terminal log cards) ---- */
  var rg = document.getElementById("reviewGrid");
  if (rg && typeof REVIEWS !== "undefined") {
    rg.innerHTML = REVIEWS.map(function (r) {
      var app = String(r.app).replace(/\s*user$/i, "");
      return '<div class="review-card">' +
        '<div class="review-head"><span class="stars">[' + esc(r.stars) + ']</span>' +
        '<span class="app">' + esc(app) + '</span></div>' +
        '<p>' + esc(r.text) + '</p>' +
        '<div class="review-author"><span class="av">' + esc(r.initial) + '</span>' +
        '<span class="nm">' + esc(r.name) + '</span></div>' +
        '</div>';
    }).join("");
  }

  /* ---- contact form: hands the message to the visitor's mail client ---- */
  var CONTACT_EMAIL = "support@leanstart.app";
  var form = document.getElementById("contactForm");
  var done = document.getElementById("formDone");
  if (form && done) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      function val(id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : "";
      }
      var name = val("cfName");
      var subject = encodeURIComponent(name ? "Contact from " + name : "Contact from leanstartapp.com");
      var body = encodeURIComponent(
        "Name: " + name + "\nEmail: " + val("cfEmail") + "\n\n" + val("cfMessage")
      );
      window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
      form.hidden = true;
      done.hidden = false;
    });
  }
})();
