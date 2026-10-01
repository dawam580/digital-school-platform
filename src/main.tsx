// أولاً: استعادة/حفظ بيانات المدرسة على القرص (نسخة ويندوز) قبل أي وحدة تقرأ التخزين
import './services/storage/desktopPersistenceBoot';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { registerServiceWorker } from './registerServiceWorker';
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
