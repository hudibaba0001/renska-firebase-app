// webapp/src/firebase/init.js
console.log("🔧 Using Firebase init.js");

import { initializeApp }   from "firebase/app";
import { getFirestore }    from "firebase/firestore";
import { getAuth }         from "firebase/auth";
import { getAnalytics }    from "firebase/analytics";

// Fallback values to ensure app works even if env vars are not injected
const FALLBACK_CONFIG = {
  apiKey: "AIzaSyBTrOmWHj0iQH2mkcNjUrD0IVKVnioHYbs",
  authDomain: "swed-de2a3.firebaseapp.com",
  projectId: "swed-de2a3",
  storageBucket: "swed-de2a3.firebasestorage.app",
  messagingSenderId: "647686291389",
  appId: "1:647686291389:web:2306e61c2b196be2e51cd4",
  measurementId: "G-QQCGCERGV3",
}

// Firebase configuration from environment variables with fallback
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY        || FALLBACK_CONFIG.apiKey,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN    || FALLBACK_CONFIG.authDomain,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID     || FALLBACK_CONFIG.projectId,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || FALLBACK_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || FALLBACK_CONFIG.messagingSenderId,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID         || FALLBACK_CONFIG.appId,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || FALLBACK_CONFIG.measurementId,
}

console.log("🔧 firebaseConfig:", firebaseConfig);

const app = initializeApp(firebaseConfig);

try {
  getAnalytics(app);
} catch (e) {
  console.warn("Analytics not supported:", e);
}

// Export Firestore and Auth for use in your pages
export const db   = getFirestore(app);
export const auth = getAuth(app);
