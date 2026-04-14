/* sw.js — Numerologie v4.0 */

'use strict';

  

const CACHE_NAME = 'numerologie-v4';

const FONT_CACHE = 'numerologie-fonts-v1';

  

const APP_SHELL = [

  '/',

  '/index.html',

  '/style.css',

  '/numerology.js',

  '/manifest.json',

];

  

/* ── Install: cache app shell ── */

self.addEventListener('install', event => {

  self.skipWaiting();

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then(cache => cache.addAll(APP_SHELL))

      .catch(() => {}) /* Don't fail install if a file is missing */

  );

});

  

/* ── Activate: purge old caches ── */

self.addEventListener('activate', event => {

  event.waitUntil(

    caches.keys().then(keys =>

      Promise.all(

        keys

          .filter(k => k !== CACHE_NAME && k !== FONT_CACHE)

          .map(k => caches.delete(k))

      )

    ).then(() => self.clients.claim())

  );

});

  

/* ── Fetch: network-first with cache fallback ── */

self.addEventListener('fetch', event => {

  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  

  /* Fonts: cache-first (they rarely change) */

  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {

    event.respondWith(

      caches.open(FONT_CACHE).then(cache =>

        cache.match(event.request).then(cached => {

          if (cached) return cached;

          return fetch(event.request).then(res => {

            if (res?.ok) cache.put(event.request, res.clone());

            return res;

          }).catch(() => cached);

        })

      )

    );

    return;

  }

  

  /* App shell + assets: network-first, cache fallback */

  event.respondWith(

    fetch(event.request)

      .then(res => {

        if (res.ok) {

          const clone = res.clone();

          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));

        }

        return res;

      })

      .catch(() =>

        caches.match(event.request).then(cached => {

          if (cached) return cached;

          /* Offline fallback for navigation */

          if (event.request.mode === 'navigate') {

            return caches.match('/index.html');

          }

        })

      )

  );

});