(function () {
  if (window.__kainsaanTheme) return;
  window.__kainsaanTheme = true;
  var KEY = "kainsaan_theme";
  var root = document.documentElement;
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function systemDark() { return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches); }
  root.setAttribute("data-theme", stored() || (systemDark() ? "dark" : "light"));
  root.classList.add("js");

  var MOON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M21 14.5A9 9 0 0 1 9.5 3a7.5 7.5 0 1 0 11.5 11.5z" fill="currentColor"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';

  document.addEventListener("DOMContentLoaded", function () {
    var host = document.querySelector(".nav") || document.querySelector(".topbar");
    if (!host) return;

    if (!document.querySelector(".theme-toggle")) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-toggle";
      host.appendChild(btn);
      var fadeTimer;
      var paint = function (spin) {
        var dark = root.getAttribute("data-theme") === "dark";
        btn.innerHTML = (dark ? SUN : MOON) + "<span>" + (dark ? "Light" : "Dark") + "</span>";
        btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
        if (spin) { var icon = btn.querySelector("svg"); if (icon) icon.classList.add("turn"); }
      };
      btn.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!still) {
          root.classList.add("theme-fade");
          clearTimeout(fadeTimer);
          fadeTimer = setTimeout(function () { root.classList.remove("theme-fade"); }, 380);
        }
        root.setAttribute("data-theme", next);
        try { localStorage.setItem(KEY, next); } catch (e) {}
        paint(!still);
      });
      paint();
    }

    var header = document.querySelector(".top");
    var bar = document.querySelector(".topbar");
    if (header && bar && host.classList.contains("nav") && !document.querySelector(".menu-btn")) {
      host.id = "mainNav";
      var menu = document.createElement("button");
      menu.type = "button";
      menu.className = "menu-btn";
      menu.setAttribute("aria-label", "Open menu");
      menu.setAttribute("aria-controls", "mainNav");
      menu.setAttribute("aria-expanded", "false");
      menu.innerHTML = "<span></span><span></span><span></span>";
      bar.insertBefore(menu, host);
      var setOpen = function (open) {
        header.classList.toggle("nav-open", open);
        menu.setAttribute("aria-expanded", String(open));
        menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      };
      menu.addEventListener("click", function () { setOpen(!header.classList.contains("nav-open")); });
      host.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
      window.matchMedia("(min-width: 721px)").addEventListener("change", function (e) { if (e.matches) setOpen(false); });
    }
  });
})();
