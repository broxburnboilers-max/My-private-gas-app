import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Register the service worker (used for "Share contact -> Gas App")
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
}

// Pick up a contact shared from the phone's Contacts app
;(async () => {
  try {
    if (!('caches' in window)) return;
    const cache = await caches.open('shared-contact');
    const res = await cache.match('/__shared-contact');
    if (!res) return;
    const data = await res.json();
    await cache.delete('/__shared-contact');
    if (data && data.text && data.text.trim()) {
      localStorage.setItem('pendingSharedContact', JSON.stringify(data));
      window.dispatchEvent(new Event('shared-contact'));
    }
  } catch (e) {}
  if (location.search.includes('shared-contact')) history.replaceState(null, '', '/');
})();

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App))
