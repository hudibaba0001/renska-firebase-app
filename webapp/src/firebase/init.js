// webapp/src/firebase/init.js
console.log("🔧 Using Firebase init.js");

import { initializeApp }   from "firebase/app";
import { getFirestore }    from "firebase/firestore";
import { getAuth }         from "firebase/auth";
import { getAnalytics }    from "firebase/analytics";

// Firebase configuration sourced strictly from environment variables
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Validate required configuration – fail fast in development, warn in production build
const required = ['apiKey', 'authDomain', 'projectId']
const missing = required.filter(k => !firebaseConfig[k])
if (missing.length) {
  if (import.meta.env.DEV) {
    console.warn('⚠️ Missing Firebase env vars in development:', missing, '– using placeholder config');
    Object.assign(firebaseConfig, {
      apiKey: 'dev-placeholder',
      authDomain: 'dev-placeholder.firebaseapp.com',
      projectId: 'dev-placeholder'
    });
  } else {
    console.error('🚨 Missing Firebase config vars:', missing);
    throw new Error(`Missing Firebase environment variables: ${missing.join(', ')}`);
  }
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
