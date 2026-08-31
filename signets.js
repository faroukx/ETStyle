/* =============================================================================
 * ETStyle — SIGNETS : thème, barre unifiée, paramètres, nav minimal, notes
 * Cible : *://signets-ens.etsmtl.ca/*
 *
 * Coloration des notes (note vs moyenne ± écart-type), enrichissement du
 * tableau de programme (récupération du sommaire de chaque cours) et
 * graphiques, avec design tokens (clair/sombre). Tout est local : rien n'est
 * envoyé à un serveur tiers.
 * ========================================================================== */
(function () {
  "use strict";
  if (window.top !== window.self) return;

  var LS_KEY = "etsx-settings-v3";
  var SKINS = {
    classic:  { name: "ÉTS", accent: "#1c4e89", sw: ["#1c4e89", "#c41230", "#e9eef5"] },
    prestige: { name: "Prestige", accent: "#a51c30", sw: ["#a51c30", "#2a211c", "#f3eee8"] },
    minimal:  { name: "Minimal", accent: "#da291c", sw: ["#da291c", "#1c1f26", "#f1f3f7"] },
    gaming:   { name: "Gaming", accent: "#8b5cf6", sw: ["#8b5cf6", "#0a0a12", "#22d3ee"] }
  };
  var ACCENTS = ["#da291c", "#2563eb", "#0d9488", "#7c3aed", "#16a34a", "#475569"];
  var FONTS = {
    "Système": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    "Sérif": "Georgia, 'Times New Roman', serif",
    "Mono": "ui-monospace, Consolas, 'Courier New', monospace",
    "Trebuchet": "'Trebuchet MS', Verdana, sans-serif",
    "Verdana": "Verdana, Geneva, sans-serif"
  };
  var DEFAULTS = {
    theme: "light", skin: "classic", accent: SKINS.classic.accent, sourceAccent: false, font: "",
    wideTable: false, minimalNav: false, colorNotes: true, hiddenSigNav: [],
    hideBar: false, hideEvo: false,
    progFont: 1, showRcentile: false, showDelta: true, excludedSessions: [], bg: ""
  };

  function loadSettings() {
    try { var raw = localStorage.getItem(LS_KEY); return Object.assign({}, DEFAULTS, raw ? JSON.parse(raw) : {}); }
    catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function saveSettings() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(settings)); } catch (e) {}
    if (window.ETSXSync) window.ETSXSync.push({ theme: settings.theme, skin: settings.skin, accent: settings.accent, sourceAccent: settings.sourceAccent, font: settings.font });
  }
  var settings = loadSettings();
  if (!Array.isArray(settings.hiddenSigNav)) settings.hiddenSigNav = [];
  if (!Array.isArray(settings.excludedSessions)) settings.excludedSessions = [];
  // Ancien nom du skin « Prestige », et repli si un skin inconnu est enregistré :
  // sans ça data-etsx-skin pointerait vers un bloc de tokens inexistant.
  if (settings.skin === "harvard") settings.skin = "prestige";
  if (!SKINS[settings.skin]) settings.skin = "classic";

  /* ---- COULEURS ------------------------------------------------------------ */
  function hexToRgb(h) { var m = h.replace("#", ""); var n = m.length === 3 ? m.split("").map(function (c) { return c + c; }).join("") : m; return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)]; }
  function rgbToHex(r, g, b) { return "#" + [r, g, b].map(function (v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"); }).join(""); }
  function darken(hex, amt) { var c = hexToRgb(hex); return rgbToHex(c[0] * (1 - amt), c[1] * (1 - amt), c[2] * (1 - amt)); }
  function luminance(hex) { var c = hexToRgb(hex).map(function (v) { return v / 255; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }

  function applyTheme() {
    var root = document.documentElement;
    root.setAttribute("data-etsx-theme", settings.theme === "dark" ? "dark" : "light");
    root.setAttribute("data-etsx-skin", settings.skin || "classic");
    var a = settings.accent || (SKINS[settings.skin] && SKINS[settings.skin].accent) || "#1c4e89";
    var rgb = hexToRgb(a);
    root.style.setProperty("--etsx-accent", a);
    root.style.setProperty("--etsx-accent-700", darken(a, 0.18));
    root.style.setProperty("--etsx-accent-soft", "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0.14)");
    root.style.setProperty("--etsx-on-accent", luminance(a) > 0.62 ? "#16181d" : "#ffffff");
    if (settings.font && FONTS[settings.font]) root.style.setProperty("--etsx-ui", FONTS[settings.font]);
    else root.style.removeProperty("--etsx-ui");
    root.classList.toggle("etsx-sig-wide", !!settings.wideTable);
    root.classList.toggle("etsx-sig-minnav", !!settings.minimalNav);
    root.classList.toggle("etsx-sig-nocolor", !settings.colorNotes);
    root.classList.toggle("etsx-sig-norc", !settings.showRcentile);
    root.style.setProperty("--etsx-prog-font", String(settings.progFont || 1));
    applyBackground();
    syncHeader();
  }

  /* ---- FOND D'ÉCRAN personnalisé ----------------------------------------- */
  function applyBackground() {
    var root = document.documentElement;
    if (settings.bg) { root.style.setProperty("--etsx-bg-img", 'url("' + settings.bg.replace(/"/g, "%22") + '")'); root.classList.add("etsx-has-bg"); }
    else { root.classList.remove("etsx-has-bg"); root.style.removeProperty("--etsx-bg-img"); }
  }
  function setBackground(v) { settings.bg = v || ""; saveSettings(); applyBackground(); }

  /* ---- ICÔNES -------------------------------------------------------------- */
  function svg(inner) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>'; }
  /* Logos de marque (GitHub, LinkedIn) pour le bloc « À propos » — fill:currentColor,
     couleur pilotée en CSS par .etsx-about-icon (noir/blanc selon le thème). */
  var ICON_GITHUB = '<svg class="etsx-about-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"/></svg>';
  var ICON_LINKEDIN = '<svg class="etsx-about-icon" viewBox="0 0 97.75 97.75" fill="currentColor" aria-hidden="true"><path d="M48.875,0C21.882,0,0,21.882,0,48.875S21.882,97.75,48.875,97.75S97.75,75.868,97.75,48.875S75.868,0,48.875,0z M30.562,81.966h-13.74V37.758h13.74V81.966z M23.695,31.715c-4.404,0-7.969-3.57-7.969-7.968c0.001-4.394,3.565-7.964,7.969-7.964c4.392,0,7.962,3.57,7.962,7.964C31.657,28.146,28.086,31.715,23.695,31.715z M82.023,81.966H68.294V60.467c0-5.127-0.095-11.721-7.142-11.721c-7.146,0-8.245,5.584-8.245,11.35v21.869H39.179V37.758h13.178v6.041h0.185c1.835-3.476,6.315-7.14,13-7.14c13.913,0,16.481,9.156,16.481,21.059V81.966z"/></svg>';
  var ICONS = {
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
    gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>'),
    logout: svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'),
    book: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>'),
    doc: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>'),
    folder: svg('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    dollar: svg('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'),
    cap: svg('<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5"/>'),
    help: svg('<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4"/><line x1="12" y1="17" x2="12" y2="17.01"/>'),
    mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
    dot: svg('<circle cx="12" cy="12" r="8"/>'),
    bars: svg('<line x1="6" y1="20" x2="6" y2="11"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="14"/>')
  };
  function navIconFor(label) {
    var t = (label || "").toLowerCase();
    if (/cours|note/.test(t)) return "book";
    if (/horaire|calendr/.test(t)) return "clock";
    if (/document/.test(t)) return "doc";
    if (/dossier/.test(t)) return "folder";
    if (/frais|financ|paie/.test(t)) return "dollar";
    if (/c[ée]r[ée]monie|dipl[oô]m|gradu/.test(t)) return "cap";
    if (/aide|help/.test(t)) return "help";
    if (/contact|nous/.test(t)) return "mail";
    return "dot";
  }
  function slug(s) { return (s || "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, ""); }

  /* ---- BARRE SUPÉRIEURE UNIFIÉE ------------------------------------------- */
  var logoutHref = "";
  function userName() { var w = document.querySelector("#etsMCTop .wgFr"); return w && w.textContent.trim() ? w.textContent.trim() : ""; }
  function buildHeader() {
    if (document.getElementById("etsx-sig-hdr")) return;
    var host = document.getElementById("etsheader");
    if (!host) return;
    var nativeLogout = document.getElementById("ctl00_HyperLinkDeconnexion");
    if (nativeLogout) { logoutHref = nativeLogout.getAttribute("href") || ""; nativeLogout.style.display = "none"; }
    // logo ÉTS natif retiré (inutile tout à gauche)
    var natImg = document.getElementById("ctl00_Image1"); if (natImg) natImg.style.display = "none";
    var oldLogo = document.getElementById("etsx-ets-logo"); if (oldLogo) oldLogo.remove();
    var bar = document.createElement("div");
    bar.id = "etsx-sig-hdr";
    var swatches = ACCENTS.map(function (c) { return '<button class="etsx-swatch" data-accent="' + c + '" style="background:' + c + '" title="' + c + '"></button>'; }).join("");
    bar.innerHTML =
      '<div class="etsx-sig-left">' +
        '<button type="button" class="etsx-sig-ico" id="etsx-sig-theme" title="Clair / sombre"></button>' +
        '<span class="etsx-swatches">' + swatches +
          '<span class="etsx-swatch etsx-swatch-custom" title="Couleur personnalisée"><input type="color" value="' + settings.accent + '"></span>' +
        '</span>' +
        '<button type="button" class="etsx-sig-btn etsx-sig-feat" id="etsx-sig-sim" title="Simulateur de moyenne">' + ICONS.bars + '<span>Simulateur</span></button>' +
        '<button type="button" class="etsx-sig-btn etsx-sig-feat" id="etsx-sig-help" title="Aide / tutoriel">' + ICONS.help + '<span>À l\'aide</span></button>' +
      '</div>' +
      '<a class="etsx-sig-center" href="https://signets-ens.etsmtl.ca/" title="Accueil SignETS"><span class="etsx-sig-brand">SIGN<span class="etsx-red">ETS</span></span><span class="etsx-sig-sub">Guichet interactif</span></a>' +
      '<div class="etsx-sig-right">' +
        '<span class="etsx-sig-name">' + (userName() || "") + '</span>' +
        '<button type="button" class="etsx-sig-btn" id="etsx-sig-gear">' + ICONS.gear + '<span>Paramètres</span></button>' +
        '<button type="button" class="etsx-sig-btn etsx-sig-ico2" id="etsx-sig-logout" title="Déconnexion">' + ICONS.logout + '</button>' +
      '</div>';
    host.appendChild(bar);
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.hasAttribute("data-accent")) { e.preventDefault(); setAccent(b.getAttribute("data-accent")); }
      else if (b.id === "etsx-sig-theme") { e.preventDefault(); settings.theme = settings.theme === "dark" ? "light" : "dark"; saveSettings(); applyTheme(); }
      else if (b.id === "etsx-sig-sim") { e.preventDefault(); openSimModal(); }
      else if (b.id === "etsx-sig-help") { e.preventDefault(); openHelpModal(); }
      else if (b.id === "etsx-sig-gear") { e.preventDefault(); toggleSettings(); }
      else if (b.id === "etsx-sig-logout") { e.preventDefault(); if (logoutHref) location.href = logoutHref; }
    });
    var ci = bar.querySelector(".etsx-swatch-custom input");
    if (ci) ci.addEventListener("input", function (e) { setAccent(e.target.value); });
    syncHeader();
  }
  function setSkin(name) { settings.skin = name; if (SKINS[name]) settings.accent = SKINS[name].accent; saveSettings(); applyTheme(); syncSettingsPanel(); }
  function setAccent(c) { settings.accent = c; saveSettings(); applyTheme(); }
  function syncHeader() {
    var bar = document.getElementById("etsx-sig-hdr"); if (!bar) return;
    bar.querySelectorAll(".etsx-swatch[data-accent]").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-accent") === settings.accent); });
    var custom = bar.querySelector(".etsx-swatch-custom"); if (custom) custom.style.background = settings.accent;
    var t = bar.querySelector("#etsx-sig-theme"); if (t) t.innerHTML = settings.theme === "dark" ? ICONS.sun : ICONS.moon;
    var nm = bar.querySelector(".etsx-sig-name"); if (nm && !nm.textContent.trim()) nm.textContent = userName() || "";
  }

  /* ---- PANNEAU PARAMÈTRES -------------------------------------------------- */
  function toggleSettings() {
    var ex = document.getElementById("etsx-settings");
    if (ex) { ex.remove(); return; }
    var panel = buildSettings();
    document.body.appendChild(panel);
    setTimeout(function () {
      function onDoc(e) {
        var g = e.target.closest ? e.target.closest("#etsx-sig-gear") : null;
        if (!panel.contains(e.target) && !g) { panel.remove(); document.removeEventListener("click", onDoc); }
      }
      document.addEventListener("click", onDoc);
    }, 0);
  }
  function rawLabel(a) { var c = a.cloneNode(true); c.querySelectorAll(".etsx-navi").forEach(function (n) { n.remove(); }); return (c.textContent || "").trim().replace(/\s+/g, " "); }
  function tagNavItems() {
    var ul = document.getElementById("menuElem"); if (!ul) return;
    ul.querySelectorAll(":scope > li").forEach(function (li) {
      var a = li.querySelector(":scope > a"); if (!a) return;
      if (!li.getAttribute("data-etsx-label")) {
        var label = rawLabel(a);
        li.setAttribute("data-etsx-label", label);
        li.setAttribute("data-signav", slug(label));
      }
    });
  }
  function navList() {
    tagNavItems();
    var items = [];
    document.querySelectorAll("#menuElem > li").forEach(function (li) {
      var label = li.getAttribute("data-etsx-label");
      if (label) items.push({ key: li.getAttribute("data-signav"), label: label });
    });
    return items;
  }
  function buildSettings() {
    var p = document.createElement("div");
    p.id = "etsx-settings";
    var skinCards = Object.keys(SKINS).map(function (k) {
      var sk = SKINS[k];
      var sw = sk.sw.map(function (c) { return '<span style="background:' + c + '"></span>'; }).join("");
      return '<div class="etsx-skin' + (settings.skin === k ? " is-active" : "") + '" data-skin="' + k + '"><div class="etsx-skin-sw">' + sw + '</div><div class="etsx-skin-name">' + sk.name + '</div></div>';
    }).join("");
    var navRows = navList().map(function (it) {
      return '<label class="etsx-check"><input type="checkbox" data-signav="' + it.key + '" ' + (settings.hiddenSigNav.indexOf(it.key) === -1 ? "checked" : "") + '><span>' + it.label + '</span></label>';
    }).join("");
    if (!navRows) navRows = '<div class="etsx-set-note">Menu indisponible sur cette page.</div>';
    p.innerHTML =
      '<div class="etsx-set-head">Paramètres SignETS</div>' +
      '<div class="etsx-set-title">Thème d\'interface</div>' +
      '<div class="etsx-skins">' + skinCards + '</div>' +
      '<div class="etsx-set-title">Affichage</div>' +
      '<label class="etsx-check"><input type="checkbox" id="etsx-opt-wide" ' + (settings.wideTable ? "checked" : "") + '><span>Mode large (élargir les tableaux)</span></label>' +
      '<label class="etsx-check"><input type="checkbox" id="etsx-opt-minnav" ' + (settings.minimalNav ? "checked" : "") + '><span>Menu en style minimal (icônes)</span></label>' +
      '<label class="etsx-check"><input type="checkbox" id="etsx-opt-color" ' + (settings.colorNotes ? "checked" : "") + '><span>Colorer les notes et graphiques</span></label>' +
      '<label class="etsx-check"><input type="checkbox" id="etsx-opt-rc" ' + (settings.showRcentile ? "checked" : "") + '><span>Afficher la colonne R-centile</span></label>' +
      '<label class="etsx-check"><input type="checkbox" id="etsx-opt-delta" ' + (settings.showDelta ? "checked" : "") + '><span>Afficher l\'écart à la moyenne (+x)</span></label>' +
      '<div class="etsx-set-title">Taille du texte (tableau)</div>' +
      '<div class="etsx-row-btns etsx-fontsize"><button type="button" class="etsx-fontbtn" id="etsx-font-dn">A\u2212</button><span id="etsx-font-val">' + Math.round((settings.progFont || 1) * 100) + '%</span><button type="button" class="etsx-fontbtn" id="etsx-font-up">A+</button></div>' +
      '<div class="etsx-set-title">Graphiques (colonne de gauche)</div>' +
      '<label class="etsx-check"><input type="checkbox" id="etsx-opt-bar" ' + (settings.hideBar ? "" : "checked") + '><span>Votre note vs groupe</span></label>' +
      '<label class="etsx-check"><input type="checkbox" id="etsx-opt-evo" ' + (settings.hideEvo ? "" : "checked") + '><span>Évolution de votre cote</span></label>' +
      '<div class="etsx-set-title">Fond d\'écran</div>' +
      '<input type="text" id="etsx-bg-url" class="etsx-input" placeholder="Coller une URL d\'image..." value="' + (/^https?:/.test(settings.bg || "") ? settings.bg : "") + '">' +
      '<div class="etsx-row-btns">' +
        '<button type="button" class="etsx-fontbtn etsx-bg-apply">Appliquer</button>' +
        '<label class="etsx-fontbtn etsx-bg-file">Fichier<input type="file" accept="image/*" hidden></label>' +
        '<button type="button" class="etsx-fontbtn etsx-bg-clear">Retirer</button>' +
      '</div>' +
      '<div class="etsx-set-title">Police</div>' +
      '<div class="etsx-row-btns" id="etsx-fonts"></div>' +
      '<div class="etsx-set-title">Éléments du menu</div>' + navRows +
      '<div class="etsx-set-note">Réglages enregistrés localement. Le thème est partagé avec le portail.</div>' +
      '<div class="etsx-set-title">À propos</div>' +
      '<div class="etsx-about">' +
        '<a class="etsx-about-repo" href="https://github.com/faroukx/ETStyle" target="_blank" rel="noopener noreferrer">' + ICON_GITHUB + '<span>Code source sur GitHub</span></a>' +
        '<div class="etsx-about-author">' +
          '<span>Par Saad Farouk</span>' +
          '<a href="https://github.com/faroukx" target="_blank" rel="noopener noreferrer" title="GitHub" class="etsx-about-icon-link">' + ICON_GITHUB + '</a>' +
          '<a href="https://www.linkedin.com/in/farouks/" target="_blank" rel="noopener noreferrer" title="LinkedIn" class="etsx-about-icon-link">' + ICON_LINKEDIN + '</a>' +
        '</div>' +
        '<div class="etsx-set-note">Projet personnel et indépendant, sans lien officiel avec l’ÉTS.</div>' +
      '</div>';
    p.querySelector("#etsx-opt-wide").addEventListener("change", function (e) { settings.wideTable = e.target.checked; saveSettings(); applyTheme(); });
    p.querySelector("#etsx-opt-minnav").addEventListener("change", function (e) { settings.minimalNav = e.target.checked; saveSettings(); applyTheme(); manageNav(); });
    p.querySelector("#etsx-opt-color").addEventListener("change", function (e) {
      settings.colorNotes = e.target.checked; saveSettings(); applyTheme();
      // réinitialise les marqueurs pour réappliquer (ou retirer) couleurs + R.centile
      document.querySelectorAll("[data-etsx-done]").forEach(function (tr) { tr.removeAttribute("data-etsx-done"); });
      document.querySelectorAll("[data-etsx-row]").forEach(function (tr) { tr.removeAttribute("data-etsx-row"); });
      if (!settings.colorNotes) clearAllRowColors();
      repaintAll(); try { repaintList(); } catch (e2) {}
    });
    p.querySelector("#etsx-opt-rc").addEventListener("change", function (e) { settings.showRcentile = e.target.checked; saveSettings(); applyTheme(); });
    p.querySelector("#etsx-opt-delta").addEventListener("change", function (e) {
      settings.showDelta = e.target.checked; saveSettings();
      document.querySelectorAll(".etsx-delta").forEach(function (d) { d.remove(); });
      document.querySelectorAll('[aria-describedby*="grilleNotes_columnheader_3"]').forEach(function (c) { var tr = c.closest("tr"); if (tr) tr.removeAttribute("data-etsx-row"); });
      repaintAll();
    });
    function setFont(d) { settings.progFont = Math.max(0.8, Math.min(1.7, (settings.progFont || 1) + d)); saveSettings(); applyTheme(); var v = p.querySelector("#etsx-font-val"); if (v) v.textContent = Math.round(settings.progFont * 100) + "%"; }
    p.querySelector("#etsx-font-dn").addEventListener("click", function () { setFont(-0.1); });
    p.querySelector("#etsx-font-up").addEventListener("click", function () { setFont(0.1); });
    p.querySelector("#etsx-opt-bar").addEventListener("change", function (e) { settings.hideBar = !e.target.checked; saveSettings(); applyChartVisibility(); });
    p.querySelector("#etsx-opt-evo").addEventListener("change", function (e) { settings.hideEvo = !e.target.checked; saveSettings(); applyChartVisibility(); });
    p.querySelectorAll("input[data-signav]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var k = cb.getAttribute("data-signav");
        settings.hiddenSigNav = settings.hiddenSigNav.filter(function (x) { return x !== k; });
        if (!cb.checked) settings.hiddenSigNav.push(k);
        saveSettings(); applyNavHide();
      });
    });
    p.querySelectorAll(".etsx-skin").forEach(function (c) { c.addEventListener("click", function () { setSkin(c.getAttribute("data-skin")); }); });
    var fb = p.querySelector("#etsx-fonts");
    ["Auto"].concat(Object.keys(FONTS)).forEach(function (name) {
      var b = document.createElement("button"); b.type = "button"; b.className = "etsx-fontbtn"; b.textContent = name;
      var val = name === "Auto" ? "" : name;
      if ((settings.font || "") === val) b.classList.add("is-active");
      b.addEventListener("click", function () { settings.font = val; saveSettings(); applyTheme(); fb.querySelectorAll(".etsx-fontbtn").forEach(function (x) { x.classList.remove("is-active"); }); b.classList.add("is-active"); });
      fb.appendChild(b);
    });
    var bgApply = p.querySelector(".etsx-bg-apply"); if (bgApply) bgApply.addEventListener("click", function () { setBackground(p.querySelector("#etsx-bg-url").value.trim()); });
    var bgClear = p.querySelector(".etsx-bg-clear"); if (bgClear) bgClear.addEventListener("click", function () { setBackground(""); var i = p.querySelector("#etsx-bg-url"); if (i) i.value = ""; });
    var bgFile = p.querySelector(".etsx-bg-file input"); if (bgFile) bgFile.addEventListener("change", function (e) { var f = e.target.files[0]; if (!f) return; if (f.size > 2600000) { alert("Image trop lourde (max ~2,5 Mo). Utilise plutôt une URL."); return; } var rd = new FileReader(); rd.onload = function () { setBackground(rd.result); }; rd.readAsDataURL(f); });
    return p;
  }
  function syncSettingsPanel() {
    var p = document.getElementById("etsx-settings"); if (!p) return;
    p.querySelectorAll(".etsx-skin").forEach(function (c) { c.classList.toggle("is-active", c.getAttribute("data-skin") === settings.skin); });
  }

  /* ---- MENU : icône + masquage (sans dupliquer le libellé) ---------------- */
  function manageNav() {
    var ul = document.getElementById("menuElem"); if (!ul) return;
    tagNavItems();
    ul.querySelectorAll(":scope > li").forEach(function (li) {
      var a = li.querySelector(":scope > a"); if (!a) return;
      var hasIcon = !!a.querySelector(".etsx-navi");
      if (settings.minimalNav && !hasIcon) {
        var ico = document.createElement("span"); ico.className = "etsx-navi";
        ico.innerHTML = ICONS[navIconFor(li.getAttribute("data-etsx-label"))] || ICONS.dot;
        a.insertBefore(ico, a.firstChild);
      } else if (!settings.minimalNav && hasIcon) {
        a.querySelectorAll(".etsx-navi").forEach(function (n) { n.remove(); });
      }
    });
    applyNavHide();
  }
  function applyNavHide() {
    var ul = document.getElementById("menuElem"); if (!ul) return;
    ul.querySelectorAll(":scope > li").forEach(function (li) {
      var k = li.getAttribute("data-signav");
      var hide = !!(k && settings.hiddenSigNav.indexOf(k) !== -1);
      li.classList.toggle("etsx-navhide", hide);
      li.style.removeProperty("display"); // on laisse la classe gérer (sinon !important du minimal gagne)
    });
  }

  /* ---- OUTILS NOTES -------------------------------------------------------- */
  function txt(el) { return el ? (el.textContent || "").replace(/ /g, " ").trim() : ""; }
  function numf(s) { if (s == null) return NaN; return parseFloat(String(s).replace(/,/g, ".").replace(/[^0-9.\-]/g, "")); }
  function num(s) { if (s == null) return NaN; return numf(String(s).replace(/ sur un maximum de /g, "/").split("/")[0]); }
  function isEmpty(el) { var t = txt(el); return t === "" || t === "-"; }
  function r1(n) { return Math.round(n * 10) / 10; }

  // Détermine le palier de couleur d'une note par rapport à la moyenne du groupe.
  function getColorTier(note, grp, ecartType, valid) {
    if (!valid || isNaN(note) || isNaN(grp)) return "na";
    if (Math.floor(note) > Math.round(grp)) return (note > grp + ecartType) ? "vhigh" : "high";
    if (Math.ceil(note) < Math.round(grp)) return (note + ecartType < grp) ? "vlow" : "low";
    return "mid";
  }
  function pctTier(p) { if (isNaN(p)) return "na"; if (p >= 85) return "vhigh"; if (p >= 65) return "high"; if (p >= 35) return "mid"; if (p >= 15) return "low"; return "vlow"; }
  // Palier d'après la COTE (lettre) — pour colorer le tableau de programme.
  // Un cours SANS cote (non complété) -> "na" -> pas de couleur.
  function coteTier(cote) {
    cote = (cote || "").toUpperCase().replace(/\s/g, "");
    if (!cote) return "na";
    if (/^A/.test(cote)) return "vhigh";
    if (/^B/.test(cote)) return "high";
    if (/^C/.test(cote)) return "mid";
    if (/^D/.test(cote)) return "low";
    if (/^E/.test(cote)) return "vlow";
    return "na"; // S, K, AX, etc. : non comptés
  }
  function deltaChip(note, moy, denom) {
    if (isNaN(note) || isNaN(moy)) return null;
    var d = note - moy, cls = Math.abs(d) < 0.05 ? "flat" : d > 0 ? "up" : "down", label;
    if (denom && denom > 0) { var dp = (note - moy) / denom * 100; label = (dp >= 0 ? "+" : "") + r1(dp) + "%"; }
    else { label = (d >= 0 ? "+" : "") + r1(d); }
    var span = document.createElement("span"); span.className = "etsx-delta " + cls; span.textContent = label;
    var tip = "Écart à la moyenne du groupe" + (denom && denom > 0 ? " (points de %)" : "");
    span.title = tip; span.setAttribute("data-etsx-tip", tip);
    return span;
  }
  function coteColor(letter) {
    letter = (letter || "").toUpperCase().replace(/\s/g, "");
    if (/^A/.test(letter)) return "#16a34a";
    if (/^B/.test(letter)) return "#2563eb";
    if (/^C/.test(letter)) return "#d97706";
    if (/^D/.test(letter)) return "#ea580c";
    if (/^E|ECHEC|ÉCHEC/.test(letter)) return "#dc2626";
    return null;
  }
  // Couleurs des 5 paliers (fond, texte). Mapping demandé :
  //   vhigh = vert foncé (au-dessus de la moyenne + 1 écart-type)
  //   high  = vert       (au-dessus de la moyenne)
  //   mid   = jaune      (très proche de la moyenne)
  //   low   = rose       (en dessous de la moyenne)
  //   vlow  = rouge      (en dessous de la moyenne − 1 écart-type)
  // Fonds TRANSLUCIDES (tints) : lisibles en clair ET sombre, le badge R reste visible.
  var TIER_BG = {
    vhigh: "rgba(26,161,77,0.45)",
    high:  "rgba(120,200,125,0.42)",
    mid:   "rgba(240,200,60,0.45)",
    low:   "rgba(244,150,70,0.45)",
    vlow:  "rgba(233,80,80,0.45)"
  };
  // Coloration en INLINE !important : imbattable face aux styles natifs
  // d'Infragistics, et insensible à la spécificité CSS.
  function colorRow(row, t) {
    if (!row) return;
    var bg = TIER_BG[t];
    [].forEach.call(row.children, function (td) {
      td.classList.remove("etsx-grow", "etsx-grow-vhigh", "etsx-grow-high", "etsx-grow-mid", "etsx-grow-low", "etsx-grow-vlow");
      [].forEach.call(td.querySelectorAll("a"), function (a) { a.style.removeProperty("color"); a.style.removeProperty("font-weight"); });
      if (!bg) { td.style.removeProperty("background-color"); td.style.removeProperty("color"); return; }
      td.classList.add("etsx-grow", "etsx-grow-" + t);
      td.style.setProperty("background-color", bg, "important");  // tint translucide
      td.style.removeProperty("color");                          // texte par défaut (lisible)
    });
  }
  // Retire toute coloration de ligne (quand l'option est décochée).
  function clearAllRowColors() {
    document.querySelectorAll("td.etsx-grow").forEach(function (td) {
      td.classList.remove("etsx-grow", "etsx-grow-vhigh", "etsx-grow-high", "etsx-grow-mid", "etsx-grow-low", "etsx-grow-vlow");
      td.style.removeProperty("background-color"); td.style.removeProperty("color");
      [].forEach.call(td.querySelectorAll("a"), function (a) { a.style.removeProperty("color"); a.style.removeProperty("font-weight"); });
    });
  }
  // Masquer/afficher les cartes de graphiques selon les Paramètres.
  function applyChartVisibility() {
    var host = document.getElementById("etsx-charts"); if (!host) return;
    var bar = host.querySelector(".etsx-bar-card"); if (bar) bar.style.display = settings.hideBar ? "none" : "";
    var evo = host.querySelector(".etsx-evo-card"); if (evo) evo.style.display = settings.hideEvo ? "none" : "";
  }

  // Page d'un cours (DetailsCoursGroupe) : couleur de CHAQUE LIGNE + % + écart.
  function paintCourseDetail() {
    if (!settings.colorNotes) return false;
    // Égalité stricte remplacée par *= : Infragistics préfixe l'identifiant de la
    // grille, et le préfixe varie. Avec `=`, cette fonction sortait en silence —
    // ni couleurs de lignes, ni pourcentages, ni cote estimée. Le reste du fichier
    // utilisait déjà *= partout ailleurs.
    var notes = document.querySelectorAll('[aria-describedby*="grilleNotes_columnheader_3"]');
    if (!notes.length) return false;
    if (!document.body.getAttribute("data-etsx-detail-logged")) {
      document.body.setAttribute("data-etsx-detail-logged", "1");
      LOG("page d'un cours :", notes.length, "évaluation(s) détectée(s)");
    }
    var denom = document.querySelectorAll('[aria-describedby*="grilleNotes_columnheader_4"]');
    var grp = document.querySelectorAll('[aria-describedby*="grilleNotes_columnheader_6"]');
    var sd = document.querySelectorAll('[aria-describedby*="grilleNotes_columnheader_7"]');
    for (var i = 0; i < notes.length; i++) {
      var cell = notes[i];
      var valid = !isEmpty(grp[i]);
      var n = num(txt(cell)), m = num(txt(grp[i])), s = num(txt(sd[i])), d = num(txt(denom[i]));
      var row = cell.closest("tr");
      if (row && row.getAttribute("data-etsx-row") !== "1") {
        colorRow(row, getColorTier(n, m, s, valid));
        row.setAttribute("data-etsx-row", "1");
        // écart à la moyenne (+x), optionnel (Paramètres). Petit, ne déborde pas.
        if (valid && settings.showDelta) { var chip = deltaChip(n, m, d); if (chip) cell.appendChild(chip); }
      }
    }
    // ----- Résumé du cours : Note à ce jour (vert) + % partout + cote estimée -----
    var base = "ctl00_ContentPlaceHolderMain_lesOnglets_tmpl0_";
    var tot = document.getElementById(base + "txtTotal1");
    var totMoy = document.getElementById(base + "txtMoyenne");
    var totSd = document.getElementById(base + "txtEcartType");
    var totMed = document.getElementById(base + "txtMediane");
    var cote = document.getElementById(base + "txtCoteFinale");
    function pctOf(el, max) {
      if (!el || el.getAttribute("data-etsx-p") === "1") return;
      var v = num(txt(el));
      el.innerHTML = el.innerHTML.replace(/\s*sur un maximum de\s*/gi, "/");
      if (!isNaN(v) && max && max > 0) el.insertAdjacentHTML("beforeend", ' <small class="etsx-pct">(' + r1(v / max * 100) + '%)</small>');
      el.setAttribute("data-etsx-p", "1");
    }
    var noteVal = NaN, maxVal = NaN;
    if (tot) {
      var mm = txt(tot).replace(/\s+/g, " ").match(/([\d.,]+)\s*sur un maximum de\s*([\d.,]+)/i);
      noteVal = mm ? numf(mm[1]) : num(txt(tot));
      maxVal = mm ? numf(mm[2]) : NaN;
      if (tot.getAttribute("data-etsx-p") !== "1") {
        if (maxVal && maxVal > 0 && !isNaN(noteVal)) {
          tot.innerHTML = tot.innerHTML.replace(/ sur un maximum de /gi, "/");
          tot.insertAdjacentHTML("beforeend", ' <strong class="etsx-pct-big">(' + r1(noteVal / maxVal * 100) + '%)</strong>');
        }
        tot.setAttribute("data-etsx-p", "1");
        if (settings.colorNotes) { var tr = tot.closest("tr"); if (tr) colorRow(tr, getColorTier(noteVal, num(txt(totMoy)), num(txt(totSd)), !isNaN(maxVal) && maxVal !== 0)); }
        pctOf(totMoy, maxVal); pctOf(totSd, maxVal); pctOf(totMed, maxVal);
      }
    }
    // Cote au dossier : réelle si présente ; sinon ESTIMÉE (cours en cours).
    if (cote && cote.getAttribute("data-etsx-c") !== "1") {
      var ct = txt(cote);
      if (ct) { var col = coteColor(ct); if (col) { cote.classList.add("etsx-cote"); cote.style.background = col; } }
      else if (maxVal && maxVal > 0 && !isNaN(noteVal)) {
        var rang = num(txt(document.getElementById(base + "txtRangCentile")));
        var est = estimerCote(noteVal / maxVal * 100, isNaN(rang) ? 50 : rang);
        if (est) cote.innerHTML = '<span class="etsx-est-inline" title="PRÉDICTION d\'après votre note (cours en cours, sans cote officielle)">≈ ' + esc(est.centre) + ' <small>prédiction</small></span>';
      }
      cote.setAttribute("data-etsx-c", "1");
    }
    return true;
  }

  /* =========================================================================
   * TABLEAU DE PROGRAMME : on récupère le sommaire de chaque cours pour
   * remplir la Cote (%), la colonne R.centile, colorer la ligne, et tracer
   * les graphiques.
   * ====================================================================== */
  var COTE_POINTS = { "A+": 4.3, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "E": 0.0 };
  var listEnriched = false;

  function LOG() { try { console.log.apply(console, ["%c[ETStyle]", "color:#1c4e89;font-weight:bold"].concat([].slice.call(arguments))); } catch (e) {} }

  // URL : page d'un cours vs liste des cours (détection tolérante).
  function isDetailPage() { return /DetailsCoursGroupe/i.test(location.href); }
  function isListPage() {
    if (/MesNotes\.aspx/i.test(location.href)) return true;
    // repli DOM : présence d'au moins un lien vers le détail d'un cours-groupe
    return !!document.querySelector("a[href*='DetailsCoursGroupe']");
  }
  // Lit une cellule par INDICE de colonne via le SUFFIXE d'aria-describedby
  // (robuste : marche quel que soit le préfixe réel de la grille Infragistics).
  function cellByCol(scope, n) {
    return scope.querySelector('[aria-describedby$="columnheader_' + n + '"]') ||
           scope.querySelector('[aria-describedby*="columnheader_' + n + '"]');
  }

  // Parse une page de cours déjà récupérée (HTML) → sommaire.
  // Double méthode : getElementById (DOM) puis repli regex sur le HTML brut
  // pour maximiser le taux de réussite du parsing.
  function parseSummary(html) {
    var doc = null;
    try { doc = new DOMParser().parseFromString(html, "text/html"); } catch (e) {}
    var base = "ctl00_ContentPlaceHolderMain_lesOnglets_tmpl0_";
    function clean(s) {
      return (s == null ? "" : String(s))
        .replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ").trim();
    }
    function fromDom(key) { if (!doc) return ""; var e = doc.getElementById(base + key); return e ? clean(e.innerHTML) : ""; }
    function fromHtml(key) { var m = html.match(new RegExp('id="' + base + key + '"[^>]*>([\\s\\S]*?)</span>', "i")); return m ? clean(m[1]) : ""; }
    function field(key) { return fromDom(key) || fromHtml(key); }

    var totalRaw = field("txtTotal1");
    if (!totalRaw) return null;
    var mm = totalRaw.match(/([\d.,]+)\s*sur un maximum de\s*([\d.,]+)/i);
    var note = mm ? numf(mm[1]) : num(totalRaw);
    var max = mm ? numf(mm[2]) : NaN;
    var moy = num(field("txtMoyenne"));
    var sd = num(field("txtEcartType"));
    var rang = field("txtRangCentile").replace(/[^0-9.,]/g, "");
    var cote = field("txtCoteFinale").replace(/\s/g, "").toUpperCase();
    var validMax = !isNaN(max) && max !== 0;
    return {
      note: note, max: max, moy: moy, sd: sd, rang: rang, cote: cote,
      notePct: validMax ? r1(note / max * 100) : NaN,
      moyPct: (validMax && !isNaN(moy)) ? r1(moy / max * 100) : NaN,
      tier: getColorTier(note, moy, sd, validMax)
    };
  }

  // Durée de vie du cache des sommaires. Sans elle, un cours mis en cache n'était
  // PLUS JAMAIS re-téléchargé : une nouvelle note n'apparaissait jamais, ni la cote,
  // ni le rang, ni la couleur. On affiche toujours le cache immédiatement (rapide),
  // puis on rafraîchit en arrière-plan ce qui est périmé.
  var CACHE_TTL = 30 * 60 * 1000;   // 30 minutes
  function perime(s) { return !s || !s._t || (Date.now() - s._t) > CACHE_TTL; }

  function cacheGet(keys, cb) {
    try { if (window.chrome && chrome.storage && chrome.storage.local) return chrome.storage.local.get(keys, cb); } catch (e) {}
    cb({});
  }
  function cacheSet(obj) { try { if (window.chrome && chrome.storage && chrome.storage.local) chrome.storage.local.set(obj); } catch (e) {} }

  function fetchSummary(href, cb) {
    fetch(href, { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.text() : null; })
      .then(function (html) { cb(html ? parseSummary(html) : null); })
      .catch(function () { cb(null); });
  }

  // Récupère les lignes de cours (lien + cellules). On trouve les liens
  // DetailsCoursGroupe DIRECTEMENT, puis on lit les colonnes par suffixe.
  function collectCourseRows() {
    var rows = [], seen = [];
    document.querySelectorAll("a[href*='DetailsCoursGroupe']").forEach(function (link) {
      var row = link.closest("tr"); if (!row || seen.indexOf(row) !== -1) return;
      seen.push(row);
      var href = link.href;
      var pid = (href.match(/[?&]p=(\d+)/) || [])[1] || (href.match(/[?&][^=]*=(\d+)/) || [])[1] || href;
      var sigleCell = cellByCol(row, 2) || link.closest("td") || link.parentNode;
      rows.push({
        row: row, href: href, key: "etsx-sum-" + pid,
        sigle: ((sigleCell && sigleCell.textContent) || link.textContent || "").trim().split("-")[0].trim(),
        coteCell: cellByCol(row, 5),
        rangCell: cellByCol(row, 6),
        credCell: cellByCol(row, 4)
      });
    });
    return rows;
  }

  // Cellule d'en-tête d'une colonne (n) si elle existe.
  function headerCellForCol(n) {
    var el = document.getElementById("ctl00_columnheader_" + n);
    if (el) return el;
    var cands = document.querySelectorAll('[id$="columnheader_' + n + '"]');
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i];
      if (c.closest("thead") || c.tagName === "TH" || /header/i.test(c.className || "") || /header/i.test(c.id || "")) return c;
    }
    return null;
  }
  // Insère NOTRE colonne « R-centile » juste APRÈS la colonne « Cote ».
  // (La colonne native columnheader_6 est de largeur nulle et ses cellules
  //  contiennent le sigle de base — inutilisable. On crée donc la nôtre. Vérifié
  //  en direct : l'insertion s'aligne avec les colonnes natives.)
  function ensureRcentileColumn() {
    // Colonne insérée DÉSACTIVÉE : l'en-tête et le corps d'Infragistics sont des
    // tables séparées et se désalignent. Le rang est affiché en badge dans la
    // cellule « Cote » (voir applySummaryToRow). On nettoie toute ancienne colonne.
    document.querySelectorAll(".etsx-rc-h, .etsx-rc-cell").forEach(function (e) { e.remove(); });
  }

  function applySummaryToRow(info, sum, quiet, forcer) {
    if (!sum || !info.row) return;
    if (info.row.getAttribute("data-etsx-done") === "1" && !forcer) return; // déjà traité (idempotent)
    // Rafraîchissement : on efface d'abord ce que NOUS avions écrit dans la cellule
    // Cote (le pourcentage et le badge R), sinon la nouvelle valeur ne s'affiche pas.
    if (forcer && info.coteCell && info.coteCell.getAttribute("data-etsx-ours") === "1") info.coteCell.textContent = "";
    if (!quiet) LOG("  •", info.sigle, "| note%:", isNaN(sum.notePct) ? "—" : sum.notePct, "moy%:", isNaN(sum.moyPct) ? "—" : sum.moyPct,
        "| rang:", sum.rang || "—", "| cote:", sum.cote || "—", "| couleur:", sum.tier, "| cellCote:", !!info.coteCell, "cellRang:", !!info.rangCell);
    // Cote (%) si la cellule est vide. On marque la cellule pour pouvoir la
    // réécrire lors d'un rafraîchissement (voir plus haut).
    if (info.coteCell && !txt(info.coteCell) && !isNaN(sum.notePct)) {
      info.coteCell.textContent = sum.notePct + "%";
      info.coteCell.setAttribute("data-etsx-ours", "1");
    }
    // R.centile : colonne dédiée si elle existe
    if (info.rangCell && !txt(info.rangCell) && sum.rang) info.rangCell.textContent = sum.rang;
    // Rang centile : badge « R xx » dans la cellule Cote (sans casser l'alignement)
    if (sum.rang && info.coteCell) {
      var rc = info.coteCell.querySelector(".etsx-rc");
      if (!rc) { rc = document.createElement("span"); rc.className = "etsx-rc"; info.coteCell.appendChild(rc); }
      rc.textContent = "R" + sum.rang; rc.title = "Rang centile : " + sum.rang + "e";
    }
    // Couleur de la ligne : UNIQUEMENT selon la cote finale (cours complété).
    var t = coteTier(sum.cote || (info.coteCell ? txt(info.coteCell) : ""));
    if (settings.colorNotes && t !== "na") colorRow(info.row, t);
    info.row.setAttribute("data-etsx-done", "1");
  }

  // Repli SANS fetch : colore la ligne d'après le rang centile / la cote déjà
  // visibles nativement (utile pour les sessions passées, ou si le fetch est
  // bloqué par les cookies). Provisoire : le fetch raffinera ensuite.
  function colorFromNative(info) {
    if (!settings.colorNotes || !info.row) return false;
    // déjà traité (fetch OU natif) → ne PAS recolorer (évite la boucle de re-rendu / clignotement)
    if (info.row.getAttribute("data-etsx-done") === "1" || info.row.getAttribute("data-etsx-native") === "1") return false;
    // couleur d'après la cote affichée (lettre) ; sans cote => pas de couleur
    var t = coteTier(info.coteCell ? txt(info.coteCell) : "");
    if (t === "na") { info.row.setAttribute("data-etsx-native", "1"); return false; }
    colorRow(info.row, t);
    info.row.setAttribute("data-etsx-native", "1");
    return true;
  }

  // Réapplique Cote / R.centile / couleur depuis le cache mémoire, à chaque
  // cycle. Survit aux re-rendus d'Infragistics (qui recréent les <tr>).
  function repaintList() {
    if (!isListPage()) return;
    var rows = collectCourseRows();
    if (!rows.length) return;
    ensureRcentileColumn(rows);
    var any = false;
    rows.forEach(function (info) {
      if (info.row.getAttribute("data-etsx-done") === "1") return;
      var sum = _lastCache && _lastCache[info.key];
      if (sum) { applySummaryToRow(info, sum, true); any = true; }
      else colorFromNative(info);
    });
    if (any) { try { buildCharts(rows, _lastCache); } catch (e) {} }
  }

  function enrichCourseList(force) {
    if (!isListPage()) return;
    if (listEnriched && !force) return;
    var rows = collectCourseRows();
    if (!rows.length) { LOG("liste détectée mais 0 cours-groupe trouvé (grille pas encore prête ?)"); return; }
    listEnriched = true;
    LOG("liste des cours :", rows.length, "cours →", rows.map(function (r) { return r.sigle; }).join(", "));
    ensureRcentileColumn(rows);
    var keys = rows.map(function (r) { return r.key; });
    cacheGet(keys, function (cache) {
      var pending = [];
      rows.forEach(function (info) {
        var cached = cache && cache[info.key];
        if (cached) {
          applySummaryToRow(info, cached);              // affichage immédiat
          if (perime(cached)) pending.push(info);       // puis rafraîchissement
        } else { colorFromNative(info); pending.push(info); }
      });
      try { buildCharts(rows, cache || {}); } catch (e) { LOG("buildCharts (cache) erreur", e); }
      if (pending.length) LOG("récupération de", pending.length, "sommaire(s) à (re)charger…");
      // récupère séquentiellement les cours manquants (doux pour le serveur)
      (function nextOne(idx) {
        if (idx >= pending.length) { LOG("enrichissement terminé"); return; }
        var info = pending[idx];
        fetchSummary(info.href, function (sum) {
          if (sum) {
            sum._t = Date.now();
            applySummaryToRow(info, sum, false, true);  // forcé : écrase l'affichage périmé
            var store = {}; store[info.key] = sum; cacheSet(store);
            cache[info.key] = sum;
            try { buildCharts(rows, cache); } catch (e) {}
          } else { LOG("échec sommaire (cookies/HTTP 400 ?) :", info.sigle); }
          setTimeout(function () { nextOne(idx + 1); }, 120);
        });
      })(0);
    });
  }

  /* ---- GRAPHIQUES (SVG léger, sans dépendance) ---------------------------- */
  function chartHost() {
    var host = document.getElementById("etsx-charts");
    if (host) return host;
    var target = document.getElementById("ctl00_LoginViewLeftColumn_MenuVertical");
    if (!target) { var ul = document.getElementById("menuElem"); if (ul && ul.parentNode) target = ul.parentNode; }
    if (!target) target = document.querySelector(".etsMCLeft");
    if (!target) target = document.querySelector("#etsMCTwoRight") || document.querySelector("#etsMCContent");
    if (!target) { LOG("chartHost: AUCUN conteneur trouvé pour les graphiques (menu gauche absent)"); return null; }
    host = document.createElement("div"); host.id = "etsx-charts";
    target.appendChild(host);
    LOG("chartHost: graphiques injectés dans", target.id ? ("#" + target.id) : ("." + (target.className || "?")));
    return host;
  }
  // Les guillemets comptent : le résultat part aussi dans des attributs
  // (data-etsx-tip="…"), où un « " » non échappé casserait le balisage.
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  function barChartSVG(data) {
    // data: [{sigle, notePct, moyPct}]
    var W = 250, H = 180, padB = 34, padL = 24, padT = 22;
    var n = data.length || 1, gw = (W - padL - 6) / n, bw = Math.min(16, gw / 3);
    var bars = "", labels = "", grid = "";
    for (var y = 0; y <= 100; y += 25) {
      var gy = padT + (H - padT - padB) * (1 - y / 100);
      grid += '<line x1="' + padL + '" y1="' + gy + '" x2="' + W + '" y2="' + gy + '" stroke="var(--etsx-line)" stroke-width="1"/>';
      grid += '<text x="' + (padL - 4) + '" y="' + (gy + 3) + '" text-anchor="end" font-size="8" fill="var(--etsx-ink-3)">' + y + '</text>';
    }
    data.forEach(function (d, i) {
      var name = d.sigle || d.label || ("#" + (i + 1));
      var cx = padL + i * gw + gw / 2;
      var hn = isNaN(d.notePct) ? 0 : (H - padT - padB) * d.notePct / 100;
      var hm = isNaN(d.moyPct) ? 0 : (H - padT - padB) * d.moyPct / 100;
      var by = H - padB;
      var meTxt = esc(name) + " — vous : " + (isNaN(d.notePct) ? "—" : d.notePct + "%");
      var grpTxt = esc(name) + " — groupe : " + (isNaN(d.moyPct) ? "—" : d.moyPct + "%");
      bars += '<rect data-etsx-tip="' + meTxt + '" x="' + (cx - bw - 1) + '" y="' + (by - hn) + '" width="' + bw + '" height="' + hn + '" rx="2" fill="var(--etsx-accent)"><title>' + meTxt + '</title></rect>';
      bars += '<rect data-etsx-tip="' + grpTxt + '" x="' + (cx + 1) + '" y="' + (by - hm) + '" width="' + bw + '" height="' + hm + '" rx="2" fill="var(--etsx-ink-3)"><title>' + grpTxt + '</title></rect>';
      labels += '<text x="' + cx + '" y="' + (H - padB + 12) + '" text-anchor="end" font-size="8" fill="var(--etsx-ink-2)" transform="rotate(-40 ' + cx + ' ' + (H - padB + 12) + ')">' + esc(name) + '</text>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%">' + grid + bars + labels + '</svg>';
  }

  // Une ligne par programme (repli sans historique multi-programmes) — via
  // Chart.js pour la même raison que les deux autres graphiques : grille,
  // survol fiable, et surtout la légende cliquable native de Chart.js qui
  // permet de masquer un programme (ex. un cheminement préparatoire terminé)
  // sans rien coder de spécifique — c'est un comportement de base de la
  // bibliothèque dès qu'on lui donne plusieurs jeux de données.
  var _evoChart = null;
  function renderEvoChart(canvas, series) {
    if (_evoChart) { _evoChart.destroy(); _evoChart = null; }
    var labelSet = [];
    series.forEach(function (s) { s.points.forEach(function (p) { if (labelSet.indexOf(p.label) === -1) labelSet.push(p.label); }); });
    labelSet.sort(function (a, b) { return sessionOrder(a) - sessionOrder(b); });
    var ink2 = cssVar("--etsx-ink-2", "#555a66"), ink3 = cssVar("--etsx-ink-3", "#8a8f99"), line = cssVar("--etsx-line", "#e6e9ef");
    var datasets = series.map(function (s, i) {
      var byLabel = {}; s.points.forEach(function (p) { byLabel[p.label] = p.gpa; });
      var color = ACCENTS[i % ACCENTS.length];
      return {
        label: s.nom, data: labelSet.map(function (lbl) { return lbl in byLabel ? byLabel[lbl] : null; }),
        spanGaps: true, borderColor: color, backgroundColor: color, pointBackgroundColor: color,
        pointBorderColor: "#fff", pointBorderWidth: 1, pointRadius: 3, pointHoverRadius: 5, pointHitRadius: 12, borderWidth: 2, fill: false
      };
    });
    _evoChart = new Chart(canvas, {
      type: "line",
      data: { labels: labelSet, datasets: datasets },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 0 },
        devicePixelRatio: window.devicePixelRatio || 1,
        scales: {
          yAxes: [{ ticks: { min: 0, max: 4.3, stepSize: 0.5, fontColor: ink3, fontSize: 10 }, gridLines: { color: line, zeroLineColor: line }, scaleLabel: { display: true, labelString: "Cote cumulative", fontColor: ink2, fontSize: 11 } }],
          xAxes: [{ ticks: { fontColor: ink3, fontSize: 10 }, gridLines: { color: line, zeroLineColor: line }, scaleLabel: { display: true, labelString: "Session", fontColor: ink2, fontSize: 10.5 } }]
        },
        legend: { labels: { boxWidth: 12, fontColor: ink2, fontSize: 10.5 } },
        tooltips: {
          mode: "index", intersect: false,
          callbacks: { label: function (item, data) { return data.datasets[item.datasetIndex].label + " : " + r1(item.yLabel); } }
        }
      }
    });
  }

  function termOrder(label) {
    var y = (label.match(/(\d{4})/) || [])[1] || "0";
    var t = /hiver/i.test(label) ? 1 : /[ée]t[ée]/i.test(label) ? 2 : /automne/i.test(label) ? 3 : 0;
    return parseInt(y, 10) * 10 + t;
  }

  // Aperçu jetable, une seule ligne : affiché le temps que la requête
  // cheminement (fetchProgrammes, potentiellement plusieurs allers-retours
  // séquentiels) revienne avec le détail par programme. Pas besoin de
  // Chart.js pour un graphique qui vit une seconde ou deux.
  function evoChartSimpleSVG(points) {
    var W = 250, H = 170, padB = 26, padL = 26, padT = 14, maxY = 4.3;
    var n = points.length, grid = "", path = "", dots = "", labels = "";
    for (var y = 0; y <= 4; y += 1) {
      var gy = padT + (H - padT - padB) * (1 - y / maxY);
      grid += '<line x1="' + padL + '" y1="' + gy + '" x2="' + W + '" y2="' + gy + '" stroke="var(--etsx-line)" stroke-width="1"/>';
      grid += '<text x="' + (padL - 4) + '" y="' + (gy + 3) + '" text-anchor="end" font-size="8" fill="var(--etsx-ink-3)">' + y + '</text>';
    }
    var xs = function (i) { return n <= 1 ? (padL + (W - padL) / 2) : (padL + (W - padL - 6) * i / (n - 1)); };
    var ys = function (v) { return padT + (H - padT - padB) * (1 - Math.max(0, Math.min(maxY, v)) / maxY); };
    points.forEach(function (p, i) {
      var x = xs(i), y = ys(p.gpa);
      path += (i === 0 ? "M" : "L") + x + " " + y + " ";
      dots += '<circle cx="' + x + '" cy="' + y + '" r="3.5" fill="var(--etsx-accent)"><title>' + esc(p.label) + ' : ' + r1(p.gpa) + '</title></circle>';
      labels += '<text x="' + x + '" y="' + (H - padB + 12) + '" text-anchor="middle" font-size="8" fill="var(--etsx-ink-2)">' + esc(p.label) + '</text>';
    });
    if (n > 1) path = '<path d="' + path.trim() + '" fill="none" stroke="var(--etsx-accent)" stroke-width="2"/>';
    else path = "";
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%">' + grid + path + dots + labels + '</svg>';
  }

  /* Graphiques de la liste : barres (vous vs groupe) + évolution de la cote.
   * NB : indépendant du toggle « couleur » (ce sont des graphes, pas du tint). */
  var programmesData = null;   // [{code, nom, sessions:[{id,credits,moyenne}]}] depuis DocEvolutionMoyenne
  var _lastRows = [], _lastCache = {};

  function buildCharts(rows, cache) {
    _lastRows = rows; _lastCache = cache;
    var host = chartHost(); if (!host) return;
    buildBarChart(host, rows, cache);
    buildEvolutionChart(host, rows, cache);
  }

  var _barSession = null;
  function buildBarChart(host, rows, cache) {
    var withSess = rows.map(function (r) {
      var s = cache[r.key] || {};
      var lbl = shortSession(nearestSessionLabel(r.row) || "") || "—";
      return { sigle: r.sigle, notePct: s.notePct, moyPct: s.moyPct, session: lbl };
    }).filter(function (d) { return !isNaN(d.notePct) || !isNaN(d.moyPct); });
    var sessions = [];
    withSess.forEach(function (d) { if (sessions.indexOf(d.session) === -1) sessions.push(d.session); });
    sessions.sort(function (a, b) { return sessionOrder(a) - sessionOrder(b); });
    if (!_barSession || sessions.indexOf(_barSession) === -1) _barSession = sessions[sessions.length - 1] || null;
    var card = host.querySelector(".etsx-bar-card");
    if (!card) { card = document.createElement("div"); card.className = "etsx-chart-card etsx-bar-card"; host.insertBefore(card, host.firstChild); }
    var opts = sessions.map(function (x) { return '<option value="' + x + '"' + (x === _barSession ? " selected" : "") + '>' + x + '</option>'; }).join("");
    var data = withSess.filter(function (d) { return d.session === _barSession; });
    card.innerHTML =
      '<div class="etsx-chart-title">Votre note vs groupe</div>' +
      (sessions.length > 1 ? '<div class="etsx-chart-ctrl"><label>Session&nbsp;: <select class="etsx-bar-sess">' + opts + '</select></label></div>' : '') +
      (data.length ? barChartSVG(data) : '<div class="etsx-chart-empty">En attente des cotes…</div>') +
      '<div class="etsx-chart-legend"><span><i style="background:var(--etsx-accent)"></i>Vous</span><span><i style="background:var(--etsx-ink-3)"></i>Groupe</span></div>';
    var sel = card.querySelector(".etsx-bar-sess");
    if (sel) sel.addEventListener("change", function () { _barSession = sel.value; buildBarChart(host, rows, cache); });
    LOG("barres :", data.length, "cours (session " + _barSession + ")");
  }

  // Reconstruction (repli) de l'évolution à partir des cotes-lettres des cours.
  function reconstructEvolution(rows, cache) {
    var groups = {};
    rows.forEach(function (r) {
      var s = cache[r.key]; if (!s || !s.cote || !(s.cote in COTE_POINTS)) return;
      var cred = numf(txt(r.credCell)) || 0;
      var label = nearestSessionLabel(r.row) || "Session";
      if (!groups[label]) groups[label] = { pts: 0, cr: 0 };
      groups[label].pts += COTE_POINTS[s.cote] * cred;
      groups[label].cr += cred;
    });
    var cumPts = 0, cumCr = 0, out = [];
    Object.keys(groups).map(function (k) { return { k: k, order: termOrder(k) }; })
      .sort(function (a, b) { return a.order - b.order; })
      .forEach(function (o) { cumPts += groups[o.k].pts; cumCr += groups[o.k].cr; out.push({ label: shortSession(o.k), gpa: cumCr ? cumPts / cumCr : 0 }); });
    return out;
  }

  function buildEvolutionChart(host, rows, cache) {
    function renderSingle(points, source) {
      var card = host.querySelector(".etsx-evo-card");
      if (!card) { card = document.createElement("div"); card.className = "etsx-chart-card etsx-evo-card"; host.appendChild(card); }
      card.innerHTML =
        '<div class="etsx-chart-title">Évolution de votre cote</div>' +
        (points && points.length ? evoChartSimpleSVG(points) : '<div class="etsx-chart-empty">Données d’évolution indisponibles.</div>');
      LOG("évolution :", points ? points.length : 0, "point(s) (" + source + ")");
    }
    function renderMulti(programmes) {
      var card = host.querySelector(".etsx-evo-card");
      if (!card) { card = document.createElement("div"); card.className = "etsx-chart-card etsx-evo-card"; host.appendChild(card); }
      card.innerHTML = '<div class="etsx-chart-title">Évolution de votre cote</div><div class="etsx-chart-canvaswrap"><canvas></canvas></div>';
      var series = programmes.map(function (p) { return { nom: p.nom, points: evolutionCumulative(p.sessions) }; });
      renderEvoChart(card.querySelector("canvas"), series);
      LOG("évolution :", programmes.length, "programme(s) avec historique");
    }
    if (programmesData) { renderMulti(programmesData); return; }
    // affichage immédiat par reconstruction (une seule ligne), remplacé par le
    // détail officiel par programme dès qu'il arrive.
    renderSingle(reconstructEvolution(rows, cache), "reconstruction");
    fetchProgrammes(function (programmes) {
      var withData = programmes && programmes.filter(function (p) { return p.sessions.length > 0; });
      if (withData && withData.length) { programmesData = withData; renderMulti(withData); }
    });
  }

  /* ---- Cheminement multi-programmes (DocEvolutionMoyenne.aspx) ------------
   * Un étudiant qui a changé de programme (ex. cheminement préparatoire puis
   * bacc) a un historique de sessions PAR programme : la page officielle
   * propose un menu déroulant pour les parcourir un par un. Sélectionner une
   * valeur y déclenche un postback ASP.NET classique
   * (WebForm_DoPostBackWithOptions) ; on le rejoue nous-mêmes avec fetch(),
   * sans naviguer la page. Le VIEWSTATE d'une réponse sert de base à la requête
   * SUIVANTE (jamais deux fois le même) : plus robuste que de réutiliser
   * indéfiniment celui de la première page, au cas où l'un des postbacks le
   * renouvelle. */
  function parseProgrammeOptions(doc) {
    var sel = doc.getElementById("ctl00_ContentPlaceHolderMain_lisPgm");
    if (!sel) return null;
    return Array.from(sel.options).map(function (o) {
      var m = o.textContent.match(/^\s*\d+\s+(.*?)\s*:\s*(actif|inactif)/i);
      return { code: o.value, nom: m ? m[1].trim() : o.textContent.trim() };
    });
  }
  function aspHiddenFields(doc) {
    function val(id) { var el = doc.getElementById(id); return el ? el.value : ""; }
    return { vs: val("__VIEWSTATE"), vsg: val("__VIEWSTATEGENERATOR"), ev: val("__EVENTVALIDATION") };
  }
  function postProgramme(code, fields) {
    var body = new URLSearchParams();
    body.set("ctl00$ContentPlaceHolderMain$lisPgm", code);
    body.set("__EVENTTARGET", "ctl00$ContentPlaceHolderMain$lisPgm");
    body.set("__VIEWSTATE", fields.vs);
    body.set("__VIEWSTATEGENERATOR", fields.vsg);
    body.set("__EVENTVALIDATION", fields.ev);
    return fetch("https://signets-ens.etsmtl.ca/Secure/DocEvolutionMoyenne.aspx", {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    }).then(function (r) { return r.ok ? r.text() : null; });
  }
  // cb reçoit [{code, nom, sessions}], ou null si la requête initiale échoue.
  // Un programme sans historique (jamais suivi de cours, moyenne à 0) a
  // simplement sessions:[] — filtré par l'appelant, pas ici.
  function fetchProgrammes(cb) {
    if (programmesData) { cb(programmesData); return; }
    fetch("https://signets-ens.etsmtl.ca/Secure/DocEvolutionMoyenne.aspx", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.text() : null; })
      .then(function (html) {
        if (!html) { cb(null); return; }
        var doc = new DOMParser().parseFromString(html, "text/html");
        var options = parseProgrammeOptions(doc);
        var premier = { code: options && options[0] ? options[0].code : "", nom: options && options[0] ? options[0].nom : "Votre programme", sessions: parseEvolution(html) || [] };
        if (!options || options.length <= 1) { LOG("cheminement : un seul programme"); cb([premier]); return; }
        LOG("cheminement :", options.length, "programme(s) —", options.map(function (o) { return o.nom; }).join(", "));
        var out = [premier], fields = aspHiddenFields(doc);
        (function next(i) {
          if (i >= options.length) { cb(out); return; }
          postProgramme(options[i].code, fields).then(function (html2) {
            if (html2) {
              var doc2 = new DOMParser().parseFromString(html2, "text/html");
              out.push({ code: options[i].code, nom: options[i].nom, sessions: parseEvolution(html2) || [] });
              fields = aspHiddenFields(doc2);
            } else LOG("cheminement : échec pour", options[i].nom);
            setTimeout(function () { next(i + 1); }, 150); // séquentiel, doux pour le serveur
          }).catch(function () { setTimeout(function () { next(i + 1); }, 150); });
        })(1);
      })
      .catch(function (e) { LOG("cheminement : fetch échoué", e); cb(null); });
  }

  function parseEvolution(html) {
    var doc = null;
    try { doc = new DOMParser().parseFromString(html, "text/html"); } catch (e) { return null; }
    var grid = doc.getElementById("ctl00_ContentPlaceHolderMain_gridSessions") || doc.querySelector('[id*="gridSessions"]');
    var out = [];
    if (grid) {
      grid.querySelectorAll("tr").forEach(function (tr) {
        var c = tr.querySelectorAll("td");
        if (c.length < 3) return;
        var id = (c[0].textContent || "").replace(/\s+/g, " ").trim();
        var credits = numf((c[1].textContent || "").replace(/[^0-9.,]/g, ""));
        var moyenne = numf((c[2].textContent || "").replace(/[^0-9.,]/g, ""));
        if (/^[AHEÉ]\s?\d/i.test(id) && !isNaN(credits) && !isNaN(moyenne)) out.push({ id: id.replace(/\s+/g, ""), credits: credits, moyenne: moyenne });
      });
    }
    return out.length ? out : null;
  }

  // Accepte « H26 » comme « H2026 ». Avant, /(\d{2})/ lisait « 20 » dans « A2025 » :
  // toutes les sessions se retrouvaient à égalité et l'ordre du graphe d'évolution
  // ne tenait plus qu'au hasard du tri stable.
  function sessionOrder(id) {
    id = String(id);
    var m = id.match(/(\d{4}|\d{2})/);
    var y = m ? parseInt(m[1], 10) : 0;
    if (y < 100) y += 2000;
    var t = /^H/i.test(id) ? 1 : /^[EÉ]/i.test(id) ? 2 : /^A/i.test(id) ? 3 : 0;
    return y * 10 + t;
  }
  function evolutionCumulative(data) {
    var ord = data.slice().sort(function (a, b) { return sessionOrder(a.id) - sessionOrder(b.id); });
    var pts = 0, cr = 0, out = [];
    ord.forEach(function (s) { pts += s.moyenne * s.credits; cr += s.credits; out.push({ label: s.id, gpa: cr ? pts / cr : 0 }); });
    return out;
  }

  // Diagnostic : taper etsxDebug() dans la console pour tout voir d'un coup.
  try {
    window.etsxDebug = function () {
      var d = {
        page: isDetailPage() ? "page d'un cours" : isListPage() ? "liste des cours" : "autre",
        url: location.href,
        conteneurGraphiques: !!document.getElementById("etsx-charts"),
        menuGauche: !!document.getElementById("ctl00_LoginViewLeftColumn_MenuVertical"),
        colorNotes: settings.colorNotes,
        cours: _lastRows.map(function (r) {
          var s = _lastCache[r.key] || {};
          return { sigle: r.sigle, notePct: s.notePct, moyPct: s.moyPct, rang: s.rang, cote: s.cote, couleur: s.tier, cellCote: !!r.coteCell, cellRang: !!r.rangCell, href: r.href };
        }),
        programmes: programmesData
      };
      console.log("%c[ETStyle] DEBUG", "color:#1c4e89;font-weight:bold", d);
      return d;
    };
  } catch (e) {}
  var SESSION_RE = /(hiver|[ée]t[ée]|automne)\s*\d{4}/i;
  // En-têtes de session ("Été 2026" …) repérés dans tout le document, puis on
  // associe chaque ligne au dernier en-tête qui la PRÉCÈDE (ordre du document).
  // (Les en-têtes de groupe ne sont pas des frères directs des lignes dans
  //  Infragistics : previousElementSibling ne suffit pas.)
  var _sessionHeaders = null, _shStamp = 0;
  function collectSessionHeaders() {
    // Balayage limité au conteneur de contenu quand il existe : parcourir tout le
    // document coûtait un balayage complet par cours enrichi, soit N balayages
    // pour N cours pendant le chargement.
    var scope = document.getElementById("etsMCContent") || document.body;
    var out = [];
    scope.querySelectorAll("td, th, div, span, a").forEach(function (el) {
      var t = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (t.length > 22) return;            // en-tête = texte court (« Été 2026 »)
      var m = t.match(SESSION_RE);
      if (m) out.push({ node: el, label: m[0] });
    });
    return out;
  }
  // Cache court : la grille Infragistics peut se re-rendre, mais pas quatre fois
  // par seconde. Avant, quatre fonctions remettaient le cache à null à chaque appel.
  function sessionHeaders() {
    var now = Date.now();
    if (!_sessionHeaders || now - _shStamp > 1500) { _sessionHeaders = collectSessionHeaders(); _shStamp = now; }
    return _sessionHeaders;
  }
  function nearestSessionLabel(row) {
    var hs = sessionHeaders(), label = null;
    for (var i = 0; i < hs.length; i++) {
      // DOCUMENT_POSITION_FOLLOWING (4) : la ligne suit l'en-tête → en-tête avant la ligne
      if (hs[i].node.compareDocumentPosition(row) & 4) label = hs[i].label;
    }
    if (label) return label;
    var any = (document.body.textContent || "").match(SESSION_RE);
    return any ? any[0] : null;
  }
  function shortSession(label) {
    var y = (label.match(/(\d{4})/) || [])[1] || "";
    var t = /hiver/i.test(label) ? "H" : /[ée]t[ée]/i.test(label) ? "É" : /automne/i.test(label) ? "A" : "";
    return t + (y ? y.slice(2) : "");
  }

  function repaintAll() { try { paintCourseDetail(); } catch (e) {} }

  /* =========================================================================
   * AJOUTS (tokenisés clair/sombre) :
   *   (3c) distribution estimée des notes avec ma position
   *   (4)  estimateur de cote (note + rang centile -> cote)
   *   (5)  réorganisation des évaluations par glisser-déposer (recalc du graph)
   *   (6)  infobulles au survol
   * ====================================================================== */

  /* ---- (6) INFOBULLES ------------------------------------------------------ */
  var tipEl = null;
  function ensureTip() {
    if (tipEl) return tipEl;
    tipEl = document.createElement("div");
    tipEl.id = "etsx-tip";
    tipEl.setAttribute("role", "tooltip");
    (document.body || document.documentElement).appendChild(tipEl);
    return tipEl;
  }
  function showTip(html, x, y) {
    var t = ensureTip();
    t.innerHTML = html; t.style.display = "block";
    var r = t.getBoundingClientRect();
    var left = x + 14, top = y + 16;
    if (left + r.width > window.innerWidth - 8) left = x - r.width - 14;
    if (top + r.height > window.innerHeight - 8) top = y - r.height - 16;
    t.style.left = Math.max(6, left) + "px";
    t.style.top = Math.max(6, top) + "px";
  }
  function hideTip() { if (tipEl) tipEl.style.display = "none"; }
  function bindTooltips() {
    if (document.body.getAttribute("data-etsx-tipbound") === "1") return;
    document.body.setAttribute("data-etsx-tipbound", "1");
    document.addEventListener("mousemove", function (e) {
      var host = e.target.closest ? e.target.closest("[data-etsx-tip]") : null;
      if (!host) { hideTip(); return; }
      showTip(host.getAttribute("data-etsx-tip"), e.clientX, e.clientY);
    });
    document.addEventListener("mouseleave", hideTip, true);
    window.addEventListener("scroll", hideTip, true);
  }

  /* ---- STATS : distribution Bêta estimée -----------------------------------
   * mu = moy/100, var dérivée de l'écart-type -> a,b de la loi Bêta.
   * Gamma via Lanczos ; intégration Simpson composite. (réécrit)
   * --------------------------------------------------------------------- */
  var LANCZOS = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  function gammaFn(z) {
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gammaFn(1 - z));
    z -= 1;
    var x = LANCZOS[0];
    for (var i = 1; i < LANCZOS.length; i++) x += LANCZOS[i] / (z + i);
    var t = z + LANCZOS.length - 1.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }
  function lnGamma(z) { return Math.log(Math.abs(gammaFn(z))); }
  function betaPdf(x, a, b) {
    if (x <= 0 || x >= 1) return 0;
    var ln = lnGamma(a + b) - lnGamma(a) - lnGamma(b) + (a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x);
    var v = Math.exp(ln);
    return isFinite(v) ? v : 0;
  }
  function simpson(f, a, b, n) {
    n = n || 200; if (n % 2) n++;
    var h = (b - a) / n, s = f(a) + f(b);
    for (var i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
    var r = (h / 3) * s;
    return isFinite(r) ? r : 0;
  }
  function betaParams(moyPct, sdPct) {
    var mu = Math.min(0.98, Math.max(0.02, moyPct / 100));
    var v = Math.pow((sdPct || 12) / 100, 2);
    var maxV = mu * (1 - mu) * 0.98;
    if (v <= 0 || v >= maxV) v = Math.min(maxV, Math.max(1e-4, v || maxV / 2));
    var k = mu * (1 - mu) / v - 1;
    if (!(k > 0) || !isFinite(k)) k = 6;
    return { a: mu * k, b: (1 - mu) * k };
  }

  /* ---- (3c) GRAPHIQUE DE DISTRIBUTION — via Chart.js ------------------------
   * Rendu avec Chart.js (vendored, licence MIT — voir vendors/chartjs/) : grille
   * complète, info-bulles fiables au survol. Le calcul (loi Bêta calée sur
   * moyenne + écart-type, zones colorées par écart à la moyenne) ne change pas.
   *   rouge (< moy − σ) · rose (< moy) · vert clair (< moy + σ) · vert (≥ moy + σ) */
  function zoneColor(xPct, moyPct, sdPct) {
    if (xPct < moyPct - sdPct) return "#ef6b6b";   // rouge
    if (xPct < moyPct)         return "#f9b9c8";   // rose
    if (xPct < moyPct + sdPct) return "#9be0ac";   // vert clair
    return "#1ea14d";                               // vert
  }
  // Chart.js dessine sur un <canvas> : il ne comprend pas var(--x), il faut
  // résoudre les jetons de couleur en valeurs concrètes avant de les lui passer.
  function cssVar(name, fallback) {
    try { var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); return v || fallback; }
    catch (e) { return fallback; }
  }
  var ZONE_COLORS = ["#ef6b6b", "#f9b9c8", "#9be0ac", "#1ea14d"];
  function zoneIndex(xPct, moyPct, sd) { return xPct < moyPct - sd ? 0 : xPct < moyPct ? 1 : xPct <= moyPct + sd ? 2 : 3; }
  // Découpe une série de points {x,y} en 4 jeux de données par zone de
  // couleur : chaque zone devient son propre dataset Chart.js rempli, pour
  // un dégradé rouge→vert sous la courbe. Les points sont assez rapprochés
  // (1 % d'écart) pour qu'une zone qui se termine pile entre deux points ne
  // laisse pas de vide visible.
  function splitByZone(points, moyPct, sd) {
    var groups = [[], [], [], []];
    points.forEach(function (p) { groups[zoneIndex(p.x, moyPct, sd)].push(p); });
    return groups.map(function (pts, i) {
      return { data: pts, showLine: true, fill: true, lineTension: 0, pointRadius: 0, pointHitRadius: 0, borderColor: ZONE_COLORS[i], backgroundColor: ZONE_COLORS[i], borderWidth: 0.5 };
    });
  }
  function curvePoints(a, b) {
    var pts = [];
    for (var i = 0; i <= 100; i++) pts.push({ x: i, y: betaPdf(i / 100, a, b) * 100 });
    return pts;
  }
  function histogramBins(a, b, binWidth) {
    var nBins = Math.round(100 / binWidth), bins = [];
    for (var i = 0; i < nBins; i++) {
      var x0 = i * binWidth, x1 = x0 + binWidth;
      bins.push({ x0: x0, x1: x1, v: simpson(function (x) { return betaPdf(x, a, b); }, x0 / 100, x1 / 100, 12) * 100 });
    }
    return bins;
  }
  // Un histogramme « en escalier » ne peut pas se découper par zone de la
  // même façon qu'une courbe : la dernière barre d'une zone n'a de bord droit
  // que si SON dataset porte aussi le point qui le ferme — sans quoi
  // steppedLine n'a rien vers quoi prolonger le palier, et la barre manque à
  // l'appel (c'est le trou repéré sur les histogrammes). On regroupe donc les
  // bacs consécutifs d'une même zone, et chaque groupe ferme lui-même sa
  // dernière barre.
  function histogramDatasets(bins, moyPct, sd) {
    var groups = [[], [], [], []];
    bins.forEach(function (bin) { groups[zoneIndex((bin.x0 + bin.x1) / 2, moyPct, sd)].push(bin); });
    return groups.map(function (g, i) {
      var pts = g.map(function (bin) { return { x: bin.x0, y: bin.v }; });
      if (g.length) pts.push({ x: g[g.length - 1].x1, y: g[g.length - 1].v });
      return { data: pts, showLine: true, fill: true, lineTension: 0, pointRadius: 0, pointHitRadius: 0, steppedLine: "after", borderColor: ZONE_COLORS[i], backgroundColor: ZONE_COLORS[i], borderWidth: 0.5 };
    });
  }

  var _distChart = null;
  function renderDistributionChart(canvas, moyPct, sdPct, myPct, mode) {
    if (_distChart) { _distChart.destroy(); _distChart = null; }
    var p = betaParams(moyPct, sdPct), sd = (sdPct && sdPct > 0) ? sdPct : 12;
    var isHisto = mode !== "courbe";
    var datasets = isHisto
      ? histogramDatasets(histogramBins(p.a, p.b, mode === "10" ? 10 : 5), moyPct, sd)
      : splitByZone(curvePoints(p.a, p.b), moyPct, sd);
    var accent = cssVar("--etsx-accent", "#1c4e89"), ink2 = cssVar("--etsx-ink-2", "#555a66"),
        ink3 = cssVar("--etsx-ink-3", "#8a8f99"), line = cssVar("--etsx-line", "#e6e9ef");
    // Ligne verticale « Votre moyenne » : même habillage que sur l'ancien
    // rendu SVG (fine, en tirets, dans l'accent) plutôt qu'un trait plein
    // épais — plus discrète, elle se pose sur la couleur de zone sans l'écraser.
    // « Moyenne du groupe » n'apparaît plus sur les histogrammes : la forme
    // même de l'histogramme EST déjà centrée sur elle, une deuxième ligne à
    // côté de « Votre moyenne » n'ajoutait qu'une confusion visuelle. Elle
    // reste sur la courbe, où les deux valeurs peuvent être proches sans
    // repère de zone pour les distinguer.
    var annotations = [];
    if (!isNaN(myPct)) annotations.push({ type: "line", mode: "vertical", scaleID: "x-axis-1", value: myPct, borderWidth: 2, borderDash: [5, 3], borderColor: accent });
    if (!isHisto && !isNaN(moyPct)) annotations.push({ type: "line", mode: "vertical", scaleID: "x-axis-1", value: moyPct, borderWidth: 1.5, borderDash: [3, 3], borderColor: ink3 });
    _distChart = new Chart(canvas, {
      type: "scatter",
      data: { datasets: datasets },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 0 },
        devicePixelRatio: window.devicePixelRatio || 1,
        legend: { display: false },
        scales: {
          yAxes: [{
            ticks: { beginAtZero: true, fontColor: ink3, fontSize: 10 },
            gridLines: { color: line, zeroLineColor: line },
            scaleLabel: { display: true, labelString: "Nombre d'étudiants en %", fontColor: ink2, fontSize: 11 }
          }],
          xAxes: [{
            ticks: { min: 0, max: 100, stepSize: 20, fontColor: ink3, fontSize: 10 },
            gridLines: { color: line, zeroLineColor: line },
            scaleLabel: { display: true, labelString: "Note de l'étudiant en %", fontColor: ink2, fontSize: 10.5 }
          }]
        },
        tooltips: {
          mode: "nearest", intersect: false, displayColors: false,
          callbacks: {
            title: function (items) { return r1(items[0].xLabel) + "%"; },
            label: function (item) { return (isHisto ? "≈ " : "densité ") + r1(item.yLabel) + (isHisto ? "% des étudiants" : ""); }
          }
        },
        annotation: { drawTime: "afterDatasetsDraw", annotations: annotations }
      }
    });
  }

  /* ---- (4) ESTIMATEUR DE COTE ---------------------------------------------
   * Table de correspondance ÉTS (note ~, rang centile ~ par lettre), publique.
   * Cote estimée = moyenne de la lettre suggérée par la note et par le rang. (réécrit)
   * --------------------------------------------------------------------- */
  var COTE_TABLE = [
    { lettre: "E",  pts: 0.0, note: 0,    rc: 0 },
    { lettre: "D",  pts: 1.0, note: 50,   rc: 2 },
    { lettre: "D+", pts: 1.3, note: 57,   rc: 6 },
    { lettre: "C-", pts: 1.7, note: 60,   rc: 15 },
    { lettre: "C",  pts: 2.0, note: 63,   rc: 24 },
    { lettre: "C+", pts: 2.3, note: 66.5, rc: 33 },
    { lettre: "B-", pts: 2.7, note: 69,   rc: 40 },
    { lettre: "B",  pts: 3.0, note: 72,   rc: 49 },
    { lettre: "B+", pts: 3.3, note: 76,   rc: 59 },
    { lettre: "A-", pts: 3.7, note: 80,   rc: 69 },
    { lettre: "A",  pts: 4.0, note: 85,   rc: 78 },
    { lettre: "A+", pts: 4.3, note: 90,   rc: 87 }
  ];
  function ptsFromField(value, field) {
    var chosen = COTE_TABLE[0];
    for (var i = 0; i < COTE_TABLE.length; i++) { if (COTE_TABLE[i][field] <= value) chosen = COTE_TABLE[i]; }
    return chosen.pts;
  }
  function closestCote(pts) {
    var best = COTE_TABLE[0], bd = Infinity;
    COTE_TABLE.forEach(function (c) { var d = Math.abs(c.pts - pts); if (d < bd) { bd = d; best = c; } });
    return best;
  }
  function estimerCote(note, rc) {
    if (isNaN(note)) return null;
    if (note < 50) return { centre: "E", plage: "E ou D", pts: 0 };
    var moyennePts = (ptsFromField(note, "note") + ptsFromField(rc, "rc")) / 2;
    var idx = COTE_TABLE.indexOf(closestCote(moyennePts));
    var centre = COTE_TABLE[idx];
    var bas = COTE_TABLE[Math.max(0, idx - 1)];
    var haut = COTE_TABLE[Math.min(COTE_TABLE.length - 1, idx + 1)];
    var plage = (bas === centre || haut === centre) ?
      (centre.lettre + (haut !== centre ? " ou " + haut.lettre : "")) :
      (bas.lettre + ", " + centre.lettre + " ou " + haut.lettre);
    return { centre: centre.lettre, plage: plage, pts: r1(moyennePts) };
  }
  function buildEstimator() {
    var card = document.createElement("div");
    card.className = "etsx-chart-card etsx-estimator";
    card.innerHTML =
      '<div class="etsx-chart-title">Estimer une cote</div>' +
      '<div class="etsx-est-row">' +
        '<label>Note (%)<input type="number" min="0" max="100" step="0.5" class="etsx-est-note" placeholder="ex. 78"></label>' +
        '<label>Rang centile<input type="number" min="0" max="100" step="1" class="etsx-est-rc" placeholder="ex. 60"></label>' +
      '</div>' +
      '<button type="button" class="etsx-est-go">Estimer</button>' +
      '<div class="etsx-est-out" aria-live="polite"></div>';
    var noteI = card.querySelector(".etsx-est-note");
    var rcI = card.querySelector(".etsx-est-rc");
    var out = card.querySelector(".etsx-est-out");
    function run() {
      var res = estimerCote(numf(noteI.value), numf(rcI.value) || 50);
      if (!res) { out.textContent = "Entrez une note."; out.className = "etsx-est-out"; return; }
      var col = coteColor(res.centre) || "var(--etsx-accent)";
      out.className = "etsx-est-out is-on";
      out.innerHTML = 'Cote estimée : <strong class="etsx-est-badge" style="background:' + col + '">' + esc(res.plage) + '</strong>' +
        '<span class="etsx-est-pts" data-etsx-tip="Points estimés sur 4,3 (moyenne de la note et du rang centile)">≈ ' + res.pts.toFixed(1).replace(".", ",") + " / 4,3</span>";
    }
    card.querySelector(".etsx-est-go").addEventListener("click", run);
    [noteI, rcI].forEach(function (el) { el.addEventListener("keydown", function (e) { if (e.key === "Enter") run(); }); });
    return card;
  }

  /* ---- SIMULATEUR DE MOYENNE (d'après l'Excel « Prédit ta cote ») ----------
   * Moyenne = Σ(crédits × points) / Σ(crédits comptés), sur 4,30.
   * Points par lettre = table COTE_POINTS (= feuille PoidsNote). Les cotes hors
   * barème (S, K, AX…) ne comptent pas ; on peut éditer chaque cote (manuel). */
  var _gpaOverrides = {};
  var _gpaTarget = "";  // mode cote visée (global)
  var _gpaSessTarget = {};  // cote visée par session
  var GPA_COTES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "E"];
  function gpaFmt(n) { return n.toFixed(2).replace(".", ","); }
  function gpaCompute(items) {
    var pts = 0, cr = 0;
    items.forEach(function (it) { if (it.cote in COTE_POINTS) { pts += COTE_POINTS[it.cote] * it.cred; cr += it.cred; } });
    return cr ? pts / cr : 0;
  }
  /* buildGpaSim() a été retirée en v42 : remplacée par buildGpaBoard() (fenêtre
     superposÃ©e, v33), elle n'était plus appelée que par ses propres écouteurs —
     105 lignes de code inatteignable. */

  /* ---- MODAL (fenêtre superposée, fond flouté) -------------------------- */
  function escClose(e) { if (e.key === "Escape") closeModal(); }
  function closeModal() { var m = document.getElementById("etsx-modal"); if (m) m.remove(); document.removeEventListener("keydown", escClose); }
  function openModal(title, contentEl, cls) {
    closeModal();
    var ov = document.createElement("div"); ov.id = "etsx-modal"; if (cls) ov.className = cls;
    var panel = document.createElement("div"); panel.className = "etsx-modal-panel";
    var head = document.createElement("div"); head.className = "etsx-modal-head";
    head.innerHTML = '<span class="etsx-modal-title">' + esc(title) + '</span>';
    var x = document.createElement("button"); x.type = "button"; x.className = "etsx-modal-x"; x.textContent = "×"; x.setAttribute("aria-label", "Fermer"); head.appendChild(x);
    var body = document.createElement("div"); body.className = "etsx-modal-body"; body.appendChild(contentEl);
    panel.appendChild(head); panel.appendChild(body); ov.appendChild(panel);
    (document.body || document.documentElement).appendChild(ov);
    ov.addEventListener("mousedown", function (e) { if (e.target === ov) closeModal(); });
    x.addEventListener("click", closeModal);
    document.addEventListener("keydown", escClose);
  }

  /* ---- SIMULATEUR — board (sessions en colonnes) ------------------------- */
  // Instantané des cours conservé dans chrome.storage : _lastRows ne vit qu'en
  // mémoire, or SignETS recharge une vraie page à chaque navigation. Le simulateur
  // s'ouvrait donc vide partout ailleurs que sur « Mes cours ».
  var GPA_SNAP = "etsx-gpa-items";
  var _gpaSnapshot = null;
  cacheGet([GPA_SNAP], function (o) { if (o && o[GPA_SNAP]) _gpaSnapshot = o[GPA_SNAP]; });

  function gpaItems() {
    var rows = (isListPage() ? collectCourseRows() : _lastRows) || [];
    var cache = _lastCache || {};
    if (rows.length) {
      _gpaSnapshot = rows.map(function (r) {
        var sm = cache[r.key] || {};
        var nativeCote = r.coteCell ? txt(r.coteCell).replace(/[^A-EX+\-]/gi, "").toUpperCase() : "";
        return { key: r.key, sigle: r.sigle, cred: numf(txt(r.credCell)) || 0,
                 cote: sm.cote || nativeCote || "",
                 session: shortSession(nearestSessionLabel(r.row) || "") || "—" };
      });
      var st = {}; st[GPA_SNAP] = _gpaSnapshot; cacheSet(st);
    }
    // Les cotes simulées s'appliquent par-dessus, quelle que soit la source.
    return (_gpaSnapshot || []).map(function (it) {
      return { key: it.key, sigle: it.sigle, cred: it.cred, session: it.session,
               cote: (it.key in _gpaOverrides) ? _gpaOverrides[it.key] : it.cote };
    });
  }
  function minCoteFor(need) { var c = "A+"; for (var i = GPA_COTES.length - 1; i >= 0; i--) { if (COTE_POINTS[GPA_COTES[i]] >= need) { c = GPA_COTES[i]; break; } } return c; }
  function buildGpaBoard() {
    var el = document.createElement("div"); el.className = "etsx-simwrap";
    var items = gpaItems();
    if (!items.length) { el.innerHTML = '<div class="etsx-chart-empty">Ouvrez une fois « Mes cours » pour charger vos sessions : le simulateur les gardera ensuite, partout sur SignETS.</div>'; return el; }
    var order = {}, groups = {};
    items.forEach(function (it) { if (!groups[it.session]) { groups[it.session] = []; order[it.session] = sessionOrder(it.session); } groups[it.session].push(it); });
    var sessions = Object.keys(groups).sort(function (a, b) { return order[b] - order[a]; });
    var excluded = settings.excludedSessions || [];
    function isExcl(x) { return excluded.indexOf(x) !== -1; }
    var globalItems = items.filter(function (it) { return !isExcl(it.session); });
    var global = gpaCompute(globalItems);
    var fixedPts = 0, fixedCr = 0, remCr = 0, remCount = 0;
    globalItems.forEach(function (it) { if (it.cote in COTE_POINTS) { fixedPts += COTE_POINTS[it.cote] * it.cred; fixedCr += it.cred; } else if (it.cred > 0) { remCr += it.cred; remCount++; } });
    var totalCr = fixedCr + remCr;
    var cols = sessions.map(function (sess) {
      var its = groups[sess];
      var g = gpaCompute(its);
      var rowsHtml = its.map(function (it) {
        var opts = '<option value="">—</option>' + GPA_COTES.map(function (c) { return '<option value="' + c + '"' + (c === it.cote ? " selected" : "") + '>' + c + '</option>'; }).join("");
        return '<div class="etsx-simrow"><span class="etsx-simsig">' + esc(it.sigle) + '</span><span class="etsx-simcr">' + (it.cred || "") + ' cr</span><select data-key="' + esc(it.key) + '" class="etsx-gpa-sel">' + opts + '</select></div>';
      }).join("");
      return '<div class="etsx-simcol' + (isExcl(sess) ? ' is-excl' : '') + '">' +
        '<div class="etsx-simcol-head"><span class="etsx-simcol-name">' + esc(sess) + '</span><span class="etsx-simcol-gpa">' + gpaFmt(g) + '</span>' +
          '<button type="button" class="etsx-gpa-excl' + (isExcl(sess) ? ' is-excl' : '') + '" data-sess="' + esc(sess) + '" title="Inclure / exclure du calcul global">' + (isExcl(sess) ? 'exclu' : 'inclus') + '</button>' +
          '<button type="button" class="etsx-gpa-reset" data-sess="' + esc(sess) + '" title="Réinitialiser la session">↺</button></div>' +
        '<div class="etsx-simcol-tgt"><span>Visée</span><input type="number" min="0" max="4.3" step="0.1" class="etsx-gpa-stgt-in" data-sess="' + esc(sess) + '" placeholder="3.5" value="' + (_gpaSessTarget[sess] || "") + '"><span class="etsx-gpa-stgt-out" data-sess="' + esc(sess) + '"></span></div>' +
        '<div class="etsx-simcol-body">' + rowsHtml + '</div>' +
      '</div>';
    }).join("");
    el.innerHTML =
      '<div class="etsx-sim-top">' +
        '<div class="etsx-sim-global"><span class="etsx-gpa-glabel">Moyenne globale</span><b>' + gpaFmt(global) + '</b> <span>/ 4,30</span></div>' +
        '<div class="etsx-sim-gtgt"><label>Cote visée (globale) <input type="number" min="0" max="4.3" step="0.1" class="etsx-gpa-tgt" placeholder="ex. 3.5" value="' + (_gpaTarget || "") + '"></label><div class="etsx-gpa-tgt-out"></div></div>' +
        '<button type="button" class="etsx-gpa-resetall">Tout réinitialiser</button>' +
      '</div>' +
      '<div class="etsx-simboard">' + cols + '</div>';
    function refresh() { var nb = buildGpaBoard(); el.replaceWith(nb); }
    el.querySelectorAll(".etsx-gpa-sel").forEach(function (sel) { sel.addEventListener("change", function () { _gpaOverrides[sel.getAttribute("data-key")] = sel.value; refresh(); }); });
    el.querySelectorAll(".etsx-gpa-reset").forEach(function (b) { b.addEventListener("click", function () { var sess = b.getAttribute("data-sess"); items.forEach(function (it) { if (it.session === sess) delete _gpaOverrides[it.key]; }); refresh(); }); });
    el.querySelectorAll(".etsx-gpa-excl").forEach(function (b) { b.addEventListener("click", function () { var sess = b.getAttribute("data-sess"); var arr = settings.excludedSessions || (settings.excludedSessions = []); var i = arr.indexOf(sess); if (i === -1) arr.push(sess); else arr.splice(i, 1); saveSettings(); refresh(); }); });
    var ra = el.querySelector(".etsx-gpa-resetall"); if (ra) ra.addEventListener("click", function () { _gpaOverrides = {}; refresh(); });
    var tgt = el.querySelector(".etsx-gpa-tgt"), tout = el.querySelector(".etsx-gpa-tgt-out");
    function ctG() { if (!tout) return; var T = numf((tgt.value || "").replace(",", ".")); _gpaTarget = tgt.value; if (isNaN(T)) { tout.innerHTML = ""; return; } if (remCr <= 0) { tout.innerHTML = '<span class="etsx-tgt-warn">Aucun cours en cours.</span>'; return; } var need = (T * totalCr - fixedPts) / remCr; if (need <= 0) { tout.innerHTML = '<span class="etsx-tgt-ok">Objectif déjà assuré.</span>'; return; } if (need > 4.3) { tout.innerHTML = '<span class="etsx-tgt-warn">Impossible : il faudrait mieux que A+.</span>'; return; } tout.innerHTML = 'Il te faut en moyenne <b>≥ ' + minCoteFor(need) + '</b> (' + gpaFmt(need) + ') dans tes <b>' + remCount + '</b> cours en cours.'; }
    if (tgt) { tgt.addEventListener("input", ctG); ctG(); }
    el.querySelectorAll(".etsx-gpa-stgt-in").forEach(function (inp) {
      function runS() {
        var sess = inp.getAttribute("data-sess");
        var out = el.querySelector('.etsx-gpa-stgt-out[data-sess="' + sess + '"]'); if (!out) return;
        _gpaSessTarget[sess] = inp.value;
        var T = numf((inp.value || "").replace(",", ".")); if (isNaN(T)) { out.innerHTML = ""; return; }
        var fp = 0, fc = 0, rc = 0; (groups[sess] || []).forEach(function (it) { if (it.cote in COTE_POINTS) { fp += COTE_POINTS[it.cote] * it.cred; fc += it.cred; } else if (it.cred > 0) { rc += it.cred; } });
        var tc = fc + rc; if (rc <= 0) { out.innerHTML = '<span class="etsx-tgt-warn">figée</span>'; return; }
        var need = (T * tc - fp) / rc;
        if (need <= 0) { out.innerHTML = '<span class="etsx-tgt-ok">assuré</span>'; return; }
        if (need > 4.3) { out.innerHTML = '<span class="etsx-tgt-warn">impossible</span>'; return; }
        out.innerHTML = '≥ <b>' + minCoteFor(need) + '</b> (' + gpaFmt(need) + ')';
      }
      inp.addEventListener("input", runS); runS();
    });
    return el;
  }
  function openSimModal() { openModal("Simulateur de moyenne", buildGpaBoard(), "etsx-modal-wide"); }

  /* ---- AIDE (tutoriel) --------------------------------------------------- */
  var HELP_HTML =
    '<p>Bienvenue dans <b>SignETS amélioré</b>. Voici l\'essentiel :</p>' +
    '<ul>' +
    '<li><b>Mes cours</b> : chaque ligne est colorée selon ta cote (vert = au-dessus, jaune = dans la moyenne, orange/rouge = en dessous). Le rang centile apparaît en petit badge « R ».</li>' +
    '<li><b>Page d\'un cours</b> : à gauche, « Évolution de votre moyenne » (toi vs le groupe) et « Distribution estimée des notes ». Le récap indique ta note, la moyenne, l\'écart-type, la médiane, le rang, et la cote (ou une prédiction si le cours est en cours).</li>' +
    '<li><b>Simulateur de moyenne</b> (bouton en haut) : modifie une cote pour voir l\'effet sur ta moyenne, par session et au global. Entre une « cote visée » pour savoir la cote minimale à obtenir.</li>' +
    '<li><b>Thème</b> : clair/sombre et couleur d\'accent en haut à gauche ; plus d\'options dans « Paramètres ».</li>' +
    '</ul>' +
    '<h4 class="etsx-help-h">Aide officielle de SignETS</h4>' +
    '<p>La grille présente toutes les sessions où vous avez été actif à l\'ÉTS, en ordre décroissant. En cliquant sur la petite flèche à gauche d\'une session, une sous-grille s\'ouvre et montre les cours suivis. La session courante est ouverte automatiquement. En cliquant sur un cours-groupe, une nouvelle page affiche le détail du cours : les notes obtenues à chaque élément d\'évaluation (devoirs, examens, laboratoires, etc.), le nom de vos coéquipiers et coéquipières et celui des enseignants et enseignantes. Vous y trouverez aussi l\'horaire et le local des différentes activités du cours ainsi que ceux de l\'examen final quand il sera disponible.</p>' +
    '<p class="etsx-help-note">Astuce : si une page affiche « HTTP 400 », videz les cookies de signets-ens.etsmtl.ca puis rechargez.</p>';
  function hideNativeHelp() {
    try {
      var nodes = document.querySelectorAll(".ui-accordion-header, #etsMCContent a, #etsMCContent h1, #etsMCContent h2, #etsMCContent h3");
      nodes.forEach(function (h) {
        var t = (h.textContent || "").replace(/\s+/g, " ").trim();
        if (/^à l['\u2019]aide\s*!?$/i.test(t)) {
          var acc = h.closest(".ui-accordion");
          if (acc) acc.style.display = "none";
          else { h.style.display = "none"; var nx = h.nextElementSibling; if (nx) nx.style.display = "none"; }
        }
      });
    } catch (e) {}
  }
  function openHelpModal() { var c = document.createElement("div"); c.className = "etsx-help"; c.innerHTML = HELP_HTML; openModal("À l\'aide — utiliser SignETS", c); }

  /* ---- (5) GLISSER-DÉPOSER DES ÉVALUATIONS --------------------------------
   * Drag natif (HTML5) sur les lignes de la grille de notes ; au lâcher, on
   * relit l'ordre courant et on retrace le graphe « ma note vs groupe ».
   * --------------------------------------------------------------------- */
  function readDetailEvaluations() {
    var notes = document.querySelectorAll('[aria-describedby*="grilleNotes_columnheader_3"]');
    var grp = document.querySelectorAll('[aria-describedby*="grilleNotes_columnheader_6"]');
    var denom = document.querySelectorAll('[aria-describedby*="grilleNotes_columnheader_4"]');
    var pond = document.querySelectorAll('[aria-describedby*="grilleNotes_columnheader_5"]');
    var name = document.querySelectorAll('[aria-describedby*="grilleNotes_columnheader_0"]');
    var rows = [], seen = [];
    for (var i = 0; i < notes.length; i++) {
      var tr = notes[i].closest("tr");
      if (!tr || seen.indexOf(tr) !== -1) continue;
      seen.push(tr);
      var d = num(txt(denom[i]));
      var nv = num(txt(notes[i])), mv = num(txt(grp[i]));
      if (isEmpty(grp[i]) || !d || isNaN(nv) || isNaN(mv)) continue;
      rows.push({
        tr: tr,
        label: (name[i] ? txt(name[i]) : "Éval " + (i + 1)).slice(0, 18),
        notePct: r1(nv / d * 100),
        moyPct: r1(mv / d * 100),
        pond: num(txt(pond[i])) || 1
      });
    }
    // Pas de tri géométrique : querySelectorAll rend déjà l'ordre du document, et le
    // glisser-déposer déplace les vrais nœuds — l'ordre DOM EST l'ordre visuel.
    // Un getBoundingClientRect par ligne à chaque cycle forçait un recalcul de mise
    // en page pour rien.
    return rows;
  }
  // Cumul pondéré (vous vs groupe) à mesure que les évaluations s'accumulent.
  function detailEvolutionPoints(data) {
    var totW = 0, wYou = 0, wGrp = 0, out = [];
    data.forEach(function (d) {
      if (isNaN(d.notePct) || isNaN(d.moyPct) || isNaN(d.pond) || d.pond <= 0) return;
      totW += d.pond; wYou += d.notePct * d.pond; wGrp += d.moyPct * d.pond;
      out.push({ x: r1(totW), you: r1(wYou / totW), grp: r1(wGrp / totW) });
    });
    return out;
  }
  // Zoom vertical dynamique : l'axe ne part plus systématiquement de 0. Un
  // étudiant dont les notes varient entre 70 % et 80 % voyait une ligne quasi
  // plate écrasée dans le tiers supérieur d'un graphique 0-100. On part plutôt
  // d'un peu sous la plus basse valeur (arrondie à la dizaine, jamais négatif).
  function evolFloor(pts) {
    var vals = [];
    pts.forEach(function (p) { if (!isNaN(p.you)) vals.push(p.you); if (!isNaN(p.grp)) vals.push(p.grp); });
    var minVal = vals.length ? Math.min.apply(null, vals) : 0;
    return Math.max(0, Math.floor((minVal - 5) / 10) * 10);
  }
  var _evolChart = null;
  function renderEvolChart(canvas, pts) {
    if (_evolChart) { _evolChart.destroy(); _evolChart = null; }
    var you = pts.filter(function (p) { return !isNaN(p.x) && !isNaN(p.you); }).map(function (p) { return { x: p.x, y: p.you }; });
    var grp = pts.filter(function (p) { return !isNaN(p.x) && !isNaN(p.grp); }).map(function (p) { return { x: p.x, y: p.grp }; });
    var accent = cssVar("--etsx-accent", "#1c4e89"), ink2 = cssVar("--etsx-ink-2", "#555a66"),
        ink3 = cssVar("--etsx-ink-3", "#8a8f99"), line = cssVar("--etsx-line", "#e6e9ef");
    _evolChart = new Chart(canvas, {
      type: "scatter",
      data: {
        datasets: [
          { label: "Votre moyenne", data: you, showLine: true, fill: false, lineTension: 0.1, borderWidth: 2, borderColor: accent, backgroundColor: accent, pointBackgroundColor: accent, pointBorderColor: "#fff", pointBorderWidth: 1, pointRadius: 3, pointHoverRadius: 5, pointHitRadius: 12, spanGaps: true },
          { label: "Moy. du groupe", data: grp, showLine: true, fill: false, lineTension: 0.1, borderWidth: 2, borderColor: ink3, backgroundColor: ink3, pointBackgroundColor: ink3, pointBorderColor: "#fff", pointBorderWidth: 1, pointRadius: 3, pointHoverRadius: 5, pointHitRadius: 12, spanGaps: true }
        ]
      },
      options: {
        // devicePixelRatio explicite : sans ça, un canevas redimensionné très
        // vite après sa création (avant que le navigateur n'ait posé sa taille
        // finale) peut garder un ratio approximatif — le texte des axes
        // ressort alors légèrement flou au lieu d'être net.
        responsive: true, maintainAspectRatio: false, animation: { duration: 0 },
        devicePixelRatio: window.devicePixelRatio || 1,
        scales: {
          yAxes: [{
            ticks: { suggestedMin: evolFloor(pts), suggestedMax: 100, fontColor: ink3, fontSize: 10 },
            gridLines: { color: line, zeroLineColor: line },
            scaleLabel: { display: true, labelString: "Moyenne en %", fontColor: ink2, fontSize: 11 }
          }],
          xAxes: [{
            ticks: { min: 0, max: 100, stepSize: 20, fontColor: ink3, fontSize: 10 },
            gridLines: { color: line, zeroLineColor: line },
            scaleLabel: { display: true, labelString: "Pourcentage cumulé de la note finale", fontColor: ink2, fontSize: 10.5 }
          }]
        },
        legend: { labels: { boxWidth: 12, fontColor: ink2, fontSize: 10.5 } },
        tooltips: {
          mode: "index", intersect: true,
          callbacks: {
            title: function (items, data) { return r1(data.datasets[items[0].datasetIndex].data[items[0].index].x) + "%"; },
            label: function (item, data) { return data.datasets[item.datasetIndex].label + " : " + r1(item.yLabel) + "%"; }
          }
        }
      }
    });
  }
  // On ne redessine QUE si les données ont changé. Sans ce garde-fou, applyAll
  // réécrivait innerHTML à chaque passage ; comme le MutationObserver écoute
  // document.body en childList+subtree, cette écriture le réveillait, qui relançait
  // applyAll : boucle infinie à 4 Hz sur toute page de cours. Le graphique était
  // détruit et recréé quatre fois par seconde — d'où les infobulles impossibles
  // à attraper (en plus des points SVG minuscules, trop petits pour survoler).
  var _sigDetail = "";
  function renderDetailBarChart(forcer) {
    var host = document.getElementById("etsx-detail-chart");
    if (!host) return;
    var pts = detailEvolutionPoints(readDetailEvaluations());
    var sig = JSON.stringify(pts) + "|" + settings.theme + "|" + settings.accent + "|" + settings.skin;
    if (!forcer && sig === _sigDetail && host.querySelector("canvas")) return;
    _sigDetail = sig;
    if (!pts.length) {
      if (_evolChart) { _evolChart.destroy(); _evolChart = null; }
      host.innerHTML = '<div class="etsx-chart-empty">Aucune évaluation notée.</div>';
      return;
    }
    host.innerHTML = '<div class="etsx-chart-canvaswrap"><canvas></canvas></div>';
    renderEvolChart(host.querySelector("canvas"), pts);
  }
  function makeRowsDraggable() {
    var notes = document.querySelectorAll('[aria-describedby*="grilleNotes_columnheader_3"]');
    if (!notes.length) return;
    var dragSrc = null;
    var trs = [];
    notes.forEach(function (c) { var tr = c.closest("tr"); if (tr && trs.indexOf(tr) === -1) trs.push(tr); });
    trs.forEach(function (tr) {
      if (tr.getAttribute("data-etsx-drag") === "1") return;
      tr.setAttribute("data-etsx-drag", "1");
      tr.setAttribute("draggable", "true");
      tr.classList.add("etsx-draggable");
      tr.addEventListener("dragstart", function (e) {
        dragSrc = tr; tr.classList.add("etsx-dragging");
        try { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", ""); } catch (err) {}
      });
      tr.addEventListener("dragend", function () { tr.classList.remove("etsx-dragging"); trs.forEach(function (t) { t.classList.remove("etsx-dragover"); }); });
      tr.addEventListener("dragover", function (e) { e.preventDefault(); tr.classList.add("etsx-dragover"); try { e.dataTransfer.dropEffect = "move"; } catch (err) {} });
      tr.addEventListener("dragleave", function () { tr.classList.remove("etsx-dragover"); });
      tr.addEventListener("drop", function (e) {
        e.preventDefault(); tr.classList.remove("etsx-dragover");
        if (!dragSrc || dragSrc === tr) return;
        var parent = tr.parentNode;
        var rectS = dragSrc.getBoundingClientRect(), rectT = tr.getBoundingClientRect();
        if (rectS.top < rectT.top) parent.insertBefore(dragSrc, tr.nextSibling);
        else parent.insertBefore(dragSrc, tr);
        renderDetailBarChart(true);   // l'ordre a changé : on force
      });
    });
  }

  /* ---- COMPOSITION : colonne de gauche sur la page d'un cours -------------- */
  // Ajoute la carte « Distribution » dès que la moyenne est disponible (idempotent).
  function ensureDetailDist(wrap) {
    if (wrap.querySelector(".etsx-dist-card")) return;
    var base = "ctl00_ContentPlaceHolderMain_lesOnglets_tmpl0_";
    var tot = document.getElementById(base + "txtTotal1");
    var totMoy = document.getElementById(base + "txtMoyenne");
    var totSd = document.getElementById(base + "txtEcartType");
    var moyPct = NaN, myPct = NaN, sdPct = 12;
    if (tot && totMoy) {
      // tolère « X sur un maximum de Y » ET « X/Y » (déjà reformaté par le récap)
      var mm = txt(tot).replace(/\s+/g, " ").match(/([\d.,]+)\s*(?:sur un maximum de|\/)\s*([\d.,]+)/i);
      if (mm) {
        var max = numf(mm[2]);
        if (max) {
          myPct = r1(numf(mm[1]) / max * 100);
          moyPct = r1(num(txt(totMoy)) / max * 100);
          if (!isNaN(num(txt(totSd)))) sdPct = r1(num(txt(totSd)) / max * 100);
        }
      }
    }
    // repli : depuis les évaluations notées (dernier cumul)
    if (isNaN(moyPct) || isNaN(myPct)) {
      var pts = detailEvolutionPoints(readDetailEvaluations());
      if (pts.length) { var last = pts[pts.length - 1]; if (isNaN(moyPct)) moyPct = last.grp; if (isNaN(myPct)) myPct = last.you; }
    }
    if (isNaN(moyPct)) return;
    if (isNaN(myPct)) myPct = moyPct;
    var distCard = document.createElement("div");
    distCard.className = "etsx-chart-card etsx-dist-card";
    var mode = "5"; // par défaut, comme demandé (« Écart de 5 » sélectionné au départ)
    // La légende suit le nombre de lignes réellement tracées : « Moyenne du
    // groupe » n'existe qu'en mode Courbe (voir renderDistributionChart).
    function legendHtml() {
      var html = '<span><i style="background:var(--etsx-accent)"></i>Votre moyenne</span>';
      if (mode === "courbe") html += '<span><i style="background:var(--etsx-ink-3)"></i>Moyenne du groupe</span>';
      return html;
    }
    function render() {
      renderDistributionChart(distCard.querySelector("canvas"), moyPct, sdPct, myPct, mode);
      distCard.querySelector(".etsx-dist-legend").innerHTML = legendHtml();
      distCard.querySelectorAll(".etsx-dist-mode").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-mode") === mode); });
    }
    distCard.innerHTML =
      '<div class="etsx-chart-title">Distribution estimée des notes</div>' +
      '<div class="etsx-chart-legend etsx-dist-legend"></div>' +
      '<div class="etsx-chart-canvaswrap"><canvas></canvas></div>' +
      '<div class="etsx-row-btns etsx-dist-modes">' +
        '<button type="button" class="etsx-dist-mode" data-mode="5">Écart de 5</button>' +
        '<button type="button" class="etsx-dist-mode" data-mode="10">Écart de 10</button>' +
        '<button type="button" class="etsx-dist-mode" data-mode="courbe">Courbe</button>' +
      '</div>';
    distCard.querySelectorAll(".etsx-dist-mode").forEach(function (b) {
      b.addEventListener("click", function () { mode = b.getAttribute("data-mode"); render(); });
    });
    render();
    var est = wrap.querySelector(".etsx-estimator");
    if (est) wrap.insertBefore(distCard, est); else wrap.appendChild(distCard);
    LOG("distribution : ajoutée (moy " + moyPct + "%, vous " + myPct + "%)");
  }
  function buildCourseDetailExtras() {
    if (!document.querySelector('[aria-describedby*="grilleNotes_columnheader_3"]')) return;
    var host = chartHost(); if (!host) { LOG("page d'un cours : menu de gauche introuvable"); return; }
    var wrap = document.getElementById("etsx-detail-extras");
    if (!wrap) {
      wrap = document.createElement("div"); wrap.id = "etsx-detail-extras";
      var barCard = document.createElement("div"); barCard.className = "etsx-chart-card";
      // Légende et libellés d'axes : dessinés par Chart.js à même le canevas
      // (plus besoin de les dupliquer en HTML à côté).
      barCard.innerHTML =
        '<div class="etsx-chart-title">Évolution de votre moyenne</div>' +
        '<div id="etsx-detail-chart"></div>';
      wrap.appendChild(barCard);
      wrap.appendChild(buildEstimator());
      host.appendChild(wrap);
      LOG("page d'un cours : graphiques + estimateur créés");
    }
    ensureDetailDist(wrap);
    renderDetailBarChart();
    makeRowsDraggable();
  }

  /* ---- BOUCLE -------------------------------------------------------------- */
  function applyAll() {
    applyTheme();
    buildHeader();
    manageNav();
    hideNativeHelp();
    repaintAll();
    try { bindTooltips(); } catch (e) {}
    try { buildCourseDetailExtras(); } catch (e) { LOG("buildCourseDetailExtras erreur", e); }
    try { enrichCourseList(false); } catch (e) { LOG("enrichCourseList erreur", e); }
    try { repaintList(); } catch (e) {}
    try { applyChartVisibility(); } catch (e) {}
  }
  function start() {
    applyTheme();
    var tries = 0;
    var t = setInterval(function () { applyAll(); if (++tries > 60) clearInterval(t); }, 300);
    if (document.body && "MutationObserver" in window) {
      var sched = false;
      new MutationObserver(function () { if (sched) return; sched = true; setTimeout(function () { sched = false; applyAll(); }, 250); }).observe(document.body, { childList: true, subtree: true });
    }
    if (window.ETSXSync) window.ETSXSync.subscribe(function (shared) {
      Object.assign(settings, shared);
      if (settings.skin === "harvard") settings.skin = "prestige"; // ancien nom, valeur partagée possiblement périmée
      if (!SKINS[settings.skin]) settings.skin = "classic";
      try { localStorage.setItem(LS_KEY, JSON.stringify(settings)); } catch (e) {}
      applyTheme();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
