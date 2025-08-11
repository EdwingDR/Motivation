
const CACHE_NAME = 'motivaday-v2';
const ASSETS = [
  '/', '/index.html', '/styles.css', '/app.js', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => { if(k!==CACHE_NAME) return caches.delete(k);})))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Serve app shell from cache-first
  if(url.origin === location.origin){
    event.respondWith(caches.match(req).then(r => r || fetch(req).then(resp => {
      const clone = resp.clone(); caches.open(CACHE_NAME).then(c=>c.put(req, clone)); return resp;
    })).catch(()=> caches.match('/index.html')));
  } else {
    // network-first for external requests
    event.respondWith(fetch(req).catch(()=> caches.match(req)));
  }
});
