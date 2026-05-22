const CACHE_NAME = "training-console-v2";
const APP_SHELL = ["/", "/workout", "/library", "/progress", "/goals", "/history", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((response) => response || caches.match("/"))));
});

// Rest timer notification: page sends { type: "SCHEDULE_REST_NOTIFICATION", seconds, nextExercise }
self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "SCHEDULE_REST_NOTIFICATION") return;

  const { seconds, nextExercise } = event.data;
  if (!seconds || seconds < 1) return;

  // Cancel any pending notification
  if (self._restTimer) clearTimeout(self._restTimer);

  self._restTimer = setTimeout(() => {
    if (self.Notification && Notification.permission === "granted") {
      self.registration.showNotification("Rest complete", {
        body: nextExercise ? `Time to start: ${nextExercise}` : "Next set is ready",
        icon: "/icon.svg",
        badge: "/icon.svg",
        tag: "rest-timer",
        renotify: true,
      });
    }
  }, seconds * 1000);
});
