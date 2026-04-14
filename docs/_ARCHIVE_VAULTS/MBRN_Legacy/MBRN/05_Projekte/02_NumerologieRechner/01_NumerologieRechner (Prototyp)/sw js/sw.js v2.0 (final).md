/* sw.js — Numerologie-Rechner v2.1

   ─────────────────────────────────

   STRATEGIE:

   • HTML / JS / CSS  → Network-first  (immer aktuelle Version)

   • Fonts            → Cache-first    (unveränderlich)

   • Offline-Fallback → index.html

   ─────────────────────────────────

   WICHTIG: CACHE_VERSION bei jedem Deploy hochzählen.

   Das löst den alten Cache automatisch auf.

*/

  

const CACHE_VERSION = 'numerologie-v2.1';

const FONT_CACHE    = 'numerologie-fonts-v1';

  

const APP_ASSETS = [

  '/',

  '/index.html',

  '/style.css',

  '/numerology.js',

  '/manifest.json',

  '/icon.svg',

];

  

/* ── Installation ── */

self.addEventListener('install', (event) => {

  /* Sofort aktiv werden — kein Warten auf Tab-Close */

  self.skipWaiting();

  

  event.waitUntil(

    caches.open(CACHE_VERSION)

      .then((cache) => cache.addAll(APP_ASSETS))

      .catch(() => {})

  );

});

  

/* ── Aktivierung: ALLE alten Caches löschen ── */

self.addEventListener('activate', (event) => {

  event.waitUntil(

    (async () => {

      const keys = await caches.keys();

      await Promise.all(

        keys

          .filter((k) => k !== CACHE_VERSION && k !== FONT_CACHE)

          .map((k) => caches.delete(k))

      );

      /* Alle offenen Tabs sofort übernehmen */

      await self.clients.claim();

    })()

  );

});

  

/* ── Fetch ── */

self.addEventListener('fetch', (event) => {

  if (event.request.method !== 'GET') return;

  

  const url = event.request.url;

  

  /* Fonts: Cache-first */

  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {

    event.respondWith(

      caches.open(FONT_CACHE).then((cache) =>

        cache.match(event.request).then((cached) => {

          if (cached) return cached;

          return fetch(event.request).then((res) => {

            if (res?.status === 200) cache.put(event.request, res.clone());

            return res;

          }).catch(() => cached);

        })

      )

    );

    return;

  }

  

  /* App-Dateien: Network-first → immer frische Version */

  event.respondWith(

    fetch(event.request)

      .then((res) => {

        if (!res || res.status !== 200 || res.type === 'opaque') return res;

        /* Frisch in Cache schreiben */

        const clone = res.clone();

        caches.open(CACHE_VERSION).then((c) => c.put(event.request, clone));

        return res;

      })

      .catch(() =>

        /* Offline-Fallback */

        caches.match(event.request).then((cached) => {

          if (cached) return cached;

          if (event.request.mode === 'navigate') return caches.match('/index.html');

        })

      )

  );

});