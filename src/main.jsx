import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { loadAndApplyTheme } from '@/lib/themeManager'

// Apply tema yang dipilih admin seawal mungkin
loadAndApplyTheme();

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const hasStack = reason && typeof reason === 'object' && typeof reason.stack === 'string';

  if (!hasStack) {
    console.warn('Unhandled promise rejection:', reason);
    event.preventDefault();
  }
}, true);

const shouldRegisterServiceWorker = 'serviceWorker' in navigator &&
  !window.location.hostname.includes('preview-sandbox') &&
  !window.location.hostname.includes('localhost');

if ('serviceWorker' in navigator && !shouldRegisterServiceWorker) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

if (shouldRegisterServiceWorker) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.update();
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }).catch((error) => {
      console.warn('Service worker registration failed:', error);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)