/** Cache name */
const cacheName = `thee_calculator`;

// Save app resources (on install)
self.oninstall = e => e.waitUntil(
	caches.open(cacheName).then(files =>
		files.addAll([
			`./index.html?24021732`,
			`./main.css?23032531`,
			`./main.js?24021732`,
			`./manifest.json?23032531`,
			`./sw.js?24021732`
		]).then(() => self.skipWaiting()))
);

// Delete old cached files
self.onactivate = e => e.waitUntil(
	caches.keys().then(files => Promise.all(
		files.map(f =>
			f !== cacheName && caches.delete(f)
		)
	))
);

// Get cached files (if available)
self.addEventListener(`fetch`, e => e.respondWith(
	fetch(e.request)
		.then(res => {
			const c = res.clone();
			caches.open(cacheName)
				.then(f => f.put(e.request, c));
			return res;
		}).catch(
			err => caches.match(e.request)
				.then(res => res)
		)
));