const cacheName = `calculator_pwa`;
self.addEventListener(`install`, e => e.waitUntil(
	caches.open(cacheName).then(files =>
		files.addAll([
			`./index.html`,
			`./main.css?23031901`,
			`./main.js?23031901`,
			`./manifest.json`,
			`./sw.js`
		]).then(() => self.s$kipWaiting()))
));
self.addEventListener(`activate`, e => e.waitUntil(
	caches.keys().then(cacheNames => Promise.all(
		cacheNames.map(file =>
			file !== cacheName && caches.delete(file)
		)
	))
));
self.addEventListener(`fetch`, e => e.respondWith(
	fetch(e.request)
		.then(res => {
			const resClone = res.clone();
			caches.open(cacheName)
				.then(file => {
					file.put(e.request, resClone);
				});
			return res;
		}).catch(
			err => caches.match(e.request)
				.then(res => res)
		)
));