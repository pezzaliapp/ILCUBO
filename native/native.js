/*
 * ILCUBO — integrazione con l'app iOS (Capacitor).
 * © 2026 Alessandro Pezzali. Tutti i diritti riservati.
 *
 * Viene inserito solo nella versione per App Store (cartella www/), mai sul sito.
 * Sul web non fa nulla.
 *
 *  - "Esporta JSON" e "Salva immagine": dentro un'app iOS i download del browser
 *    non funzionano, quindi il file viene scritto nella cache dell'app e aperto
 *    con il foglio di condivisione di iOS (Salva su File, AirDrop, Mail, Foto…).
 *  - "Copia link": il link condiviso punta alla versione web pubblica, non
 *    all'indirizzo interno dell'app (capacitor://localhost), che fuori dall'app
 *    non si aprirebbe.
 *  - Barra di stato con testo scuro (lo sfondo del gioco è chiaro).
 */
(function () {
  'use strict';

  var cap = window.Capacitor;
  var isNative = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  if (!isNative) return;

  var WEB_URL = 'https://www.alessandropezzali.it/ILCUBO/';
  var plugins = cap.Plugins || {};

  document.documentElement.classList.add('is-native');

  /* ---------- Barra di stato ---------- */
  try {
    if (plugins.StatusBar) plugins.StatusBar.setStyle({ style: 'LIGHT' }).catch(function () {});
  } catch (_) { /* ignorato */ }

  /* ---------- Download → foglio di condivisione ---------- */
  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () {
        var s = String(r.result || '');
        resolve(s.slice(s.indexOf(',') + 1));
      };
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  function shareFile(href, filename) {
    var fs = plugins.Filesystem;
    var share = plugins.Share;
    if (!fs || !share) return Promise.reject(new Error('plugin mancanti'));
    var name = String(filename || 'ilcubo').replace(/[^\w.\-]+/g, '_');

    return fetch(href)
      .then(function (res) { return res.blob(); })
      .then(blobToBase64)
      .then(function (data) {
        return fs.writeFile({ path: name, data: data, directory: 'CACHE' });
      })
      .then(function (res) {
        return share.share({ title: name, files: [res.uri] });
      })
      .catch(function (err) {
        /* L'utente che chiude il foglio di condivisione non è un errore. */
        var msg = String((err && err.message) || err || '');
        if (/cancel/i.test(msg)) return;
        throw err;
      });
  }

  var nativeClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    var href = this.getAttribute('href') || '';
    if (this.hasAttribute('download') && /^(blob:|data:)/.test(href)) {
      var name = this.getAttribute('download');
      shareFile(href, name).catch(function () {
        alert('Impossibile salvare il file su questo dispositivo.');
      });
      return;
    }
    return nativeClick.apply(this, arguments);
  };

  /* ---------- Link condivisibili verso la versione web ---------- */
  function toWebUrl(text) {
    if (typeof text !== 'string') return text;
    var m = text.match(/^capacitor:\/\/localhost\/(?:index\.html)?(.*)$/);
    return m ? WEB_URL + m[1] : text;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    var writeText = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = function (text) { return writeText(toWebUrl(text)); };
  }
  var nativePrompt = window.prompt;
  window.prompt = function (msg, value) { return nativePrompt.call(window, msg, toWebUrl(value)); };
})();
