import { supabase } from "./supabase";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

// Registers the service worker and waits until it is actually active
// before returning. This prevents the "no active Service Worker" error
// that happens when PushManager.subscribe() is called too early.
export async function registerServiceWorker() {
  if (!isPushSupported()) return null;

  const registration = await navigator.serviceWorker.register("/sw.js");

  // If the worker is already active (e.g. page was refreshed), return immediately
  if (registration.active) return registration;

  // Otherwise wait for it to become active
  return new Promise((resolve) => {
    const worker = registration.installing ?? registration.waiting;
    if (!worker) {
      resolve(registration);
      return;
    }
    worker.addEventListener("statechange", function handler() {
      if (this.state === "activated") {
        worker.removeEventListener("statechange", handler);
        resolve(registration);
      }
    });
  });
}

export async function subscribeToPush(userId) {
  console.log("subscribeToPush called for", userId);

  if (!isPushSupported()) {
    console.log("Push not supported");
    return null;
  }
  if (!VAPID_PUBLIC_KEY) {
    console.error("VITE_VAPID_PUBLIC_KEY is not set");
    return null;
  }

  console.log("VAPID key:", VAPID_PUBLIC_KEY?.slice(0, 20) + "...");

  const permission = await Notification.requestPermission();
  console.log("Permission:", permission);
  if (permission !== "granted") return null;

  const registration = await registerServiceWorker();
  console.log("Registration:", registration);
  if (!registration) return null;

  const readyRegistration = await navigator.serviceWorker.ready;
  console.log("Ready registration:", readyRegistration);

  let subscription = await readyRegistration.pushManager.getSubscription();
  console.log("Existing subscription:", subscription);

  if (!subscription) {
    console.log("Creating new subscription...");
    try {
      subscription = await readyRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      console.log("Subscription created:", subscription);
    } catch (err) {
      console.error("PushManager.subscribe failed:", err);
      return null;
    }
  }

  const raw = subscription.toJSON();
  console.log("Raw subscription:", raw);

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: userId,
        endpoint: raw.endpoint,
        p256dh: raw.keys.p256dh,
        auth: raw.keys.auth,
        user_agent: navigator.userAgent,
      },
      { onConflict: "endpoint" }
    );

  if (error) {
    console.error("Supabase upsert failed:", error);
    return null;
  }

  console.log("Subscription saved successfully");
  return subscription;
}

export async function unsubscribeFromPush(userId) {
  if (!isPushSupported()) return;

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return;

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", userId)
    .eq("endpoint", endpoint);
}

export function getNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}