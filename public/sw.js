const CACHE = "petconnect-v1";
const CORE = ["/", "/favicon.ico", "/manifest.webmanifest", "/placeholder.svg"]; 

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(()=> (self as any).skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((self as any).clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    fetch(req).then((res)=>{
      const copy = res.clone();
      caches.open(CACHE).then((cache)=> cache.put(req, copy));
      return res;
    }).catch(()=> caches.match(req).then((res)=> res || caches.match('/')))
  );
});
