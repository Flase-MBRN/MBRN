/**
 * INLINE SCRIPTS - MBRN
 * Ehemals inline im HTML, jetzt extern für CSP Compliance
 */

'use strict';

// 1. Scroll Reveal Animation
document.addEventListener('DOMContentLoaded', function(){
  var els = document.querySelectorAll('.reveal');
  
  function reveal() {
    var h = window.innerHeight;
    els.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < h - 60) {
        el.classList.add('revealed');
      }
    });
  }
  
  window.addEventListener('scroll', reveal, { passive: true });
  window.addEventListener('resize', reveal, { passive: true });
  reveal();
});

// 2. PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(function() { console.log('[PWA] MBRN Hub Service Worker aktiv'); })
    .catch(function(err) { console.log('[PWA] Fehler', err); });
}
