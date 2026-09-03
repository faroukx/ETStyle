/* =============================================================================
 * ETStyle, Thème & Console de session
 * Injecté sur https://portail.etsmtl.ca/*
 * Confidentialité : tout est calculé/enregistré localement (localStorage). Rien
 * n'est collecté ni envoyé.
 * ========================================================================== */
(function () {
  "use strict";
  if (window.top !== window.self) return;

  /* CONFIGURATION */
  var CONFIG = {
    quickLinks: [
      // sameTab : SignETS est l'autre moitié de monÉTS (même thème, même
      // session), on y navigue dans le même onglet, plutôt que target="_blank"
      // qui pouvait créer un nouvel onglet hors du groupe d'onglets, voire une
      // toute nouvelle fenêtre selon la configuration du navigateur.
      { label: "SignETS",   url: "https://signets-ens.etsmtl.ca/", icon: "chart", desc: "tes notes", sameTab: true },
      { label: "ENA",       url: "https://ena.etsmtl.ca/", icon: "book", desc: "tes cours" },
      { label: "Cheminot",  url: "https://cheminotn.etsmtl.ca/", icon: "route", desc: "planifier tes cours" },
      { label: "Outlook",   url: "https://outlook.office365.com/mail/?realm=etsmtl.ca", icon: "mail", desc: "tes courriels" },
      { label: "Prélude",   url: "https://prelude.etsmtl.ca/portal/p/", icon: "key", desc: "réserver un local" },
      { label: "Stages & emplois", url: "https://see.etsmtl.ca/", icon: "briefcase", desc: "offres de stages" },
      { label: "Formulaires", url: "https://formulaires.etsmtl.ca/", icon: "doc", desc: "formulaires ÉTS" },
      { label: "Calendrier", url: "https://www.etsmtl.ca/Etudes/calendrier-universitaire", icon: "calendar", desc: "dates importantes" },
      { label: "PaperCut",  url: "https://cls.etsmtl.ca/user", icon: "printer", desc: "imprimer" }
    ],
    accents: ["#da291c", "#2563eb", "#0d9488", "#7c3aed", "#16a34a", "#475569"]
  };

  /* Logos de marque (GitHub, LinkedIn) pour le bloc « À propos », fill:currentColor,
     couleur pilotée en CSS par .etsx-about-icon (noir/blanc selon le thème). */
  var ICON_GITHUB = '<svg class="etsx-about-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"/></svg>';
  var ICON_LINKEDIN = '<svg class="etsx-about-icon" viewBox="0 0 97.75 97.75" fill="currentColor" aria-hidden="true"><path d="M48.875,0C21.882,0,0,21.882,0,48.875S21.882,97.75,48.875,97.75S97.75,75.868,97.75,48.875S75.868,0,48.875,0z M30.562,81.966h-13.74V37.758h13.74V81.966z M23.695,31.715c-4.404,0-7.969-3.57-7.969-7.968c0.001-4.394,3.565-7.964,7.969-7.964c4.392,0,7.962,3.57,7.962,7.964C31.657,28.146,28.086,31.715,23.695,31.715z M82.023,81.966H68.294V60.467c0-5.127-0.095-11.721-7.142-11.721c-7.146,0-8.245,5.584-8.245,11.35v21.869H39.179V37.758h13.178v6.041h0.185c1.835-3.476,6.315-7.14,13-7.14c13.913,0,16.481,9.156,16.481,21.059V81.966z"/></svg>';

  /* PRÉFÉRENCES */
  var LS_KEY = "etsx-settings-v3";
  // L'accent par défaut est celui du thème « classic », comme sur SignETS : sans
  // ça une installation neuve démarrait rouge sur le portail et bleue sur SignETS.
  // Écrit en dur parce que SKINS est défini plus bas dans le fichier.
  var DEFAULTS = { theme: "light", accent: "#1c4e89", sourceAccent: false, showConsole: true, hiddenNav: [], hiddenBlocks: [], collapsed: [], rememberLayout: false, sidebarHidden: false, cols: 2, bg: "", font: "", skin: "classic", coursView: "table", compact: false, clock: false, hideQuickbar: false, enabled: true };
  var settings = loadSettings();
  // Disposition temporaire par défaut : on ne restaure les blocs réduits que si demandé.
  if (!settings.rememberLayout) { settings.collapsed = []; saveSettings(); }

  function loadSettings() {
    try { var raw = localStorage.getItem(LS_KEY); return Object.assign({}, DEFAULTS, raw ? JSON.parse(raw) : {}); }
    catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function saveSettings() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(settings)); } catch (e) {}
    if (window.ETSXSync) window.ETSXSync.push({ theme: settings.theme, skin: settings.skin, accent: settings.accent, sourceAccent: settings.sourceAccent, font: settings.font });
  }

  /* COULEURS */
  var PALETTE = {
    light: { surface: "#ffffff", ink: "#1c1f26", line: "#e6e9ef" },
    dark:  { surface: "#1b1e24", ink: "#e9ebf1", line: "#2c313a" }
  };
  var FONTS = {
    "Système": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    "Sérif": "Georgia, 'Times New Roman', serif",
    "Mono": "ui-monospace, Consolas, 'Courier New', monospace",
    "Trebuchet": "'Trebuchet MS', Verdana, sans-serif",
    "Verdana": "Verdana, Geneva, sans-serif"
  };
  var SKINS = {
    classic:  { name: "ÉTS", accent: "#1c4e89", sw: ["#1c4e89", "#c41230", "#e9eef5"] },
    prestige: { name: "Prestige", accent: "#a51c30", sw: ["#a51c30", "#2a211c", "#f3eee8"] },
    minimal:  { name: "Minimal", accent: "#da291c", sw: ["#da291c", "#1c1f26", "#f1f3f7"] },
    gaming:   { name: "Gaming", accent: "#8b5cf6", sw: ["#8b5cf6", "#0a0a12", "#22d3ee"] }
  };
  // Ancien nom du skin « Prestige », et repli si un skin inconnu est enregistré :
  // sans ça data-etsx-skin pointerait vers un bloc de tokens inexistant (page
  // non stylée, aucun repli ne s'applique tant que l'attribut est posé).
  if (settings.skin === "harvard") settings.skin = "prestige";
  if (!SKINS[settings.skin]) settings.skin = "classic";
  function applyFont() {
    var d = document.documentElement;
    if (settings.font && FONTS[settings.font]) d.style.setProperty("--etsx-ui", FONTS[settings.font]);
    else d.style.removeProperty("--etsx-ui"); // "Auto" => police du thème (skin)
  }

  function hexToRgb(h) { var m = h.replace("#", ""); var n = m.length === 3 ? m.split("").map(function (c) { return c + c; }).join("") : m; return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)]; }
  function rgbToHex(r, g, b) { return "#" + [r, g, b].map(function (v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"); }).join(""); }
  function darken(hex, amt) { var c = hexToRgb(hex); return rgbToHex(c[0] * (1 - amt), c[1] * (1 - amt), c[2] * (1 - amt)); }
  function luminance(hex) { var c = hexToRgb(hex).map(function (v) { return v / 255; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }

  function applyTheme() {
    var root = document.documentElement;
    root.setAttribute("data-etsx-theme", settings.theme === "dark" ? "dark" : "light");
    root.setAttribute("data-etsx-skin", settings.skin || "classic");
    root.setAttribute("data-etsx-source-accent", settings.sourceAccent ? "1" : "0");
    var a = settings.accent || (SKINS[settings.skin] && SKINS[settings.skin].accent) || "#1c4e89";
    var rgb = hexToRgb(a);
    root.style.setProperty("--etsx-accent", a);
    root.style.setProperty("--etsx-accent-700", darken(a, 0.18));
    root.style.setProperty("--etsx-accent-soft", "rgba(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ", 0.14)");
    root.style.setProperty("--etsx-on-accent", luminance(a) > 0.62 ? "#16181d" : "#ffffff");
    // En-tête : on pointe vers les tokens (suit le skin + le thème automatiquement)
    ["header", "logo-group"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.style.setProperty("background", "var(--etsx-surface)", "important");
      el.style.setProperty("background-image", "none", "important");
    });
    var h = document.getElementById("header");
    if (h) h.style.setProperty("border-bottom", "1px solid var(--etsx-line)", "important");
  }
  function setSkin(name) {
    settings.skin = name;
    if (SKINS[name]) settings.accent = SKINS[name].accent;
    saveSettings(); applyTheme();
    document.querySelectorAll("#etsx-settings .etsx-skin").forEach(function (c) { c.classList.toggle("is-active", c.getAttribute("data-skin") === name); });
    document.querySelectorAll(".etsx-swatch[data-accent]").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-accent") === settings.accent); });
    document.querySelectorAll(".etsx-swatch-custom").forEach(function (custom) { custom.style.background = settings.accent; });
  }

  /* VUES DU BLOC COURS : table (natif) | gallery (cartes) | board (liste-cartes) */
  function applyCoursView() {
    var cours = document.getElementById("wid-id-cours"); if (!cours) return;
    var wb = cours.querySelector(".widget-body"); if (!wb) return;
    var table = cours.querySelector("table"); if (!table) return;
    var view = settings.coursView || "table";
    var existing = wb.querySelector(".etsx-cours-view");
    if (view === "table") {
      if (existing) existing.remove();
      table.style.display = "";
      cours.removeAttribute("data-etsx-cv");
      return;
    }
    // On ne garde que les VRAIES lignes de cours : 4+ cellules avec un code en
    // 2e colonne. On écarte les lignes « Horaire général » (1 cellule, colspan)
    // et toute ligne d'en-tête/section qui produisait des cartes « Cours » vides.
    var courseRows = [].filter.call(table.querySelectorAll("tbody tr"), function (tr) {
      var c = tr.children;
      return c.length >= 4 && c[1] && c[1].textContent.trim() && !tr.querySelector("td[colspan]");
    });
    var nRows = courseRows.length;
    // idempotent : ne reconstruit que si la vue ou le nb de cartes a changé
    if (existing && cours.getAttribute("data-etsx-cv") === view && existing.children.length === nRows) return;
    if (existing) existing.remove();
    table.style.display = "none";
    var wrap = document.createElement("div");
    wrap.className = "etsx-cours-view etsx-cv-" + view;
    courseRows.forEach(function (tr) {
      var cells = tr.children;
      var codeCell = cells[1], coteCell = cells[2], linkCell = cells[3];
      var codeHtml = codeCell ? codeCell.innerHTML.trim() : "";
      if (!codeHtml) return; // sécurité : pas de carte « Cours » générique
      var cote = coteCell ? coteCell.textContent.trim() : "";
      var card = document.createElement("div"); card.className = "etsx-course-card";
      var head = document.createElement("div"); head.className = "etsx-cc-head";
      head.innerHTML = '<span class="etsx-cc-code">' + codeHtml + '</span>' + (cote ? '<span class="etsx-cc-cote">' + cote + '</span>' : '');
      card.appendChild(head);
      var foot = document.createElement("div"); foot.className = "etsx-cc-links";
      var ul = linkCell ? linkCell.querySelector("ul, .list-inline") : null;
      if (ul) foot.appendChild(ul.cloneNode(true));
      card.appendChild(foot);
      wrap.appendChild(card);
    });
    wb.appendChild(wrap);
    cours.setAttribute("data-etsx-cv", view);
  }

  /* ICÔNES */
  function icon(name) {
    function svg(inner) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>'; }
    switch (name) {
      case "chart": return svg('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>');
      case "book": return svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>');
      case "route": return svg('<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H14a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/>');
      case "clock": return svg('<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>');
      case "key": return svg('<circle cx="7.5" cy="15.5" r="4"/><path d="M10.3 12.7 20 3"/><path d="M16 7l3 3"/>');
      case "pin": return svg('<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>');
      case "mail": return svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>');
      case "printer": return svg('<path d="M6 9V3h12v6"/><rect x="6" y="13" width="12" height="8"/><path d="M6 17H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/>');
      case "chat": return svg('<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>');
      case "briefcase": return svg('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>');
      case "doc": return svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>');
      case "calendar": return svg('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>');
      case "logout": return svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>');
      case "sliders": return svg('<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>');
      case "expand": return svg('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>');
      case "gear": return svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>');
      case "sun": return svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>');
      case "moon": return svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>');
      case "grip": return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>';
      case "chevron": return svg('<polyline points="6 9 12 15 18 9"/>');
      case "sidebar": return svg('<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="9" y1="4" x2="9" y2="20"/>');
      default: return svg('<circle cx="12" cy="12" r="9"/>');
    }
  }

  /* =========================================================================
   * CALENDRIER ÉTS, moteur de sessions
   * -------------------------------------------------------------------------
   * Trois sessions par année : Hiver, Été, Automne, séparées par des congés.
   *
   * Les dates NE se déduisent PAS d'une formule : l'ÉTS les fixe par comité.
   * Preuve, premier jour de cours à l'automne : mardi 2 septembre 2025,
   * lundi 31 août 2026, mercredi 1er septembre 2027. Aucune règle simple ne
   * produit ces trois-là. D'où deux niveaux :
   *
   *   1. OFFICIEL, dates relevées sur etsmtl.ca/etudes/calendrier-universitaire.
   *                 Elles gagnent toujours.
   *   2. ESTIMÉ, règles générées pour toute année absente du tableau, sans
   *                 limite dans le temps. Signalé par « ≈ » à l'affichage.
   *
   * Arithmétique des dates : tout passe par des jours entiers comptés depuis
   * minuit local. `new Date(a, m, j + n)` normalise les débordements de mois et
   * d'année, donc le 29 février des années bissextiles est exact sans cas
   * particulier. Les écarts sont arrondis, ce qui absorbe les deux changements
   * d'heure annuels (les journées de 23 h et de 25 h).
   * ====================================================================== */
  var DAY_MS = 86400000;
  var DOW = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  var SAISONS = ["hiver", "ete", "automne"];
  var NOM_SAISON = { hiver: "Hiver", ete: "Été", automne: "Automne" };

  // cours = 1er jour de cours ; exam = [1er, dernier] jour d'examens finaux ;
  // relache = plages [du, au] sans cours (bornes incluses).
  var CAL_OFFICIEL = {
    "2026-ete":     { cours: "2026-05-04", exam: ["2026-08-06", "2026-08-15"], relache: [] },
    "2026-automne": { cours: "2026-08-31", exam: ["2026-12-08", "2026-12-18"],
                      relache: [["2026-09-10", "2026-09-10"], ["2026-10-05", "2026-10-05"],
                                ["2026-10-09", "2026-10-10"], ["2026-10-13", "2026-10-13"]] },
    "2027-hiver":   { cours: "2027-01-05", exam: ["2027-04-16", "2027-04-27"],
                      relache: [["2027-03-01", "2027-03-07"]] },
    "2027-ete":     { cours: "2027-05-03", exam: ["2027-08-09", "2027-08-18"],
                      relache: [["2027-06-25", "2027-06-25"], ["2027-07-02", "2027-07-02"]] },
    "2027-automne": { cours: "2027-09-01", exam: ["2027-12-09", "2027-12-21"],
                      relache: [["2027-09-09", "2027-09-09"], ["2027-10-08", "2027-10-09"],
                                ["2027-10-12", "2027-10-12"], ["2027-12-08", "2027-12-08"]] }
  };

  function atMidnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function sameDay(a, b) { return atMidnight(a).getTime() === atMidnight(b).getTime(); }
  function pad2(n) { return String(n).padStart(2, "0"); }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function mondayOf(d) { var x = atMidnight(d); var wd = (x.getDay() + 6) % 7; x.setDate(x.getDate() - wd); return x; }

  function ymd(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function joursEntre(a, b) { return Math.round((atMidnight(b) - atMidnight(a)) / DAY_MS); }
  function lundiOuApres(d) { var x = atMidnight(d), wd = (x.getDay() + 6) % 7; return wd === 0 ? x : addDays(x, 7 - wd); }
  function premierLundi(a, mois) { return lundiOuApres(new Date(a, mois - 1, 1)); }
  function ouvrableOuApres(d) { var x = atMidnight(d); while (x.getDay() === 0 || x.getDay() === 6) x = addDays(x, 1); return x; }
  function dansPlage(j, p) { return joursEntre(p[0], j) >= 0 && joursEntre(j, p[1]) >= 0; }
  // Pas de capitale : toujours employée en milieu de phrase (« commence le lundi 31 août »).
  function dateLongue(d) { return d.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" }); }

  // Règles de repli, calées sur les sessions officielles connues :
  //   Été, premier lundi de mai (exact pour 2025, 2026 et 2027).
  //   Hiver, premier jour ouvrable à partir du 5 janvier (exact pour 2027).
  //   Automne, lundi de la semaine du 1er septembre ; si ce lundi est la fête
  //             du Travail, on démarre le mardi (exact pour 2025 et 2026).
  // Durée retenue : 14 semaines de cours plus les semaines de relâche, puis
  // 11 jours d'examens, la moyenne des cinq sessions officielles.
  function estimerSession(annee, saison) {
    var cours, relache = [];
    if (saison === "hiver") {
      cours = ouvrableOuApres(new Date(annee, 0, 5));
      var r = premierLundi(annee, 3);
      relache.push([r, addDays(r, 6)]);
    } else if (saison === "ete") {
      cours = premierLundi(annee, 5);
    } else {
      var l = mondayOf(new Date(annee, 8, 1));
      cours = sameDay(l, premierLundi(annee, 9)) ? addDays(l, 1) : l;
    }
    var off = 0;
    relache.forEach(function (p) { off += joursEntre(p[0], p[1]) + 1; });
    var debutExam = addDays(cours, 98 + off);
    return { cours: cours, exam: [debutExam, addDays(debutExam, 11)], relache: relache, officiel: false };
  }

  function sessionDe(annee, saison) {
    var o = CAL_OFFICIEL[annee + "-" + saison], s;
    if (o) {
      s = {
        cours: ymd(o.cours), exam: [ymd(o.exam[0]), ymd(o.exam[1])], officiel: true,
        relache: o.relache.map(function (p) { return [ymd(p[0]), ymd(p[1])]; })
      };
    } else s = estimerSession(annee, saison);
    s.cle = annee + "-" + saison; s.saison = saison; s.annee = annee; s.nom = NOM_SAISON[saison];
    s.finCours = addDays(s.exam[0], -1);
    // Une relâche d'au moins 5 jours consécutifs est une SEMAINE sans cours :
    // elle décale la numérotation. Les congés isolés (un férié, une journée
    // d'activités) ne la décalent pas, l'ÉTS ne renumérote pas pour un lundi.
    s.semainesOff = s.relache.filter(function (p) { return joursEntre(p[0], p[1]) + 1 >= 5; });
    s.joursOff = 0;
    s.semainesOff.forEach(function (p) { s.joursOff += joursEntre(p[0], p[1]) + 1; });
    // Une semaine académique va du lundi au dimanche : on compte des semaines de
    // CALENDRIER, pas des tranches de 7 jours depuis le début. Sans ça, une session
    // qui démarre un mardi (hiver 2027) décalait tout d'une semaine.
    s.total = Math.max(1,
      joursEntre(mondayOf(s.cours), mondayOf(s.finCours)) / 7 + 1 - s.semainesOff.length);
    return s;
  }

  // Les sessions de l'année précédente, courante et suivante, en ordre
  // chronologique : de quoi situer n'importe quelle date, y compris pendant le
  // congé de fin décembre qui chevauche deux années civiles.
  function sessionsAutour(annee) {
    var out = [];
    [annee - 1, annee, annee + 1].forEach(function (y) {
      SAISONS.forEach(function (sa) { out.push(sessionDe(y, sa)); });
    });
    return out;
  }

  // État du jour : "cours" | "relache" | "examens" | "conge".
  function etatSession(today) {
    var j = atMidnight(today), list = sessionsAutour(j.getFullYear());
    for (var i = 0; i < list.length; i++) {
      var s = list[i];

      // Avant le premier jour de cours → congé entre la session précédente et celle-ci.
      if (joursEntre(j, s.cours) > 0) {
        var prec = list[i - 1] || null;
        var debut = prec ? addDays(prec.exam[1], 1) : addDays(s.cours, -21);
        var duree = Math.max(1, joursEntre(debut, s.cours));
        var faits = clamp(joursEntre(debut, j), 0, duree);
        return { etat: "conge", sess: s, prec: prec, restant: joursEntre(j, s.cours),
                 fraction: faits / duree, segTotal: duree,
                 segCourant: clamp(faits + 1, 1, duree) };
      }

      // Dans la session (jusqu'au dernier jour d'examens inclus).
      if (joursEntre(j, s.exam[1]) >= 0) {
        var enExam = joursEntre(s.exam[0], j) >= 0;

        // Une SEMAINE de relâche (≥ 5 jours) suspend la session ; un congé ISOLé
        // (fête du Travail, Action de grâce, journée d'activités) est juste une
        // journée sans cours, la session, elle, continue.
        var enRelache = null, ferie = null;
        s.semainesOff.forEach(function (p) { if (dansPlage(j, p)) enRelache = p; });
        if (!enRelache) s.relache.forEach(function (p) { if (dansPlage(j, p)) ferie = p; });

        // Semaine courante, alignée sur les lundis, moins les semaines de relâche
        // déjà entièrement passées.
        var lundi = mondayOf(j);
        var sem = joursEntre(mondayOf(s.cours), lundi) / 7 + 1;
        s.semainesOff.forEach(function (p) { if (joursEntre(mondayOf(p[0]), lundi) > 0) sem--; });
        sem = clamp(sem, 1, s.total);

        return {
          etat: enExam ? "examens" : enRelache ? "relache" : "cours",
          sess: s, semaine: sem, ferie: ferie,
          reprise: enRelache ? addDays(enRelache[1], 1) : null,
          restant: enExam ? joursEntre(j, s.exam[1]) : Math.max(0, s.total - sem),
          fraction: clamp(joursEntre(s.cours, j) / Math.max(1, joursEntre(s.cours, s.exam[1])), 0, 1),
          segTotal: s.total, segCourant: enExam ? s.total : sem
        };
      }
    }
    return null; // hors de portée : ne devrait pas arriver
  }

  function greetingWord(d) { var h = d.getHours(); return h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir"; }

  /* EN-TÊTE : marque + contrôles de réglage (paramètres tout en haut) */
  function ensureHeader() {
    var pr = document.querySelector("#top-right .pull-right");
    if (pr && !document.getElementById("etsx-hdr")) {
      pr.insertBefore(buildHdrControls(), pr.firstChild);
    }
    var hdr = document.getElementById("header");
    if (hdr && !document.getElementById("etsx-accents-left")) hdr.appendChild(buildLeftAccents());
    if (hdr && !document.getElementById("etsx-brand")) hdr.appendChild(buildBrand());
    var us = document.querySelector("#etsx-hdr .etsx-user");
    if (us) { var u = getUserInfo(); if (u.name && us.getAttribute("data-name") !== u.name) { us.innerHTML = "<b>" + u.name + "</b>" + (u.code ? "<small>" + u.code + "</small>" : ""); us.setAttribute("data-name", u.name); } }
  }

  function portalAction(test) {
    var as = document.querySelectorAll("#header #profile-menu a, #header .header-dropdown-list a");
    for (var i = 0; i < as.length; i++) { try { if (test(as[i])) return as[i]; } catch (e) {} }
    return null;
  }
  function isLogout(a) { return /authentification/i.test(a.getAttribute("href") || "") || /déconnex/i.test(a.textContent || ""); }
  function isConfig(a) { var i = a.querySelector("i"); return (i && /fa-cog/.test(i.className)) || /configuration/i.test(a.textContent || ""); }
  function isFullscreen(a) { var i = a.querySelector("i"); return (i && /fa-arrows-alt/.test(i.className)) || /plein/i.test(a.textContent || ""); }
  function getUserInfo() {
    var els = document.querySelectorAll("#header .txt-color-white");
    var t = "";
    for (var i = 0; i < els.length; i++) { var x = (els[i].textContent || "").replace(/\s+/g, " ").trim(); if (x) { t = x; break; } }
    if (!t) return { name: "", code: "" };
    var m = t.match(/[A-Za-z]+\\[A-Za-z0-9]+/);
    var code = m ? m[0] : "";
    var name = t.replace(code, "").replace(/\s*,\s*/, ", ").trim();
    return { name: name, code: code };
  }

  // Disposition en trois pièces indépendantes plutôt qu'une seule barre flex
  // unifiée : le chevauchement avec le menu de gauche est réglé autrement,
  // en retirant complètement #logo-group (voir content.css).
  function buildHdrControls() {
    var box = document.createElement("div");
    box.id = "etsx-hdr";
    var u = getUserInfo();
    box.innerHTML =
      '<button class="etsx-btn" id="etsx-sidebar-btn" title="Masquer / afficher le menu de gauche">' + icon("sidebar") + '</button>' +
      '<span class="etsx-hdr-sep"></span>' +
      '<button class="etsx-btn" id="etsx-gear-btn" title="Paramètres">' + icon("gear") + '<span>Paramètres</span></button>' +
      '<button class="etsx-btn etsx-icon-only" id="etsx-config-btn" title="Configurations">' + icon("sliders") + '</button>' +
      '<span class="etsx-user"><b>' + (u.name || "") + '</b>' + (u.code ? '<small>' + u.code + '</small>' : '') + '</span>' +
      '<button class="etsx-btn etsx-icon-only" id="etsx-logout-btn" title="Déconnexion">' + icon("logout") + '</button>';
    box.querySelector("#etsx-sidebar-btn").addEventListener("click", toggleSidebar);
    box.querySelector("#etsx-gear-btn").addEventListener("click", toggleSettings);
    box.querySelector("#etsx-config-btn").addEventListener("click", function () { var a = portalAction(isConfig); if (a) a.click(); });
    box.querySelector("#etsx-logout-btn").addEventListener("click", function () { var a = portalAction(isLogout); if (a) a.click(); else location.href = "/authentification/"; });
    return box;
  }

  // À gauche de l'en-tête : bascule clair/sombre + pastilles d'accent (comme
  // SignETS). Collées au bord (left:16px), #logo-group n'existe plus, plus
  // besoin de deviner une largeur à éviter.
  function buildLeftAccents() {
    var box = document.createElement("div");
    box.id = "etsx-accents-left";
    var swatches = "";
    CONFIG.accents.forEach(function (c) {
      swatches += '<button class="etsx-swatch' + (c === settings.accent ? " is-active" : "") + '" data-accent="' + c + '" style="background:' + c + '" title="' + c + '"></button>';
    });
    box.innerHTML =
      '<button class="etsx-btn etsx-icon-only" id="etsx-theme-btn" title="Clair / sombre">' + (settings.theme === "dark" ? icon("sun") : icon("moon")) + '</button>' +
      '<div class="etsx-swatches">' + swatches +
      '<span class="etsx-swatch etsx-swatch-custom" style="background:' + settings.accent + '" title="Couleur personnalisée"><input type="color" value="' + settings.accent + '"></span></div>';
    box.querySelector("#etsx-theme-btn").addEventListener("click", toggleTheme);
    box.querySelectorAll(".etsx-swatch[data-accent]").forEach(function (b) { b.addEventListener("click", function () { setAccent(b.getAttribute("data-accent")); }); });
    box.querySelector(".etsx-swatch-custom input").addEventListener("input", function (e) { setAccent(e.target.value); });
    return box;
  }
  function buildBrand() {
    var b = document.createElement("a");
    b.id = "etsx-brand";
    b.href = "https://portail.etsmtl.ca/home";
    b.title = "Accueil monÉTS";
    b.innerHTML = '<span class="etsx-brand-name">mon<span class="etsx-red">ÉTS</span></span><span class="etsx-brand-sub">Portail étudiant</span>';
    return b;
  }

  function setAccent(c) {
    settings.accent = c; saveSettings(); applyTheme();
    document.querySelectorAll(".etsx-swatch[data-accent]").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-accent") === c); });
    document.querySelectorAll(".etsx-swatch-custom").forEach(function (custom) { custom.style.background = c; });
  }
  function toggleTheme() {
    settings.theme = settings.theme === "dark" ? "light" : "dark"; saveSettings(); applyTheme();
    var btn = document.getElementById("etsx-theme-btn"); if (btn) btn.innerHTML = settings.theme === "dark" ? icon("sun") : icon("moon");
  }

  /* MASQUER / AFFICHER LA BARRE DE GAUCHE */
  function applySidebar() { document.documentElement.classList.toggle("etsx-no-sidebar", !!settings.sidebarHidden); }
  function applyQuickbar() { document.documentElement.classList.toggle("etsx-no-quickbar", !!settings.hideQuickbar); }
  function toggleSidebar() { settings.sidebarHidden = !settings.sidebarHidden; saveSettings(); applySidebar(); syncSettingsPanel(); }

  /* ACCUEIL seulement (console) */
  function isHome() { var p = location.pathname.replace(/\/+$/, ""); return p === "/home" || p === "" || p === "/"; }

  function fixNavIcons() {
    document.querySelectorAll("#left-panel nav > ul > li > a > i").forEach(function (i) {
      if (i.__etsxFixed) return;
      var bg = getComputedStyle(i).backgroundImage;
      if (bg && bg !== "none") {
        i.style.backgroundSize = "16px 16px"; i.style.backgroundRepeat = "no-repeat";
        i.style.backgroundPosition = "center"; i.style.width = "18px"; i.style.height = "18px"; i.style.fontSize = "0";
        i.__etsxFixed = true;
      }
    });
  }

  /* CALENDRIER : FullCalendar v3 rend 0px s'il est initialisé replié.
     On le déplie une fois et on force le rendu pour qu'il s'affiche. */
  function fixCalendar() {
    if (!window.jQuery) return false;
    var cal = document.getElementById("wid-id-calendrier"); if (!cal) return false;
    var fc = cal.querySelector(".fc"); if (!fc) return false;
    if (cal.classList.contains("jarviswidget-collapsed")) cal.classList.remove("jarviswidget-collapsed");
    var pc = cal.querySelector(".portlet-content"); if (pc && getComputedStyle(pc).display === "none") pc.style.display = "";
    var wb = cal.querySelector(".widget-body"); if (wb && getComputedStyle(wb).display === "none") wb.style.display = "";
    cal.style.overflow = "visible"; // sinon les menus Sources/Affichage sont rognés
    if (fc.offsetHeight < 40) { try { window.jQuery(fc).fullCalendar("render"); } catch (e) {} }
    return fc.offsetHeight > 40;
  }

  /* HORAIRE GÉNÉRAL : le tableau « Cours » contient un FullCalendar (jours de la
     semaine) qui, replié au départ, se rend à 0px. Quand on le déplie, on force
     le rendu pour que les jours réapparaissent, sans toucher au reste de l'UI. */
  function fixInnerCalendars(scopeEl) {
    if (!window.jQuery) return;
    var scope = scopeEl || document.getElementById("wid-id-cours");
    if (!scope) return;
    [].forEach.call(scope.querySelectorAll(".fc"), function (fc) {
      if (fc.offsetParent === null) return;       // encore caché : on attend
      if (fc.offsetHeight < 40) { try { window.jQuery(fc).fullCalendar("render"); } catch (e) {} }
    });
  }

  function applyAdvanced() {
    var root = document.documentElement;
    root.classList.toggle("etsx-compact", !!settings.compact);
    // Horloge retirée : fonctionnalité inutile dans l'en-tête.
    var clk = document.getElementById("etsx-clock");
    if (clk) clk.remove();
    if (window.__etsxClock) { clearInterval(window.__etsxClock); window.__etsxClock = null; }
  }

  /* FOND D'ÉCRAN personnalisé */
  function applyBackground() {
    var root = document.documentElement;
    if (settings.bg) { root.style.setProperty("--etsx-bg-img", 'url("' + settings.bg.replace(/"/g, "%22") + '")'); root.classList.add("etsx-has-bg"); }
    else { root.classList.remove("etsx-has-bg"); root.style.removeProperty("--etsx-bg-img"); }
  }
  function setBackground(v) { settings.bg = v || ""; saveSettings(); applyBackground(); }

  /* PANNEAU PARAMÈTRES */
  function navKey(txt) { return txt.trim().replace(/\s+/g, " ").toLowerCase(); }

  function toggleSettings() {
    var existing = document.getElementById("etsx-settings");
    if (existing) { existing.remove(); return; }
    var panel = buildSettings();
    document.body.appendChild(panel);
    setTimeout(function () {
      function onDoc(e) {
        var gear = e.target.closest ? e.target.closest("#etsx-gear-btn") : null;
        if (!panel.contains(e.target) && !gear) { panel.remove(); document.removeEventListener("click", onDoc); }
      }
      document.addEventListener("click", onDoc);
    }, 0);
  }
  function syncSettingsPanel() {
    var sb = document.getElementById("etsx-opt-sidebar"); if (sb) sb.checked = !settings.sidebarHidden; var qb2 = document.getElementById("etsx-opt-quickbar"); if (qb2) qb2.checked = !settings.hideQuickbar;
  }

  function buildSettings() {
    var p = document.createElement("div");
    p.id = "etsx-settings";
    var navItems = [];
    document.querySelectorAll("#left-panel nav > ul > li").forEach(function (li) {
      var a = li.querySelector(":scope > a"); var span = a ? a.querySelector(".menu-item-parent") : null;
      var txt = (span ? span.textContent : a ? a.textContent : "").trim().replace(/\s+/g, " ");
      if (txt) navItems.push({ key: navKey(txt), label: txt });
    });
    var blocks = [];
    document.querySelectorAll("#widget-grid .jarviswidget").forEach(function (w) {
      var h2 = w.querySelector("header h2");
      blocks.push({ id: w.id, label: h2 ? h2.textContent.trim().replace(/\s+/g, " ") : w.id });
    });
    var navRows = "";
    navItems.forEach(function (it) { navRows += '<label class="etsx-check"><input type="checkbox" data-nav="' + it.key + '" ' + (settings.hiddenNav.indexOf(it.key) === -1 ? "checked" : "") + '><span>' + it.label + '</span></label>'; });
    if (!navRows) navRows = '<div class="etsx-set-note">Menu indisponible pour le moment.</div>';
    var blockRows = "";
    blocks.forEach(function (b) { blockRows += '<label class="etsx-check"><input type="checkbox" data-block="' + b.id + '" ' + (settings.hiddenBlocks.indexOf(b.id) === -1 ? "checked" : "") + '><span>' + b.label + '</span></label>'; });
    if (!blockRows) blockRows = '<div class="etsx-set-note">Aucun bloc détecté.</div>';

    var skinCards = Object.keys(SKINS).map(function (k) {
      var sk = SKINS[k];
      var sw = sk.sw.map(function (c) { return '<span style="background:' + c + '"></span>'; }).join("");
      return '<div class="etsx-skin' + (settings.skin === k ? " is-active" : "") + '" data-skin="' + k + '"><div class="etsx-skin-sw">' + sw + '</div><div class="etsx-skin-name">' + sk.name + '</div></div>';
    }).join("");
    p.innerHTML =
      '<div class="etsx-set-title">Thème d\'interface</div>' +
      '<div class="etsx-skins">' + skinCards + '</div>' +
      '<div class="etsx-set-title">Vue du bloc « Cours »</div>' +
      '<div class="etsx-row-btns" id="etsx-coursview">' +
        '<button type="button" class="etsx-fontbtn" data-cv="table">Tableau</button>' +
        '<button type="button" class="etsx-fontbtn" data-cv="gallery">Galerie</button>' +
        '<button type="button" class="etsx-fontbtn" data-cv="board">Liste</button>' +
      '</div>' +
      '<div class="etsx-set-title">Affichage</div>' +
      '<label class="etsx-check"><input type="checkbox" id="etsx-opt-sidebar" ' + (settings.sidebarHidden ? "" : "checked") + '><span>Afficher la barre de gauche</span></label>' +
      '<label class="etsx-check"><input type="checkbox" id="etsx-opt-quickbar" ' + (settings.hideQuickbar ? "" : "checked") + '><span>Afficher la barre de raccourcis</span></label>' +
      '<label class="etsx-check"><input type="checkbox" id="etsx-opt-console" ' + (settings.showConsole ? "checked" : "") + '><span>Afficher la console de session</span></label>' +
      '<label class="etsx-check"><input type="checkbox" id="etsx-opt-remember" ' + (settings.rememberLayout ? "checked" : "") + '><span>Garder les blocs réduits (mémoriser)</span></label>' +
      '<label class="etsx-check"><input type="checkbox" id="etsx-opt-source" ' + (settings.sourceAccent ? "checked" : "") + '><span>Teinter les sources du calendrier selon l’accent</span></label>' +
      '<div class="etsx-set-title">Compte & langue</div>' +
      '<div class="etsx-row-btns">' +
        '<button type="button" class="etsx-btn" id="etsx-act-lang">Langue (EN/FR)</button>' +
        '<button type="button" class="etsx-btn" id="etsx-act-fs">Plein écran</button>' +
      '</div>' +
      '<div class="etsx-set-title">Police</div>' +
      '<div class="etsx-row-btns" id="etsx-fonts"></div>' +
      '<div class="etsx-set-title">Fond d\'écran</div>' +
      '<input type="text" id="etsx-bg-url" class="etsx-input" placeholder="Coller une URL d\'image..." value="' + (/^https?:/.test(settings.bg || "") ? settings.bg : "") + '">' +
      '<div class="etsx-row-btns">' +
        '<button type="button" class="etsx-btn etsx-bg-apply">Appliquer</button>' +
        '<label class="etsx-btn etsx-bg-file">Fichier<input type="file" accept="image/*" hidden></label>' +
        '<button type="button" class="etsx-btn etsx-bg-clear">Retirer</button>' +
      '</div>' +
      '<div class="etsx-set-title">Menu de gauche</div>' + navRows +
      '<div class="etsx-set-title">Blocs du tableau de bord</div>' + blockRows +
      '<div class="etsx-set-title">Fonctions avancées</div>' +
      '<label class="etsx-check"><input type="checkbox" id="etsx-opt-compact" ' + (settings.compact ? "checked" : "") + '><span>Mode compact</span></label>' +
      '<div class="etsx-set-note">Chaque bloc se réduit aussi via le chevron de son en-tête. Par défaut l’état revient au rechargement ; coche « mémoriser » pour le garder.</div>' +
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

    p.querySelector("#etsx-opt-sidebar").addEventListener("change", function (e) { settings.sidebarHidden = !e.target.checked; saveSettings(); applySidebar(); });
    var qbOpt = p.querySelector("#etsx-opt-quickbar"); if (qbOpt) qbOpt.addEventListener("change", function (e) { settings.hideQuickbar = !e.target.checked; saveSettings(); applyQuickbar(); });
    p.querySelector("#etsx-opt-console").addEventListener("change", function (e) {
      settings.showConsole = e.target.checked; saveSettings();
      var c = document.getElementById("etsx-console");
      if (!settings.showConsole && c) c.remove();
      if (settings.showConsole && !c) injectConsole();
    });
    p.querySelector("#etsx-opt-remember").addEventListener("change", function (e) {
      settings.rememberLayout = e.target.checked;
      if (settings.rememberLayout) { settings.collapsed = currentCollapsedIds(); }
      saveSettings();
    });
    p.querySelector("#etsx-opt-source").addEventListener("change", function (e) { settings.sourceAccent = e.target.checked; saveSettings(); applyTheme(); });
    p.querySelectorAll("input[data-nav]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var k = cb.getAttribute("data-nav");
        settings.hiddenNav = settings.hiddenNav.filter(function (x) { return x !== k; });
        if (!cb.checked) settings.hiddenNav.push(k);
        saveSettings(); applyNavHide();
      });
    });
    p.querySelectorAll("input[data-block]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var id = cb.getAttribute("data-block");
        settings.hiddenBlocks = settings.hiddenBlocks.filter(function (x) { return x !== id; });
        if (!cb.checked) settings.hiddenBlocks.push(id);
        saveSettings(); applyBlockHide();
      });
    });
    var langBtn = p.querySelector("#etsx-act-lang");
    if (langBtn) langBtn.addEventListener("click", function () {
      var a = document.querySelector("#header ul.header-dropdown-list.btn-header a") || portalAction(function (x) { return /^(EN|FR)$/i.test((x.textContent || "").trim()); });
      if (a) a.click();
    });
    var fsBtn = p.querySelector("#etsx-act-fs");
    if (fsBtn) fsBtn.addEventListener("click", function () { var a = portalAction(isFullscreen); if (a) a.click(); });
    var fbox = p.querySelector("#etsx-fonts");
    var fontKeys = [""].concat(Object.keys(FONTS));
    fontKeys.forEach(function (name) {
      var fb = document.createElement("button");
      fb.type = "button"; fb.className = "etsx-fontbtn" + ((settings.font || "") === name ? " is-active" : "");
      fb.textContent = name === "" ? "Auto" : name; if (name) fb.style.fontFamily = FONTS[name];
      fb.addEventListener("click", function () {
        settings.font = name; saveSettings(); applyFont();
        fbox.querySelectorAll(".etsx-fontbtn").forEach(function (x) { x.classList.toggle("is-active", x === fb); });
      });
      fbox.appendChild(fb);
    });
    p.querySelectorAll(".etsx-skin").forEach(function (c) { c.addEventListener("click", function () { setSkin(c.getAttribute("data-skin")); }); });
    p.querySelectorAll("#etsx-coursview .etsx-fontbtn").forEach(function (b) {
      b.classList.toggle("is-active", (settings.coursView || "table") === b.getAttribute("data-cv"));
      b.addEventListener("click", function () {
        settings.coursView = b.getAttribute("data-cv"); saveSettings(); applyCoursView();
        p.querySelectorAll("#etsx-coursview .etsx-fontbtn").forEach(function (x) { x.classList.toggle("is-active", x === b); });
      });
    });
    p.querySelector(".etsx-bg-apply").addEventListener("click", function () { setBackground(p.querySelector("#etsx-bg-url").value.trim()); });
    p.querySelector(".etsx-bg-clear").addEventListener("click", function () { setBackground(""); var i = p.querySelector("#etsx-bg-url"); if (i) i.value = ""; });
    p.querySelector(".etsx-bg-file input").addEventListener("change", function (e) {
      var file = e.target.files[0]; if (!file) return;
      if (file.size > 2600000) { alert("Image trop lourde (max ~2,5 Mo). Utilise plutôt une URL."); return; }
      var rd = new FileReader(); rd.onload = function () { setBackground(rd.result); }; rd.readAsDataURL(file);
    });
    var adv = function (id, key) { var el = p.querySelector(id); if (el) el.addEventListener("change", function (e) { settings[key] = e.target.checked; saveSettings(); applyAdvanced(); }); };
    adv("#etsx-opt-compact", "compact");
    return p;
  }

  function applyNavHide() {
    document.querySelectorAll("#left-panel nav > ul > li").forEach(function (li) {
      var a = li.querySelector(":scope > a"); var span = a ? a.querySelector(".menu-item-parent") : null;
      var txt = (span ? span.textContent : a ? a.textContent : "").trim().replace(/\s+/g, " ");
      li.style.display = settings.hiddenNav.indexOf(navKey(txt)) !== -1 ? "none" : "";
    });
  }

  /* Descriptions minimales sous chaque icône du menu de gauche */
  function shortLabel(t) {
    var s = (t || "").toLowerCase();
    var map = [["tableau", "Accueil"], ["dossier", "Dossier"], ["admission", "Admission"],
      ["document", "Documents"], ["frais", "Frais"], ["cérémon", "Cérémonies"], ["ceremon", "Cérémonies"],
      ["techno", "Parcours"], ["formulaire", "Formulaires"], ["actualit", "Actualités"],
      ["agu", "AguÉTS"], ["apps", "Apps"], ["anywhere", "Apps"], ["google", "Google"],
      ["soutien", "Soutien"], ["support", "Soutien"], ["technique", "Soutien"],
      ["paramèt", "Réglages"], ["paramet", "Réglages"], ["réglage", "Réglages"],
      ["aide", "Aide"]];
    for (var i = 0; i < map.length; i++) { if (s.indexOf(map[i][0]) !== -1) return map[i][1]; }
    var first = (t || "").trim().split(/\s+/)[0] || "";
    return first.length > 12 ? first.slice(0, 11) + "…" : first;
  }
  function addNavCaptions() {
    document.querySelectorAll("#left-panel nav > ul > li > a").forEach(function (a) {
      if (a.querySelector(".etsx-nav-cap")) return;
      var span = a.querySelector(".menu-item-parent");
      var txt = (span ? span.textContent : a.textContent || "").trim().replace(/\s+/g, " ");
      if (!txt) return;
      var cap = document.createElement("span");
      cap.className = "etsx-nav-cap";
      cap.textContent = shortLabel(txt);
      a.setAttribute("title", txt);
      a.appendChild(cap);
    });
  }
  function applyBlockHide() {
    document.querySelectorAll("#widget-grid .jarviswidget").forEach(function (w) { w.style.display = settings.hiddenBlocks.indexOf(w.id) !== -1 ? "none" : ""; });
  }

  /* RÉDUCTION DES BLOCS (chevron injecté) */
  function currentCollapsedIds() {
    var ids = [];
    document.querySelectorAll("#widget-grid .jarviswidget.etsx-collapsed").forEach(function (w) { if (w.id) ids.push(w.id); });
    var c = document.getElementById("etsx-console");
    if (c && c.classList.contains("etsx-collapsed")) ids.push("etsx-console");
    return ids;
  }
  function persistCollapse() { if (settings.rememberLayout) { settings.collapsed = currentCollapsedIds(); saveSettings(); } }

  function addCollapseButtons() {
    document.querySelectorAll("#widget-grid .jarviswidget").forEach(function (w) {
      var header = w.querySelector(":scope > header") || w.querySelector("header");
      if (!header || header.querySelector(".etsx-collapse-btn")) return;
      if (settings.rememberLayout && settings.collapsed.indexOf(w.id) !== -1) w.classList.add("etsx-collapsed");
      var btn = document.createElement("button");
      btn.className = "etsx-collapse-btn"; btn.type = "button"; btn.title = "Réduire / déplier";
      btn.innerHTML = icon("chevron");
      btn.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); w.classList.toggle("etsx-collapsed"); persistCollapse(); });
      var ctrls = header.querySelector(".jarviswidget-ctrls") || header;
      ctrls.insertBefore(btn, ctrls.firstChild);
    });
  }

  /* CONSOLE DE SESSION */
  function buildConsole() {
    var now = new Date(), st = etatSession(now);
    var eyebrow, prefixe = "SEM.", grand, sousTitre, statusClass = "", segTotal, segCourant, pct;

    if (!st) {                                   // filet : ne devrait pas arriver
      eyebrow = "Session"; grand = "N/D"; sousTitre = "Calendrier indisponible";
      segTotal = 15; segCourant = 0; pct = 0;

    } else if (st.etat === "conge") {            // entre deux sessions : pas d'école
      var sp = st.sess;
      statusClass = "is-conge"; eyebrow = "Congé";
      prefixe = "DANS"; grand = String(st.restant);
      sousTitre = "Pas de cours · " + sp.nom + " " + sp.annee + " commence le " +
                  dateLongue(sp.cours) + (sp.officiel ? "" : " (≈)");
      segTotal = st.segTotal; segCourant = st.segCourant; pct = Math.round(st.fraction * 100);

    } else {                                     // dans la session
      var s = st.sess;
      eyebrow = s.nom + " " + s.annee + (s.officiel ? "" : " ≈");
      grand = pad2(st.semaine);
      segTotal = st.segTotal; segCourant = st.segCourant; pct = Math.round(st.fraction * 100);

      if (st.etat === "examens") {
        statusClass = "is-post"; prefixe = ""; grand = "EX";
        sousTitre = "Période d'examens · jusqu'au " + dateLongue(s.exam[1]);
      } else if (st.etat === "relache") {
        statusClass = "is-relache";
        sousTitre = "Semaine de relâche · reprise le " + dateLongue(st.reprise);
      } else {
        var rest = st.restant;
        sousTitre = "Semaine " + st.semaine + " sur " + segTotal + " · " +
          (st.ferie ? "congé aujourd'hui" :
           rest === 0 ? "dernière semaine" : rest + " restante" + (rest > 1 ? "s" : ""));
      }
    }

    var segs = "";
    for (var i = 1; i <= segTotal; i++) { var cls = i === segCourant ? "etsx-seg is-now" : i < segCourant ? "etsx-seg is-done" : "etsx-seg"; segs += '<span class="' + cls + '"></span>'; }
    var mon = mondayOf(now), days = "";
    for (var j = 0; j < 7; j++) { var dt = addDays(mon, j); var t = sameDay(dt, now); var we = j >= 5 ? " is-weekend" : ""; days += '<div class="etsx-day' + (t ? " is-today" : "") + we + '"><span class="dow">' + DOW[j] + '</span><span class="dnum">' + dt.getDate() + '</span></div>'; }
    var hello = greetingWord(now);
    var dateStr = cap(now.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" }));
    // (le bloc "chips" qui vivait ici était mort : jamais inséré dans le HTML
    // de la console, buildQuickbar() construit les vraies puces.)
    var collapsed = settings.rememberLayout && settings.collapsed.indexOf("etsx-console") !== -1;
    var el = document.createElement("section");
    el.id = "etsx-console";
    el.className = "etsx-console " + statusClass + (collapsed ? " etsx-collapsed" : "");
    el.setAttribute("aria-label", "Console de session monÉTS");
    el.innerHTML =
      '<div class="etsx-console-head"><span class="etsx-console-title">Console de session</span>' +
        '<button class="etsx-collapse-btn" id="etsx-console-collapse" type="button" title="Réduire / déplier">' + icon("chevron") + '</button></div>' +
      '<div class="etsx-console-body">' +
        '<div class="etsx-row">' +
          '<div class="etsx-readout"><span class="etsx-eyebrow">' + eyebrow + '</span>' +
            '<div class="etsx-weekline">' + (prefixe ? '<span class="etsx-sem">' + prefixe + '</span>' : '') +
            '<span class="etsx-week">' + grand + '</span></div></div>' +
          '<div class="etsx-progress"><div class="etsx-progress-head"><span class="etsx-eyebrow">Progression de la session</span><span class="etsx-pct">' + pct + '<small>%</small></span></div>' +
            '<div class="etsx-rail" role="img" aria-label="Progression : ' + pct + ' pour cent">' + segs + '</div><span class="etsx-sub">' + sousTitre + '</span></div>' +
          '<div class="etsx-today"><span class="etsx-hello">' + hello + '</span><div class="etsx-days">' + days + '</div><span class="etsx-date">' + dateStr + '</span></div>' +
        '</div>' +
      '</div>';
    el.querySelector("#etsx-console-collapse").addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); el.classList.toggle("etsx-collapsed"); persistCollapse(); });
    return el;
  }

  /* INJECTION */
  function contentRoot() {
    return document.getElementById("content") || (document.getElementById("widget-grid") ? document.getElementById("widget-grid").parentNode : null) || document.getElementById("main");
  }
  function injectConsole() {
    if (!settings.showConsole || !isHome() || document.getElementById("etsx-console")) return;
    var root = contentRoot(); if (!root) return;
    root.insertBefore(buildConsole(), root.firstChild);
  }
  function buildQuickbar() {
    var bar = document.createElement("div"); bar.id = "etsx-quickbar";
    function chip(l) {
      // sameTab (SignETS) : lien normal, sans target/rel, reste dans le même
      // onglet. Les autres gardent target="_blank" mais SANS noopener/noreferrer,
      // pour que Chrome garde la relation d'ouverture et place le nouvel onglet
      // dans le même groupe que celui-ci plutôt que dans une fenêtre à part.
      var attrs = l.sameTab ? "" : ' target="_blank"';
      return '<a class="etsx-chip" href="' + l.url + '"' + attrs + '>' +
        '<span class="etsx-chip-main">' + icon(l.icon) + '<span>' + l.label + '</span></span>' +
        '<span class="etsx-chip-desc">' + l.desc + '</span></a>';
    }
    // Un seul groupe : les sites non officiels (HoraireTS, ETSHub, Reddit) ont été
    // retirés, ils n'appartiennent pas à l'ÉTS. Plus de séparation 50/50.
    var chips = CONFIG.quickLinks.map(chip).join("");
    bar.innerHTML =
      '<div class="etsx-qb-group"><span class="etsx-qb-lbl">Accès rapide</span><div class="etsx-qb-chips">' + chips + '</div></div>';
    return bar;
  }
  function injectQuickbar() {
    if (!isHome() || document.getElementById("etsx-quickbar")) return;
    var root = contentRoot(); if (!root) return;
    root.insertBefore(buildQuickbar(), root.firstChild);
  }
  function applyAll() {
    applyTheme(); applyFont(); applyBackground(); ensureHeader(); applySidebar(); applyQuickbar(); applyAdvanced();
    applyNavHide(); addNavCaptions(); fixNavIcons(); applyBlockHide();
    addCollapseButtons();
    applyCoursView();
    if (isHome()) { injectConsole(); injectQuickbar(); }
    else { ["etsx-console", "etsx-quickbar"].forEach(function (id) { var c = document.getElementById(id); if (c) c.remove(); }); }
  }
  function refreshConsole() { var old = document.getElementById("etsx-console"); if (old) old.replaceWith(buildConsole()); else injectConsole(); }

  /* DÉMARRAGE */
  function start() {
    applyTheme();
    var tries = 0;
    var timer = setInterval(function () { applyAll(); if ((document.getElementById("etsx-console") && document.getElementById("etsx-hdr")) || ++tries > 30) clearInterval(timer); }, 250);
    var calTries = 0;
    var calTimer = setInterval(function () { if (fixCalendar() || ++calTries > 40) clearInterval(calTimer); }, 350);
    // Déplier « Horaire général » → re-rendre son calendrier interne (jours).
    document.addEventListener("click", function (e) {
      var cours = document.getElementById("wid-id-cours");
      if (!cours || !cours.contains(e.target)) return;
      setTimeout(function () { fixInnerCalendars(cours); }, 350);
      setTimeout(function () { fixInnerCalendars(cours); }, 700);
    }, true);
    var root = document.getElementById("main") || document.body;
    if (root && "MutationObserver" in window) {
      var scheduled = false;
      new MutationObserver(function () { if (scheduled) return; scheduled = true; setTimeout(function () { scheduled = false; applyAll(); }, 200); }).observe(root, { childList: true, subtree: true });
    }
    scheduleMidnightRefresh();
    // Synchronisation du thème depuis l'autre site (SignETS), sans boucle.
    if (window.ETSXSync) window.ETSXSync.subscribe(function (shared) {
      ["theme", "skin", "accent", "sourceAccent", "font"].forEach(function (k) { if (shared[k] !== undefined) settings[k] = shared[k]; });
      if (settings.skin === "harvard") settings.skin = "prestige"; // ancien nom, valeur partagée possiblement périmée
      if (!SKINS[settings.skin]) settings.skin = "classic";
      try { localStorage.setItem(LS_KEY, JSON.stringify(settings)); } catch (e) {}
      applyTheme(); applyFont();
      document.querySelectorAll(".etsx-swatch[data-accent]").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-accent") === settings.accent); });
      document.querySelectorAll(".etsx-swatch-custom").forEach(function (custom) { custom.style.background = settings.accent; });
      document.querySelectorAll("#etsx-settings .etsx-skin").forEach(function (c) { c.classList.toggle("is-active", c.getAttribute("data-skin") === settings.skin); });
    });
  }
  function scheduleMidnightRefresh() {
    var now = new Date(), next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 1, 0);
    setTimeout(function () { refreshConsole(); scheduleMidnightRefresh(); }, next - now);
  }

  /* Pont de messages avec la popup de la barre d'outils, toujours actif, même
     si le thème est désactivé sur ce site, pour pouvoir le réactiver depuis là. */
  if (window.chrome && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
      if (!msg || msg.target !== "etsx-popup") return;
      if (msg.type === "getState") {
        sendResponse({ site: "portail", enabled: settings.enabled !== false, theme: settings.theme, skin: settings.skin, accent: settings.accent });
        return;
      }
      if (msg.type === "setEnabled") { settings.enabled = !!msg.value; saveSettings(); sendResponse({ ok: true }); return; }
      if (msg.type === "setTheme") { settings.theme = msg.value === "dark" ? "dark" : "light"; saveSettings(); applyTheme(); sendResponse({ ok: true }); return; }
      if (msg.type === "setSkin") { if (SKINS[msg.value]) setSkin(msg.value); sendResponse({ ok: true }); return; }
    });
  }

  if (settings.enabled === false) { /* thème désactivé sur ce site : page laissée intacte */ }
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
