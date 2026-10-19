const CACHE='loki-public-shell-v2'
const ASSETS=['/offline.html','/icon-192.png','/icon-512.png','/loki-logo-exact.png']
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))))
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))))
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url)
 if(e.request.method!=='GET'||url.origin!==self.location.origin)return
 if(e.request.mode==='navigate')e.respondWith(fetch(e.request).catch(()=>caches.match('/offline.html')))
 else if(ASSETS.includes(url.pathname)||url.pathname.startsWith('/_next/static/'))e.respondWith(caches.open(CACHE).then(async c=>{const cached=await c.match(e.request);if(cached)return cached;const r=await fetch(e.request);if(r.ok)await c.put(e.request,r.clone());return r}))
})
