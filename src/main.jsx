import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Google Contacts sign-in popup lands back here: save the token and close.
if (location.hash.includes('state=gcon_auth')) {
  const hp = new URLSearchParams(location.hash.slice(1));
  const key = (hp.get('state') || '').split(':')[1] || 'wlg';
  if (hp.get('access_token')) {
    localStorage.setItem('gcon_token_' + key, JSON.stringify({ access_token: hp.get('access_token'), expires_at: Date.now() + (parseInt(hp.get('expires_in') || '3600') - 60) * 1000 }));
  } else if (hp.get('error')) {
    localStorage.setItem('gcon_auth_error', hp.get('error'));
  }
  history.replaceState(null, '', '/');
  try { window.close(); } catch (e) {}
  document.body.innerHTML = '<div style="font-family:Segoe UI,sans-serif;padding:40px 24px;text-align:center;font-size:17px">Signed in to Google.<br><br>You can close this tab and go back to the job.</div>';
  throw new Error('gcon popup done');
}

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
