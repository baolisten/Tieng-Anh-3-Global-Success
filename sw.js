const CACHE = "ga3-cache-v3";
const ASSETS = [
  "./index.html",
  "./style.css",
  "./data.js",
  "./icons.js",
  "./heroes.js",
  "./shared.js",
  "./firebase-config.js",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png"
];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

/* Ưu tiên lấy bản mới nhất từ mạng (để cập nhật không bị kẹt cache cũ);
   chỉ dùng bản đã lưu khi mất mạng. */
self.addEventListener("fetch", e=>{
  if(e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if(url.origin !== location.origin) return; /* để Firebase SDK/CDN tự đi mạng, không cache */

  e.respondWith(
    fetch(e.request).then(res=>{
      caches.open(CACHE).then(c=>c.put(e.request, res.clone()));
      return res;
    }).catch(()=>caches.match(e.request))
  );
});
