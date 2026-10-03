// أولاً: استعادة/حفظ بيانات المدرسة على القرص (نسخة ويندوز) قبل أي وحدة تقرأ التخزين
import './services/storage/desktopPersistenceBoot';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// خطوط عربية مضمّنة في البرنامج (تعمل بدون إنترنت — لا اعتماد على Google Fonts)
import '@fontsource-variable/cairo/wght.css';
import '@fontsource/tajawal/400.css';
import '@fontsource/tajawal/500.css';
import '@fontsource/tajawal/700.css';
import '@fontsource/tajawal/800.css';
import './styles/index.css';
import { registerServiceWorker } from './registerServiceWorker';
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
