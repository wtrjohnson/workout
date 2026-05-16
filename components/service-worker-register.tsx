"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;

    navigator.serviceWorker.register("/sw.js").then((registration) => {
      // Request notification permission after SW is registered
      if ("Notification" in window && Notification.permission === "default") {
        // Delay slightly so the user has settled into the app
        setTimeout(() => Notification.requestPermission(), 3000);
      }
      return registration;
    }).catch(() => {
      // App works fine without SW
    });
  }, []);

  return null;
}
