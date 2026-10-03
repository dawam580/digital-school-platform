import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/cairo/wght.css';
import '../styles/index.css';
import { ParentApp } from './ParentApp';

if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ParentApp />
  </React.StrictMode>
);
