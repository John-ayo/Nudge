// Nudge Service Worker
// Handles incoming push events and notification clicks.
// Runs in its own worker context — plain JS only, no React/JSX here.

self.addEventListener("install", () => {
  // Activate this version immediately instead of waiting for old tabs to close
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    data = { title: "Nudge", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Nudge";
  const options = {
    body: data.body || "",
    // icon/badge intentionally omitted until PWA icons exist.
    // Once you have them in public/, add back:
    // icon: data.icon || "/icon-192.png",
    // badge: data.badge || "/icon-96.png",
    tag: data.tag || "nudge-general",
    data: {
      url: data.url || "/dashboard",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});