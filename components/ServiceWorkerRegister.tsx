"use client";

import Script from "next/script";

/**
 * Client-only service worker registration to keep app/layout as a server component.
 */
export default function ServiceWorkerRegister() {
  return (
    <Script id="sw-register" strategy="afterInteractive">
      {`
        if ('serviceWorker' in navigator) {
          window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(
              (registration) => {
                console.log('ServiceWorker registered:', registration.scope);
              },
              (error) => {
                console.error('ServiceWorker registration failed:', error);
              }
            );
          });
        }
      `}
    </Script>
  );
}
