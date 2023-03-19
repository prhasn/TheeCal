const cacheName = 'calculator_pwa';

self.addEventListener('install', e => e.waitUntil(
	caches.open(cacheName).then(cache =>
		cache.addAll([
			'/index.html',
			'/main.css',
			'/main.js',
		]).then(() => self.skipWaiting()))
))
self.addEventListener('activate', e => e.waitUntil(
	caches.keys().then(cacheNames => Promise.all(
		cacheNames.map(cache =>
			cache !== cacheName && caches.delete(cache)
		)
	))
))
self.addEventListener('fetch', e => e.respondWith(
	fetch(e.request)
		.then(res => {
			const resClone = res.clone();
			caches.open(cacheName)
				.then(cache => {
					cache.put(e.request, resClone);
				});
			return res;
		}).catch(
			err => caches.match(e.request)
				.then(res => res)
		)
));