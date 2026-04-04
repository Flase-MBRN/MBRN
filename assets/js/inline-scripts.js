/**
 * INLINE SCRIPTS - MBRN
 * Ehemals inline im HTML, jetzt extern für CSP Compliance
 */

'use strict';

// 1. Theme Toggle
document.addEventListener('DOMContentLoaded', function(){
  const saved = localStorage.getItem('mbrn-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  
  const btn = document.getElementById('themeToggle');
  if(!btn) return;
  
  btn.textContent = saved === 'dark' ? '☀' : '☾';
  btn.setAttribute('aria-label', saved === 'dark' ? 'Hell-Modus aktivieren' : 'Dunkel-Modus aktivieren');
  
  btn.addEventListener('click', function(){
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('mbrn-theme', next);
    btn.textContent = next === 'dark' ? '☀' : '☾';
    btn.setAttribute('aria-label', next === 'dark' ? 'Hell-Modus aktivieren' : 'Dunkel-Modus aktivieren');
  });
});

// 2. Scroll Reveal Animation
document.addEventListener('DOMContentLoaded', function(){
  var els = document.querySelectorAll('.reveal');
  
  function reveal() {
    var h = window.innerHeight;
    els.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < h - 60) {
        el.classList.add('visible');
      }
    });
  }
  
  window.addEventListener('scroll', reveal, { passive: true });
  window.addEventListener('resize', reveal, { passive: true });
  reveal();
});

// 3. PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(function() { console.log('[PWA] MBRN Hub Service Worker aktiv'); })
    .catch(function(err) { console.log('[PWA] Fehler', err); });
}
