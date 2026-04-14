/* sw.js — Numerologie-Rechner v3.0 */

  

const CACHE_VERSION = 'numerologie-v3.0';

const FONT_CACHE    = 'numerologie-fonts-v1';

  

const APP_ASSETS = [

  '/',

  '/index.html',

  '/style.css',

  '/numerology.js',

  '/manifest.json',

  '/icon.svg',

];

  

self.addEventListener('install', (event) => {

  self.skipWaiting();

  event.waitUntil(

    caches.open(CACHE_VERSION)

      .then((cache) => cache.addAll(APP_ASSETS))

      .catch(() => {})

  );

});

  

self.addEventListener('activate', (event) => {

  event.waitUntil(

    (async () => {

      const keys = await caches.keys();

      await Promise.all(

        keys

          .filter((k) => k !== CACHE_VERSION && k !== FONT_CACHE)

          .map((k) => caches.delete(k))

      );

      await self.clients.claim();

    })()

  );

});

  

self.addEventListener('fetch', (event) => {

  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  

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

  

  event.respondWith(

    fetch(event.request)

      .then((res) => {

        if (!res || res.status !== 200 || res.type === 'opaque') return res;

        const clone = res.clone();

        caches.open(CACHE_VERSION).then((c) => c.put(event.request, clone));

        return res;

      })

      .catch(() =>

        caches.match(event.request).then((cached) => {

          if (cached) return cached;

          if (event.request.mode === 'navigate') return caches.match('/index.html');

        })

      )

  );

});