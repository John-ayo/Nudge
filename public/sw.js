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
    icon: data.icon || "/nudge-icon-original-192.png",
    requireInteraction: true,
    //badge: data.badge || "/nudge-icon-193.png",
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