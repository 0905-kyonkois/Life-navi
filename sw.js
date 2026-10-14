const CACHE = 'life-navi-v047';
const ASSETS = ['./manifest.webmanifest'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(response => {
        if (response && response.ok && event.request.method === 'GET') {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('push', event => {
 let payload={title:'📚 生活ナビ',body:'確認したい課題があります'};
 try {payload={...payload,...event.data.json()}}catch(e){}
 event.waitUntil(self.registration.showNotification(payload.title,{body:payload.body,tag:payload.tag||'life-navi',icon:'./icon-192.png',badge:'./icon-192.png',data:{url:payload.url||'./index.html'}}));
});
self.addEventListener('notificationclick', event => {
 event.notification.close();
 event.waitUntil((async()=>{const url=new URL(event.notification.data?.url||'./index.html',self.registration.scope).href;const clientsList=await clients.matchAll({type:'window',includeUncontrolled:true});for(const client of clientsList){if(client.url.startsWith(self.registration.scope)){await client.focus();return}}await clients.openWindow(url)})());
});
