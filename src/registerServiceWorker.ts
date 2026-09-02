/**
 * PWA Service Worker Registration (Self-Healing)
 */
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      try {
        const swUrl = new URL('sw.js', window.location.href).href;
        navigator.serviceWorker.register(swUrl)
          .then((reg) => {
            reg.update().catch(() => {});
          })
          .catch(() => {});
      } catch {}
    });
  }
}
