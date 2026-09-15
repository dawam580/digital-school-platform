/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * إعداد وتهيئة محرك Firebase السحابي المستقل (Isolated Firebase Service)
 * ============================================================================
 * تنبيه معماري حاسم:
 * هذا المشروع مخصص حصرياً للمدارس ومربوط بمشروع (madrasa-license-2026).
 * تم عزل هذا المشروع عزلًا تاماً عن أي مشروع آخر (مثل مشروع دوائي dawa-ba057)،
 * لضمان عدم حدوث أي تداخل في قواعد البيانات أو الأتمتة أو الصلاحيات.
 * ============================================================================
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore 
} from 'firebase/firestore';

// Dedicated School Platform Firebase Credentials (Zero overlap with dawa-ba057)
export const SCHOOL_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDSR-Wu-95GoJ_Y63gHGy4IWpbtMvqCNYk",
  authDomain: "madrasa-license-2026.firebaseapp.com",
  projectId: "madrasa-license-2026",
  storageBucket: "madrasa-license-2026.firebasestorage.app",
  messagingSenderId: "819978504512",
  appId: "1:819978504512:web:540db9d20a7697166a12a5"
};

// Singleton App Instance
const app = getApps().length > 0 ? getApp() : initializeApp(SCHOOL_FIREBASE_CONFIG);

// Real Authentication Instance
export const auth = getAuth(app);

// Offline-First Firestore Instance with IndexedDB Multi-Tab Persistence
// تعمل بكفاءة تامة حتى عند انقطاع الإنترنت والكهرباء وتتزامن تلقائياً عند العودة
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (e) {
  // If already initialized (e.g. HMR or hot reload)
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;
export default app;
