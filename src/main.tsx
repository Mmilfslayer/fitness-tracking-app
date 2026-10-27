import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('SW registered: ', registration.scope);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Every hour

        // Handle update found
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available - show toast
                const event = new CustomEvent('sw-update', { detail: registration });
                window.dispatchEvent(event);
              }
            });
          }
        });
      },
      (registrationError) => {
        console.log('SW registration failed: ', registrationError);
      }
    );
  });

  // Handle controller change (new SW took over)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

// Listen for SW update events
window.addEventListener('sw-update', () => {
  const event = new CustomEvent('show-toast', {
    detail: {
      type: 'info',
      title: 'Update Available',
      message: 'A new version of the app is available. Refresh to update.',
      duration: 0,
      action: {
        label: 'Refresh',
        onClick: () => window.location.reload(),
      },
    },
  });
  window.dispatchEvent(event);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);