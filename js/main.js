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
          '<span class="proc-rating">' + esc(a.rating) + '★</span>' +
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

  /* ---- contact form ---- */
  var form = document.getElementById("contactForm");
  var done = document.getElementById("formDone");
  if (form && done) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.hidden = true;
      done.hidden = false;
    });
  }
})();
