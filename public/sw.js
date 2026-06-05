const CACHE_NAME = 'ceriakid-v4';
const APP_SHELL = ['/', '/dashboard', '/index.html', '/manifest.json'];

const shouldBypassCache = (request, url) => {
  if (request.method !== 'GET') return true;
  if (url.pathname.startsWith('/api/')) return true;
  if (url.pathname.includes('/node_modules/.vite/deps/')) return true;
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) return true;
  return false;
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (shouldBypassCache(request, url)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html').then((cached) => cached || caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});

// ─────────────────────────────────────────────────────────────────
// WEB PUSH NOTIFICATIONS — order notifications untuk admin
// ─────────────────────────────────────────────────────────────────
const DEFAULT_ICON = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png';

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { title: 'CeriaKid', body: event.data ? event.data.text() : 'Notifikasi baru' };
  }

  const title = data.title || 'CeriaKid';
  const options = {
    body: data.body || '',
    icon: data.icon || DEFAULT_ICON,
    badge: data.badge || DEFAULT_ICON,
    tag: data.tag || 'ceriakid-order',
    data: {
      url: data.url || '/admin-dashboard?tab=analytics',
      timestamp: data.timestamp || Date.now(),
    },
    // requireInteraction:true → notif kekal sampai admin tap (tak hilang sendiri)
    requireInteraction: data.requireInteraction === true,
    // Vibration pattern — buzz kuat untuk attention (mobile only)
    vibrate: Array.isArray(data.vibrate) ? data.vibrate : [200, 100, 200],
    // Timestamp untuk OS sort (paling baru di atas)
    timestamp: data.timestamp || Date.now(),
    // Renotify:true → buzz semula kalau tag sama replace existing
    renotify: data.renotify !== false,
    // Action buttons (desktop & some mobile)
    actions: Array.isArray(data.actions) ? data.actions.slice(0, 2) : [
      { action: 'view', title: '👀 Lihat' },
      { action: 'dismiss', title: '✓ OK' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Handle action button clicks
  if (event.action === 'dismiss') {
    return; // just close, no nav
  }

  const url = (event.notification.data && event.notification.data.url) || '/admin-dashboard?tab=analytics';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Cari window yang dah open dengan app — focus + navigate
      for (const client of clientList) {
        if ('focus' in client) {
          // Try navigate dulu, lepas tu focus
          if ('navigate' in client) {
            client.navigate(url).catch(() => {});
          }
          return client.focus();
        }
      }
      // Tiada window open — buka baru
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

// Track notification close (untuk analytics nanti kalau perlu)
self.addEventListener('notificationclose', (event) => {
  // No-op for now
});
