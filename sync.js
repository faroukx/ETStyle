/* =============================================================================
 * ETStyle — Synchronisation inter-origines (portail <-> signets)
 * Propage le thème via chrome.storage.sync (clé etsx_shared).
 * Champs partagés : theme, skin, accent, sourceAccent, font.
 * ========================================================================== */
(function () {
  "use strict";
  var KEY = "etsx-shared";
  var hasStore = false;
  try { hasStore = !!(window.chrome && chrome.storage && chrome.storage.sync); } catch (e) { hasStore = false; }
  var api = {
    _last: null,
    push: function (partial) {
      api._last = Object.assign({}, api._last || {}, partial);
      if (!hasStore) return;
      try { chrome.storage.sync.set({ etsx_shared: api._last }); } catch (e) {}
    },
    subscribe: function (cb) {
      if (!hasStore) return;
      try {
        chrome.storage.sync.get("etsx_shared", function (o) {
          var v = o && o.etsx_shared;
          if (v) { api._last = v; cb(v); }
        });
        chrome.storage.onChanged.addListener(function (ch, area) {
          if (area === "sync" && ch.etsx_shared && ch.etsx_shared.newValue) {
            api._last = ch.etsx_shared.newValue; cb(api._last);
          }
        });
      } catch (e) {}
    }
  };
  window.ETSXSync = api;
})();
