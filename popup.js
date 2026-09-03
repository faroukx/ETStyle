/* ETStyle, popup de la barre d'outils. Communique avec le content script de
 * l'onglet actif par messages (target: "etsx-popup") ; aucun accès direct au
 * localStorage de la page (contexte différent). */
(function () {
  "use strict";

  var SKINS = {
    classic:  { name: "ÉTS", accent: "#1c4e89", sw: ["#1c4e89", "#c41230", "#e9eef5"] },
    prestige: { name: "Prestige", accent: "#a51c30", sw: ["#a51c30", "#2a211c", "#f3eee8"] },
    minimal:  { name: "Minimal", accent: "#da291c", sw: ["#da291c", "#1c1f26", "#f1f3f7"] },
    gaming:   { name: "Gaming", accent: "#8b5cf6", sw: ["#8b5cf6", "#0a0a12", "#22d3ee"] }
  };

  var elLoading = document.getElementById("p-loading");
  var elSite = document.getElementById("p-site");
  var elUnsupported = document.getElementById("p-unsupported");
  var elStale = document.getElementById("p-stale");
  var elReload = document.getElementById("p-reload");
  var elControls = document.getElementById("p-controls");
  var elEnabled = document.getElementById("p-enabled");
  var elWhenEnabled = document.getElementById("p-when-enabled");
  var elDisabledNote = document.getElementById("p-disabled-note");
  var elSkins = document.getElementById("p-skins");
  var elSegTheme = document.getElementById("p-seg-theme");

  var currentTab = null;

  function send(type, value, cb) {
    if (!currentTab) return;
    try {
      chrome.tabs.sendMessage(currentTab.id, { target: "etsx-popup", type: type, value: value }, function (resp) {
        if (chrome.runtime.lastError) { cb && cb(null); return; }
        cb && cb(resp);
      });
    } catch (e) { cb && cb(null); }
  }

  function applyBrand(state) {
    var accent = (state && state.accent) || "#1c4e89";
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.classList.toggle("is-dark", !!(state && state.theme === "dark"));
  }

  function renderSkins(active) {
    elSkins.innerHTML = "";
    Object.keys(SKINS).forEach(function (k) {
      var sk = SKINS[k];
      var card = document.createElement("button");
      card.type = "button";
      card.className = "p-skin" + (k === active ? " is-active" : "");
      var sw = sk.sw.map(function (c) { return '<span style="background:' + c + '"></span>'; }).join("");
      card.innerHTML = '<span class="p-skin-sw">' + sw + '</span><span class="p-skin-name">' + sk.name + '</span>';
      card.addEventListener("click", function () {
        send("setSkin", k, function (resp) { if (resp && resp.ok) refresh(); });
      });
      elSkins.appendChild(card);
    });
  }

  function showEmpty(which) {
    elLoading.hidden = true;
    elSite.hidden = true;
    elControls.hidden = true;
    elUnsupported.hidden = which !== "unsupported";
    elStale.hidden = which !== "stale";
  }

  function refresh() {
    send("getState", null, function (resp) {
      elLoading.hidden = true;
      // La page correspond à un site pris en charge (sinon on ne serait pas
      // arrivé jusqu'ici) : une réponse vide veut dire que le content script
      // n'y tourne pas encore, typiquement une page ouverte avant la
      // dernière mise à jour de l'extension. Un rechargement suffit.
      if (!resp) { showEmpty("stale"); return; }
      elUnsupported.hidden = true;
      elStale.hidden = true;
      elControls.hidden = false;
      elSite.hidden = false;
      elSite.textContent = resp.site === "signets" ? "SignETS" : "Portail étudiant";

      var enabled = resp.enabled !== false;
      elEnabled.checked = enabled;
      elWhenEnabled.hidden = !enabled;
      elDisabledNote.hidden = enabled;

      applyBrand(resp);
      renderSkins(resp.skin);
      elSegTheme.querySelectorAll(".p-seg-btn").forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-theme") === resp.theme);
      });
    });
  }

  elEnabled.addEventListener("change", function () {
    var v = elEnabled.checked;
    elWhenEnabled.hidden = !v;
    elDisabledNote.hidden = v;
    send("setEnabled", v, function (resp) {
      if (resp && resp.ok && currentTab) { chrome.tabs.reload(currentTab.id); window.close(); }
    });
  });

  elSegTheme.querySelectorAll(".p-seg-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      send("setTheme", b.getAttribute("data-theme"), function (resp) { if (resp && resp.ok) refresh(); });
    });
  });

  elReload.addEventListener("click", function () {
    if (currentTab) { chrome.tabs.reload(currentTab.id); window.close(); }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tab = tabs && tabs[0];
    if (!tab || !tab.url || !/^https?:\/\/(portail\.etsmtl\.ca|signets-ens\.etsmtl\.ca)\//.test(tab.url)) {
      showEmpty("unsupported");
      return;
    }
    currentTab = tab;
    refresh();
  });
})();
