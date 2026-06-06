/*
 © 2016–2026 Alessandro Pezzali — ILCUBO. Tutti i diritti riservati.
 Prelude di protezione e attribuzione. Si esegue prima dei moduli applicativi.
 NON offuscato di proposito: l'avviso di copyright deve restare visibile.
*/
(function () {
  'use strict';

  // =========================================================================
  //  CONFIGURAZIONE LICENZA  —  modifica SOLO questi valori
  // =========================================================================
  var LIC = {
    owner: 'Alessandro Pezzali',
    site: 'https://www.pezzaliapp.com',

    // Domini dove l'app È autorizzata a girare (niente protocollo, niente slash).
    // Aggiungi qui i tuoi domini di produzione.
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'pezzaliapp.com',
      'www.pezzaliapp.com'
    ],

    // Endpoint TUO per ricevere le segnalazioni di domini non autorizzati.
    // Lascia '' per disattivare il beacon. Es: 'https://api.pezzaliapp.com/ilcubo-beacon'
    beaconUrl: '',

    // true  = avvisa soltanto in console (consigliato, non rompe nulla)
    // false = comportamento identico, qui solo come promemoria che NON blocchiamo l'app
    warnOnly: true
  };

  window.__ILCUBO_LICENSE__ = LIC;

  // --- Avviso di copyright a runtime (deterrente visibile in console) ------
  try {
    var css = 'font:700 14px system-ui,Arial;color:#d80027';
    console.log('%c© 2016–2026 ' + LIC.owner + ' — ILCUBO', css);
    console.log('%cCodice protetto. Licenza d\u2019Uso — ' + LIC.site, 'color:#555');
    // Canary: stringa-firma per ritrovare copie non autorizzate (ricerca/Google Alerts)
    console.log('%cILCUBO-SIG:9f1c-pezzaliAPP-2016\u20132026', 'color:transparent');
  } catch (_) {}

  // --- Rilevamento dominio non autorizzato (NON blocca, solo segnala) ------
  try {
    var host = (location.hostname || '').toLowerCase();
    var authorized = LIC.allowedHosts.some(function (h) {
      h = String(h).toLowerCase();
      return host === h || host.endsWith('.' + h);
    });

    if (!authorized && host && host !== '') {
      console.warn('[ILCUBO] Dominio non autorizzato: ' + host +
        ' — uso soggetto a licenza (' + LIC.site + ').');

      // Beacon di segnalazione: parte SOLO se hai impostato beaconUrl.
      if (LIC.beaconUrl) {
        var payload = JSON.stringify({
          app: 'ILCUBO',
          host: host,
          path: location.pathname,
          ref: document.referrer || null,
          ts: new Date().toISOString()
        });
        try {
          if (navigator.sendBeacon) {
            navigator.sendBeacon(LIC.beaconUrl, payload);
          } else {
            fetch(LIC.beaconUrl, { method: 'POST', mode: 'no-cors', keepalive: true, body: payload });
          }
        } catch (_) {}
      }
    }
  } catch (_) {}
})();
