self.addEventListener('install', (e) => {
  console.log('[ServiceWorker] Install');
});

self.addEventListener('activate', (e) => {
  console.log('[ServiceWorker] Activate');
});

self.addEventListener('fetch', (e) => {
  //console.log(e.request.url);
});
