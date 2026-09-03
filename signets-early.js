/* Pose les data-attributes du thème au plus tôt (anti-FOUC) sur SignETS. */
(function () {
  try {
    var raw = localStorage.getItem("etsx-settings-v3");
    var s = raw ? JSON.parse(raw) : {};
    if (s.enabled === false) return; // thème désactivé sur ce site : rien à poser avant signets.js
    var SK = { classic: "#1c4e89", prestige: "#a51c30", minimal: "#da291c", gaming: "#8b5cf6" };
    var skin = s.skin === "harvard" ? "prestige" : (s.skin || "classic"); // ancien nom du skin "Prestige"
    if (!SK[skin]) skin = "classic";
    var theme = s.theme === "dark" ? "dark" : "light";
    var a = s.accent || SK[skin] || "#1c4e89";
    var r = document.documentElement;
    r.setAttribute("data-etsx-skin", skin);
    r.setAttribute("data-etsx-theme", theme);
    r.style.setProperty("--etsx-accent", a);
    var h = a.replace("#", ""); if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
    var rgb = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    r.style.setProperty("--etsx-accent-soft", "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0.14)");
    var lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
    r.style.setProperty("--etsx-on-accent", lum > 0.62 ? "#16181d" : "#ffffff");
  } catch (e) {}
})();
