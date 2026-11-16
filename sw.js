// 改了網頁內容要上傳新版時，把版本號 +1，手機才會更新
const CACHE = "tokyo-trip-v1";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const font = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin !== location.origin && !font) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: !font });
    const fresh = fetch(req).then(res => {
      if (res.ok || res.type === "opaque") cache.put(req, res.clone());
      return res;
    }).catch(() => hit || (req.mode === "navigate" ? cache.match("./index.html") : Response.error()));
    return hit || fresh;
  }));
});
