/* Mosaico matemático · service worker
   Guarda la Caja en el equipo para que funcione sin conexión.
   Al publicar una versión nueva, cambia VERSION: el navegador la descarga y la Caja ofrece «Actualizar». */
var VERSION='mosaico-v73i-2026-11-06';
var ARCHIVOS=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/apple-touch-icon.png'];

self.addEventListener('install',function(e){
  /* cache:'reload' para no guardar una copia vieja que el navegador tuviera en caché */
  e.waitUntil(caches.open(VERSION).then(function(c){return c.addAll(ARCHIVOS.map(function(u){return new Request(u,{cache:'reload'})}))}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==VERSION&&k!==VERSION+'-fuentes'}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});

self.addEventListener('message',function(e){if(e.data==='activar')self.skipWaiting()});

self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  var url=new URL(req.url);
  /* tipografías de Google: se guardan la primera vez para que la Caja se vea igual sin conexión */
  if(/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.open(VERSION+'-fuentes').then(function(c){return c.match(req).then(function(r){
      return r||fetch(req).then(function(n){if(n&&(n.ok||n.type==='opaque'))c.put(req,n.clone());return n})})}));
    return;
  }
  if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    e.respondWith(caches.match('./index.html').then(function(r){return r||fetch(req)}));
    return;
  }
  e.respondWith(caches.match(req).then(function(r){return r||fetch(req)}));
});
